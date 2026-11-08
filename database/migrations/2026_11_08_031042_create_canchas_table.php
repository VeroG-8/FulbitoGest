<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('canchas', function (Blueprint $table) {
            $table->id();

            $table->foreignId('predio_id')
                ->constrained('predios')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->boolean('estado')->default(true);

            $table->timestamps();

            $table->unique(['predio_id', 'nombre']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('canchas');
    }
};