<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('historial_modificaciones_cuotas', function (Blueprint $table) {
            $table->id();

            $table->foreignId('cuota_id')
                ->nullable()
                ->constrained('cuotas')
                ->nullOnDelete();

            // Conservamos el nombre aunque la cuota se elimine.
            $table->string('cuota_nombre', 150);

            $table->decimal('monto_anterior', 10, 2);
            $table->decimal('monto_nuevo', 10, 2);

            // Diferencia: monto nuevo menos monto anterior.
            $table->decimal('diferencia', 10, 2);

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->text('observacion')->nullable();

            $table->timestamps();

            $table->index(['cuota_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historial_modificaciones_cuotas');
    }
};