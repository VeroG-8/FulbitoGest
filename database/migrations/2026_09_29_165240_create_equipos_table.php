<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('club_id')
                ->constrained('clubes')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignId('categoria_id')
                ->constrained('categorias')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->string('nombre');

            $table->boolean('estado')->default(true);

            $table->timestamps();

            $table->unique([
                'club_id',
                'categoria_id',
                'nombre',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipos');
    }
};