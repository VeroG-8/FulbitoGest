<?php

namespace App\Http\Controllers;

use App\Models\InscripcionTorneo;
use App\Models\InscripcionTorneoPago;
use App\Models\ModalidadPago;
use App\Services\ReciboService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class InscripcionTorneoPagoController extends Controller
{
    /**
     * Mostrar la inscripción, sus pagos y el saldo pendiente.
     */
    public function index(InscripcionTorneo $inscripcionTorneo)
    {
        $inscripcionTorneo->load([
            'jugador',
            'torneo',
            'pagos.modalidadPago',
            'pagos.recibo',
        ]);

        $totalPagado = $inscripcionTorneo->pagos
            ->where('estado', 'confirmado')
            ->sum(fn ($pago) => (float) $pago->monto);

        $montoInscripcion = (float) $inscripcionTorneo->monto_inscripcion;

        return Inertia::render('InscripcionesTorneo/Pagos/Index', [
            'inscripcion' => $inscripcionTorneo,
            'totalPagado' => round($totalPagado, 2),
            'saldoPendiente' => round(
                max(0, $montoInscripcion - $totalPagado),
                2
            ),
            'modalidadesPago' => ModalidadPago::where('estado', true)
                ->orderBy('nombre')
                ->get(['id', 'nombre']),
        ]);
    }

    /**
     * Registrar un pago parcial y generar su recibo.
     */
    public function store(
        Request $request,
        InscripcionTorneo $inscripcionTorneo,
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

        $pago = DB::transaction(function () use (
            $validated,
            $inscripcionTorneo,
            $reciboService
        ) {
            $inscripcion = InscripcionTorneo::query()
                ->whereKey($inscripcionTorneo->id)
                ->lockForUpdate()
                ->firstOrFail();

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

            $totalPagado = InscripcionTorneoPago::query()
                ->where('inscripcion_torneo_id', $inscripcion->id)
                ->where('estado', 'confirmado')
                ->sum('monto');

            $saldoPendiente = round(
                (float) $inscripcion->monto_inscripcion
                - (float) $totalPagado,
                2
            );

            $monto = round((float) $validated['monto'], 2);

            if ($saldoPendiente <= 0) {
                throw ValidationException::withMessages([
                    'monto' => 'Esta inscripción ya está pagada en su totalidad.',
                ]);
            }

            if ($monto > $saldoPendiente) {
                throw ValidationException::withMessages([
                    'monto' => 'El pago no puede superar el saldo pendiente de $'
                        . number_format($saldoPendiente, 2, ',', '.')
                        . '.',
                ]);
            }

            $pago = InscripcionTorneoPago::create([
                'inscripcion_torneo_id' => $inscripcion->id,
                'modalidad_pago_id' => $validated['modalidad_pago_id'],
                'fecha_pago' => $validated['fecha_pago'],
                'monto' => $monto,
                'estado' => 'confirmado',
            ]);

            $reciboService->generar($pago);

            return $pago;
        });

        return redirect()
            ->route('torneos.show', $inscripcionTorneo->torneo_id)
            ->with(
                'success',
                'El pago se registró correctamente y se generó el recibo.'
            );
    }
}
