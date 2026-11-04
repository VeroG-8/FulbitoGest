<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cuotas', function (Blueprint $table) {
            $table->unsignedTinyInteger('periodo_mes')
                ->nullable()
                ->after('monto');

            $table->unsignedSmallInteger('periodo_anio')
                ->nullable()
                ->after('periodo_mes');
        });
    }

    public function down(): void
    {
        Schema::table('cuotas', function (Blueprint $table) {
            $table->dropColumn([
                'periodo_mes',
                'periodo_anio',
            ]);
        });
    }
};