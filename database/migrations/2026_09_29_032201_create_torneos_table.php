<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('torneos', function (Blueprint $table) {
            $table->id();

            $table->string('nombre', 150);
            $table->string('organizador', 150)->nullable();

            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();

            $table->string('lugar', 150)->nullable();

            $table->text('descripcion')->nullable();

            $table->boolean('estado')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('torneos');
    }
};