<?php

namespace App\Services;

use App\Models\Pago;
use App\Models\Recibo;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ReciboService
{
    /**
     * Genera un recibo para un pago real previamente registrado
     * y confirmado.
     *
     * Si el pago ya tiene un recibo, devuelve el existente
     * sin incrementar la secuencia.
     */
    public function generar(Pago $pago): Recibo
    {
        if (!$pago->exists || !$pago->getKey()) {
            throw new RuntimeException(
                'No se puede generar un recibo para un pago que todavía no fue registrado.'
            );
        }

        return DB::transaction(function () use ($pago) {

            /*
             * Bloquear nuevamente el pago permite comprobar
             * su estado actual y evita generar recibos duplicados
             * ante solicitudes concurrentes del mismo pago.
             */
            $pagoBloqueado = Pago::query()
                ->whereKey($pago->getKey())
                ->lockForUpdate()
                ->first();

            if (!$pagoBloqueado) {
                throw new RuntimeException(
                    'No se encontró el pago para generar el recibo.'
                );
            }

            // Solo se generan recibos para pagos confirmados.
            if ($pagoBloqueado->estado !== 'confirmado') {
                throw new RuntimeException(
                    'No se puede generar un recibo para un pago que no está confirmado.'
                );
            }

            // Validar que el importe represente dinero efectivamente recibido.
            $monto = $pagoBloqueado->monto;

            if (
                !is_numeric($monto) ||
                !is_finite((float) $monto) ||
                (float) $monto <= 0
            ) {
                throw new RuntimeException(
                    'No se puede generar un recibo para un pago con importe inválido.'
                );
            }

            $pagoType = $pagoBloqueado->getMorphClass();
            $pagoId = $pagoBloqueado->getKey();

            /*
             * Comprobar si ya existe un recibo para este pago.
             * Esto hace que la operación sea idempotente:
             * volver a solicitarla no genera otro recibo.
             */
            $reciboExistente = Recibo::query()
                ->where('pago_type', $pagoType)
                ->where('pago_id', $pagoId)
                ->first();

            if ($reciboExistente) {
                return $reciboExistente;
            }

            /*
             * Bloquear la secuencia central.
             *
             * Los pagos diferentes pueden procesarse en paralelo,
             * pero la asignación de números queda serializada.
             */
            $secuencia = DB::table('secuencias_recibos')
                ->where('id', 1)
                ->lockForUpdate()
                ->first();

            if (!$secuencia) {
                throw new RuntimeException(
                    'No se encontró el contador de recibos.'
                );
            }

            $ultimoNumero = (int) $secuencia->ultimo_numero;

            if ($ultimoNumero < 0 || $ultimoNumero >= PHP_INT_MAX) {
                throw new RuntimeException(
                    'El contador de recibos contiene un valor inválido.'
                );
            }

            $siguienteNumero = $ultimoNumero + 1;

            // Actualizar la secuencia.
            DB::table('secuencias_recibos')
                ->where('id', 1)
                ->update([
                    'ultimo_numero' => $siguienteNumero,
                    'updated_at' => now(),
                ]);

            // Crear el recibo asociado exclusivamente al pago real.
            return Recibo::create([
                'numero' => $siguienteNumero,
                'pago_type' => $pagoType,
                'pago_id' => $pagoId,
            ]);
        });
    }
}