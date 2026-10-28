<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use App\Models\Torneo;
use App\Models\Jugador;
use Inertia\Inertia;
use Inertia\Response;
class InscripcionJugadorController extends Controller
{
    /**
     * Mostrar el formulario para inscribir jugadores
     * en un torneo externo.
     */
    public function create(Torneo $torneo): Response
    {
        // Obtener las categorías habilitadas para el torneo
        $torneo->load('categorias');

        // Verificar que el torneo sea externo
        abort_if(
            $torneo->tipo !== 'externo',
            403,
            'Solo se pueden inscribir jugadores en torneos externos.'
        );

        // Obtener los IDs de las categorías participantes
        $categoriasIds = $torneo->categorias->pluck('id');

        // Obtener jugadores activos de esas categorías
        // que todavía no estén inscriptos en este torneo
        $jugadores = Jugador::with('categoria')
            ->where('estado', true)
            ->whereIn('categoria_id', $categoriasIds)
            ->whereDoesntHave('torneos', function ($query) use ($torneo) {
                $query->where('torneos.id', $torneo->id);
            })
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        // Enviar los datos a React mediante Inertia
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
        // Verificar que el torneo sea externo
        abort_if(
            $torneo->tipo !== 'externo',
            403,
            'Solo se pueden inscribir jugadores en torneos externos.'
        );

        // Validar los datos recibidos
        $validated = $request->validate([
            'jugador_id' => ['required', 'integer', 'exists:jugadores,id'],
        ]);

        // Buscar el jugador
        $jugador = Jugador::findOrFail($validated['jugador_id']);

        // Verificar que el jugador esté activo
        if (!$jugador->estado) {
            throw ValidationException::withMessages([
                'jugador_id' => 'El jugador seleccionado no está activo.',
            ]);
        }

        // Verificar que su categoría participe en el torneo
        if (!$torneo->categorias()
            ->where('categorias.id', $jugador->categoria_id)
            ->exists()) {

            throw ValidationException::withMessages([
                'jugador_id' => 'La categoría del jugador no participa en este torneo.',
            ]);
        }

        // Evitar inscripciones duplicadas
        if ($torneo->jugadores()
            ->where('jugadores.id', $jugador->id)
            ->exists()) {

            throw ValidationException::withMessages([
                'jugador_id' => 'Este jugador ya está inscripto en el torneo.',
            ]);
        }

        // Registrar la inscripción
        $torneo->jugadores()->attach($jugador->id, [
            'fecha_inscripcion' => now()->toDateString(),
            'estado' => 'inscripto',
        ]);

        return redirect()
            ->route('torneos.inscripciones-jugadores.create', $torneo)
            ->with('success', 'El jugador fue inscripto correctamente.');
    }
}
