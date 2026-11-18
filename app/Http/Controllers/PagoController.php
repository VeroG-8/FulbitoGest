<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Models\Cuota;
use App\Models\CuotaXJugador;
use App\Models\ModalidadPago;
use App\Models\Jugador;
use App\Services\CuentaCorrienteService;
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
    public function show(
        CuotaXJugador $cuotaXJugador,
        CuentaCorrienteService $cuentaCorrienteService
    ) {
        $cuotaXJugador->load([
            'cuota',
            'jugador',
            'pagos.modalidadPago',
            'pagos.recibo',
        ]);

        if (!$cuotaXJugador->cuota) {
            abort(404, 'No se encontró la cuota correspondiente.');
        }

        // Dinero real recibido y confirmado.
        $totalPagado = round(
            (float) $cuotaXJugador->pagos
                ->where('estado', 'confirmado')
                ->sum(fn ($pago) => (float) $pago->monto),
            2
        );

        // Crédito neto aplicado a esta asignación.
        $creditoAplicado = $cuentaCorrienteService
            ->obtenerCreditoAplicadoAsignacion($cuotaXJugador->id);

        $montoCuota = round(
            (float) $cuotaXJugador->cuota->monto,
            2
        );
        // Crédito disponible total del jugador en su cuenta corriente.
        $creditoDisponible = $cuentaCorrienteService
            ->obtenerTotalCreditosDisponibles(
                $cuotaXJugador->jugador_id
            );
        $this->validarImportes([
            'totalPagado' => $totalPagado,
            'creditoAplicado' => $creditoAplicado,
            'montoCuota' => $montoCuota,
        ]);

        $totalPagadoCentavos = $this->aCentavos($totalPagado);
        $creditoAplicadoCentavos = $this->aCentavos($creditoAplicado);
        $montoCuotaCentavos = $this->aCentavos($montoCuota);

        $totalCubiertoCentavos =
            $totalPagadoCentavos + $creditoAplicadoCentavos;

        $saldoPendienteCentavos = max(
            0,
            $montoCuotaCentavos - $totalCubiertoCentavos
        );

        return Inertia::render('Cuotas/Asignaciones/Pagos/Index', [
            'asignacion' => $cuotaXJugador,
            'totalPagado' => $totalPagado,
            'creditoAplicado' => $creditoAplicado,
            'creditoDisponible' => $creditoDisponible,
            'totalCubierto' => round($totalCubiertoCentavos / 100, 2),
            'saldoPendiente' => round($saldoPendienteCentavos / 100, 2),

            'modalidadesPago' => ModalidadPago::query()
                ->where('estado', true)
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
        ReciboService $reciboService,
        CuentaCorrienteService $cuentaCorrienteService
    ) {
        $validated = $request->validate([
            'modalidad_pago_id' => [
                'required',
                'integer',
                'exists:modalidades_pago,id',
            ],
            'fecha_pago' => [
                'required',
                'date',
            ],
            'monto' => [
                'required',
                'numeric',
                'decimal:0,2',
                'gt:0',
            ],
        ]);

        DB::transaction(function () use (
            $validated,
            $cuotaXJugador,
            $reciboService,
            $cuentaCorrienteService
        ) {

            /*
             * Mantener el mismo orden de bloqueos utilizado
             * por registrarCorreccionCuota():
             *
             * 1. Cuota.
             * 2. Jugador.
             * 3. Asignación.
             */

            $cuota = Cuota::query()
                ->whereKey($cuotaXJugador->cuota_id)
                ->lockForUpdate()
                ->firstOrFail();

            $jugador = Jugador::query()
                ->whereKey($cuotaXJugador->jugador_id)
                ->lockForUpdate()
                ->firstOrFail();

            $asignacion = CuotaXJugador::query()
                ->whereKey($cuotaXJugador->id)
                ->lockForUpdate()
                ->firstOrFail();

            // Verificar que la asignación pertenezca al jugador.
            if (
                (int) $asignacion->jugador_id !==
                (int) $jugador->id
            ) {
                throw ValidationException::withMessages([
                    'asignacion' =>
                        'La asignación no corresponde al jugador indicado.',
                ]);
            }

            // Verificar que la asignación corresponda a la cuota bloqueada.
            if (
                (int) $asignacion->cuota_id !==
                (int) $cuota->id
            ) {
                throw ValidationException::withMessages([
                    'asignacion' =>
                        'La cuota no corresponde a la asignación indicada.',
                ]);
            }

            // Impedir pagos sobre asignaciones anuladas.
            if ($asignacion->estado === 'anulada') {
                throw ValidationException::withMessages([
                    'asignacion' =>
                        'No se pueden registrar pagos sobre una asignación anulada.',
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
            $totalPagado = round(
                (float) Pago::query()
                    ->where('cuota_x_jugador_id', $asignacion->id)
                    ->where('estado', 'confirmado')
                    ->sum('monto'),
                2
            );

            // Obtener el crédito neto aplicado a esta asignación.
            $creditoAplicado = $cuentaCorrienteService
                ->obtenerCreditoAplicadoAsignacion($asignacion->id);

            $montoCuota = round(
                (float) $cuota->monto,
                2
            );

            // Validar que los importes sean utilizables.
            $this->validarImportes([
                'totalPagado' => $totalPagado,
                'creditoAplicado' => $creditoAplicado,
                'montoCuota' => $montoCuota,
            ]);

            // Convertir los importes a centavos para evitar
            // diferencias de precisión en operaciones monetarias.
            $totalPagadoCentavos = $this->aCentavos($totalPagado);
            $creditoAplicadoCentavos = $this->aCentavos($creditoAplicado);
            $montoCuotaCentavos = $this->aCentavos($montoCuota);

            // Calcular cuánto de la cuota ya está cubierto.
            $totalCubiertoCentavos =
                $totalPagadoCentavos + $creditoAplicadoCentavos;

            // Calcular el saldo que todavía debe abonarse.
            $saldoPendienteCentavos = max(
                0,
                $montoCuotaCentavos - $totalCubiertoCentavos
            );

            $monto = round(
                (float) $validated['monto'],
                2
            );

            $montoCentavos = $this->aCentavos($monto);

            if ($saldoPendienteCentavos <= 0) {
                throw ValidationException::withMessages([
                    'monto' =>
                        'Esta cuota ya está cubierta en su totalidad mediante pagos y crédito aplicado.',
                ]);
            }

            // El pago no puede superar el saldo pendiente.
            if ($montoCentavos > $saldoPendienteCentavos) {
                $saldoPendiente = round(
                    $saldoPendienteCentavos / 100,
                    2
                );

                throw ValidationException::withMessages([
                    'monto' =>
                        'El pago no puede superar el saldo pendiente de $'
                        . number_format($saldoPendiente, 2, ',', '.')
                        . '.',
                ]);
            }

            // Registrar únicamente el dinero efectivamente recibido.
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
            $totalPagadoActualizado = round(
                (float) Pago::query()
                    ->where('cuota_x_jugador_id', $asignacion->id)
                    ->where('estado', 'confirmado')
                    ->sum('monto'),
                2
            );

            $this->validarImportes([
                'totalPagado' => $totalPagadoActualizado,
                'creditoAplicado' => $creditoAplicado,
                'montoCuota' => $montoCuota,
            ]);

            $totalPagadoActualizadoCentavos =
                $this->aCentavos($totalPagadoActualizado);

            $totalCubiertoActualizadoCentavos =
                $totalPagadoActualizadoCentavos + $creditoAplicadoCentavos;

            // Actualizar el estado considerando pagos y crédito.
            $asignacion->update([
                'estado' => $totalCubiertoActualizadoCentavos >= $montoCuotaCentavos
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
     * Convierte un importe a centavos enteros.
     */
    private function aCentavos(float $importe): int
    {
        if (!is_finite($importe)) {
            throw ValidationException::withMessages([
                'monto' => 'Se detectó un importe no válido.',
            ]);
        }

        return (int) round($importe * 100);
    }

    /**
     * Verifica que los importes sean numéricos, finitos y no negativos.
     */
    private function validarImportes(array $importes): void
    {
        foreach ($importes as $nombre => $importe) {
            if (
                !is_numeric($importe) ||
                !is_finite((float) $importe) ||
                (float) $importe < 0
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        "Se detectó un importe inválido en {$nombre}.",
                ]);
            }
        }
    }
}