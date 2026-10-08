<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profesor_categoria', function (Blueprint $table) {
            $table->id();

            $table->foreignId('profesor_id')
                ->constrained('profesores')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('categoria_id')
                ->constrained('categorias')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->timestamps();

            $table->unique(['profesor_id', 'categoria_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profesor_categoria');
    }
};
