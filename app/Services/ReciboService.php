<?php

namespace App\Services;

use App\Models\Recibo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ReciboService
{
    /**
     * Genera un recibo para un pago previamente registrado.
     */
    public function generar(Model $pago): Recibo
    {
        return DB::transaction(function () use ($pago) {
            // Bloqueamos el registro central para evitar
            // que dos pagos reciban el mismo número.
            $secuencia = DB::table('secuencias_recibos')
                ->where('id', 1)
                ->lockForUpdate()
                ->first();

            if (!$secuencia) {
                throw new \RuntimeException(
                    'No se encontró el contador de recibos.'
                );
            }

            // Si el pago ya tiene recibo, reutilizamos el existente.
            $reciboExistente = Recibo::query()
                ->where('pago_type', $pago->getMorphClass())
                ->where('pago_id', $pago->getKey())
                ->first();

            if ($reciboExistente) {
                return $reciboExistente;
            }

            $siguienteNumero = $secuencia->ultimo_numero + 1;

            DB::table('secuencias_recibos')
                ->where('id', 1)
                ->update([
                    'ultimo_numero' => $siguienteNumero,
                    'updated_at' => now(),
                ]);

            return Recibo::create([
                'numero' => $siguienteNumero,
                'pago_type' => $pago->getMorphClass(),
                'pago_id' => $pago->getKey(),
            ]);
        });
    }
}