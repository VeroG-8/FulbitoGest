<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jugador_x_viaje', function (Blueprint $table) {
            $table->id();

            $table->foreignId('jugador_id')
                ->constrained('jugadores')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('viaje_id')
                ->constrained('viajes')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->string('estado', 30)->default('inscripto');

            $table->timestamps();

            $table->unique(['jugador_id', 'viaje_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jugador_x_viaje');
    }
};