<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recordatorios_vencimiento', function (Blueprint $table) {
            $table->id();

            $table->foreignId('cuota_x_jugador_id')
                ->constrained('cuota_x_jugador')
                ->cascadeOnDelete();

            $table->foreignId('tutor_id')
                ->nullable()
                ->constrained('tutores')
                ->nullOnDelete();

            $table->date('fecha_vencimiento');

            $table->string('email_destino');

            $table->string('estado', 20)->default('procesando');

            $table->unsignedSmallInteger('intentos')->default(1);

            $table->timestamp('enviado_en')->nullable();

            $table->text('error')->nullable();

            $table->timestamps();

            // Una notificación por asignación y fecha de vencimiento.
            $table->unique(
                ['cuota_x_jugador_id', 'fecha_vencimiento'],
                'recordatorio_asignacion_fecha_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recordatorios_vencimiento');
    }
};