<?php

namespace Database\Seeders;

use App\Models\Cuota;
use Illuminate\Database\Seeder;

class CuotaSeeder extends Seeder
{
    public function run(): void
    {
        Cuota::updateOrCreate(
            ['nombre' => 'Cuota mensual octubre 2026'],
            [
                'descripcion' => 'Cuota correspondiente al mes de octubre de 2026.',
                'monto' => 25000.00,
                'fecha_vencimiento' => '2026-10-10',
                'estado' => true,
            ]
        );

        Cuota::updateOrCreate(
            ['nombre' => 'Cuota mensual noviembre 2026'],
            [
                'descripcion' => 'Cuota correspondiente al mes de noviembre de 2026.',
                'monto' => 25000.00,
                'fecha_vencimiento' => '2026-11-10',
                'estado' => true,
            ]
        );

        Cuota::updateOrCreate(
            ['nombre' => 'Cuota mensual diciembre 2026'],
            [
                'descripcion' => 'Cuota correspondiente al mes de diciembre de 2026.',
                'monto' => 25000.00,
                'fecha_vencimiento' => '2026-12-10',
                'estado' => true,
            ]
        );

        Cuota::updateOrCreate(
            ['nombre' => 'Inscripción Copa Salta Infantil 2026'],
            [
                'descripcion' => 'Inscripción al torneo Copa Salta Infantil 2026.',
                'monto' => 15000.00,
                'fecha_vencimiento' => '2026-10-05',
                'estado' => true,
            ]
        );

        Cuota::updateOrCreate(
            ['nombre' => 'Inscripción Copa Fin de Año 2026'],
            [
                'descripcion' => 'Inscripción al torneo Copa Fin de Año 2026.',
                'monto' => 18000.00,
                'fecha_vencimiento' => '2026-11-25',
                'estado' => true,
            ]
        );
    }
}