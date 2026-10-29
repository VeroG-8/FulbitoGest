<?php

namespace App\Http\Controllers;

use App\Models\InscripcionEquipo;
use App\Models\InscripcionEquipoPago;
use App\Models\ModalidadPago;
use App\Services\ReciboService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class InscripcionEquipoPagoController extends Controller
{
    /**
     * Mostrar los pagos de una inscripción de equipo.
     */
    public function index(InscripcionEquipo $inscripcionEquipo)
    {
        $inscripcionEquipo->load([
            'equipo.club',
            'equipo.categoria',
            'torneo',
            'pagos.modalidadPago',
            'pagos.recibo',
        ]);

        $totalPagado = $inscripcionEquipo->pagos
            ->where('estado', 'confirmado')
            ->sum(fn ($pago) => (float) $pago->monto);

        $montoInscripcion = (float) $inscripcionEquipo->monto_inscripcion;

        return Inertia::render('InscripcionesEquipo/Pagos/Index', [
            'inscripcion' => $inscripcionEquipo,
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
     * Registrar un pago de inscripción y generar su recibo.
     */
    public function store(
        Request $request,
        InscripcionEquipo $inscripcionEquipo,
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
            $inscripcionEquipo,
            $reciboService
        ) {
            $inscripcion = InscripcionEquipo::query()
                ->whereKey($inscripcionEquipo->id)
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

            $totalPagado = InscripcionEquipoPago::query()
                ->where('equipo_torneo_id', $inscripcion->id)
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
                    'monto' =>
                        'Esta inscripción ya está pagada en su totalidad.',
                ]);
            }

            if ($monto > $saldoPendiente) {
                throw ValidationException::withMessages([
                    'monto' => 'El pago no puede superar el saldo pendiente de $'
                        . number_format($saldoPendiente, 2, ',', '.')
                        . '.',
                ]);
            }

            $pago = InscripcionEquipoPago::create([
                'equipo_torneo_id' => $inscripcion->id,
                'modalidad_pago_id' => $validated['modalidad_pago_id'],
                'fecha_pago' => $validated['fecha_pago'],
                'monto' => $monto,
                'estado' => 'confirmado',
            ]);

            $reciboService->generar($pago);
        });

        return redirect()
            ->route('torneos.show', $inscripcionEquipo->torneo_id)
            ->with(
                'success',
                'El pago del equipo se registró correctamente y se generó el recibo.'
            );
    }
}