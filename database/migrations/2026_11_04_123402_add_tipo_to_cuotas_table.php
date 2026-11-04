<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cuotas', function (Blueprint $table) {
            $table->string('tipo', 30)
                ->default('cuota_mensual')
                ->after('descripcion');
        });

        DB::table('cuotas')
            ->where('nombre', 'like', 'Inscripción%')
            ->update([
                'tipo' => 'inscripcion_torneo',
            ]);
    }

    public function down(): void
    {
        Schema::table('cuotas', function (Blueprint $table) {
            $table->dropColumn('tipo');
        });
    }
};