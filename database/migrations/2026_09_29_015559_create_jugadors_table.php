<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jugadores', function (Blueprint $table) {
            $table->id();

            $table->string('dni', 20)->unique();

            $table->string('nombre', 100);
            $table->string('apellido', 100);
            $table->string('nacionalidad', 50)->default('Argentina');

            $table->date('fecha_nacimiento');

            $table->string('telefono', 30)->nullable();
            $table->string('direccion', 150)->nullable();
            $table->string('localidad', 100)->nullable();

            $table->foreignId('categoria_id')
                ->constrained('categorias')
                ->restrictOnDelete()
                ->cascadeOnUpdate();

            $table->boolean('estado')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jugadores');
    }
};