<?php

namespace Database\Seeders;

use App\Models\Jugador;
use App\Models\Torneo;
use Illuminate\Database\Seeder;

class InscripcionTorneoSeeder extends Seeder
{
    public function run(): void
    {
        $mateo = Jugador::where('dni', '45123456')->first();
        $thiago = Jugador::where('dni', '45234567')->first();
        $santiago = Jugador::where('dni', '44345678')->first();
        $benjamin = Jugador::where('dni', '43456789')->first();
        $valentino = Jugador::where('dni', '42567890')->first();

        $copaSalta = Torneo::where(
            'nombre',
            'Copa Salta Infantil 2026'
        )->first();

        $torneoPrimavera = Torneo::where(
            'nombre',
            'Torneo Primavera 2026'
        )->first();

        $copaFinDeAnio = Torneo::where(
            'nombre',
            'Copa Fin de Año 2026'
        )->first();

        $mateo->torneos()->sync([
            $copaSalta->id => [
                'fecha_inscripcion' => '2026-09-25',
                'estado' => 'inscripto',
            ],
            $copaFinDeAnio->id => [
                'fecha_inscripcion' => '2026-09-25',
                'estado' => 'inscripto',
            ],
        ]);

        $thiago->torneos()->sync([
            $copaSalta->id => [
                'fecha_inscripcion' => '2026-09-25',
                'estado' => 'inscripto',
            ],
            $torneoPrimavera->id => [
                'fecha_inscripcion' => '2026-09-25',
                'estado' => 'inscripto',
            ],
        ]);

        $santiago->torneos()->sync([
            $copaSalta->id => [
                'fecha_inscripcion' => '2026-09-25',
                'estado' => 'inscripto',
            ],
            $torneoPrimavera->id => [
                'fecha_inscripcion' => '2026-09-25',
                'estado' => 'inscripto',
            ],
            $copaFinDeAnio->id => [
                'fecha_inscripcion' => '2026-09-25',
                'estado' => 'inscripto',
            ],
        ]);

        $benjamin->torneos()->sync([
            $torneoPrimavera->id => [
                'fecha_inscripcion' => '2026-09-25',
                'estado' => 'inscripto',
            ],
            $copaFinDeAnio->id => [
                'fecha_inscripcion' => '2026-09-25',
                'estado' => 'inscripto',
            ],
        ]);

        $valentino->torneos()->sync([
            $torneoPrimavera->id => [
                'fecha_inscripcion' => '2026-09-25',
                'estado' => 'inscripto',
            ],
        ]);
    }
}