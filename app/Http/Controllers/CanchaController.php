<?php

namespace App\Http\Controllers;

use App\Models\Cancha;
use App\Models\Predio;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CanchaController extends Controller
{
    public function index(Request $request)
    {
        $buscar = trim((string) $request->input('buscar', ''));

        // Recibir varios predios seleccionados.
        $predioIds = $request->input('predio_ids', []);

        if (!is_array($predioIds)) {
            $predioIds = [$predioIds];
        }

        $predioIds = collect($predioIds)
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->values()
            ->all();

        // Solo permitir filtrar por predios activos.
        $predios = Predio::where('estado', true)
            ->orderBy('nombre')
            ->get(['id', 'nombre']);

        $prediosActivosIds = $predios->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $predioIds = array_values(
            array_intersect($predioIds, $prediosActivosIds)
        );

        $orden = $request->input('orden', 'nombre');
        $direccion = $request->input('direccion', 'asc');

        if (!in_array($orden, ['nombre', 'created_at'], true)) {
            $orden = 'nombre';
        }

        if (!in_array($direccion, ['asc', 'desc'], true)) {
            $direccion = 'asc';
        }

        $canchas = Cancha::query()
            ->with('predio:id,nombre')
            ->withCount('horarios')
            ->where('estado', true)
            ->when($buscar, function ($query) use ($buscar) {
                $query->where(function ($q) use ($buscar) {
                    $q->where('nombre', 'like', "%{$buscar}%")
                        ->orWhereHas('predio', function ($predio) use ($buscar) {
                            $predio->where('nombre', 'like', "%{$buscar}%");
                        });
                });
            })
            ->when(count($predioIds) > 0, function ($query) use ($predioIds) {
                $query->whereIn('predio_id', $predioIds);
            })
            ->orderBy($orden, $direccion)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Canchas/Index', [
            'canchas' => $canchas,
            'predios' => $predios,
            'filtros' => [
                'buscar' => $buscar,
                'predio_ids' => $predioIds,
                'orden' => $orden,
                'direccion' => $direccion,
            ],
            'totalInactivas' => Cancha::where('estado', false)->count(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Canchas/Create', [
            'predios' => Predio::where('estado', true)
                ->orderBy('nombre')
                ->get(['id', 'nombre']),
        ]);
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'predio_id' => [
                'required',
                'integer',
                Rule::exists('predios', 'id')->where('estado', true),
            ],
            'nombre' => [
                'required',
                'string',
                'max:255',
                Rule::unique('canchas', 'nombre')
                    ->where('predio_id', $request->input('predio_id')),
            ],
            'descripcion' => 'nullable|string',
        ], [
            'predio_id.required' => 'Debés seleccionar un predio.',
            'predio_id.exists' => 'El predio seleccionado no existe o está inactivo.',
            'nombre.required' => 'El nombre de la cancha es obligatorio.',
            'nombre.unique' => 'Ya existe una cancha con ese nombre en el predio seleccionado.',
        ]);

        $datos['estado'] = true;

        Cancha::create($datos);

        return redirect()
            ->route('canchas.index')
            ->with('success', 'La cancha se registró correctamente.');
    }

    public function show(Cancha $cancha)
    {
        $cancha->load([
            'predio',
            'horarios' => function ($query) {
                $query->with([
                    'categoria:id,anio',
                    'profesor:id,nombre,apellido',
                ])
                    ->orderBy('dia_semana')
                    ->orderBy('hora_inicio');
            },
        ]);

        return Inertia::render('Canchas/Show', [
            'cancha' => $cancha,
        ]);
    }

    public function edit(Cancha $cancha)
    {
        return Inertia::render('Canchas/Edit', [
            'cancha' => $cancha,
            'predios' => Predio::where('estado', true)
                ->orWhere('id', $cancha->predio_id)
                ->orderBy('nombre')
                ->get(['id', 'nombre', 'estado']),
        ]);
    }

    public function update(Request $request, Cancha $cancha)
    {
        $datos = $request->validate([
            'predio_id' => [
                'required',
                'integer',
                Rule::exists('predios', 'id')->where('estado', true),
            ],
            'nombre' => [
                'required',
                'string',
                'max:255',
                Rule::unique('canchas', 'nombre')
                    ->where('predio_id', $request->input('predio_id'))
                    ->ignore($cancha->id),
            ],
            'descripcion' => 'nullable|string',
        ], [
            'predio_id.required' => 'Debés seleccionar un predio.',
            'predio_id.exists' => 'El predio seleccionado no existe o está inactivo.',
            'nombre.required' => 'El nombre de la cancha es obligatorio.',
            'nombre.unique' => 'Ya existe una cancha con ese nombre en el predio seleccionado.',
        ]);

        if (
            (int) $datos['predio_id'] !== (int) $cancha->predio_id
            && $cancha->horarios()->exists()
        ) {
            return back()
                ->withErrors([
                    'predio_id' => 'No se puede cambiar el predio porque esta cancha tiene horarios asociados.',
                ])
                ->withInput();
        }

        $cancha->update($datos);

        return redirect()
            ->route('canchas.index')
            ->with('success', 'La cancha se actualizó correctamente.');
    }

    public function destroy(Cancha $cancha)
    {
        if ($cancha->horarios()->exists()) {
            return redirect()
                ->back()
                ->with(
                    'error',
                    'No se puede desactivar esta cancha porque tiene horarios asociados. Primero debés resolver esas asignaciones.'
                );
        }

        $cancha->update([
            'estado' => false,
        ]);

        return redirect()
            ->route('canchas.index')
            ->with('success', 'La cancha se desactivó correctamente.');
    }

    public function historial(Request $request)
    {
        $buscar = trim((string) $request->input('buscar', ''));

        $canchas = Cancha::query()
            ->with('predio:id,nombre')
            ->withCount('horarios')
            ->where('estado', false)
            ->when($buscar, function ($query) use ($buscar) {
                $query->where(function ($q) use ($buscar) {
                    $q->where('nombre', 'like', "%{$buscar}%")
                        ->orWhereHas('predio', function ($predio) use ($buscar) {
                            $predio->where('nombre', 'like', "%{$buscar}%");
                        });
                });
            })
            ->orderBy('nombre')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Canchas/Historial', [
            'canchas' => $canchas,
            'filtros' => [
                'buscar' => $buscar,
            ],
        ]);
    }

    public function reactivar(Cancha $cancha)
    {
        if (!$cancha->predio()->where('estado', true)->exists()) {
            return redirect()
                ->back()
                ->with(
                    'error',
                    'No se puede reactivar la cancha porque su predio está inactivo.'
                );
        }

        $cancha->update([
            'estado' => true,
        ]);

        return redirect()
            ->route('canchas.historial')
            ->with('success', 'La cancha se reactivó correctamente.');
    }
}