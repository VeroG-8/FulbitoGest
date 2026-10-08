<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cuotas', function (Blueprint $table) {
            $table->id();

            $table->string('nombre', 150);
            $table->text('descripcion')->nullable();

            $table->decimal('monto', 10, 2);

            $table->date('fecha_vencimiento')->nullable();

            $table->boolean('estado')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cuotas');
    }
};