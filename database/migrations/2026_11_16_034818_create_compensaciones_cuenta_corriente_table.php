<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compensaciones_cuenta_corriente', function (Blueprint $table) {
            $table->id();

            $table->foreignId('jugador_id')
                ->constrained('jugadores')
                ->restrictOnDelete();

            $table->foreignId('movimiento_debito_id')
                ->constrained('movimientos_cuenta_corriente')
                ->restrictOnDelete();

            $table->foreignId('movimiento_credito_id')
                ->constrained('movimientos_cuenta_corriente')
                ->restrictOnDelete();

            $table->foreignId('reversion_de_id')
                ->nullable()
                ->constrained('compensaciones_cuenta_corriente')
                ->restrictOnDelete();

            $table->string('tipo', 20)->default('compensacion');
            $table->decimal('monto', 10, 2);

            $table->timestamps();

            $table->index(['jugador_id', 'created_at']);
            $table->index('movimiento_debito_id');
            $table->index('movimiento_credito_id');
            $table->index('reversion_de_id');
            $table->index('tipo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compensaciones_cuenta_corriente');
    }
};
