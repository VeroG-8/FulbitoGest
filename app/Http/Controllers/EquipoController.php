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

        // El profesor solamente puede consultar equipos
        // de las categorías que tiene asignadas.
        if ($usuario->rol === 'profesor') {
            $consulta->whereHas('categoria.profesores', function ($query) use ($usuario) {
                $query->where('profesores.id', $usuario->profesor_id);
            });
        }

        // El tutor no puede acceder al módulo de equipos.
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
                            $categoria->where('nombre', 'like', "%{$buscar}%");
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
        'categorias' => Categoria::orderBy('nombre')->get(['id', 'nombre']),
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
            ],
            'estado' => [
                'required',
                'boolean',
            ],
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

        // El profesor solo puede consultar equipos
        // de las categorías que tiene asignadas.
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

        // El tutor no tiene acceso al módulo de equipos.
        if ($usuario->rol === 'tutor') {
            abort(403, 'No tienes permiso para consultar equipos.');
        }

        $equipo->load(['club', 'categoria']);

        return Inertia::render('Equipos/Show', [
            'equipo' => $equipo,
        ]);
    }

    /**
     * Mostrar el formulario de edición.
     */
   /**
 * Mostrar el formulario para editar un equipo.
 */
    public function edit(Equipo $equipo)
    {
        return Inertia::render('Equipos/Edit', [
            'equipo' => $equipo,
            'clubes' => Club::orderBy('nombre')
                ->get(['id', 'nombre']),
            'categorias' => Categoria::orderBy('nombre')
                ->get(['id', 'nombre']),
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
            ],
            'estado' => [
                'required',
                'boolean',
            ],
        ]);

        $equipo->update($datos);

        return redirect()
            ->route('equipos.index')
            ->with('success', 'El equipo se actualizó correctamente.');
    }

    /**
     * Eliminar un equipo.
     */
    /**
 * Eliminar un equipo.
 */
    public function destroy(Equipo $equipo)
    {
        // Verificar si tiene partidos como local o visitante
        $tienePartidos = DB::table('partidos')
            ->where('equipo_local_id', $equipo->id)
            ->orWhere('equipo_visitante_id', $equipo->id)
            ->exists();

        // Impedir la eliminación si tiene partidos registrados
        if ($tienePartidos) {
            return redirect()
                ->route('equipos.index')
                ->with(
                    'error',
                    'No se puede eliminar el equipo porque tiene partidos registrados.'
                );
        }

        // Eliminar el equipo
        $equipo->delete();

        return redirect()
            ->route('equipos.index')
            ->with(
                'success',
                'El equipo se eliminó correctamente.'
            );
    }
}