<?php

namespace App\Console\Commands;

use App\Mail\RecordatorioVencimientoCuota;
use App\Models\CuotaXJugador;
use App\Models\Tutor;
use App\Services\SaldoCuotaService;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Throwable;

class EnviarRecordatoriosVencimiento extends Command
{
    protected $signature = 'cuotas:recordatorios-vencimiento
                            {--fecha= : Fecha de vencimiento que se desea procesar (YYYY-MM-DD)}
                            {--dry-run : Simular los envíos sin enviar correos}';

    protected $description = 'Enviar recordatorios de cuotas próximas a vencer.';

    private const ZONA_HORARIA = 'America/Argentina/Salta';

    public function handle(SaldoCuotaService $saldoCuotaService): int
    {
        try {
            $fechaVencimiento = $this->option('fecha')
                ? CarbonImmutable::parse(
                    $this->option('fecha'),
                    self::ZONA_HORARIA
                )->toDateString()
                : CarbonImmutable::now(self::ZONA_HORARIA)
                    ->addDay()
                    ->toDateString();
        } catch (Throwable $e) {
            $this->error('La fecha indicada no es válida.');

            return self::FAILURE;
        }

        $modoPrueba = $this->option('dry-run');

        $this->info(
            "Buscando cuotas con vencimiento: {$fechaVencimiento}"
        );

        if ($modoPrueba) {
            $this->warn('MODO PRUEBA: no se enviarán correos.');
        }

        $asignaciones = CuotaXJugador::query()
            ->where('estado', '!=', 'anulada')
            ->whereDate('fecha_vencimiento', $fechaVencimiento)
            ->with([
                'cuota',

                'jugador.tutores' => function ($query) {
                    $query->orderByPivot(
                        'es_tutor_principal',
                        'desc'
                    )->orderBy('tutores.id');
                },

                'pagos' => function ($query) {
                    $query->where('estado', 'confirmado');
                },

                'aplicacionesCredito',
            ])
            ->orderBy('id')
            ->get();

        if ($asignaciones->isEmpty()) {
            $this->info('No se encontraron cuotas para procesar.');

            return self::SUCCESS;
        }

        $enviados = 0;
        $omitidos = 0;
        $fallidos = 0;

        foreach ($asignaciones as $asignacion) {
            try {
                $resumen = $saldoCuotaService->calcularResumen(
                    $asignacion
                );

                // No enviar si la cuota ya está completamente cubierta.
                if ($resumen['saldo_pendiente'] <= 0) {
                    $this->line(
                        "Omitida asignación #{$asignacion->id}: sin saldo pendiente."
                    );

                    $omitidos++;

                    continue;
                }

                // Buscar primero al tutor principal.
                // Si no tiene correo válido, se utiliza otro tutor asociado.
                $tutores = $asignacion->jugador?->tutores ?? collect();

                $tutor = $tutores->first(function ($tutor) {
                    return filter_var(
                        trim((string) $tutor->email),
                        FILTER_VALIDATE_EMAIL
                    ) !== false;
                });

                if (!$tutor) {
                    $this->warn(
                        "Asignación #{$asignacion->id}: no hay tutores con correo válido."
                    );

                    $omitidos++;

                    continue;
                }

                $email = trim($tutor->email);

                $nombreTutor = trim(
                    $tutor->nombre . ' ' . $tutor->apellido
                );

                $nombreJugador = trim(
                    ($asignacion->jugador?->nombre ?? '') . ' ' .
                    ($asignacion->jugador?->apellido ?? '')
                );

                $nombreCuota = $asignacion->cuota?->nombre
                    ?? 'Cuota';

                $fechaFormateada = $asignacion->fecha_vencimiento
                    ? $asignacion->fecha_vencimiento->format('d/m/Y')
                    : $fechaVencimiento;

                if ($modoPrueba) {
                    $this->line(
                        "Asignación #{$asignacion->id} | " .
                        "{$nombreJugador} | {$email} | " .
                        'Saldo: $' .
                        number_format(
                            $resumen['saldo_pendiente'],
                            2,
                            ',',
                            '.'
                        )
                    );

                    $enviados++;

                    continue;
                }

                // Reservar el recordatorio para evitar duplicados.
                $reservado = $this->reservarRecordatorio(
                    $asignacion,
                    $tutor,
                    $fechaVencimiento,
                    $email
                );

                if (!$reservado) {
                    $this->line(
                        "Asignación #{$asignacion->id}: recordatorio ya registrado o en proceso."
                    );

                    $omitidos++;

                    continue;
                }

                // Enviar el correo.
                Mail::to($email)->send(
                    new RecordatorioVencimientoCuota(
                        nombreTutor: $nombreTutor,
                        nombreJugador: $nombreJugador,
                        nombreCuota: $nombreCuota,
                        fechaVencimiento: $fechaFormateada,
                        saldoPendiente: $resumen['saldo_pendiente']
                    )
                );

                // Registrar el envío exitoso.
                DB::table('recordatorios_vencimiento')
                    ->where('cuota_x_jugador_id', $asignacion->id)
                    ->where('fecha_vencimiento', $fechaVencimiento)
                    ->update([
                        'estado' => 'enviado',
                        'enviado_en' => now(),
                        'error' => null,
                        'updated_at' => now(),
                    ]);

                $this->info(
                    "Recordatorio enviado a {$email}."
                );

                $enviados++;

            } catch (Throwable $e) {
                $fallidos++;

                // Registrar el error sin marcar el correo como enviado.
                DB::table('recordatorios_vencimiento')
                    ->where('cuota_x_jugador_id', $asignacion->id)
                    ->where('fecha_vencimiento', $fechaVencimiento)
                    ->where('estado', 'procesando')
                    ->update([
                        'estado' => 'fallido',
                        'error' => mb_substr($e->getMessage(), 0, 5000),
                        'updated_at' => now(),
                    ]);

                report($e);

                $this->error(
                    "Error en asignación #{$asignacion->id}: {$e->getMessage()}"
                );
            }
        }

        $this->newLine();

        $this->info('Resumen del proceso:');
        $this->line("Procesados correctamente: {$enviados}");
        $this->line("Omitidos: {$omitidos}");
        $this->line("Fallidos: {$fallidos}");

        return $fallidos > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * Reservar el envío de un recordatorio.
     *
     * Los registros enviados no se vuelven a procesar.
     * Los registros fallidos pueden reintentarse.
     */
    private function reservarRecordatorio(
        CuotaXJugador $asignacion,
        Tutor $tutor,
        string $fechaVencimiento,
        string $email
    ): bool {
        return DB::transaction(function () use (
            $asignacion,
            $tutor,
            $fechaVencimiento,
            $email
        ) {
            $registro = DB::table('recordatorios_vencimiento')
                ->where('cuota_x_jugador_id', $asignacion->id)
                ->where('fecha_vencimiento', $fechaVencimiento)
                ->lockForUpdate()
                ->first();

            if (!$registro) {
                $insertados = DB::table('recordatorios_vencimiento')
                    ->insertOrIgnore([
                        'cuota_x_jugador_id' => $asignacion->id,
                        'tutor_id' => $tutor->id,
                        'fecha_vencimiento' => $fechaVencimiento,
                        'email_destino' => $email,
                        'estado' => 'procesando',
                        'intentos' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                if ($insertados > 0) {
                    return true;
                }

                // Otro proceso pudo insertar el mismo registro.
                $registro = DB::table('recordatorios_vencimiento')
                    ->where('cuota_x_jugador_id', $asignacion->id)
                    ->where('fecha_vencimiento', $fechaVencimiento)
                    ->lockForUpdate()
                    ->first();

                if (!$registro) {
                    return false;
                }
            }

            if ($registro->estado !== 'fallido') {
                return false;
            }

            // Reintentar un envío que falló anteriormente.
            DB::table('recordatorios_vencimiento')
                ->where('id', $registro->id)
                ->update([
                    'tutor_id' => $tutor->id,
                    'email_destino' => $email,
                    'estado' => 'procesando',
                    'intentos' => DB::raw('intentos + 1'),
                    'error' => null,
                    'updated_at' => now(),
                ]);

            return true;
        });
    }
}