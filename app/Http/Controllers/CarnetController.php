<?php

namespace App\Http\Controllers;

use App\Models\Carnet;
use App\Models\Jugador;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CarnetController extends Controller
{
    public function index()
    {
        $carnets = Carnet::with('jugador')
            ->orderBy('fecha_emision', 'desc')
            ->get();

        return Inertia::render('Carnets/Index', [
            'carnets' => $carnets,
        ]);
    }

    public function create()
    {
        $jugadores = Jugador::where('estado', true)
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Carnets/Create', [
            'jugadores' => $jugadores,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'jugador_id' => 'required|exists:jugadores,id',
            'codigo' => 'required|string|max:50|unique:carnets,codigo',
            'fecha_emision' => 'required|date',
            'fecha_vencimiento' => 'required|date|after_or_equal:fecha_emision',
            'estado' => 'required|in:activo,vencido,anulado',
        ]);

        Carnet::create([
            ...$validated,
            'qr_token' => Str::random(40),
        ]);

        return redirect()
            ->route('carnets.index')
            ->with('success', 'Carnet creado correctamente.');
    }

    public function show(Carnet $carnet)
    {
        $carnet->load('jugador');

        return Inertia::render('Carnets/Show', [
            'carnet' => $carnet,
        ]);
    }

    public function edit(Carnet $carnet)
    {
        $jugadores = Jugador::where('estado', true)
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Carnets/Edit', [
            'carnet' => $carnet,
            'jugadores' => $jugadores,
        ]);
    }

    public function update(Request $request, Carnet $carnet)
    {
        $validated = $request->validate([
            'jugador_id' => 'required|exists:jugadores,id',
            'codigo' => 'required|string|max:50|unique:carnets,codigo,' . $carnet->id,
            'fecha_emision' => 'required|date',
            'fecha_vencimiento' => 'required|date|after_or_equal:fecha_emision',
            'estado' => 'required|in:activo,vencido,anulado',
        ]);

        $carnet->update($validated);

        return redirect()
            ->route('carnets.index')
            ->with('success', 'Carnet actualizado correctamente.');
    }

    public function destroy(Carnet $carnet)
    {
        $carnet->update([
            'estado' => 'anulado',
        ]);

        return redirect()
            ->route('carnets.index')
            ->with('success', 'Carnet anulado correctamente.');
    }

    public function consulta(string $qr_token)
    {
        $carnet = Carnet::with([
            'jugador:id,nombre,apellido,categoria_id',
            'jugador.categoria:id,nombre',
        ])
            ->where('qr_token', $qr_token)
            ->firstOrFail();

        return Inertia::render('Carnets/Consulta', [
            'carnet' => $carnet,
        ]);
    }
}