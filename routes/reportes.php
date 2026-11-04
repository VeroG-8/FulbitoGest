<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReporteController;

Route::get('/reportes', [ReporteController::class, 'index'])
    ->name('reportes.index');

Route::get('/reportes/exportar', [ReporteController::class, 'exportar'])
    ->name('reportes.exportar');