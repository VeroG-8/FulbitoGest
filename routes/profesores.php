<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfesorController;

// Consultas: cualquier usuario autenticado.
Route::get('/profesores', [ProfesorController::class, 'index'])
    ->name('profesores.index');

Route::get('/profesores/historial', [ProfesorController::class, 'historial'])
    ->name('profesores.historial');


// Ficha personal del profesor autenticado.
Route::middleware('rol:profesor')->group(function () {

    Route::get('/profesores/mi-ficha', [ProfesorController::class, 'miFicha'])
        ->name('profesores.mi-ficha');

    Route::get('/profesores/mi-ficha/editar', [ProfesorController::class, 'editarMiFicha'])
        ->name('profesores.mi-ficha.editar');

    Route::put('/profesores/mi-ficha', [ProfesorController::class, 'actualizarMiFicha'])
        ->name('profesores.mi-ficha.actualizar');
});


// Gestión de profesores: administradores y superadministradores.
Route::middleware('rol:admin')->group(function () {

    // Rutas estáticas.
    Route::get('/profesores/create', [ProfesorController::class, 'create'])
        ->name('profesores.create');

    Route::post('/profesores', [ProfesorController::class, 'store'])
        ->name('profesores.store');

    // Reactivar profesor.
    Route::put('/profesores/{profesor}/reactivar', [ProfesorController::class, 'reactivar'])
        ->name('profesores.reactivar');

    // Edición administrativa.
    Route::get('/profesores/{profesor}/edit', [ProfesorController::class, 'edit'])
        ->name('profesores.edit');

    Route::put('/profesores/{profesor}', [ProfesorController::class, 'update'])
        ->name('profesores.update');

    Route::delete('/profesores/{profesor}', [ProfesorController::class, 'destroy'])
        ->name('profesores.destroy');
});


// Consulta individual.
Route::get('/profesores/{profesor}', [ProfesorController::class, 'show'])
    ->name('profesores.show');