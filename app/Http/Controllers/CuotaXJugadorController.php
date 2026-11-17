<?php

namespace App\Http\Controllers;

use App\Models\CuotaXJugador;
use App\Models\Cuota;
use App\Models\Jugador;
use App\Models\Categoria;
use App\Services\CuentaCorrienteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Services\SaldoCuotaService;

class CuotaXJugadorController extends Controller
{
    /**
     * Listado general de asignaciones.
     */
    public function index(Request $request)
    {
        $categoriaId = $request->input('categoria_id');
        $buscar = trim((string) $request->input('buscar', ''));

        $consulta = CuotaXJugador::with([
            'cuota',
            'jugador.categoria:id,anio',
        ])->withCount('pagos');

        $consulta->when($categoriaId, function ($query) use ($categoriaId) {
            $query->whereHas('jugador', function ($q) use ($categoriaId) {
                $q->where('categoria_id', $categoriaId);
            });
        });

        $consulta->when($buscar !== '', function ($query) use ($buscar) {
            $query->whereHas('jugador', function ($q) use ($buscar) {
                $q->where(function ($subquery) use ($buscar) {
                    $subquery->where('nombre', 'like', "%{$buscar}%")
                        ->orWhere('apellido', 'like', "%{$buscar}%");
                });
            });
        });

        $estadisticas = [
            'total' => (clone $consulta)->count(),

            'pendientes' => (clone $consulta)
                ->where('estado', 'pendiente')
                ->count(),

            'pagadas' => (clone $consulta)
                ->where('estado', 'pagada')
                ->count(),

            'anuladas' => (clone $consulta)
                ->where('estado', 'anulada')
                ->count(),
        ];

        $asignaciones = $consulta
            ->orderBy('fecha_vencimiento', 'desc')
            ->paginate(10)
            ->withQueryString();

        $categorias = Categoria::orderBy('anio')
            ->get(['id', 'anio']);

        return Inertia::render('Cuotas/Asignaciones/Index', [
            'asignaciones' => $asignaciones,
            'categorias' => $categorias,

            'filtros' => [
                'categoria_id' => $categoriaId,
                'buscar' => $buscar,
            ],

            'estadisticas' => $estadisticas,
        ]);
    }

    /**
     * Formulario para asignación individual.
     */
    public function create()
    {
        $cuotas = Cuota::where('estado', true)
            ->orderBy('fecha_vencimiento')
            ->get();

        $jugadores = Jugador::where('estado', true)
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Cuotas/Asignaciones/Create', [
            'cuotas' => $cuotas,
            'jugadores' => $jugadores,
        ]);
    }

    /**
     * Registrar una asignación individual.
     *
     * Si existe una asignación anulada sin pagos, se recupera.
     * Si existe una asignación activa o con pagos, se bloquea.
     *
     * Al crear o recuperar la asignación se aplica automáticamente
     * el crédito disponible del jugador.
     */
    public function store(
        Request $request,
        CuentaCorrienteService $cuentaCorrienteService
    ) {
        $validated = $request->validate([
            'cuota_id' => 'required|exists:cuotas,id',
            'jugador_id' => 'required|exists:jugadores,id',
            'fecha_asignacion' => 'required|date',
            'fecha_vencimiento' => 'required|date|after_or_equal:fecha_asignacion',
        ]);

        $resultado = DB::transaction(function () use (
            $validated,
            $cuentaCorrienteService
        ) {
            $cuota = Cuota::where('estado', true)
                ->lockForUpdate()
                ->find($validated['cuota_id']);

            if (!$cuota) {
                return [
                    'error' => 'La cuota seleccionada no está activa.',
                ];
            }

            $jugador = Jugador::where('estado', true)
                ->lockForUpdate()
                ->find($validated['jugador_id']);

            if (!$jugador) {
                return [
                    'error' => 'El jugador seleccionado no está activo.',
                ];
            }

            $asignacion = CuotaXJugador::where('cuota_id', $cuota->id)
                ->where('jugador_id', $jugador->id)
                ->lockForUpdate()
                ->first();

            if ($asignacion) {
                if ($asignacion->estado !== 'anulada') {
                    return [
                        'error' => 'Este jugador ya tiene asignada esta cuota.',
                    ];
                }

                if ($asignacion->pagos()->exists()) {
                    return [
                        'error' => 'No se puede recuperar esta asignación porque tiene pagos asociados.',
                    ];
                }

                $asignacion->update([
                    'fecha_asignacion' => $validated['fecha_asignacion'],
                    'fecha_vencimiento' => $validated['fecha_vencimiento'],
                    'estado' => 'pendiente',
                ]);

                $cuentaCorrienteService->aplicarCreditoDisponible(
                    $asignacion,
                    auth()->id()
                );

                return [
                    'recuperada' => true,
                ];
            }

            $asignacion = CuotaXJugador::create([
                ...$validated,
                'estado' => 'pendiente',
            ]);

            $cuentaCorrienteService->aplicarCreditoDisponible(
                $asignacion,
                auth()->id()
            );

            return [
                'creada' => true,
            ];
        });

        if (isset($resultado['error'])) {
            return back()->withErrors([
                'jugador_id' => $resultado['error'],
            ]);
        }

        $mensaje = isset($resultado['recuperada'])
            ? 'La asignación anulada fue recuperada correctamente.'
            : 'Cuota asignada correctamente.';

        return redirect()
            ->route('cuotas.asignaciones.index')
            ->with('success', $mensaje);
    }

    /**
     * Asignación masiva de cuotas.
     *
     * Crea las asignaciones faltantes y recupera las anuladas
     * que no tengan pagos asociados.
     *
     * Aplica automáticamente los créditos individuales
     * disponibles de cada jugador.
     */
    public function storeMasivo(
        Request $request,
        CuentaCorrienteService $cuentaCorrienteService
    ) {
        $validated = $request->validate([
            'cuota_id' => 'required|exists:cuotas,id',
            'categoria_id' => 'required|exists:categorias,id',
            'fecha_asignacion' => 'required|date',
            'fecha_vencimiento' => 'required|date|after_or_equal:fecha_asignacion',
        ]);

        $resultado = DB::transaction(function () use (
            $validated,
            $cuentaCorrienteService
        ) {
            $cuota = Cuota::where('estado', true)
                ->lockForUpdate()
                ->find($validated['cuota_id']);

            if (!$cuota) {
                return [
                    'error' => 'La cuota seleccionada no está activa.',
                ];
            }

            $jugadores = Jugador::where('estado', true)
                ->where('categoria_id', $validated['categoria_id'])
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            if ($jugadores->isEmpty()) {
                return [
                    'error' => 'No hay jugadores activos en esta categoría.',
                ];
            }

            $creadas = 0;
            $recuperadas = 0;
            $omitidas = 0;

            foreach ($jugadores as $jugador) {
                $asignacion = CuotaXJugador::where(
                    'cuota_id',
                    $cuota->id
                )
                    ->where('jugador_id', $jugador->id)
                    ->lockForUpdate()
                    ->first();

                if (!$asignacion) {
                    $asignacion = CuotaXJugador::create([
                        'cuota_id' => $cuota->id,
                        'jugador_id' => $jugador->id,
                        'fecha_asignacion' => $validated['fecha_asignacion'],
                        'fecha_vencimiento' => $validated['fecha_vencimiento'],
                        'estado' => 'pendiente',
                    ]);

                    $cuentaCorrienteService->aplicarCreditoDisponible(
                        $asignacion,
                        auth()->id()
                    );

                    $creadas++;

                    continue;
                }

                if ($asignacion->estado !== 'anulada') {
                    $omitidas++;
                    continue;
                }

                if ($asignacion->pagos()->exists()) {
                    $omitidas++;
                    continue;
                }

                $asignacion->update([
                    'fecha_asignacion' => $validated['fecha_asignacion'],
                    'fecha_vencimiento' => $validated['fecha_vencimiento'],
                    'estado' => 'pendiente',
                ]);

                $cuentaCorrienteService->aplicarCreditoDisponible(
                    $asignacion,
                    auth()->id()
                );

                $recuperadas++;
            }

            return [
                'creadas' => $creadas,
                'recuperadas' => $recuperadas,
                'omitidas' => $omitidas,
            ];
        });

        if (isset($resultado['error'])) {
            return back()->withErrors([
                'categoria_id' => $resultado['error'],
            ]);
        }

        $mensaje = "Asignaciones nuevas: {$resultado['creadas']}. "
            . "Recuperadas: {$resultado['recuperadas']}. "
            . "Omitidas: {$resultado['omitidas']}.";

        return redirect()
            ->route('cuotas.asignaciones.index')
            ->with('success', $mensaje);
    }

    /**
     * Anular una asignación.
     *
     * Solo permite anular asignaciones pendientes sin pagos
     * ni créditos de cuenta corriente aplicados.
     */
    public function anular(CuotaXJugador $cuotaXJugador)
    {
        $resultado = DB::transaction(function () use ($cuotaXJugador) {

            // Mantener el orden de bloqueos:
            // cuota -> jugador -> asignación.
            Cuota::query()
                ->whereKey($cuotaXJugador->cuota_id)
                ->lockForUpdate()
                ->firstOrFail();

            Jugador::query()
                ->whereKey($cuotaXJugador->jugador_id)
                ->lockForUpdate()
                ->firstOrFail();

            $asignacion = CuotaXJugador::query()
                ->whereKey($cuotaXJugador->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($asignacion->estado !== 'pendiente') {
                return [
                    'error' => 'Solo se pueden anular asignaciones pendientes.',
                ];
            }

            if ($asignacion->pagos()->exists()) {
                return [
                    'error' => 'No se puede anular esta asignación porque tiene pagos asociados.',
                ];
            }

            if ($this->tieneCreditoAplicado($asignacion)) {
                return [
                    'error' => 'No se puede anular esta asignación porque tiene crédito de cuenta corriente aplicado.',
                ];
            }

            $asignacion->update([
                'estado' => 'anulada',
            ]);

            return [
                'correcto' => true,
            ];
        });

        if (isset($resultado['error'])) {
            return back()->withErrors([
                'asignacion' => $resultado['error'],
            ]);
        }

        return back()->with(
            'success',
            'La asignación fue anulada correctamente.'
        );
    }

    /**
     * Reactivar una asignación anulada.
     *
     * Si corresponde, vuelve a aplicar el crédito disponible
     * del jugador sin duplicar aplicaciones anteriores.
     */
    public function reactivar(
        CuotaXJugador $cuotaXJugador,
        CuentaCorrienteService $cuentaCorrienteService
    ) {
        $resultado = DB::transaction(function () use (
            $cuotaXJugador,
            $cuentaCorrienteService
        ) {

            // Mantener el orden de bloqueos:
            // cuota -> jugador -> asignación.
            Cuota::query()
                ->whereKey($cuotaXJugador->cuota_id)
                ->lockForUpdate()
                ->firstOrFail();

            Jugador::query()
                ->whereKey($cuotaXJugador->jugador_id)
                ->lockForUpdate()
                ->firstOrFail();

            $asignacion = CuotaXJugador::query()
                ->whereKey($cuotaXJugador->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($asignacion->estado !== 'anulada') {
                return [
                    'error' => 'Solo se pueden reactivar asignaciones anuladas.',
                ];
            }

            if ($asignacion->pagos()->exists()) {
                return [
                    'error' => 'No se puede reactivar esta asignación porque tiene pagos asociados.',
                ];
            }

            $asignacion->update([
                'estado' => 'pendiente',
            ]);

            // Aplicar crédito disponible del mismo jugador.
            $cuentaCorrienteService->aplicarCreditoDisponible(
                $asignacion,
                auth()->id()
            );

            return [
                'correcto' => true,
            ];
        });

        if (isset($resultado['error'])) {
            return back()->withErrors([
                'asignacion' => $resultado['error'],
            ]);
        }

        return back()->with(
            'success',
            'La asignación fue reactivada correctamente.'
        );
    }

    /**
     * Formulario para asignación masiva.
     */
    public function createMasivo()
    {
        $cuotas = Cuota::where('estado', true)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'monto']);

        $categorias = Categoria::orderBy('anio')
            ->get(['id', 'anio']);

        return Inertia::render('Cuotas/Asignaciones/CreateMasivo', [
            'cuotas' => $cuotas,
            'categorias' => $categorias,
        ]);
    }

    /**
     * Seguimiento anual de cuotas mensuales.
     *
     * El saldo contempla pagos reales y créditos aplicados.
     * Los importes se mantienen separados para no confundir
     * dinero recibido con movimientos internos de cuenta corriente.
     */
    public function seguimiento(Request $request)
    {
        $request->validate([
            'anio' => 'nullable|integer|between:2020,2100',
            'categoria_id' => 'nullable|exists:categorias,id',
        ]);

        $anio = (int) $request->input('anio', now()->year);
        $categoriaId = $request->input('categoria_id');

        $categorias = Categoria::orderBy('anio')
            ->get(['id', 'anio']);

        $jugadores = Jugador::where('estado', true)
            ->when($categoriaId, function ($query) use ($categoriaId) {
                $query->where('categoria_id', $categoriaId);
            })
            ->with([
                'categoria:id,anio',

                'cuotaXJugadores' => function ($query) use ($anio) {
                    $query->where('estado', '!=', 'anulada')
                        ->whereHas('cuota', function ($q) use ($anio) {
                            $q->where('periodo_anio', $anio)
                                ->where('tipo', 'cuota_mensual')
                                ->whereNotNull('periodo_mes');
                        })
                        ->with([
                            'cuota:id,nombre,monto,periodo_mes,periodo_anio',

                            'pagos' => function ($q) {
                                $q->where('estado', 'confirmado')
                                    ->select(
                                        'id',
                                        'cuota_x_jugador_id',
                                        'monto'
                                    );
                            },

                            'aplicacionesCredito:id,cuota_x_jugador_id,tipo,monto',
                        ]);
                },
            ])
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get();

        $jugadoresSeguimiento = $jugadores->map(function ($jugador) {
            $asignacionesPorMes = $jugador->cuotaXJugadores
                ->groupBy(function ($asignacion) {
                    return $asignacion->cuota->periodo_mes;
                });

            $meses = [];

            for ($mes = 1; $mes <= 12; $mes++) {
                $asignaciones = $asignacionesPorMes->get($mes, collect());

                if ($asignaciones->isEmpty()) {
                    $meses[$mes] = [
                        'estado' => 'sin_asignacion',
                        'monto' => 0,
                        'pagado' => 0,
                        'credito_aplicado' => 0,
                        'saldo' => 0,
                    ];

                    continue;
                }

                $monto = $asignaciones->sum(function ($asignacion) {
                    return (float) $asignacion->cuota->monto;
                });

                $pagado = $asignaciones->sum(function ($asignacion) {
                    return (float) $asignacion->pagos->sum('monto');
                });

                $creditoAplicado = $asignaciones->sum(function ($asignacion) {
                    return $this->calcularCreditoAplicado($asignacion);
                });

                $totalCubierto = round($pagado + $creditoAplicado, 2);
                $saldo = round(max(0, $monto - $totalCubierto), 2);

                if ($totalCubierto <= 0) {
                    $estado = 'pendiente';
                } elseif ($totalCubierto >= $monto) {
                    $estado = 'abonado';
                } else {
                    $estado = 'parcial';
                }

                $meses[$mes] = [
                    'estado' => $estado,
                    'monto' => round($monto, 2),
                    'pagado' => round($pagado, 2),
                    'credito_aplicado' => round($creditoAplicado, 2),
                    'saldo' => $saldo,
                ];
            }

            return [
                'id' => $jugador->id,
                'apellido' => $jugador->apellido,
                'nombre' => $jugador->nombre,
                'categoria' => $jugador->categoria?->anio,
                'meses' => $meses,
            ];
        });

        return Inertia::render('Cuotas/Seguimiento/Index', [
            'jugadores' => $jugadoresSeguimiento,
            'categorias' => $categorias,

            'filtros' => [
                'anio' => $anio,
                'categoria_id' => $categoriaId,
            ],
        ]);
    }

    /**
     * Consultar las cuotas de los jugadores asociados al tutor.
     */
    public function misCuotas(Request $request)
{
    $usuario = auth()->user();

    abort_unless(
        $usuario && $usuario->rol === 'tutor' && $usuario->tutor_id,
        403,
        'No tienes permiso para consultar estas cuotas.'
    );

    $validated = $request->validate([
        'orden' => 'nullable|in:jugador,cuota,vencimiento',
        'direccion' => 'nullable|in:asc,desc',
        'anio' => 'nullable|integer|between:2020,2100',
    ]);

    $orden = $validated['orden'] ?? 'vencimiento';
    $direccion = $validated['direccion'] ?? 'desc';
    $anio = $validated['anio'] ?? null;

    // Consulta principal de asignaciones del tutor.
    $consulta = CuotaXJugador::query()
        ->where('cuota_x_jugador.estado', '!=', 'anulada')
        ->whereHas('jugador.tutores', function ($query) use ($usuario) {
            $query->where('tutores.id', $usuario->tutor_id);
        })
        ->leftJoin(
            'jugadores',
            'cuota_x_jugador.jugador_id',
            '=',
            'jugadores.id'
        )
        ->leftJoin(
            'cuotas',
            'cuota_x_jugador.cuota_id',
            '=',
            'cuotas.id'
        )
        ->select('cuota_x_jugador.*')
        ->with([
            'cuota',
            'jugador:id,nombre,apellido,categoria_id',
            'jugador.categoria:id,anio',

            'pagos' => function ($query) {
                $query->where('estado', 'confirmado')
                    ->with([
                        'modalidadPago',
                        'recibo',
                    ])
                    ->orderBy('fecha_pago', 'desc');
            },

            'aplicacionesCredito:id,cuota_x_jugador_id,tipo,monto',
        ]);

    // Filtrar por año del período o, si no existe,
    // por el año de vencimiento.
    if ($anio) {
        $consulta->whereRaw(
            'COALESCE(cuotas.periodo_anio, YEAR(cuota_x_jugador.fecha_vencimiento)) = ?',
            [$anio]
        );
    }

    // Obtener los años disponibles para el tutor.
    $anios = CuotaXJugador::query()
        ->where('cuota_x_jugador.estado', '!=', 'anulada')
        ->whereHas('jugador.tutores', function ($query) use ($usuario) {
            $query->where('tutores.id', $usuario->tutor_id);
        })
        ->leftJoin(
            'cuotas',
            'cuota_x_jugador.cuota_id',
            '=',
            'cuotas.id'
        )
        ->selectRaw(
            'COALESCE(cuotas.periodo_anio, YEAR(cuota_x_jugador.fecha_vencimiento)) as anio'
        )
        ->whereNotNull(
            DB::raw(
                'COALESCE(cuotas.periodo_anio, YEAR(cuota_x_jugador.fecha_vencimiento))'
            )
        )
        ->distinct()
        ->orderByDesc('anio')
        ->pluck('anio')
        ->map(fn ($anio) => (int) $anio)
        ->values();

    // Ordenamiento.
    switch ($orden) {
        case 'jugador':
            $consulta
                ->orderBy('jugadores.apellido', $direccion)
                ->orderBy('jugadores.nombre', $direccion);
            break;

        case 'cuota':
            $consulta->orderBy('cuotas.nombre', $direccion);
            break;

        case 'vencimiento':
        default:
            $consulta->orderBy(
                'cuota_x_jugador.fecha_vencimiento',
                $direccion
            );
            break;
    }

    $consulta->orderBy('cuota_x_jugador.id', 'desc');

    // Paginación conservando los filtros.
    $asignaciones = $consulta
        ->paginate(10)
        ->withQueryString();

    $asignaciones->getCollection()->transform(function ($asignacion) {
        $montoCuota = (float) ($asignacion->cuota?->monto ?? 0);
        $totalPagado = (float) $asignacion->pagos->sum('monto');

        $creditoAplicado = $this->calcularCreditoAplicado($asignacion);

        $totalCubierto = round($totalPagado + $creditoAplicado, 2);

        $saldoPendiente = round(
            max(0, $montoCuota - $totalCubierto),
            2
        );

        $estadoCalculado = $this->calcularEstado(
            $montoCuota,
            $totalCubierto
        );

        $asignacion->total_pagado = round($totalPagado, 2);
        $asignacion->credito_aplicado = $creditoAplicado;
        $asignacion->total_cubierto = $totalCubierto;
        $asignacion->saldo_pendiente = $saldoPendiente;
        $asignacion->estado_calculado = $estadoCalculado;

        return $asignacion;
    });

    return Inertia::render('Cuotas/MisCuotas/Index', [
        'asignaciones' => $asignaciones,
        'anios' => $anios,

        'filtros' => [
            'orden' => $orden,
            'direccion' => $direccion,
            'anio' => $anio,
        ],
    ]);
}

    /**
     * Consultar el detalle y el historial de pagos de una cuota
     * perteneciente a uno de los jugadores del tutor autenticado.
     */
    public function detalleMisCuotas(CuotaXJugador $cuotaXJugador)
    {
        $usuario = auth()->user();

        abort_unless(
            $usuario && $usuario->rol === 'tutor' && $usuario->tutor_id,
            403,
            'No tienes permiso para consultar estas cuotas.'
        );

        $asignacion = CuotaXJugador::query()
            ->whereKey($cuotaXJugador->id)
            ->where('estado', '!=', 'anulada')
            ->whereHas('jugador.tutores', function ($query) use ($usuario) {
                $query->where('tutores.id', $usuario->tutor_id);
            })
            ->with([
                'cuota',
                'jugador:id,nombre,apellido,categoria_id',
                'jugador.categoria:id,anio',

                'pagos' => function ($query) {
                    $query->with([
                        'modalidadPago',
                        'recibo',
                    ])->orderBy('fecha_pago', 'desc');
                },

                'aplicacionesCredito:id,cuota_x_jugador_id,tipo,monto',
            ])
            ->firstOrFail();

        $totalPagado = (float) $asignacion->pagos
            ->where('estado', 'confirmado')
            ->sum('monto');

        $creditoAplicado = $this->calcularCreditoAplicado($asignacion);

        $importeCuota = (float) ($asignacion->cuota?->monto ?? 0);

        $totalCubierto = round($totalPagado + $creditoAplicado, 2);

        $saldoPendiente = round(
            max(0, $importeCuota - $totalCubierto),
            2
        );

        $estadoCalculado = $this->calcularEstado(
            $importeCuota,
            $totalCubierto
        );

        return Inertia::render('Cuotas/MisCuotas/Show', [
            'asignacion' => $asignacion,
            'totalPagado' => round($totalPagado, 2),
            'creditoAplicado' => $creditoAplicado,
            'totalCubierto' => $totalCubierto,
            'saldoPendiente' => $saldoPendiente,
            'estadoCalculado' => $estadoCalculado,
        ]);
    }

    /**
     * Consultar el detalle y el historial completo de pagos
     * de una cuota perteneciente a un jugador del tutor.
     */
    public function misCuotasPagos(CuotaXJugador $cuotaXJugador)
    {
        $usuario = auth()->user();

        abort_unless(
            $usuario && $usuario->rol === 'tutor' && $usuario->tutor_id,
            403,
            'No tienes permiso para consultar estas cuotas.'
        );

        $asignacion = CuotaXJugador::query()
            ->whereKey($cuotaXJugador->id)
            ->where('estado', '!=', 'anulada')
            ->whereHas('jugador.tutores', function ($query) use ($usuario) {
                $query->where('tutores.id', $usuario->tutor_id);
            })
            ->with([
                'cuota',
                'jugador:id,nombre,apellido,categoria_id',
                'jugador.categoria:id,anio',

                'pagos' => function ($query) {
                    $query->with([
                        'modalidadPago',
                        'recibo',
                    ])->orderBy('fecha_pago', 'desc');
                },

                'aplicacionesCredito:id,cuota_x_jugador_id,tipo,monto',
            ])
            ->firstOrFail();

        $montoCuota = (float) ($asignacion->cuota?->monto ?? 0);

        $totalPagado = (float) $asignacion->pagos
            ->where('estado', 'confirmado')
            ->sum('monto');

        $creditoAplicado = $this->calcularCreditoAplicado($asignacion);

        $totalCubierto = round($totalPagado + $creditoAplicado, 2);

        $saldoPendiente = round(
            max(0, $montoCuota - $totalCubierto),
            2
        );

        $estadoCalculado = $this->calcularEstado(
            $montoCuota,
            $totalCubierto
        );

        return Inertia::render('Cuotas/MisCuotas/Pagos/Index', [
            'asignacion' => $asignacion,
            'totalPagado' => round($totalPagado, 2),
            'creditoAplicado' => $creditoAplicado,
            'totalCubierto' => $totalCubierto,
            'saldoPendiente' => $saldoPendiente,
            'estadoCalculado' => $estadoCalculado,
        ]);
    }

    /**
     * Calcular el crédito neto aplicado a una asignación.
     *
     * Las aplicaciones suman y las reversiones restan.
     * El resultado se expresa con precisión de centavos.
     */
    private function calcularCreditoAplicado(
    CuotaXJugador $asignacion
): float {
    return app(SaldoCuotaService::class)
        ->calcularCreditoAplicado($asignacion);
}

private function calcularEstado(
    float $montoCuota,
    float $totalCubierto
): string {
    return app(SaldoCuotaService::class)
        ->calcularEstado($montoCuota, $totalCubierto);
}

    /**
     * Determinar si una asignación tiene crédito neto aplicado.
     *
     * Se utiliza para impedir su anulación mientras el crédito
     * siga cubriendo parte de esa cuota.
     */
    private function tieneCreditoAplicado(CuotaXJugador $asignacion): bool
    {
        $creditoNeto = $asignacion->aplicacionesCredito()
            ->selectRaw("
                COALESCE(
                    SUM(
                        CASE
                            WHEN tipo = 'aplicacion' THEN monto
                            WHEN tipo = 'reversion' THEN -monto
                            ELSE 0
                        END
                    ),
                    0
                ) AS total
            ")
            ->value('total');

        $centavos = (int) round((float) $creditoNeto * 100);

        if ($centavos < 0) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'cuenta_corriente' =>
                    'El historial de aplicaciones de crédito presenta inconsistencias.',
            ]);
        }

        return $centavos > 0;
    }
}