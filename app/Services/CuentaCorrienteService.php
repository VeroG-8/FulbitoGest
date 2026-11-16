<?php

namespace App\Services;

use App\Models\AplicacionCredito;
use App\Models\Cuota;
use App\Models\CuotaXJugador;
use App\Models\Jugador;
use App\Models\MovimientoCuentaCorriente;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CuentaCorrienteService
{
    /**
     * Tipos de movimientos que intervienen en la cuenta corriente.
     *
     * Los importes se almacenan con signo:
     * credito_correccion: positivo.
     * debito_correccion: negativo.
     */
    private const TIPO_CREDITO = 'credito_correccion';

    private const TIPO_DEBITO = 'debito_correccion';

    /**
     * Obtiene el saldo disponible de la cuenta corriente
     * de un jugador.
     *
     * Los movimientos positivos acreditan saldo.
     * Los movimientos negativos descuentan saldo.
     * Las aplicaciones consumen crédito.
     * Las reversiones devuelven crédito.
     */
    public function obtenerSaldoDisponible(int $jugadorId): float
    {
        $totalMovimientos = MovimientoCuentaCorriente::query()
            ->where('jugador_id', $jugadorId)
            ->whereIn('tipo', [
                self::TIPO_CREDITO,
                self::TIPO_DEBITO,
            ])
            ->sum('monto');

        $aplicacionesNetas = AplicacionCredito::query()
            ->where('jugador_id', $jugadorId)
            ->selectRaw("
                COALESCE(
                    SUM(
                        CASE
                            WHEN tipo = 'aplicacion' THEN monto
                            WHEN tipo = 'reversion' THEN -monto
                            ELSE 0
                        END
                    ),
                    0
                ) AS total
            ")
            ->value('total');

        return round(
            (float) $totalMovimientos - (float) $aplicacionesNetas,
            2
        );
    }

    /**
     * Aplica automáticamente el crédito disponible del jugador
     * a una asignación de cuota.
     *
     * Nunca utiliza créditos pertenecientes a otro jugador.
     * No genera pagos ni recibos.
     *
     * La operación se realiza dentro de una transacción y bloquea
     * la cuenta del jugador para evitar aplicaciones simultáneas.
     */
    public function aplicarCreditoDisponible(
        CuotaXJugador $cuotaXJugador,
        ?int $userId = null
    ): float {
        return DB::transaction(function () use ($cuotaXJugador, $userId) {

            // Bloquear la cuenta individual del jugador.
            $jugador = Jugador::query()
                ->whereKey($cuotaXJugador->jugador_id)
                ->lockForUpdate()
                ->firstOrFail();

            // Bloquear nuevamente la asignación.
            $asignacion = CuotaXJugador::query()
                ->whereKey($cuotaXJugador->id)
                ->lockForUpdate()
                ->firstOrFail();

            // Verificar que la asignación pertenezca al jugador.
            if ((int) $asignacion->jugador_id !== (int) $jugador->id) {
                throw ValidationException::withMessages([
                    'asignacion' => 'La asignación no pertenece al jugador indicado.',
                ]);
            }

            if ($asignacion->estado === 'anulada') {
                throw ValidationException::withMessages([
                    'asignacion' => 'No se puede aplicar crédito a una asignación anulada.',
                ]);
            }

            $asignacion->load('cuota');

            if (!$asignacion->cuota) {
                throw ValidationException::withMessages([
                    'asignacion' => 'La asignación no tiene una cuota asociada.',
                ]);
            }

            $montoCuota = round(
                (float) $asignacion->cuota->monto,
                2
            );

            // Dinero real recibido y confirmado.
            $totalPagado = round(
                (float) $asignacion->pagos()
                    ->where('estado', 'confirmado')
                    ->sum('monto'),
                2
            );

            // Aplicaciones menos reversiones de esta asignación.
            $creditoAplicado = $this->obtenerCreditoAplicadoAsignacion(
                $asignacion->id
            );

            $saldoPendiente = round(
                $montoCuota - $totalPagado - $creditoAplicado,
                2
            );

            if ($saldoPendiente <= 0) {
                $this->actualizarEstadoAsignacion(
                    $asignacion,
                    $montoCuota,
                    $totalPagado,
                    $creditoAplicado
                );

                return 0;
            }

            // Obtener los créditos que todavía pueden utilizarse.
            $creditos = $this->obtenerCreditosDisponibles(
                $jugador->id
            );

            $saldoDisponible = round(
                array_sum(array_column($creditos, 'disponible')),
                2
            );

            if ($saldoDisponible <= 0) {
                return 0;
            }

            $montoAplicar = round(
                min($saldoDisponible, $saldoPendiente),
                2
            );

            if ($montoAplicar <= 0) {
                return 0;
            }

            $restante = $montoAplicar;

            foreach ($creditos as $credito) {

                if ($restante <= 0) {
                    break;
                }

                $montoCredito = round(
                    min($credito['disponible'], $restante),
                    2
                );

                if ($montoCredito <= 0) {
                    continue;
                }

                // Registrar el uso del crédito.
                // No se crea un Pago ni un Recibo.
                AplicacionCredito::create([
                    'jugador_id' => $jugador->id,
                    'movimiento_credito_id' => $credito['movimiento']->id,
                    'cuota_x_jugador_id' => $asignacion->id,
                    'reversion_de_id' => null,
                    'tipo' => 'aplicacion',
                    'monto' => $montoCredito,
                    'user_id' => $userId,
                    'observacion' => 'Aplicación automática de crédito a cuota.',
                ]);

                $restante = round(
                    $restante - $montoCredito,
                    2
                );
            }

            $montoRealAplicado = round(
                $montoAplicar - $restante,
                2
            );

            // Actualizar el estado con el crédito efectivamente aplicado.
            $this->actualizarEstadoAsignacion(
                $asignacion,
                $montoCuota,
                $totalPagado,
                $creditoAplicado + $montoRealAplicado
            );

            return $montoRealAplicado;
        });
    }

    /**
     * Obtiene el crédito neto aplicado a una asignación.
     *
     * Las aplicaciones suman y las reversiones restan.
     */
    private function obtenerCreditoAplicadoAsignacion(
        int $asignacionId
    ): float {
        $total = AplicacionCredito::query()
            ->where('cuota_x_jugador_id', $asignacionId)
            ->selectRaw("
                COALESCE(
                    SUM(
                        CASE
                            WHEN tipo = 'aplicacion' THEN monto
                            WHEN tipo = 'reversion' THEN -monto
                            ELSE 0
                        END
                    ),
                    0
                ) AS total
            ")
            ->value('total');

        return round(max(0, (float) $total), 2);
    }

    /**
     * Obtiene los movimientos positivos con crédito todavía disponible.
     *
     * Solo se consideran movimientos de tipo credito_correccion.
     *
     * Las aplicaciones consumen el crédito de su movimiento de origen.
     * Los débitos descuentan primero los créditos más antiguos.
     */
    private function obtenerCreditosDisponibles(int $jugadorId): array
    {
        $movimientos = MovimientoCuentaCorriente::query()
            ->where('jugador_id', $jugadorId)
            ->where('tipo', self::TIPO_CREDITO)
            ->where('monto', '>', 0)
            ->orderBy('created_at')
            ->orderBy('id')
            ->lockForUpdate()
            ->get();

        $aplicaciones = AplicacionCredito::query()
            ->where('jugador_id', $jugadorId)
            ->selectRaw("
                movimiento_credito_id,
                COALESCE(
                    SUM(
                        CASE
                            WHEN tipo = 'aplicacion' THEN monto
                            WHEN tipo = 'reversion' THEN -monto
                            ELSE 0
                        END
                    ),
                    0
                ) AS aplicado
            ")
            ->groupBy('movimiento_credito_id')
            ->get()
            ->keyBy('movimiento_credito_id');

        // Los débitos se descuentan de los créditos más antiguos.
        $debitosPendientes = abs(
            (float) MovimientoCuentaCorriente::query()
                ->where('jugador_id', $jugadorId)
                ->where('tipo', self::TIPO_DEBITO)
                ->where('monto', '<', 0)
                ->sum('monto')
        );

        $creditos = [];

        foreach ($movimientos as $movimiento) {

            $montoOriginal = round(
                (float) $movimiento->monto,
                2
            );

            $aplicado = (float) (
                $aplicaciones->get($movimiento->id)->aplicado ?? 0
            );

            // Evitar que una reversión incorrecta genere
            // más crédito que el importe originalmente acreditado.
            $disponible = round(
                min(
                    $montoOriginal,
                    max(0, $montoOriginal - $aplicado)
                ),
                2
            );

            if ($disponible <= 0) {
                continue;
            }

            $creditos[] = [
                'movimiento' => $movimiento,
                'disponible' => $disponible,
            ];
        }

        // Aplicar débitos pendientes en orden FIFO.
        foreach ($creditos as &$credito) {

            if ($debitosPendientes <= 0) {
                break;
            }

            $descuento = round(
                min(
                    $credito['disponible'],
                    $debitosPendientes
                ),
                2
            );

            $credito['disponible'] = round(
                $credito['disponible'] - $descuento,
                2
            );

            $debitosPendientes = round(
                $debitosPendientes - $descuento,
                2
            );
        }

        unset($credito);

        return array_values(array_filter(
            $creditos,
            fn ($credito) => $credito['disponible'] > 0
        ));
    }

    /**
     * Actualiza el estado de una asignación según
     * los pagos reales y el crédito aplicado.
     */
    private function actualizarEstadoAsignacion(
        CuotaXJugador $asignacion,
        float $montoCuota,
        float $totalPagado,
        float $creditoAplicado
    ): void {
        $totalCubierto = round(
            $totalPagado + $creditoAplicado,
            2
        );

        $asignacion->update([
            'estado' => $totalCubierto >= $montoCuota
                ? 'pagada'
                : 'pendiente',
        ]);
    }

    /**
     * Registra los créditos o débitos correspondientes
     * a una modificación del importe de una cuota.
     *
     * Calcula individualmente el excedente de cada jugador,
     * evitando duplicar créditos en modificaciones sucesivas.
     *
     * Si se genera crédito nuevo, también intenta aplicarlo
     * a otras asignaciones pendientes del mismo jugador.
     */
    public function registrarCorreccionCuota(
        int $cuotaId,
        float $nuevoMonto,
        int $historialId,
        ?int $userId = null
    ): void {
        if ($nuevoMonto < 0) {
            throw ValidationException::withMessages([
                'monto' => 'El importe de la cuota no puede ser negativo.',
            ]);
        }

        DB::transaction(function () use (
            $cuotaId,
            $nuevoMonto,
            $historialId,
            $userId
        ) {

            // Bloquear la cuota durante toda la corrección.
            Cuota::query()
                ->whereKey($cuotaId)
                ->lockForUpdate()
                ->firstOrFail();

            $nuevoMonto = round($nuevoMonto, 2);

            $asignaciones = CuotaXJugador::query()
                ->where('cuota_id', $cuotaId)
                ->orderBy('jugador_id')
                ->orderBy('id')
                ->get();

            foreach ($asignaciones as $asignacionOriginal) {

                // Bloquear la cuenta individual del jugador.
                $jugador = Jugador::query()
                    ->whereKey($asignacionOriginal->jugador_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $asignacion = CuotaXJugador::query()
                    ->whereKey($asignacionOriginal->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                // No generar movimientos sobre asignaciones anuladas.
                if ($asignacion->estado === 'anulada') {
                    continue;
                }

                // Total de dinero real recibido.
                $totalPagado = round(
                    (float) $asignacion->pagos()
                        ->where('estado', 'confirmado')
                        ->sum('monto'),
                    2
                );

                // Crédito que debería existir según el nuevo importe.
                $creditoObjetivo = round(
                    max(0, $totalPagado - $nuevoMonto),
                    2
                );

                // Créditos y débitos ya registrados por correcciones
                // anteriores de esta misma asignación.
                $creditoRegistrado = round(
                    (float) MovimientoCuentaCorriente::query()
                        ->where('cuota_x_jugador_id', $asignacion->id)
                        ->whereIn('tipo', [
                            self::TIPO_CREDITO,
                            self::TIPO_DEBITO,
                        ])
                        ->sum('monto'),
                    2
                );

                // Diferencia que falta registrar.
                $diferencia = round(
                    $creditoObjetivo - $creditoRegistrado,
                    2
                );

                if ($diferencia !== 0.0) {

                    MovimientoCuentaCorriente::create([
                        'jugador_id' => $jugador->id,
                        'cuota_x_jugador_id' => $asignacion->id,
                        'historial_modificacion_cuota_id' => $historialId,
                        'movimiento_origen_id' => null,
                        'user_id' => $userId,

                        'tipo' => $diferencia > 0
                            ? self::TIPO_CREDITO
                            : self::TIPO_DEBITO,

                        'monto' => $diferencia,

                        'descripcion' => $diferencia > 0
                            ? 'Crédito generado por reducción del importe de una cuota.'
                            : 'Débito generado por aumento del importe de una cuota.',
                    ]);
                }

                // Actualizar el estado de la asignación original.
                $creditoAplicado = $this->obtenerCreditoAplicadoAsignacion(
                    $asignacion->id
                );

                $this->actualizarEstadoAsignacion(
                    $asignacion,
                    $nuevoMonto,
                    $totalPagado,
                    $creditoAplicado
                );

                /*
                 * Si se generó crédito nuevo, aplicarlo a otras cuotas
                 * pendientes del mismo jugador.
                 *
                 * Se excluye la asignación que originó el crédito:
                 * ya está cubierta por los pagos reales que recibió.
                 */
                if ($diferencia > 0) {

                    $asignacionesPendientes = CuotaXJugador::query()
                        ->where('jugador_id', $jugador->id)
                        ->where('estado', 'pendiente')
                        ->where('id', '!=', $asignacion->id)
                        ->orderBy('fecha_vencimiento')
                        ->orderBy('id')
                        ->get();

                    foreach ($asignacionesPendientes as $asignacionPendiente) {

                        if ($this->obtenerSaldoDisponible($jugador->id) <= 0) {
                            break;
                        }

                        $this->aplicarCreditoDisponible(
                            $asignacionPendiente,
                            $userId
                        );
                    }
                }
            }
        });
    }
}