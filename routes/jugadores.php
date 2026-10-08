<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JugadorController;

Route::get('/jugadores/historial', [JugadorController::class, 'historial'])
    ->name('jugadores.historial');

Route::put('/jugadores/{jugador}/reactivar', [JugadorController::class, 'reactivar'])
    ->name('jugadores.reactivar');

Route::resource('jugadores', JugadorController::class)
    ->parameters([
        'jugadores' => 'jugador',
    ])
    ->only([
        'index',
        'create',
        'store',
        'show',
        'edit',
        'update',
        'destroy',
    ]);