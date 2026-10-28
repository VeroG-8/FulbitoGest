<?php

namespace App\Http\Controllers;

use App\Models\Torneo;
use App\Models\Equipo;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class InscripcionEquipoController extends Controller
{
    /**
     * Mostrar los equipos disponibles para inscribir.
     */
    public function create(Torneo $torneo)
    {
         // Verificar que sea un torneo propio
        if ($torneo->tipo !== 'propio') {
            return redirect()
                ->route('torneos.show', $torneo)
                ->with('error', 'Solo se pueden inscribir equipos en torneos propios.');
        }        
        // Cargar las categorías habilitadas en el torneo
        $torneo->load('categorias');

        // Obtener los ID de las categorías permitidas
        $categoriasIds = $torneo->categorias->pluck('id');

        // Obtener los ID de los equipos ya inscriptos
        $equiposInscriptosIds = $torneo->equipos()
            ->pluck('equipos.id');

        // Buscar equipos disponibles
        $equiposDisponibles = Equipo::with(['club', 'categoria'])
            ->whereIn('categoria_id', $categoriasIds)
            ->whereNotIn('id', $equiposInscriptosIds)
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Torneos/InscribirEquipo', [
            'torneo' => $torneo,
            'equiposDisponibles' => $equiposDisponibles,
        ]);
    }

        /**
     * Registrar un equipo en un torneo.
     */
    public function store(Request $request, Torneo $torneo)
    {
        if ($torneo->tipo !== 'propio') {
            return redirect()
                ->route('torneos.show', $torneo)
                ->with('error', 'No se pueden inscribir equipos en torneos externos.');
        }
        // 1. Validar que el equipo exista
        $validated = $request->validate([
            'equipo_id' => ['required', 'integer', 'exists:equipos,id'],
        ]);

        // 2. Recuperar el equipo
        $equipo = Equipo::findOrFail($validated['equipo_id']);

        // 3. Verificar que el equipo pertenezca a una categoría
        // habilitada en el torneo
        $categoriaHabilitada = $torneo->categorias()
            ->where('categorias.id', $equipo->categoria_id)
            ->exists();

        if (!$categoriaHabilitada) {
            throw ValidationException::withMessages([
                'equipo_id' => 'La categoría de este equipo no está habilitada en el torneo.',
            ]);
        }

        // 4. Verificar que el equipo no esté inscripto
        $yaInscripto = $torneo->equipos()
            ->where('equipos.id', $equipo->id)
            ->exists();

        if ($yaInscripto) {
            throw ValidationException::withMessages([
                'equipo_id' => 'Este equipo ya está inscripto en el torneo.',
            ]);
        }

        // 5. Registrar la inscripción
        $torneo->equipos()->attach($equipo->id, [
            'fecha_inscripcion' => now()->toDateString(),
            'estado' => true,
        ]);

        // 6. Redirigir con mensaje de éxito
        return redirect()
            ->route('torneos.show', $torneo)
            ->with('success', 'El equipo se inscribió correctamente en el torneo.');
    }
}