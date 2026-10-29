<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EquipoController;

// Consultas: cualquier usuario autenticado.
// Más adelante limitaremos los resultados según el rol.
Route::get('/equipos', [EquipoController::class, 'index'])
    ->name('equipos.index');

Route::get('/equipos/{equipo}', [EquipoController::class, 'show'])
    ->name('equipos.show');

// Gestión de equipos: solo administradores.
Route::middleware('rol:admin')->group(function () {
    Route::get('/equipos/create', [EquipoController::class, 'create'])
        ->name('equipos.create');

    Route::post('/equipos', [EquipoController::class, 'store'])
        ->name('equipos.store');

    Route::get('/equipos/{equipo}/edit', [EquipoController::class, 'edit'])
        ->name('equipos.edit');

    Route::put('/equipos/{equipo}', [EquipoController::class, 'update'])
        ->name('equipos.update');

    Route::delete('/equipos/{equipo}', [EquipoController::class, 'destroy'])
        ->name('equipos.destroy');
});