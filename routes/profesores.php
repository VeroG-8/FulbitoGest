<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfesorController;

// Consultas: cualquier usuario autenticado.
// Más adelante limitaremos los resultados según el rol.
Route::get('/profesores', [ProfesorController::class, 'index'])
    ->name('profesores.index');

Route::get('/profesores/historial', [ProfesorController::class, 'historial'])
    ->name('profesores.historial');

Route::get('/profesores/{profesor}', [ProfesorController::class, 'show'])
    ->name('profesores.show');

// Gestión de profesores: solo administradores.
Route::middleware('rol:admin')->group(function () {
    Route::get('/profesores/create', [ProfesorController::class, 'create'])
        ->name('profesores.create');

    Route::post('/profesores', [ProfesorController::class, 'store'])
        ->name('profesores.store');

    Route::put('/profesores/{profesor}/reactivar', [ProfesorController::class, 'reactivar'])
        ->name('profesores.reactivar');

    Route::get('/profesores/{profesor}/edit', [ProfesorController::class, 'edit'])
        ->name('profesores.edit');

    Route::put('/profesores/{profesor}', [ProfesorController::class, 'update'])
        ->name('profesores.update');

    Route::delete('/profesores/{profesor}', [ProfesorController::class, 'destroy'])
        ->name('profesores.destroy');
});