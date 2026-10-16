<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EquipoController;

Route::get('/equipos', [EquipoController::class, 'index'])
    ->name('equipos.index');