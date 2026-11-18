import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    ArrowLeft,
    CalendarDays,
    Check,
    ClipboardList,
    DollarSign,
    Search,
    UserRound,
    Wallet,
    X,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';

interface Cuota {
    id: number;
    nombre: string;
    monto: string;
    fecha_vencimiento: string;
}

interface Categoria {
    id: number;
    anio: number;
}

interface Jugador {
    id: number;
    nombre: string;
    apellido: string;
    categoria_id: number;
    categoria?: {
        id: number;
        anio: number;
    } | null;
}
interface AsignacionExistente {
    cuota_id: number;
    jugador_id: number;
    estado: string;
    tiene_pagos: boolean;
}
interface Props {
    cuotas: Cuota[];
    jugadores: Jugador[];
    categorias: Categoria[];
    asignacionesExistentes: AsignacionExistente[];
}

const obtenerFechaLocal = () => {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
};

const formatoMoneda = (monto: string | number) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
    }).format(Number(monto) || 0);
};

const formatoFecha = (fecha: string) => {
    if (!fecha) return '-';

    const [anio, mes, dia] = fecha.substring(0, 10).split('-');

    return `${dia}/${mes}/${anio}`;
};

export default function Create({
    cuotas,
    jugadores,
    categorias,
    asignacionesExistentes,
}: Props) 
{
    const { data, setData, post, processing, errors } = useForm({
        cuota_id: '',
        jugador_id: '',
        fecha_asignacion: obtenerFechaLocal(),
        fecha_vencimiento: '',
    });

    const cuotaSeleccionada = useMemo(
        () => cuotas.find((cuota) => String(cuota.id) === data.cuota_id),
        [cuotas, data.cuota_id],
    );

    const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (asignacionBloqueada) {
        return;
    }

    post('/cuotas/asignaciones');
};

    const inputClass = (hasError: boolean) =>
        `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition
        placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100
        ${
            hasError
                ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                : 'border-slate-200'
        }`;
    const [busquedaJugador, setBusquedaJugador] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    const [mostrarResultados, setMostrarResultados] = useState(false);

    const jugadoresFiltrados = useMemo(() => {
        const termino = busquedaJugador.trim().toLowerCase();

        return jugadores.filter((jugador) => {
            const nombreCompleto =
                `${jugador.apellido} ${jugador.nombre}`.toLowerCase();

            const coincideBusqueda =
                !termino || nombreCompleto.includes(termino);

            const coincideCategoria =
                !categoriaFiltro ||
                String(jugador.categoria_id) === categoriaFiltro;

            return coincideBusqueda && coincideCategoria;
        });
    }, [jugadores, busquedaJugador, categoriaFiltro]);

    const jugadorSeleccionado = jugadores.find(
        (jugador) => String(jugador.id) === data.jugador_id,
    );
    const asignacionExistente = useMemo(() => {
        if (!data.cuota_id || !data.jugador_id) {
            return null;
        }

        return asignacionesExistentes.find(
            (asignacion) =>
                String(asignacion.cuota_id) === data.cuota_id &&
                String(asignacion.jugador_id) === data.jugador_id,
        ) ?? null;
    }, [asignacionesExistentes, data.cuota_id, data.jugador_id]);

    const asignacionBloqueada =
        !!asignacionExistente &&
        (
            asignacionExistente.estado !== 'anulada' ||
            asignacionExistente.tiene_pagos
        );

    const asignacionRecuperable =
        asignacionExistente?.estado === 'anulada' &&
        !asignacionExistente.tiene_pagos;

    return (
        <>
            <Head title="Asignar cuota individual" />

            <div className="space-y-6">
                <PageHeader
                    title="Asignar cuota individual"
                    description="Registrá una cuota para un jugador y establecé sus fechas de asignación y vencimiento."
                    icon={<Wallet className="h-7 w-7 text-white" />}
                    actions={
                        <Link
                            href="/cuotas/asignaciones"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Link>
                    }
                />

                <div className="mx-auto max-w-4xl">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        {/* Encabezado del formulario */}
                        <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                                    <ClipboardList className="h-5 w-5 text-blue-600" />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Datos de la asignación
                                    </h2>
                                    <p className="mt-0.5 text-sm text-slate-500">
                                        Completá la información solicitada.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submit}>
                            <div className="space-y-6 px-6 py-6 sm:px-8">
                                {/* Selección de cuota */}
                                <div>
                                    <label
                                        htmlFor="cuota_id"
                                        className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                                    >
                                        <DollarSign className="h-4 w-4 text-slate-400" />
                                        Cuota
                                        <span className="text-red-500">*</span>
                                    </label>

                                    <select
                                        id="cuota_id"
                                        value={data.cuota_id}
                                        onChange={(e) => {
                                            const cuotaId = e.target.value;
                                            const cuota = cuotas.find(
                                                (item) =>
                                                    String(item.id) === cuotaId,
                                            );

                                            setData((previous) => ({
                                                ...previous,
                                                cuota_id: cuotaId,
                                                fecha_vencimiento: cuota
                                                    ? cuota.fecha_vencimiento.substring(
                                                          0,
                                                          10,
                                                      )
                                                    : '',
                                            }));
                                        }}
                                        className={inputClass(!!errors.cuota_id)}
                                        aria-invalid={!!errors.cuota_id}
                                    >
                                        <option value="">
                                            Seleccionar una cuota
                                        </option>

                                        {cuotas.map((cuota) => (
                                            <option
                                                key={cuota.id}
                                                value={cuota.id}
                                            >
                                                {cuota.nombre} —{' '}
                                                {formatoMoneda(cuota.monto)}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.cuota_id && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {errors.cuota_id}
                                        </p>
                                    )}

                                    {cuotaSeleccionada && (
                                        <div className="mt-3 flex flex-col gap-2 rounded-xl border border-blue-100 bg-blue-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                                    Cuota seleccionada
                                                </p>
                                                <p className="mt-1 font-semibold text-slate-800">
                                                    {cuotaSeleccionada.nombre}
                                                </p>
                                            </div>

                                            <div className="sm:text-right">
                                                <p className="text-xs text-slate-500">
                                                    Importe
                                                </p>
                                                <p className="text-lg font-bold text-slate-900">
                                                    {formatoMoneda(
                                                        cuotaSeleccionada.monto,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                               {/* Selección de jugador */}
                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <UserRound className="h-4 w-4 text-slate-400" />
                                        Jugador
                                        <span className="text-red-500">*</span>
                                    </label>

                                    {/* Filtro por categoría */}
                                    <div className="mb-3">
                                        <select
                                            value={categoriaFiltro}
                                            onChange={(e) => {
                                                setCategoriaFiltro(e.target.value);
                                                setData('jugador_id', '');
                                                setBusquedaJugador('');
                                                setMostrarResultados(false);
                                            }}
                                            className={inputClass(false)}
                                        >
                                            <option value="">Todas las categorías</option>

                                            {(categorias ?? []).map((categoria) => (
                                                <option key={categoria.id} value={categoria.id}>
                                                    Categoría {categoria.anio}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Jugador seleccionado */}
                                    {jugadorSeleccionado ? (
                                        <div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                                                    <UserRound className="h-5 w-5 text-green-700" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-800">
                                                        {jugadorSeleccionado.apellido},{' '}
                                                        {jugadorSeleccionado.nombre}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        Categoría{' '}
                                                        {jugadorSeleccionado.categoria?.anio ?? '-'}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setData('jugador_id', '');
                                                    setBusquedaJugador('');
                                                    setMostrarResultados(true);
                                                }}
                                                className="flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                                            >
                                                <X className="h-4 w-4" />
                                                Cambiar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            {/* Buscador */}
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                                                <input
                                                    type="text"
                                                    value={busquedaJugador}
                                                    onChange={(e) => {
                                                        setBusquedaJugador(e.target.value);
                                                        setData('jugador_id', '');
                                                        setMostrarResultados(true);
                                                    }}
                                                    onFocus={() => setMostrarResultados(true)}
                                                    placeholder="Escribí el nombre o apellido del jugador..."
                                                    className={`${inputClass(!!errors.jugador_id)} pl-10`}
                                                    autoComplete="off"
                                                />
                                            </div>

                                            {/* Resultados */}
                                            {mostrarResultados && (
                                                <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                                                    {jugadoresFiltrados.length > 0 ? (
                                                        jugadoresFiltrados.map((jugador) => (
                                                            <button
                                                                key={jugador.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setData('jugador_id', String(jugador.id));
                                                                    setBusquedaJugador('');
                                                                    setMostrarResultados(false);
                                                                }}
                                                                className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-blue-50"
                                                            >
                                                                <div>
                                                                    <p className="font-medium text-slate-800">
                                                                        {jugador.apellido},{' '}
                                                                        {jugador.nombre}
                                                                    </p>

                                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                                        Categoría{' '}
                                                                        {jugador.categoria?.anio ?? '-'}
                                                                    </p>
                                                                </div>

                                                                <Check className="h-4 w-4 shrink-0 text-blue-500" />
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-6 text-center">
                                                            <UserRound className="mx-auto mb-2 h-7 w-7 text-slate-300" />

                                                            <p className="text-sm font-medium text-slate-600">
                                                                No se encontraron jugadores.
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-400">
                                                                Probá con otro nombre o categoría.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <p className="mt-2 text-xs text-slate-500">
                                                {jugadoresFiltrados.length} jugadores disponibles.
                                                Escribí para buscar y seleccioná uno de los resultados.
                                            </p>
                                        </div>
                                    )}

                                    {errors.jugador_id && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {errors.jugador_id}
                                        </p>
                                    )}
                                    {asignacionBloqueada && (
                                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4">
                                        <div className="flex items-start gap-3">
                                            <X className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                                            <div>
                                                <p className="text-sm font-semibold text-red-800">
                                                    No se puede asignar esta cuota.
                                                </p>

                                                <p className="mt-1 text-sm text-red-700">
                                                    {asignacionExistente?.tiene_pagos
                                                        ? 'Existe una asignación anterior anulada que tiene pagos asociados. No es posible recuperarla.'
                                                        : 'Este jugador ya tiene asignada esta cuota.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {asignacionRecuperable && (
                                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                        <div className="flex items-start gap-3">
                                            <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                                            <div>
                                                <p className="text-sm font-semibold text-amber-800">
                                                    Se recuperará una asignación anterior.
                                                </p>

                                                <p className="mt-1 text-sm text-amber-700">
                                                    Este jugador ya tuvo asignada esta cuota, pero fue anulada.
                                                    Al continuar, se recuperará la asignación existente
                                                    y se actualizarán sus fechas.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                </div>

                                {/* Fechas */}
                                <div className="grid grid-cols-1 gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="fecha_asignacion"
                                            className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                                        >
                                            <CalendarDays className="h-4 w-4 text-slate-400" />
                                            Fecha de asignación
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            id="fecha_asignacion"
                                            type="date"
                                            value={data.fecha_asignacion}
                                            onChange={(e) =>
                                                setData(
                                                    'fecha_asignacion',
                                                    e.target.value,
                                                )
                                            }
                                            className={inputClass(
                                                !!errors.fecha_asignacion,
                                            )}
                                            aria-invalid={
                                                !!errors.fecha_asignacion
                                            }
                                        />

                                        {errors.fecha_asignacion && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors.fecha_asignacion}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="fecha_vencimiento"
                                            className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                                        >
                                            <CalendarDays className="h-4 w-4 text-slate-400" />
                                            Fecha de vencimiento
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            id="fecha_vencimiento"
                                            type="date"
                                            value={data.fecha_vencimiento}
                                            onChange={(e) =>
                                                setData(
                                                    'fecha_vencimiento',
                                                    e.target.value,
                                                )
                                            }
                                            className={inputClass(
                                                !!errors.fecha_vencimiento,
                                            )}
                                            aria-invalid={
                                                !!errors.fecha_vencimiento
                                            }
                                        />

                                        {errors.fecha_vencimiento && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors.fecha_vencimiento}
                                            </p>
                                        )}

                                        {cuotaSeleccionada &&
                                            data.fecha_vencimiento && (
                                                <p className="mt-2 text-xs text-slate-500">
                                                    Vencimiento: {formatoFecha(data.fecha_vencimiento)}
                                                </p>
                                            )}
                                    </div>
                                </div>

                                <p className="text-xs text-slate-500">
                                    <span className="text-red-500">*</span>{' '}
                                    Los campos marcados son obligatorios.
                                </p>
                            </div>

                            {/* Acciones */}
                            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                                <Link
                                    href="/cuotas/asignaciones"
                                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                    Cancelar
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing || asignacionBloqueada}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Check className="h-4 w-4" />
                                    {processing
                                        ? 'Guardando...'
                                        : asignacionBloqueada
                                            ? 'Asignación no disponible'
                                            : asignacionRecuperable
                                                ? 'Recuperar asignación'
                                                : 'Asignar cuota'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}