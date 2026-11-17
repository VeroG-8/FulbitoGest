<?php

namespace App\Services;

use App\Models\CuotaXJugador;

class SaldoCuotaService
{
    /**
     * Calcular el crédito neto aplicado a una asignación.
     *
     * Las aplicaciones suman y las reversiones restan.
     * El resultado se expresa con precisión de centavos.
     */
    public function calcularCreditoAplicado(
        CuotaXJugador $asignacion
    ): float {
        $aplicaciones = $asignacion->relationLoaded('aplicacionesCredito')
            ? $asignacion->aplicacionesCredito
            : $asignacion->aplicacionesCredito()->get();

        $totalCentavos = $aplicaciones->sum(function ($aplicacion) {
            $centavos = (int) round(
                (float) $aplicacion->monto * 100
            );

            if ($aplicacion->tipo === 'aplicacion') {
                return $centavos;
            }

            if ($aplicacion->tipo === 'reversion') {
                return -$centavos;
            }

            return 0;
        });

        return round(max(0, $totalCentavos) / 100, 2);
    }

    /**
     * Calcular el estado económico de una asignación.
     */
    public function calcularEstado(
        float $montoCuota,
        float $totalCubierto
    ): string {
        $montoCentavos = (int) round($montoCuota * 100);
        $cubiertoCentavos = (int) round($totalCubierto * 100);

        if ($cubiertoCentavos >= $montoCentavos) {
            return 'pagada';
        }

        if ($cubiertoCentavos > 0) {
            return 'parcial';
        }

        return 'pendiente';
    }

    /**
     * Calcular el resumen económico de una asignación.
     *
     * IMPORTANTE:
     * La relación pagos debe estar cargada únicamente
     * con los pagos confirmados.
     */
    public function calcularResumen(
        CuotaXJugador $asignacion
    ): array {
        $montoCuota = (float) ($asignacion->cuota?->monto ?? 0);

        $pagos = $asignacion->relationLoaded('pagos')
            ? $asignacion->pagos
            : $asignacion->pagos()
                ->where('estado', 'confirmado')
                ->get();

        $totalPagado = (float) $pagos->sum('monto');

        $creditoAplicado = $this->calcularCreditoAplicado(
            $asignacion
        );

        $totalCubierto = round(
            $totalPagado + $creditoAplicado,
            2
        );

        $saldoPendiente = round(
            max(0, $montoCuota - $totalCubierto),
            2
        );

        return [
            'monto_cuota' => round($montoCuota, 2),
            'total_pagado' => round($totalPagado, 2),
            'credito_aplicado' => $creditoAplicado,
            'total_cubierto' => $totalCubierto,
            'saldo_pendiente' => $saldoPendiente,
            'estado' => $this->calcularEstado(
                $montoCuota,
                $totalCubierto
            ),
        ];
    }
}