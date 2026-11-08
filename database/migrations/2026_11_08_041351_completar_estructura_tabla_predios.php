<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('predios', function (Blueprint $table) {
            $table->string('nombre');
            $table->string('direccion')->nullable();
            $table->string('localidad')->nullable();
            $table->text('descripcion')->nullable();
            $table->boolean('estado')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('predios', function (Blueprint $table) {
            $table->dropColumn([
                'nombre',
                'direccion',
                'localidad',
                'descripcion',
                'estado',
            ]);
        });
    }
};