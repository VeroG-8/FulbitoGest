<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Horario;
use Inertia\Inertia;

class HorarioController extends Controller
{
    public function index()
    {
        $horarios = Horario::with('categoria')
            ->where('estado', true)
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get();

        return Inertia::render('Horarios/Index', [
            'horarios' => $horarios,
        ]);
    }

    public function create()
    {
        $categorias = \App\Models\Categoria::where('estado', true)
            ->orderBy('anio')
            ->get();

        return Inertia::render('Horarios/Create', [
            'categorias' => $categorias,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'categoria_id' => 'required|exists:categorias,id',
            'dia_semana' => 'required|string|max:20',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'lugar' => 'nullable|string|max:150',
        ]);

        Horario::create([
            ...$validated,
            'estado' => true,
        ]);

        return redirect()
            ->route('horarios.index')
            ->with('success', 'Horario creado correctamente.');
    }

    public function show(Horario $horario)
    {
        $horario->load('categoria');

        return Inertia::render('Horarios/Show', [
            'horario' => $horario,
        ]);
    }

    public function edit(Horario $horario)
    {
        $categorias = \App\Models\Categoria::where('estado', true)
            ->orderBy('anio')
            ->get();

        return Inertia::render('Horarios/Edit', [
            'horario' => $horario,
            'categorias' => $categorias,
        ]);
    }

    public function update(Request $request, Horario $horario)
    {
        $validated = $request->validate([
            'categoria_id' => 'required|exists:categorias,id',
            'dia_semana' => 'required|string|max:20',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'lugar' => 'nullable|string|max:150',
        ]);

        $horario->update($validated);

        return redirect()
            ->route('horarios.index')
            ->with('success', 'Horario actualizado correctamente.');
    }
    public function destroy(Horario $horario)
    {
        $horario->update([
            'estado' => false,
        ]);

        return redirect()
            ->route('horarios.index')
            ->with('success', 'Horario deshabilitado correctamente.');
    }

    public function historial()
    {
        $horarios = Horario::with('categoria')
            ->where('estado', false)
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get();

        return Inertia::render('Horarios/Historial', [
            'horarios' => $horarios,
        ]);
    }

    public function reactivar(Horario $horario)
    {
        $horario->update([
            'estado' => true,
        ]);

        return redirect()
            ->route('horarios.historial')
            ->with('success', 'Horario reactivado correctamente.');
    }

}