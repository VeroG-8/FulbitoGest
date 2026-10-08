<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horarios', function (Blueprint $table) {
            $table->id();

            $table->foreignId('categoria_id')
                ->constrained('categorias')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->string('dia_semana');

            $table->time('hora_inicio');

            $table->time('hora_fin');

            $table->string('lugar')->nullable();

            $table->boolean('estado')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horarios');
    }
};