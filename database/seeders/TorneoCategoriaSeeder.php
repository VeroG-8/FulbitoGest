<?php

namespace Database\Seeders;

use App\Models\Torneo;
use App\Models\Categoria;
use Illuminate\Database\Seeder;

class TorneoCategoriaSeeder extends Seeder
{
    public function run(): void
    {
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

        $categoria2018 = Categoria::where('anio', 2018)->first();
        $categoria2017 = Categoria::where('anio', 2017)->first();
        $categoria2016 = Categoria::where('anio', 2016)->first();
        $categoria2015 = Categoria::where('anio', 2015)->first();

        $copaSalta->categorias()->syncWithoutDetaching([
            $categoria2018->id,
            $categoria2017->id,
            $categoria2016->id,
        ]);

        $torneoPrimavera->categorias()->syncWithoutDetaching([
            $categoria2017->id,
            $categoria2016->id,
            $categoria2015->id,
        ]);

        $copaFinDeAnio->categorias()->syncWithoutDetaching([
            $categoria2018->id,
            $categoria2017->id,
            $categoria2016->id,
            $categoria2015->id,
        ]);
    }
}