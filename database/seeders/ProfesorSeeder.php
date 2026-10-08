<?php

namespace Database\Seeders;

use App\Models\Profesor;
use Illuminate\Database\Seeder;

class ProfesorSeeder extends Seeder
{
    public function run(): void
    {
        Profesor::updateOrCreate(
            ['dni' => '27111222'],
            [
                'nombre' => 'Marcelo',
                'apellido' => 'Gutiérrez',
                'email' => 'marcelo.gutierrez@example.com',
                'telefono' => '3874111222',
                'direccion' => 'Av. San Martín 123',
                'localidad' => 'Salta',
                'especialidad' => 'Director Técnico',
                'estado' => true,
            ]
        );

        Profesor::updateOrCreate(
            ['dni' => '28222333'],
            [
                'nombre' => 'Diego',
                'apellido' => 'Ramos',
                'email' => 'diego.ramos@example.com',
                'telefono' => '3874222333',
                'direccion' => 'Calle Güemes 456',
                'localidad' => 'Salta',
                'especialidad' => 'Preparador Físico',
                'estado' => true,
            ]
        );

        Profesor::updateOrCreate(
            ['dni' => '29333444'],
            [
                'nombre' => 'Luciano',
                'apellido' => 'Pérez',
                'email' => 'luciano.perez@example.com',
                'telefono' => '3874333444',
                'direccion' => 'Calle Belgrano 789',
                'localidad' => 'Salta',
                'especialidad' => 'Entrenador Infantil',
                'estado' => true,
            ]
        );

        Profesor::updateOrCreate(
            ['dni' => '30444555'],
            [
                'nombre' => 'Gabriel',
                'apellido' => 'Molina',
                'email' => 'gabriel.molina@example.com',
                'telefono' => '3874444555',
                'direccion' => 'Calle Alvarado 321',
                'localidad' => 'Salta',
                'especialidad' => 'Entrenador de Arqueros',
                'estado' => true,
            ]
        );
    }
}