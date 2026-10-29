<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use App\Models\Torneo;
use App\Models\Jugador;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\Rule;
use App\Models\InscripcionTorneo;
use App\Models\InscripcionTorneoPago;

class InscripcionJugadorController extends Controller
{
    /**
     * Mostrar el formulario para inscribir jugadores
     * en un torneo externo.
     */
    public function create(Torneo $torneo): Response
    {
        // Obtener las categorías habilitadas para el torneo.
        $torneo->load('categorias');

        // Permitir la inscripción individual en ambos tipos de torneo.
        abort_if(
            !in_array($torneo->tipo, ['propio', 'externo'], true),
            403,
            'El tipo de torneo no es válido para inscribir jugadores.'
        );

        // Obtener los IDs de las categorías participantes.
        $categoriasIds = $torneo->categorias->pluck('id');

        // Obtener jugadores activos de esas categorías
        // que todavía no estén inscriptos en este torneo.
        $jugadores = Jugador::with('categoria')
            ->where('estado', true)
            ->whereIn('categoria_id', $categoriasIds)
            ->whereDoesntHave('torneos', function ($query) use ($torneo) {
                $query->where('torneos.id', $torneo->id);
            })
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Torneos/InscribirJugador', [
            'torneo' => $torneo,
            'jugadores' => $jugadores,
        ]);
    }

    /**
     * Registrar un jugador en un torneo externo.
     */
    public function store(Request $request, Torneo $torneo)
    {
        // Permitir la inscripción individual en ambos tipos de torneo.
        abort_if(
            !in_array($torneo->tipo, ['propio', 'externo'], true),
            403,
            'El tipo de torneo no es válido para inscribir jugadores.'
        );

        // Validar los datos recibidos.
        $validated = $request->validate([
            'jugador_id' => [
                'required',
                'integer',
                'exists:jugadores,id',
            ],
        ]);

        // Buscar el jugador.
        $jugador = Jugador::findOrFail($validated['jugador_id']);

        // Verificar que el jugador esté activo.
        if (!$jugador->estado) {
            throw ValidationException::withMessages([
                'jugador_id' => 'El jugador seleccionado no está activo.',
            ]);
        }

        // Obtener la categoría del jugador dentro del torneo.
        $categoriaTorneo = $torneo->categorias()
            ->where('categorias.id', $jugador->categoria_id)
            ->first();

        if (!$categoriaTorneo) {
            throw ValidationException::withMessages([
                'jugador_id' =>
                    'La categoría del jugador no participa en este torneo.',
            ]);
        }

        // Evitar inscripciones duplicadas.
        if (
            $torneo->jugadores()
                ->where('jugadores.id', $jugador->id)
                ->exists()
        ) {
            throw ValidationException::withMessages([
                'jugador_id' =>
                    'Este jugador ya está inscripto en el torneo.',
            ]);
        }

        // Obtener el importe individual definido para esa categoría.
        $montoPorJugador = (float) $categoriaTorneo->pivot->monto_por_jugador;

        if ($montoPorJugador <= 0) {
            throw ValidationException::withMessages([
                'jugador_id' =>
                    'La categoría no tiene definido un importe válido por jugador.',
            ]);
        }

        // Registrar la inscripción con el importe individual.
        $torneo->jugadores()->attach($jugador->id, [
            'fecha_inscripcion' => now()->toDateString(),
            'monto_inscripcion' => $montoPorJugador,
            'estado' => 'pendiente',
        ]);

        return redirect()
            ->route('torneos.inscripciones-jugadores.create', $torneo)
            ->with('success', 'El jugador fue inscripto correctamente.');
    }

    /**
     * Actualizar el estado de inscripción de un jugador.
     */
    public function update(
        Request $request,
        Torneo $torneo,
        Jugador $jugador
    ) {
        abort_if(
            !in_array($torneo->tipo, ['propio', 'externo'], true),
            403,
            'El tipo de torneo no es válido para actualizar inscripciones.'
        );

        $validated = $request->validate([
            'estado' => [
                'required',
                Rule::in(['pendiente', 'inscripto', 'cancelado']),
            ],
        ]);

        $inscripcion = InscripcionTorneo::query()
            ->where('torneo_id', $torneo->id)
            ->where('jugador_id', $jugador->id)
            ->firstOrFail();

        // La cancelación administrativa se mantiene independiente del pago.
        if ($validated['estado'] === 'cancelado') {
            $inscripcion->update([
                'estado' => 'cancelado',
            ]);
        } else {
            // Solo se permite asignar pendiente o inscripto según los pagos.
            $totalPagado = InscripcionTorneoPago::query()
                ->where('inscripcion_torneo_id', $inscripcion->id)
                ->where('estado', 'confirmado')
                ->sum('monto');

            $saldoPendiente = round(
                (float) $inscripcion->monto_inscripcion
                - (float) $totalPagado,
                2
            );

            $estadoCalculado = $saldoPendiente <= 0
                ? 'inscripto'
                : 'pendiente';

            $inscripcion->update([
                'estado' => $estadoCalculado,
            ]);
        }

        return redirect()
            ->route('torneos.show', $torneo)
            ->with(
                'success',
                'El estado de la inscripción se actualizó correctamente.'
            );
    }
}