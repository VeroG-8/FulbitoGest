<?php

namespace Database\Seeders;

use App\Models\Torneo;
use Illuminate\Database\Seeder;

class TorneoSeeder extends Seeder
{
    public function run(): void
    {
        Torneo::updateOrCreate(
            ['nombre' => 'Copa Salta Infantil 2026'],
            [
                'organizador' => 'Liga Infantil de Salta',
                'fecha_inicio' => '2026-10-10',
                'fecha_fin' => '2026-10-12',
                'lugar' => 'Complejo Deportivo Salta',
                'descripcion' => 'Torneo infantil de fútbol para categorías formativas.',
                'estado' => true,
            ]
        );

        Torneo::updateOrCreate(
            ['nombre' => 'Torneo Primavera 2026'],
            [
                'organizador' => 'Escuela de Fútbol Los Pumas',
                'fecha_inicio' => '2026-11-07',
                'fecha_fin' => '2026-11-08',
                'lugar' => 'Predio Deportivo Norte',
                'descripcion' => 'Encuentro deportivo de categorías infantiles.',
                'estado' => true,
            ]
        );

        Torneo::updateOrCreate(
            ['nombre' => 'Copa Fin de Año 2026'],
            [
                'organizador' => 'FulbitoGest',
                'fecha_inicio' => '2026-12-05',
                'fecha_fin' => '2026-12-06',
                'lugar' => 'Complejo Deportivo Salta',
                'descripcion' => 'Torneo de cierre de temporada para las categorías formativas.',
                'estado' => true,
            ]
        );
    }
}