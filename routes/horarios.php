<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HorarioController;

// Consultas: cualquier usuario autenticado.
Route::get('/horarios', [HorarioController::class, 'index'])
    ->name('horarios.index');

Route::get('/horarios/historial', [HorarioController::class, 'historial'])
    ->name('horarios.historial');

// Gestión de horarios: solo administradores.
Route::middleware('rol:admin')->group(function () {

    Route::get('/horarios/create', [HorarioController::class, 'create'])
        ->name('horarios.create');

    Route::post('/horarios', [HorarioController::class, 'store'])
        ->name('horarios.store');

    Route::put('/horarios/{horario}/reactivar', [HorarioController::class, 'reactivar'])
        ->name('horarios.reactivar');

    Route::get('/horarios/{horario}/edit', [HorarioController::class, 'edit'])
        ->name('horarios.edit');

    Route::put('/horarios/{horario}', [HorarioController::class, 'update'])
        ->name('horarios.update');

    Route::delete('/horarios/{horario}', [HorarioController::class, 'destroy'])
        ->name('horarios.destroy');
});

// Esta ruta debe quedar después de las rutas estáticas.
Route::get('/horarios/{horario}', [HorarioController::class, 'show'])
    ->name('horarios.show');