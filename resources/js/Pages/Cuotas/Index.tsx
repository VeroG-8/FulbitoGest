import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Ban,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Eye,
    Filter,
    GraduationCap,
    History,
    Pencil,
    Receipt,
    Trophy,
    UserPlus,
    Wallet,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatCard from '@/Components/Shared/StatCard';
import StatusBadge from '@/Components/Shared/StatusBadge';

type TipoCuota =
    | 'cuota_mensual'
    | 'inscripcion_escuelita'
    | 'inscripcion_torneo';

interface Cuota {
    id: number;
    nombre: string;
    descripcion: string | null;
    tipo: TipoCuota;
    monto: string | number;
    periodo_mes: number | null;
    periodo_anio: number | null;
    fecha_vencimiento: string;
    estado: boolean;
}

interface PaginacionLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginacion {
    data: Cuota[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginacionLink[];
}

interface Estadisticas {
    total: number;
    mensuales: number;
    inscripcionesEscuelita: number;
    inscripcionesTorneo: number;
}

interface Filtros {
    tipo: string;
    anio: string;
    orden: 'nombre' | 'fecha_vencimiento';
    direccion: 'asc' | 'desc';
}

interface Props {
    cuotas: Paginacion;
    estadisticas: Estadisticas;
    anios: number[];
    filtros: Filtros;
}

interface FlashProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

const tiposCuota: Record<TipoCuota, string> = {
    cuota_mensual: 'Cuota mensual',
    inscripcion_escuelita: 'Inscripción a la escuelita',
    inscripcion_torneo: 'Inscripción a torneo',
};

export default function Index({
    cuotas,
    estadisticas,
    anios,
    filtros,
}: Props) {
    const { flash } = usePage().props as unknown as FlashProps;

    const { delete: destroy, processing } = useForm();

    const [tipoSeleccionado, setTipoSeleccionado] = useState(
        filtros.tipo ?? '',
    );

    const [anioSeleccionado, setAnioSeleccionado] = useState(
        filtros.anio ?? '',
    );

    const formatearFecha = (fecha: string) => {
        if (!fecha) return '-';

        const [anio, mes, dia] = fecha.substring(0, 10).split('-');

        return `${dia}/${mes}/${anio}`;
    };

    const formatearMonto = (monto: string | number) => {
        return Number(monto).toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2,
        });
    };

    const aplicarFiltro = (tipo: string) => {
        setTipoSeleccionado(tipo);

        router.get(
            '/cuotas',
            {
                tipo,
                anio: anioSeleccionado,
                orden: filtros.orden,
                direccion: filtros.direccion,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const aplicarFiltroAnio = (anio: string) => {
        setAnioSeleccionado(anio);

        router.get(
            '/cuotas',
            {
                tipo: tipoSeleccionado,
                anio,
                orden: filtros.orden,
                direccion: filtros.direccion,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const cambiarOrden = (
        campo: 'nombre' | 'fecha_vencimiento',
    ) => {
        const nuevaDireccion =
            filtros.orden === campo && filtros.direccion === 'asc'
                ? 'desc'
                : 'asc';

        router.get(
            '/cuotas',
            {
                tipo: filtros.tipo,
                anio: filtros.anio,
                orden: campo,
                direccion: nuevaDireccion,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const limpiarFiltros = () => {
        setTipoSeleccionado('');
        setAnioSeleccionado('');

        router.get(
            '/cuotas',
            {
                orden: filtros.orden,
                direccion: filtros.direccion,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const deshabilitar = (cuota: Cuota) => {
        if (
            confirm(
                `¿Querés deshabilitar la cuota "${cuota.nombre}"?`,
            )
        ) {
            destroy(`/cuotas/${cuota.id}`, {
                preserveScroll: true,
            });
        }
    };

    const tipoLabel = (tipo: TipoCuota) => {
        return tiposCuota[tipo] ?? tipo;
    };

    return (
        <>
            <Head title="Gestión de cuotas" />

            <div className="space-y-6">
                <PageHeader
                    title="Gestión de cuotas"
                    description="Administración de cuotas mensuales e inscripciones de la escuelita y torneos."
                    icon={<Receipt className="h-6 w-6" />}
                    actions={
                        <div className="flex flex-nowrap items-center gap-3 whitespace-nowrap">
                            <Link
                                href="/cuotas/historial"
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-5 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
                            >
                                <History size={21} />
                                Historial de cuotas
                            </Link>

                            <Link
                                href="/cuotas/create"
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                            >
                                <UserPlus size={21} />
                                Nueva cuota
                            </Link>
                        </div>
                    }
                />

                {/* Mensajes del sistema */}
                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                        {flash.error}
                    </div>
                )}

                {/* Estadísticas */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total de cuotas"
                        value={estadisticas.total}
                        description="Cuotas activas registradas"
                        icon={<Receipt className="h-6 w-6" />}
                        color="blue"
                    />

                    <StatCard
                        title="Cuotas mensuales"
                        value={estadisticas.mensuales}
                        description="Cuotas periódicas"
                        icon={<CalendarDays className="h-6 w-6" />}
                        color="emerald"
                    />

                    <StatCard
                        title="Inscripciones escuelita"
                        value={estadisticas.inscripcionesEscuelita}
                        description="Inscripciones anuales"
                        icon={<GraduationCap className="h-6 w-6" />}
                        color="violet"
                    />

                    <StatCard
                        title="Inscripciones a torneos"
                        value={estadisticas.inscripcionesTorneo}
                        description="Inscripciones deportivas"
                        icon={<Trophy className="h-6 w-6" />}
                        color="amber"
                    />
                </section>

                {/* Listado */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Cuotas registradas
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Consultá y administrá los conceptos,
                                    períodos e importes.
                                </p>
                            </div>

                            {/* Filtros */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                {/* Filtro por tipo */}
                                <div className="min-w-0 sm:min-w-64">
                                    <label
                                        htmlFor="filtro-tipo"
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Tipo de cuota
                                    </label>

                                    <div className="relative">
                                        <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <select
                                            id="filtro-tipo"
                                            value={tipoSeleccionado}
                                            onChange={(e) =>
                                                aplicarFiltro(e.target.value)
                                            }
                                            className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        >
                                            <option value="">
                                                Todos los tipos
                                            </option>

                                            <option value="cuota_mensual">
                                                Cuota mensual
                                            </option>

                                            <option value="inscripcion_escuelita">
                                                Inscripción a la escuelita
                                            </option>

                                            <option value="inscripcion_torneo">
                                                Inscripción a torneo
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                {/* Filtro por año */}
                                <div className="min-w-0 sm:min-w-40">
                                    <label
                                        htmlFor="filtro-anio"
                                        className="mb-1.5 block text-sm font-medium text-slate-700"
                                    >
                                        Año
                                    </label>

                                    <select
                                        id="filtro-anio"
                                        value={anioSeleccionado}
                                        onChange={(e) =>
                                            aplicarFiltroAnio(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="">
                                            Todos los años
                                        </option>

                                        {anios.map((anio) => (
                                            <option key={anio} value={anio}>
                                                {anio}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Limpiar filtros */}
                                {(filtros.tipo || filtros.anio) && (
                                    <button
                                        type="button"
                                        onClick={limpiarFiltros}
                                        className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Información del listado */}
                    <div className="flex flex-col gap-1 border-b border-slate-100 bg-slate-50 px-5 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <span>
                            {cuotas.total > 0
                                ? `Mostrando ${cuotas.from} a ${cuotas.to} de ${cuotas.total} cuotas`
                                : 'No hay cuotas para mostrar'}
                        </span>

                        <span>
                            Orden:{' '}
                            {filtros.orden === 'nombre'
                                ? 'nombre'
                                : 'fecha de vencimiento'}{' '}
                            {filtros.direccion === 'asc'
                                ? 'ascendente'
                                : 'descendente'}
                        </span>
                    </div>

                    {/* Tabla */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                                <tr>
                                    <th className="whitespace-nowrap px-4 py-4 text-left">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                cambiarOrden('nombre')
                                            }
                                            className="inline-flex items-center gap-2 font-semibold transition hover:text-blue-700"
                                        >
                                            Nombre

                                            {filtros.orden === 'nombre' ? (
                                                filtros.direccion === 'asc' ? (
                                                    <ArrowUp className="h-4 w-4" />
                                                ) : (
                                                    <ArrowDown className="h-4 w-4" />
                                                )
                                            ) : (
                                                <ArrowUpDown className="h-4 w-4 text-slate-400" />
                                            )}
                                        </button>
                                    </th>

                                    <th className="whitespace-nowrap px-4 py-4 text-left">
                                        Tipo
                                    </th>

                                    <th className="whitespace-nowrap px-4 py-4 text-left">
                                        Monto
                                    </th>

                                    <th className="whitespace-nowrap px-4 py-4 text-left">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                cambiarOrden(
                                                    'fecha_vencimiento',
                                                )
                                            }
                                            className="inline-flex items-center gap-2 font-semibold transition hover:text-blue-700"
                                        >
                                            Vencimiento

                                            {filtros.orden ===
                                            'fecha_vencimiento' ? (
                                                filtros.direccion === 'asc' ? (
                                                    <ArrowUp className="h-4 w-4" />
                                                ) : (
                                                    <ArrowDown className="h-4 w-4" />
                                                )
                                            ) : (
                                                <ArrowUpDown className="h-4 w-4 text-slate-400" />
                                            )}
                                        </button>
                                    </th>

                                    <th className="whitespace-nowrap px-4 py-4 text-center">
                                        Estado
                                    </th>

                                    <th className="whitespace-nowrap px-4 py-4 text-center">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {cuotas.data.map((cuota) => (
                                    <tr
                                        key={cuota.id}
                                        className="transition hover:bg-slate-50"
                                    >
                                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-800">
                                            {cuota.nombre}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                    cuota.tipo ===
                                                    'cuota_mensual'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : cuota.tipo ===
                                                            'inscripcion_escuelita'
                                                          ? 'bg-emerald-100 text-emerald-700'
                                                          : 'bg-violet-100 text-violet-700'
                                                }`}
                                            >
                                                {tipoLabel(cuota.tipo)}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-800">
                                            {formatearMonto(cuota.monto)}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                                            {formatearFecha(
                                                cuota.fecha_vencimiento,
                                            )}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 text-center">
                                            <StatusBadge
                                                status={
                                                    cuota.estado
                                                        ? 'activo'
                                                        : 'inactivo'
                                                }
                                            />
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={`/cuotas/${cuota.id}`}
                                                    title="Ver detalle"
                                                    aria-label={`Ver detalle de ${cuota.nombre}`}
                                                    className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>

                                                <Link
                                                    href={`/cuotas/${cuota.id}/edit`}
                                                    title="Editar cuota"
                                                    aria-label={`Editar ${cuota.nombre}`}
                                                    className="rounded-lg p-2 text-orange-500 transition hover:bg-orange-50 hover:text-orange-700"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        deshabilitar(cuota)
                                                    }
                                                    disabled={processing}
                                                    title="Deshabilitar cuota"
                                                    aria-label={`Deshabilitar ${cuota.nombre}`}
                                                    className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <Ban className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {cuotas.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-14 text-center"
                                        >
                                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                                                <Wallet className="h-7 w-7 text-slate-400" />
                                            </div>

                                            <p className="mt-4 font-semibold text-slate-700">
                                                No se encontraron cuotas
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {filtros.tipo || filtros.anio
                                                    ? 'No hay cuotas activas que coincidan con los filtros seleccionados.'
                                                    : 'Podés comenzar registrando una nueva cuota.'}
                                            </p>

                                            {(filtros.tipo || filtros.anio) && (
                                                <button
                                                    type="button"
                                                    onClick={limpiarFiltros}
                                                    className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800"
                                                >
                                                    Limpiar filtros
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {cuotas.last_page > 1 && (
                        <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-sm text-slate-500">
                                Página {cuotas.current_page} de{' '}
                                {cuotas.last_page}
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-1">
                                {cuotas.links.map((link, index) => {
                                    const esAnterior = index === 0;
                                    const esSiguiente =
                                        index === cuotas.links.length - 1;

                                    const etiqueta = link.label
                                        .replace('&laquo;', '')
                                        .replace('&raquo;', '')
                                        .trim();

                                    return link.url ? (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            preserveScroll
                                            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition ${
                                                link.active
                                                    ? 'bg-slate-950 text-white'
                                                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {esAnterior ? (
                                                <ChevronLeft className="h-4 w-4" />
                                            ) : esSiguiente ? (
                                                <ChevronRight className="h-4 w-4" />
                                            ) : (
                                                etiqueta
                                            )}
                                        </Link>
                                    ) : (
                                        <span
                                            key={index}
                                            className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm text-slate-300"
                                        >
                                            {esAnterior ? (
                                                <ChevronLeft className="h-4 w-4" />
                                            ) : esSiguiente ? (
                                                <ChevronRight className="h-4 w-4" />
                                            ) : (
                                                etiqueta
                                            )}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}