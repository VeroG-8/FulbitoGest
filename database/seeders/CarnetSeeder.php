<?php

namespace Database\Seeders;

use App\Models\Carnet;
use App\Models\Jugador;
use Illuminate\Database\Seeder;

class CarnetSeeder extends Seeder
{
    public function run(): void
    {
        $jugadores = Jugador::all();

        foreach ($jugadores as $jugador) {
            Carnet::firstOrCreate(
                ['jugador_id' => $jugador->id],
                [
                    'codigo' => 'CAR-' . str_pad($jugador->id, 4, '0', STR_PAD_LEFT),
                    'qr_token' => 'QR-' . bin2hex(random_bytes(16)),
                    'fecha_emision' => '2026-01-01',
                    'fecha_vencimiento' => '2026-12-31',
                    'estado' => 'activo',
                ]
            );
        }
    }
}