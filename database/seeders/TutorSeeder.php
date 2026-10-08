<?php

namespace Database\Seeders;

use App\Models\Tutor;
use Illuminate\Database\Seeder;

class TutorSeeder extends Seeder
{
    public function run(): void
    {
        Tutor::updateOrCreate(
            ['dni' => '30111222'],
            [
                'nombre' => 'Carlos',
                'apellido' => 'Gómez',
                'email' => 'carlos.gomez@example.com',
                'telefono' => '3874111222',
                'direccion' => 'Av. Belgrano 123',
                'localidad' => 'Salta',
                'estado' => true,
            ]
        );

        Tutor::updateOrCreate(
            ['dni' => '30222333'],
            [
                'nombre' => 'Laura',
                'apellido' => 'Gómez',
                'email' => 'laura.gomez@example.com',
                'telefono' => '3874222333',
                'direccion' => 'Av. Belgrano 123',
                'localidad' => 'Salta',
                'estado' => true,
            ]
        );

        Tutor::updateOrCreate(
            ['dni' => '30333444'],
            [
                'nombre' => 'María',
                'apellido' => 'López',
                'email' => 'maria.lopez@example.com',
                'telefono' => '3874333444',
                'direccion' => 'Calle Mitre 456',
                'localidad' => 'Salta',
                'estado' => true,
            ]
        );

        Tutor::updateOrCreate(
            ['dni' => '30444555'],
            [
                'nombre' => 'Jorge',
                'apellido' => 'Martínez',
                'email' => 'jorge.martinez@example.com',
                'telefono' => '3874444555',
                'direccion' => 'Calle Alvarado 789',
                'localidad' => 'Salta',
                'estado' => true,
            ]
        );

        Tutor::updateOrCreate(
            ['dni' => '30555666'],
            [
                'nombre' => 'Ana',
                'apellido' => 'Fernández',
                'email' => 'ana.fernandez@example.com',
                'telefono' => '3874555666',
                'direccion' => 'Calle España 321',
                'localidad' => 'Salta',
                'estado' => true,
            ]
        );
    }
}