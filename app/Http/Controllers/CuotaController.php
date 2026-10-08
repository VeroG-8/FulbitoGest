<?php

namespace App\Http\Controllers;

use App\Models\Cuota;
use Inertia\Inertia;
use Illuminate\Http\Request;

class CuotaController extends Controller
{
    public function index()
    {
        $cuotas = Cuota::where('estado', true)
            ->orderBy('fecha_vencimiento', 'desc')
            ->get();

        return Inertia::render('Cuotas/Index', [
            'cuotas' => $cuotas,
        ]);
    }

    public function create()
    {
        return Inertia::render('Cuotas/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:255',
            'monto' => 'required|numeric|min:0',
            'fecha_vencimiento' => 'required|date',
        ]);

        Cuota::create([
            ...$validated,
            'estado' => true,
        ]);

        return redirect()
            ->route('cuotas.index')
            ->with('success', 'Cuota creada correctamente.');
    }

    public function edit(Cuota $cuota)
    {
        return Inertia::render('Cuotas/Edit', [
            'cuota' => $cuota,
        ]);
    }

    public function update(Request $request, Cuota $cuota)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:255',
            'monto' => 'required|numeric|min:0',
            'fecha_vencimiento' => 'required|date',
        ]);

        $cuota->update($validated);

        return redirect()
            ->route('cuotas.index')
            ->with('success', 'Cuota actualizada correctamente.');
    }

    public function destroy(Cuota $cuota)
    {
        $cuota->update([
            'estado' => false,
        ]);

        return redirect()
            ->route('cuotas.index')
            ->with('success', 'Cuota deshabilitada correctamente.');
    }

    public function historial()
    {
        $cuotas = Cuota::where('estado', false)
            ->orderBy('fecha_vencimiento', 'desc')
            ->get();

        return Inertia::render('Cuotas/Historial', [
            'cuotas' => $cuotas,
        ]);
    }

    public function reactivar(Cuota $cuota)
    {
        $cuota->update([
            'estado' => true,
        ]);

        return redirect()
            ->route('cuotas.historial')
            ->with('success', 'Cuota reactivada correctamente.');
    }
}