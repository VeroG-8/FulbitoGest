<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pases', function (Blueprint $table) {
            $table->id();

            $table->foreignId('jugador_id')
                ->constrained('jugadores')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('club_origen_id')
                ->nullable()
                ->constrained('clubes')
                ->cascadeOnUpdate();

            $table->foreignId('club_destino_id')
                ->nullable()
                ->constrained('clubes')
                ->cascadeOnUpdate();

            $table->enum('tipo', [
                'propio',
                'prestamo',
                'transferencia'
            ]);

            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->text('observaciones')->nullable();
            $table->boolean('estado')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pases');
    }
};