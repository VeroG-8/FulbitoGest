<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TorneoController;

Route::resource('torneos', TorneoController::class);