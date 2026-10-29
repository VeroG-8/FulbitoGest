<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('torneo_categoria', function (Blueprint $table) {
            $table->decimal('monto_por_jugador', 10, 2)
                ->default(0)
                ->after('monto_inscripcion');
        });
    }

    public function down(): void
    {
        Schema::table('torneo_categoria', function (Blueprint $table) {
            $table->dropColumn('monto_por_jugador');
        });
    }
};