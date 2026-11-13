<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CategoriaController;

// Consultas disponibles para usuarios autorizados.
Route::get('/categorias', [CategoriaController::class, 'index'])
    ->name('categorias.index');

Route::get('/categorias/{categoria}', [CategoriaController::class, 'show'])
    ->name('categorias.show');

// Operaciones exclusivas para administradores y superadministradores.
Route::middleware('rol:admin')->group(function () {

    // Historial de categorías inactivas.
    Route::get('/categorias/historial', [CategoriaController::class, 'historial'])
        ->name('categorias.historial');

    // Crear categoría.
    Route::get('/categorias/create', [CategoriaController::class, 'create'])
        ->name('categorias.create');

    Route::post('/categorias', [CategoriaController::class, 'store'])
        ->name('categorias.store');

    // Editar categoría.
    Route::get('/categorias/{categoria}/edit', [CategoriaController::class, 'edit'])
        ->name('categorias.edit');

    Route::put('/categorias/{categoria}', [CategoriaController::class, 'update'])
        ->name('categorias.update');

    // Reactivar categoría.
    Route::put('/categorias/{categoria}/reactivar', [CategoriaController::class, 'reactivar'])
        ->name('categorias.reactivar');

    // Desactivar categoría.
    Route::delete('/categorias/{categoria}', [CategoriaController::class, 'destroy'])
        ->name('categorias.destroy');
});