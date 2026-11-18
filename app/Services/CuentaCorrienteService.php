<?php

namespace App\Services;

use App\Models\AplicacionCredito;
use App\Models\CompensacionCuentaCorriente;
use App\Models\Cuota;
use App\Models\CuotaXJugador;
use App\Models\Jugador;
use App\Models\MovimientoCuentaCorriente;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CuentaCorrienteService
{
    private const TIPO_CREDITO = 'credito_correccion';

    private const TIPO_DEBITO = 'debito_correccion';
    private const TIPO_COMPENSACION = 'compensacion';

    private const TIPO_REVERSION_COMPENSACION = 'reversion';
    /**
     * Obtiene el saldo contable de la cuenta corriente.
     *
     * Las compensaciones no modifican el saldo:
     * solamente identifican qué créditos absorbieron los débitos.
     */
    public function obtenerSaldoDisponible(int $jugadorId): float
    {
        $movimientos = MovimientoCuentaCorriente::query()
            ->where('jugador_id', $jugadorId)
            ->whereIn('tipo', [self::TIPO_CREDITO, self::TIPO_DEBITO])
            ->get();

        $totalMovimientosCentavos = 0;
        $totalAplicacionesCentavos = 0;

        foreach ($movimientos as $movimiento) {
            if (!is_numeric($movimiento->monto) || !is_finite((float) $movimiento->monto)) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' => 'Se encontró un movimiento con importe no válido.',
                ]);
            }

            $montoCentavos = (int) round((float) $movimiento->monto * 100);
            if (
                ($movimiento->tipo === self::TIPO_CREDITO && $montoCentavos <= 0) ||
                ($movimiento->tipo === self::TIPO_DEBITO && $montoCentavos >= 0)
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' => 'Se encontró un movimiento de crédito o débito inconsistente.',
                ]);
            }

            $totalMovimientosCentavos += $montoCentavos;

            if ($movimiento->tipo === self::TIPO_CREDITO) {
                $totalAplicacionesCentavos += $this->obtenerTotalAplicadoMovimientoCreditoCentavos(
                    $jugadorId,
                    $movimiento
                );
            }
        }

        return round(($totalMovimientosCentavos - $totalAplicacionesCentavos) / 100, 2);
    }

    /**
     * Aplica el crédito disponible de un jugador a una asignación.
     *
     * Antes de aplicar crédito, compensa los débitos pendientes.
     * Nunca utiliza crédito de otro jugador.
     * No genera pagos ni recibos.
     */
   public function aplicarCreditoDisponible(
        CuotaXJugador $cuotaXJugador,
        ?int $userId = null,
        bool $compensarDebitos = true,
        ?array &$limitesCreditoCentavos = null
    ): float {
    return DB::transaction(function () use (
        $cuotaXJugador,
        $userId,
        $compensarDebitos,
        &$limitesCreditoCentavos
    ) {

        // 1. Obtener y bloquear los registros relacionados.
        $asignacionOriginal = CuotaXJugador::query()
            ->whereKey($cuotaXJugador->id)
            ->firstOrFail();

        $cuota = Cuota::query()
            ->whereKey($asignacionOriginal->cuota_id)
            ->lockForUpdate()
            ->firstOrFail();

        $jugador = Jugador::query()
            ->whereKey($asignacionOriginal->jugador_id)
            ->lockForUpdate()
            ->firstOrFail();

        $asignacion = CuotaXJugador::query()
            ->whereKey($asignacionOriginal->id)
            ->lockForUpdate()
            ->firstOrFail();

        if (
            (int) $asignacion->jugador_id !==
            (int) $jugador->id
        ) {
            throw ValidationException::withMessages([
                'asignacion' =>
                    'La asignación no pertenece al jugador indicado.',
            ]);
        }

        if (
            (int) $asignacion->cuota_id !==
            (int) $cuota->id
        ) {
            throw ValidationException::withMessages([
                'asignacion' =>
                    'La cuota no corresponde a la asignación.',
            ]);
        }

        if ($asignacion->estado === 'anulada') {
            throw ValidationException::withMessages([
                'asignacion' =>
                    'No se puede aplicar crédito a una asignación anulada.',
            ]);
        }

        // 2. Validar el importe de la cuota.
        if (
            !is_numeric($cuota->monto) ||
            !is_finite((float) $cuota->monto) ||
            (float) $cuota->monto < 0
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'El importe de la cuota no es válido.',
            ]);
        }

        $montoCuotaCentavos = (int) round(
            (float) $cuota->monto * 100
        );

        // 3. Validar que no se combinen modos incompatibles.
        if ($compensarDebitos && $limitesCreditoCentavos !== null) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'No se pueden combinar límites de aplicación específicos con la compensación automática de débitos.',
            ]);
        }

        // 4. Compensar débitos únicamente si está habilitado.
        if ($compensarDebitos) {
            $this->compensarDebitosPendientes($jugador->id);
        }
        // 4. Obtener los pagos confirmados.
        $totalPagado = $asignacion->pagos()
            ->where('estado', 'confirmado')
            ->sum('monto');

        if (
            !is_numeric($totalPagado) ||
            !is_finite((float) $totalPagado) ||
            (float) $totalPagado < 0
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Los pagos confirmados de la asignación presentan importes inconsistentes.',
            ]);
        }

        $totalPagadoCentavos = (int) round(
            (float) $totalPagado * 100
        );

        // 5. Obtener el crédito ya aplicado a esta asignación.
        $creditoAplicado = $this->obtenerCreditoAplicadoAsignacion(
            $asignacion->id
        );

        if (
            !is_numeric($creditoAplicado) ||
            !is_finite((float) $creditoAplicado) ||
            (float) $creditoAplicado < 0
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'El crédito aplicado a la asignación presenta importes inconsistentes.',
            ]);
        }

        $creditoAplicadoCentavos = (int) round(
            (float) $creditoAplicado * 100
        );

        // 6. Calcular el saldo pendiente real.
        $saldoPendienteCentavos =
            $montoCuotaCentavos
            - $totalPagadoCentavos
            - $creditoAplicadoCentavos;

        if ($saldoPendienteCentavos <= 0) {
            $this->actualizarEstadoAsignacion(
                $asignacion,
                $montoCuotaCentavos / 100,
                $totalPagadoCentavos / 100,
                $creditoAplicadoCentavos / 100
            );

            return 0;
        }

        // 7. Obtener los créditos que todavía pueden utilizarse.
        $creditos = $this->obtenerCreditosDisponibles(
            $jugador->id
        );
        /*
        * Si se especificaron límites, solamente se podrán utilizar
        * los movimientos autorizados y hasta el importe indicado.
        */
        if ($limitesCreditoCentavos !== null) {
            $limitesValidados = [];

            foreach ($limitesCreditoCentavos as $movimientoId => $limiteCentavos) {
                if (
                    !is_numeric($movimientoId) ||
                    (int) $movimientoId <= 0 ||
                    !is_numeric($limiteCentavos) ||
                    !is_finite((float) $limiteCentavos) ||
                    (int) $limiteCentavos < 0 ||
                    (float) $limiteCentavos !== (float) (int) $limiteCentavos
                ) {
                    throw ValidationException::withMessages([
                        'cuenta_corriente' =>
                            'Los límites de crédito autorizados presentan datos inconsistentes.',
                    ]);
                }

                $limitesValidados[(int) $movimientoId] =
                    (int) $limiteCentavos;
            }

            $limitesCreditoCentavos = $limitesValidados;

            $creditos = array_values(array_filter(
                $creditos,
                function ($credito) use (&$limitesCreditoCentavos) {
                    $movimientoId = (int) $credito['movimiento']->id;

                    if (!array_key_exists($movimientoId, $limitesCreditoCentavos)) {
                        return false;
                    }

                    $disponibleCentavos = (int) round(
                        (float) $credito['disponible'] * 100
                    );

                    $limiteCentavos = $limitesCreditoCentavos[$movimientoId];

                    $credito['disponible'] = min(
                        $disponibleCentavos,
                        $limiteCentavos
                    ) / 100;

                    return $credito['disponible'] > 0;
                }
            ));

            /*
            * Aplicar los límites también al importe disponible
            * de cada movimiento.
            */
            foreach ($creditos as &$credito) {
                $movimientoId = (int) $credito['movimiento']->id;

                $disponibleCentavos = (int) round(
                    (float) $credito['disponible'] * 100
                );

                $credito['disponible'] = min(
                    $disponibleCentavos,
                    $limitesCreditoCentavos[$movimientoId]
                ) / 100;
            }

            unset($credito);
        }

        if (empty($creditos)) {
            $this->actualizarEstadoAsignacion(
                $asignacion,
                $montoCuotaCentavos / 100,
                $totalPagadoCentavos / 100,
                $creditoAplicadoCentavos / 100
            );

            return 0;
        }

        // 8. Validar y sumar los créditos disponibles en centavos.
        $saldoDisponibleCentavos = 0;

        foreach ($creditos as $credito) {
            if (
                !isset($credito['movimiento']) ||
                !isset($credito['disponible']) ||
                !is_numeric($credito['disponible']) ||
                !is_finite((float) $credito['disponible']) ||
                (float) $credito['disponible'] < 0
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'Se encontró un crédito disponible con datos inconsistentes.',
                ]);
            }

            $movimiento = $credito['movimiento'];

            if (
                !$movimiento ||
                (int) $movimiento->jugador_id !== (int) $jugador->id ||
                $movimiento->tipo !== self::TIPO_CREDITO ||
                !is_numeric($movimiento->monto) ||
                !is_finite((float) $movimiento->monto) ||
                (float) $movimiento->monto <= 0
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'Se encontró un movimiento de crédito inconsistente.',
                ]);
            }

            $disponibleCentavos = (int) round(
                (float) $credito['disponible'] * 100
            );

            $montoOriginalCentavos = (int) round(
                (float) $movimiento->monto * 100
            );

            if (
                $disponibleCentavos < 0 ||
                $disponibleCentavos > $montoOriginalCentavos
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'El saldo disponible de un crédito supera su importe original.',
                ]);
            }

            $saldoDisponibleCentavos += $disponibleCentavos;
        }

        if ($saldoDisponibleCentavos <= 0) {
            $this->actualizarEstadoAsignacion(
                $asignacion,
                $montoCuotaCentavos / 100,
                $totalPagadoCentavos / 100,
                $creditoAplicadoCentavos / 100
            );

            return 0;
        }

        // 9. Determinar cuánto crédito se puede aplicar.
        $montoAplicarCentavos = min(
            $saldoDisponibleCentavos,
            $saldoPendienteCentavos
        );

        if ($montoAplicarCentavos <= 0) {
            $this->actualizarEstadoAsignacion(
                $asignacion,
                $montoCuotaCentavos / 100,
                $totalPagadoCentavos / 100,
                $creditoAplicadoCentavos / 100
            );

            return 0;
        }

        $restanteCentavos = $montoAplicarCentavos;

        // 10. Aplicar créditos en orden FIFO.
        foreach ($creditos as $credito) {
            if ($restanteCentavos <= 0) {
                break;
            }

            $movimientoCredito = $credito['movimiento'];

            $disponibleCentavos = (int) round(
                (float) $credito['disponible'] * 100
            );

            if ($disponibleCentavos <= 0) {
                continue;
            }

            $montoCreditoCentavos = min(
                $disponibleCentavos,
                $restanteCentavos
            );

            if ($montoCreditoCentavos <= 0) {
                continue;
            }

            AplicacionCredito::create([
                'jugador_id' => $jugador->id,
                'movimiento_credito_id' => $movimientoCredito->id,
                'cuota_x_jugador_id' => $asignacion->id,
                'reversion_de_id' => null,
                'tipo' => 'aplicacion',
                'monto' => $montoCreditoCentavos / 100,
                'user_id' => $userId,
                'observacion' =>
                    'Aplicación automática de crédito a cuota.',
            ]);

            $restanteCentavos -= $montoCreditoCentavos;
            if ($limitesCreditoCentavos !== null) {
                $movimientoId = (int) $movimientoCredito->id;

                $limitesCreditoCentavos[$movimientoId] -=
                    $montoCreditoCentavos;
            }
        }

        // 11. Calcular el importe efectivamente aplicado.
        $montoRealAplicadoCentavos =
            $montoAplicarCentavos - $restanteCentavos;

        $creditoAplicadoFinalCentavos =
            $creditoAplicadoCentavos + $montoRealAplicadoCentavos;

        // 12. Actualizar el estado de la asignación.
        $this->actualizarEstadoAsignacion(
            $asignacion,
            $montoCuotaCentavos / 100,
            $totalPagadoCentavos / 100,
            $creditoAplicadoFinalCentavos / 100
        );

        return round(
            $montoRealAplicadoCentavos / 100,
            2
        );
    });
}

   /**
     * Obtiene el crédito neto aplicado a una asignación.
     *
     * Valida:
     * - Que la asignación exista.
     * - Que cada crédito pertenezca al jugador de la asignación.
     * - Que los movimientos sean créditos válidos.
     * - Que las reversiones correspondan a aplicaciones originales.
     * - Que las reversiones no superen el importe aplicado.
     */
    public function obtenerCreditoAplicadoAsignacion(int $asignacionId): float
{
    $asignacion = CuotaXJugador::query()
        ->whereKey($asignacionId)
        ->lockForUpdate()
        ->firstOrFail();

    $idsOriginales = AplicacionCredito::query()
        ->where('cuota_x_jugador_id', $asignacion->id)
        ->where('tipo', 'aplicacion')
        ->pluck('id');

    $aplicaciones = AplicacionCredito::query()
        ->where(function ($query) use ($asignacion, $idsOriginales) {
            $query->where('cuota_x_jugador_id', $asignacion->id);

            if ($idsOriginales->isNotEmpty()) {
                $query->orWhereIn('reversion_de_id', $idsOriginales);
            }
        })
        ->orderBy('id')
        ->lockForUpdate()
        ->get();

    $originales = [];
    $reversionesPorOriginal = [];
    $totalOriginalCentavos = 0;
    $movimientosPorId = [];

    foreach ($aplicaciones as $registro) {
        if (
            (int) $registro->jugador_id !== (int) $asignacion->jugador_id ||
            (int) $registro->cuota_x_jugador_id !== (int) $asignacion->id ||
            !is_numeric($registro->monto) ||
            !is_finite((float) $registro->monto)
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Una aplicación o reversión no corresponde a la asignación.',
            ]);
        }

        $montoCentavos = (int) round(
            (float) $registro->monto * 100
        );

        if ($montoCentavos <= 0) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Se encontró una aplicación o reversión con importe inválido.',
            ]);
        }

        $movimientoId = (int) $registro->movimiento_credito_id;

        if (!isset($movimientosPorId[$movimientoId])) {
            $movimientosPorId[$movimientoId] =
                MovimientoCuentaCorriente::query()
                    ->whereKey($movimientoId)
                    ->lockForUpdate()
                    ->first();
        }

        $movimiento = $movimientosPorId[$movimientoId];

        if (
            !$movimiento ||
            (int) $movimiento->jugador_id !== (int) $asignacion->jugador_id ||
            $movimiento->tipo !== self::TIPO_CREDITO ||
            !is_numeric($movimiento->monto) ||
            !is_finite((float) $movimiento->monto) ||
            (float) $movimiento->monto <= 0
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Una aplicación referencia un movimiento de crédito inválido.',
            ]);
        }

        $montoMovimientoCentavos = (int) round(
            (float) $movimiento->monto * 100
        );

        if ($registro->tipo === 'aplicacion') {
            if (
                $registro->reversion_de_id !== null ||
                $montoCentavos > $montoMovimientoCentavos
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'Una aplicación original presenta datos inconsistentes.',
                ]);
            }

            $originales[$registro->id] = [
                'monto' => $montoCentavos,
                'movimiento_id' => $movimientoId,
            ];

            $totalOriginalCentavos += $montoCentavos;

            continue;
        }

        if ($registro->tipo !== 'reversion') {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Se encontró un tipo de registro de aplicación desconocido.',
            ]);
        }

        $original = $aplicaciones->firstWhere(
            'id',
            $registro->reversion_de_id
        );

        if (
            !$original ||
            $original->tipo !== 'aplicacion' ||
            $original->reversion_de_id !== null ||
            (int) $original->jugador_id !== (int) $registro->jugador_id ||
            (int) $original->movimiento_credito_id !== (int) $registro->movimiento_credito_id ||
            (int) $original->cuota_x_jugador_id !== (int) $registro->cuota_x_jugador_id
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Se encontró una reversión sin una aplicación original válida.',
            ]);
        }

        $reversionesPorOriginal[$registro->reversion_de_id] =
            ($reversionesPorOriginal[$registro->reversion_de_id] ?? 0)
            + $montoCentavos;
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDAR LAS REVERSIONES
    |--------------------------------------------------------------------------
    */

    $totalRevertidoCentavos = 0;

    foreach ($reversionesPorOriginal as $originalId => $totalRevertido) {
        if (
            !isset($originales[$originalId]) ||
            $totalRevertido > $originales[$originalId]['monto']
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Las reversiones superan el importe de una aplicación original.',
            ]);
        }

        $totalRevertidoCentavos += $totalRevertido;
    }

    $totalNetoCentavos =
        $totalOriginalCentavos - $totalRevertidoCentavos;

    if ($totalNetoCentavos < 0) {
        throw ValidationException::withMessages([
            'cuenta_corriente' =>
                'El historial de aplicaciones presenta inconsistencias.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDAR EL CRÉDITO NETO POR MOVIMIENTO DE ORIGEN
    |--------------------------------------------------------------------------
    */

    $aplicadoPorMovimiento = [];

    foreach ($originales as $original) {
        $movimientoId = $original['movimiento_id'];

        $aplicadoPorMovimiento[$movimientoId] =
            ($aplicadoPorMovimiento[$movimientoId] ?? 0)
            + $original['monto'];
    }

    foreach ($reversionesPorOriginal as $originalId => $montoRevertido) {
        $movimientoId = $originales[$originalId]['movimiento_id'];

        $aplicadoPorMovimiento[$movimientoId] -= $montoRevertido;
    }

    foreach ($aplicadoPorMovimiento as $movimientoId => $totalAplicado) {
        $montoMovimientoCentavos = (int) round(
            (float) $movimientosPorId[$movimientoId]->monto * 100
        );

        if (
            $totalAplicado < 0 ||
            $totalAplicado > $montoMovimientoCentavos
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'El crédito aplicado supera el importe disponible de su movimiento de origen.',
            ]);
        }
    }

    return round($totalNetoCentavos / 100, 2);
}

        /**
     * Obtiene los créditos que todavía pueden utilizarse.
     *
     * Descuenta:
     * - Aplicaciones netas.
     * - Compensaciones ya registradas.
     *
     * No vuelve a descontar débitos históricos.
     */
    private function obtenerCreditosDisponibles(int $jugadorId): array
    {
        $movimientos = MovimientoCuentaCorriente::query()
            ->where('jugador_id', $jugadorId)
            ->where('tipo', self::TIPO_CREDITO)
            ->orderBy('created_at')
            ->orderBy('id')
            ->lockForUpdate()
            ->get();

        $compensaciones = $this->obtenerTotalesCompensaciones(
            $jugadorId,
            'movimiento_credito_id'
        );

        $creditos = [];

        foreach ($movimientos as $movimiento) {
            if (
                (int) $movimiento->jugador_id !== $jugadorId ||
                $movimiento->tipo !== self::TIPO_CREDITO ||
                !is_numeric($movimiento->monto) ||
                !is_finite((float) $movimiento->monto) ||
                (float) $movimiento->monto <= 0
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'Se encontró un movimiento de crédito inconsistente.',
                ]);
            }

            $montoOriginalCentavos = (int) round(
                (float) $movimiento->monto * 100
            );

            if ($montoOriginalCentavos <= 0) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'El importe original del crédito es inválido.',
                ]);
            }

            $aplicadoCentavos =
                $this->obtenerTotalAplicadoMovimientoCreditoCentavos(
                    $jugadorId,
                    $movimiento
                );

            $compensado = $compensaciones
                ->get($movimiento->id)
                ->total ?? 0;

            if (
                !is_numeric($compensado) ||
                !is_finite((float) $compensado)
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'El importe compensado del crédito es inválido.',
                ]);
            }

            $compensadoCentavos = (int) round(
                (float) $compensado * 100
            );

            if (
                $aplicadoCentavos < 0 ||
                $compensadoCentavos < 0
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'Se encontró un historial de crédito con importes inconsistentes.',
                ]);
            }

            if (
                $aplicadoCentavos + $compensadoCentavos >
                $montoOriginalCentavos
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'Las aplicaciones y compensaciones superan el importe del crédito.',
                ]);
            }

            $disponibleCentavos =
                $montoOriginalCentavos
                - $aplicadoCentavos
                - $compensadoCentavos;

            if ($disponibleCentavos <= 0) {
                continue;
            }

            $creditos[] = [
                'movimiento' => $movimiento,
                'disponible' => $disponibleCentavos / 100,
            ];
        }

        return $creditos;
    }

    public function obtenerTotalCreditosDisponibles(int $jugadorId): float
    {
        $totalCentavos = 0;

        foreach ($this->obtenerCreditosDisponibles($jugadorId) as $credito) {
            $totalCentavos += (int) round(
                (float) $credito['disponible'] * 100
            );
        }

        return round($totalCentavos / 100, 2);
    }
    /**
     * Compensa los débitos pendientes con créditos disponibles.
     *
     * FIFO:
     * - Primero se atienden los débitos más antiguos.
     * - Se utilizan primero los créditos más antiguos.
     *
     * Debe ejecutarse dentro de una transacción y con el jugador
     * bloqueado mediante lockForUpdate().
     */

    private function compensarDebitosPendientes(
        int $jugadorId,
        ?array $limitesCreditoCentavos = null
    ): void {
        /*
        * 1. Validar los límites de crédito autorizados.
        */
        if ($limitesCreditoCentavos !== null) {
            $limitesValidados = [];

            foreach ($limitesCreditoCentavos as $movimientoId => $limiteCentavos) {
                if (
                    !is_numeric($movimientoId) ||
                    (int) $movimientoId <= 0 ||
                    !is_numeric($limiteCentavos) ||
                    !is_finite((float) $limiteCentavos) ||
                    (int) $limiteCentavos < 0 ||
                    (float) $limiteCentavos !== (float) (int) $limiteCentavos
                ) {
                    throw ValidationException::withMessages([
                        'cuenta_corriente' =>
                            'Los límites de crédito autorizados presentan datos inconsistentes.',
                    ]);
                }

                $limitesValidados[(int) $movimientoId] =
                    (int) $limiteCentavos;
            }

            $limitesCreditoCentavos = $limitesValidados;

            if (empty($limitesCreditoCentavos)) {
                return;
            }
        }

        /*
        * 2. Clasificar la cuenta a la que pertenece cada movimiento.
        *
        * Los movimientos sin asignación o sin tipo identificable
        * no participan en compensaciones automáticas.
        */
        $obtenerGrupoCuenta = function ($movimiento) use ($jugadorId): ?string {
            $asignacion = $movimiento->asignacion;

            if (!$asignacion || !$asignacion->cuota) {
                return null;
            }

            if ((int) $asignacion->jugador_id !== $jugadorId) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'La asignación de un movimiento no corresponde al jugador.',
                ]);
            }

            return match ($asignacion->cuota->tipo) {
                'cuota_mensual' => 'mensual',

                'inscripcion_torneo',
                'inscripcion_escuelita' => 'inscripciones',

                default => null,
            };
        };

        /*
        * 3. Obtener los débitos pendientes.
        */
        $debitos = MovimientoCuentaCorriente::query()
            ->with('asignacion.cuota')
            ->where('jugador_id', $jugadorId)
            ->where('tipo', self::TIPO_DEBITO)
            ->where('monto', '<', 0)
            ->orderBy('created_at')
            ->orderBy('id')
            ->lockForUpdate()
            ->get();

        if ($debitos->isEmpty()) {
            return;
        }

        /*
        * 4. Obtener los créditos disponibles.
        */
        $creditosDisponibles = $this->obtenerCreditosDisponibles(
            $jugadorId
        );

        if (empty($creditosDisponibles)) {
            return;
        }

        /*
        * Cargar las asignaciones y cuotas de los créditos.
        */
        $idsCreditos = collect($creditosDisponibles)
            ->pluck('movimiento.id')
            ->filter()
            ->unique()
            ->values();

        $movimientosCredito = MovimientoCuentaCorriente::query()
            ->with('asignacion.cuota')
            ->whereIn('id', $idsCreditos)
            ->get()
            ->keyBy('id');

        foreach ($creditosDisponibles as &$creditoDisponible) {
            $idCredito = (int) $creditoDisponible['movimiento']->id;

            if (!$movimientosCredito->has($idCredito)) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'No se pudo recuperar uno de los movimientos de crédito.',
                ]);
            }

            $creditoDisponible['movimiento'] =
                $movimientosCredito->get($idCredito);
        }

        /*
        * 5. Obtener las compensaciones existentes.
        */
        $compensacionesDebitos = $this->obtenerTotalesCompensaciones(
            $jugadorId,
            'movimiento_debito_id'
        );

        /*
        * 6. Compensar respetando el grupo de cuenta.
        */
        foreach ($debitos as $debito) {
            if (
                (int) $debito->jugador_id !== $jugadorId ||
                $debito->tipo !== self::TIPO_DEBITO ||
                !is_numeric($debito->monto) ||
                !is_finite((float) $debito->monto) ||
                (float) $debito->monto >= 0
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'Se encontró un movimiento de débito inconsistente.',
                ]);
            }

            $grupoDebito = $obtenerGrupoCuenta($debito);

            // No compensar movimientos cuyo tipo de cuenta no se puede identificar.
            if ($grupoDebito === null) {
                continue;
            }

            $montoDebitoCentavos = (int) round(
                abs((float) $debito->monto) * 100
            );

            $totalCompensado = $compensacionesDebitos
                ->get($debito->id)
                ->total ?? 0;

            if (
                !is_numeric($totalCompensado) ||
                !is_finite((float) $totalCompensado)
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'El importe compensado del débito es inválido.',
                ]);
            }

            $totalCompensadoCentavos = (int) round(
                (float) $totalCompensado * 100
            );

            if (
                $montoDebitoCentavos <= 0 ||
                $totalCompensadoCentavos < 0
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'Se encontró un historial de débito con importes inconsistentes.',
                ]);
            }

            if ($totalCompensadoCentavos > $montoDebitoCentavos) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'Las compensaciones registradas superan el importe del débito.',
                ]);
            }

            $pendienteCentavos =
                $montoDebitoCentavos - $totalCompensadoCentavos;

            if ($pendienteCentavos <= 0) {
                continue;
            }

            foreach ($creditosDisponibles as &$creditoDisponible) {
                if ($pendienteCentavos <= 0) {
                    break;
                }

                $movimientoCredito = $creditoDisponible['movimiento'];

                if (
                    (int) $movimientoCredito->jugador_id !== $jugadorId ||
                    $movimientoCredito->tipo !== self::TIPO_CREDITO ||
                    !is_numeric($movimientoCredito->monto) ||
                    !is_finite((float) $movimientoCredito->monto) ||
                    (float) $movimientoCredito->monto <= 0
                ) {
                    throw ValidationException::withMessages([
                        'cuenta_corriente' =>
                            'Se encontró un movimiento de crédito inconsistente.',
                    ]);
                }

                /*
                * Solo se permiten compensaciones dentro del mismo grupo.
                */
                $grupoCredito = $obtenerGrupoCuenta($movimientoCredito);

                if (
                    $grupoCredito === null ||
                    $grupoCredito !== $grupoDebito
                ) {
                    continue;
                }

                /*
                * Respetar los límites de crédito autorizados.
                */
                if (
                    $limitesCreditoCentavos !== null &&
                    !array_key_exists(
                        (int) $movimientoCredito->id,
                        $limitesCreditoCentavos
                    )
                ) {
                    continue;
                }

                $disponibleCentavos = (int) round(
                    (float) $creditoDisponible['disponible'] * 100
                );

                if ($disponibleCentavos < 0) {
                    throw ValidationException::withMessages([
                        'cuenta_corriente' =>
                            'El saldo disponible del crédito es inválido.',
                    ]);
                }

                if ($disponibleCentavos <= 0) {
                    continue;
                }

                if ($limitesCreditoCentavos !== null) {
                    $limiteCentavos = $limitesCreditoCentavos[
                        (int) $movimientoCredito->id
                    ];

                    $disponibleCentavos = min(
                        $disponibleCentavos,
                        $limiteCentavos
                    );
                }

                if ($disponibleCentavos <= 0) {
                    continue;
                }

                $montoCompensarCentavos = min(
                    $pendienteCentavos,
                    $disponibleCentavos
                );

                if ($montoCompensarCentavos <= 0) {
                    continue;
                }

                CompensacionCuentaCorriente::create([
                    'jugador_id' => $jugadorId,
                    'movimiento_debito_id' => $debito->id,
                    'movimiento_credito_id' => $movimientoCredito->id,
                    'reversion_de_id' => null,
                    'tipo' => self::TIPO_COMPENSACION,
                    'monto' => $montoCompensarCentavos / 100,
                ]);

                $pendienteCentavos -= $montoCompensarCentavos;

                $creditoDisponible['disponible'] = (
                    (int) round(
                        (float) $creditoDisponible['disponible'] * 100
                    ) - $montoCompensarCentavos
                ) / 100;

                if ($limitesCreditoCentavos !== null) {
                    $idCredito = (int) $movimientoCredito->id;

                    $limitesCreditoCentavos[$idCredito] -=
                        $montoCompensarCentavos;
                }
            }

            unset($creditoDisponible);
        }

        unset($creditoDisponible);
    }

    /**
     * Calcula las aplicaciones netas de un movimiento de crédito en centavos.
     * Valida aplicaciones, asignaciones y reversiones, incluso cuando una
     * reversión tenga referencias alteradas pero conserve el vínculo original.
     */
    private function obtenerTotalAplicadoMovimientoCreditoCentavos(
    int $jugadorId,
    MovimientoCuentaCorriente $movimiento
): int {
    if (
        (int) $movimiento->jugador_id !== $jugadorId ||
        $movimiento->tipo !== self::TIPO_CREDITO ||
        !is_numeric($movimiento->monto) ||
        !is_finite((float) $movimiento->monto) ||
        (float) $movimiento->monto <= 0
    ) {
        throw ValidationException::withMessages([
            'cuenta_corriente' =>
                'El movimiento de crédito no es válido para calcular sus aplicaciones.',
        ]);
    }

    $montoMovimientoCentavos = (int) round(
        (float) $movimiento->monto * 100
    );

    if ($montoMovimientoCentavos <= 0) {
        throw ValidationException::withMessages([
            'cuenta_corriente' =>
                'El importe original del crédito es inválido.',
        ]);
    }

    $idsRelacionados = AplicacionCredito::query()
        ->where('movimiento_credito_id', $movimiento->id)
        ->pluck('id');

    $registros = AplicacionCredito::query()
        ->where(function ($query) use ($movimiento, $idsRelacionados) {
            $query->where('movimiento_credito_id', $movimiento->id);

            if ($idsRelacionados->isNotEmpty()) {
                $query->orWhereIn('reversion_de_id', $idsRelacionados);
            }
        })
        ->orderBy('id')
        ->lockForUpdate()
        ->get();

    $originales = [];
    $reversionesPorOriginal = [];
    $totalOriginalCentavos = 0;

    foreach ($registros as $registro) {
        if (
            (int) $registro->jugador_id !== $jugadorId ||
            (int) $registro->movimiento_credito_id !== (int) $movimiento->id ||
            !is_numeric($registro->monto) ||
            !is_finite((float) $registro->monto)
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Una aplicación o reversión no corresponde al crédito que se está reconciliando.',
            ]);
        }

        $montoCentavos = (int) round(
            (float) $registro->monto * 100
        );

        if ($montoCentavos <= 0) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Se encontró una aplicación o reversión con importe inválido.',
            ]);
        }

        $asignacion = CuotaXJugador::query()
            ->whereKey($registro->cuota_x_jugador_id)
            ->lockForUpdate()
            ->first();

        if (
            !$asignacion ||
            (int) $asignacion->jugador_id !== $jugadorId
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Una aplicación de crédito referencia una asignación que no pertenece al jugador.',
            ]);
        }

        if ($registro->tipo === 'aplicacion') {
            if ($registro->reversion_de_id !== null) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'Una aplicación original no puede tener una referencia de reversión.',
                ]);
            }

            if ($montoCentavos > $montoMovimientoCentavos) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'Una aplicación individual supera el importe del crédito original.',
                ]);
            }

            $originales[$registro->id] = [
                'monto' => $montoCentavos,
                'asignacion_id' => (int) $registro->cuota_x_jugador_id,
            ];

            $totalOriginalCentavos += $montoCentavos;

            if ($totalOriginalCentavos > $montoMovimientoCentavos) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'Las aplicaciones originales superan el importe del crédito.',
                ]);
            }

            continue;
        }

        if ($registro->tipo !== 'reversion') {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Se encontró un tipo de registro de aplicación desconocido.',
            ]);
        }

        $original = $registros->firstWhere(
            'id',
            $registro->reversion_de_id
        );

        if (
            !$original ||
            $original->tipo !== 'aplicacion' ||
            $original->reversion_de_id !== null ||
            (int) $original->jugador_id !== $jugadorId ||
            (int) $original->movimiento_credito_id !== (int) $movimiento->id ||
            (int) $original->cuota_x_jugador_id !== (int) $registro->cuota_x_jugador_id
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Una reversión no corresponde a una aplicación original válida.',
            ]);
        }

        $reversionesPorOriginal[$registro->reversion_de_id] =
            ($reversionesPorOriginal[$registro->reversion_de_id] ?? 0)
            + $montoCentavos;
    }

    $totalRevertidoCentavos = 0;

    foreach ($reversionesPorOriginal as $originalId => $totalRevertido) {
        if (
            !isset($originales[$originalId]) ||
            $totalRevertido > $originales[$originalId]['monto']
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Las reversiones superan el importe de una aplicación original.',
            ]);
        }

        $totalRevertidoCentavos += $totalRevertido;
    }

    $totalNeto = $totalOriginalCentavos - $totalRevertidoCentavos;

    if (
        $totalNeto < 0 ||
        $totalNeto > $montoMovimientoCentavos
    ) {
        throw ValidationException::withMessages([
            'cuenta_corriente' =>
                'El historial de aplicaciones supera el crédito disponible del movimiento.',
        ]);
    }

    return $totalNeto;
}

    public function reconciliarCompensacionesMovimiento(
        int $movimientoId
    ): void {
        DB::transaction(function () use ($movimientoId) {

            $movimientoOriginal = MovimientoCuentaCorriente::query()
                ->whereKey($movimientoId)
                ->firstOrFail();

            $jugador = Jugador::query()
                ->whereKey($movimientoOriginal->jugador_id)
                ->lockForUpdate()
                ->firstOrFail();

            $movimiento = MovimientoCuentaCorriente::query()
                ->whereKey($movimientoId)
                ->lockForUpdate()
                ->firstOrFail();

            if (!in_array($movimiento->tipo, [
                self::TIPO_CREDITO,
                self::TIPO_DEBITO,
            ], true)) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' => 'El movimiento no es un crédito ni un débito de corrección.',
                ]);
            }

            if ((int) $movimiento->jugador_id !== (int) $jugador->id) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' => 'El movimiento no corresponde al jugador.',
                ]);
            }

            if (
                !is_numeric($movimiento->monto) ||
                !is_finite((float) $movimiento->monto) ||
                ($movimiento->tipo === self::TIPO_CREDITO && (float) $movimiento->monto <= 0) ||
                ($movimiento->tipo === self::TIPO_DEBITO && (float) $movimiento->monto >= 0)
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' => 'El importe o el signo del movimiento no es válido.',
                ]);
            }

            $columna = $movimiento->tipo === self::TIPO_CREDITO
                ? 'movimiento_credito_id'
                : 'movimiento_debito_id';

            $compensaciones = $this->obtenerTotalesCompensaciones(
                $jugador->id,
                $columna,
                true
            );

            $totalCompensado = (float) (
                $compensaciones->get($movimiento->id)->total ?? 0
            );

            if ($movimiento->tipo === self::TIPO_CREDITO) {
                $totalAplicadoCentavos = $this->obtenerTotalAplicadoMovimientoCreditoCentavos(
                    $jugador->id,
                    $movimiento
                );

                $montoCreditoCentavos = (int) round((float) $movimiento->monto * 100);

                if ($totalAplicadoCentavos > $montoCreditoCentavos) {
                    throw ValidationException::withMessages([
                        'cuenta_corriente' => 'Las aplicaciones de crédito superan el importe del movimiento. No es posible reconciliar sus compensaciones hasta corregir ese historial.',
                    ]);
                }

                $maximoCompensableCentavos = max(
                    0,
                    $montoCreditoCentavos - $totalAplicadoCentavos
                );

                $maximoCompensable = round($maximoCompensableCentavos / 100, 2);
            } else {
                $maximoCompensable = round(
                    abs((float) $movimiento->monto),
                    2
                );
            }

            $excedente = round(
                max(0, $totalCompensado - $maximoCompensable),
                2
            );

            if ($excedente > 0) {
                $this->revertirCompensacionesExcedentes(
                    $jugador->id,
                    $columna,
                    $movimiento->id,
                    $excedente
                );
            }

            // Si quedaron débitos pendientes, se vuelven a compensar
            // con los créditos que todavía estén disponibles.
            $this->compensarDebitosPendientes($jugador->id);
        });
    }

    /**
     * Obtiene los totales netos de compensaciones de un jugador.
     *
     * Valida que:
     * - Los movimientos de débito y crédito existan.
     * - Ambos movimientos pertenezcan al jugador.
     * - El débito sea realmente un débito.
     * - El crédito sea realmente un crédito.
     * - Las reversiones correspondan a compensaciones originales.
     * - Los importes netos no sean negativos ni superen los movimientos.
     */
    private function obtenerTotalesCompensaciones(
    int $jugadorId,
    string $columna,
    bool $permitirExcedente = false
) {
    if (!in_array($columna, [
        'movimiento_debito_id',
        'movimiento_credito_id',
    ], true)) {
        throw new \InvalidArgumentException(
            'Columna de compensación no válida.'
        );
    }

    $registros = DB::table('compensaciones_cuenta_corriente as cc')
        ->leftJoin(
            'movimientos_cuenta_corriente as debito',
            'debito.id',
            '=',
            'cc.movimiento_debito_id'
        )
        ->leftJoin(
            'movimientos_cuenta_corriente as credito',
            'credito.id',
            '=',
            'cc.movimiento_credito_id'
        )
        ->leftJoin(
            'compensaciones_cuenta_corriente as original',
            'original.id',
            '=',
            'cc.reversion_de_id'
        )
        ->where(function ($query) use ($jugadorId) {
            $query->where('cc.jugador_id', $jugadorId)
                ->orWhere('debito.jugador_id', $jugadorId)
                ->orWhere('credito.jugador_id', $jugadorId)
                ->orWhere('original.jugador_id', $jugadorId);
        })
        ->select([
            'cc.id',
            'cc.jugador_id',
            'cc.movimiento_debito_id',
            'cc.movimiento_credito_id',
            'cc.reversion_de_id',
            'cc.tipo',
            'cc.monto',

            'debito.jugador_id as debito_jugador_id',
            'debito.tipo as debito_tipo',
            'debito.monto as debito_monto',

            'credito.jugador_id as credito_jugador_id',
            'credito.tipo as credito_tipo',
            'credito.monto as credito_monto',

            'original.id as original_id',
            'original.jugador_id as original_jugador_id',
            'original.movimiento_debito_id as original_debito_id',
            'original.movimiento_credito_id as original_credito_id',
            'original.tipo as original_tipo',
            'original.reversion_de_id as original_reversion_de_id',
            'original.monto as original_monto',
        ])
        ->orderBy('cc.id')
        ->lockForUpdate()
        ->get();

    $totales = [];
    $reversionesPorOriginal = [];
    $originales = [];

    /*
    |--------------------------------------------------------------------------
    | 1. VALIDAR LOS REGISTROS Y SUS MOVIMIENTOS
    |--------------------------------------------------------------------------
    */

    foreach ($registros as $registro) {
        if (
            !is_numeric($registro->monto) ||
            !is_finite((float) $registro->monto)
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Se encontró un registro de compensación con un importe no válido.',
            ]);
        }

        $montoCentavos = (int) round(
            (float) $registro->monto * 100
        );

        if (
            (int) $registro->jugador_id !== $jugadorId ||
            !in_array($registro->tipo, [
                self::TIPO_COMPENSACION,
                self::TIPO_REVERSION_COMPENSACION,
            ], true) ||
            $montoCentavos <= 0
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Se encontró un registro de compensación inconsistente.',
            ]);
        }

        // Validar el débito asociado.
        if (
            $registro->debito_jugador_id === null ||
            (int) $registro->debito_jugador_id !== $jugadorId ||
            $registro->debito_tipo !== self::TIPO_DEBITO ||
            !is_numeric($registro->debito_monto) ||
            !is_finite((float) $registro->debito_monto) ||
            (float) $registro->debito_monto >= 0
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Una compensación referencia un movimiento de débito inconsistente.',
            ]);
        }

        // Validar el crédito asociado.
        if (
            $registro->credito_jugador_id === null ||
            (int) $registro->credito_jugador_id !== $jugadorId ||
            $registro->credito_tipo !== self::TIPO_CREDITO ||
            !is_numeric($registro->credito_monto) ||
            !is_finite((float) $registro->credito_monto) ||
            (float) $registro->credito_monto <= 0
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Una compensación referencia un movimiento de crédito inconsistente.',
            ]);
        }

        $montoDebitoCentavos = (int) round(
            abs((float) $registro->debito_monto) * 100
        );

        $montoCreditoCentavos = (int) round(
            (float) $registro->credito_monto * 100
        );

        // Una compensación no puede superar ninguno de los movimientos.
        if (
            $montoCentavos > $montoDebitoCentavos ||
            $montoCentavos > $montoCreditoCentavos
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Una compensación supera el importe de alguno de sus movimientos asociados.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | 2. IDENTIFICAR COMPENSACIONES ORIGINALES
        |--------------------------------------------------------------------------
        */

        if ($registro->tipo === self::TIPO_COMPENSACION) {
            if ($registro->reversion_de_id !== null) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'Una compensación original no puede tener una referencia de reversión.',
                ]);
            }

            $originales[$registro->id] = [
                'monto' => $montoCentavos,
                'movimiento_debito_id' =>
                    (int) $registro->movimiento_debito_id,
                'movimiento_credito_id' =>
                    (int) $registro->movimiento_credito_id,
            ];
        } else {

            /*
            |--------------------------------------------------------------------------
            | 3. VALIDAR LAS REVERSIÓNES
            |--------------------------------------------------------------------------
            */

            if (
                $registro->original_id === null ||
                (int) $registro->original_jugador_id !== $jugadorId ||
                $registro->original_tipo !== self::TIPO_COMPENSACION ||
                $registro->original_reversion_de_id !== null ||
                (int) $registro->original_debito_id !==
                    (int) $registro->movimiento_debito_id ||
                (int) $registro->original_credito_id !==
                    (int) $registro->movimiento_credito_id ||
                !is_numeric($registro->original_monto) ||
                !is_finite((float) $registro->original_monto)
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'Se encontró una reversión sin una compensación original válida.',
                ]);
            }

            $montoOriginalCentavos = (int) round(
                (float) $registro->original_monto * 100
            );

            if ($montoOriginalCentavos <= 0) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'El importe de la compensación original es inválido.',
                ]);
            }

            // Acumular las reversiones por compensación original.
            $reversionesPorOriginal[$registro->original_id] =
                ($reversionesPorOriginal[$registro->original_id] ?? 0)
                + $montoCentavos;
        }

        /*
        |--------------------------------------------------------------------------
        | 4. ACUMULAR LOS TOTALES NETOS POR MOVIMIENTO
        |--------------------------------------------------------------------------
        */

        $movimientoId = (int) $registro->{$columna};

        $totales[$movimientoId] =
            ($totales[$movimientoId] ?? 0) +
            (
                $registro->tipo === self::TIPO_COMPENSACION
                    ? $montoCentavos
                    : -$montoCentavos
            );
    }

    /*
    |--------------------------------------------------------------------------
    | 5. VALIDAR QUE LAS REVERSIÓNES NO SUPEREN SUS ORIGINALES
    |--------------------------------------------------------------------------
    */

    foreach ($reversionesPorOriginal as $originalId => $totalRevertido) {
        if (
            !isset($originales[$originalId]) ||
            $totalRevertido > $originales[$originalId]['monto']
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Las reversiones superan o no corresponden a una compensación original.',
            ]);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 6. VALIDAR LOS TOTALES NETOS POR MOVIMIENTO
    |--------------------------------------------------------------------------
    */

    $resultado = [];

    foreach ($totales as $movimientoId => $totalCentavos) {
        if ($totalCentavos < 0) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'El historial de compensaciones presenta inconsistencias.',
            ]);
        }

        $movimiento = $registros->first(
            fn ($registro) =>
                (int) $registro->{$columna} === (int) $movimientoId
        );

        if (!$movimiento) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'No se pudo validar el movimiento asociado a una compensación.',
            ]);
        }

        $montoMovimiento = $columna === 'movimiento_debito_id'
            ? abs((float) $movimiento->debito_monto)
            : (float) $movimiento->credito_monto;

        if (!is_finite($montoMovimiento) || $montoMovimiento <= 0) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'El movimiento asociado a una compensación tiene un importe inválido.',
            ]);
        }

        $montoMaximoCentavos = (int) round(
            $montoMovimiento * 100
        );

        if (
            !$permitirExcedente &&
            $totalCentavos > $montoMaximoCentavos
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Las compensaciones superan el importe del movimiento original.',
            ]);
        }

        $resultado[] = (object) [
            $columna => (int) $movimientoId,
            'total' => round($totalCentavos / 100, 2),
        ];
    }

    return collect($resultado)->keyBy($columna);
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
        if ($asignacion->estado === 'anulada') {
            return;
        }

        foreach ([$montoCuota, $totalPagado, $creditoAplicado] as $importe) {
            if (!is_finite($importe)) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' => 'No se puede actualizar el estado con importes no válidos.',
                ]);
            }
        }

        $montoCuotaCentavos = (int) round($montoCuota * 100);
        $totalPagadoCentavos = (int) round($totalPagado * 100);
        $creditoAplicadoCentavos = (int) round($creditoAplicado * 100);

        if (
            $montoCuotaCentavos < 0 ||
            $totalPagadoCentavos < 0 ||
            $creditoAplicadoCentavos < 0
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' => 'No se puede actualizar el estado con importes inconsistentes.',
            ]);
        }

        $totalCubiertoCentavos = $totalPagadoCentavos + $creditoAplicadoCentavos;

        $asignacion->update([
            'estado' => $totalCubiertoCentavos >= $montoCuotaCentavos
                ? 'pagada'
                : 'pendiente',
        ]);
    }

    /**
     * Registra créditos o débitos por modificaciones de cuotas.
     *
     * Reversa créditos aplicados en exceso, registra diferencias,
     * compensa débitos y vuelve a aplicar crédito a las cuotas
     * que lo necesiten.
     */
    public function registrarCorreccionCuota(
        int $cuotaId,
        float $nuevoMonto,
        int $historialId,
        ?int $userId = null
    ): void {
        if (!is_finite($nuevoMonto) || $nuevoMonto < 0) {
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
            $cuota = Cuota::query()
                ->whereKey($cuotaId)
                ->lockForUpdate()
                ->firstOrFail();

            $historial = DB::table('historial_modificaciones_cuotas')
                ->where('id', $historialId)
                ->lockForUpdate()
                ->first();

            if (!$historial || (int) $historial->cuota_id !== $cuotaId) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'El historial de modificación no corresponde a la cuota indicada.',
                ]);
            }

            if ($historial->procesado_at !== null) {
                return;
            }

            if (
                !is_numeric($historial->monto_nuevo) ||
                !is_finite((float) $historial->monto_nuevo) ||
                (float) $historial->monto_nuevo < 0
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'El importe registrado en el historial es inválido.',
                ]);
            }

            $nuevoMonto = round($nuevoMonto, 2);
            $historialMontoNuevo = round((float) $historial->monto_nuevo, 2);

            if (
                (int) round($historialMontoNuevo * 100) !==
                (int) round($nuevoMonto * 100)
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'El importe nuevo no coincide con el registrado en el historial.',
                ]);
            }

            $asignaciones = CuotaXJugador::query()
                ->where('cuota_id', $cuotaId)
                ->orderBy('jugador_id')
                ->orderBy('id')
                ->get();

            foreach ($asignaciones as $asignacionOriginal) {
                $jugador = Jugador::query()
                    ->whereKey($asignacionOriginal->jugador_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $asignacion = CuotaXJugador::query()
                    ->whereKey($asignacionOriginal->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($asignacion->estado === 'anulada') {
                    continue;
                }

                $totalPagado = round(
                    (float) $asignacion->pagos()
                        ->where('estado', 'confirmado')
                        ->sum('monto'),
                    2
                );

                if (!is_finite($totalPagado) || $totalPagado < 0) {
                    throw ValidationException::withMessages([
                        'cuenta_corriente' =>
                            'Los pagos confirmados presentan importes inconsistentes.',
                    ]);
                }

                $totalPagadoCentavos = (int) round($totalPagado * 100);
                $nuevoMontoCentavos = (int) round($nuevoMonto * 100);

                /*
                * 1. OBTENER LOS CRÉDITOS EXTERNOS APLICADOS
                *
                * No se incluyen los créditos correctivos originados
                * por esta misma asignación.
                */
                $creditoExternoAntesCentavos =
                    $this->obtenerCreditoExternoAplicadoAsignacionCentavos(
                        $jugador->id,
                        $asignacion->id
                    );

                /*
                * 2. LIBERAR EXCLUSIVAMENTE EL EXCEDENTE EXTERNO
                *
                * Los pagos y los créditos externos son la cobertura
                * real de esta asignación.
                */
            /*
                * 2. CALCULAR EL EXCEDENTE DE CRÉDITO EXTERNO
                *
                * Primero se determina cuánto crédito externo necesita
                * realmente la asignación después de considerar los pagos.
                */

                $creditoExternoNecesarioCentavos = max(
                    0,
                    $nuevoMontoCentavos - $totalPagadoCentavos
                );

                $excedenteExternoCentavos = max(
                    0,
                    $creditoExternoAntesCentavos - $creditoExternoNecesarioCentavos
                );

                $creditoLiberadoCentavos = 0;

                $disponiblesAntesLiberacion = [];

                foreach ($this->obtenerCreditosDisponibles($jugador->id) as $credito) {
                    $movimientoId = (int) $credito['movimiento']->id;

                    $disponiblesAntesLiberacion[$movimientoId] =
                        (int) round((float) $credito['disponible'] * 100);
                }

                $limitesCreditoExternosLiberadosCentavos = [];
                $movimientoCorrectivoId = null;

                if ($excedenteExternoCentavos > 0) {
                    $aplicacionesExternas = DB::table('aplicaciones_credito as ac')
                    ->join(
                        'movimientos_cuenta_corriente as mc',
                        'mc.id',
                        '=',
                        'ac.movimiento_credito_id'
                    )
                    ->where('ac.jugador_id', $jugador->id)
                    ->where('ac.cuota_x_jugador_id', $asignacion->id)
                    ->where('ac.tipo', 'aplicacion')
                    ->whereNull('ac.reversion_de_id')
                    ->where('mc.jugador_id', $jugador->id)
                    ->whereNotNull('mc.cuota_x_jugador_id')
                    ->where('mc.cuota_x_jugador_id', '!=', $asignacion->id)
                    ->where('mc.tipo', self::TIPO_CREDITO)
                    ->select([
                        'ac.id',
                        'ac.jugador_id',
                        'ac.cuota_x_jugador_id',
                        'ac.movimiento_credito_id',
                        'ac.monto',
                    ])
                    ->orderByDesc('ac.created_at')
                    ->orderByDesc('ac.id')
                    ->lockForUpdate()
                    ->get();

                /*
                * Calcular el importe original y las reversiones
                * correspondientes a cada aplicación.
                */
                $aplicacionesPorId = [];
                $idsAplicaciones = [];

                foreach ($aplicacionesExternas as $aplicacion) {
                    if (
                        (int) $aplicacion->jugador_id !== (int) $jugador->id ||
                        (int) $aplicacion->cuota_x_jugador_id !== (int) $asignacion->id ||
                        !is_numeric($aplicacion->monto) ||
                        !is_finite((float) $aplicacion->monto)
                    ) {
                        throw ValidationException::withMessages([
                            'cuenta_corriente' =>
                                'Una aplicación de crédito externo presenta datos inconsistentes.',
                        ]);
                    }

                    $montoOriginalCentavos = (int) round(
                        (float) $aplicacion->monto * 100
                    );

                    if ($montoOriginalCentavos <= 0) {
                        throw ValidationException::withMessages([
                            'cuenta_corriente' =>
                                'Una aplicación de crédito externo tiene un importe inválido.',
                        ]);
                    }

                    $aplicacionesPorId[$aplicacion->id] = [
                        'movimiento_id' => (int) $aplicacion->movimiento_credito_id,
                        'monto' => $montoOriginalCentavos,
                        'revertido' => 0,
                    ];

                    $idsAplicaciones[] = $aplicacion->id;
                }

                /*
                * Obtener las reversiones ya registradas para esas aplicaciones.
                */
                $reversionesExternas = empty($idsAplicaciones)
                    ? collect()
                    : DB::table('aplicaciones_credito')
                        ->whereIn('reversion_de_id', $idsAplicaciones)
                        ->lockForUpdate()
                        ->get();

                /*
                * Validar y acumular las reversiones por aplicación original.
                */
                foreach ($reversionesExternas as $reversion) {
                    $originalId = $reversion->reversion_de_id;

                    if (!isset($aplicacionesPorId[$originalId])) {
                        throw ValidationException::withMessages([
                            'cuenta_corriente' =>
                                'Se encontró una reversión que no corresponde a una aplicación externa válida.',
                        ]);
                    }

                    $original = $aplicacionesExternas->firstWhere(
                        'id',
                        $originalId
                    );

                    if (
                        $reversion->tipo !== 'reversion' ||
                        (int) $reversion->jugador_id !== (int) $jugador->id ||
                        (int) $reversion->cuota_x_jugador_id !== (int) $asignacion->id ||
                        (int) $reversion->movimiento_credito_id !==
                            (int) $original->movimiento_credito_id ||
                        !is_numeric($reversion->monto) ||
                        !is_finite((float) $reversion->monto)
                    ) {
                        throw ValidationException::withMessages([
                            'cuenta_corriente' =>
                                'Una reversión de crédito externo presenta datos inconsistentes.',
                        ]);
                    }

                    $montoReversionCentavos = (int) round(
                        (float) $reversion->monto * 100
                    );

                    if ($montoReversionCentavos <= 0) {
                        throw ValidationException::withMessages([
                            'cuenta_corriente' =>
                                'Una reversión de crédito externo tiene un importe inválido.',
                        ]);
                    }

                    $aplicacionesPorId[$originalId]['revertido'] +=
                        $montoReversionCentavos;
                }

                /*
                * Agrupar el crédito neto todavía aplicado por movimiento.
                *
                * Se excluyen los movimientos sin asignación de origen porque
                * el método obtenerCreditoExternoAplicadoAsignacionCentavos()
                * también los excluye actualmente.
                */
                $creditoDisponiblePorMovimiento = [];

                foreach ($aplicacionesPorId as $aplicacion) {
                    if ($aplicacion['revertido'] > $aplicacion['monto']) {
                        throw ValidationException::withMessages([
                            'cuenta_corriente' =>
                                'Las reversiones superan el importe original de una aplicación externa.',
                        ]);
                    }

                    $remanenteCentavos =
                        $aplicacion['monto'] - $aplicacion['revertido'];

                    if ($remanenteCentavos <= 0) {
                        continue;
                    }

                    $movimientoId = $aplicacion['movimiento_id'];

                    $creditoDisponiblePorMovimiento[$movimientoId] =
                        ($creditoDisponiblePorMovimiento[$movimientoId] ?? 0)
                        + $remanenteCentavos;
                }

                /*
                * Liberar únicamente el importe neto disponible de cada movimiento.
                */
                foreach ($creditoDisponiblePorMovimiento as $movimientoCreditoId => $disponibleCentavos) {
                    if ($creditoLiberadoCentavos >= $excedenteExternoCentavos) {
                        break;
                    }

                    if ($disponibleCentavos <= 0) {
                        continue;
                    }

                    $pendienteLiberarCentavos =
                        $excedenteExternoCentavos - $creditoLiberadoCentavos;

                    $montoSolicitadoCentavos = min(
                        $pendienteLiberarCentavos,
                        $disponibleCentavos
                    );

                    if ($montoSolicitadoCentavos <= 0) {
                        continue;
                    }

                    $montoLiberado = $this->revertirCreditoAplicadoExcedente(
                        $jugador->id,
                        $asignacion->id,
                        $montoSolicitadoCentavos / 100,
                        $userId,
                        (int) $movimientoCreditoId,
                        true
                    );

                    $montoLiberadoCentavos = (int) round(
                        $montoLiberado * 100
                    );

                    if ($montoLiberadoCentavos !== $montoSolicitadoCentavos) {
                        throw ValidationException::withMessages([
                            'cuenta_corriente' =>
                                'La liberación de crédito externo no coincide con el importe disponible del movimiento.',
                        ]);
                    }

                    $creditoLiberadoCentavos += $montoLiberadoCentavos;
                }

                if ($creditoLiberadoCentavos !== $excedenteExternoCentavos) {
                    throw ValidationException::withMessages([
                        'cuenta_corriente' =>
                            'No se pudo liberar completamente el excedente de crédito externo. El crédito disponible no coincide con el excedente calculado.',
                    ]);
                }
            }
            $disponiblesDespuesLiberacion = [];

            foreach ($this->obtenerCreditosDisponibles($jugador->id) as $credito) {
                $movimientoId = (int) $credito['movimiento']->id;

                $disponiblesDespuesLiberacion[$movimientoId] =
                    (int) round((float) $credito['disponible'] * 100);
            }

            foreach ($disponiblesDespuesLiberacion as $movimientoId => $disponibleDespues) {
                $disponibleAntes = $disponiblesAntesLiberacion[$movimientoId] ?? 0;

                $incrementoCentavos = max(
                    0,
                    $disponibleDespues - $disponibleAntes
                );

                if ($incrementoCentavos > 0) {
                    $limitesCreditoExternosLiberadosCentavos[$movimientoId] =
                        $incrementoCentavos;
                }
            }
                /*
                * 3. RECALCULAR LOS CRÉDITOS EXTERNOS
                *
                * Se consultan nuevamente después de las liberaciones.
                */
                $creditoExternoDespuesCentavos =
                    $this->obtenerCreditoExternoAplicadoAsignacionCentavos(
                        $jugador->id,
                        $asignacion->id
                    );

                /*
                * 4. CALCULAR LA POSICIÓN CORRECTIVA OBJETIVO
                *
                * IMPORTANTE:
                * No se suman los créditos correctivos propios.
                * Estos ya están representados en los movimientos
                * correctivos históricos de esta asignación.
                */
                $creditoObjetivoCentavos =
                    $totalPagadoCentavos
                    + $creditoExternoDespuesCentavos
                    - $nuevoMontoCentavos;

                /*
                * 5. OBTENER LOS MOVIMIENTOS CORRECTIVOS PROPIOS
                */
                $movimientosCorreccion = MovimientoCuentaCorriente::query()
                    ->where('cuota_x_jugador_id', $asignacion->id)
                    ->whereIn('tipo', [
                        self::TIPO_CREDITO,
                        self::TIPO_DEBITO,
                    ])
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->get();

                $correccionNetaCentavos = 0;

                foreach ($movimientosCorreccion as $movimientoExistente) {
                    if (
                        (int) $movimientoExistente->jugador_id !==
                            (int) $jugador->id ||
                        !is_numeric($movimientoExistente->monto) ||
                        !is_finite((float) $movimientoExistente->monto)
                    ) {
                        throw ValidationException::withMessages([
                            'cuenta_corriente' =>
                                'Un movimiento correctivo presenta datos inconsistentes.',
                        ]);
                    }

                    $montoCentavos = (int) round(
                        (float) $movimientoExistente->monto * 100
                    );

                    if (
                        (
                            $movimientoExistente->tipo === self::TIPO_CREDITO &&
                            $montoCentavos <= 0
                        ) ||
                        (
                            $movimientoExistente->tipo === self::TIPO_DEBITO &&
                            $montoCentavos >= 0
                        )
                    ) {
                        throw ValidationException::withMessages([
                            'cuenta_corriente' =>
                                'Un movimiento correctivo tiene un importe o signo inválido.',
                        ]);
                    }

                    $correccionNetaCentavos += $montoCentavos;
                }

                $diferenciaCentavos =
                    $creditoObjetivoCentavos - $correccionNetaCentavos;

                /*
                * 6. IDENTIFICAR LOS CRÉDITOS PROPIOS QUE SIGUEN VIGENTES
                *
                * Los débitos neutralizan créditos anteriores.
                * Si un débito supera los créditos disponibles, el excedente
                * también reduce los créditos correctivos que se generen después.
                */
                $creditosPropiosDisponibles = [];
                $debitoCorrectivoPendienteCentavos = 0;

                foreach ($movimientosCorreccion as $movimiento) {
                    $montoCentavos = (int) round(
                        (float) $movimiento->monto * 100
                    );

                    if ($movimiento->tipo === self::TIPO_CREDITO) {
                        $creditoNuevoCentavos = $montoCentavos;

                        // Primero se absorben los débitos anteriores pendientes.
                        $absorcionCentavos = min(
                            $creditoNuevoCentavos,
                            $debitoCorrectivoPendienteCentavos
                        );

                        $creditoNuevoCentavos -= $absorcionCentavos;
                        $debitoCorrectivoPendienteCentavos -= $absorcionCentavos;

                        if ($creditoNuevoCentavos > 0) {
                            $creditosPropiosDisponibles[$movimiento->id] =
                                $creditoNuevoCentavos;
                        }

                        continue;
                    }

                    if ($movimiento->tipo === self::TIPO_DEBITO) {
                        $debitoPendienteCentavos = abs($montoCentavos);

                        // Los débitos neutralizan primero los créditos más recientes.
                        foreach (
                            array_reverse(array_keys($creditosPropiosDisponibles))
                            as $creditoId
                        ) {
                            if ($debitoPendienteCentavos <= 0) {
                                break;
                            }

                            $creditoRestanteCentavos =
                                $creditosPropiosDisponibles[$creditoId];

                            $compensacionCentavos = min(
                                $debitoPendienteCentavos,
                                $creditoRestanteCentavos
                            );

                            $creditosPropiosDisponibles[$creditoId] -=
                                $compensacionCentavos;

                            $debitoPendienteCentavos -= $compensacionCentavos;

                            if ($creditosPropiosDisponibles[$creditoId] === 0) {
                                unset($creditosPropiosDisponibles[$creditoId]);
                            }
                        }

                        // Si sobró débito, queda pendiente para créditos posteriores.
                        $debitoCorrectivoPendienteCentavos +=
                            $debitoPendienteCentavos;
                    }
                }

                $creditosPropiosDisponibles = array_filter(
                    $creditosPropiosDisponibles,
                    fn ($monto) => $monto > 0
                );

                /*
                * 7. CALCULAR CUÁNTO CRÉDITO PROPIO HAY QUE NEUTRALIZAR
                *
                * Ejemplo:
                * Corrección anterior: +20.
                * Nueva posición objetivo: -20.
                * Diferencia: -40.
                *
                * Solo hay que liberar los +20 de crédito anterior.
                * Los otros -20 representan deuda nueva.
                */
                $totalCreditoPropioVigenteCentavos = array_sum(
                    $creditosPropiosDisponibles
                );

                $creditoPropioANeutralizarCentavos = min(
                    $totalCreditoPropioVigenteCentavos,
                    max(
                        0,
                        $correccionNetaCentavos -
                        max(0, $creditoObjetivoCentavos)
                    )
                );

                /*
                * 8. LIBERAR APLICACIONES Y COMPENSACIONES
                *
                * Se trabaja con cada movimiento de crédito exacto.
                * No se tocan aplicaciones ni compensaciones ajenas.
                */
                foreach (
                    array_reverse(array_keys($creditosPropiosDisponibles))
                    as $creditoId
                ) {
                    if ($creditoPropioANeutralizarCentavos <= 0) {
                        break;
                    }

                    $credito = $movimientosCorreccion->firstWhere(
                        'id',
                        $creditoId
                    );

                    if (!$credito) {
                        throw ValidationException::withMessages([
                            'cuenta_corriente' =>
                                'No se encontró un movimiento correctivo propio.',
                        ]);
                    }

                    $creditoVigenteCentavos =
                        $creditosPropiosDisponibles[$creditoId];

                    $limiteCreditoCentavos = min(
                        $creditoPropioANeutralizarCentavos,
                        $creditoVigenteCentavos
                    );

                    /*
                    * Primero se revierten las aplicaciones del crédito.
                    */
                    $aplicadoCentavos =
                        $this->obtenerTotalAplicadoMovimientoCreditoCentavos(
                            $jugador->id,
                            $credito
                        );

                    $aLiberarAplicaciones = min(
                        $limiteCreditoCentavos,
                        $aplicadoCentavos
                    );

                    $revertidoAplicacionesCentavos = 0;

                    if ($aLiberarAplicaciones > 0) {
                        $montoRevertido = $this->revertirCreditoAplicadoExcedente(
                            $jugador->id,
                            $asignacion->id,
                            $aLiberarAplicaciones / 100,
                            $userId,
                            (int) $credito->id
                        );

                        $revertidoAplicacionesCentavos = (int) round(
                            $montoRevertido * 100
                        );

                        if (
                            $revertidoAplicacionesCentavos !==
                            $aLiberarAplicaciones
                        ) {
                            throw ValidationException::withMessages([
                                'cuenta_corriente' =>
                                    'La reversión de aplicaciones no coincide con el importe solicitado.',
                            ]);
                        }
                    }

                    /*
                    * Después se revierten las compensaciones que todavía
                    * sean necesarias para liberar el importe a neutralizar.
                    */
                    $pendienteLiberarCentavos = max(
                        0,
                        $limiteCreditoCentavos -
                        $revertidoAplicacionesCentavos
                    );

                    if ($pendienteLiberarCentavos > 0) {
                        $totalesCompensacion =
                            $this->obtenerTotalesCompensaciones(
                                $jugador->id,
                                'movimiento_credito_id'
                            );

                        $compensadoCentavos = (int) round(
                            (float) (
                                $totalesCompensacion
                                    ->get($credito->id)
                                    ->total ?? 0
                            ) * 100
                        );

                        if (
                            !is_finite((float) (
                                $totalesCompensacion
                                    ->get($credito->id)
                                    ->total ?? 0
                            )) ||
                            $compensadoCentavos < 0
                        ) {
                            throw ValidationException::withMessages([
                                'cuenta_corriente' =>
                                    'El importe compensado del crédito presenta inconsistencias.',
                            ]);
                        }

                        $aLiberarCompensaciones = min(
                            $pendienteLiberarCentavos,
                            $compensadoCentavos
                        );

                        if ($aLiberarCompensaciones > 0) {
                            $this->revertirCompensacionesExcedentes(
                                $jugador->id,
                                'movimiento_credito_id',
                                (int) $credito->id,
                                $aLiberarCompensaciones / 100
                            );
                        }
                    }

                    /*
                    * Se descuenta el importe que va a neutralizarse,
                    * incluso si una parte estaba todavía disponible
                    * y no necesitaba liberar aplicaciones ni compensaciones.
                    */
                    $creditoPropioANeutralizarCentavos -=
                        $limiteCreditoCentavos;
                }
                /*
                * COMPENSAR DÉBITOS PENDIENTES CON CRÉDITOS EXTERNOS LIBERADOS.
                *
                * Se utilizan exclusivamente los créditos externos liberados.
                * Los créditos correctivos propios ya fueron tratados en el paso 8.
                */
                if (!empty($limitesCreditoExternosLiberadosCentavos)) {
                    $this->compensarDebitosPendientes(
                        $jugador->id,
                        $limitesCreditoExternosLiberadosCentavos
                    );
                }

                /*
                * 9. REGISTRAR LA DIFERENCIA CORRECTIVA
                *
                * Se registra el importe completo de la diferencia.
                * No se registra solamente la parte de neutralización.
                */
                if ($diferenciaCentavos !== 0) {
                    $diferencia = $diferenciaCentavos / 100;

                    $movimientoCorrectivo = MovimientoCuentaCorriente::create([
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
                            ? 'Crédito generado por modificación del importe de una cuota.'
                            : 'Neutralización de crédito o generación de deuda por modificación del importe de una cuota.',
                    ]);

                    if ($diferenciaCentavos > 0) {
                        $movimientoCorrectivoId = (int) $movimientoCorrectivo->id;
                    }
                }

                /*
                * 10. COMPENSAR SI SE GENERÓ UN CRÉDITO NUEVO
                *
                * No se ejecuta al generar un débito: hacerlo podría
                * reutilizar créditos que se están neutralizando.
                */
                if (
                    $diferenciaCentavos > 0 &&
                    $movimientoCorrectivoId !== null
                ) {
                    $this->compensarDebitosPendientes(
                        $jugador->id,
                        [
                            $movimientoCorrectivoId => $diferenciaCentavos,
                        ]
                    );
                }
            
                /*
                * 11. ACTUALIZAR EL ESTADO DE LA ASIGNACIÓN
                */
                $creditoAplicadoActual = $this->obtenerCreditoAplicadoAsignacion(
                    $asignacion->id
                );

                $this->actualizarEstadoAsignacion(
                    $asignacion,
                    $nuevoMonto,
                    $totalPagado,
                    $creditoAplicadoActual
                );

                /*
                * 12. DISTRIBUIR CRÉDITOS DISPONIBLES
                *
                * Solo si se generó crédito nuevo o se liberó crédito externo.
                */
                $limitesCreditoDistribucionCentavos =
                    $limitesCreditoExternosLiberadosCentavos;

                // Incorporar el crédito correctivo nuevo, si existe.
                if (
                    $diferenciaCentavos > 0 &&
                    $movimientoCorrectivoId !== null
                ) {
                    $limitesCreditoDistribucionCentavos[$movimientoCorrectivoId] =
                        ($limitesCreditoDistribucionCentavos[$movimientoCorrectivoId] ?? 0)
                        + $diferenciaCentavos;
                }

                if (!empty($limitesCreditoDistribucionCentavos)) {
                    $asignacionesPendientes = CuotaXJugador::query()
                        ->where('jugador_id', $jugador->id)
                        ->where('estado', 'pendiente')
                        ->where('id', '!=', $asignacion->id)
                        ->orderBy('fecha_vencimiento')
                        ->orderBy('id')
                        ->get();

                  foreach ($asignacionesPendientes as $pendiente) {
                    $this->aplicarCreditoDisponible(
                            $pendiente,
                            $userId,
                            false,
                            $limitesCreditoDistribucionCentavos
                        );
                    }
                }
            }

            DB::table('historial_modificaciones_cuotas')
                ->where('id', $historialId)
                ->update([
                    'procesado_at' => now(),
                    'updated_at' => now(),
                ]);
        });
    }

private function obtenerCreditoExternoAplicadoAsignacionCentavos(
    int $jugadorId,
    int $asignacionId
): int {
    $aplicacionesOriginales = DB::table('aplicaciones_credito as ac')
        ->join(
            'movimientos_cuenta_corriente as mc',
            'mc.id',
            '=',
            'ac.movimiento_credito_id'
        )
        ->where('ac.jugador_id', $jugadorId)
        ->where('ac.cuota_x_jugador_id', $asignacionId)
        ->where('ac.tipo', 'aplicacion')
        ->whereNull('ac.reversion_de_id')
        ->where('mc.jugador_id', $jugadorId)
        ->whereNotNull('mc.cuota_x_jugador_id')
        ->where('mc.cuota_x_jugador_id', '!=', $asignacionId)
        ->where('mc.tipo', self::TIPO_CREDITO)
        ->select([
            'ac.id',
            'ac.jugador_id',
            'ac.cuota_x_jugador_id',
            'ac.movimiento_credito_id',
            'ac.monto',
            'mc.monto as monto_movimiento',
            'mc.tipo as tipo_movimiento',
            'mc.jugador_id as jugador_movimiento',
        ])
        ->orderBy('ac.id')
        ->lockForUpdate()
        ->get();

    if ($aplicacionesOriginales->isEmpty()) {
        return 0;
    }

    $originalesPorId = [];
    $movimientosCreditoIds = [];
    $totalOriginalCentavos = 0;

    /*
    |--------------------------------------------------------------------------
    | 1. VALIDAR LAS APLICACIONES ORIGINALES
    |--------------------------------------------------------------------------
    */

    foreach ($aplicacionesOriginales as $aplicacion) {
        if (
            (int) $aplicacion->jugador_id !== $jugadorId ||
            (int) $aplicacion->cuota_x_jugador_id !== $asignacionId ||
            (int) $aplicacion->jugador_movimiento !== $jugadorId ||
            $aplicacion->tipo_movimiento !== self::TIPO_CREDITO ||
            !is_numeric($aplicacion->monto) ||
            !is_finite((float) $aplicacion->monto) ||
            !is_numeric($aplicacion->monto_movimiento) ||
            !is_finite((float) $aplicacion->monto_movimiento)
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Una aplicación de crédito externo presenta datos inconsistentes.',
            ]);
        }

        $montoCentavos = (int) round(
            (float) $aplicacion->monto * 100
        );

        $montoMovimientoCentavos = (int) round(
            (float) $aplicacion->monto_movimiento * 100
        );

        if (
            $montoCentavos <= 0 ||
            $montoMovimientoCentavos <= 0 ||
            $montoCentavos > $montoMovimientoCentavos
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Una aplicación o su movimiento de crédito tiene un importe inválido.',
            ]);
        }

        $movimientoCreditoId = (int) $aplicacion->movimiento_credito_id;

        $originalesPorId[$aplicacion->id] = [
            'monto' => $montoCentavos,
            'revertido' => 0,
            'movimiento_id' => $movimientoCreditoId,
        ];

        $movimientosCreditoIds[$movimientoCreditoId] = true;

        $totalOriginalCentavos += $montoCentavos;
    }

    /*
    |--------------------------------------------------------------------------
    | 2. OBTENER LAS REVERSIONES DE LAS APLICACIONES
    |--------------------------------------------------------------------------
    */

    $reversiones = DB::table('aplicaciones_credito')
        ->whereIn('reversion_de_id', array_keys($originalesPorId))
        ->orderBy('id')
        ->lockForUpdate()
        ->get();

    foreach ($reversiones as $reversion) {
        $originalId = $reversion->reversion_de_id;

        if (!isset($originalesPorId[$originalId])) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Una reversión de crédito no corresponde a una aplicación externa válida.',
            ]);
        }

        $original = $aplicacionesOriginales->firstWhere(
            'id',
            $originalId
        );

        if (
            $reversion->tipo !== 'reversion' ||
            $reversion->reversion_de_id === null ||
            (int) $reversion->jugador_id !== $jugadorId ||
            (int) $reversion->cuota_x_jugador_id !== $asignacionId ||
            (int) $reversion->movimiento_credito_id !==
                (int) $original->movimiento_credito_id ||
            (int) $reversion->reversion_de_id !== (int) $original->id ||
            !is_numeric($reversion->monto) ||
            !is_finite((float) $reversion->monto)
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Una reversión de crédito externo presenta datos inconsistentes.',
            ]);
        }

        $montoReversionCentavos = (int) round(
            (float) $reversion->monto * 100
        );

        if ($montoReversionCentavos <= 0) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Una reversión de crédito externo tiene un importe inválido.',
            ]);
        }

        $originalesPorId[$originalId]['revertido'] +=
            $montoReversionCentavos;
    }

    /*
    |--------------------------------------------------------------------------
    | 3. CALCULAR EL CRÉDITO EXTERNO NETO DE ESTA ASIGNACIÓN
    |--------------------------------------------------------------------------
    */

    $totalNetoCentavos = 0;

    foreach ($originalesPorId as $original) {
        if ($original['revertido'] > $original['monto']) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Las reversiones de una aplicación externa superan su importe original.',
            ]);
        }

        $totalNetoCentavos +=
            $original['monto'] - $original['revertido'];
    }

    if (
        $totalNetoCentavos < 0 ||
        $totalNetoCentavos > $totalOriginalCentavos
    ) {
        throw ValidationException::withMessages([
            'cuenta_corriente' =>
                'El total de crédito externo aplicado presenta inconsistencias.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 4. VALIDAR EL CONSUMO TOTAL DE CADA MOVIMIENTO DE CRÉDITO
    |--------------------------------------------------------------------------
    */

    foreach (array_keys($movimientosCreditoIds) as $movimientoCreditoId) {
        $movimiento = MovimientoCuentaCorriente::query()
            ->whereKey($movimientoCreditoId)
            ->lockForUpdate()
            ->first();

        if (
            !$movimiento ||
            (int) $movimiento->jugador_id !== $jugadorId ||
            $movimiento->tipo !== self::TIPO_CREDITO ||
            !is_numeric($movimiento->monto) ||
            !is_finite((float) $movimiento->monto) ||
            (float) $movimiento->monto <= 0
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Un movimiento de crédito externo presenta datos inconsistentes.',
            ]);
        }

        $totalAplicadoMovimientoCentavos =
            $this->obtenerTotalAplicadoMovimientoCreditoCentavos(
                $jugadorId,
                $movimiento
            );

        $montoMovimientoCentavos = (int) round(
            (float) $movimiento->monto * 100
        );

        if (
            $totalAplicadoMovimientoCentavos < 0 ||
            $totalAplicadoMovimientoCentavos > $montoMovimientoCentavos
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Las aplicaciones netas superan el importe del movimiento de crédito.',
            ]);
        }
    }

    return $totalNetoCentavos;
}

    /**
     * Revierte crédito aplicado en exceso a una asignación.
     *
     * No elimina las aplicaciones originales.
     * Registra reversiones vinculadas a cada aplicación.
     * Revierte primero las aplicaciones más recientes.
     */
   private function revertirCreditoAplicadoExcedente(
    int $jugadorId,
    int $asignacionId,
    float $montoARevertir,
    ?int $userId = null,
    ?int $movimientoCreditoId = null,
    bool $soloAsignacionDestino = false
): float {
    // 1. Validar el importe solicitado.
    if (
        !is_finite($montoARevertir) ||
        $montoARevertir < 0
    ) {
        throw ValidationException::withMessages([
            'cuenta_corriente' =>
                'El importe a revertir no es válido.',
        ]);
    }

    $pendienteCentavos = (int) round(
        $montoARevertir * 100
    );

    if ($pendienteCentavos <= 0) {
        return 0;
    }

    // 2. Bloquear y validar la asignación de referencia.
    $asignacion = CuotaXJugador::query()
        ->whereKey($asignacionId)
        ->lockForUpdate()
        ->firstOrFail();

    if ((int) $asignacion->jugador_id !== $jugadorId) {
        throw ValidationException::withMessages([
            'cuenta_corriente' =>
                'La asignación no pertenece al jugador indicado.',
        ]);
    }

    // 3. Obtener las aplicaciones originales correspondientes.
    $aplicaciones = AplicacionCredito::query()
        ->where('jugador_id', $jugadorId)
        ->where('tipo', 'aplicacion')
        ->whereNull('reversion_de_id')
        ->when(
            $movimientoCreditoId === null || $soloAsignacionDestino,
            function ($query) use ($asignacionId) {
                $query->where(
                    'cuota_x_jugador_id',
                    $asignacionId
                );
            }
        )
        ->when(
            $movimientoCreditoId !== null,
            function ($query) use ($movimientoCreditoId) {
                $query->where(
                    'movimiento_credito_id',
                    $movimientoCreditoId
                );
            }
        )
        ->orderByDesc('created_at')
        ->orderByDesc('id')
        ->lockForUpdate()
        ->get();

    $totalRevertidoCentavos = 0;

    foreach ($aplicaciones as $aplicacion) {
        if ($pendienteCentavos <= 0) {
            break;
        }

        // 4. Validar la aplicación original.
        if (
            (int) $aplicacion->jugador_id !== $jugadorId ||
            $aplicacion->tipo !== 'aplicacion' ||
            $aplicacion->reversion_de_id !== null ||
            !is_numeric($aplicacion->monto) ||
            !is_finite((float) $aplicacion->monto)
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Una aplicación de crédito tiene datos inconsistentes.',
            ]);
        }

        $montoOriginalCentavos = (int) round(
            (float) $aplicacion->monto * 100
        );

        if ($montoOriginalCentavos <= 0) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Se encontró una aplicación original con importe inválido.',
            ]);
        }

        // 5. Validar la asignación que recibió el crédito.
        $asignacionDestino = CuotaXJugador::query()
            ->whereKey($aplicacion->cuota_x_jugador_id)
            ->lockForUpdate()
            ->first();

        if (
            !$asignacionDestino ||
            (int) $asignacionDestino->jugador_id !== $jugadorId ||
            (
                $movimientoCreditoId === null &&
                (int) $aplicacion->cuota_x_jugador_id !== $asignacionId
            ) ||
            (
                $movimientoCreditoId !== null &&
                (int) $aplicacion->movimiento_credito_id !==
                    $movimientoCreditoId
            )
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'La aplicación no corresponde al jugador o movimiento indicado.',
            ]);
        }

        // 6. Bloquear y validar el movimiento de crédito original.
        $movimiento = MovimientoCuentaCorriente::query()
            ->whereKey($aplicacion->movimiento_credito_id)
            ->lockForUpdate()
            ->firstOrFail();

        if (
            (int) $movimiento->jugador_id !== $jugadorId ||
            $movimiento->tipo !== self::TIPO_CREDITO ||
            !is_numeric($movimiento->monto) ||
            !is_finite((float) $movimiento->monto) ||
            (float) $movimiento->monto <= 0
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'El movimiento de crédito no corresponde al jugador o tiene un importe inválido.',
            ]);
        }

        $montoMovimientoCentavos = (int) round(
            (float) $movimiento->monto * 100
        );

        if (
            $montoOriginalCentavos <= 0 ||
            $montoOriginalCentavos > $montoMovimientoCentavos
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Una aplicación supera el importe de su movimiento de crédito.',
            ]);
        }

        // 7. Validar el total de aplicaciones originales del movimiento.
        $this->obtenerTotalAplicadoMovimientoCreditoCentavos(
            $jugadorId,
            $movimiento
        );

        // 8. Obtener las reversiones anteriores de esta aplicación.
        $reversiones = AplicacionCredito::query()
            ->where('reversion_de_id', $aplicacion->id)
            ->orderBy('id')
            ->lockForUpdate()
            ->get();

        $totalReversionesCentavos = 0;

        foreach ($reversiones as $reversion) {
            if (
                $reversion->tipo !== 'reversion' ||
                (int) $reversion->jugador_id !== $jugadorId ||
                (int) $reversion->cuota_x_jugador_id !==
                    (int) $aplicacion->cuota_x_jugador_id ||
                (int) $reversion->movimiento_credito_id !==
                    (int) $aplicacion->movimiento_credito_id ||
                (int) $reversion->reversion_de_id !==
                    (int) $aplicacion->id ||
                !is_numeric($reversion->monto) ||
                !is_finite((float) $reversion->monto)
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'Se encontró una reversión de aplicación inconsistente.',
                ]);
            }

            $montoReversionCentavos = (int) round(
                (float) $reversion->monto * 100
            );

            if ($montoReversionCentavos <= 0) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'El importe de una reversión de aplicación es inválido.',
                ]);
            }

            $totalReversionesCentavos +=
                $montoReversionCentavos;
        }

        if ($totalReversionesCentavos > $montoOriginalCentavos) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Las reversiones superan el importe de una aplicación original.',
            ]);
        }

        // 9. Calcular cuánto queda disponible para revertir.
        $remanenteCentavos =
            $montoOriginalCentavos - $totalReversionesCentavos;

        if ($remanenteCentavos <= 0) {
            continue;
        }

        $montoReversionCentavos = min(
            $remanenteCentavos,
            $pendienteCentavos
        );

        if ($montoReversionCentavos <= 0) {
            continue;
        }

        // 10. Registrar la reversión.
        AplicacionCredito::create([
            'jugador_id' => $jugadorId,
            'movimiento_credito_id' => $movimiento->id,
            'cuota_x_jugador_id' => $asignacionDestino->id,
            'reversion_de_id' => $aplicacion->id,
            'tipo' => 'reversion',
            'monto' => round(
                $montoReversionCentavos / 100,
                2
            ),
            'user_id' => $userId,
            'observacion' =>
                'Reversión de crédito por modificación del importe de la cuota.',
        ]);

        $pendienteCentavos -= $montoReversionCentavos;
        $totalRevertidoCentavos += $montoReversionCentavos;

        // 11. Actualizar el estado de la asignación afectada.
        $cuotaDestino = Cuota::query()
            ->whereKey($asignacionDestino->cuota_id)
            ->lockForUpdate()
            ->firstOrFail();

        if (
            !is_numeric($cuotaDestino->monto) ||
            !is_finite((float) $cuotaDestino->monto) ||
            (float) $cuotaDestino->monto < 0
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'El importe de la cuota destino es inválido.',
            ]);
        }

        $totalPagadoDestino = $asignacionDestino->pagos()
            ->where('estado', 'confirmado')
            ->sum('monto');

        if (
            !is_numeric($totalPagadoDestino) ||
            !is_finite((float) $totalPagadoDestino) ||
            (float) $totalPagadoDestino < 0
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'Los pagos de la asignación destino presentan importes inconsistentes.',
            ]);
        }

        $creditoAplicadoDestino =
            $this->obtenerCreditoAplicadoAsignacion(
                $asignacionDestino->id
            );

        $this->actualizarEstadoAsignacion(
            $asignacionDestino,
            (float) $cuotaDestino->monto,
            (float) $totalPagadoDestino,
            $creditoAplicadoDestino
        );
    }

    // 12. Comprobar que se haya revertido el importe solicitado.
    if ($pendienteCentavos > 0) {
        throw ValidationException::withMessages([
            'cuenta_corriente' =>
                'No fue posible revertir la totalidad del crédito aplicado.',
        ]);
    }

    return round(
        $totalRevertidoCentavos / 100,
        2
    );
}
    /**
     * Revierte compensaciones excedentes de un movimiento específico.
     *
     * No elimina ni modifica compensaciones originales.
     * Registra reversiones vinculadas a cada compensación original.
     *
     * Solo afecta compensaciones del jugador y del movimiento indicado.
     * Revierte primero las compensaciones más recientes.
     */
    private function revertirCompensacionesExcedentes(
        int $jugadorId,
        string $columna,
        int $movimientoId,
        float $montoARevertir
    ): float {
        // 1. Validar la columna solicitada.
        if (!in_array($columna, [
            'movimiento_debito_id',
            'movimiento_credito_id',
        ], true)) {
            throw new \InvalidArgumentException(
                'Columna de compensación no válida.'
            );
        }

        if (
            !is_finite($montoARevertir) ||
            $montoARevertir < 0
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'El importe a revertir no es válido.',
            ]);
        }

        $pendienteCentavos = (int) round(
            $montoARevertir * 100
        );

        if ($pendienteCentavos <= 0) {
            return 0;
        }

        // 2. Bloquear y validar el movimiento solicitado.
        $movimiento = MovimientoCuentaCorriente::query()
            ->whereKey($movimientoId)
            ->lockForUpdate()
            ->firstOrFail();

        $tipoEsperado = $columna === 'movimiento_credito_id'
            ? self::TIPO_CREDITO
            : self::TIPO_DEBITO;

        if (
            (int) $movimiento->jugador_id !== $jugadorId ||
            $movimiento->tipo !== $tipoEsperado ||
            !is_numeric($movimiento->monto) ||
            !is_finite((float) $movimiento->monto) ||
            (
                $columna === 'movimiento_credito_id' &&
                (float) $movimiento->monto <= 0
            ) ||
            (
                $columna === 'movimiento_debito_id' &&
                (float) $movimiento->monto >= 0
            )
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'El movimiento indicado no corresponde al jugador o tiene un importe inválido.',
            ]);
        }

        // 3. Validar el total neto compensado del movimiento.
        $totalesCompensaciones = $this->obtenerTotalesCompensaciones(
            $jugadorId,
            $columna
        );

        $registroTotal = $totalesCompensaciones->get($movimientoId);

        $totalCompensadoCentavos = $registroTotal
            ? (int) round((float) $registroTotal->total * 100)
            : 0;

        if (
            $totalCompensadoCentavos < 0 ||
            $pendienteCentavos > $totalCompensadoCentavos
        ) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'El importe solicitado supera las compensaciones netas disponibles del movimiento.',
            ]);
        }

        // 4. Obtener exclusivamente compensaciones originales
        // relacionadas con el movimiento indicado.
        $compensaciones = CompensacionCuentaCorriente::query()
            ->where('jugador_id', $jugadorId)
            ->where($columna, $movimientoId)
            ->where('tipo', self::TIPO_COMPENSACION)
            ->whereNull('reversion_de_id')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->lockForUpdate()
            ->get();

        $totalRevertidoCentavos = 0;

        foreach ($compensaciones as $compensacion) {
            if ($pendienteCentavos <= 0) {
                break;
            }

            // 5. Validar la compensación original.
            if (
                (int) $compensacion->jugador_id !== $jugadorId ||
                $compensacion->tipo !== self::TIPO_COMPENSACION ||
                $compensacion->reversion_de_id !== null ||
                (int) $compensacion->{$columna} !== $movimientoId ||
                !is_numeric($compensacion->monto) ||
                !is_finite((float) $compensacion->monto)
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'Se encontró una compensación original inconsistente.',
                ]);
            }

            $montoOriginalCentavos = (int) round(
                (float) $compensacion->monto * 100
            );

            if ($montoOriginalCentavos <= 0) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'El importe de una compensación original es inválido.',
                ]);
            }

            // 6. Bloquear y validar los dos movimientos asociados.
            $debito = MovimientoCuentaCorriente::query()
                ->whereKey($compensacion->movimiento_debito_id)
                ->lockForUpdate()
                ->first();

            $credito = MovimientoCuentaCorriente::query()
                ->whereKey($compensacion->movimiento_credito_id)
                ->lockForUpdate()
                ->first();

            if (
                !$debito ||
                !$credito ||
                (int) $debito->jugador_id !== $jugadorId ||
                (int) $credito->jugador_id !== $jugadorId ||
                $debito->tipo !== self::TIPO_DEBITO ||
                $credito->tipo !== self::TIPO_CREDITO ||
                !is_numeric($debito->monto) ||
                !is_finite((float) $debito->monto) ||
                !is_numeric($credito->monto) ||
                !is_finite((float) $credito->monto) ||
                (float) $debito->monto >= 0 ||
                (float) $credito->monto <= 0
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'Una compensación referencia movimientos inválidos.',
                ]);
            }

            $debitoCentavos = (int) round(
                abs((float) $debito->monto) * 100
            );

            $creditoCentavos = (int) round(
                (float) $credito->monto * 100
            );

            if (
                $montoOriginalCentavos > $debitoCentavos ||
                $montoOriginalCentavos > $creditoCentavos
            ) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'Una compensación supera el importe de sus movimientos asociados.',
                ]);
            }

            // 7. Obtener las reversiones ya registradas para esta compensación.
            $reversiones = CompensacionCuentaCorriente::query()
                ->where('reversion_de_id', $compensacion->id)
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            $totalReversionesCentavos = 0;

            foreach ($reversiones as $reversion) {
                if (
                    (int) $reversion->jugador_id !== $jugadorId ||
                    $reversion->tipo !== self::TIPO_REVERSION_COMPENSACION ||
                    (int) $reversion->movimiento_debito_id !==
                        (int) $compensacion->movimiento_debito_id ||
                    (int) $reversion->movimiento_credito_id !==
                        (int) $compensacion->movimiento_credito_id ||
                    (int) $reversion->reversion_de_id !==
                        (int) $compensacion->id ||
                    !is_numeric($reversion->monto) ||
                    !is_finite((float) $reversion->monto)
                ) {
                    throw ValidationException::withMessages([
                        'cuenta_corriente' =>
                            'Se encontró una reversión de compensación inconsistente.',
                    ]);
                }

                $montoReversionCentavos = (int) round(
                    (float) $reversion->monto * 100
                );

                if ($montoReversionCentavos <= 0) {
                    throw ValidationException::withMessages([
                        'cuenta_corriente' =>
                            'El importe de una reversión de compensación es inválido.',
                    ]);
                }

                $totalReversionesCentavos += $montoReversionCentavos;
            }

            if ($totalReversionesCentavos > $montoOriginalCentavos) {
                throw ValidationException::withMessages([
                    'cuenta_corriente' =>
                        'Las reversiones superan el importe de una compensación original.',
                ]);
            }

            // 8. Calcular cuánto queda realmente por revertir.
            $remanenteCentavos =
                $montoOriginalCentavos - $totalReversionesCentavos;

            if ($remanenteCentavos <= 0) {
                continue;
            }

            $montoReversionCentavos = min(
                $remanenteCentavos,
                $pendienteCentavos
            );

            if ($montoReversionCentavos <= 0) {
                continue;
            }

            // 9. Registrar la reversión sin modificar el original.
            CompensacionCuentaCorriente::create([
                'jugador_id' => $jugadorId,
                'movimiento_debito_id' => $compensacion->movimiento_debito_id,
                'movimiento_credito_id' => $compensacion->movimiento_credito_id,
                'reversion_de_id' => $compensacion->id,
                'tipo' => self::TIPO_REVERSION_COMPENSACION,
                'monto' => round($montoReversionCentavos / 100, 2),
            ]);

            $pendienteCentavos -= $montoReversionCentavos;
            $totalRevertidoCentavos += $montoReversionCentavos;
        }

        // 10. Exigir que se haya revertido el importe solicitado.
        if ($pendienteCentavos > 0) {
            throw ValidationException::withMessages([
                'cuenta_corriente' =>
                    'No fue posible revertir la totalidad de las compensaciones solicitadas.',
            ]);
        }

        return round(
            $totalRevertidoCentavos / 100,
            2
        );
    }
public function diagnosticarCreditos(int $jugadorId): array
{
    return array_map(
        fn ($credito) => [
            'movimiento_id' => $credito['movimiento']->id,
            'monto_original' => (float) $credito['movimiento']->monto,
            'disponible' => $credito['disponible'],
        ],
        $this->obtenerCreditosDisponibles($jugadorId)
    );
}

}
