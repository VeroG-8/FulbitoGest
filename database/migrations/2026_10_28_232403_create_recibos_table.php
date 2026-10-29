<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recibos', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('numero')->unique();

            $table->string('pago_type');
            $table->unsignedBigInteger('pago_id');

            $table->timestamps();

            $table->unique(['pago_type', 'pago_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recibos');
    }
};
