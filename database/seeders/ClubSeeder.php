<?php

namespace Database\Seeders;

use App\Models\Club;
use Illuminate\Database\Seeder;

class ClubSeeder extends Seeder
{
    public function run(): void
    {
        Club::updateOrCreate(
            ['nombre' => 'Club Deportivo Salta'],
            [
                'localidad' => 'Salta',
                'direccion' => 'Av. Entre Ríos 850',
                'telefono' => '3874551000',
                'email' => 'contacto@clubdeportivosalta.com',
                'estado' => true,
            ]
        );

        Club::updateOrCreate(
            ['nombre' => 'Club Los Pumas'],
            [
                'localidad' => 'Salta',
                'direccion' => 'Av. Bolivia 1200',
                'telefono' => '3874552000',
                'email' => 'info@clublospumas.com',
                'estado' => true,
            ]
        );

        Club::updateOrCreate(
            ['nombre' => 'Club Atlético Jujuy'],
            [
                'localidad' => 'San Salvador de Jujuy',
                'direccion' => 'Av. El Éxodo 450',
                'telefono' => '3884553000',
                'email' => 'contacto@clubatleticojujuy.com',
                'estado' => true,
            ]
        );

        Club::updateOrCreate(
            ['nombre' => 'Escuela de Fútbol Norte'],
            [
                'localidad' => 'Salta',
                'direccion' => 'Calle Zuviría 950',
                'telefono' => '3874554000',
                'email' => 'info@escuelafutbolnorte.com',
                'estado' => true,
            ]
        );
        
        Club::updateOrCreate(
            ['nombre' => 'Club FulbitoGest'],
            [
                'localidad' => 'Salta',
                'direccion' => 'Av. Principal 100',
                'telefono' => '3874000000',
                'email' => 'contacto@fulbitogest.com',
                'estado' => true,
            ],
        );
    }
}