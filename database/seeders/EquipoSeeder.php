<?php

namespace Database\Seeders;

use App\Models\Club;
use App\Models\Categoria;
use App\Models\Equipo;
use Illuminate\Database\Seeder;

class EquipoSeeder extends Seeder
{
    public function run(): void
    {
        $fulbitoGest = Club::where('nombre', 'Club FulbitoGest')->first();
        $deportivoSalta = Club::where('nombre', 'Club Deportivo Salta')->first();
        $losPumas = Club::where('nombre', 'Club Los Pumas')->first();
        $atleticoJujuy = Club::where('nombre', 'Club Atlético Jujuy')->first();
        $escuelaNorte = Club::where('nombre', 'Escuela de Fútbol Norte')->first();

        $equipos = [
            // FulbitoGest
            ['club' => $fulbitoGest, 'anio' => 2018, 'nombre' => 'FulbitoGest 2018'],
            ['club' => $fulbitoGest, 'anio' => 2017, 'nombre' => 'FulbitoGest 2017'],
            ['club' => $fulbitoGest, 'anio' => 2016, 'nombre' => 'FulbitoGest 2016'],
            ['club' => $fulbitoGest, 'anio' => 2015, 'nombre' => 'FulbitoGest 2015'],
            ['club' => $fulbitoGest, 'anio' => 2014, 'nombre' => 'FulbitoGest 2014'],
            ['club' => $fulbitoGest, 'anio' => 2013, 'nombre' => 'FulbitoGest 2013'],
            ['club' => $fulbitoGest, 'anio' => 2012, 'nombre' => 'FulbitoGest 2012'],

            // Club Deportivo Salta
            ['club' => $deportivoSalta, 'anio' => 2018, 'nombre' => 'Deportivo Salta A'],
            ['club' => $deportivoSalta, 'anio' => 2018, 'nombre' => 'Deportivo Salta B'],
            ['club' => $deportivoSalta, 'anio' => 2017, 'nombre' => 'Deportivo Salta A'],
            ['club' => $deportivoSalta, 'anio' => 2016, 'nombre' => 'Deportivo Salta A'],

            // Club Los Pumas
            ['club' => $losPumas, 'anio' => 2017, 'nombre' => 'Los Pumas A'],
            ['club' => $losPumas, 'anio' => 2017, 'nombre' => 'Los Pumas B'],
            ['club' => $losPumas, 'anio' => 2016, 'nombre' => 'Los Pumas A'],
            ['club' => $losPumas, 'anio' => 2015, 'nombre' => 'Los Pumas A'],

            // Club Atlético Jujuy
            ['club' => $atleticoJujuy, 'anio' => 2016, 'nombre' => 'Atlético Jujuy A'],
            ['club' => $atleticoJujuy, 'anio' => 2016, 'nombre' => 'Atlético Jujuy B'],
            ['club' => $atleticoJujuy, 'anio' => 2015, 'nombre' => 'Atlético Jujuy A'],

            // Escuela de Fútbol Norte
            ['club' => $escuelaNorte, 'anio' => 2015, 'nombre' => 'Escuela Norte A'],
            ['club' => $escuelaNorte, 'anio' => 2014, 'nombre' => 'Escuela Norte A'],
        ];

        foreach ($equipos as $equipo) {
            $categoria = Categoria::where('anio', $equipo['anio'])->first();

            Equipo::updateOrCreate(
                [
                    'club_id' => $equipo['club']->id,
                    'categoria_id' => $categoria->id,
                    'nombre' => $equipo['nombre'],
                ],
                [
                    'estado' => true,
                ]
            );
        }
    }
}