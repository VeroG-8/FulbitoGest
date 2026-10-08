<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CuotaController;
use App\Http\Controllers\CuotaXJugadorController;
use App\Http\Controllers\PagoController;

Route::get('/cuotas', [CuotaController::class, 'index'])
    ->name('cuotas.index');

Route::get('/cuotas/create', [CuotaController::class, 'create'])
    ->name('cuotas.create');
    
Route::post('/cuotas', [CuotaController::class, 'store'])
    ->name('cuotas.store');

    Route::get('/cuotas/historial', [CuotaController::class, 'historial'])
    ->name('cuotas.historial');

Route::put('/cuotas/{cuota}/reactivar', [CuotaController::class, 'reactivar'])
    ->name('cuotas.reactivar');
    
Route::get('/cuotas/{cuota}/edit', [CuotaController::class, 'edit'])
    ->name('cuotas.edit');

Route::put('/cuotas/{cuota}', [CuotaController::class, 'update'])
    ->name('cuotas.update');
    


Route::delete('/cuotas/{cuota}', [CuotaController::class, 'destroy'])
    ->name('cuotas.destroy');    

//---------RUTAS PARA ASIGNACIONES DE CUOTAS A JUGADORES-----------------


Route::get('/cuotas/asignaciones', [CuotaXJugadorController::class, 'index'])
    ->name('cuotas.asignaciones.index');

Route::get('/cuotas/asignaciones/create', [CuotaXJugadorController::class, 'create'])
    ->name('cuotas.asignaciones.create');
    
Route::post('/cuotas/asignaciones', [CuotaXJugadorController::class, 'store'])
    ->name('cuotas.asignaciones.store');
    
Route::get('/pagos', [PagoController::class, 'index'])
    ->name('pagos.index');    