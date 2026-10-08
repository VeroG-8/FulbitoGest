<?php

namespace Database\Seeders;

use App\Models\Jugador;
use App\Models\Club;
use App\Models\Pase;
use Illuminate\Database\Seeder;

class PaseSeeder extends Seeder
{
    public function run(): void
    {
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

        $benjamin = Jugador::where(
            'dni',
            '43456789'
        )->first();

        $clubDeportivoSalta = Club::where(
            'nombre',
            'Club Deportivo Salta'
        )->first();

        $clubLosPumas = Club::where(
            'nombre',
            'Club Los Pumas'
        )->first();

        $clubAtleticoJujuy = Club::where(
            'nombre',
            'Club Atlético Jujuy'
        )->first();

        $escuelaNorte = Club::where(
            'nombre',
            'Escuela de Fútbol Norte'
        )->first();

        // Mateo: pase propio
        Pase::updateOrCreate(
            [
                'jugador_id' => $mateo->id,
                'tipo' => 'propio',
                'fecha_inicio' => '2026-01-01',
            ],
            [
                'club_origen_id' => null,
                'club_destino_id' => $clubDeportivoSalta->id,
                'fecha_fin' => null,
                'observaciones' => 'Jugador perteneciente a la institución.',
                'estado' => true,
            ]
        );

        // Thiago: transferencia desde Club Los Pumas
        // hacia Club Deportivo Salta
        Pase::updateOrCreate(
            [
                'jugador_id' => $thiago->id,
                'tipo' => 'transferencia',
                'fecha_inicio' => '2026-02-15',
            ],
            [
                'club_origen_id' => $clubLosPumas->id,
                'club_destino_id' => $clubDeportivoSalta->id,
                'fecha_fin' => null,
                'observaciones' => 'Transferencia definitiva a la institución.',
                'estado' => true,
            ]
        );

        // Santiago: préstamo desde Club Atlético Jujuy
        // hacia Club Deportivo Salta
        Pase::updateOrCreate(
            [
                'jugador_id' => $santiago->id,
                'tipo' => 'prestamo',
                'fecha_inicio' => '2026-03-01',
            ],
            [
                'club_origen_id' => $clubAtleticoJujuy->id,
                'club_destino_id' => $clubDeportivoSalta->id,
                'fecha_fin' => '2026-12-31',
                'observaciones' => 'Préstamo por temporada 2026.',
                'estado' => true,
            ]
        );

        // Benjamín: transferencia desde Escuela de Fútbol Norte
        // hacia Club Deportivo Salta
        Pase::updateOrCreate(
            [
                'jugador_id' => $benjamin->id,
                'tipo' => 'transferencia',
                'fecha_inicio' => '2026-04-10',
            ],
            [
                'club_origen_id' => $escuelaNorte->id,
                'club_destino_id' => $clubDeportivoSalta->id,
                'fecha_fin' => null,
                'observaciones' => 'Transferencia definitiva.',
                'estado' => true,
            ]
        );
    }
}