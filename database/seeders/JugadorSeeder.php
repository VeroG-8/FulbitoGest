<?php

namespace Database\Seeders;

use App\Models\Jugador;
use App\Models\Categoria;
use Illuminate\Database\Seeder;

class JugadorSeeder extends Seeder
{
    public function run(): void
    {
        $categoria2018 = Categoria::where('nombre', '2018')->first();
        $categoria2017 = Categoria::where('nombre', '2017')->first();
        $categoria2016 = Categoria::where('nombre', '2016')->first();
        $categoria2015 = Categoria::where('nombre', '2015')->first();

        Jugador::updateOrCreate(
            ['dni' => '45123456'],
            [
                'nombre' => 'Mateo',
                'apellido' => 'Gómez',
                'nacionalidad' => 'Argentina',
                'fecha_nacimiento' => '2018-04-15',
                'telefono' => '3875123456',
                'direccion' => 'Av. Belgrano 123',
                'localidad' => 'Salta',
                'categoria_id' => $categoria2018->id,
                'estado' => true,
            ]
        );

        Jugador::updateOrCreate(
            ['dni' => '45234567'],
            [
                'nombre' => 'Thiago',
                'apellido' => 'López',
                'nacionalidad' => 'Argentina',
                'fecha_nacimiento' => '2018-09-22',
                'telefono' => '3875234567',
                'direccion' => 'Calle Mitre 456',
                'localidad' => 'Salta',
                'categoria_id' => $categoria2018->id,
                'estado' => true,
            ]
        );

        Jugador::updateOrCreate(
            ['dni' => '44345678'],
            [
                'nombre' => 'Santiago',
                'apellido' => 'Martínez',
                'nacionalidad' => 'Argentina',
                'fecha_nacimiento' => '2017-02-10',
                'telefono' => '3875345678',
                'direccion' => 'Calle Alvarado 789',
                'localidad' => 'Salta',
                'categoria_id' => $categoria2017->id,
                'estado' => true,
            ]
        );

        Jugador::updateOrCreate(
            ['dni' => '43456789'],
            [
                'nombre' => 'Benjamín',
                'apellido' => 'Fernández',
                'nacionalidad' => 'Argentina',
                'fecha_nacimiento' => '2016-07-03',
                'telefono' => '3875456789',
                'direccion' => 'Calle España 321',
                'localidad' => 'Salta',
                'categoria_id' => $categoria2016->id,
                'estado' => true,
            ]
        );

        Jugador::updateOrCreate(
            ['dni' => '42567890'],
            [
                'nombre' => 'Valentino',
                'apellido' => 'Ramírez',
                'nacionalidad' => 'Argentina',
                'fecha_nacimiento' => '2015-11-18',
                'telefono' => '3875567890',
                'direccion' => 'Calle Caseros 654',
                'localidad' => 'Salta',
                'categoria_id' => $categoria2015->id,
                'estado' => true,
            ]
        );
    }
}