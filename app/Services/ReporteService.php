<?php

namespace App\Services;

use App\Models\Categoria;
use App\Models\Jugador;
use App\Models\CuotaXJugador;
use App\Models\Pago;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReporteService
{
    private const CONCEPTOS_RECAUDACION = [
        'cuota_mensual',
        'inscripcion_torneo',
        'inscripcion_escuelita',
    ];

    public function obtenerDatos(
        ?int $anio = null,
        ?string $periodo = null,
        ?int $categoriaId = null,
        ?string $concepto = null
    ): array {
        $anio = $anio ?? (int) now()->year;

        $inicioAnio = Carbon::create($anio, 1, 1)->startOfDay();
        $finAnio = Carbon::create($anio, 12, 31)->endOfDay();

        // 1. Indicadores generales
        $estadisticas = [
            'anioSeleccionado' => $anio,
            'jugadoresActivos' => Jugador::where('estado', true)->count(),
            'categoriasActivas' => Categoria::where('estado', true)->count(),
        ];

        // 2. Recaudación anual de cuotas mensuales
        $estadisticas['recaudacionCuotasMensuales'] = (float) Pago::query()
            ->where('estado', 'confirmado')
            ->whereBetween('fecha_pago', [$inicioAnio, $finAnio])
            ->whereHas('cuotaXJugador', function ($query) {
                $query->whereHas('jugador', function ($jugadorQuery) {
                    $jugadorQuery->where('estado', true);
                })->whereHas('cuota', function ($cuotaQuery) {
                    $cuotaQuery->where('tipo', 'cuota_mensual');
                });
            })
            ->sum('monto');

        // 3. Recaudación anual de inscripciones a la escuelita
        $estadisticas['recaudacionInscripcionesEscuelita'] = (float) Pago::query()
            ->where('estado', 'confirmado')
            ->whereBetween('fecha_pago', [$inicioAnio, $finAnio])
            ->whereHas('cuotaXJugador', function ($query) {
                $query->whereHas('jugador', function ($jugadorQuery) {
                    $jugadorQuery->where('estado', true);
                })->whereHas('cuota', function ($cuotaQuery) {
                    $cuotaQuery->where('tipo', 'inscripcion_escuelita');
                });
            })
            ->sum('monto');

        // 4. Deuda anual de cuotas mensuales
        $estadisticas['deudaCuotasMensuales'] = $this->calcularDeudaAnual(
            $anio,
            'cuota_mensual'
        );

        // 5. Deuda anual de inscripciones a la escuelita
        $estadisticas['deudaInscripcionesEscuelita'] = $this->calcularDeudaAnual(
            $anio,
            'inscripcion_escuelita'
        );

        // Redondear importes de los indicadores anuales
        $estadisticas['recaudacionCuotasMensuales'] = round(
            $estadisticas['recaudacionCuotasMensuales'],
            2
        );

        $estadisticas['recaudacionInscripcionesEscuelita'] = round(
            $estadisticas['recaudacionInscripcionesEscuelita'],
            2
        );

        // 6. Obtener los períodos consecutivos de seis meses
        $periodosRecaudacion = $this->obtenerPeriodosRecaudacion();

        // El período seleccionado predeterminado es el último disponible.
        $ultimoPeriodo = !empty($periodosRecaudacion)
            ? end($periodosRecaudacion)
            : null;

        $periodoSeleccionado = $periodo
            ? collect($periodosRecaudacion)->firstWhere('value', $periodo)
            : null;

        if (!$periodoSeleccionado) {
            $periodoSeleccionado = $ultimoPeriodo;
        }

        // 7. Validar los filtros de recaudación
        if (!in_array($concepto, self::CONCEPTOS_RECAUDACION, true)) {
            $concepto = null;
        }

        $categoriasRecaudacion = Categoria::query()
            ->orderBy('anio')
            ->get(['id', 'anio'])
            ->map(fn ($categoria) => [
                'id' => $categoria->id,
                'anio' => $categoria->anio,
            ])
            ->values()
            ->all();

        $categoriaExiste = collect($categoriasRecaudacion)
            ->contains(fn ($categoria) => $categoria['id'] === $categoriaId);

        if (!$categoriaExiste) {
            $categoriaId = null;
        }

        // 8. Obtener recaudación mensual con los filtros seleccionados
        $meses = [];
        $totalRecaudacionMensual = 0;

        if ($periodoSeleccionado) {
            $resultadoRecaudacion = $this->obtenerRecaudacionMensual(
                $periodoSeleccionado,
                $categoriaId,
                $concepto
            );

            $meses = $resultadoRecaudacion['meses'];
            $totalRecaudacionMensual = $resultadoRecaudacion['total'];
        }

        // 9. Obtener categorías y cantidad de jugadores activos
        $categorias = Categoria::withCount([
            'jugadores as jugadores_activos' => function ($query) {
                $query->where('estado', true);
            },
        ])->get();

        // 10. Inicializar los reportes por categoría
        $reportesPorCategoria = $categorias->mapWithKeys(function ($categoria) {
            return [
                $categoria->id => [
                    'categoriaId' => $categoria->id,
                    'categoria' => (string) $categoria->anio,
                    'anio' => $categoria->anio,
                    'jugadoresActivos' => $categoria->jugadores_activos,
                    'totalRecaudado' => 0,
                    'deudaPendiente' => 0,
                ],
            ];
        })->all();

        // 11. Obtener asignaciones con sus pagos confirmados
        // Se conservan jugadores activos e inactivos para el detalle general.
        $asignaciones = CuotaXJugador::with([
            'cuota',
            'jugador.categoria',
            'pagos' => function ($query) {
                $query->where('estado', 'confirmado');
            },
        ])->get();

        // 12. Calcular recaudación y deuda por categoría
        $detalleDeudas = [];
        $cuotasVencidas = 0;
        $deudaVencidaTotal = 0;

        foreach ($asignaciones as $asignacion) {
            $jugador = $asignacion->jugador;
            $cuota = $asignacion->cuota;
            $categoria = $jugador?->categoria;

            if (!$jugador || !$cuota || !$categoria) {
                continue;
            }

            $categoriaIdReporte = $categoria->id;

            // Total de pagos confirmados de esta asignación
            $totalPagado = (float) $asignacion->pagos->sum('monto');

            // Monto original de la cuota
            $montoCuota = (float) $cuota->monto;

            // Saldo pendiente
            $saldoPendiente = max(0, $montoCuota - $totalPagado);

            // Acumular importes por categoría
            if (isset($reportesPorCategoria[$categoriaIdReporte])) {
                $reportesPorCategoria[$categoriaIdReporte]['totalRecaudado'] += $totalPagado;
                $reportesPorCategoria[$categoriaIdReporte]['deudaPendiente'] += $saldoPendiente;
            }

            // Incluir solamente asignaciones con saldo pendiente
            if ($saldoPendiente > 0) {
                $fechaVencimiento = $asignacion->fecha_vencimiento;

                $estadoVencimiento = !$fechaVencimiento
                    ? 'Sin vencimiento'
                    : ($fechaVencimiento->lt(today())
                        ? 'Vencida'
                        : 'Pendiente');

                if ($estadoVencimiento === 'Vencida') {
                    $cuotasVencidas++;
                    $deudaVencidaTotal += $saldoPendiente;
                }

                $detalleDeudas[] = [
                    'jugadorId' => $jugador->id,
                    'jugador' => $jugador->apellido . ', ' . $jugador->nombre,
                    'estadoJugador' => $jugador->estado ? 'Activo' : 'Inactivo',
                    'categoria' => (string) $categoria->anio,

                    'concepto' => match ($cuota->tipo) {
                        'cuota_mensual' => 'Cuota mensual',
                        'inscripcion_torneo' => 'Inscripción a torneo',
                        'inscripcion_escuelita' => 'Inscripción anual a la escuelita',
                        default => 'Otro concepto',
                    },

                    'cuota' => $cuota->nombre,
                    'montoCuota' => $montoCuota,
                    'totalPagado' => $totalPagado,
                    'saldoPendiente' => $saldoPendiente,
                    'fechaVencimiento' => $fechaVencimiento,
                    'estadoVencimiento' => $estadoVencimiento,
                ];
            }
        }

        // 13. Indicadores generales de vencimientos
        $estadisticas['cuotasVencidas'] = $cuotasVencidas;
        $estadisticas['deudaVencidaTotal'] = round($deudaVencidaTotal, 2);

        // 14. Preparar los datos de las categorías
        $reportesPorCategoria = collect($reportesPorCategoria)
            ->values()
            ->map(function ($reporte) {
                $reporte['totalRecaudado'] = round($reporte['totalRecaudado'], 2);
                $reporte['deudaPendiente'] = round($reporte['deudaPendiente'], 2);

                return $reporte;
            })
            ->all();

        // 15. Situación económica mensual por categoría:
        // exclusivamente cuotas mensuales y categorías activas.
        $situacionEconomicaPorCategoria = $this->obtenerSituacionEconomicaPorCategoria(
            $anio,
            $inicioAnio,
            $finAnio
        );

        // 16. Devolver todos los datos
        return [
            'estadisticas' => $estadisticas,
            'recaudacionMensual' => $meses,
            'totalRecaudacionMensual' => $totalRecaudacionMensual,

            'periodosRecaudacion' => $periodosRecaudacion,
            'periodoRecaudacionSeleccionado' => $periodoSeleccionado['value'] ?? null,
            'categoriasRecaudacion' => $categoriasRecaudacion,

            'filtrosRecaudacion' => [
                'categoriaId' => $categoriaId,
                'concepto' => $concepto,
            ],

            'reportesPorCategoria' => $reportesPorCategoria,
            'situacionEconomicaPorCategoria' => $situacionEconomicaPorCategoria,
            'detalleDeudas' => $detalleDeudas,
            'anioSeleccionado' => $anio,
            'aniosDisponibles' => range(2020, (int) now()->year),
        ];
    }

    /**
     * Genera bloques consecutivos de seis meses desde el primer
     * mes con pagos confirmados hasta el último.
     */
    private function obtenerPeriodosRecaudacion(): array
    {
        $primeraFecha = Pago::query()
            ->where('estado', 'confirmado')
            ->whereNotNull('fecha_pago')
            ->min('fecha_pago');

        $ultimaFecha = Pago::query()
            ->where('estado', 'confirmado')
            ->whereNotNull('fecha_pago')
            ->max('fecha_pago');

        if (!$primeraFecha || !$ultimaFecha) {
            return [];
        }

        $inicio = Carbon::parse($primeraFecha)->startOfMonth();
        $ultimoMes = Carbon::parse($ultimaFecha)->startOfMonth();

        $periodos = [];

        while ($inicio->lte($ultimoMes)) {
            $fin = $inicio->copy()->addMonths(5)->endOfMonth();

            $periodos[] = [
                'value' => $inicio->format('Y-m'),
                'label' => $inicio->translatedFormat('F Y')
                    . ' - '
                    . $fin->translatedFormat('F Y'),
                'inicio' => $inicio->toDateString(),
                'fin' => $fin->toDateString(),
            ];

            $inicio->addMonths(6)->startOfMonth();
        }

        return $periodos;
    }

    /**
     * Obtiene los pagos confirmados de un período de seis meses.
     *
     * Los filtros de categoría y concepto se aplican exclusivamente
     * a esta consulta.
     *
     * Devuelve los seis meses, incluso cuando no hubo pagos.
     */
    private function obtenerRecaudacionMensual(
        array $periodo,
        ?int $categoriaId = null,
        ?string $concepto = null
    ): array {
        $inicio = Carbon::parse($periodo['inicio'])->startOfDay();
        $fin = Carbon::parse($periodo['fin'])->endOfDay();

        $consulta = Pago::query()
            ->select(
                DB::raw('YEAR(fecha_pago) as anio'),
                DB::raw('MONTH(fecha_pago) as mes'),
                DB::raw('SUM(monto) as total')
            )
            ->where('estado', 'confirmado')
            ->whereBetween('fecha_pago', [$inicio, $fin]);

        if ($categoriaId !== null) {
            $consulta->whereHas(
                'cuotaXJugador.jugador.categoria',
                function ($query) use ($categoriaId) {
                    $query->where('categorias.id', $categoriaId);
                }
            );
        }

        if ($concepto !== null) {
            $consulta->whereHas(
                'cuotaXJugador.cuota',
                function ($query) use ($concepto) {
                    $query->where('tipo', $concepto);
                }
            );
        }

        $recaudacionAgrupada = $consulta
            ->groupBy(
                DB::raw('YEAR(fecha_pago)'),
                DB::raw('MONTH(fecha_pago)')
            )
            ->orderBy('anio')
            ->orderBy('mes')
            ->get()
            ->keyBy(fn ($pago) => $pago->anio . '-' . $pago->mes);

        $meses = [];
        $totalGeneral = 0;

        $fechaInicio = $inicio->copy()->startOfMonth();

        for ($i = 0; $i < 6; $i++) {
            $fecha = $fechaInicio->copy()->addMonths($i);
            $clave = $fecha->year . '-' . $fecha->month;

            $total = isset($recaudacionAgrupada[$clave])
                ? round((float) $recaudacionAgrupada[$clave]->total, 2)
                : 0;

            $meses[] = [
                'mes' => $fecha->format('m/Y'),
                'total' => $total,
            ];

            $totalGeneral += $total;
        }

        return [
            'meses' => $meses,
            'total' => round($totalGeneral, 2),
        ];
    }

    /**
     * Obtiene la recaudación y deuda de cuotas mensuales
     * agrupadas por categoría activa y mes.
     *
     * Recaudación:
     * Se agrupan los pagos confirmados según su fecha de pago.
     *
     * Deuda:
     * Se agrupan las cuotas según su período (año y mes),
     * descontando todos los pagos confirmados de cada asignación.
     *
     * Se incluyen jugadores activos e inactivos.
     */
    private function obtenerSituacionEconomicaPorCategoria(
        int $anio,
        Carbon $inicioAnio,
        Carbon $finAnio
    ): array {
        $nombresMeses = [
            1 => 'Enero',
            2 => 'Febrero',
            3 => 'Marzo',
            4 => 'Abril',
            5 => 'Mayo',
            6 => 'Junio',
            7 => 'Julio',
            8 => 'Agosto',
            9 => 'Septiembre',
            10 => 'Octubre',
            11 => 'Noviembre',
            12 => 'Diciembre',
        ];

        // Obtener únicamente categorías activas.
        $categorias = Categoria::query()
            ->where('estado', true)
            ->orderBy('anio')
            ->get(['id', 'anio']);

        // Inicializar las categorías y sus doce meses.
        $resultado = $categorias->mapWithKeys(function ($categoria) use ($nombresMeses) {
            $meses = [];

            foreach ($nombresMeses as $numeroMes => $nombreMes) {
                $meses[] = [
                    'mes' => $numeroMes,
                    'nombreMes' => $nombreMes,
                    'totalRecaudado' => 0,
                    'deudaPendiente' => 0,
                ];
            }

            return [
                $categoria->id => [
                    'categoriaId' => $categoria->id,
                    'categoria' => (string) $categoria->anio,
                    'anio' => $categoria->anio,
                    'meses' => $meses,
                ],
            ];
        })->all();

        if (empty($resultado)) {
            return [];
        }

        // Obtener asignaciones de cuotas mensuales pertenecientes
        // a jugadores de categorías activas.
        $asignaciones = CuotaXJugador::query()
            ->whereHas('cuota', function ($query) {
                $query->where('tipo', 'cuota_mensual');
            })
            ->whereHas('jugador.categoria', function ($query) {
                $query->where('estado', true);
            })
            ->with([
                'cuota',
                'jugador.categoria',
                'pagos' => function ($query) {
                    $query->where('estado', 'confirmado');
                },
            ])
            ->get();

        foreach ($asignaciones as $asignacion) {
            $cuota = $asignacion->cuota;
            $categoria = $asignacion->jugador?->categoria;

            if (!$cuota || !$categoria || !isset($resultado[$categoria->id])) {
                continue;
            }

            $categoriaId = $categoria->id;

            // Recaudación: agrupar los pagos confirmados
            // según el mes de su fecha de pago.
            foreach ($asignacion->pagos as $pago) {
                if (!$pago->fecha_pago) {
                    continue;
                }

                if ($pago->fecha_pago->between($inicioAnio, $finAnio)) {
                    $mesPago = (int) $pago->fecha_pago->month;

                    $resultado[$categoriaId]['meses'][$mesPago - 1]['totalRecaudado']
                        += (float) $pago->monto;
                }
            }

            // Deuda: agrupar según el período de la cuota.
            if (
                (int) $cuota->periodo_anio === $anio &&
                $cuota->periodo_mes !== null
            ) {
                $mesCuota = (int) $cuota->periodo_mes;

                if ($mesCuota >= 1 && $mesCuota <= 12) {
                    $montoCuota = (float) $cuota->monto;
                    $totalPagado = (float) $asignacion->pagos->sum('monto');

                    $saldoPendiente = max(
                        0,
                        $montoCuota - $totalPagado
                    );

                    $resultado[$categoriaId]['meses'][$mesCuota - 1]['deudaPendiente']
                        += $saldoPendiente;
                }
            }
        }

        // Redondear los importes de cada mes.
        return collect($resultado)
            ->values()
            ->map(function ($reporte) {
                $reporte['meses'] = collect($reporte['meses'])
                    ->map(function ($mes) {
                        $mes['totalRecaudado'] = round(
                            $mes['totalRecaudado'],
                            2
                        );

                        $mes['deudaPendiente'] = round(
                            $mes['deudaPendiente'],
                            2
                        );

                        return $mes;
                    })
                    ->all();

                return $reporte;
            })
            ->all();
    }

    /**
     * Calcula la deuda de un tipo de cuota para un año determinado.
     *
     * La deuda se calcula restando todos los pagos confirmados
     * asociados a cada asignación, sin limitar la fecha de esos pagos.
     */
    private function calcularDeudaAnual(int $anio, string $tipo): float
    {
        $asignaciones = CuotaXJugador::query()
            ->whereHas('jugador', function ($query) {
                $query->where('estado', true);
            })
            ->whereHas('cuota', function ($query) use ($anio, $tipo) {
                $query->where('tipo', $tipo)
                    ->where('periodo_anio', $anio);
            })
            ->with([
                'cuota',
                'pagos' => function ($query) {
                    $query->where('estado', 'confirmado');
                },
            ])
            ->get();

        $deuda = 0;

        foreach ($asignaciones as $asignacion) {
            $montoCuota = (float) $asignacion->cuota->monto;
            $totalPagado = (float) $asignacion->pagos->sum('monto');

            $deuda += max(0, $montoCuota - $totalPagado);
        }

        return round($deuda, 2);
    }
}
