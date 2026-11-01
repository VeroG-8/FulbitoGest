<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EquipoController;

// Consultas: cualquier usuario autenticado.
Route::get('/equipos', [EquipoController::class, 'index'])
    ->name('equipos.index');

// Gestión de equipos: solo administradores.
Route::middleware('rol:admin')->group(function () {

    // Crear equipo
    Route::get('/equipos/create', [EquipoController::class, 'create'])
        ->name('equipos.create');

    // Guardar equipo
    Route::post('/equipos', [EquipoController::class, 'store'])
        ->name('equipos.store');

    // Editar equipo
    Route::get('/equipos/{equipo}/edit', [EquipoController::class, 'edit'])
        ->name('equipos.edit');

    // Actualizar equipo
    Route::put('/equipos/{equipo}', [EquipoController::class, 'update'])
        ->name('equipos.update');

    // Eliminar equipo
    Route::delete('/equipos/{equipo}', [EquipoController::class, 'destroy'])
        ->name('equipos.destroy');
});

// Consultar detalle: después de las rutas estáticas.
Route::get('/equipos/{equipo}', [EquipoController::class, 'show'])
    ->name('equipos.show');