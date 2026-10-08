<?php

namespace Database\Seeders;

use App\Models\Cuota;
use App\Models\Jugador;
use App\Models\Pago;
use App\Models\CuotaXJugador;
use App\Models\ModalidadPago;
use Illuminate\Database\Seeder;

class PagoSeeder extends Seeder
{
    public function run(): void
    {
        $efectivo = ModalidadPago::where(
            'nombre',
            'Efectivo'
        )->first();

        $transferencia = ModalidadPago::where(
            'nombre',
            'Transferencia bancaria'
        )->first();

        $mercadoPago = ModalidadPago::where(
            'nombre',
            'Mercado Pago'
        )->first();

        $tarjetaDebito = ModalidadPago::where(
            'nombre',
            'Tarjeta de débito'
        )->first();

        $octubre = Cuota::where(
            'nombre',
            'Cuota mensual octubre 2026'
        )->first();

        $mateo = Jugador::where(
            'dni',
            '45123456'
        )->first();

        $thiago = Jugador::where(
            'dni',
            '45234567'
        )->first();

        $santiago = Jugador::where(
            'dni',
            '44345678'
        )->first();

        $valentino = Jugador::where(
            'dni',
            '42567890'
        )->first();

        $cuotaMateo = CuotaXJugador::where(
            'cuota_id',
            $octubre->id
        )->where(
            'jugador_id',
            $mateo->id
        )->first();

        $cuotaThiago = CuotaXJugador::where(
            'cuota_id',
            $octubre->id
        )->where(
            'jugador_id',
            $thiago->id
        )->first();

        $cuotaSantiago = CuotaXJugador::where(
            'cuota_id',
            $octubre->id
        )->where(
            'jugador_id',
            $santiago->id
        )->first();

        $cuotaValentino = CuotaXJugador::where(
            'cuota_id',
            $octubre->id
        )->where(
            'jugador_id',
            $valentino->id
        )->first();

        // Mateo: cuota totalmente pagada en efectivo
        Pago::updateOrCreate(
            [
                'cuota_x_jugador_id' => $cuotaMateo->id,
                'fecha_pago' => '2026-10-01',
                'comprobante' => 'REC-0001',
            ],
            [
                'modalidad_pago_id' => $efectivo->id,
                'monto' => 25000.00,
                'estado' => 'confirmado',
            ]
        );

        // Thiago: pago parcial mediante transferencia
        Pago::updateOrCreate(
            [
                'cuota_x_jugador_id' => $cuotaThiago->id,
                'fecha_pago' => '2026-10-02',
                'comprobante' => 'TRF-0001',
            ],
            [
                'modalidad_pago_id' => $transferencia->id,
                'monto' => 15000.00,
                'estado' => 'confirmado',
            ]
        );

        // Santiago: cuota totalmente pagada mediante Mercado Pago
        Pago::updateOrCreate(
            [
                'cuota_x_jugador_id' => $cuotaSantiago->id,
                'fecha_pago' => '2026-10-03',
                'comprobante' => 'MP-0001',
            ],
            [
                'modalidad_pago_id' => $mercadoPago->id,
                'monto' => 25000.00,
                'estado' => 'confirmado',
            ]
        );

        // Valentino: primer pago parcial
        Pago::updateOrCreate(
            [
                'cuota_x_jugador_id' => $cuotaValentino->id,
                'fecha_pago' => '2026-10-03',
                'comprobante' => 'TD-0001',
            ],
            [
                'modalidad_pago_id' => $tarjetaDebito->id,
                'monto' => 10000.00,
                'estado' => 'confirmado',
            ]
        );

        // Valentino: segundo pago parcial
        Pago::updateOrCreate(
            [
                'cuota_x_jugador_id' => $cuotaValentino->id,
                'fecha_pago' => '2026-10-06',
                'comprobante' => 'TD-0002',
            ],
            [
                'modalidad_pago_id' => $tarjetaDebito->id,
                'monto' => 15000.00,
                'estado' => 'confirmado',
            ]
        );

        /*
         * Actualizamos el estado de cada asignación
         * según el total efectivamente abonado.
         */
        $asignaciones = CuotaXJugador::with('cuota')->get();

        foreach ($asignaciones as $asignacion) {
            $totalPagado = $asignacion->pagos()
                ->where('estado', 'confirmado')
                ->sum('monto');

            $montoCuota = $asignacion->cuota->monto;

            if ($totalPagado >= $montoCuota) {
                $asignacion->update([
                    'estado' => 'pagada',
                ]);
            } else {
                $asignacion->update([
                    'estado' => 'pendiente',
                ]);
            }
        }
    }
}