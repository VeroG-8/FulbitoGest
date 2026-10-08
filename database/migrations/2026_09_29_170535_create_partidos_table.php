<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partidos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('torneo_id')
                ->constrained('torneos')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignId('equipo_local_id')
                ->constrained('equipos')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignId('equipo_visitante_id')
                ->constrained('equipos')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->date('fecha');
            $table->time('hora')->nullable();
            $table->string('lugar')->nullable();

            $table->unsignedTinyInteger('goles_local')->nullable();
            $table->unsignedTinyInteger('goles_visitante')->nullable();

            $table->string('estado')->default('programado');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partidos');
    }
};