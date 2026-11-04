<?php

namespace App\Http\Controllers;

use App\Models\Pago;
use App\Models\CuotaXJugador;
use App\Models\ModalidadPago;
use App\Services\ReciboService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PagoController extends Controller
{
    /**
     * Listado general de pagos.
     */
    public function index()
    {
        $pagos = Pago::with([
            'cuotaXJugador.cuota',
            'cuotaXJugador.jugador',
            'modalidadPago',
            'recibo',
        ])
            ->orderBy('fecha_pago', 'desc')
            ->get();

        return Inertia::render('Pagos/Index', [
            'pagos' => $pagos,
        ]);
    }

    /**
     * Mostrar los pagos de una cuota asignada a un jugador.
     */
    public function show(CuotaXJugador $cuotaXJugador)
    {
        $cuotaXJugador->load([
            'cuota',
            'jugador',
            'pagos.modalidadPago',
            'pagos.recibo',
        ]);

        $totalPagado = $cuotaXJugador->pagos
            ->where('estado', 'confirmado')
            ->sum(fn ($pago) => (float) $pago->monto);

        $montoCuota = (float) $cuotaXJugador->cuota->monto;

        return Inertia::render('Cuotas/Asignaciones/Pagos/Index', [
            'asignacion' => $cuotaXJugador,
            'totalPagado' => round($totalPagado, 2),
            'saldoPendiente' => round(
                max(0, $montoCuota - $totalPagado),
                2
            ),
            'modalidadesPago' => ModalidadPago::where('estado', true)
                ->orderBy('nombre')
                ->get(['id', 'nombre']),
        ]);
    }

    /**
     * Registrar un pago de cuota.
     */
    public function store(
        Request $request,
        CuotaXJugador $cuotaXJugador,
        ReciboService $reciboService
    ) {
        $validated = $request->validate([
            'modalidad_pago_id' => [
                'required',
                'integer',
                'exists:modalidades_pago,id',
            ],
            'fecha_pago' => ['required', 'date'],
            'monto' => ['required', 'numeric', 'gt:0'],
        ]);

        DB::transaction(function () use (
            $validated,
            $cuotaXJugador,
            $reciboService
        ) {
            $asignacion = CuotaXJugador::query()
                ->whereKey($cuotaXJugador->id)
                ->lockForUpdate()
                ->firstOrFail();

            $asignacion->load('cuota');

            $modalidadActiva = ModalidadPago::query()
                ->whereKey($validated['modalidad_pago_id'])
                ->where('estado', true)
                ->exists();

            if (!$modalidadActiva) {
                throw ValidationException::withMessages([
                    'modalidad_pago_id' =>
                        'La modalidad de pago seleccionada no está activa.',
                ]);
            }

            $totalPagado = Pago::query()
                ->where('cuota_x_jugador_id', $asignacion->id)
                ->where('estado', 'confirmado')
                ->sum('monto');

            $montoCuota = (float) $asignacion->cuota->monto;

            $saldoPendiente = round(
                $montoCuota - (float) $totalPagado,
                2
            );

            $monto = round((float) $validated['monto'], 2);

            if ($saldoPendiente <= 0) {
                throw ValidationException::withMessages([
                    'monto' => 'Esta cuota ya está pagada en su totalidad.',
                ]);
            }

            if ($monto > $saldoPendiente) {
                throw ValidationException::withMessages([
                    'monto' => 'El pago no puede superar el saldo pendiente de $'
                        . number_format($saldoPendiente, 2, ',', '.')
                        . '.',
                ]);
            }

            $pago = Pago::create([
                'cuota_x_jugador_id' => $asignacion->id,
                'modalidad_pago_id' => $validated['modalidad_pago_id'],
                'fecha_pago' => $validated['fecha_pago'],
                'monto' => $monto,
                'estado' => 'confirmado',
            ]);

            $reciboService->generar($pago);

            $totalPagado = Pago::query()
                ->where('cuota_x_jugador_id', $asignacion->id)
                ->where('estado', 'confirmado')
                ->sum('monto');

            $asignacion->update([
                'estado' => (float) $totalPagado >= $montoCuota
                    ? 'pagada'
                    : 'pendiente',
            ]);
        });

        return redirect()
            ->route('cuotas.asignaciones.pagos.index', $cuotaXJugador)
            ->with('success', 'El pago se registró correctamente y se generó el recibo.');
    }
}