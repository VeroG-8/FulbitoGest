<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('cuota_x_jugador_id')
                ->constrained('cuota_x_jugador')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('modalidad_pago_id')
                ->constrained('modalidades_pago')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->date('fecha_pago');

            $table->decimal('monto', 10, 2);

            $table->string('comprobante', 150)->nullable();

            $table->string('estado', 30)->default('confirmado');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};
