<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cuota_x_jugador', function (Blueprint $table) {
            $table->id();

            $table->foreignId('cuota_id')
                ->constrained('cuotas')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('jugador_id')
                ->constrained('jugadores')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->date('fecha_asignacion');

            $table->date('fecha_vencimiento');

            $table->string('estado', 30)->default('pendiente');

            $table->timestamps();

            $table->unique(['cuota_id', 'jugador_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cuota_x_jugador');
    }
};