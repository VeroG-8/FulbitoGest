<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use App\Models\Torneo;
use App\Models\Categoria;
use Illuminate\Support\Facades\DB;

class TorneoController extends Controller
{
    /**
     * Verificar si el usuario puede administrar torneos.
     */
    private function autorizarAdministracion(): void
    {
        abort_unless(
            auth()->check() &&
            in_array(auth()->user()->rol, ['admin', 'superadmin'], true),
            403,
            'No tienes permiso para realizar esta acción.'
        );
    }

    /**
     * Verificar si el usuario puede consultar el listado de torneos.
     */
    private function autorizarListado(): void
    {
        abort_unless(
            auth()->check() &&
            in_array(auth()->user()->rol, ['admin', 'superadmin', 'profesor'], true),
            403,
            'No tienes permiso para consultar los torneos.'
        );
    }

    /**
     * Verificar si el usuario puede consultar un torneo específico.
     */
    private function autorizarConsulta(Torneo $torneo): void
    {
        $usuario = auth()->user();

        abort_unless(
            $usuario &&
            in_array($usuario->rol, ['admin', 'superadmin', 'profesor'], true),
            403,
            'No tienes permiso para consultar este torneo.'
        );

        // Los profesores solamente pueden consultar torneos activos.
        if ($usuario->rol === 'profesor') {
            abort_unless(
                $torneo->estado,
                403,
                'No tienes permiso para consultar este torneo.'
            );
        }
    }

    /**
     * Mostrar el listado de torneos.
     */
    public function index(Request $request)
    {
        $this->autorizarListado();

        $usuario = auth()->user();

        $buscar = trim($request->input('buscar', ''));

        $torneos = Torneo::with('categorias')
            // Los profesores solamente ven torneos activos.
            ->when($usuario->rol === 'profesor', function ($query) {
                $query->where('estado', true);
            })
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
     * Mostrar el formulario para crear un torneo.
     */
    public function create()
    {
        $this->autorizarAdministracion();

        $categorias = Categoria::orderBy('anio')->get();

        return Inertia::render('Torneos/Create', [
            'categorias' => $categorias,
        ]);
    }

    /**
     * Guardar un nuevo torneo.
     */
    public function store(Request $request)
    {
        $this->autorizarAdministracion();

        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:150'],
            'tipo' => ['required', Rule::in(['propio', 'externo'])],
            'organizador' => ['nullable', 'string', 'max:150'],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin' => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
            'lugar' => ['nullable', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string'],
            'estado' => ['required', 'boolean'],

            // Categorías participantes.
            'categorias' => ['nullable', 'array'],
            'categorias.*' => ['integer', 'distinct', 'exists:categorias,id'],

            // Importe de inscripción por categoría.
            'montos_categorias' => ['nullable', 'array'],
            'montos_categorias.*' => ['required', 'numeric', 'min:0'],

            // Importe individual por jugador.
            'montos_por_jugador' => ['nullable', 'array'],
            'montos_por_jugador.*' => ['required', 'numeric', 'min:0'],
        ]);

        $categorias = $validated['categorias'] ?? [];
        $montosCategorias = $validated['montos_categorias'] ?? [];
        $montosPorJugador = $validated['montos_por_jugador'] ?? [];

        unset(
            $validated['categorias'],
            $validated['montos_categorias'],
            $validated['montos_por_jugador']
        );

        DB::transaction(function () use (
            $validated,
            $categorias,
            $montosCategorias,
            $montosPorJugador
        ) {
            $torneo = Torneo::create($validated);

            $categoriasConMontos = [];

            foreach ($categorias as $categoriaId) {
                if (!array_key_exists($categoriaId, $montosCategorias)) {
                    throw ValidationException::withMessages([
                        'montos_categorias' =>
                            'Debés indicar el importe de inscripción de cada categoría seleccionada.',
                    ]);
                }

                if (!array_key_exists($categoriaId, $montosPorJugador)) {
                    throw ValidationException::withMessages([
                        'montos_por_jugador' =>
                            'Debés indicar el importe por jugador de cada categoría seleccionada.',
                    ]);
                }

                $categoriasConMontos[$categoriaId] = [
                    'monto_inscripcion' => $montosCategorias[$categoriaId],
                    'monto_por_jugador' => $montosPorJugador[$categoriaId],
                ];
            }

            $torneo->categorias()->sync($categoriasConMontos);
        });

        return redirect()
            ->route('torneos.index')
            ->with('success', 'El torneo se registró correctamente.');
    }

    /**
     * Mostrar los detalles de un torneo,
     * sus equipos y jugadores inscriptos.
     */
    public function show(Torneo $torneo)
    {
        $this->autorizarConsulta($torneo);

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
     * Mostrar el formulario para editar un torneo.
     */
    public function edit(Torneo $torneo)
    {
        $this->autorizarAdministracion();

        $torneo->load('categorias');

        $categorias = Categoria::orderBy('anio')->get();

        return Inertia::render('Torneos/Edit', [
            'torneo' => $torneo,
            'categorias' => $categorias,
        ]);
    }

    /**
     * Actualizar los datos de un torneo.
     */
    public function update(Request $request, Torneo $torneo)
    {
        $this->autorizarAdministracion();

        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:150'],
            'tipo' => ['required', Rule::in(['propio', 'externo'])],
            'organizador' => ['nullable', 'string', 'max:150'],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin' => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
            'lugar' => ['nullable', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string'],
            'estado' => ['required', 'boolean'],

            // Categorías participantes.
            'categorias' => ['nullable', 'array'],
            'categorias.*' => ['integer', 'distinct', 'exists:categorias,id'],

            // Importes de inscripción por categoría.
            'montos_categorias' => ['nullable', 'array'],
            'montos_categorias.*' => ['required', 'numeric', 'min:0'],

            // Importe individual por jugador.
            'montos_por_jugador' => ['nullable', 'array'],
            'montos_por_jugador.*' => ['required', 'numeric', 'min:0'],
        ]);

        // Evitar cambiar el tipo si el torneo ya tiene equipos o partidos.
        if (
            $torneo->tipo === 'propio' &&
            $validated['tipo'] === 'externo' &&
            (
                $torneo->equipos()->exists() ||
                $torneo->partidos()->exists()
            )
        ) {
            return back()
                ->withErrors([
                    'tipo' => 'No se puede cambiar este torneo a externo porque tiene equipos inscriptos o partidos registrados.',
                ])
                ->withInput();
        }

        $categorias = $validated['categorias'] ?? [];
        $montosCategorias = $validated['montos_categorias'] ?? [];
        $montosPorJugador = $validated['montos_por_jugador'] ?? [];

        unset(
            $validated['categorias'],
            $validated['montos_categorias'],
            $validated['montos_por_jugador']
        );

        $categoriasConMontos = [];

        foreach ($categorias as $categoriaId) {
            if (!array_key_exists($categoriaId, $montosCategorias)) {
                return back()
                    ->withErrors([
                        'montos_categorias' =>
                            'Debés indicar el importe de inscripción de cada categoría seleccionada.',
                    ])
                    ->withInput();
            }

            if (!array_key_exists($categoriaId, $montosPorJugador)) {
                return back()
                    ->withErrors([
                        'montos_por_jugador' =>
                            'Debés indicar el importe por jugador de cada categoría seleccionada.',
                    ])
                    ->withInput();
            }

            $categoriasConMontos[$categoriaId] = [
                'monto_inscripcion' => $montosCategorias[$categoriaId],
                'monto_por_jugador' => $montosPorJugador[$categoriaId],
            ];
        }

        DB::transaction(function () use (
            $torneo,
            $validated,
            $categoriasConMontos
        ) {
            $torneo->update($validated);

            $torneo->categorias()->sync($categoriasConMontos);
        });

        return redirect()
            ->route('torneos.index')
            ->with('success', 'El torneo se actualizó correctamente.');
    }

    /**
     * Eliminar un torneo.
     */
    public function destroy(Torneo $torneo)
    {
        $this->autorizarAdministracion();

        // Verificar si el torneo tiene partidos registrados.
        if ($torneo->partidos()->exists()) {
            return redirect()
                ->route('torneos.index')
                ->with(
                    'error',
                    'No se puede eliminar el torneo porque tiene partidos registrados.'
                );
        }

        // Verificar si tiene jugadores inscriptos.
        if ($torneo->jugadores()->exists()) {
            return redirect()
                ->route('torneos.index')
                ->with(
                    'error',
                    'No se puede eliminar el torneo porque tiene jugadores inscriptos.'
                );
        }

        DB::transaction(function () use ($torneo) {
            $torneo->categorias()->detach();
            $torneo->delete();
        });

        return redirect()
            ->route('torneos.index')
            ->with('success', 'El torneo se eliminó correctamente.');
    }

    /**
     * Mostrar las inscripciones a torneos de los jugadores
     * asociados al tutor autenticado.
     */
    public function misInscripciones()
    {
        $usuario = auth()->user();

        abort_unless(
            $usuario &&
            $usuario->rol === 'tutor' &&
            $usuario->tutor_id,
            403,
            'No tienes permiso para consultar estas inscripciones.'
        );

        $tutorId = $usuario->tutor_id;

        $torneos = Torneo::query()
            ->whereHas('jugadores.tutores', function ($query) use ($tutorId) {
                $query->where('tutores.id', $tutorId);
            })
            ->with([
                'jugadores' => function ($query) use ($tutorId) {
                    $query
                        ->whereHas('tutores', function ($q) use ($tutorId) {
                            $q->where('tutores.id', $tutorId);
                        })
                        ->with('categoria:id,anio');
                },
            ])
            ->get();

        $inscripciones = $torneos->flatMap(function ($torneo) {
            return $torneo->jugadores->map(function ($jugador) use ($torneo) {
                return [
                    'id' => $jugador->pivot->id,
                    'torneo' => $torneo->nombre,
                    'torneo_id' => $torneo->id,
                    'jugador' => $jugador->apellido . ', ' . $jugador->nombre,
                    'jugador_id' => $jugador->id,
                    'dni' => $jugador->dni,
                    'categoria' => $jugador->categoria?->anio,
                    'fecha_inscripcion' => $jugador->pivot->fecha_inscripcion,
                    'monto_inscripcion' => $jugador->pivot->monto_inscripcion,
                    'estado' => $jugador->pivot->estado,
                ];
            });
        })->sortByDesc('fecha_inscripcion')->values();

        return Inertia::render('Torneos/MisInscripciones', [
            'inscripciones' => $inscripciones,
        ]);
    }
}