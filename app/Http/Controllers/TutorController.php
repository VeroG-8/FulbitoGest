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
        $tutores = Tutor::where('estado', true)
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Tutores/Index', [
            'tutores' => $tutores,
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
        
        $tutores = Tutor::where('estado', false)
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