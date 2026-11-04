<?php

namespace App\Http\Controllers;

use App\Models\Jugador;
use App\Models\Equipo;
use App\Models\Categoria;
use App\Models\Profesor;
use App\Models\Tutor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $usuario = $request->user();

        $estadisticas = [];
        $datosTutor = null;
        $datosProfesor = null;

        /*
        |--------------------------------------------------------------------------
        | DASHBOARD ADMINISTRADOR
        |--------------------------------------------------------------------------
        */

        if (in_array($usuario->rol, ['superadmin', 'admin'])) {
            $estadisticas = [
                'jugadores' => Jugador::count(),
                'jugadoresActivos' => Jugador::where('estado', true)->count(),
                'equiposActivos' => Equipo::where('estado', true)->count(),
                'categoriasActivas' => Categoria::where('estado', true)->count(),
                'profesoresActivos' => Profesor::where('estado', true)->count(),
                'tutoresActivos' => Tutor::where('estado', true)->count(),
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | DASHBOARD PROFESOR
        |--------------------------------------------------------------------------
        */

        if ($usuario->rol === 'profesor') {

            $profesor = $usuario->profesor()
                ->with([
                    'categorias.jugadores' => function ($query) {
                        $query->where('estado', true)
                            ->orderBy('apellido')
                            ->orderBy('nombre');
                    },
                ])
                ->first();

            if ($profesor) {
                $datosProfesor = [
                    'nombre' => $profesor->nombre,
                    'apellido' => $profesor->apellido,

                    'categorias' => $profesor->categorias->map(function ($categoria) {
                        return [
                            'id' => $categoria->id,
                            'nombre' => $categoria->nombre,
                            'anio' => $categoria->anio,

                            'jugadores' => $categoria->jugadores->map(function ($jugador) {
                                return [
                                    'id' => $jugador->id,
                                    'nombre' => $jugador->nombre,
                                    'apellido' => $jugador->apellido,
                                ];
                            })->values(),
                            
                            'total_jugadores' => $categoria->jugadores->count(),
                        ];
                    })->values(),

                    'total_categorias' => $profesor->categorias->count(),

                    'total_jugadores' => $profesor->categorias
                        ->sum(fn ($categoria) => $categoria->jugadores->count()),
                ];
            }
        }

        /*
        |--------------------------------------------------------------------------
        | DASHBOARD TUTOR
        |--------------------------------------------------------------------------
        */

        if ($usuario->rol === 'tutor') {

            $tutor = $usuario->tutor()
                ->with([
                    'jugadores' => function ($query) {
                        $query->with([
                            'categoria',

                            'cuotaXJugadores' => function ($q) {
                                $q->with([
                                    'cuota',
                                    'pagos' => function ($pagoQuery) {
                                        $pagoQuery
                                            ->where('estado', 'confirmado')
                                            ->orderByDesc('fecha_pago');
                                    },
                                ]);
                            },

                            'torneos',
                        ])
                        ->orderBy('apellido')
                        ->orderBy('nombre');
                    },
                ])
                ->first();

            if ($tutor) {

                $jugadores = $tutor->jugadores->map(function ($jugador) {

                    /*
                    | CUOTAS Y PAGOS
                    */

                    $cuotas = $jugador->cuotaXJugadores->map(function ($asignacion) {

                        $cuota = $asignacion->cuota;

                        $monto = (float) ($cuota?->monto ?? 0);

                        $pagado = (float) $asignacion->pagos->sum('monto');

                        $saldo = max(0, $monto - $pagado);

                        if ($pagado <= 0) {
                            $estado = 'pendiente';
                        } elseif ($pagado >= $monto) {
                            $estado = 'abonado';
                        } else {
                            $estado = 'parcial';
                        }

                        return [
                            'id' => $asignacion->id,
                            'cuota' => $cuota?->nombre,
                            'tipo' => $cuota?->tipo,
                            'periodo_mes' => $cuota?->periodo_mes,
                            'periodo_anio' => $cuota?->periodo_anio,
                            'fecha_vencimiento' => $asignacion->fecha_vencimiento?->format('d/m/Y'),

                            'monto' => $monto,
                            'pagado' => $pagado,
                            'saldo' => $saldo,
                            'estado' => $estado,

                            'pagos' => $asignacion->pagos->map(function ($pago) {
                                return [
                                    'id' => $pago->id,
                                    'fecha' => $pago->fecha_pago?->format('d/m/Y'),
                                    'monto' => (float) $pago->monto,
                                ];
                            })->values(),
                        ];
                    });

                    /*
                    | RESUMEN DE CUOTAS MENSUALES
                    */

                    $cuotasMensuales = $cuotas->where(
                        'tipo',
                        'cuota_mensual'
                    );

                    $resumenCuotas = [
                        'total' => $cuotasMensuales->count(),

                        'pendientes' => $cuotasMensuales
                            ->where('estado', 'pendiente')->count(),

                        'parciales' => $cuotasMensuales
                            ->where('estado', 'parcial')->count(),

                        'abonadas' => $cuotasMensuales
                            ->where('estado', 'abonado')->count(),

                        'monto_total' => $cuotasMensuales->sum('monto'),

                        'monto_pagado' => $cuotasMensuales->sum('pagado'),

                        'saldo_pendiente' => $cuotasMensuales->sum('saldo'),
                    ];

                    /*
                    | RESUMEN DE INSCRIPCIONES
                    */

                    $inscripciones = $jugador->torneos->map(function ($torneo) {

                        return [
                            'id' => $torneo->pivot->id,
                            'torneo' => $torneo->nombre,
                            'fecha_inscripcion' => $torneo->pivot->fecha_inscripcion,
                            'monto' => (float) (
                                $torneo->pivot->monto_inscripcion
                                ?? $torneo->monto_inscripcion
                                ?? 0
                            ),
                            'estado' => $torneo->pivot->estado,
                            'fecha_inicio' => $torneo->fecha_inicio?->format('d/m/Y'),
                            'fecha_fin' => $torneo->fecha_fin?->format('d/m/Y'),
                        ];
                    })->values();

                    /*
                    | HISTORIAL DE PAGOS
                    */

                    $historialPagos = $cuotas
                        ->flatMap(function ($cuota) {
                            return collect($cuota['pagos'])->map(function ($pago) use ($cuota) {
                                return [
                                    'id' => $pago['id'],
                                    'cuota' => $cuota['cuota'],
                                    'fecha' => $pago['fecha'],
                                    'monto' => $pago['monto'],
                                ];
                            });
                        })
                        ->sortByDesc('id')
                        ->take(10)
                        ->values();

                    return [
                        'id' => $jugador->id,
                        'nombre' => $jugador->nombre,
                        'apellido' => $jugador->apellido,
                        'categoria' => $jugador->categoria?->nombre,
                        'estado' => $jugador->estado,

                        'cuotas' => $cuotas->values(),
                        'resumen_cuotas' => $resumenCuotas,

                        'inscripciones' => $inscripciones,

                        'historial_pagos' => $historialPagos,
                    ];
                });

                /*
                | RESUMEN GENERAL DEL TUTOR
                */

                $datosTutor = [
                    'nombre' => $tutor->nombre,
                    'apellido' => $tutor->apellido,

                    'total_jugadores' => $jugadores->count(),

                    'total_cuotas_pendientes' => $jugadores
                        ->sum(fn ($jugador) => $jugador['resumen_cuotas']['pendientes']),

                    'total_cuotas_parciales' => $jugadores
                        ->sum(fn ($jugador) => $jugador['resumen_cuotas']['parciales']),

                    'total_cuotas_abonadas' => $jugadores
                        ->sum(fn ($jugador) => $jugador['resumen_cuotas']['abonadas']),

                    'monto_abonado' => $jugadores
                        ->sum(fn ($jugador) => $jugador['resumen_cuotas']['monto_pagado']),

                    'saldo_pendiente' => $jugadores
                        ->sum(fn ($jugador) => $jugador['resumen_cuotas']['saldo_pendiente']),

                    'jugadores' => $jugadores->values(),
                ];
            }
        }

        return Inertia::render('Dashboard', [
            'usuario' => $usuario,
            'estadisticas' => $estadisticas,
            'datosTutor' => $datosTutor,
            'datosProfesor' => $datosProfesor,
        ]);
    }
}