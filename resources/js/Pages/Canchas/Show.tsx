import { Head, Link } from '@inertiajs/react';
import {
    Goal,
    ArrowLeft,
    Pencil,
    MapPin,
    FileText,
    CalendarDays,
    Clock,
    UserRound,
    Users,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatCard from '@/Components/Shared/StatCard';
import StatusBadge from '@/Components/Shared/StatusBadge';

interface Predio {
    id: number;
    nombre: string;
    direccion?: string | null;
    localidad?: string | null;
}

interface Categoria {
    id: number;
    anio: number;
}

interface Profesor {
    id: number;
    nombre: string;
    apellido: string;
}

interface Horario {
    id: number;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
    estado: boolean;
    categoria: Categoria | null;
    profesor: Profesor | null;
}

interface Cancha {
    id: number;
    predio_id: number;
    nombre: string;
    descripcion: string | null;
    estado: boolean;
    created_at: string;
    predio: Predio;
    horarios: Horario[];
}

interface Props {
    cancha: Cancha;
}

const dias: Record<string, string> = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    miércoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    sábado: 'Sábado',
    domingo: 'Domingo',
};

function formatearDia(dia: string) {
    return dias[dia.toLowerCase()] ?? dia;
}

function formatearHora(hora: string) {
    return hora?.slice(0, 5) ?? '-';
}

export default function Show({ cancha }: Props) {
    const horariosActivos = cancha.horarios.filter(
        (horario) => horario.estado,
    );

    return (
        <>
            <Head title={`Cancha ${cancha.nombre}`} />

            <div className="space-y-6">
                {/* ENCABEZADO */}
                <PageHeader
                    title={cancha.nombre}
                    description="Información detallada de la cancha y sus horarios asignados."
                    icon={<Goal size={28} />}
                    actions={
                        <>
                            <Link
                                href="/canchas"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                            >
                                <ArrowLeft size={17} />
                                Volver
                            </Link>

                            <Link
                                href={`/canchas/${cancha.id}/edit`}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                <Pencil size={17} />
                                Editar
                            </Link>
                        </>
                    }
                />

                {/* ESTADÍSTICAS */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <StatCard
                        title="Horarios asignados"
                        value={cancha.horarios.length}
                        description="Total de horarios registrados"
                        icon={<CalendarDays size={23} />}
                        color="blue"
                    />

                    <StatCard
                        title="Horarios activos"
                        value={horariosActivos.length}
                        description="Horarios actualmente disponibles"
                        icon={<Clock size={23} />}
                        color="emerald"
                    />
                </div>

                {/* INFORMACIÓN GENERAL */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Goal size={21} />
                        </div>

                        <div>
                            <h2 className="font-bold text-slate-800">
                                Información de la cancha
                            </h2>

                            <p className="mt-0.5 text-sm text-slate-500">
                                Datos generales de la instalación deportiva.
                            </p>
                        </div>

                        <div className="ml-auto">
                            <StatusBadge
                                status={cancha.estado ? 'activo' : 'inactivo'}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Nombre
                            </p>

                            <p className="font-semibold text-slate-800">
                                {cancha.nombre}
                            </p>
                        </div>

                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Predio
                            </p>

                            <Link
                                href={`/predios/${cancha.predio.id}`}
                                className="inline-flex items-center gap-2 font-semibold text-blue-600 transition hover:text-blue-800"
                            >
                                <MapPin size={16} />
                                {cancha.predio.nombre}
                            </Link>
                        </div>

                        <div className="md:col-span-2">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Descripción
                            </p>

                            {cancha.descripcion ? (
                                <div className="flex items-start gap-2 text-sm leading-relaxed text-slate-600">
                                    <FileText
                                        size={17}
                                        className="mt-0.5 shrink-0 text-slate-400"
                                    />
                                    <p>{cancha.descripcion}</p>
                                </div>
                            ) : (
                                <p className="text-sm italic text-slate-400">
                                    Sin descripción registrada.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* HORARIOS */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Horarios asignados
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Categorías y profesores que utilizan esta cancha.
                            </p>
                        </div>

                        <span className="text-sm font-medium text-slate-500">
                            {cancha.horarios.length}{' '}
                            {cancha.horarios.length === 1
                                ? 'horario'
                                : 'horarios'}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[750px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-5 py-4">Día</th>
                                    <th className="px-5 py-4">Horario</th>
                                    <th className="px-5 py-4">Categoría</th>
                                    <th className="px-5 py-4">Profesor</th>
                                    <th className="px-5 py-4">Estado</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {cancha.horarios.length > 0 ? (
                                    cancha.horarios.map((horario) => (
                                        <tr
                                            key={horario.id}
                                            className="transition hover:bg-slate-50/80"
                                        >
                                            <td className="px-5 py-4 font-medium text-slate-700">
                                                {formatearDia(horario.dia_semana)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="inline-flex items-center gap-2 text-slate-600">
                                                    <Clock
                                                        size={15}
                                                        className="text-slate-400"
                                                    />

                                                    {formatearHora(horario.hora_inicio)}
                                                    {' - '}
                                                    {formatearHora(horario.hora_fin)}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="font-semibold text-slate-700">
                                                    {horario.categoria
                                                        ? `Categoría ${horario.categoria.anio}`
                                                        : 'Sin categoría'}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <UserRound
                                                        size={16}
                                                        className="text-slate-400"
                                                    />

                                                    {horario.profesor
                                                        ? `${horario.profesor.nombre} ${horario.profesor.apellido}`
                                                        : 'Sin profesor'}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusBadge
                                                    status={
                                                        horario.estado
                                                            ? 'activo'
                                                            : 'inactivo'
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-12 text-center"
                                        >
                                            <div className="flex flex-col items-center">
                                                <CalendarDays
                                                    size={36}
                                                    className="mb-3 text-slate-300"
                                                />

                                                <p className="font-semibold text-slate-700">
                                                    Sin horarios asignados
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Esta cancha todavía no tiene horarios registrados.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}