<?php

namespace Database\Seeders;

use App\Models\Profesor;
use App\Models\Categoria;
use Illuminate\Database\Seeder;

class ProfesorCategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $marcelo = Profesor::where('dni', '27111222')->first();
        $diego = Profesor::where('dni', '28222333')->first();
        $luciano = Profesor::where('dni', '29333444')->first();
        $gabriel = Profesor::where('dni', '30444555')->first();

        $categoria2018 = Categoria::where('anio', 2018)->first();
        $categoria2017 = Categoria::where('anio', 2017)->first();
        $categoria2016 = Categoria::where('anio', 2016)->first();
        $categoria2015 = Categoria::where('anio', 2015)->first();

        $marcelo->categorias()->syncWithoutDetaching([
            $categoria2018->id,
            $categoria2017->id,
        ]);

        $diego->categorias()->syncWithoutDetaching([
            $categoria2016->id,
            $categoria2015->id,
        ]);

        $luciano->categorias()->syncWithoutDetaching([
            $categoria2018->id,
            $categoria2017->id,
            $categoria2016->id,
        ]);

        $gabriel->categorias()->syncWithoutDetaching([
            $categoria2015->id,
        ]);
    }
}