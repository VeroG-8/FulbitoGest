<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::middleware('rol:admin')->group(function () {

    // Listado de cuentas.
    Route::get('/usuarios', [UserController::class, 'index'])
        ->name('usuarios.index');

    // Crear cuenta.
    Route::get('/usuarios/create', [UserController::class, 'create'])
        ->name('usuarios.create');

    Route::post('/usuarios', [UserController::class, 'store'])
        ->name('usuarios.store');
});