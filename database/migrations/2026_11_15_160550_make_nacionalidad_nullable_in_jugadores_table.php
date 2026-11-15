<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jugadores', function (Blueprint $table) {
            $table->string('nacionalidad', 50)
                ->nullable()
                ->default('Argentina')
                ->change();
        });
    }

    public function down(): void
    {
        Schema::table('jugadores', function (Blueprint $table) {
            $table->string('nacionalidad', 50)
                ->nullable(false)
                ->default('Argentina')
                ->change();
        });
    }
};