<?php

namespace App\Http\Controllers;

use App\Models\Jugador;
use App\Models\Equipo;
use App\Models\Categoria;
use App\Models\Profesor;
use App\Models\Tutor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $usuario = $request->user();

        $estadisticas = [];

        if (in_array($usuario->rol, ['superadmin', 'admin'])) {
            $estadisticas = [
                'jugadores' => Jugador::count(),
                'jugadoresActivos' => Jugador::where('estado', true)->count(),
                'equiposActivos' => Equipo::where('estado', true)->count(),
                'categoriasActivas' => Categoria::where('estado', true)->count(),
                'profesoresActivos' => Profesor::where('estado', true)->count(),
                'tutoresActivos' => Tutor::where('estado', true)->count(),
            ];
        }

        return Inertia::render('Dashboard', [
            'usuario' => $usuario,
            'estadisticas' => $estadisticas,
        ]);
    }
}