<?php

namespace Database\Seeders;

use App\Models\Jugador;
use App\Models\Tutor;
use Illuminate\Database\Seeder;

class JugadorTutorSeeder extends Seeder
{
    public function run(): void
    {
        $mateo = Jugador::where('dni', '45123456')->first();
        $thiago = Jugador::where('dni', '45234567')->first();
        $santiago = Jugador::where('dni', '44345678')->first();
        $benjamin = Jugador::where('dni', '43456789')->first();
        $valentino = Jugador::where('dni', '42567890')->first();

        $carlos = Tutor::where('dni', '30111222')->first();
        $laura = Tutor::where('dni', '30222333')->first();
        $maria = Tutor::where('dni', '30333444')->first();
        $jorge = Tutor::where('dni', '30444555')->first();
        $ana = Tutor::where('dni', '30555666')->first();

        $mateo->tutores()->syncWithoutDetaching([
            $carlos->id => [
                'parentesco' => 'Padre',
                'es_tutor_principal' => true,
            ],
            $laura->id => [
                'parentesco' => 'Madre',
                'es_tutor_principal' => false,
            ],
        ]);

        $thiago->tutores()->syncWithoutDetaching([
            $maria->id => [
                'parentesco' => 'Madre',
                'es_tutor_principal' => true,
            ],
        ]);

        $santiago->tutores()->syncWithoutDetaching([
            $jorge->id => [
                'parentesco' => 'Padre',
                'es_tutor_principal' => true,
            ],
            $ana->id => [
                'parentesco' => 'Madre',
                'es_tutor_principal' => false,
            ],
        ]);

        $benjamin->tutores()->syncWithoutDetaching([
            $ana->id => [
                'parentesco' => 'Madre',
                'es_tutor_principal' => true,
            ],
        ]);

        $valentino->tutores()->syncWithoutDetaching([
            $laura->id => [
                'parentesco' => 'Madre',
                'es_tutor_principal' => true,
            ],
        ]);
    }
}