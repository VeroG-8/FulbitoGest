<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CarnetController;

Route::get('/carnets', [CarnetController::class, 'index'])
    ->name('carnets.index');

Route::get('/carnets/create', [CarnetController::class, 'create'])
    ->name('carnets.create');

Route::post('/carnets', [CarnetController::class, 'store'])
    ->name('carnets.store');

Route::get('/carnets/{carnet}', [CarnetController::class, 'show'])
    ->name('carnets.show');

Route::get('/carnets/{carnet}/edit', [CarnetController::class, 'edit'])
    ->name('carnets.edit');

Route::put('/carnets/{carnet}', [CarnetController::class, 'update'])
    ->name('carnets.update');

Route::delete('/carnets/{carnet}', [CarnetController::class, 'destroy'])
    ->name('carnets.destroy');

Route::get('/carnet/consulta/{qr_token}', [CarnetController::class, 'consulta'])
    ->name('carnets.consulta');    