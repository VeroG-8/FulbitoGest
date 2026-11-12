<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HorarioController;

// Consultas de horarios activos: cualquier usuario autenticado.
// El controlador filtra los horarios según el rol.
Route::get('/horarios', [HorarioController::class, 'index'])
    ->name('horarios.index');

// Gestión y consultas administrativas: solo administradores.
Route::middleware('rol:admin')->group(function () {

    Route::get('/horarios/historial', [HorarioController::class, 'historial'])
        ->name('horarios.historial');

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

// Detalle: el controlador verifica si el usuario puede consultar ese horario.
Route::get('/horarios/{horario}', [HorarioController::class, 'show'])
    ->name('horarios.show');