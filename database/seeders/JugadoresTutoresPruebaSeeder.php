<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Jugador;
use App\Models\Tutor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class JugadoresTutoresPruebaSeeder extends Seeder
{
    private int $dniJugador = 60000000;
    private int $dniTutor = 70000000;

    public function run(): void
    {
        $anios = [2012, 2013, 2014, 2015, 2016, 2017, 2018];

        $categorias = Categoria::whereIn('anio', $anios)
            ->get()
            ->keyBy(fn ($categoria) => (int) $categoria->anio);

        // Verificar que existan todas las categorías.
        $categoriasFaltantes = array_diff($anios, $categorias->keys()->all());

        if (!empty($categoriasFaltantes)) {
            throw new RuntimeException(
                'No se encontraron las siguientes categorías: '
                . implode(', ', $categoriasFaltantes)
            );
        }

        DB::transaction(function () use ($anios, $categorias) {

            foreach ($anios as $anio) {

                $categoria = $categorias[$anio];

                // Contar todos los jugadores existentes, activos e inactivos.
                $totalActual = Jugador::where('categoria_id', $categoria->id)
                    ->count();

                $objetivo = 12;

                $faltantes = $objetivo - $totalActual;

                if ($faltantes <= 0) {

                    if ($faltantes < 0) {
                        $this->command->warn(
                            "Categoría {$anio}: tiene {$totalActual} jugadores. "
                            . 'Supera el objetivo de 12. No se modificará ningún registro.'
                        );
                    } else {
                        $this->command->info(
                            "Categoría {$anio}: ya tiene 12 jugadores. Sin cambios."
                        );
                    }

                    continue;
                }

                $jugadoresNuevos = [];

                // Crear solamente los jugadores que faltan.
                for ($i = 0; $i < $faltantes; $i++) {

                    $jugador = Jugador::create([
                        'dni' => $this->nuevoDniJugador(),

                        'nombre' => $this->nombreJugador($i),
                        'apellido' => $this->apellidoJugador($i),

                        'nacionalidad' => 'Argentina',

                        'fecha_nacimiento' => sprintf(
                            '%04d-%02d-%02d',
                            $anio,
                            ($i % 12) + 1,
                            ($i % 27) + 1
                        ),

                        'telefono' => '3876' . str_pad(
                            (string) ($this->dniJugador % 1000000),
                            6,
                            '0',
                            STR_PAD_LEFT
                        ),

                        'direccion' => $this->direccion($i),
                        'localidad' => 'Salta',

                        'categoria_id' => $categoria->id,
                        'estado' => true,
                    ]);

                    $jugadoresNuevos[] = $jugador;
                }

                /*
                 * Agrupar los jugadores nuevos de a dos.
                 * Cada grupo comparte los mismos dos tutores,
                 * simulando hermanos de una misma familia.
                 */
                $familias = array_chunk($jugadoresNuevos, 2);

                foreach ($familias as $indice => $familia) {

                    $tutorMadre = $this->crearTutor(
                        $indice,
                        'Madre'
                    );

                    $tutorPadre = $this->crearTutor(
                        $indice,
                        'Padre'
                    );

                    foreach ($familia as $jugador) {

                        $jugador->tutores()->attach(
                            $tutorMadre->id,
                            [
                                'parentesco' => 'Madre',
                                'es_tutor_principal' => true,
                            ]
                        );

                        $jugador->tutores()->attach(
                            $tutorPadre->id,
                            [
                                'parentesco' => 'Padre',
                                'es_tutor_principal' => false,
                            ]
                        );
                    }
                }

                $this->command->info(
                    "Categoría {$anio}: se agregaron {$faltantes} jugadores. "
                    . 'Total final: ' . ($totalActual + $faltantes) . '/12.'
                );
            }
        });

        $this->command->info(
            'Proceso finalizado. No se modificaron ni eliminaron registros existentes.'
        );
    }

    private function crearTutor(int $indice, string $parentesco): Tutor
    {
        $nombresMadres = [
            'Luciana',
            'Gabriela',
            'Mariana',
            'Carolina',
            'Patricia',
            'Silvia',
            'Natalia',
            'Andrea',
            'Claudia',
            'Romina',
        ];

        $nombresPadres = [
            'Federico',
            'Gabriel',
            'Marcelo',
            'Sebastián',
            'Diego',
            'Martín',
            'Pablo',
            'Ricardo',
            'Javier',
            'Andrés',
        ];

        $apellidos = [
            'Gutiérrez',
            'Romero',
            'Díaz',
            'Sánchez',
            'Torres',
            'Álvarez',
            'Ruiz',
            'Castro',
            'Molina',
            'Herrera',
        ];

        $dni = $this->nuevoDniTutor();

        $nombre = $parentesco === 'Madre'
            ? $nombresMadres[$indice % count($nombresMadres)]
            : $nombresPadres[$indice % count($nombresPadres)];

        $apellido = $apellidos[$indice % count($apellidos)];

        return Tutor::create([
            'dni' => $dni,
            'nombre' => $nombre,
            'apellido' => $apellido,
            'email' => "familia.{$dni}@example.com",
            'telefono' => '3876' . substr($dni, -6),
            'direccion' => $this->direccion($indice),
            'localidad' => 'Salta',
            'estado' => true,
        ]);
    }

    private function nuevoDniJugador(): string
    {
        while (Jugador::where('dni', (string) $this->dniJugador)->exists()) {
            $this->dniJugador++;
        }

        return (string) $this->dniJugador++;
    }

    private function nuevoDniTutor(): string
    {
        while (Tutor::where('dni', (string) $this->dniTutor)->exists()) {
            $this->dniTutor++;
        }

        return (string) $this->dniTutor++;
    }

    private function nombreJugador(int $indice): string
    {
        $nombres = [
            'Tomás',
            'Benjamín',
            'Joaquín',
            'Franco',
            'Lautaro',
            'Valentín',
            'Bautista',
            'Thiago',
            'Santino',
            'Facundo',
            'Nicolás',
            'Agustín',
        ];

        return $nombres[$indice % count($nombres)];
    }

    private function apellidoJugador(int $indice): string
    {
        $apellidos = [
            'Gutiérrez',
            'Romero',
            'Díaz',
            'Sánchez',
            'Torres',
            'Álvarez',
            'Ruiz',
            'Castro',
            'Molina',
            'Herrera',
            'Medina',
            'Suárez',
        ];

        return $apellidos[$indice % count($apellidos)];
    }

    private function direccion(int $indice): string
    {
        $direcciones = [
            'Av. San Martín 125',
            'Calle Mitre 230',
            'Av. Belgrano 450',
            'Calle España 315',
            'Calle Alvarado 520',
            'Av. Entre Ríos 180',
            'Calle Caseros 640',
            'Calle Buenos Aires 275',
            'Av. Sarmiento 390',
            'Calle Córdoba 150',
        ];

        return $direcciones[$indice % count($direcciones)];
    }
}