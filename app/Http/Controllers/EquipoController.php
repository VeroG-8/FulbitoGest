<?php

namespace App\Http\Controllers;

use App\Models\Equipo;
use App\Models\Club;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class EquipoController extends Controller
{
    /**
     * Mostrar el listado de equipos.
     */
    public function index(Request $request)
    {
        $usuario = auth()->user();
        $buscar = trim($request->input('buscar', ''));

        $consulta = Equipo::with(['club', 'categoria']);

        if ($usuario->rol === 'profesor') {
            $consulta->whereHas('categoria.profesores', function ($query) use ($usuario) {
                $query->where('profesores.id', $usuario->profesor_id);
            });
        }

        if ($usuario->rol === 'tutor') {
            abort(403, 'No tienes permiso para consultar los equipos.');
        }

        $equipos = $consulta
            ->when($buscar, function ($query, $buscar) {
                $query->where(function ($query) use ($buscar) {
                    $query->where('nombre', 'like', "%{$buscar}%")
                        ->orWhereHas('club', function ($club) use ($buscar) {
                            $club->where('nombre', 'like', "%{$buscar}%");
                        })
                        ->orWhereHas('categoria', function ($categoria) use ($buscar) {
                            $categoria->where('anio', 'like', "%{$buscar}%");
                        });
                });
            })
            ->orderBy('nombre')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Equipos/Index', [
            'equipos' => $equipos,
            'filtros' => [
                'buscar' => $buscar,
            ],
        ]);
    }

    /**
     * Mostrar el formulario para crear un equipo.
     */
    public function create()
    {
        return Inertia::render('Equipos/Create', [
            'clubes' => Club::orderBy('nombre')->get(['id', 'nombre']),
            'categorias' => Categoria::orderBy('anio')->get(['id', 'anio']),
        ]);
    }

    /**
     * Guardar un equipo nuevo.
     */
        public function store(Request $request)
    {
        $datos = $request->validate([
            'club_id' => [
                'required',
                'integer',
                Rule::exists('clubes', 'id'),
            ],
            'categoria_id' => [
                'required',
                'integer',
                Rule::exists('categorias', 'id'),
            ],
            'nombre' => [
                'required',
                'string',
                'max:255',
                Rule::unique('equipos', 'nombre')
                    ->where(function ($query) use ($request) {
                        $query->where('club_id', $request->input('club_id'))
                            ->where('categoria_id', $request->input('categoria_id'));
                    }),
            ],
            'estado' => [
                'required',
                'boolean',
            ],
        ], [
            'club_id.required' => 'Debés seleccionar un club.',
            'club_id.exists' => 'El club seleccionado no existe.',
            'categoria_id.required' => 'Debés seleccionar una categoría.',
            'categoria_id.exists' => 'La categoría seleccionada no existe.',
            'nombre.required' => 'El nombre del equipo es obligatorio.',
            'nombre.unique' => 'Ya existe un equipo con ese nombre para el club y la categoría seleccionados.',
        ]);

        Equipo::create($datos);

        return redirect()
            ->route('equipos.index')
            ->with('success', 'El equipo se creó correctamente.');
    }

    /**
     * Mostrar los detalles de un equipo.
     */
    public function show(Equipo $equipo)
    {
        $usuario = auth()->user();

        if ($usuario->rol === 'profesor') {
            $tieneAcceso = $equipo->categoria()
                ->whereHas('profesores', function ($query) use ($usuario) {
                    $query->where('profesores.id', $usuario->profesor_id);
                })
                ->exists();

            abort_unless(
                $tieneAcceso,
                403,
                'No tienes permiso para consultar este equipo.'
            );
        }

        if ($usuario->rol === 'tutor') {
            abort(403, 'No tienes permiso para consultar equipos.');
        }

        $equipo->load(['club', 'categoria']);

        return Inertia::render('Equipos/Show', [
            'equipo' => $equipo,
        ]);
    }

    /**
     * Mostrar el formulario para editar un equipo.
     */
    public function edit(Equipo $equipo)
    {
        return Inertia::render('Equipos/Edit', [
            'equipo' => $equipo,
            'clubes' => Club::orderBy('nombre')
                ->get(['id', 'nombre']),
            'categorias' => Categoria::orderBy('anio')
                ->get(['id', 'anio']),
        ]);
    }

    /**
     * Actualizar un equipo existente.
     */
    public function update(Request $request, Equipo $equipo)
    {
        $datos = $request->validate([
            'club_id' => [
                'required',
                'integer',
                Rule::exists('clubes', 'id'),
            ],
            'categoria_id' => [
                'required',
                'integer',
                Rule::exists('categorias', 'id'),
            ],
            'nombre' => [
                'required',
                'string',
                'max:255',
                Rule::unique('equipos', 'nombre')
                    ->where(fn ($query) => $query
                        ->where('club_id', $request->input('club_id'))
                        ->where('categoria_id', $request->input('categoria_id')))
                    ->ignore($equipo->id),
            ],
            'estado' => [
                'required',
                'boolean',
            ],
        ], [
            'nombre.unique' => 'Ya existe otro equipo con ese nombre para el club y la categoría seleccionados.',
        ]);

        $equipo->update($datos);

        return redirect()
            ->route('equipos.index')
            ->with('success', 'El equipo se actualizó correctamente.');
    }

    /**
     * Eliminar un equipo.
     */
    public function destroy(Equipo $equipo)
    {
        $tienePartidos = DB::table('partidos')
            ->where('equipo_local_id', $equipo->id)
            ->orWhere('equipo_visitante_id', $equipo->id)
            ->exists();

        if ($tienePartidos) {
            return redirect()
                ->route('equipos.index')
                ->with(
                    'error',
                    'No se puede eliminar el equipo porque tiene partidos registrados.'
                );
        }

        $equipo->delete();

        return redirect()
            ->route('equipos.index')
            ->with(
                'success',
                'El equipo se eliminó correctamente.'
            );
    }
}