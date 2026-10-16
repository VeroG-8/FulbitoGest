<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClubController;

Route::resource('clubes', ClubController::class)
    ->parameters(['clubes' => 'club'])
    ->only([
        'index',
        'create',
        'store',
        'show',
        'edit',
        'update',
        'destroy',
    ]);