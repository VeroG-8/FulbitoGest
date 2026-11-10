<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $columnas = [
            'nombre' => fn (Blueprint $table) => $table->string('nombre'),
            'direccion' => fn (Blueprint $table) => $table->string('direccion')->nullable(),
            'localidad' => fn (Blueprint $table) => $table->string('localidad')->nullable(),
            'descripcion' => fn (Blueprint $table) => $table->text('descripcion')->nullable(),
            'estado' => fn (Blueprint $table) => $table->boolean('estado')->default(true),
        ];

        foreach ($columnas as $nombre => $crearColumna) {
            if (!Schema::hasColumn('predios', $nombre)) {
                Schema::table('predios', function (Blueprint $table) use ($crearColumna) {
                    $crearColumna($table);
                });
            }
        }
    }

    public function down(): void
    {
        // No eliminar columnas que también forman parte de la migración original.
    }
};