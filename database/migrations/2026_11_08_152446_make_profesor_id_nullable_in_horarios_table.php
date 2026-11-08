<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profesor_categoria', function (Blueprint $table) {
            $table->unique('categoria_id', 'profesor_categoria_categoria_unique');
        });
    }

    public function down(): void
    {
        Schema::table('profesor_categoria', function (Blueprint $table) {
            $table->dropUnique('profesor_categoria_categoria_unique');
        });
    }
};