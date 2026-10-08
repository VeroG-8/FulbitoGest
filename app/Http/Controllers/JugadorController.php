<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Categoria;
use App\Models\Jugador;



class JugadorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $jugadores = Jugador::with('categoria')
            ->where('estado', true)
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Jugadores/Index', [
            'jugadores' => $jugadores,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categorias = Categoria::where('estado', true)
            ->orderBy('anio', 'desc')
            ->get();

        return Inertia::render('Jugadores/Create', [
            'categorias' => $categorias,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'dni' => 'required|string|max:20|unique:jugadores,dni',
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'nacionalidad' => 'nullable|string|max:100',
            'fecha_nacimiento' => 'required|date',
            'telefono' => 'nullable|string|max:30',
            'direccion' => 'nullable|string|max:255',
            'localidad' => 'nullable|string|max:100',
            'categoria_id' => 'required|exists:categorias,id',
        ]);

        Jugador::create([
            ...$validated,
            'estado' => true,
        ]);

        return redirect()
            ->route('jugadores.index')
            ->with('success', 'Jugador creado correctamente.');
    }

    public function edit(Jugador $jugador)
    {
        $categorias = Categoria::where('estado', true)
            ->orderBy('anio', 'desc')
            ->get();
        $jugador->fecha_nacimiento = $jugador->fecha_nacimiento?->format('Y-m-d');    

        return Inertia::render('Jugadores/Edit', [
            'jugador' => $jugador,
            'categorias' => $categorias,
        ]);
    }
    
    public function update(Request $request, Jugador $jugador)
    {
        $validated = $request->validate([
            'dni' => 'required|string|max:20|unique:jugadores,dni,' . $jugador->id,
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'nacionalidad' => 'nullable|string|max:100',
            'fecha_nacimiento' => 'required|date',
            'telefono' => 'nullable|string|max:30',
            'direccion' => 'nullable|string|max:255',
            'localidad' => 'nullable|string|max:100',
            'categoria_id' => 'required|exists:categorias,id',
        ]);

        $jugador->update($validated);

        return redirect()
            ->route('jugadores.index')
            ->with('success', 'Jugador actualizado correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Jugador $jugador)
    {
        $jugador->load([
            'categoria',
            'tutores',
            'carnets',
            'torneos',
            'viajes',
            'pases',
        ]);

        return Inertia::render('Jugadores/Show', [
            'jugador' => $jugador,
        ]);
    }

     /**
     * Remove the specified resource from storage.
     */
    public function destroy(Jugador $jugador)
    {
        $jugador->update([
            'estado' => false,
        ]);

        return redirect()
            ->route('jugadores.index')
            ->with('success', 'Jugador deshabilitado correctamente.');
    }

    public function historial()
    {
        $jugadores = Jugador::with('categoria')
            ->where('estado', false)
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Jugadores/Historial', [
            'jugadores' => $jugadores,
        ]);
    }

    public function reactivar(Jugador $jugador)
    {
        $jugador->update([
            'estado' => true,
        ]);

        return redirect()
            ->route('jugadores.historial')
            ->with('success', 'Jugador reactivado correctamente.');
    }

}
