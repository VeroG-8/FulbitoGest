<?php

namespace App\Http\Controllers;

use App\Models\Cuota;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CuotaController extends Controller
{
    public function index(Request $request)
    {
        $tiposPermitidos = [
            'cuota_mensual',
            'inscripcion_escuelita',
            'inscripcion_torneo',
        ];

        $tipo = $request->input('tipo', '');

        if (!in_array($tipo, $tiposPermitidos, true)) {
            $tipo = '';
        }

        $anio = $request->input('anio', '');

        if (
            $anio !== '' &&
            (!ctype_digit((string) $anio) || strlen((string) $anio) !== 4)
        ) {
            $anio = '';
        }

        $orden = $request->input('orden', 'nombre');

        if (!in_array($orden, ['nombre', 'fecha_vencimiento'], true)) {
            $orden = 'nombre';
        }

        $direccion = $request->input('direccion', 'asc');

        if (!in_array($direccion, ['asc', 'desc'], true)) {
            $direccion = 'asc';
        }

        // Consulta principal.
        $cuotasQuery = Cuota::where('estado', true);

        if ($tipo !== '') {
            $cuotasQuery->where('tipo', $tipo);
        }

        if ($anio !== '') {
            $cuotasQuery->where('periodo_anio', (int) $anio);
        }

        // Aplicar filtros antes de paginar.
        $cuotas = $cuotasQuery
            ->orderBy($orden, $direccion)
            ->orderBy('id', 'asc')
            ->paginate(10)
            ->withQueryString();

        // Estadísticas generales de cuotas activas.
        $estadisticas = [
            'total' => Cuota::where('estado', true)->count(),

            'mensuales' => Cuota::where('estado', true)
                ->where('tipo', 'cuota_mensual')
                ->count(),

            'inscripcionesEscuelita' => Cuota::where('estado', true)
                ->where('tipo', 'inscripcion_escuelita')
                ->count(),

            'inscripcionesTorneo' => Cuota::where('estado', true)
                ->where('tipo', 'inscripcion_torneo')
                ->count(),
        ];

        // Años disponibles para el filtro.
        $anios = Cuota::where('estado', true)
            ->whereNotNull('periodo_anio')
            ->distinct()
            ->orderByDesc('periodo_anio')
            ->pluck('periodo_anio');

        return Inertia::render('Cuotas/Index', [
            'cuotas' => $cuotas,
            'estadisticas' => $estadisticas,
            'anios' => $anios,
            'filtros' => [
                'tipo' => $tipo,
                'anio' => (string) $anio,
                'orden' => $orden,
                'direccion' => $direccion,
            ],
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

    public function show(Cuota $cuota)
    {
        return Inertia::render('Cuotas/Show', [
            'cuota' => $cuota,
        ]);
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
        // Comprobar si la cuota ya fue asignada a algún jugador.
        $tieneAsignaciones = DB::table('cuota_x_jugador')
            ->where('cuota_id', $cuota->id)
            ->exists();

        if ($tieneAsignaciones) {
            return redirect()
                ->route('cuotas.index')
                ->with(
                    'error',
                    'No se puede deshabilitar esta cuota porque ya fue asignada a uno o más jugadores.'
                );
        }

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