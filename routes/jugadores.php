<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JugadorController;

// Historial: antes de cualquier ruta dinámica.
Route::get('/jugadores/historial', [JugadorController::class, 'historial'])
    ->name('jugadores.historial');

// Listado general.
Route::get('/jugadores', [JugadorController::class, 'index'])
    ->name('jugadores.index');

// Operaciones exclusivas de administradores y superadministradores.
Route::middleware('rol:admin')->group(function () {

    // Crear jugador.
    Route::get('/jugadores/create', [JugadorController::class, 'create'])
        ->name('jugadores.create');

    Route::post('/jugadores', [JugadorController::class, 'store'])
        ->name('jugadores.store');

    // Reactivar jugador.
    Route::put('/jugadores/{jugador}/reactivar', [JugadorController::class, 'reactivar'])
        ->name('jugadores.reactivar');

    // Desactivar jugador.
    Route::delete('/jugadores/{jugador}', [JugadorController::class, 'destroy'])
        ->name('jugadores.destroy');
});

// Edición: administradores y superadministradores pueden editar cualquiera.
// El tutor solamente puede editar jugadores vinculados a su cuenta.
Route::get('/jugadores/{jugador}/edit', [JugadorController::class, 'edit'])
    ->name('jugadores.edit');

Route::put('/jugadores/{jugador}', [JugadorController::class, 'update'])
    ->name('jugadores.update');

// Mostrar jugador: siempre al final para evitar conflictos.
Route::get('/jugadores/{jugador}', [JugadorController::class, 'show'])
    ->name('jugadores.show');