<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Eliminar la columna nombre de categorias.
     */
    public function up(): void
    {
        if (Schema::hasColumn('categorias', 'nombre')) {
            Schema::table('categorias', function (Blueprint $table) {
                $table->dropColumn('nombre');
            });
        }
    }

    /**
     * Restaurar la columna nombre utilizando el año de cada categoría.
     */
    public function down(): void
    {
        if (!Schema::hasColumn('categorias', 'nombre')) {
            Schema::table('categorias', function (Blueprint $table) {
                $table->string('nombre', 100)->nullable();
            });

            DB::table('categorias')->update([
                'nombre' => DB::raw('CAST(anio AS CHAR)')
            ]);
        }
    }
};