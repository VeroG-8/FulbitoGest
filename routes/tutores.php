<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TutorController;

Route::get('/tutores', [TutorController::class, 'index'])
    ->name('tutores.index');

Route::get('/tutores/create', [TutorController::class, 'create'])
    ->name('tutores.create');

Route::post('/tutores', [TutorController::class, 'store'])
    ->name('tutores.store');

Route::get('/tutores/historial', [TutorController::class, 'historial'])
    ->name('tutores.historial');

Route::put('/tutores/{tutor}/reactivar', [TutorController::class, 'reactivar'])
    ->name('tutores.reactivar');

Route::get('/tutores/{tutor}/edit', [TutorController::class, 'edit'])
    ->name('tutores.edit');

Route::get('/tutores/{tutor}', [TutorController::class, 'show'])
    ->name('tutores.show');

Route::put('/tutores/{tutor}', [TutorController::class, 'update'])
    ->name('tutores.update');

Route::delete('/tutores/{tutor}', [TutorController::class, 'destroy'])
    ->name('tutores.destroy');