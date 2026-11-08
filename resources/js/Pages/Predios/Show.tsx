import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    MapPin,
    MapPinned,
    ArrowLeft,
    Pencil,
    Map,
    CalendarClock,
    FileText,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatCard from '@/Components/Shared/StatCard';
import StatusBadge from '@/Components/Shared/StatusBadge';

interface Cancha {
    id: number;
    nombre: string;
    descripcion: string | null;
    estado: boolean;
    horarios_count: number;
}

interface Predio {
    id: number;
    nombre: string;
    direccion: string | null;
    localidad: string | null;
    descripcion: string | null;
    estado: boolean;
    canchas: Cancha[];
}

interface Props {
    predio: Predio;
}

export default function Show({ predio }: Props) {
    const canchasActivas = predio.canchas.filter(
        (cancha) => cancha.estado,
    ).length;

    const canchasInactivas = predio.canchas.length - canchasActivas;

    const totalHorarios = predio.canchas.reduce(
        (total, cancha) => total + cancha.horarios_count,
        0,
    );

    return (
        <>
            <Head title={`Predio - ${predio.nombre}`} />

            <div className="space-y-6">

                {/* ENCABEZADO */}
                <PageHeader
                    title={predio.nombre}
                    description="Información general de la instalación deportiva."
                    icon={<Building2 size={28} />}
                    actions={
                        <>
                            <Link
                                href="/predios"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                            >
                                <ArrowLeft size={17} />
                                Volver
                            </Link>

                            <Link
                                href={`/predios/${predio.id}/edit`}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                            >
                                <Pencil size={17} />
                                Editar predio
                            </Link>
                        </>
                    }
                />

                {/* ESTADÍSTICAS */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        title="Canchas activas"
                        value={canchasActivas}
                        description="Instalaciones habilitadas"
                        icon={<Map size={23} />}
                        color="blue"
                    />

                    <StatCard
                        title="Canchas inactivas"
                        value={canchasInactivas}
                        description="Instalaciones deshabilitadas"
                        icon={<MapPinned size={23} />}
                        color="amber"
                    />

                    <StatCard
                        title="Horarios registrados"
                        value={totalHorarios}
                        description="Horarios asociados a sus canchas"
                        icon={<CalendarClock size={23} />}
                        color="emerald"
                    />
                </div>

                {/* INFORMACIÓN DEL PREDIO */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Información del predio
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Datos generales y ubicación.
                            </p>
                        </div>

                        <StatusBadge
                            status={predio.estado ? 'activo' : 'inactivo'}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Nombre
                            </p>

                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                <Building2 size={17} className="text-blue-600" />
                                {predio.nombre}
                            </div>
                        </div>

                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Dirección
                            </p>

                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                <MapPin size={17} className="text-blue-600" />
                                {predio.direccion || 'Sin dirección registrada'}
                            </div>
                        </div>

                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Localidad
                            </p>

                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                <MapPinned size={17} className="text-blue-600" />
                                {predio.localidad || 'Sin localidad registrada'}
                            </div>
                        </div>

                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Estado
                            </p>

                            <StatusBadge
                                status={predio.estado ? 'activo' : 'inactivo'}
                            />
                        </div>

                    </div>

                    {predio.descripcion && (
                        <div className="mt-6 border-t border-slate-100 pt-5">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Descripción
                            </p>

                            <div className="flex items-start gap-2 text-sm leading-relaxed text-slate-600">
                                <FileText
                                    size={17}
                                    className="mt-0.5 shrink-0 text-blue-600"
                                />

                                <p>{predio.descripcion}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* CANCHAS DEL PREDIO */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Canchas del predio
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Instalaciones deportivas asociadas a este predio.
                            </p>
                        </div>

                        <span className="text-sm font-medium text-slate-500">
                            {predio.canchas.length}{' '}
                            {predio.canchas.length === 1
                                ? 'cancha registrada'
                                : 'canchas registradas'}
                        </span>
                    </div>

                    {predio.canchas.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-5 py-4">
                                            Cancha
                                        </th>

                                        <th className="px-5 py-4">
                                            Descripción
                                        </th>

                                        <th className="px-5 py-4 text-center">
                                            Horarios
                                        </th>

                                        <th className="px-5 py-4">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {predio.canchas.map((cancha) => (
                                        <tr
                                            key={cancha.id}
                                            className="transition hover:bg-slate-50/80"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 font-semibold text-slate-800">
                                                    <Map
                                                        size={17}
                                                        className="text-blue-600"
                                                    />
                                                    {cancha.nombre}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {cancha.descripcion || '-'}
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                                    {cancha.horarios_count}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusBadge
                                                    status={
                                                        cancha.estado
                                                            ? 'activo'
                                                            : 'inactivo'
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center px-5 py-12 text-center">
                            <Map
                                size={36}
                                className="mb-3 text-slate-300"
                            />

                            <p className="font-semibold text-slate-700">
                                Todavía no hay canchas registradas
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Las canchas que se creen para este predio aparecerán aquí.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}