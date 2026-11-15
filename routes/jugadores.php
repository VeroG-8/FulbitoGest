<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JugadorController;

Route::get('/jugadores/historial', [JugadorController::class, 'historial'])
    ->name('jugadores.historial');

Route::get('/jugadores', [JugadorController::class, 'index'])
    ->name('jugadores.index');

Route::middleware('rol:admin')->group(function () {

    Route::get('/jugadores/create', [JugadorController::class, 'create'])
        ->name('jugadores.create');

    Route::post('/jugadores', [JugadorController::class, 'store'])
        ->name('jugadores.store');

    Route::put('/jugadores/{jugador}/reactivar', [JugadorController::class, 'reactivar'])
        ->name('jugadores.reactivar');

    Route::delete('/jugadores/{jugador}', [JugadorController::class, 'destroy'])
        ->name('jugadores.destroy');

    // Asociar tutor a un jugador.
    Route::post('/jugadores/{jugador}/tutores', [JugadorController::class, 'asociarTutor'])
        ->name('jugadores.tutores.store');

    // Editar datos del tutor y su relación con este jugador.
    Route::put('/jugadores/{jugador}/tutores/{tutor}', [JugadorController::class, 'actualizarTutor'])
        ->name('jugadores.tutores.update');
});

Route::get('/jugadores/{jugador}/edit', [JugadorController::class, 'edit'])
    ->name('jugadores.edit');

Route::put('/jugadores/{jugador}', [JugadorController::class, 'update'])
    ->name('jugadores.update');

Route::get('/jugadores/{jugador}', [JugadorController::class, 'show'])
    ->name('jugadores.show');

// Edición: administradores y superadministradores pueden editar cualquiera.
// El tutor solamente puede editar jugadores vinculados a su cuenta.
Route::get('/jugadores/{jugador}/edit', [JugadorController::class, 'edit'])
    ->name('jugadores.edit');

Route::put('/jugadores/{jugador}', [JugadorController::class, 'update'])
    ->name('jugadores.update');

// Mostrar jugador: siempre al final para evitar conflictos.
Route::get('/jugadores/{jugador}', [JugadorController::class, 'show'])
    ->name('jugadores.show');