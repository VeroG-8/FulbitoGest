<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use App\Models\Horario;
use App\Models\Profesor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ProfesorController extends Controller
{
    public function index(Request $request)
    {
        $usuario = auth()->user();

        $consultaBase = Profesor::query();

        // El profesor solamente puede consultar su propia ficha.
        if ($usuario->rol === 'profesor') {
            $consultaBase->where('id', $usuario->profesor_id);
        }

        // El tutor no puede consultar el listado.
        if ($usuario->rol === 'tutor') {
            abort(403, 'No tienes permiso para consultar el listado de profesores.');
        }

        $totalInactivos = (clone $consultaBase)
            ->where('estado', false)
            ->count();

        $especialidades = (clone $consultaBase)
            ->whereNotNull('especialidad')
            ->where('especialidad', '!=', '')
            ->distinct()
            ->orderBy('especialidad')
            ->pluck('especialidad');

        $consulta = (clone $consultaBase)
            ->where('estado', true);

        // Búsqueda.
        if ($request->filled('buscar')) {
            $buscar = $request->buscar;

            $consulta->where(function ($query) use ($buscar) {
                $query->where('dni', 'like', "%{$buscar}%")
                    ->orWhere('nombre', 'like', "%{$buscar}%")
                    ->orWhere('apellido', 'like', "%{$buscar}%");
            });
        }

        // Filtro por especialidad.
        if ($request->filled('especialidad')) {
            $consulta->where('especialidad', $request->especialidad);
        }

        // Validar ordenamiento.
        $orden = $request->input('orden', 'apellido');
        $direccion = $request->input('direccion', 'asc');

        if (!in_array($orden, ['apellido', 'dni'], true)) {
            $orden = 'apellido';
        }

        if (!in_array($direccion, ['asc', 'desc'], true)) {
            $direccion = 'asc';
        }

        if ($orden === 'dni') {
            $consulta->orderBy('dni', $direccion)
                ->orderBy('apellido')
                ->orderBy('nombre');
        } else {
            $consulta->orderBy('apellido', $direccion)
                ->orderBy('nombre', $direccion);
        }

        $profesores = $consulta
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Profesores/Index', [
            'profesores' => $profesores,
            'especialidades' => $especialidades,
            'totalInactivos' => $totalInactivos,
            'filtros' => [
                'buscar' => $request->buscar ?? '',
                'especialidad' => $request->especialidad ?? '',
                'orden' => $orden,
                'direccion' => $direccion,
            ],
        ]);
    }

    /**
     * Formulario para crear un profesor.
     */
    public function create()
    {
        $categorias = Categoria::query()
            ->where('estado', true)
            ->whereDoesntHave('profesores')
            ->orderBy('anio')
            ->get(['id', 'anio']);

        return Inertia::render('Profesores/Create', [
            'categorias' => $categorias,
        ]);
    }

    /**
     * Registrar un profesor y asignarle categorías.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'dni' => 'required|string|max:20|unique:profesores,dni',
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'email' => 'nullable|email|max:150',
            'telefono' => 'nullable|string|max:30',
            'direccion' => 'nullable|string|max:150',
            'localidad' => 'nullable|string|max:100',
            'especialidad' => 'nullable|string|max:150',

            'categoria_ids' => 'nullable|array',
            'categoria_ids.*' => [
                'integer',
                'distinct',
                Rule::exists('categorias', 'id'),
            ],
        ]);

        $categoriaIds = $validated['categoria_ids'] ?? [];

        // Verificar que ninguna categoría esté asignada a otro profesor.
        $this->validarCategoriasDisponibles($categoriaIds);

        unset($validated['categoria_ids']);

        DB::transaction(function () use ($validated, $categoriaIds) {

            $profesor = Profesor::create([
                ...$validated,
                'estado' => true,
            ]);

            // Asignar las categorías seleccionadas.
            $profesor->categorias()->sync($categoriaIds);

            // Asociar los horarios existentes de esas categorías.
            if (!empty($categoriaIds)) {
                Horario::whereIn('categoria_id', $categoriaIds)
                    ->update([
                        'profesor_id' => $profesor->id,
                    ]);
            }
        });

        return redirect()
            ->route('profesores.index')
            ->with('success', 'Profesor creado correctamente.');
    }

    /**
     * Mostrar la ficha de un profesor.
     */
    public function show(Profesor $profesor)
    {
        $usuario = auth()->user();

        if ($usuario->rol === 'profesor') {
            abort_unless(
                $usuario->profesor_id === $profesor->id,
                403,
                'No tienes permiso para consultar este profesor.'
            );
        }

        if ($usuario->rol === 'tutor') {
            abort(403, 'No tienes permiso para consultar fichas de profesores.');
        }

        $profesor->load('categorias');

        return Inertia::render('Profesores/Show', [
            'profesor' => $profesor,
        ]);
    }

    /**
     * Formulario para editar un profesor.
     */
    public function edit(Profesor $profesor)
    {
        $categorias = Categoria::query()
            ->where(function ($query) use ($profesor) {

                // Categorías disponibles sin profesor.
                $query->where(function ($subquery) {
                    $subquery->where('estado', true)
                        ->whereDoesntHave('profesores');
                });

                // También incluir las categorías del profesor actual.
                $query->orWhereHas('profesores', function ($subquery) use ($profesor) {
                    $subquery->where('profesores.id', $profesor->id);
                });
            })
            ->orderBy('anio')
            ->get(['id', 'anio']);

        return Inertia::render('Profesores/Edit', [
            'profesor' => $profesor,
            'categorias' => $categorias,
            'categoria_ids' => $profesor->categorias()
                ->pluck('categorias.id')
                ->map(fn ($id) => (int) $id)
                ->values(),
        ]);
    }

    /**
     * Actualizar los datos y las categorías de un profesor.
     */
    public function update(Request $request, Profesor $profesor)
    {
        $validated = $request->validate([
            'dni' => [
                'required',
                'string',
                'max:20',
                Rule::unique('profesores', 'dni')->ignore($profesor->id),
            ],
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'email' => 'nullable|email|max:150',
            'telefono' => 'nullable|string|max:30',
            'direccion' => 'nullable|string|max:150',
            'localidad' => 'nullable|string|max:100',
            'especialidad' => 'nullable|string|max:150',

            'categoria_ids' => 'nullable|array',
            'categoria_ids.*' => [
                'integer',
                'distinct',
                Rule::exists('categorias', 'id'),
            ],
        ]);

        $categoriaIds = $validated['categoria_ids'] ?? [];

        // Verificar que ninguna categoría pertenezca a otro profesor.
        $this->validarCategoriasDisponibles(
            $categoriaIds,
            $profesor->id
        );

        unset($validated['categoria_ids']);

        DB::transaction(function () use (
            $profesor,
            $validated,
            $categoriaIds
        ) {

            // Obtener las categorías anteriores.
            $categoriasAnteriores = $profesor->categorias()
                ->pluck('categorias.id')
                ->map(fn ($id) => (int) $id)
                ->all();

            // Actualizar los datos personales.
            $profesor->update($validated);

            // Actualizar las relaciones.
            $profesor->categorias()->sync($categoriaIds);

            // Identificar las categorías que se quitaron.
            $categoriasQuitadas = array_diff(
                $categoriasAnteriores,
                $categoriaIds
            );

            // Dejar sin profesor los horarios de las categorías quitadas.
            if (!empty($categoriasQuitadas)) {
                Horario::whereIn('categoria_id', $categoriasQuitadas)
                    ->where('profesor_id', $profesor->id)
                    ->update([
                        'profesor_id' => null,
                    ]);
            }

            // Asignar el profesor a los horarios de sus categorías actuales.
            if (!empty($categoriaIds)) {
                Horario::whereIn('categoria_id', $categoriaIds)
                    ->update([
                        'profesor_id' => $profesor->id,
                    ]);
            }
        });

        return redirect()
            ->route('profesores.index')
            ->with('success', 'Profesor actualizado correctamente.');
    }

    /**
     * Comprobar que las categorías no estén asignadas a otro profesor.
     */
    private function validarCategoriasDisponibles(
        array $categoriaIds,
        ?int $profesorId = null
    ): void {
        if (empty($categoriaIds)) {
            return;
        }

        $consulta = Categoria::query()
            ->whereIn('id', $categoriaIds)
            ->whereHas('profesores', function ($query) use ($profesorId) {

                if ($profesorId !== null) {
                    $query->where('profesores.id', '!=', $profesorId);
                }
            });

        if ($consulta->exists()) {
            throw ValidationException::withMessages([
                'categoria_ids' => 'Una o más categorías ya están asignadas a otro profesor. Actualizá la selección.',
            ]);
        }
    }

    /**
     * Deshabilitar un profesor.
     */
    public function destroy(Profesor $profesor)
    {
        $profesor->update([
            'estado' => false,
        ]);

        return redirect()
            ->route('profesores.index')
            ->with('success', 'Profesor deshabilitado correctamente.');
    }

    /**
     * Listado de profesores inactivos.
     */
    public function historial()
    {
        $usuario = auth()->user();

        $consulta = Profesor::where('estado', false);

        if ($usuario->rol === 'profesor') {
            $consulta->where('id', $usuario->profesor_id);
        }

        if ($usuario->rol === 'tutor') {
            abort(403, 'No tienes permiso para consultar el historial de profesores.');
        }

        $profesores = $consulta
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Profesores/Historial', [
            'profesores' => $profesores,
        ]);
    }

    /**
     * Reactivar un profesor.
     */
    public function reactivar(Profesor $profesor)
    {
        $profesor->update([
            'estado' => true,
        ]);

        return redirect()
            ->route('profesores.historial')
            ->with('success', 'Profesor reactivado correctamente.');
    }
}