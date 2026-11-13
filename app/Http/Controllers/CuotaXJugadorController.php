<?php

namespace App\Http\Controllers;

use App\Models\CuotaXJugador;
use App\Models\Cuota;
use App\Models\Jugador;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

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
        ]);

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
            'pendientes' => (clone $consulta)->where('estado', 'pendiente')->count(),
            'pagadas' => (clone $consulta)->where('estado', 'pagada')->count(),
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
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cuota_id' => 'required|exists:cuotas,id',
            'jugador_id' => 'required|exists:jugadores,id',
            'fecha_asignacion' => 'required|date',
            'fecha_vencimiento' => 'required|date|after_or_equal:fecha_asignacion',
        ]);

        $existe = CuotaXJugador::where('cuota_id', $validated['cuota_id'])
            ->where('jugador_id', $validated['jugador_id'])
            ->exists();

        if ($existe) {
            return back()->withErrors([
                'jugador_id' => 'Este jugador ya tiene asignada esta cuota.',
            ]);
        }

        CuotaXJugador::create([
            ...$validated,
            'estado' => 'pendiente',
        ]);

        return redirect()
            ->route('cuotas.asignaciones.index')
            ->with('success', 'Cuota asignada correctamente.');
    }

    /**
     * Asignación masiva de cuotas.
     */
    public function storeMasivo(Request $request)
    {
        $validated = $request->validate([
            'cuota_id' => 'required|exists:cuotas,id',
            'categoria_id' => 'required|exists:categorias,id',
            'fecha_asignacion' => 'required|date',
            'fecha_vencimiento' => 'required|date|after_or_equal:fecha_asignacion',
        ]);

        $cuota = Cuota::where('estado', true)
            ->findOrFail($validated['cuota_id']);

        $jugadores = Jugador::where('estado', true)
            ->where('categoria_id', $validated['categoria_id'])
            ->get();

        if ($jugadores->isEmpty()) {
            return back()->withErrors([
                'categoria_id' => 'No hay jugadores activos en esta categoría.',
            ]);
        }

        $asignacionesCreadas = 0;

        DB::transaction(function () use (
            $jugadores,
            $validated,
            &$asignacionesCreadas
        ) {
            foreach ($jugadores as $jugador) {
                $existe = CuotaXJugador::where('cuota_id', $validated['cuota_id'])
                    ->where('jugador_id', $jugador->id)
                    ->exists();

                if (!$existe) {
                    CuotaXJugador::create([
                        'cuota_id' => $validated['cuota_id'],
                        'jugador_id' => $jugador->id,
                        'fecha_asignacion' => $validated['fecha_asignacion'],
                        'fecha_vencimiento' => $validated['fecha_vencimiento'],
                        'estado' => 'pendiente',
                    ]);

                    $asignacionesCreadas++;
                }
            }
        });

        return redirect()
            ->route('cuotas.asignaciones.index')
            ->with('success', "Se asignó la cuota a {$asignacionesCreadas} jugadores.");
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
     * Seguimiento anual de cuotas.
     */
    public function seguimiento(Request $request)
    {
        $anio = $request->input('anio', now()->year);

        $request->validate([
            'anio' => 'nullable|integer|between:2020,2100',
            'categoria_id' => 'nullable|exists:categorias,id',
        ]);

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
                    $query->whereHas('cuota', function ($q) use ($anio) {
                        $q->where('periodo_anio', $anio);
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

                $asignaciones = $asignacionesPorMes->get(
                    $mes,
                    collect()
                );

                if ($asignaciones->isEmpty()) {
                    $meses[$mes] = [
                        'estado' => 'sin_asignacion',
                        'monto' => 0,
                        'pagado' => 0,
                        'saldo' => 0,
                    ];

                    continue;
                }

                $monto = $asignaciones->sum(function ($asignacion) {
                    return (float) $asignacion->cuota->monto;
                });

                $pagado = $asignaciones->sum(function ($asignacion) {
                    return $asignacion->pagos->sum('monto');
                });

                $saldo = max(0, $monto - $pagado);

                if ($pagado <= 0) {
                    $estado = 'pendiente';
                } elseif ($pagado >= $monto) {
                    $estado = 'abonado';
                } else {
                    $estado = 'parcial';
                }

                $meses[$mes] = [
                    'estado' => $estado,
                    'monto' => $monto,
                    'pagado' => $pagado,
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
                'anio' => (int) $anio,
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

        // Validar los parámetros de ordenamiento.
        $request->validate([
            'orden' => 'nullable|in:jugador,cuota,vencimiento',
            'direccion' => 'nullable|in:asc,desc',
        ]);

        $orden = $request->input('orden', 'vencimiento');
        $direccion = $request->input('direccion', 'desc');

        // Consultar solamente las cuotas de jugadores asociados al tutor.
        $consulta = CuotaXJugador::query()
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
            ]);

        // Aplicar el ordenamiento seleccionado.
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

        // Desempate para mantener un orden estable entre páginas.
        $consulta->orderBy('cuota_x_jugador.id', 'desc');

        $asignaciones = $consulta
            ->paginate(10)
            ->withQueryString();

        // Calcular importes y estados.
        $asignaciones->getCollection()->transform(function ($asignacion) {

            $montoCuota = (float) ($asignacion->cuota?->monto ?? 0);

            $totalPagado = (float) $asignacion->pagos->sum('monto');

            $saldoPendiente = max(0, $montoCuota - $totalPagado);

            if ($saldoPendiente <= 0) {
                $estadoCalculado = 'pagada';
            } elseif ($totalPagado > 0) {
                $estadoCalculado = 'parcial';
            } else {
                $estadoCalculado = 'pendiente';
            }

            $asignacion->total_pagado = round($totalPagado, 2);
            $asignacion->saldo_pendiente = round($saldoPendiente, 2);
            $asignacion->estado_calculado = $estadoCalculado;

            return $asignacion;
        });

        return Inertia::render('Cuotas/MisCuotas/Index', [
            'asignaciones' => $asignaciones,

            'filtros' => [
                'orden' => $orden,
                'direccion' => $direccion,
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

        // Verificar que la asignación pertenezca a un jugador
        // asociado al tutor autenticado.
        $asignacion = CuotaXJugador::query()
            ->whereKey($cuotaXJugador->id)
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
            ])
            ->firstOrFail();

        // Solo los pagos confirmados se consideran dinero abonado.
        $totalPagado = (float) $asignacion->pagos
            ->where('estado', 'confirmado')
            ->sum('monto');

        $importeCuota = (float) ($asignacion->cuota?->monto ?? 0);

        $saldoPendiente = max(0, $importeCuota - $totalPagado);

        if ($saldoPendiente <= 0) {
            $estadoCalculado = 'pagada';
        } elseif ($totalPagado > 0) {
            $estadoCalculado = 'parcial';
        } else {
            $estadoCalculado = 'pendiente';
        }

        return Inertia::render('Cuotas/MisCuotas/Show', [
            'asignacion' => $asignacion,
            'totalPagado' => round($totalPagado, 2),
            'saldoPendiente' => round($saldoPendiente, 2),
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

        // Verificar que la asignación pertenezca a un jugador
        // asociado al tutor autenticado.
        $perteneceAlTutor = $cuotaXJugador->jugador()
            ->whereHas('tutores', function ($query) use ($usuario) {
                $query->where('tutores.id', $usuario->tutor_id);
            })
            ->exists();

        abort_unless(
            $perteneceAlTutor,
            404,
            'No se encontró la cuota solicitada.'
        );

        // Cargar los datos de la cuota, jugador e historial completo.
        $cuotaXJugador->load([
            'cuota',
            'jugador:id,nombre,apellido,categoria_id',
            'jugador.categoria:id,anio',
            'pagos' => function ($query) {
                $query->with([
                    'modalidadPago',
                    'recibo',
                ])->orderBy('fecha_pago', 'desc');
            },
        ]);

        $montoCuota = (float) ($cuotaXJugador->cuota?->monto ?? 0);

        // Solamente los pagos confirmados se consideran dinero abonado.
        $totalPagado = (float) $cuotaXJugador->pagos
            ->where('estado', 'confirmado')
            ->sum('monto');

        $saldoPendiente = max(0, $montoCuota - $totalPagado);

        if ($saldoPendiente <= 0) {
            $estadoCalculado = 'pagada';
        } elseif ($totalPagado > 0) {
            $estadoCalculado = 'parcial';
        } else {
            $estadoCalculado = 'pendiente';
        }

        return Inertia::render('Cuotas/MisCuotas/Pagos/Index', [
            'asignacion' => $cuotaXJugador,
            'totalPagado' => round($totalPagado, 2),
            'saldoPendiente' => round($saldoPendiente, 2),
            'estadoCalculado' => $estadoCalculado,
        ]);
    }
}