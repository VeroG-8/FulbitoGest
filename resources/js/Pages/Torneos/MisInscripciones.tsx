import { Head, router } from '@inertiajs/react';
import {
    ClipboardList,
    Users,
    Wallet,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
} from 'lucide-react';

import StatusBadge from '@/Components/Shared/StatusBadge';

interface Inscripcion {
    id: number;
    torneo: string;
    torneo_id: number;
    tipo: 'propio' | 'externo';
    fecha_inicio: string;
    fecha_fin: string | null;
    jugador: string;
    jugador_id: number;
    dni: string;
    categoria: number | null;
    fecha_inscripcion: string;
    monto_inscripcion: number | string;
    estado: 'pendiente' | 'inscripto' | 'cancelado';
}
interface Paginacion<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
}
type CampoOrden = 'torneo' | 'jugador' | 'fecha_inscripcion';

interface Props {
    inscripciones: Paginacion<Inscripcion>;
    resumen: {
        total: number;
        pendientes: number;
        confirmadas: number;
    };
    filtros: {
        orden: CampoOrden;
        direccion: 'asc' | 'desc';
    };
}

const formatoMoneda = (monto: number | string) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
    }).format(Number(monto));
};

const formatoFecha = (fecha: string | null) => {
    if (!fecha) return '-';

    const [anio, mes, dia] = fecha.substring(0, 10).split('-');

    return `${dia}/${mes}/${anio}`;
};

export default function MisInscripciones({
    inscripciones,
    resumen,
    filtros,
}: Props) {
    const totalInscripciones = resumen.total;
    const pendientes = resumen.pendientes;
    const confirmadas = resumen.confirmadas;

    const ordenarPor = (campo: CampoOrden) => {
        const direccion =
            filtros.orden === campo && filtros.direccion === 'asc'
                ? 'desc'
                : 'asc';

        router.get(
            route('torneos.mis-inscripciones'),
            {
                orden: campo,
                direccion,
                page: 1,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const iconoOrden = (campo: CampoOrden) => {
        if (filtros.orden !== campo) {
            return (
                <ArrowUpDown
                    size={15}
                    className="text-slate-400"
                />
            );
        }

        return filtros.direccion === 'asc' ? (
            <ArrowUp
                size={15}
                className="text-blue-600"
            />
        ) : (
            <ArrowDown
                size={15}
                className="text-blue-600"
            />
        );
    };

    const encabezadoOrdenable = (
        titulo: string,
        campo: CampoOrden,
    ) => (
        <button
            type="button"
            onClick={() => ordenarPor(campo)}
            className="inline-flex items-center gap-2 font-semibold transition hover:text-slate-900"
        >
            {titulo}
            {iconoOrden(campo)}
        </button>
    );

    return (
        <>
            <Head title="Mis inscripciones" />

            <div className="space-y-6">

                {/* ENCABEZADO */}

                <div className="rounded-2xl bg-slate-950 px-6 py-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white">
                            <ClipboardList size={25} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Mis Torneos
                            </h1>

                            <p className="mt-1 text-sm text-slate-400">
                                Consultá las inscripciones de tus jugadores
                                en los torneos.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ESTADÍSTICAS */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Total de inscripciones
                                </p>

                                <p className="mt-2 text-2xl font-bold text-slate-900">
                                    {totalInscripciones}
                                </p>
                            </div>

                            <div className="rounded-xl bg-slate-100 p-3 text-slate-600">
                                <ClipboardList size={22} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Inscripciones pendientes
                                </p>

                                <p className="mt-2 text-2xl font-bold text-amber-600">
                                    {pendientes}
                                </p>
                            </div>

                            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                                <Wallet size={22} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Inscripciones confirmadas
                                </p>

                                <p className="mt-2 text-2xl font-bold text-emerald-600">
                                    {confirmadas}
                                </p>
                            </div>

                            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                                <Users size={22} />
                            </div>
                        </div>
                    </div>

                </div>

                {/* TABLA */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-6 py-5">
                        <h2 className="text-lg font-bold text-slate-900">
                            Detalle de inscripciones
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Estado y datos de inscripción de cada jugador.
                        </p>
                    </div>

                    {inscripciones.data.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">

                                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">
                                            {encabezadoOrdenable(
                                                'Torneo',
                                                'torneo',
                                            )}
                                        </th>
                                        <th className="px-6 py-4 font-semibold">
                                            Tipo
                                        </th>
                                        <th className="px-6 py-4 font-semibold">
                                            Inicio
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Finalización
                                        </th>
                                        <th className="px-6 py-4 font-semibold">
                                            {encabezadoOrdenable(
                                                'Jugador',
                                                'jugador',
                                            )}
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Categoría
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            {encabezadoOrdenable(
                                                'Fecha de inscripción',
                                                'fecha_inscripcion',
                                            )}
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Importe
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">

                                    {inscripciones.data.map((inscripcion) => (
                                        <tr
                                            key={inscripcion.id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-slate-800">
                                                    {inscripcion.torneo}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                        inscripcion.tipo === 'propio'
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'bg-emerald-50 text-emerald-700'
                                                    }`}
                                                >
                                                    {inscripcion.tipo === 'propio' ? 'Propio' : 'Externo'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                                {formatoFecha(inscripcion.fecha_inicio)}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                                {formatoFecha(inscripcion.fecha_fin)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-slate-800">
                                                    {inscripcion.jugador}
                                                </p>
            
                                            </td>

                                            <td className="px-6 py-4 text-slate-600">
                                                {inscripcion.categoria
                                                    ? `${inscripcion.categoria}`
                                                    : '-'}
                                            </td>

                                            <td className="px-6 py-4 text-slate-600">
                                                {formatoFecha(
                                                    inscripcion.fecha_inscripcion,
                                                )}
                                            </td>

                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                {formatoMoneda(
                                                    inscripcion.monto_inscripcion,
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <StatusBadge
                                                    status={inscripcion.estado}
                                                />
                                            </td>
                                        </tr>
                                    ))}

                                </tbody>
                            </table>
                        </div>

                        {/* PAGINACIÓN */}
                        <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Mostrando{' '}
                                <span className="font-semibold text-slate-700">
                                    {inscripciones.from ?? 0}
                                </span>{' '}
                                a{' '}
                                <span className="font-semibold text-slate-700">
                                    {inscripciones.to ?? 0}
                                </span>{' '}
                                de{' '}
                                <span className="font-semibold text-slate-700">
                                    {inscripciones.total}
                                </span>{' '}
                                inscripciones
                            </p>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    disabled={!inscripciones.prev_page_url}
                                    onClick={() =>
                                        inscripciones.prev_page_url &&
                                        router.visit(inscripciones.prev_page_url, {
                                            preserveScroll: true,
                                            preserveState: true,
                                        })
                                    }
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Anterior
                                </button>

                                <span className="text-sm font-medium text-slate-600">
                                    Página {inscripciones.current_page} de{' '}
                                    {inscripciones.last_page}
                                </span>

                                <button
                                    type="button"
                                    disabled={!inscripciones.next_page_url}
                                    onClick={() =>
                                        inscripciones.next_page_url &&
                                        router.visit(inscripciones.next_page_url, {
                                            preserveScroll: true,
                                            preserveState: true,
                                        })
                                    }
                                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                      </>
                    ) : (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="mb-4 rounded-2xl bg-slate-100 p-5 text-slate-400">
                                <ClipboardList size={35} />
                            </div>

                            <h3 className="text-lg font-semibold text-slate-800">
                                No hay inscripciones registradas
                            </h3>

                            <p className="mt-2 max-w-md text-sm text-slate-500">
                                Cuando alguno de tus jugadores sea inscripto
                                en un torneo, vas a poder consultar acá su
                                inscripción y estado.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}