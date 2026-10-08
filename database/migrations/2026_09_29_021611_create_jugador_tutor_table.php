<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jugador_tutor', function (Blueprint $table) {
            $table->id();

            $table->foreignId('jugador_id')
                ->constrained('jugadores')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('tutor_id')
                ->constrained('tutores')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->string('parentesco', 50);

            $table->boolean('es_tutor_principal')
                ->default(false);

            $table->timestamps();

            $table->unique(['jugador_id', 'tutor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jugador_tutor');
    }
};