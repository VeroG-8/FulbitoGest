<?php

namespace Database\Seeders;

use App\Models\Jugador;
use App\Models\Viaje;
use Illuminate\Database\Seeder;

class JugadorViajeSeeder extends Seeder
{
    public function run(): void
    {
        $mateo = Jugador::where('dni', '45123456')->first();
        $thiago = Jugador::where('dni', '45234567')->first();
        $santiago = Jugador::where('dni', '44345678')->first();
        $benjamin = Jugador::where('dni', '43456789')->first();
        $valentino = Jugador::where('dni', '42567890')->first();

        $copaSalta = Viaje::where(
            'nombre',
            'Viaje Copa Salta Infantil 2026'
        )->first();

        $torneoPrimavera = Viaje::where(
            'nombre',
            'Viaje Torneo Primavera 2026'
        )->first();

        $copaFinDeAnio = Viaje::where(
            'nombre',
            'Viaje Copa Fin de Año 2026'
        )->first();

        // Mateo
        $mateo->viajes()->sync([
            $copaSalta->id => [
                'estado' => 'inscripto',
            ],
            $copaFinDeAnio->id => [
                'estado' => 'inscripto',
            ],
        ]);

        // Thiago
        $thiago->viajes()->sync([
            $copaSalta->id => [
                'estado' => 'inscripto',
            ],
            $torneoPrimavera->id => [
                'estado' => 'inscripto',
            ],
        ]);

        // Santiago
        $santiago->viajes()->sync([
            $copaSalta->id => [
                'estado' => 'inscripto',
            ],
            $torneoPrimavera->id => [
                'estado' => 'inscripto',
            ],
            $copaFinDeAnio->id => [
                'estado' => 'inscripto',
            ],
        ]);

        // Benjamín
        $benjamin->viajes()->sync([
            $torneoPrimavera->id => [
                'estado' => 'inscripto',
            ],
            $copaFinDeAnio->id => [
                'estado' => 'inscripto',
            ],
        ]);

        // Valentino
        $valentino->viajes()->sync([
            $torneoPrimavera->id => [
                'estado' => 'inscripto',
            ],
        ]);
    }
}