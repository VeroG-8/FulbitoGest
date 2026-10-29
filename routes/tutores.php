<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TutorController;

// Consultas: cualquier usuario autenticado.
// Más adelante limitaremos los resultados según el rol.
Route::get('/tutores', [TutorController::class, 'index'])
    ->name('tutores.index');

Route::get('/tutores/historial', [TutorController::class, 'historial'])
    ->name('tutores.historial');

Route::get('/tutores/{tutor}', [TutorController::class, 'show'])
    ->name('tutores.show');

// Gestión de tutores: solo administradores.
Route::middleware('rol:admin')->group(function () {
    Route::get('/tutores/create', [TutorController::class, 'create'])
        ->name('tutores.create');

    Route::post('/tutores', [TutorController::class, 'store'])
        ->name('tutores.store');

    Route::put('/tutores/{tutor}/reactivar', [TutorController::class, 'reactivar'])
        ->name('tutores.reactivar');

    Route::get('/tutores/{tutor}/edit', [TutorController::class, 'edit'])
        ->name('tutores.edit');

    Route::put('/tutores/{tutor}', [TutorController::class, 'update'])
        ->name('tutores.update');

    Route::delete('/tutores/{tutor}', [TutorController::class, 'destroy'])
        ->name('tutores.destroy');
});