<?php

namespace App\Http\Controllers;

use App\Models\Tutor;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TutorController extends Controller
{
        public function index()
    {
        $usuario = auth()->user();

        // Consulta base de tutores.
        $consulta = Tutor::query();

        // El tutor solamente puede consultar su propia ficha.
        if ($usuario->rol === 'tutor') {
            $consulta->where('id', $usuario->tutor_id);
        }

        // El profesor no tiene acceso al listado de tutores.
        if ($usuario->rol === 'profesor') {
            abort(403, 'No tienes permiso para consultar el listado de tutores.');
        }

        // Estadísticas antes de aplicar el filtro de activos.
        $totalActivos = (clone $consulta)
            ->where('estado', true)
            ->count();

        $totalInactivos = (clone $consulta)
            ->where('estado', false)
            ->count();

        // Listado de tutores activos.
        $tutores = (clone $consulta)
            ->where('estado', true)
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Tutores/Index', [
            'tutores' => $tutores,
            'totalActivos' => $totalActivos,
            'totalInactivos' => $totalInactivos,
        ]);
    }
    public function create()
    {
        return Inertia::render('Tutores/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'dni' => 'required|string|max:20|unique:tutores,dni',
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'email' => 'nullable|email|max:150',
            'telefono' => 'nullable|string|max:30',
            'direccion' => 'nullable|string|max:150',
            'localidad' => 'nullable|string|max:100',
        ]);

        Tutor::create([
            ...$validated,
            'estado' => true,
        ]);

        return redirect()
            ->route('tutores.index')
            ->with('success', 'Tutor creado correctamente.');
    }

        public function show(Tutor $tutor)
    {
        $usuario = auth()->user();

        // El tutor solamente puede consultar su propia ficha.
        if ($usuario->rol === 'tutor') {
            abort_unless(
                $usuario->tutor_id === $tutor->id,
                403,
                'No tienes permiso para consultar este tutor.'
            );
        }

        // El profesor no puede consultar fichas de tutores.
        if ($usuario->rol === 'profesor') {
            abort(403, 'No tienes permiso para consultar fichas de tutores.');
        }

        $tutor->load('jugadores');

        return Inertia::render('Tutores/Show', [
            'tutor' => $tutor,
        ]);
    }
    public function edit(Tutor $tutor)
    {
        return Inertia::render('Tutores/Edit', [
            'tutor' => $tutor,
        ]);
    }

    public function update(Request $request, Tutor $tutor)
    {
        $validated = $request->validate([
            'dni' => 'required|string|max:20|unique:tutores,dni,' . $tutor->id,
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'email' => 'nullable|email|max:150',
            'telefono' => 'nullable|string|max:30',
            'direccion' => 'nullable|string|max:150',
            'localidad' => 'nullable|string|max:100',
        ]);

        $tutor->update($validated);

        return redirect()
            ->route('tutores.index')
            ->with('success', 'Tutor actualizado correctamente.');
    }

    public function destroy(Tutor $tutor)
    {
        $tutor->update([
            'estado' => false,
        ]);

        return redirect()
            ->route('tutores.index')
            ->with('success', 'Tutor deshabilitado correctamente.');
    }

        public function historial()
    {
        $usuario = auth()->user();

        $consulta = Tutor::where('estado', false);

        // El tutor solamente puede consultar su propia ficha.
        if ($usuario->rol === 'tutor') {
            $consulta->where('id', $usuario->tutor_id);
        }

        // El profesor no tiene acceso al historial de tutores.
        if ($usuario->rol === 'profesor') {
            abort(403, 'No tienes permiso para consultar el historial de tutores.');
        }

        $tutores = $consulta
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Tutores/Historial', [
            'tutores' => $tutores,
        ]);
    }

    public function reactivar(Tutor $tutor)
    {
        $tutor->update([
            'estado' => true,
        ]);

        return redirect()
            ->route('tutores.historial')
            ->with('success', 'Tutor reactivado correctamente.');
    }

}