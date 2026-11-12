import { Head } from '@inertiajs/react';
import { ClipboardList, CalendarDays, Users, Wallet } from 'lucide-react';

import StatusBadge from '@/Components/Shared/StatusBadge';

interface Inscripcion {
    id: number;
    torneo: string;
    jugador: string;
    dni: string;
    categoria: number | null;
    fecha_inscripcion: string;
    monto_inscripcion: number | string;
    estado: 'pendiente' | 'inscripto' | 'cancelado';
}

interface Props {
    inscripciones: Inscripcion[];
}

const formatoMoneda = (monto: number | string) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
    }).format(Number(monto));
};

const formatoFecha = (fecha: string) => {
    if (!fecha) return '-';

    const [anio, mes, dia] = fecha.substring(0, 10).split('-');

    return `${dia}/${mes}/${anio}`;
};

export default function MisInscripciones({
    inscripciones,
}: Props) {
    const totalInscripciones = inscripciones.length;

    const pendientes = inscripciones.filter(
        (item) => item.estado === 'pendiente',
    ).length;

    const confirmadas = inscripciones.filter(
        (item) => item.estado === 'inscripto',
    ).length;

    const canceladas = inscripciones.filter(
        (item) => item.estado === 'cancelado',
    ).length;

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
                                Mis inscripciones
                            </h1>

                            <p className="mt-1 text-sm text-slate-400">
                                Consultá las inscripciones de tus jugadores
                                en los torneos.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ESTADÍSTICAS */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-4">

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

                    {inscripciones.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">

                                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">
                                            Torneo
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Jugador
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Categoría
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Fecha
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

                                    {inscripciones.map((inscripcion) => (
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
                                                <p className="font-medium text-slate-800">
                                                    {inscripcion.jugador}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    DNI: {inscripcion.dni}
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