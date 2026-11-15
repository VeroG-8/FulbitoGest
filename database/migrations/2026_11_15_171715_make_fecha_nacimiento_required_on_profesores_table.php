<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profesores', function (Blueprint $table) {
            $table->date('fecha_nacimiento')
                ->nullable(false)
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('profesores', function (Blueprint $table) {
            $table->date('fecha_nacimiento')
                ->nullable()
                ->change();
        });
    }
};