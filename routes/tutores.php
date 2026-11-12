<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TutorController;

// Historial: antes de la ruta dinámica {tutor}.
Route::get('/tutores/historial', [TutorController::class, 'historial'])
    ->name('tutores.historial');

// Listado general.
// El controlador restringe los registros según el rol.
Route::get('/tutores', [TutorController::class, 'index'])
    ->name('tutores.index');

// Operaciones exclusivas de administradores y superadministradores.
Route::middleware('rol:admin')->group(function () {

    // Crear tutor.
    Route::get('/tutores/create', [TutorController::class, 'create'])
        ->name('tutores.create');

    Route::post('/tutores', [TutorController::class, 'store'])
        ->name('tutores.store');

    // Reactivar tutor.
    Route::put('/tutores/{tutor}/reactivar', [TutorController::class, 'reactivar'])
        ->name('tutores.reactivar');

    // Desactivar tutor.
    Route::delete('/tutores/{tutor}', [TutorController::class, 'destroy'])
        ->name('tutores.destroy');
});

// Edición: administradores y superadministradores pueden editar cualquiera.
// El tutor solamente puede editar su propia ficha.
// El controlador debe verificar la autorización.
Route::get('/tutores/{tutor}/edit', [TutorController::class, 'edit'])
    ->name('tutores.edit');

Route::put('/tutores/{tutor}', [TutorController::class, 'update'])
    ->name('tutores.update');

// Mostrar tutor: siempre al final para evitar conflictos.
Route::get('/tutores/{tutor}', [TutorController::class, 'show'])
    ->name('tutores.show');