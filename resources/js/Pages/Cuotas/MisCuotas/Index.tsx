import { Head, Link, router } from '@inertiajs/react';
import PageHeader from '@/Components/Shared/PageHeader';
import StatCard from '@/Components/Shared/StatCard';
import StatusBadge from '@/Components/Shared/StatusBadge';
import {
    Wallet,
    Clock,
    CheckCircle,
    Users,
    ChevronLeft,
    ChevronRight,
    Eye,
    Receipt,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
} from 'lucide-react';

interface Cuota {
    id: number;
    nombre: string;
    monto: string | number;
}

interface Categoria {
    id: number;
    anio: number;
}

interface Jugador {
    id: number;
    nombre: string;
    apellido: string;
    categoria?: Categoria | null;
}

interface Asignacion {
    id: number;
    fecha_asignacion: string;
    fecha_vencimiento: string;
    cuota: Cuota | null;
    jugador: Jugador;
    total_pagado: number;
    saldo_pendiente: number;
    estado_calculado: 'pagada' | 'parcial' | 'pendiente';
}

interface Paginacion {
    data: Asignacion[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

type CampoOrden = 'jugador' | 'cuota' | 'vencimiento';

interface Filtros {
    orden: CampoOrden;
    direccion: 'asc' | 'desc';
}

interface Props {
    asignaciones: Paginacion;
    filtros: Filtros;
}

export default function Index({ asignaciones, filtros }: Props) {

    const formatearFecha = (fecha: string | null) => {
        if (!fecha) return '—';

        const [anio, mes, dia] = fecha.substring(0, 10).split('-');

        return `${dia}/${mes}/${anio}`;
    };

    const formatearMonto = (monto: number | string) => {
        return Number(monto).toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2,
        });
    };

    // Cambiar el orden de la tabla.
    const ordenarPor = (campo: CampoOrden) => {
        const direccion =
            filtros.orden === campo && filtros.direccion === 'asc'
                ? 'desc'
                : 'asc';

        router.get(
            route('cuotas.mis'),
            {
                orden: campo,
                direccion,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    // Icono correspondiente al ordenamiento.
    const iconoOrden = (campo: CampoOrden) => {
        if (filtros.orden !== campo) {
            return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />;
        }

        return filtros.direccion === 'asc'
            ? <ArrowUp className="h-3.5 w-3.5 text-blue-600" />
            : <ArrowDown className="h-3.5 w-3.5 text-blue-600" />;
    };

    const irAPagina = (url: string | null) => {
        if (url) {
            router.get(url, {}, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    // Estadísticas de las asignaciones recibidas.
    const totalPagadas = asignaciones.data.filter(
        (asignacion) => asignacion.estado_calculado === 'pagada',
    ).length;

    const totalPendientes = asignaciones.data.filter(
        (asignacion) => asignacion.estado_calculado !== 'pagada',
    ).length;

    const totalAbonado = asignaciones.data.reduce(
        (total, asignacion) =>
            total + Number(asignacion.total_pagado),
        0,
    );

    return (
        <>
            <Head title="Mis cuotas" />

            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-7xl">

                    {/* Encabezado */}
                    <PageHeader
                        title="Mis cuotas"
                        description="Consultá las cuotas, los pagos realizados y los saldos pendientes de tus jugadores."
                        icon={<Wallet className="h-7 w-7" />}
                    />

                    {/* Estadísticas */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                        <StatCard
                            title="Total de asignaciones"
                            value={asignaciones.total}
                            description="Cuotas de tus jugadores"
                            icon={<Users className="h-6 w-6" />}
                            color="blue"
                        />

                        <StatCard
                            title="Con saldo pendiente"
                            value={totalPendientes}
                            description="Cuotas pendientes o parciales"
                            icon={<Clock className="h-6 w-6" />}
                            color="amber"
                        />

                        <StatCard
                            title="Pagadas"
                            value={totalPagadas}
                            description="Cuotas abonadas completamente"
                            icon={<CheckCircle className="h-6 w-6" />}
                            color="emerald"
                        />
                    </div>

                    {/* Resumen económico */}
                    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Total abonado en esta página
                                </p>

                                <p className="mt-1 text-2xl font-bold text-emerald-600">
                                    {formatearMonto(totalAbonado)}
                                </p>
                            </div>

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                                <Receipt className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>

                    {/* Tabla de cuotas */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-200 px-6 py-5">
                            <h2 className="text-lg font-bold text-slate-800">
                                Cuotas asignadas
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Consultá el estado de las cuotas y accedé al historial de pagos de cada una.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">

                                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                    <tr>
                                        {/* Jugador */}
                                        <th className="px-6 py-4 font-semibold">
                                            <button
                                                type="button"
                                                onClick={() => ordenarPor('jugador')}
                                                className="inline-flex items-center gap-2 transition hover:text-blue-600"
                                                title="Ordenar por jugador"
                                            >
                                                Jugador
                                                {iconoOrden('jugador')}
                                            </button>
                                        </th>

                                        {/* Cuota */}
                                        <th className="px-6 py-4 font-semibold">
                                            <button
                                                type="button"
                                                onClick={() => ordenarPor('cuota')}
                                                className="inline-flex items-center gap-2 transition hover:text-blue-600"
                                                title="Ordenar por cuota"
                                            >
                                                Cuota
                                                {iconoOrden('cuota')}
                                            </button>
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Importe
                                        </th>

                                        {/* Vencimiento */}
                                        <th className="px-6 py-4 font-semibold">
                                            <button
                                                type="button"
                                                onClick={() => ordenarPor('vencimiento')}
                                                className="inline-flex items-center gap-2 transition hover:text-blue-600"
                                                title="Ordenar por vencimiento"
                                            >
                                                Vencimiento
                                                {iconoOrden('vencimiento')}
                                            </button>
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Estado
                                        </th>

                                        <th className="px-6 py-4 text-right font-semibold">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">

                                    {asignaciones.data.map((asignacion) => (

                                        <tr
                                            key={asignacion.id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            {/* Jugador */}
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <p className="font-semibold text-slate-800">
                                                    {asignacion.jugador.apellido},{' '}
                                                    {asignacion.jugador.nombre}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    Categoría{' '}
                                                    {asignacion.jugador.categoria?.anio ?? '—'}
                                                </p>
                                            </td>

                                            {/* Cuota */}
                                            <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700">
                                                {asignacion.cuota?.nombre ?? '—'}
                                            </td>

                                            {/* Importe */}
                                            <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-700">
                                                {formatearMonto(
                                                    asignacion.cuota?.monto ?? 0,
                                                )}
                                            </td>

                                            {/* Vencimiento */}
                                            <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                                {formatearFecha(
                                                    asignacion.fecha_vencimiento,
                                                )}
                                            </td>

                                            {/* Estado */}
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <StatusBadge
                                                    status={asignacion.estado_calculado}
                                                />
                                            </td>

                                            {/* Acción */}
                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                <Link
                                                    href={route(
                                                        'cuotas.mis.pagos',
                                                        asignacion.id,
                                                    )}
                                                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    Ver pagos
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}

                                    {asignaciones.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-6 py-12 text-center"
                                            >
                                                <Wallet className="mx-auto mb-3 h-10 w-10 text-slate-300" />

                                                <p className="font-semibold text-slate-700">
                                                    No hay cuotas asignadas
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Todavía no hay cuotas registradas para tus jugadores.
                                                </p>
                                            </td>
                                        </tr>
                                    )}

                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {asignaciones.last_page > 1 && (
                            <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

                                <p className="text-sm text-slate-500">
                                    Mostrando {asignaciones.from} a {asignaciones.to} de{' '}
                                    {asignaciones.total} asignaciones
                                </p>

                                <div className="flex flex-wrap items-center gap-1">
                                    {asignaciones.links.map((link, index) => {

                                        const esAnterior =
                                            link.label.includes('Previous') ||
                                            link.label.includes('&laquo;');

                                        const esSiguiente =
                                            link.label.includes('Next') ||
                                            link.label.includes('&raquo;');

                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                disabled={!link.url}
                                                onClick={() => irAPagina(link.url)}
                                                className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white text-slate-600 hover:bg-slate-100'
                                                } disabled:cursor-not-allowed disabled:opacity-40`}
                                            >
                                                {esAnterior ? (
                                                    <ChevronLeft className="h-4 w-4" />
                                                ) : esSiguiente ? (
                                                    <ChevronRight className="h-4 w-4" />
                                                ) : (
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}