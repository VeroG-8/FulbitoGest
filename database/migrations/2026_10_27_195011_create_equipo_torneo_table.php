<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('equipo_torneo', function (Blueprint $table) {

            $table->id();

            // Torneo al que se inscribe el equipo
            $table->foreignId('torneo_id')
                ->constrained('torneos')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // Equipo participante
            $table->foreignId('equipo_id')
                ->constrained('equipos')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // Fecha de inscripción
            $table->date('fecha_inscripcion');

            // Estado de la inscripción
            $table->boolean('estado')->default(true);

            $table->timestamps();

            // Evitar inscribir dos veces el mismo equipo
            // en un mismo torneo
            $table->unique(['torneo_id', 'equipo_id']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipo_torneo');
    }
};