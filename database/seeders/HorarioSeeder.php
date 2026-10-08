<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Horario;
use Illuminate\Database\Seeder;

class HorarioSeeder extends Seeder
{
    public function run(): void
    {
        $categoria2018 = Categoria::where('anio', 2018)->first();
        $categoria2017 = Categoria::where('anio', 2017)->first();
        $categoria2016 = Categoria::where('anio', 2016)->first();
        $categoria2015 = Categoria::where('anio', 2015)->first();
        $categoria2014 = Categoria::where('anio', 2014)->first();
        $categoria2013 = Categoria::where('anio', 2013)->first();
        $categoria2012 = Categoria::where('anio', 2012)->first();

        // Categoría 2018
        Horario::updateOrCreate(
            [
                'categoria_id' => $categoria2018->id,
                'dia_semana' => 'Lunes',
                'hora_inicio' => '18:00',
            ],
            [
                'hora_fin' => '19:00',
                'lugar' => 'Cancha 1',
                'estado' => true,
            ]
        );

        Horario::updateOrCreate(
            [
                'categoria_id' => $categoria2018->id,
                'dia_semana' => 'Miércoles',
                'hora_inicio' => '18:00',
            ],
            [
                'hora_fin' => '19:00',
                'lugar' => 'Cancha 1',
                'estado' => true,
            ]
        );

        // Categoría 2017
        Horario::updateOrCreate(
            [
                'categoria_id' => $categoria2017->id,
                'dia_semana' => 'Martes',
                'hora_inicio' => '18:00',
            ],
            [
                'hora_fin' => '19:15',
                'lugar' => 'Cancha 2',
                'estado' => true,
            ]
        );

        Horario::updateOrCreate(
            [
                'categoria_id' => $categoria2017->id,
                'dia_semana' => 'Jueves',
                'hora_inicio' => '18:00',
            ],
            [
                'hora_fin' => '19:15',
                'lugar' => 'Cancha 2',
                'estado' => true,
            ]
        );

        // Categoría 2016
        Horario::updateOrCreate(
            [
                'categoria_id' => $categoria2016->id,
                'dia_semana' => 'Lunes',
                'hora_inicio' => '19:00',
            ],
            [
                'hora_fin' => '20:15',
                'lugar' => 'Cancha 2',
                'estado' => true,
            ]
        );

        Horario::updateOrCreate(
            [
                'categoria_id' => $categoria2016->id,
                'dia_semana' => 'Miércoles',
                'hora_inicio' => '19:00',
            ],
            [
                'hora_fin' => '20:15',
                'lugar' => 'Cancha 2',
                'estado' => true,
            ]
        );

        // Categoría 2015
        Horario::updateOrCreate(
            [
                'categoria_id' => $categoria2015->id,
                'dia_semana' => 'Martes',
                'hora_inicio' => '19:15',
            ],
            [
                'hora_fin' => '20:30',
                'lugar' => 'Cancha 1',
                'estado' => true,
            ]
        );

        Horario::updateOrCreate(
            [
                'categoria_id' => $categoria2015->id,
                'dia_semana' => 'Jueves',
                'hora_inicio' => '19:15',
            ],
            [
                'hora_fin' => '20:30',
                'lugar' => 'Cancha 1',
                'estado' => true,
            ]
        );

        // Categoría 2014
        Horario::updateOrCreate(
            [
                'categoria_id' => $categoria2014->id,
                'dia_semana' => 'Lunes',
                'hora_inicio' => '20:15',
            ],
            [
                'hora_fin' => '21:30',
                'lugar' => 'Cancha 1',
                'estado' => true,
            ]
        );

        Horario::updateOrCreate(
            [
                'categoria_id' => $categoria2014->id,
                'dia_semana' => 'Miércoles',
                'hora_inicio' => '20:15',
            ],
            [
                'hora_fin' => '21:30',
                'lugar' => 'Cancha 1',
                'estado' => true,
            ]
        );

        // Categoría 2013
        Horario::updateOrCreate(
            [
                'categoria_id' => $categoria2013->id,
                'dia_semana' => 'Martes',
                'hora_inicio' => '20:30',
            ],
            [
                'hora_fin' => '21:45',
                'lugar' => 'Cancha 2',
                'estado' => true,
            ]
        );

        Horario::updateOrCreate(
            [
                'categoria_id' => $categoria2013->id,
                'dia_semana' => 'Jueves',
                'hora_inicio' => '20:30',
            ],
            [
                'hora_fin' => '21:45',
                'lugar' => 'Cancha 2',
                'estado' => true,
            ]
        );

        // Categoría 2012
        Horario::updateOrCreate(
            [
                'categoria_id' => $categoria2012->id,
                'dia_semana' => 'Lunes',
                'hora_inicio' => '21:00',
            ],
            [
                'hora_fin' => '22:15',
                'lugar' => 'Cancha 2',
                'estado' => true,
            ]
        );

        Horario::updateOrCreate(
            [
                'categoria_id' => $categoria2012->id,
                'dia_semana' => 'Jueves',
                'hora_inicio' => '21:00',
            ],
            [
                'hora_fin' => '22:15',
                'lugar' => 'Cancha 2',
                'estado' => true,
            ]
        );
    }
}