<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('tutor_id')
                ->nullable()
                ->unique()
                ->constrained('tutores')
                ->nullOnDelete();

            $table->foreignId('profesor_id')
                ->nullable()
                ->unique()
                ->constrained('profesores')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['tutor_id']);
            $table->dropForeign(['profesor_id']);

            $table->dropUnique(['tutor_id']);
            $table->dropUnique(['profesor_id']);

            $table->dropColumn(['tutor_id', 'profesor_id']);
        });
    }
};