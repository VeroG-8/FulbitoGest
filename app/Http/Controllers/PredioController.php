<?php

namespace App\Http\Controllers;

use App\Models\Predio;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PredioController extends Controller
{
    /**
     * Listado de predios activos.
     */
    public function index(Request $request)
    {
        $buscar = trim((string) $request->input('buscar', ''));

        $orden = $request->input('orden', 'nombre');
        $direccion = $request->input('direccion', 'asc');

        // Evitar columnas no permitidas en el ordenamiento.
        if (!in_array($orden, ['nombre', 'localidad'], true)) {
            $orden = 'nombre';
        }

        if (!in_array($direccion, ['asc', 'desc'], true)) {
            $direccion = 'asc';
        }

        $predios = Predio::query()
            ->where('estado', true)
            ->withCount('canchas')
            ->when($buscar, function ($query) use ($buscar) {
                $query->where(function ($q) use ($buscar) {
                    $q->where('nombre', 'like', "%{$buscar}%")
                        ->orWhere('localidad', 'like', "%{$buscar}%")
                        ->orWhere('direccion', 'like', "%{$buscar}%");
                });
            })
            ->orderBy($orden, $direccion)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Predios/Index', [
            'predios' => $predios,
            'filtros' => [
                'buscar' => $buscar,
                'orden' => $orden,
                'direccion' => $direccion,
            ],
            'totalInactivos' => Predio::where('estado', false)->count(),
        ]);
    }

    /**
     * Formulario de creación.
     */
    public function create()
    {
        return Inertia::render('Predios/Create');
    }

    /**
     * Guardar un nuevo predio.
     */
    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:255',
            'direccion' => 'nullable|string|max:255',
            'localidad' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string',
        ]);

        $datos['estado'] = true;

        Predio::create($datos);

        return redirect()
            ->route('predios.index')
            ->with('success', 'El predio se registró correctamente.');
    }

    /**
     * Mostrar un predio y sus canchas.
     */
    public function show(Predio $predio)
    {
        $predio->load([
            'canchas' => function ($query) {
                $query->withCount('horarios')
                    ->orderBy('nombre');
            },
        ]);

        return Inertia::render('Predios/Show', [
            'predio' => $predio,
        ]);
    }

    /**
     * Formulario de edición.
     */
    public function edit(Predio $predio)
    {
        return Inertia::render('Predios/Edit', [
            'predio' => $predio,
        ]);
    }

    /**
     * Actualizar un predio.
     */
    public function update(Request $request, Predio $predio)
    {
        $datos = $request->validate([
            'nombre' => 'required|string|max:255',
            'direccion' => 'nullable|string|max:255',
            'localidad' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string',
        ]);

        $predio->update($datos);

        return redirect()
            ->route('predios.index')
            ->with('success', 'El predio se actualizó correctamente.');
    }

    /**
     * Desactivar un predio.
     */
    public function destroy(Predio $predio)
    {
        $tieneCanchasActivas = $predio->canchas()
            ->where('estado', true)
            ->exists();

        if ($tieneCanchasActivas) {
            return redirect()
                ->back()
                ->with('error', 'No se puede desactivar el predio porque tiene canchas activas. Desactivá primero sus canchas.');
        }

        $predio->update([
            'estado' => false,
        ]);

        return redirect()
            ->route('predios.index')
            ->with('success', 'El predio se desactivó correctamente.');
    }

    /**
     * Historial de predios inactivos.
     */
    public function historial(Request $request)
    {
        $buscar = trim((string) $request->input('buscar', ''));

        $predios = Predio::query()
            ->where('estado', false)
            ->withCount('canchas')
            ->when($buscar, function ($query) use ($buscar) {
                $query->where(function ($q) use ($buscar) {
                    $q->where('nombre', 'like', "%{$buscar}%")
                        ->orWhere('localidad', 'like', "%{$buscar}%");
                });
            })
            ->orderBy('nombre')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Predios/Historial', [
            'predios' => $predios,
            'filtros' => [
                'buscar' => $buscar,
            ],
        ]);
    }

    /**
     * Reactivar un predio.
     */
    public function reactivar(Predio $predio)
    {
        $predio->update([
            'estado' => true,
        ]);

        return redirect()
            ->route('predios.historial')
            ->with('success', 'El predio se reactivó correctamente.');
    }
}