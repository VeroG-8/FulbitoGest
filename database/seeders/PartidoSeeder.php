<?php

namespace Database\Seeders;

use App\Models\Equipo;
use App\Models\Partido;
use App\Models\Torneo;
use Illuminate\Database\Seeder;

class PartidoSeeder extends Seeder
{
    public function run(): void
    {
        $copaSalta = Torneo::where(
            'nombre',
            'Copa Salta Infantil 2026'
        )->first();

        $primavera = Torneo::where(
            'nombre',
            'Torneo Primavera 2026'
        )->first();

        $finDeAnio = Torneo::where(
            'nombre',
            'Copa Fin de Año 2026'
        )->first();

        $fulbito2018 = Equipo::where(
            'nombre',
            'FulbitoGest 2018'
        )->first();

        $deportivo2018A = Equipo::where(
            'nombre',
            'Deportivo Salta A'
        )->whereHas('categoria', function ($query) {
            $query->where('anio', 2018);
        })->first();

        $deportivo2018B = Equipo::where(
            'nombre',
            'Deportivo Salta B'
        )->whereHas('categoria', function ($query) {
            $query->where('anio', 2018);
        })->first();

        $fulbito2017 = Equipo::where(
            'nombre',
            'FulbitoGest 2017'
        )->first();

        $deportivo2017 = Equipo::where(
            'nombre',
            'Deportivo Salta A'
        )->whereHas('categoria', function ($query) {
            $query->where('anio', 2017);
        })->first();

        $pumas2017A = Equipo::where(
            'nombre',
            'Los Pumas A'
        )->whereHas('categoria', function ($query) {
            $query->where('anio', 2017);
        })->first();

        $pumas2017B = Equipo::where(
            'nombre',
            'Los Pumas B'
        )->whereHas('categoria', function ($query) {
            $query->where('anio', 2017);
        })->first();

        $fulbito2016 = Equipo::where(
            'nombre',
            'FulbitoGest 2016'
        )->first();

        $pumas2016 = Equipo::where(
            'nombre',
            'Los Pumas A'
        )->whereHas('categoria', function ($query) {
            $query->where('anio', 2016);
        })->first();

        $atletico2016A = Equipo::where(
            'nombre',
            'Atlético Jujuy A'
        )->whereHas('categoria', function ($query) {
            $query->where('anio', 2016);
        })->first();

        Partido::updateOrCreate(
            [
                'torneo_id' => $copaSalta->id,
                'equipo_local_id' => $fulbito2018->id,
                'equipo_visitante_id' => $deportivo2018A->id,
                'fecha' => '2026-10-10',
            ],
            [
                'hora' => '10:00',
                'lugar' => 'Complejo Deportivo Salta',
                'goles_local' => null,
                'goles_visitante' => null,
                'estado' => 'programado',
            ]
        );

        Partido::updateOrCreate(
            [
                'torneo_id' => $copaSalta->id,
                'equipo_local_id' => $deportivo2018B->id,
                'equipo_visitante_id' => $fulbito2018->id,
                'fecha' => '2026-10-10',
            ],
            [
                'hora' => '11:30',
                'lugar' => 'Complejo Deportivo Salta',
                'goles_local' => null,
                'goles_visitante' => null,
                'estado' => 'programado',
            ]
        );

        Partido::updateOrCreate(
            [
                'torneo_id' => $copaSalta->id,
                'equipo_local_id' => $fulbito2017->id,
                'equipo_visitante_id' => $deportivo2017->id,
                'fecha' => '2026-10-11',
            ],
            [
                'hora' => '10:00',
                'lugar' => 'Complejo Deportivo Salta',
                'goles_local' => 2,
                'goles_visitante' => 1,
                'estado' => 'jugado',
            ]
        );

        Partido::updateOrCreate(
            [
                'torneo_id' => $copaSalta->id,
                'equipo_local_id' => $pumas2017A->id,
                'equipo_visitante_id' => $pumas2017B->id,
                'fecha' => '2026-10-11',
            ],
            [
                'hora' => '11:30',
                'lugar' => 'Complejo Deportivo Salta',
                'goles_local' => 1,
                'goles_visitante' => 1,
                'estado' => 'jugado',
            ]
        );

        Partido::updateOrCreate(
            [
                'torneo_id' => $primavera->id,
                'equipo_local_id' => $fulbito2017->id,
                'equipo_visitante_id' => $pumas2017A->id,
                'fecha' => '2026-11-07',
            ],
            [
                'hora' => '10:00',
                'lugar' => 'Predio Deportivo Norte',
                'goles_local' => null,
                'goles_visitante' => null,
                'estado' => 'programado',
            ]
        );

        Partido::updateOrCreate(
            [
                'torneo_id' => $primavera->id,
                'equipo_local_id' => $fulbito2016->id,
                'equipo_visitante_id' => $pumas2016->id,
                'fecha' => '2026-11-07',
            ],
            [
                'hora' => '11:30',
                'lugar' => 'Predio Deportivo Norte',
                'goles_local' => null,
                'goles_visitante' => null,
                'estado' => 'programado',
            ]
        );

        Partido::updateOrCreate(
            [
                'torneo_id' => $primavera->id,
                'equipo_local_id' => $fulbito2016->id,
                'equipo_visitante_id' => $atletico2016A->id,
                'fecha' => '2026-11-08',
            ],
            [
                'hora' => '10:00',
                'lugar' => 'Predio Deportivo Norte',
                'goles_local' => null,
                'goles_visitante' => null,
                'estado' => 'suspendido',
            ]
        );

        Partido::updateOrCreate(
            [
                'torneo_id' => $finDeAnio->id,
                'equipo_local_id' => $fulbito2018->id,
                'equipo_visitante_id' => $deportivo2018A->id,
                'fecha' => '2026-12-05',
            ],
            [
                'hora' => '09:30',
                'lugar' => 'Complejo Deportivo Salta',
                'goles_local' => null,
                'goles_visitante' => null,
                'estado' => 'programado',
            ]
        );
    }
}