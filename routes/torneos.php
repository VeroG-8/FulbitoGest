<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TorneoController;
use App\Http\Controllers\InscripcionEquipoController;
use App\Http\Controllers\InscripcionJugadorController;


Route::resource('torneos', TorneoController::class);

Route::get(
    'torneos/{torneo}/inscribir-equipo',
    [InscripcionEquipoController::class, 'create']
)->name('torneos.inscripciones.create');

Route::post(
    'torneos/{torneo}/inscribir-equipo',
    [InscripcionEquipoController::class, 'store']
)->name('torneos.inscripciones.store');

Route::get(
    'torneos/{torneo}/inscribir-jugador',
    [InscripcionJugadorController::class, 'create']
)->name('torneos.inscripciones-jugadores.create');

Route::post(
    'torneos/{torneo}/inscribir-jugador',
    [InscripcionJugadorController::class, 'store']
)->name('torneos.inscripciones-jugadores.store');

Route::patch(
    'torneos/{torneo}/jugadores/{jugador}',
    [InscripcionJugadorController::class, 'update']
)->name('torneos.inscripciones-jugadores.update');