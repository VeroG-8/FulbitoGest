<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JugadorController;

// Consultas: cualquier usuario autenticado.
Route::get('/jugadores/historial', [JugadorController::class, 'historial'])
    ->name('jugadores.historial');

// Operaciones administrativas: solo administradores y superadministradores.
Route::middleware('rol:admin')->group(function () {

    Route::put('/jugadores/{jugador}/reactivar', [JugadorController::class, 'reactivar'])
        ->name('jugadores.reactivar');

    // Primero se registran las rutas administrativas.
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

// Después se registran las rutas de consulta.
// Así, jugadores/{jugador} no captura la palabra "create".
Route::resource('jugadores', JugadorController::class)
    ->parameters([
        'jugadores' => 'jugador',
    ])
    ->only([
        'index',
        'show',
    ]);