<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inscripciones_torneo', function (Blueprint $table) {
            $table->id();

            $table->foreignId('jugador_id')
                ->constrained('jugadores')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('torneo_id')
                ->constrained('torneos')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->date('fecha_inscripcion');

            $table->string('estado', 30)
                ->default('inscripto');

            $table->timestamps();

            $table->unique(['jugador_id', 'torneo_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inscripciones_torneo');
    }
};
