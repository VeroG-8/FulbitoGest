<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            2018,
            2017,
            2016,
            2015,
            2014,
            2013,
            2012,
        ];

        foreach ($categorias as $anio) {
            Categoria::updateOrCreate(
                ['anio' => $anio],
                [
                    'nombre' => (string) $anio,
                    'estado' => true,
                ]
            );
        }
    }
}