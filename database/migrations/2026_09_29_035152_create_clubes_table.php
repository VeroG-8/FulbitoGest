<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clubes', function (Blueprint $table) {
            $table->id();

            $table->string('nombre', 150);
            $table->string('localidad', 100)->nullable();
            $table->string('direccion', 150)->nullable();
            $table->string('telefono', 30)->nullable();
            $table->string('email', 150)->nullable();

            $table->boolean('estado')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clubes');
    }
};