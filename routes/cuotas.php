<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CuotaController;
use App\Http\Controllers\CuotaXJugadorController;
use App\Http\Controllers\PagoController;

// Consultas: cualquier usuario autenticado.
// Más adelante limitaremos los resultados según el rol.
Route::get('/cuotas', [CuotaController::class, 'index'])
    ->name('cuotas.index');

Route::get('/cuotas/historial', [CuotaController::class, 'historial'])
    ->name('cuotas.historial');

Route::get('/cuotas/asignaciones', [CuotaXJugadorController::class, 'index'])
    ->name('cuotas.asignaciones.index');

Route::get('/pagos', [PagoController::class, 'index'])
    ->name('pagos.index');

// Gestión de cuotas y asignaciones: solo administradores.
Route::middleware('rol:admin')->group(function () {
    Route::get('/cuotas/create', [CuotaController::class, 'create'])
        ->name('cuotas.create');

    Route::post('/cuotas', [CuotaController::class, 'store'])
        ->name('cuotas.store');

    Route::put('/cuotas/{cuota}/reactivar', [CuotaController::class, 'reactivar'])
        ->name('cuotas.reactivar');

    Route::get('/cuotas/{cuota}/edit', [CuotaController::class, 'edit'])
        ->name('cuotas.edit');

    Route::put('/cuotas/{cuota}', [CuotaController::class, 'update'])
        ->name('cuotas.update');

    Route::delete('/cuotas/{cuota}', [CuotaController::class, 'destroy'])
        ->name('cuotas.destroy');

    Route::get('/cuotas/asignaciones/create', [CuotaXJugadorController::class, 'create'])
        ->name('cuotas.asignaciones.create');

    Route::post('/cuotas/asignaciones', [CuotaXJugadorController::class, 'store'])
        ->name('cuotas.asignaciones.store');
});