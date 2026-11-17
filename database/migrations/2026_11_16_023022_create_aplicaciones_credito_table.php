<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('aplicaciones_credito', function (Blueprint $table) {
            $table->id();

            $table->foreignId('jugador_id')
                ->constrained('jugadores')
                ->restrictOnDelete();

            $table->foreignId('movimiento_credito_id')
                ->constrained('movimientos_cuenta_corriente')
                ->restrictOnDelete();

            $table->foreignId('cuota_x_jugador_id')
                ->constrained('cuota_x_jugador')
                ->restrictOnDelete();

            $table->foreignId('reversion_de_id')
                ->nullable()
                ->constrained('aplicaciones_credito')
                ->restrictOnDelete();

            $table->string('tipo', 20)->default('aplicacion');
            $table->decimal('monto', 10, 2);

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->text('observacion')->nullable();

            $table->timestamps();

            $table->index(['jugador_id', 'created_at']);
            $table->index('movimiento_credito_id');
            $table->index('cuota_x_jugador_id');
            $table->index('reversion_de_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('aplicaciones_credito');
    }
};
