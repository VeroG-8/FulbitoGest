<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CanchaController;

// Consultas
Route::get('/canchas', [CanchaController::class, 'index'])
    ->name('canchas.index');

Route::get('/canchas/historial', [CanchaController::class, 'historial'])
    ->name('canchas.historial');

// Gestión: solo administradores
Route::middleware('rol:admin')->group(function () {

    // Crear
    Route::get('/canchas/create', [CanchaController::class, 'create'])
        ->name('canchas.create');

    Route::post('/canchas', [CanchaController::class, 'store'])
        ->name('canchas.store');

    // Editar
    Route::get('/canchas/{cancha}/edit', [CanchaController::class, 'edit'])
        ->name('canchas.edit');

    Route::put('/canchas/{cancha}', [CanchaController::class, 'update'])
        ->name('canchas.update');

    // Desactivar y reactivar
    Route::delete('/canchas/{cancha}', [CanchaController::class, 'destroy'])
        ->name('canchas.destroy');

    Route::put('/canchas/{cancha}/reactivar', [CanchaController::class, 'reactivar'])
        ->name('canchas.reactivar');
});

// Mostrar: al final para evitar conflictos con rutas estáticas
Route::get('/canchas/{cancha}', [CanchaController::class, 'show'])
    ->name('canchas.show');