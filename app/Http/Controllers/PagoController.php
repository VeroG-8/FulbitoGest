<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Models\CuotaXJugador;
use App\Models\ModalidadPago;
use App\Models\Jugador;
use App\Models\AplicacionCredito;
use App\Services\ReciboService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PagoController extends Controller
{
    /**
     * Listado general de pagos.
     */
    public function index()
    {
        $pagos = Pago::with([
            'cuotaXJugador.cuota',
            'cuotaXJugador.jugador',
            'modalidadPago',
            'recibo',
        ])
            ->orderBy('fecha_pago', 'desc')
            ->get();

        return Inertia::render('Pagos/Index', [
            'pagos' => $pagos,
        ]);
    }

    /**
     * Mostrar los pagos de una cuota asignada a un jugador.
     *
     * Permite consultar el historial incluso si la asignación
     * se encuentra anulada.
     */
    public function show(CuotaXJugador $cuotaXJugador)
    {
        $cuotaXJugador->load([
            'cuota',
            'jugador',
            'pagos.modalidadPago',
            'pagos.recibo',
            'aplicacionesCredito',
        ]);

        $totalPagado = $cuotaXJugador->pagos
            ->where('estado', 'confirmado')
            ->sum(fn ($pago) => (float) $pago->monto);

        $creditoAplicado = $this->calcularCreditoAplicado(
            $cuotaXJugador->aplicacionesCredito
        );

        $montoCuota = (float) $cuotaXJugador->cuota->monto;

        $totalCubierto = round(
            $totalPagado + $creditoAplicado,
            2
        );

        $saldoPendiente = round(
            max(0, $montoCuota - $totalCubierto),
            2
        );

        return Inertia::render('Cuotas/Asignaciones/Pagos/Index', [
            'asignacion' => $cuotaXJugador,
            'totalPagado' => round($totalPagado, 2),
            'creditoAplicado' => $creditoAplicado,
            'totalCubierto' => $totalCubierto,
            'saldoPendiente' => $saldoPendiente,

            'modalidadesPago' => ModalidadPago::where('estado', true)
                ->orderBy('nombre')
                ->get(['id', 'nombre']),
        ]);
    }

    /**
     * Registrar un pago real de una cuota.
     *
     * El importe no puede superar el saldo pendiente después
     * de descontar el crédito aplicado a esa asignación.
     */
    public function store(
        Request $request,
        CuotaXJugador $cuotaXJugador,
        ReciboService $reciboService
    ) {
        $validated = $request->validate([
            'modalidad_pago_id' => [
                'required',
                'integer',
                'exists:modalidades_pago,id',
            ],
            'fecha_pago' => ['required', 'date'],
            'monto' => ['required', 'numeric', 'gt:0'],
        ]);

        DB::transaction(function () use (
            $validated,
            $cuotaXJugador,
            $reciboService
        ) {
            /*
             * Mantener el orden de bloqueos utilizado por
             * CuentaCorrienteService:
             * primero el jugador y después la asignación.
             */
            $jugador = Jugador::query()
                ->whereKey($cuotaXJugador->jugador_id)
                ->lockForUpdate()
                ->firstOrFail();

            $asignacion = CuotaXJugador::query()
                ->whereKey($cuotaXJugador->id)
                ->lockForUpdate()
                ->firstOrFail();

            // Verificar que la asignación pertenezca al jugador.
            if ((int) $asignacion->jugador_id !== (int) $jugador->id) {
                throw ValidationException::withMessages([
                    'asignacion' =>
                        'La asignación no corresponde al jugador indicado.',
                ]);
            }

            // Impedir pagos sobre asignaciones anuladas.
            if ($asignacion->estado === 'anulada') {
                throw ValidationException::withMessages([
                    'asignacion' =>
                        'No se pueden registrar pagos sobre una asignación anulada.',
                ]);
            }

            $asignacion->load('cuota');

            if (!$asignacion->cuota) {
                throw ValidationException::withMessages([
                    'asignacion' =>
                        'No se encontró la cuota correspondiente a esta asignación.',
                ]);
            }

            // Verificar que la modalidad de pago esté activa.
            $modalidadActiva = ModalidadPago::query()
                ->whereKey($validated['modalidad_pago_id'])
                ->where('estado', true)
                ->exists();

            if (!$modalidadActiva) {
                throw ValidationException::withMessages([
                    'modalidad_pago_id' =>
                        'La modalidad de pago seleccionada no está activa.',
                ]);
            }

            // Obtener el total de pagos reales confirmados.
            $totalPagado = (float) Pago::query()
                ->where('cuota_x_jugador_id', $asignacion->id)
                ->where('estado', 'confirmado')
                ->sum('monto');

            // Obtener el crédito neto aplicado a esta asignación.
            $aplicaciones = AplicacionCredito::query()
                ->where('cuota_x_jugador_id', $asignacion->id)
                ->get(['tipo', 'monto']);

            $creditoAplicado = $this->calcularCreditoAplicado(
                $aplicaciones
            );

            $montoCuota = (float) $asignacion->cuota->monto;

            // El crédito aplicado también cubre parte de la cuota.
            $totalCubierto = round(
                $totalPagado + $creditoAplicado,
                2
            );

            $saldoPendiente = round(
                max(0, $montoCuota - $totalCubierto),
                2
            );

            $monto = round((float) $validated['monto'], 2);

            if ($saldoPendiente <= 0) {
                throw ValidationException::withMessages([
                    'monto' =>
                        'Esta cuota ya está cubierta en su totalidad mediante pagos y crédito aplicado.',
                ]);
            }

            if ($monto > $saldoPendiente) {
                throw ValidationException::withMessages([
                    'monto' =>
                        'El pago no puede superar el saldo pendiente de $'
                        . number_format($saldoPendiente, 2, ',', '.')
                        . '.',
                ]);
            }

            // Registrar únicamente el dinero recibido.
            $pago = Pago::create([
                'cuota_x_jugador_id' => $asignacion->id,
                'modalidad_pago_id' => $validated['modalidad_pago_id'],
                'fecha_pago' => $validated['fecha_pago'],
                'monto' => $monto,
                'estado' => 'confirmado',
            ]);

            /*
             * El recibo corresponde exclusivamente al pago real.
             * Las aplicaciones de crédito no generan recibos.
             */
            $reciboService->generar($pago);

            // Recalcular los pagos reales confirmados.
            $totalPagado = (float) Pago::query()
                ->where('cuota_x_jugador_id', $asignacion->id)
                ->where('estado', 'confirmado')
                ->sum('monto');

            $totalCubierto = round(
                $totalPagado + $creditoAplicado,
                2
            );

            // Actualizar el estado de la asignación.
            $asignacion->update([
                'estado' => $totalCubierto >= $montoCuota
                    ? 'pagada'
                    : 'pendiente',
            ]);
        });

        return redirect()
            ->route('cuotas.asignaciones.pagos.index', $cuotaXJugador)
            ->with(
                'success',
                'El pago se registró correctamente y se generó el recibo.'
            );
    }

    /**
     * Calcular el crédito neto aplicado a una asignación.
     *
     * Las aplicaciones suman crédito y las reversiones
     * descuentan el crédito previamente aplicado.
     */
    private function calcularCreditoAplicado($aplicaciones): float
    {
        $total = $aplicaciones->sum(function ($aplicacion) {
            $monto = (float) $aplicacion->monto;

            return $aplicacion->tipo === 'reversion'
                ? -$monto
                : $monto;
        });

        return round(max(0, $total), 2);
    }
}