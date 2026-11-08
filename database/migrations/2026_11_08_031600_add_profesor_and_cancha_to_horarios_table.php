<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('horarios', function (Blueprint $table) {
            $table->foreignId('profesor_id')
                ->constrained('profesores')
                ->restrictOnDelete();

            $table->foreignId('cancha_id')
                ->constrained('canchas')
                ->restrictOnDelete();

            $table->dropColumn('lugar');
        });
    }

    public function down(): void
    {
        Schema::table('horarios', function (Blueprint $table) {
            $table->dropForeign(['profesor_id']);
            $table->dropForeign(['cancha_id']);

            $table->dropColumn([
                'profesor_id',
                'cancha_id',
            ]);

            $table->string('lugar')->nullable();
        });
    }
};