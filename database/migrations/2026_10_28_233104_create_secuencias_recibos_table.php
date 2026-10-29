<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('secuencias_recibos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ultimo_numero')->default(0);
            $table->timestamps();
        });

        DB::table('secuencias_recibos')->insert([
            'id' => 1,
            'ultimo_numero' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('secuencias_recibos');
    }
};