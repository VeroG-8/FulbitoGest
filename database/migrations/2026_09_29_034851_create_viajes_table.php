<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('viajes', function (Blueprint $table) {
            $table->id();

            $table->string('nombre', 150);
            $table->string('destino', 150);

            $table->date('fecha_salida');
            $table->date('fecha_regreso')->nullable();

            $table->string('medio_transporte', 100)->nullable();

            $table->decimal('costo', 10, 2)->nullable();

            $table->text('descripcion')->nullable();

            $table->boolean('estado')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('viajes');
    }
};