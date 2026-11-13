<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CategoriaController extends Controller
{
    /**
     * Obtener las categorías visibles según el rol del usuario.
     */
    private function categoriasVisiblesQuery(User $usuario): Builder
    {
        $consulta = Categoria::query();

        // Administradores y superadministradores pueden consultar todas.
        if (in_array($usuario->rol, ['admin', 'superadmin'])) {
            return $consulta;
        }

        // Profesor: solamente sus categorías asignadas.
        if ($usuario->rol === 'profesor') {

            abort_unless(
                $usuario->profesor_id,
                403,
                'El usuario no tiene un profesor asociado.'
            );

            return $consulta->whereHas('profesores', function ($query) use ($usuario) {
                $query->where('profesores.id', $usuario->profesor_id);
            });
        }

        // Tutor: categorías de sus jugadores activos.
        if ($usuario->rol === 'tutor') {

            abort_unless(
                $usuario->tutor_id,
                403,
                'El usuario no tiene un tutor asociado.'
            );

            return $consulta->whereHas('jugadores', function ($query) use ($usuario) {
                $query->where('jugadores.estado', true)
                    ->whereHas('tutores', function ($tutores) use ($usuario) {
                        $tutores->where('tutores.id', $usuario->tutor_id);
                    });
            });
        }

        abort(403, 'No tienes permiso para consultar categorías.');
    }

    /**
     * Listado de categorías activas.
     */
    public function index(Request $request)
    {
        $usuario = auth()->user();

        $buscar = $request->input('buscar');

        $orden = $request->input('orden', 'anio');

        $direccion = $request->input('direccion', 'asc');

        // Validar ordenamiento.
        $orden = in_array($orden, ['anio'])
            ? $orden
            : 'anio';

        $direccion = in_array($direccion, ['asc', 'desc'])
            ? $direccion
            : 'asc';

        $consulta = $this->categoriasVisiblesQuery($usuario)
            ->where('estado', true)
            ->withCount([
                'jugadores as jugadores_activos_count' => function ($query) {
                    $query->where('estado', true);
                },
                'profesores as profesores_activos_count' => function ($query) {
                    $query->where('profesores.estado', true);
                },
                'equipos as equipos_activos_count' => function ($query) {
                    $query->where('estado', true);
                },
                'horarios as horarios_activos_count' => function ($query) {
                    $query->where('estado', true);
                },
            ]);

        // Búsqueda por año.
        $consulta->when($buscar, function ($query, $buscar) {
            $query->where('anio', 'like', "%{$buscar}%");
        });

        $categorias = $consulta
            ->orderBy($orden, $direccion)
            ->paginate(10)
            ->withQueryString();

        // Total de categorías inactivas visibles.
        $totalInactivas = $this->categoriasVisiblesQuery($usuario)
            ->where('estado', false)
            ->count();

        return Inertia::render('Categorias/Index', [
            'categorias' => $categorias,
            'filtros' => [
                'buscar' => $buscar,
                'orden' => $orden,
                'direccion' => $direccion,
            ],
            'totalInactivas' => $totalInactivas,
            'puedeGestionar' => in_array(
                $usuario->rol,
                ['admin', 'superadmin']
            ),
        ]);
    }

    /**
     * Formulario de creación.
     */
    public function create()
    {
        return Inertia::render('Categorias/Create');
    }

    /**
     * Guardar una categoría.
     */
    public function store(Request $request)
    {
        $datos = $request->validate([
            'anio' => [
                'required',
                'integer',
                'min:1900',
                'max:2100',
                'unique:categorias,anio',
            ],
        ], [
            'anio.required' => 'El año es obligatorio.',
            'anio.integer' => 'El año debe ser un número entero.',
            'anio.min' => 'El año no puede ser anterior a 1900.',
            'anio.max' => 'El año no puede ser posterior a 2100.',
            'anio.unique' => 'Ya existe una categoría registrada para ese año.',
        ]);

        Categoria::create([
            'anio' => $datos['anio'],
            'estado' => true,
        ]);

        return redirect()
            ->route('categorias.index')
            ->with('success', 'Categoría creada correctamente.');
    }

    /**
     * Mostrar una categoría y sus relaciones.
     */
    public function show(Categoria $categoria)
    {
        $usuario = auth()->user();

        // Verificar que el usuario tenga acceso a esta categoría.
        $categoria = $this->categoriasVisiblesQuery($usuario)
            ->whereKey($categoria->id)
            ->where('estado', true)
            ->firstOrFail();

        // Relaciones que se mostrarán en el detalle.
        $relaciones = [
            'jugadores',
            'profesores',
            'equipos.club',
            'horarios.profesor',
            'horarios.cancha',
            'torneos',
        ];

        // Los profesores solamente pueden consultar registros activos.
        if ($usuario->rol === 'profesor') {

            $relaciones = [
                'jugadores' => function ($query) {
                    $query->where('jugadores.estado', true);
                },

                'profesores' => function ($query) {
                    $query->where('profesores.estado', true);
                },

                'equipos' => function ($query) {
                    $query->where('equipos.estado', true);
                },

                'equipos.club',

                'horarios' => function ($query) {
                    $query->where('horarios.estado', true);
                },

                'horarios.profesor',

                'horarios.cancha',

                'torneos' => function ($query) {
                    $query->where('torneos.estado', true);
                },
            ];
        }

        // Cargar las relaciones correspondientes.
        $categoria->load($relaciones);

        return Inertia::render('Categorias/Show', [
            'categoria' => $categoria,
            'puedeGestionar' => in_array(
                $usuario->rol,
                ['admin', 'superadmin']
            ),
        ]);
    }

    /**
     * Formulario de edición.
     */
    public function edit(Categoria $categoria)
    {
        return Inertia::render('Categorias/Edit', [
            'categoria' => $categoria,
        ]);
    }

    /**
     * Actualizar una categoría.
     */
    public function update(Request $request, Categoria $categoria)
    {
        $datos = $request->validate([
            'anio' => [
                'required',
                'integer',
                'min:1900',
                'max:2100',
                Rule::unique('categorias', 'anio')->ignore($categoria->id),
            ],
        ], [
            'anio.required' => 'El año es obligatorio.',
            'anio.integer' => 'El año debe ser un número entero.',
            'anio.min' => 'El año no puede ser anterior a 1900.',
            'anio.max' => 'El año no puede ser posterior a 2100.',
            'anio.unique' => 'Ya existe otra categoría registrada para ese año.',
        ]);

        $categoria->update([
            'anio' => $datos['anio'],
        ]);

        return redirect()
            ->route('categorias.show', $categoria->id)
            ->with('success', 'Categoría actualizada correctamente.');
    }

    /**
     * Historial de categorías inactivas.
     * Exclusivo para administradores y superadministradores.
     */
    public function historial(Request $request)
    {
        $usuario = auth()->user();

        abort_unless(
            in_array($usuario->rol, ['admin', 'superadmin']),
            403,
            'No tienes permiso para consultar el historial de categorías.'
        );

        $buscar = $request->input('buscar');

        $orden = $request->input('orden', 'anio');

        $direccion = $request->input('direccion', 'asc');

        $orden = in_array($orden, ['anio'])
            ? $orden
            : 'anio';

        $direccion = in_array($direccion, ['asc', 'desc'])
            ? $direccion
            : 'asc';

        $categorias = Categoria::query()
            ->where('estado', false)
            ->withCount([
                'jugadores',
                'profesores',
                'equipos',
                'horarios',
            ])
            ->when($buscar, function ($query, $buscar) {
                $query->where('anio', 'like', "%{$buscar}%");
            })
            ->orderBy($orden, $direccion)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Categorias/Historial', [
            'categorias' => $categorias,
            'filtros' => [
                'buscar' => $buscar,
                'orden' => $orden,
                'direccion' => $direccion,
            ],
            'puedeGestionar' => true,
        ]);
    }

    /**
     * Desactivar una categoría.
     */
    public function destroy(Categoria $categoria)
    {
        // No permitir desactivar categorías que tengan jugadores activos.
        if ($categoria->jugadores()->where('estado', true)->exists()) {
            return back()->with(
                'error',
                'No se puede desactivar la categoría porque tiene jugadores activos asociados.'
            );
        }

        // No permitir desactivar categorías con equipos activos.
        if ($categoria->equipos()->where('estado', true)->exists()) {
            return back()->with(
                'error',
                'No se puede desactivar la categoría porque tiene equipos activos asociados.'
            );
        }

        // No permitir desactivar categorías con horarios activos.
        if ($categoria->horarios()->where('estado', true)->exists()) {
            return back()->with(
                'error',
                'No se puede desactivar la categoría porque tiene horarios activos asociados.'
            );
        }

        $categoria->update([
            'estado' => false,
        ]);

        return redirect()
            ->route('categorias.index')
            ->with('success', 'Categoría desactivada correctamente.');
    }

    /**
     * Reactivar una categoría.
     */
    public function reactivar(Categoria $categoria)
    {
        if ($categoria->estado) {
            return back()->with(
                'error',
                'La categoría ya se encuentra activa.'
            );
        }

        $categoria->update([
            'estado' => true,
        ]);

        return redirect()
            ->route('categorias.historial')
            ->with('success', 'Categoría reactivada correctamente.');
    }
}