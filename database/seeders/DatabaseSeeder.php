<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CategoriaSeeder::class,
            JugadorSeeder::class,
            TutorSeeder::class,
            JugadorTutorSeeder::class,
            CarnetSeeder::class,
            ProfesorSeeder::class,
            ProfesorCategoriaSeeder::class,
            TorneoSeeder::class,
            TorneoCategoriaSeeder::class,
            InscripcionTorneoSeeder::class,
            ModalidadPagoSeeder::class,
            CuotaSeeder::class,
            CuotaXJugadorSeeder::class,
            PagoSeeder::class,
            ViajeSeeder::class,
            JugadorViajeSeeder::class,
            ClubSeeder::class,
            PaseSeeder::class,
            HorarioSeeder::class,
            EquipoSeeder::class,
            PartidoSeeder::class,
            UserSeeder::class,
        ]);
    }
}