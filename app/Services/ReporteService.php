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
    public function obtenerDatos(): array
    {
        // 1. Indicadores generales
        $estadisticas = [
            'jugadoresActivos' => Jugador::where('estado', true)->count(),

            'categoriasActivas' => Categoria::where('estado', true)->count(),

            'cuotasPagadas' => CuotaXJugador::where('estado', 'pagada')->count(),

            'cuotasPendientes' => CuotaXJugador::where('estado', 'pendiente')->count(),

            'totalRecaudado' => (float) Pago::where('estado', 'confirmado')
                ->sum('monto'),
        ];

        // 2. Fecha inicial: últimos seis meses, incluyendo el actual
        $fechaInicio = Carbon::now()->startOfMonth()->subMonths(5);

        // 3. Obtener recaudación agrupada por mes
        $recaudacionMensual = Pago::query()
            ->select(
                DB::raw('YEAR(fecha_pago) as anio'),
                DB::raw('MONTH(fecha_pago) as mes'),
                DB::raw('SUM(monto) as total')
            )
            ->where('estado', 'confirmado')
            ->where('fecha_pago', '>=', $fechaInicio)
            ->where('fecha_pago', '<=', Carbon::now())
            ->groupBy(
                DB::raw('YEAR(fecha_pago)'),
                DB::raw('MONTH(fecha_pago)')
            )
            ->orderBy('anio')
            ->orderBy('mes')
            ->get()
            ->keyBy(fn ($pago) => $pago->anio . '-' . $pago->mes);

        // 4. Preparar los seis meses, incluso si no hubo recaudación
        $meses = [];

        for ($i = 0; $i < 6; $i++) {
            $fecha = $fechaInicio->copy()->addMonths($i);
            $clave = $fecha->year . '-' . $fecha->month;

            $meses[] = [
                'mes' => $fecha->format('m/Y'),
                'total' => isset($recaudacionMensual[$clave])
                    ? round((float) $recaudacionMensual[$clave]->total, 2)
                    : 0,
            ];
        }

        // 5. Obtener categorías y cantidad de jugadores activos
        $categorias = Categoria::withCount([
            'jugadores as jugadores_activos' => function ($query) {
                $query->where('estado', true);
            },
        ])->get();

        // 6. Inicializar los reportes por categoría
        $reportesPorCategoria = $categorias->mapWithKeys(function ($categoria) {
            return [
                $categoria->id => [
                    'categoriaId' => $categoria->id,
                    'categoria' => $categoria->nombre,
                    'anio' => $categoria->anio,
                    'jugadoresActivos' => $categoria->jugadores_activos,
                    'totalRecaudado' => 0,
                    'deudaPendiente' => 0,
                ],
            ];
        })->all();

        // 7. Obtener asignaciones con sus pagos confirmados
        // Se incluyen jugadores activos e inactivos.
        $asignaciones = CuotaXJugador::with([
            'cuota',
            'jugador.categoria',
            'pagos' => function ($query) {
                $query->where('estado', 'confirmado');
            },
        ])->get();

        // 8. Calcular recaudación y deuda por categoría
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

            $categoriaId = $categoria->id;

            // Total de pagos confirmados de esta asignación
            $totalPagado = (float) $asignacion->pagos->sum('monto');

            // Monto original de la cuota
            $montoCuota = (float) $cuota->monto;

            // Saldo pendiente
            $saldoPendiente = max(0, $montoCuota - $totalPagado);

            // Si la categoría está en el reporte, acumular los importes
            if (isset($reportesPorCategoria[$categoriaId])) {
                $reportesPorCategoria[$categoriaId]['totalRecaudado'] += $totalPagado;

                $reportesPorCategoria[$categoriaId]['deudaPendiente'] += $saldoPendiente;
            }

            // 9. Incluir solamente asignaciones con saldo pendiente
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
                    'categoria' => $categoria->nombre,
                    'cuota' => $cuota->nombre,
                    'montoCuota' => $montoCuota,
                    'totalPagado' => $totalPagado,
                    'saldoPendiente' => $saldoPendiente,
                    'fechaVencimiento' => $fechaVencimiento,
                    'estadoVencimiento' => $estadoVencimiento,
                ];
            }
        }

        // 10. Agregar indicadores de vencimientos
        $estadisticas['cuotasVencidas'] = $cuotasVencidas;
        $estadisticas['deudaVencidaTotal'] = round($deudaVencidaTotal, 2);

        // 11. Preparar los datos de las categorías
        $reportesPorCategoria = collect($reportesPorCategoria)
            ->values()
            ->map(function ($reporte) {
                $reporte['totalRecaudado'] = round($reporte['totalRecaudado'], 2);
                $reporte['deudaPendiente'] = round($reporte['deudaPendiente'], 2);

                return $reporte;
            })
            ->all();

        // 12. Devolver todos los datos
        return [
            'estadisticas' => $estadisticas,
            'recaudacionMensual' => $meses,
            'reportesPorCategoria' => $reportesPorCategoria,
            'detalleDeudas' => $detalleDeudas,
        ];
    }
}
