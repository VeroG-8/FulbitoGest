<?php

namespace App\Http\Controllers;

use App\Models\Jugador;
use App\Models\Equipo;
use App\Models\Categoria;
use App\Models\Profesor;
use App\Models\Tutor;
use App\Models\Cuota;
use App\Models\CuotaXJugador;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;


class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $usuario = $request->user();

        $estadisticas = [];
        $datosAdministrador = null;
        $datosTutor = null;
        $datosProfesor = null;

        $zonaHoraria = 'America/Argentina/Buenos_Aires';
        $hoy = Carbon::today($zonaHoraria);

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

            /*
            | JUGADORES POR CATEGORÍA
            */

            $jugadoresPorCategoria = Categoria::query()
                ->where('estado', true)
                ->withCount([
                    'jugadores' => function ($query) {
                        $query->where('estado', true);
                    },
                ])
                ->orderBy('anio')
                ->get(['id', 'anio'])
                ->map(function ($categoria) {
                    return [
                        'id' => $categoria->id,
                        'categoria' => $categoria->anio,
                        'total' => $categoria->jugadores_count,
                    ];
                })
                ->values();

            /*
            | ESTADO DE CUOTAS MENSUALES
            */

            $estadoGeneral = [
                'vencidas' => 0,
                'pendientes' => 0,
                'pagadas' => 0,
            ];

            $categoriasCuotas = Categoria::query()
                ->where('estado', true)
                ->orderBy('anio')
                ->get(['id', 'anio'])
                ->mapWithKeys(function ($categoria) {
                    return [
                        $categoria->id => [
                            'id' => $categoria->id,
                            'categoria' => $categoria->anio,
                            'total' => 0,
                            'vencidas' => 0,
                            'pendientes' => 0,
                            'pagadas' => 0,
                        ],
                    ];
                });

            $cuotasVencidas = collect();
            $totalCuotasVencidas = 0;

            $asignaciones = CuotaXJugador::query()
                ->with([
                    'cuota:id,nombre,tipo,monto,periodo_mes,periodo_anio',

                    'jugador:id,nombre,apellido,categoria_id',

                    'pagos' => function ($query) {
                        $query->where('estado', 'confirmado');
                    },
                ])
                ->whereHas('cuota', function ($query) {
                    $query->where('tipo', 'cuota_mensual');
                })
                ->get();

            // Años disponibles según las cuotas mensuales que tienen asignaciones.
            $aniosCuotas = $asignaciones
                ->filter(fn ($asignacion) => $asignacion->cuota?->tipo === 'cuota_mensual')
                ->pluck('cuota.periodo_anio')
                ->filter()
                ->map(fn ($anio) => (int) $anio)
                ->unique()
                ->push((int) $hoy->year)
                ->sortDesc()
                ->values();

            $anioCuotasSeleccionado = (int) $request->input('anio_cuotas', $hoy->year);

            if (!$aniosCuotas->contains($anioCuotasSeleccionado)) {
                $anioCuotasSeleccionado = (int) $hoy->year;
            }

            foreach ($asignaciones as $asignacion) {

                $monto = (float) ($asignacion->cuota?->monto ?? 0);

                $pagado = (float) $asignacion->pagos->sum('monto');

                $saldo = max(0, $monto - $pagado);

                $fechaVencimiento = $asignacion->fecha_vencimiento;

                /*
                | Determinar estado
                */

                if ($saldo <= 0) {

                    $estado = 'pagadas';

                } elseif (
                    $fechaVencimiento &&
                    Carbon::parse($fechaVencimiento, $zonaHoraria)->lt($hoy)
                ) {

                    $estado = 'vencidas';

                } else {

                    $estado = 'pendientes';
                }

                /*
                | Contadores del gráfico anual (solo año seleccionado)
                */

                $anioCuota = (int) ($asignacion->cuota?->periodo_anio ?? 0);

                if ($anioCuota === $anioCuotasSeleccionado) {
                    $estadoGeneral[$estado]++;

                    $categoriaId = $asignacion->jugador?->categoria_id;

                    if ($categoriaId && $categoriasCuotas->has($categoriaId)) {
                        $datosCategoria = $categoriasCuotas->get($categoriaId);
                        $datosCategoria['total']++;
                        $datosCategoria[$estado]++;
                        $categoriasCuotas->put($categoriaId, $datosCategoria);
                    }
                }

                /*
                | Alertas de cuotas vencidas
                */

                if ($estado === 'vencidas') {

                    $totalCuotasVencidas++;

                    $cuotasVencidas->push([
                        'id' => $asignacion->id,

                        'jugador' => trim(
                            ($asignacion->jugador?->apellido ?? '') . ', ' .
                            ($asignacion->jugador?->nombre ?? '')
                        ),

                        'cuota' => $asignacion->cuota?->nombre,

                        'monto' => $monto,

                        'pagado' => $pagado,

                        'saldo' => $saldo,

                        'fecha_vencimiento' => $fechaVencimiento
                            ? Carbon::parse($fechaVencimiento)->format('d/m/Y')
                            : null,
                    ]);
                }
            }

            $datosAdministrador = [
                'jugadores_por_categoria' => $jugadoresPorCategoria,

                'anio_cuotas' => $anioCuotasSeleccionado,
                'anios_cuotas' => $aniosCuotas->all(),

                'estado_cuotas' => [
                    [
                        'estado' => 'Vencidas',
                        'total' => $estadoGeneral['vencidas'],
                    ],
                    [
                        'estado' => 'Pendientes',
                        'total' => $estadoGeneral['pendientes'],
                    ],
                    [
                        'estado' => 'Pagadas',
                        'total' => $estadoGeneral['pagadas'],
                    ],
                ],

                'total_cuotas' => array_sum($estadoGeneral),

                'categorias_cuotas' => $categoriasCuotas
                    ->values()
                    ->all(),

                'total_cuotas_vencidas' => $totalCuotasVencidas,

                'cuotas_vencidas' => $cuotasVencidas
                    ->sortBy('fecha_vencimiento')
                    ->take(8)
                    ->values(),
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | DASHBOARD PROFESOR
        |--------------------------------------------------------------------------
        */

        if ($usuario->rol === 'profesor') {

            $profesor = $usuario->profesor()->first();

            if ($profesor) {

                $profesor->load([

                    'categorias' => function ($query) use ($profesor) {

                        $query->orderBy('anio')
                            ->with([

                                'jugadores' => function ($jugadoresQuery) {
                                    $jugadoresQuery
                                        ->where('estado', true)
                                        ->orderBy('apellido')
                                        ->orderBy('nombre');
                                },

                                'horarios' => function ($horariosQuery) use ($profesor) {
                                    $horariosQuery
                                        ->where('estado', true)
                                        ->where('profesor_id', $profesor->id)
                                        ->with([
                                            'cancha:id,nombre,predio_id',
                                            'cancha.predio:id,nombre',
                                        ])
                                        ->orderBy('dia_semana')
                                        ->orderBy('hora_inicio');
                                },
                            ]);
                    },

                    'horarios' => function ($query) {
                        $query->where('estado', true)
                            ->with([
                                'categoria:id,anio',
                                'cancha:id,nombre,predio_id',
                                'cancha.predio:id,nombre',
                            ])
                            ->orderBy('dia_semana')
                            ->orderBy('hora_inicio');
                    },
                ]);

                /*
                | CATEGORÍAS Y JUGADORES
                */

                $categorias = $profesor->categorias->map(function ($categoria) {

                    return [
                        'id' => $categoria->id,

                        'anio' => $categoria->anio,

                        'jugadores' => $categoria->jugadores
                            ->map(function ($jugador) {
                                return [
                                    'id' => $jugador->id,
                                    'nombre' => $jugador->nombre,
                                    'apellido' => $jugador->apellido,
                                ];
                            })
                            ->values(),

                        'total_jugadores' => $categoria->jugadores->count(),

                        'total_horarios' => $categoria->horarios->count(),
                    ];
                })->values();

                /*
                | CATEGORÍAS SIN HORARIOS ACTIVOS
                */

                $categoriasSinHorario = $profesor->categorias
                    ->filter(function ($categoria) {
                        return $categoria->horarios->isEmpty();
                    })
                    ->map(function ($categoria) {
                        return [
                            'id' => $categoria->id,
                            'anio' => $categoria->anio,
                        ];
                    })
                    ->values();

                /*
                | PRÓXIMOS ENTRENAMIENTOS
                */

                $diasSemana = [
                    'lunes' => 1,
                    'martes' => 2,
                    'miercoles' => 3,
                    'jueves' => 4,
                    'viernes' => 5,
                ];

                $ahora = Carbon::now($zonaHoraria);

                $proximosEntrenamientos = $profesor->horarios
                    ->map(function ($horario) use (
                        $diasSemana,
                        $ahora,
                        $zonaHoraria
                    ) {

                        $diaNumero = $diasSemana[$horario->dia_semana] ?? null;

                        if (!$diaNumero) {
                            return null;
                        }

                        $diasHasta = (
                            $diaNumero - $ahora->dayOfWeekIso + 7
                        ) % 7;

                        $fecha = $ahora->copy()
                            ->startOfDay()
                            ->addDays($diasHasta);

                        $fechaHora = Carbon::parse(
                            $fecha->format('Y-m-d') . ' ' . $horario->hora_inicio,
                            $zonaHoraria
                        );

                        if ($fechaHora->lt($ahora)) {
                            $fechaHora->addWeek();
                        }

                        return [
                            '_orden' => $fechaHora->timestamp,

                            'id' => $horario->id,

                            'categoria_anio' => $horario->categoria?->anio,

                            'dia' => ucfirst(
                                $horario->dia_semana === 'miercoles'
                                    ? 'miércoles'
                                    : $horario->dia_semana
                            ),

                            'fecha' => $fechaHora->format('d/m/Y'),

                            'hora_inicio' => substr($horario->hora_inicio, 0, 5),

                            'hora_fin' => substr($horario->hora_fin, 0, 5),

                            'cancha' => $horario->cancha?->nombre,

                            'predio' => $horario->cancha?->predio?->nombre,
                        ];
                    })
                    ->filter()
                    ->sortBy('_orden')
                    ->take(5)
                    ->map(function ($horario) {
                        unset($horario['_orden']);

                        return $horario;
                    })
                    ->values();

                /*
                | RESUMEN GENERAL
                */

                $datosProfesor = [
                    'nombre' => $profesor->nombre,

                    'apellido' => $profesor->apellido,

                    'categorias' => $categorias,

                    'total_categorias' => $profesor->categorias->count(),

                    'total_jugadores' => $profesor->categorias
                        ->sum(fn ($categoria) => $categoria->jugadores->count()),

                    'total_horarios' => $profesor->horarios->count(),

                    'categorias_sin_horario' => $categoriasSinHorario,

                    'total_categorias_sin_horario' => $categoriasSinHorario->count(),

                    'proximos_entrenamientos' => $proximosEntrenamientos,
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

                /*
                | DATOS DE LOS JUGADORES
                */

                $jugadores = $tutor->jugadores->map(function ($jugador) use (
                    $hoy,
                    $zonaHoraria
                ) {

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
                        } elseif ($saldo <= 0) {
                            $estado = 'abonado';
                        } else {
                            $estado = 'parcial';
                        }

                        $fechaVencimiento = $asignacion->fecha_vencimiento;

                        return [
                            'id' => $asignacion->id,

                            'cuota' => $cuota?->nombre,

                            'tipo' => $cuota?->tipo,

                            'periodo_mes' => $cuota?->periodo_mes,

                            'periodo_anio' => $cuota?->periodo_anio,

                            'fecha_vencimiento' => $fechaVencimiento
                                ? Carbon::parse($fechaVencimiento)->format('d/m/Y')
                                : null,

                            'fecha_vencimiento_iso' => $fechaVencimiento
                                ? Carbon::parse($fechaVencimiento)->format('Y-m-d')
                                : null,

                            'monto' => $monto,

                            'pagado' => $pagado,

                            'saldo' => $saldo,

                            'estado' => $estado,

                            'pagos' => $asignacion->pagos
                                ->map(function ($pago) {
                                    return [
                                        'id' => $pago->id,

                                        'fecha' => $pago->fecha_pago
                                            ? Carbon::parse($pago->fecha_pago)->format('d/m/Y')
                                            : null,

                                        'monto' => (float) $pago->monto,
                                    ];
                                })
                                ->values(),
                        ];
                    });

                    /*
                    | CUOTAS MENSUALES
                    */

                    $cuotasMensuales = $cuotas->where(
                        'tipo',
                        'cuota_mensual'
                    );

                 

                    /*
                    | RESUMEN DE CUOTAS
                    */

                    $resumenCuotas = [
                        'total' => $cuotasMensuales->count(),

                        'pendientes' => $cuotasMensuales
                            ->where('estado', 'pendiente')
                            ->count(),

                        'parciales' => $cuotasMensuales
                            ->where('estado', 'parcial')
                            ->count(),

                        'abonadas' => $cuotasMensuales
                            ->where('estado', 'abonado')
                            ->count(),

                        'monto_total' => $cuotasMensuales->sum('monto'),

                        'monto_pagado' => $cuotasMensuales->sum('pagado'),

                        'saldo_pendiente' => $cuotasMensuales->sum('saldo'),
                    ];

                  

                    /*
                    | INSCRIPCIONES A TORNEOS
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

                            return collect($cuota['pagos'])
                                ->map(function ($pago) use ($cuota) {

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

                        'categoria' => $jugador->categoria?->anio,

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

                $totalCuotasPendientes = $jugadores
                    ->sum(fn ($jugador) => $jugador['resumen_cuotas']['pendientes']);

                $totalCuotasParciales = $jugadores
                    ->sum(fn ($jugador) => $jugador['resumen_cuotas']['parciales']);

                $totalCuotasAbonadas = $jugadores
                    ->sum(fn ($jugador) => $jugador['resumen_cuotas']['abonadas']);

                        /*
                |--------------------------------------------------------------------------
                | FILTROS DEL GRÁFICO DE CUOTAS DEL TUTOR
                |--------------------------------------------------------------------------
                */

                // Jugadores disponibles para el filtro.
                $jugadoresFiltro = $jugadores
                    ->map(function ($jugador) {
                        return [
                            'id' => $jugador['id'],
                            'nombre' => $jugador['apellido'] . ', ' . $jugador['nombre'],
                        ];
                    })
                    ->values();

                // Años que tienen cuotas mensuales asignadas.
                $aniosCuotasTutor = $jugadores
                    ->flatMap(function ($jugador) {
                        return collect($jugador['cuotas'])
                            ->where('tipo', 'cuota_mensual')
                            ->pluck('periodo_anio');
                    })
                    ->filter()
                    ->map(fn ($anio) => (int) $anio)
                    ->unique()
                    ->push((int) $hoy->year)
                    ->sortDesc()
                    ->values();

                // Año seleccionado.
                $anioCuotasSeleccionado = (int) $request->input(
                    'anio_cuotas_tutor',
                    $hoy->year
                );

                if (!$aniosCuotasTutor->contains($anioCuotasSeleccionado)) {
                    $anioCuotasSeleccionado = (int) $hoy->year;
                }

                // Jugador seleccionado.
                $jugadorCuotasSeleccionado = (string) $request->input(
                    'jugador_cuotas_tutor',
                    'todos'
                );

                // Verificar que el jugador pertenezca al tutor.
                if (
                    $jugadorCuotasSeleccionado !== 'todos' &&
                    !$jugadores->contains(function ($jugador) use ($jugadorCuotasSeleccionado) {
                        return (string) $jugador['id'] === $jugadorCuotasSeleccionado;
                    })
                ) {
                    $jugadorCuotasSeleccionado = 'todos';
                }

                /*
                |--------------------------------------------------------------------------
                | OBTENER CUOTAS PARA EL GRÁFICO
                |--------------------------------------------------------------------------
                */

                $cuotasParaGrafico = $jugadores
                    ->when(
                        $jugadorCuotasSeleccionado !== 'todos',
                        function ($coleccion) use ($jugadorCuotasSeleccionado) {
                            return $coleccion->where(
                                'id',
                                (int) $jugadorCuotasSeleccionado
                            );
                        }
                    )
                    ->flatMap(function ($jugador) {
                        return collect($jugador['cuotas'])
                            ->where('tipo', 'cuota_mensual');
                    })
                    ->filter(function ($cuota) use ($anioCuotasSeleccionado) {
                        return (int) ($cuota['periodo_anio'] ?? 0)
                            === $anioCuotasSeleccionado;
                    });

                /*
                |--------------------------------------------------------------------------
                | CONTAR ESTADOS
                |--------------------------------------------------------------------------
                */

                $estadoGraficoTutor = [
                    'vencidas' => 0,
                    'pendientes' => 0,
                    'pagadas' => 0,
                ];

                foreach ($cuotasParaGrafico as $cuota) {

                    if ($cuota['saldo'] <= 0) {

                        $estadoGraficoTutor['pagadas']++;

                    } elseif (
                        !empty($cuota['fecha_vencimiento_iso']) &&
                        Carbon::parse(
                            $cuota['fecha_vencimiento_iso'],
                            $zonaHoraria
                        )->lt($hoy)
                    ) {

                        $estadoGraficoTutor['vencidas']++;

                    } else {

                        $estadoGraficoTutor['pendientes']++;
                    }
                }
                /*
                | VENCIMIENTOS DE CUOTAS MENSUALES
                */

                $limiteProximosVencimientos = $hoy->copy()->addDays(7);

                $cuotasTutor = $jugadores->flatMap(function ($jugador) {

                    return collect($jugador['cuotas'])
                        ->where('tipo', 'cuota_mensual')
                        ->map(function ($cuota) use ($jugador) {

                            return [
                                ...$cuota,

                                'jugador' => $jugador['apellido'] . ', ' .
                                    $jugador['nombre'],
                            ];
                        });
                });

                /*
                | CUOTAS VENCIDAS
                */

                $cuotasVencidasTutor = $cuotasTutor
                    ->filter(function ($cuota) use ($hoy, $zonaHoraria) {

                        return $cuota['saldo'] > 0
                            && !empty($cuota['fecha_vencimiento_iso'])
                            && Carbon::parse(
                                $cuota['fecha_vencimiento_iso'],
                                $zonaHoraria
                            )->lt($hoy);
                    })
                    ->sortBy('fecha_vencimiento_iso')
                    ->take(8)
                    ->values();

                /*
                | PRÓXIMOS VENCIMIENTOS
                */

                $proximosVencimientos = $cuotasTutor
                    ->filter(function ($cuota) use (
                        $hoy,
                        $limiteProximosVencimientos,
                        $zonaHoraria
                    ) {

                        if (
                            $cuota['saldo'] <= 0 ||
                            empty($cuota['fecha_vencimiento_iso'])
                        ) {
                            return false;
                        }

                        $fecha = Carbon::parse(
                            $cuota['fecha_vencimiento_iso'],
                            $zonaHoraria
                        );

                        return $fecha->greaterThanOrEqualTo($hoy)
                            && $fecha->lessThanOrEqualTo($limiteProximosVencimientos);
                    })
                    ->sortBy('fecha_vencimiento_iso')
                    ->take(8)
                    ->values();

                /*
                | DATOS FINALES DEL TUTOR
                */

                $datosTutor = [
                    'nombre' => $tutor->nombre,

                    'apellido' => $tutor->apellido,

                    'total_jugadores' => $jugadores->count(),

                    'total_jugadores_activos' => $jugadores
                        ->where('estado', true)
                        ->count(),

                    'total_cuotas_pendientes' => $totalCuotasPendientes,

                    'total_cuotas_parciales' => $totalCuotasParciales,

                    'total_cuotas_abonadas' => $totalCuotasAbonadas,

                    'monto_abonado' => $jugadores
                        ->sum(fn ($jugador) => $jugador['resumen_cuotas']['monto_pagado']),

                    'saldo_pendiente' => $jugadores
                        ->sum(fn ($jugador) => $jugador['resumen_cuotas']['saldo_pendiente']),

                    'anio_cuotas_grafico' => $anioCuotasSeleccionado,

                    'anios_cuotas_grafico' => $aniosCuotasTutor->all(),

                    'jugadores_filtro_cuotas' => $jugadoresFiltro,

                    'jugador_cuotas_grafico' => $jugadorCuotasSeleccionado,

                    'estado_cuotas' => [
                        [
                            'estado' => 'Vencidas',
                            'total' => $estadoGraficoTutor['vencidas'],
                        ],
                        [
                            'estado' => 'Pendientes',
                            'total' => $estadoGraficoTutor['pendientes'],
                        ],
                        [
                            'estado' => 'Pagadas',
                            'total' => $estadoGraficoTutor['pagadas'],
                        ],
                    ],

                    'total_cuotas_grafico' => array_sum($estadoGraficoTutor),

                    'total_cuotas_vencidas' => $cuotasVencidasTutor->count(),

                    'cuotas_vencidas' => $cuotasVencidasTutor,

                    'proximos_vencimientos' => $proximosVencimientos,

                    'jugadores' => $jugadores->values(),
                ];
            }
        }

        /*
        |--------------------------------------------------------------------------
        | RESPUESTA INERTIA
        |--------------------------------------------------------------------------
        */

        return Inertia::render('Dashboard', [
            'usuario' => $usuario,

            'estadisticas' => $estadisticas,

            'datosAdministrador' => $datosAdministrador,

            'datosTutor' => $datosTutor,

            'datosProfesor' => $datosProfesor,
        ]);
    }
}