<?php

namespace App\Http\Controllers;

use App\Models\Equipo;
use App\Models\Club;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EquipoController extends Controller
{
    /**
     * Mostrar el listado de equipos.
     */
    public function index(Request $request)
    {
        $buscar = trim($request->input('buscar', ''));

        $equipos = Equipo::with(['club', 'categoria'])
            ->when($buscar, function ($query, $buscar) {
                $query->where('nombre', 'like', "%{$buscar}%")
                    ->orWhereHas('club', function ($club) use ($buscar) {
                        $club->where('nombre', 'like', "%{$buscar}%");
                    })
                    ->orWhereHas('categoria', function ($categoria) use ($buscar) {
                        $categoria->where('nombre', 'like', "%{$buscar}%");
                    });
            })
            ->orderBy('nombre')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Equipos/Index', [
            'equipos' => $equipos,
            'filtros' => [
                'buscar' => $buscar,
            ],
        ]);
    }
}