<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('movimientos_cuenta_corriente', function (Blueprint $table) {
            $table->id();

            $table->foreignId('jugador_id')
                ->constrained('jugadores')
                ->restrictOnDelete();

            $table->foreignId('cuota_x_jugador_id')
                ->nullable()
                ->constrained('cuota_x_jugador')
                ->restrictOnDelete();

            $table->foreignId('historial_modificacion_cuota_id')
                ->nullable();

            $table->foreign('historial_modificacion_cuota_id', 'mov_cc_historial_fk')
                ->references('id')
                ->on('historial_modificaciones_cuotas')
                ->restrictOnDelete();

            $table->foreignId('movimiento_origen_id')
                ->nullable()
                ->constrained('movimientos_cuenta_corriente')
                ->restrictOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('tipo', 40);
            $table->decimal('monto', 10, 2);
            $table->text('descripcion')->nullable();

            $table->timestamps();

            $table->index(['jugador_id', 'created_at']);
            $table->index('cuota_x_jugador_id');
            $table->index(
                'historial_modificacion_cuota_id',
                'mov_cc_historial_idx'
            );
            $table->index('movimiento_origen_id');
            $table->index('tipo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimientos_cuenta_corriente');
    }
};
