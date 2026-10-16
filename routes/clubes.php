<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClubController;

Route::get('/clubes/historial', [ClubController::class, 'historial'])
    ->name('clubes.historial');

Route::put('/clubes/{club}/reactivar', [ClubController::class, 'reactivar'])
    ->name('clubes.reactivar');

Route::resource('clubes', ClubController::class)
    ->parameters(['clubes' => 'club'])
    ->only([
        'index',
        'create',
        'store',
        'show',
        'edit',
        'update',
        'destroy',
    ]);