<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Página de inicio
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Dashboard
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Perfil de usuario
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Rutas por módulo de FulbitoGest
Route::middleware('auth')->group(function () {
    require __DIR__ . '/jugadores.php';
    require __DIR__ . '/tutores.php';
    require __DIR__ . '/profesores.php';
    require __DIR__ . '/horarios.php';

    require __DIR__ . '/cuotas.php';
    require __DIR__ . '/clubes.php';
    require __DIR__ . '/equipos.php';
    require __DIR__ . '/torneos.php';
    require __DIR__ . '/usuarios.php';
});

// Rutas de carnets: incluye la consulta pública por QR
require __DIR__ . '/carnets.php';

// Rutas de autenticación generadas por Breeze
require __DIR__ . '/auth.php';