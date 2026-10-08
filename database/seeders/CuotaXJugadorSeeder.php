<?php

namespace Database\Seeders;

use App\Models\Cuota;
use App\Models\Jugador;
use App\Models\CuotaXJugador;
use Illuminate\Database\Seeder;

class CuotaXJugadorSeeder extends Seeder
{
    public function run(): void
    {
        $octubre = Cuota::where(
            'nombre',
            'Cuota mensual octubre 2026'
        )->first();

        $noviembre = Cuota::where(
            'nombre',
            'Cuota mensual noviembre 2026'
        )->first();

        $diciembre = Cuota::where(
            'nombre',
            'Cuota mensual diciembre 2026'
        )->first();

        $copaSalta = Cuota::where(
            'nombre',
            'Inscripción Copa Salta Infantil 2026'
        )->first();

        $copaFinDeAnio = Cuota::where(
            'nombre',
            'Inscripción Copa Fin de Año 2026'
        )->first();

        $mateo = Jugador::where('dni', '45123456')->first();
        $thiago = Jugador::where('dni', '45234567')->first();
        $santiago = Jugador::where('dni', '44345678')->first();
        $benjamin = Jugador::where('dni', '43456789')->first();
        $valentino = Jugador::where('dni', '42567890')->first();

        // Mateo
        
        CuotaXJugador::updateOrCreate(
            [
                'cuota_id' => $octubre->id,
                'jugador_id' => $mateo->id,
            ],
            [
                'fecha_asignacion' => '2026-09-25',
                'fecha_vencimiento' => '2026-10-10',
                'estado' => 'pendiente',
            ]
        );

        CuotaXJugador::updateOrCreate(
            [
                'cuota_id' => $noviembre->id,
                'jugador_id' => $mateo->id,
            ],
            [
                'fecha_asignacion' => '2026-10-11',
                'fecha_vencimiento' => '2026-11-10',
                'estado' => 'pendiente',
            ]
        );

        CuotaXJugador::updateOrCreate(
            [
                'cuota_id' => $copaSalta->id,
                'jugador_id' => $mateo->id,
            ],
            [
                'fecha_asignacion' => '2026-09-25',
                'fecha_vencimiento' => '2026-10-05',
                'estado' => 'pendiente',
            ]
        );

        // Thiago

        CuotaXJugador::updateOrCreate(
            [
                'cuota_id' => $octubre->id,
                'jugador_id' => $thiago->id,
            ],
            [
                'fecha_asignacion' => '2026-09-25',
                'fecha_vencimiento' => '2026-10-10',
                'estado' => 'pendiente',
            ]
        );

        CuotaXJugador::updateOrCreate(
            [
                'cuota_id' => $copaSalta->id,
                'jugador_id' => $thiago->id,
            ],
            [
                'fecha_asignacion' => '2026-09-25',
                'fecha_vencimiento' => '2026-10-05',
                'estado' => 'pendiente',
            ]
        );

        // Santiago

        CuotaXJugador::updateOrCreate(
            [
                'cuota_id' => $octubre->id,
                'jugador_id' => $santiago->id,
            ],
            [
                'fecha_asignacion' => '2026-09-25',
                'fecha_vencimiento' => '2026-10-10',
                'estado' => 'pendiente',
            ]
        );

        CuotaXJugador::updateOrCreate(
            [
                'cuota_id' => $noviembre->id,
                'jugador_id' => $santiago->id,
            ],
            [
                'fecha_asignacion' => '2026-10-11',
                'fecha_vencimiento' => '2026-11-10',
                'estado' => 'pendiente',
            ]
        );

        CuotaXJugador::updateOrCreate(
            [
                'cuota_id' => $copaSalta->id,
                'jugador_id' => $santiago->id,
            ],
            [
                'fecha_asignacion' => '2026-09-25',
                'fecha_vencimiento' => '2026-10-05',
                'estado' => 'pendiente',
            ]
        );

        CuotaXJugador::updateOrCreate(
            [
                'cuota_id' => $copaFinDeAnio->id,
                'jugador_id' => $santiago->id,
            ],
            [
                'fecha_asignacion' => '2026-09-25',
                'fecha_vencimiento' => '2026-11-25',
                'estado' => 'pendiente',
            ]
        );

        // Benjamín

        CuotaXJugador::updateOrCreate(
            [
                'cuota_id' => $octubre->id,
                'jugador_id' => $benjamin->id,
            ],
            [
                'fecha_asignacion' => '2026-09-25',
                'fecha_vencimiento' => '2026-10-10',
                'estado' => 'pendiente',
            ]
        );

        CuotaXJugador::updateOrCreate(
            [
                'cuota_id' => $copaFinDeAnio->id,
                'jugador_id' => $benjamin->id,
            ],
            [
                'fecha_asignacion' => '2026-09-25',
                'fecha_vencimiento' => '2026-11-25',
                'estado' => 'pendiente',
            ]
        );

        // Valentino

        CuotaXJugador::updateOrCreate(
            [
                'cuota_id' => $octubre->id,
                'jugador_id' => $valentino->id,
            ],
            [
                'fecha_asignacion' => '2026-09-25',
                'fecha_vencimiento' => '2026-10-10',
                'estado' => 'pendiente',
            ]
        );

        CuotaXJugador::updateOrCreate(
            [
                'cuota_id' => $noviembre->id,
                'jugador_id' => $valentino->id,
            ],
            [
                'fecha_asignacion' => '2026-10-11',
                'fecha_vencimiento' => '2026-11-10',
                'estado' => 'pendiente',
            ]
        );
    }
}