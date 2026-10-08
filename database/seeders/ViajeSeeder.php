<?php

namespace Database\Seeders;

use App\Models\Viaje;
use Illuminate\Database\Seeder;

class ViajeSeeder extends Seeder
{
    public function run(): void
    {
        Viaje::updateOrCreate(
            ['nombre' => 'Viaje Copa Salta Infantil 2026'],
            [
                'destino' => 'Salta Capital',
                'fecha_salida' => '2026-10-10',
                'fecha_regreso' => '2026-10-12',
                'medio_transporte' => 'Ómnibus',
                'costo' => 35000.00,
                'descripcion' => 'Viaje correspondiente a la participación en la Copa Salta Infantil 2026.',
                'estado' => true,
            ]
        );

        Viaje::updateOrCreate(
            ['nombre' => 'Viaje Torneo Primavera 2026'],
            [
                'destino' => 'San Salvador de Jujuy',
                'fecha_salida' => '2026-11-07',
                'fecha_regreso' => '2026-11-08',
                'medio_transporte' => 'Ómnibus',
                'costo' => 40000.00,
                'descripcion' => 'Viaje para participar en el Torneo Primavera 2026.',
                'estado' => true,
            ]
        );

        Viaje::updateOrCreate(
            ['nombre' => 'Viaje Copa Fin de Año 2026'],
            [
                'destino' => 'Salta Capital',
                'fecha_salida' => '2026-12-05',
                'fecha_regreso' => '2026-12-06',
                'medio_transporte' => 'Ómnibus',
                'costo' => 30000.00,
                'descripcion' => 'Viaje correspondiente al torneo de cierre de temporada.',
                'estado' => true,
            ]
        );
    }
}