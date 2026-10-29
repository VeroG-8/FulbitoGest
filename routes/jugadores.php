<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JugadorController;

// Consultas: cualquier usuario autenticado.
// Más adelante se limitarán los resultados según el rol.
Route::get('/jugadores/historial', [JugadorController::class, 'historial'])
    ->name('jugadores.historial');

Route::resource('jugadores', JugadorController::class)
    ->parameters([
        'jugadores' => 'jugador',
    ])
    ->only([
        'index',
        'show',
    ]);

// Operaciones administrativas: solo administradores.
Route::middleware('rol:admin')->group(function () {
    Route::put('/jugadores/{jugador}/reactivar', [JugadorController::class, 'reactivar'])
        ->name('jugadores.reactivar');

    Route::resource('jugadores', JugadorController::class)
        ->parameters([
            'jugadores' => 'jugador',
        ])
        ->only([
            'create',
            'store',
            'edit',
            'update',
            'destroy',
        ]);
});
