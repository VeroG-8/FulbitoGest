<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TorneoController;
use App\Http\Controllers\InscripcionEquipoController;
use App\Http\Controllers\InscripcionJugadorController;
use App\Http\Controllers\InscripcionTorneoPagoController;
use App\Http\Controllers\InscripcionEquipoPagoController;

/*
|--------------------------------------------------------------------------
| Inscripciones del tutor
|--------------------------------------------------------------------------
*/

Route::get(
    'mis-inscripciones',
    [TorneoController::class, 'misInscripciones']
)->middleware('rol:tutor')
    ->name('torneos.mis-inscripciones');

/*
|--------------------------------------------------------------------------
| Consulta y administración de torneos
|--------------------------------------------------------------------------
|
| El acceso se controla dentro de TorneoController:
| - Admin y superadmin: acceso completo.
| - Profesor: solamente index y show de torneos activos.
| - Tutor: no puede acceder al listado ni a los detalles.
|
*/

Route::resource('torneos', TorneoController::class);

/*
|--------------------------------------------------------------------------
| Inscripciones de jugadores y equipos
|--------------------------------------------------------------------------
|
| Solamente administradores y superadministradores.
|
*/

Route::middleware('rol:admin')->group(function () {

    // Inscripción de equipos.
    Route::get(
        'torneos/{torneo}/inscribir-equipo',
        [InscripcionEquipoController::class, 'create']
    )->name('torneos.inscripciones.create');

    Route::post(
        'torneos/{torneo}/inscribir-equipo',
        [InscripcionEquipoController::class, 'store']
    )->name('torneos.inscripciones.store');

    // Inscripción de jugadores.
    Route::get(
        'torneos/{torneo}/inscribir-jugador',
        [InscripcionJugadorController::class, 'create']
    )->name('torneos.inscripciones-jugadores.create');

    Route::post(
        'torneos/{torneo}/inscribir-jugador',
        [InscripcionJugadorController::class, 'store']
    )->name('torneos.inscripciones-jugadores.store');

    // Actualizar estado de inscripción de un jugador.
    Route::patch(
        'torneos/{torneo}/jugadores/{jugador}',
        [InscripcionJugadorController::class, 'update']
    )->name('torneos.inscripciones-jugadores.update');

    /*
    |--------------------------------------------------------------------------
    | Pagos de inscripciones a torneos
    |--------------------------------------------------------------------------
    */

    Route::get(
        'inscripciones-torneo/{inscripcionTorneo}/pagos',
        [InscripcionTorneoPagoController::class, 'index']
    )->name('inscripciones-torneo.pagos.index');

    Route::post(
        'inscripciones-torneo/{inscripcionTorneo}/pagos',
        [InscripcionTorneoPagoController::class, 'store']
    )->name('inscripciones-torneo.pagos.store');

    /*
    |--------------------------------------------------------------------------
    | Pagos de inscripciones de equipos
    |--------------------------------------------------------------------------
    */

    Route::get(
        'inscripciones-equipo/{inscripcionEquipo}/pagos',
        [InscripcionEquipoPagoController::class, 'index']
    )->name('inscripciones-equipo.pagos.index');

    Route::post(
        'inscripciones-equipo/{inscripcionEquipo}/pagos',
        [InscripcionEquipoPagoController::class, 'store']
    )->name('inscripciones-equipo.pagos.store');
});