<?php

namespace Database\Seeders;

use App\Models\ModalidadPago;
use Illuminate\Database\Seeder;

class ModalidadPagoSeeder extends Seeder
{
    public function run(): void
    {
        ModalidadPago::updateOrCreate(
            ['nombre' => 'Efectivo'],
            [
                'estado' => true,
            ]
        );

        ModalidadPago::updateOrCreate(
            ['nombre' => 'Transferencia bancaria'],
            [
                'estado' => true,
            ]
        );

        ModalidadPago::updateOrCreate(
            ['nombre' => 'Mercado Pago'],
            [
                'estado' => true,
            ]
        );

        ModalidadPago::updateOrCreate(
            ['nombre' => 'Tarjeta de débito'],
            [
                'estado' => true,
            ]
        );

        ModalidadPago::updateOrCreate(
            ['nombre' => 'Tarjeta de crédito'],
            [
                'estado' => true,
            ]
        );
    }
}