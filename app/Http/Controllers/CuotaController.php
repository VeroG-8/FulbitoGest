<?php

namespace App\Http\Controllers;

use App\Models\Cuota;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
            'nombre' => 'required|string|max:150',
            'descripcion' => 'nullable|string|max:255',

            'tipo' => 'required|in:cuota_mensual,inscripcion_escuelita,inscripcion_torneo',

            'monto' => 'required|numeric|min:0',

            'periodo_mes' => 'required_if:tipo,cuota_mensual|nullable|integer|between:1,12',

            'periodo_anio' => 'required|integer|min:2020|max:2100',

            'fecha_vencimiento' => 'required|date',
        ]);

        // Las inscripciones no corresponden a un mes específico.
        if ($validated['tipo'] !== 'cuota_mensual') {
            $validated['periodo_mes'] = null;
        }

        Cuota::create([
            ...$validated,
            'estado' => true,
        ]);

        return redirect()
            ->route('cuotas.index')
            ->with('success', 'Concepto de cobro creado correctamente.');
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
            'nombre' => 'required|string|max:150',
            'descripcion' => 'nullable|string|max:255',

            'tipo' => 'required|in:cuota_mensual,inscripcion_escuelita,inscripcion_torneo',

            'monto' => 'required|numeric|min:0',

            'periodo_mes' => 'required_if:tipo,cuota_mensual|nullable|integer|between:1,12',

            'periodo_anio' => 'required|integer|min:2020|max:2100',

            'fecha_vencimiento' => 'required|date',
        ]);

        if ($validated['tipo'] !== 'cuota_mensual') {
            $validated['periodo_mes'] = null;
        }

        $cuota->update($validated);

        return redirect()
            ->route('cuotas.index')
            ->with('success', 'Concepto de cobro actualizado correctamente.');
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