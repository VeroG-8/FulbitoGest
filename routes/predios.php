<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PredioController;

// Consultas
Route::get('/predios', [PredioController::class, 'index'])
    ->name('predios.index');

Route::get('/predios/historial', [PredioController::class, 'historial'])
    ->name('predios.historial');

// Gestión: solo administradores
Route::middleware('rol:admin')->group(function () {

    // Crear
    Route::get('/predios/create', [PredioController::class, 'create'])
        ->name('predios.create');

    Route::post('/predios', [PredioController::class, 'store'])
        ->name('predios.store');

    // Editar
    Route::get('/predios/{predio}/edit', [PredioController::class, 'edit'])
        ->name('predios.edit');

    Route::put('/predios/{predio}', [PredioController::class, 'update'])
        ->name('predios.update');

    // Desactivar y reactivar
    Route::delete('/predios/{predio}', [PredioController::class, 'destroy'])
        ->name('predios.destroy');

    Route::put('/predios/{predio}/reactivar', [PredioController::class, 'reactivar'])
        ->name('predios.reactivar');
});

// Mostrar: siempre después de las rutas estáticas
Route::get('/predios/{predio}', [PredioController::class, 'show'])
    ->name('predios.show');