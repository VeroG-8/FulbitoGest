<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use App\Models\Torneo;
use App\Models\Categoria;
use Illuminate\Support\Facades\DB;


class TorneoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    /**
     * Mostrar el listado de torneos.
     */
    public function index(Request $request)
    {
        $buscar = trim($request->input('buscar', ''));

        $torneos = Torneo::with('categorias')
            ->when($buscar, function ($query) use ($buscar) {
                $query->where(function ($q) use ($buscar) {
                    $q->where('nombre', 'like', "%{$buscar}%")
                        ->orWhere('organizador', 'like', "%{$buscar}%")
                        ->orWhere('lugar', 'like', "%{$buscar}%");
                });
            })
            ->orderBy('fecha_inicio', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Torneos/Index', [
            'torneos' => $torneos,
            'filtros' => [
                'buscar' => $buscar,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    /**
     * Mostrar el formulario para crear un torneo.
     */
    public function create()
    {
        $categorias = Categoria::orderBy('nombre')->get();

        return Inertia::render('Torneos/Create', [
            'categorias' => $categorias,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
   /**
     * Guardar un nuevo torneo.
     */
    public function store(Request $request)
    {
        // Validar los datos recibidos
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:150'],
            'tipo' => ['required', Rule::in(['propio', 'externo'])],
            'monto_inscripcion' => ['required', 'numeric', 'min:0'],
            'organizador' => ['nullable', 'string', 'max:150'],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin' => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
            'lugar' => ['nullable', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string'],
            'estado' => ['required', 'boolean'],
            

            // Categorías participantes
            'categorias' => ['nullable', 'array'],
            'categorias.*' => ['integer', 'distinct', 'exists:categorias,id'],
        ]);

        // Separar las categorías de los datos del torneo
        $categorias = $validated['categorias'] ?? [];

        unset($validated['categorias']);

       DB::transaction(function () use ($validated, $categorias) {

            // Crear el torneo
            $torneo = Torneo::create($validated);

            // Asociar las categorías
            $torneo->categorias()->sync($categorias);

        });

        return redirect()
            ->route('torneos.index')
            ->with('success', 'El torneo se registró correctamente.');
    }

    /**
     * Display the specified resource.
     */
    /**
     * Mostrar los detalles del torneo
     * y sus equipos inscriptos.
     */
    public function show(Torneo $torneo)
    {
        $torneo->load([
            'categorias',
            'equipos.club',
            'equipos.categoria',
            'jugadores.categoria',
        ]);

        return Inertia::render('Torneos/Show', [
            'torneo' => $torneo,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    /**
     * Mostrar el formulario para editar un torneo.
     */
    public function edit(Torneo $torneo)
    {
        $torneo->load('categorias');

        $categorias = Categoria::orderBy('nombre')->get();

        return Inertia::render('Torneos/Edit', [
            'torneo' => $torneo,
            'categorias' => $categorias,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
   /**
     * Actualizar los datos de un torneo.
     */
    public function update(Request $request, Torneo $torneo)
    {
        // Validar los datos recibidos
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:150'],
            'tipo' => ['required', Rule::in(['propio', 'externo'])],
            'monto_inscripcion' => ['required', 'numeric', 'min:0'],
            'organizador' => ['nullable', 'string', 'max:150'],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin' => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
            'lugar' => ['nullable', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string'],
            'estado' => ['required', 'boolean'],

            // Categorías participantes
            'categorias' => ['nullable', 'array'],
            'categorias.*' => ['integer', 'distinct', 'exists:categorias,id'],
        ]);
        if (
            $torneo->tipo === 'propio' &&
            $validated['tipo'] === 'externo' &&
            (
                $torneo->equipos()->exists() ||
                $torneo->partidos()->exists()
            )
        ) {
            return back()->withErrors([
                'tipo' => 'No se puede cambiar este torneo a externo porque tiene equipos inscriptos o partidos registrados.',
            ])->withInput();
        }


        // Separar las categorías de los datos del torneo
        $categorias = $validated['categorias'] ?? [];

        unset($validated['categorias']);

        // Actualizar el torneo y sus categorías
        // dentro de una transacción
        DB::transaction(function () use ($torneo, $validated, $categorias) {

            // Actualizar información general
            $torneo->update($validated);

            // Actualizar categorías asociadas
            $torneo->categorias()->sync($categorias);

        });

        return redirect()
            ->route('torneos.index')
            ->with('success', 'El torneo se actualizó correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
   /**
     * Eliminar un torneo.
     */
    public function destroy(Torneo $torneo)
    {
        // Verificar si el torneo tiene partidos registrados
        if ($torneo->partidos()->exists()) {
            return redirect()
                ->route('torneos.index')
                ->with(
                    'error',
                    'No se puede eliminar el torneo porque tiene partidos registrados.'
                );
        }

        // Verificar si tiene jugadores inscriptos
        if ($torneo->jugadores()->exists()) {
            return redirect()
                ->route('torneos.index')
                ->with(
                    'error',
                    'No se puede eliminar el torneo porque tiene jugadores inscriptos.'
                );
        }

        // Eliminar las asociaciones con categorías y el torneo
        DB::transaction(function () use ($torneo) {
            $torneo->categorias()->detach();
            $torneo->delete();
        });

        return redirect()
            ->route('torneos.index')
            ->with('success', 'El torneo se eliminó correctamente.');
    }
}
