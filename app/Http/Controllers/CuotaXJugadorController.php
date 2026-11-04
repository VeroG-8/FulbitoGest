<?php

namespace App\Http\Controllers;

use App\Models\CuotaXJugador;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Cuota;
use App\Models\Jugador;
use App\Models\Categoria;
use Illuminate\Support\Facades\DB;

class CuotaXJugadorController extends Controller
{
        
    public function index(Request $request)
    {
        $categoriaId = $request->input('categoria_id');

        // Consulta base de asignaciones
        $consulta = CuotaXJugador::with([
            'cuota',
            'jugador.categoria',
        ]);

        // Aplicar filtro por categoría, si fue seleccionado
        $consulta->when($categoriaId, function ($query) use ($categoriaId) {
            $query->whereHas('jugador', function ($q) use ($categoriaId) {
                $q->where('categoria_id', $categoriaId);
            });
        });

        // Estadísticas: respetan el filtro seleccionado
        $estadisticas = [
            'total' => (clone $consulta)->count(),
            'pendientes' => (clone $consulta)->where('estado', 'pendiente')->count(),
            'pagadas' => (clone $consulta)->where('estado', 'pagada')->count(),
        ];

        // Listado paginado
        $asignaciones = $consulta
            ->orderBy('fecha_vencimiento', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Categorías disponibles para el filtro
        $categorias = Categoria::orderBy('nombre')
            ->get(['id', 'nombre']);

        return Inertia::render('Cuotas/Asignaciones/Index', [
            'asignaciones' => $asignaciones,
            'categorias' => $categorias,
            'filtros' => [
                'categoria_id' => $categoriaId,
            ],
            'estadisticas' => $estadisticas,
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
        public function storeMasivo(Request $request)
    {
        $validated = $request->validate([
            'cuota_id' => 'required|exists:cuotas,id',
            'categoria_id' => 'required|exists:categorias,id',
            'fecha_asignacion' => 'required|date',
            'fecha_vencimiento' => 'required|date|after_or_equal:fecha_asignacion',
        ]);

        $cuota = Cuota::where('estado', true)
            ->findOrFail($validated['cuota_id']);

        $jugadores = Jugador::where('estado', true)
            ->where('categoria_id', $validated['categoria_id'])
            ->get();

        if ($jugadores->isEmpty()) {
            return back()->withErrors([
                'categoria_id' => 'No hay jugadores activos en esta categoría.',
            ]);
        }

        $asignacionesCreadas = 0;

        DB::transaction(function () use ($jugadores, $validated, &$asignacionesCreadas) {
            foreach ($jugadores as $jugador) {
                $existe = CuotaXJugador::where('cuota_id', $validated['cuota_id'])
                    ->where('jugador_id', $jugador->id)
                    ->exists();

                if (!$existe) {
                    CuotaXJugador::create([
                        'cuota_id' => $validated['cuota_id'],
                        'jugador_id' => $jugador->id,
                        'fecha_asignacion' => $validated['fecha_asignacion'],
                        'fecha_vencimiento' => $validated['fecha_vencimiento'],
                        'estado' => 'pendiente',
                    ]);

                    $asignacionesCreadas++;
                }
            }
        });

        return redirect()
            ->route('cuotas.asignaciones.index')
            ->with('success', "Se asignó la cuota a {$asignacionesCreadas} jugadores.");
    }

    public function createMasivo()
    {
        $cuotas = Cuota::where('estado', true)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'monto']);

        $categorias = Categoria::orderBy('nombre')
            ->get(['id', 'nombre']);

        return Inertia::render('Cuotas/Asignaciones/CreateMasivo', [
            'cuotas' => $cuotas,
            'categorias' => $categorias,
        ]);
    }
    
        public function seguimiento(Request $request)
    {
        // Año seleccionado (por defecto, el año actual).
        $anio = $request->input('anio', now()->year);

        $request->validate([
            'anio' => 'nullable|integer|between:2020,2100',
            'categoria_id' => 'nullable|exists:categorias,id',
        ]);

        $categoriaId = $request->input('categoria_id');

        // Categorías disponibles para el filtro.
        $categorias = Categoria::orderBy('nombre')
            ->get(['id', 'nombre']);

        // Jugadores activos y sus asignaciones correspondientes al año.
        $jugadores = Jugador::where('estado', true)
            ->when($categoriaId, function ($query) use ($categoriaId) {
                $query->where('categoria_id', $categoriaId);
            })
            ->with([
                'categoria:id,nombre',

                'cuotaXJugadores' => function ($query) use ($anio) {
                    $query->whereHas('cuota', function ($q) use ($anio) {
                        $q->where('periodo_anio', $anio);
                    })
                    ->with([
                        'cuota:id,nombre,monto,periodo_mes,periodo_anio',

                        'pagos' => function ($q) {
                            $q->where('estado', 'confirmado')
                                ->select(
                                    'id',
                                    'cuota_x_jugador_id',
                                    'monto'
                                );
                        },
                    ]);
                },
            ])
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        // Construir la información mensual de cada jugador.
        $jugadoresSeguimiento = $jugadores->map(function ($jugador) {

            $asignacionesPorMes = $jugador->cuotaXJugadores
                ->groupBy(function ($asignacion) {
                    return $asignacion->cuota->periodo_mes;
                });

            $meses = [];

            for ($mes = 1; $mes <= 12; $mes++) {

                $asignaciones = $asignacionesPorMes->get(
                    $mes,
                    collect()
                );

                // Si no tiene ninguna cuota asignada.
                if ($asignaciones->isEmpty()) {
                    $meses[$mes] = [
                        'estado' => 'sin_asignacion',
                        'monto' => 0,
                        'pagado' => 0,
                        'saldo' => 0,
                    ];

                    continue;
                }

                // Sumar los importes de las cuotas asignadas en ese mes.
                $monto = $asignaciones->sum(function ($asignacion) {
                    return (float) $asignacion->cuota->monto;
                });

                // Sumar solamente los pagos confirmados.
                $pagado = $asignaciones->sum(function ($asignacion) {
                    return $asignacion->pagos->sum('monto');
                });

                $saldo = max(0, $monto - $pagado);

                // Determinar el estado real del mes.
                if ($pagado <= 0) {
                    $estado = 'pendiente';
                } elseif ($pagado >= $monto) {
                    $estado = 'abonado';
                } else {
                    $estado = 'parcial';
                }

                $meses[$mes] = [
                    'estado' => $estado,
                    'monto' => $monto,
                    'pagado' => $pagado,
                    'saldo' => $saldo,
                ];
            }

            return [
                'id' => $jugador->id,
                'apellido' => $jugador->apellido,
                'nombre' => $jugador->nombre,
                'categoria' => $jugador->categoria?->nombre,
                'meses' => $meses,
            ];
        });

        return Inertia::render('Cuotas/Seguimiento/Index', [
            'jugadores' => $jugadoresSeguimiento,
            'categorias' => $categorias,
            'filtros' => [
                'anio' => (int) $anio,
                'categoria_id' => $categoriaId,
            ],
        ]);
    }
    
}