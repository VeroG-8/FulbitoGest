<?php

namespace App\Http\Controllers;

use App\Models\Profesor;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ProfesorController extends Controller
{
    public function index()
    {
        $profesores = Profesor::where('estado', true)
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Profesores/Index', [
            'profesores' => $profesores,
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
        $profesores = Profesor::where('estado', false)
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