<?php

namespace App\Http\Controllers;

use App\Models\Club;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ClubController extends Controller
{
    public function index()
    {
        $clubes = Club::where('estado', true)
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Clubes/Index', [
            'clubes' => $clubes,
        ]);
    }

    public function create()
    {
        return Inertia::render('Clubes/Create');
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'localidad' => ['nullable', 'string', 'max:255'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
        ]);

        $datos['estado'] = true;

        Club::create($datos);

        return redirect()
            ->route('clubes.index')
            ->with('success', 'Club registrado correctamente.');
    }

    public function show(Club $club)
    {
        return Inertia::render('Clubes/Show', [
            'club' => $club,
        ]);
    }

    public function edit(Club $club)
    {
        return Inertia::render('Clubes/Edit', [
            'club' => $club,
        ]);
    }

    public function update(Request $request, Club $club)
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'localidad' => ['nullable', 'string', 'max:255'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
        ]);

        $club->update($datos);

        return redirect()
            ->route('clubes.index')
            ->with('success', 'Club actualizado correctamente.');
    }

    public function destroy(Club $club)
    {
        $club->update([
            'estado' => false,
        ]);

        return redirect()
            ->route('clubes.index')
            ->with('success', 'Club desactivado correctamente.');
    }

    public function historial()
{
    $clubes = Club::where('estado', false)
        ->orderBy('nombre')
        ->get();

    return Inertia::render('Clubes/Historial', [
        'clubes' => $clubes,
    ]);
}

public function reactivar(Club $club)
{
    $club->update([
        'estado' => true,
    ]);

    return redirect()
        ->route('clubes.historial')
        ->with('success', 'Club reactivado correctamente.');
}
}