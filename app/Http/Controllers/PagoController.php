<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use Inertia\Inertia;

class PagoController extends Controller
{
    public function index()
    {
        $pagos = Pago::with([
            'cuotaXJugador.cuota',
            'cuotaXJugador.jugador',
            'modalidadPago',
        ])
            ->orderBy('fecha_pago', 'desc')
            ->get();

        return Inertia::render('Pagos/Index', [
            'pagos' => $pagos,
        ]);
    }
}