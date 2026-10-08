<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carnets', function (Blueprint $table) {
            $table->id();

            $table->foreignId('jugador_id')
                ->constrained('jugadores')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->string('codigo', 50)->unique();

            $table->string('qr_token', 100)->unique();

            $table->date('fecha_emision');
            $table->date('fecha_vencimiento');

            $table->enum('estado', [
                'activo',
                'vencido',
                'anulado'
            ])->default('activo');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carnets');
    }
};