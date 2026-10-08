<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('torneo_categoria', function (Blueprint $table) {
            $table->id();

            $table->foreignId('torneo_id')
                ->constrained('torneos')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('categoria_id')
                ->constrained('categorias')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->timestamps();

            $table->unique(['torneo_id', 'categoria_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('torneo_categoria');
    }
};