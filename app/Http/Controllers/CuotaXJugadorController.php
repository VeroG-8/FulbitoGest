<?php

namespace App\Http\Controllers;

use App\Models\CuotaXJugador;
use Inertia\Inertia;
use Illuminate\Http\Request;

class CuotaXJugadorController extends Controller
{
    public function index()
    {
        $asignaciones = CuotaXJugador::with([
            'cuota',
            'jugador',
        ])
            ->orderBy('fecha_vencimiento', 'desc')
            ->get();

        return Inertia::render('Cuotas/Asignaciones/Index', [
            'asignaciones' => $asignaciones,
        ]);
    }

    public function create()
    {
        $cuotas = \App\Models\Cuota::where('estado', true)
            ->orderBy('fecha_vencimiento')
            ->get();

        $jugadores = \App\Models\Jugador::where('estado', true)
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Cuotas/Asignaciones/Create', [
            'cuotas' => $cuotas,
            'jugadores' => $jugadores,
        ]);
    }

    public function store(Request $request)
    {
    
        $validated = $request->validate([
            'cuota_id' => 'required|exists:cuotas,id',
            'jugador_id' => 'required|exists:jugadores,id',
            'fecha_asignacion' => 'required|date',
            'fecha_vencimiento' => 'required|date|after_or_equal:fecha_asignacion',
        ]);
     

        $existe = CuotaXJugador::where('cuota_id', $validated['cuota_id'])
            ->where('jugador_id', $validated['jugador_id'])
            ->exists();

        if ($existe) {
            return back()->withErrors([
                'jugador_id' => 'Este jugador ya tiene asignada esta cuota.',
            ]);
        }

        CuotaXJugador::create([
            ...$validated,
            'estado' => 'pendiente',
        ]);
       

        return redirect()
            ->route('cuotas.asignaciones.index')
            ->with('success', 'Cuota asignada correctamente.');
    }
}