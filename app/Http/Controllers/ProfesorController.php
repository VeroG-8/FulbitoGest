<?php

namespace App\Http\Controllers;

use App\Models\Profesor;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ProfesorController extends Controller
{
      public function index(Request $request)
    {
        $usuario = auth()->user();

        // Consulta base.
        $consultaBase = Profesor::query();

        // El profesor solamente puede consultar su propia ficha.
        if ($usuario->rol === 'profesor') {
            $consultaBase->where('id', $usuario->profesor_id);
        }

        // El tutor no puede consultar el listado de profesores.
        if ($usuario->rol === 'tutor') {
            abort(403, 'No tienes permiso para consultar el listado de profesores.');
        }

        // Total de profesores inactivos.
        $totalInactivos = (clone $consultaBase)
            ->where('estado', false)
            ->count();

        // Especialidades disponibles.
        $especialidades = (clone $consultaBase)
            ->whereNotNull('especialidad')
            ->where('especialidad', '!=', '')
            ->distinct()
            ->orderBy('especialidad')
            ->pluck('especialidad');

        // Consulta de profesores activos.
        $consulta = (clone $consultaBase)
            ->where('estado', true);

        // Búsqueda por DNI, apellido o nombre.
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

        // Aplicar ordenamiento.
        if ($orden === 'dni') {
            $consulta->orderBy('dni', $direccion)
                ->orderBy('apellido')
                ->orderBy('nombre');
        } else {
            $consulta->orderBy('apellido', $direccion)
                ->orderBy('nombre', $direccion);
        }

        // Paginación.
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

    public function create()
    {
        return Inertia::render('Profesores/Create');
    }

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
        ]);

        Profesor::create([
            ...$validated,
            'estado' => true,
        ]);

        return redirect()
            ->route('profesores.index')
            ->with('success', 'Profesor creado correctamente.');
    }

        public function show(Profesor $profesor)
    {
        $usuario = auth()->user();

        // El profesor solamente puede consultar su propia ficha.
        if ($usuario->rol === 'profesor') {
            abort_unless(
                $usuario->profesor_id === $profesor->id,
                403,
                'No tienes permiso para consultar este profesor.'
            );
        }

        // El tutor no puede consultar fichas de profesores.
        if ($usuario->rol === 'tutor') {
            abort(403, 'No tienes permiso para consultar fichas de profesores.');
        }

        $profesor->load('categorias');

        return Inertia::render('Profesores/Show', [
            'profesor' => $profesor,
        ]);
    }

    public function edit(Profesor $profesor)
    {
        return Inertia::render('Profesores/Edit', [
            'profesor' => $profesor,
        ]);
    }

    public function update(Request $request, Profesor $profesor)
    {
        $validated = $request->validate([
            'dni' => 'required|string|max:20|unique:profesores,dni,' . $profesor->id,
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'email' => 'nullable|email|max:150',
            'telefono' => 'nullable|string|max:30',
            'direccion' => 'nullable|string|max:150',
            'localidad' => 'nullable|string|max:100',
            'especialidad' => 'nullable|string|max:150',
        ]);

        $profesor->update($validated);

        return redirect()
            ->route('profesores.index')
            ->with('success', 'Profesor actualizado correctamente.');
    }

    public function destroy(Profesor $profesor)
    {
        $profesor->update([
            'estado' => false,
        ]);

        return redirect()
            ->route('profesores.index')
            ->with('success', 'Profesor deshabilitado correctamente.');
    }

        public function historial()
    {
        $usuario = auth()->user();

        $consulta = Profesor::where('estado', false);

        // El profesor solamente puede consultar su propia ficha.
        if ($usuario->rol === 'profesor') {
            $consulta->where('id', $usuario->profesor_id);
        }

        // El tutor no puede consultar el historial de profesores.
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