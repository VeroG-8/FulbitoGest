<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CuotaController;
use App\Http\Controllers\CuotaXJugadorController;
use App\Http\Controllers\PagoController;

// ==========================================
// CONSULTAS
// ==========================================

// Consultas generales.
Route::get('/cuotas', [CuotaController::class, 'index'])
    ->name('cuotas.index');

Route::get('/cuotas/historial', [CuotaController::class, 'historial'])
    ->name('cuotas.historial');

Route::get('/cuotas/asignaciones', [CuotaXJugadorController::class, 'index'])
    ->name('cuotas.asignaciones.index');

Route::get('/pagos', [PagoController::class, 'index'])
    ->name('pagos.index');

Route::get('/cuotas/seguimiento', [CuotaXJugadorController::class, 'seguimiento'])
    ->name('cuotas.seguimiento');

// Consultar los pagos de una cuota asignada.
Route::get(
    '/cuotas/asignaciones/{cuotaXJugador}/pagos',
    [PagoController::class, 'show']
)->name('cuotas.asignaciones.pagos.index');

// Consulta exclusiva del tutor.
Route::get('/mis-cuotas', [CuotaXJugadorController::class, 'misCuotas'])
    ->middleware('rol:tutor')
    ->name('cuotas.mis');
    // Consultar el historial de pagos de una cuota propia.
Route::get(
    '/mis-cuotas/{cuotaXJugador}/pagos',
    [CuotaXJugadorController::class, 'misCuotasPagos']
)->middleware('rol:tutor')
    ->name('cuotas.mis.pagos');


// ==========================================
// GESTIÓN ADMINISTRATIVA
// ==========================================

Route::middleware('rol:admin')->group(function () {

    // Gestión de cuotas.
    Route::get('/cuotas/create', [CuotaController::class, 'create'])
        ->name('cuotas.create');

    Route::post('/cuotas', [CuotaController::class, 'store'])
        ->name('cuotas.store');

    Route::get('/cuotas/{cuota}/edit', [CuotaController::class, 'edit'])
        ->name('cuotas.edit');

    Route::put('/cuotas/{cuota}', [CuotaController::class, 'update'])
        ->name('cuotas.update');

    Route::put('/cuotas/{cuota}/reactivar', [CuotaController::class, 'reactivar'])
        ->name('cuotas.reactivar');

    Route::delete('/cuotas/{cuota}', [CuotaController::class, 'destroy'])
        ->name('cuotas.destroy');


    // Asignaciones individuales.
    Route::get(
        '/cuotas/asignaciones/create',
        [CuotaXJugadorController::class, 'create']
    )->name('cuotas.asignaciones.create');

    Route::post(
        '/cuotas/asignaciones',
        [CuotaXJugadorController::class, 'store']
    )->name('cuotas.asignaciones.store');


    // Asignaciones masivas.
    Route::get(
        '/cuotas/asignaciones/masivas/crear',
        [CuotaXJugadorController::class, 'createMasivo']
    )->name('cuotas.asignaciones.masivas.create');

    Route::post(
        '/cuotas/asignaciones/masivas',
        [CuotaXJugadorController::class, 'storeMasivo']
    )->name('cuotas.asignaciones.masivas.store');


    // Registrar pagos.
    Route::post(
        '/cuotas/asignaciones/{cuotaXJugador}/pagos',
        [PagoController::class, 'store']
    )->name('cuotas.asignaciones.pagos.store');

});