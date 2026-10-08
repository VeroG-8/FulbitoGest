<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfesorController;

Route::get('/profesores', [ProfesorController::class, 'index'])
    ->name('profesores.index');

Route::get('/profesores/create', [ProfesorController::class, 'create'])
    ->name('profesores.create');

Route::post('/profesores', [ProfesorController::class, 'store'])
    ->name('profesores.store');

Route::get('/profesores/historial', [ProfesorController::class, 'historial'])
    ->name('profesores.historial');

Route::put('/profesores/{profesor}/reactivar', [ProfesorController::class, 'reactivar'])
    ->name('profesores.reactivar');

Route::get('/profesores/{profesor}/edit', [ProfesorController::class, 'edit'])
    ->name('profesores.edit');

Route::get('/profesores/{profesor}', [ProfesorController::class, 'show'])
    ->name('profesores.show');

Route::put('/profesores/{profesor}', [ProfesorController::class, 'update'])
    ->name('profesores.update');

Route::delete('/profesores/{profesor}', [ProfesorController::class, 'destroy'])
    ->name('profesores.destroy');