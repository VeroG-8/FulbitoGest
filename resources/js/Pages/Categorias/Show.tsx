import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Edit,
    GraduationCap,
    Layers,
    Users,
    UserRound,
    Shield,
    Clock,
    Trophy,
    Building2,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatusBadge from '@/Components/Shared/StatusBadge';
import StatCard from '@/Components/Shared/StatCard';

interface Jugador {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    estado: boolean;
}

interface Profesor {
    id: number;
    nombre: string;
    apellido: string;
    especialidad?: string | null;
    estado: boolean;
}

interface Equipo {
    id: number;
    nombre: string;
    estado: boolean;
    club?: {
        nombre: string;
    } | null;
}

interface Horario {
    id: number;
    dia?: string;
    dia_semana?: string;
    hora_inicio?: string;
    hora_fin?: string;
    estado: boolean;
    profesor?: {
        nombre: string;
        apellido: string;
    } | null;
    cancha?: {
        nombre: string;
    } | null;
}

interface Torneo {
    id: number;
    nombre: string;
    estado?: boolean;
}

interface Categoria {
    id: number;
    anio: number;
    estado: boolean;
    jugadores: Jugador[];
    profesores: Profesor[];
    equipos: Equipo[];
    horarios: Horario[];
    torneos: Torneo[];
}

interface Props {
    categoria: Categoria;
    puedeGestionar: boolean;
}

export default function Show({ categoria, puedeGestionar }: Props) {
    const jugadoresActivos = categoria.jugadores.filter(
        (jugador) => jugador.estado,
    ).length;

    const profesoresActivos = categoria.profesores.filter(
        (profesor) => profesor.estado,
    ).length;

    const equiposActivos = categoria.equipos.filter(
        (equipo) => equipo.estado,
    ).length;

    const horariosActivos = categoria.horarios.filter(
        (horario) => horario.estado,
    ).length;

    return (
        <>
            <Head title={`Categoría ${categoria.anio}`} />

            <div className="space-y-6">
                <PageHeader
                    title={`Categoría ${categoria.anio}`}
                    description="Información general y recursos asociados a esta categoría."
                    icon={<Layers size={20} />}
                    actions={
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href="/categorias"
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                <ArrowLeft size={16} />
                                Volver
                            </Link>

                            {puedeGestionar && (
                                <Link
                                    href={`/categorias/${categoria.id}/edit`}
                                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                                >
                                    <Edit size={16} />
                                    Editar
                                </Link>
                            )}
                        </div>
                    }
                />

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500">
                                Año de la categoría
                            </p>

                            <h2 className="mt-1 text-3xl font-bold text-slate-900">
                                {categoria.anio}
                            </h2>
                        </div>

                        <StatusBadge
                            status={categoria.estado ? 'activo' : 'inactivo'}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Jugadores activos"
                        value={jugadoresActivos}
                        icon={<Users size={20} />}
                        color="blue"
                    />

                    <StatCard
                        title="Profesores activos"
                        value={profesoresActivos}
                        icon={<GraduationCap size={20} />}
                        color="emerald"
                    />

                    <StatCard
                        title="Equipos activos"
                        value={equiposActivos}
                        icon={<Shield size={20} />}
                        color="violet"
                    />

                    <StatCard
                        title="Horarios activos"
                        value={horariosActivos}
                        icon={<Clock size={20} />}
                        color="amber"
                    />
                </div>

                {/* JUGADORES */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
                        <Users className="text-slate-600" size={20} />
                        <div>
                            <h3 className="font-semibold text-slate-900">
                                Jugadores
                            </h3>
                            <p className="text-sm text-slate-500">
                                Jugadores pertenecientes a esta categoría.
                            </p>
                        </div>
                    </div>

                    {categoria.jugadores.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3">Jugador</th>
                                        <th className="px-5 py-3">DNI</th>
                                        <th className="px-5 py-3">Estado</th>
                                        <th className="px-5 py-3 text-right">
                                            Acción
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {categoria.jugadores.map((jugador) => (
                                        <tr key={jugador.id}>
                                            <td className="px-5 py-3 font-medium text-slate-800">
                                                {jugador.apellido},{' '}
                                                {jugador.nombre}
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">
                                                {jugador.dni}
                                            </td>
                                            <td className="px-5 py-3">
                                                <StatusBadge
                                                    status={
                                                        jugador.estado
                                                            ? 'activo'
                                                            : 'inactivo'
                                                    }
                                                />
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <Link
                                                    href={`/jugadores/${jugador.id}`}
                                                    className="font-medium text-slate-700 hover:text-blue-700"
                                                >
                                                    Ver ficha
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyMessage mensaje="No hay jugadores asociados a esta categoría." />
                    )}
                </section>

                {/* PROFESORES */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
                        <GraduationCap className="text-slate-600" size={20} />
                        <div>
                            <h3 className="font-semibold text-slate-900">
                                Profesores
                            </h3>
                            <p className="text-sm text-slate-500">
                                Profesores asignados a esta categoría.
                            </p>
                        </div>
                    </div>

                    {categoria.profesores.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3">Profesor</th>
                                        <th className="px-5 py-3">
                                            Especialidad
                                        </th>
                                        <th className="px-5 py-3">Estado</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {categoria.profesores.map((profesor) => (
                                        <tr key={profesor.id}>
                                            <td className="px-5 py-3 font-medium text-slate-800">
                                                {profesor.apellido},{' '}
                                                {profesor.nombre}
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">
                                                {profesor.especialidad || '-'}
                                            </td>
                                            <td className="px-5 py-3">
                                                <StatusBadge
                                                    status={
                                                        profesor.estado
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
                        <EmptyMessage mensaje="No hay profesores asignados a esta categoría." />
                    )}
                </section>

                {/* EQUIPOS */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
                        <Shield className="text-slate-600" size={20} />
                        <div>
                            <h3 className="font-semibold text-slate-900">
                                Equipos
                            </h3>
                            <p className="text-sm text-slate-500">
                                Equipos registrados en esta categoría.
                            </p>
                        </div>
                    </div>

                    {categoria.equipos.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3">Equipo</th>
                                        <th className="px-5 py-3">Club</th>
                                        <th className="px-5 py-3">Estado</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {categoria.equipos.map((equipo) => (
                                        <tr key={equipo.id}>
                                            <td className="px-5 py-3 font-medium text-slate-800">
                                                {equipo.nombre}
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">
                                                {equipo.club?.nombre || '-'}
                                            </td>
                                            <td className="px-5 py-3">
                                                <StatusBadge
                                                    status={
                                                        equipo.estado
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
                        <EmptyMessage mensaje="No hay equipos registrados en esta categoría." />
                    )}
                </section>

                {/* HORARIOS */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
                        <CalendarDays className="text-slate-600" size={20} />
                        <div>
                            <h3 className="font-semibold text-slate-900">
                                Horarios
                            </h3>
                            <p className="text-sm text-slate-500">
                                Horarios de entrenamiento de la categoría.
                            </p>
                        </div>
                    </div>

                    {categoria.horarios.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3">Día</th>
                                        <th className="px-5 py-3">Horario</th>
                                        <th className="px-5 py-3">Profesor</th>
                                        <th className="px-5 py-3">Cancha</th>
                                        <th className="px-5 py-3">Estado</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {categoria.horarios.map((horario) => (
                                        <tr key={horario.id}>
                                            <td className="px-5 py-3 text-slate-800">
                                                {horario.dia_semana ||
                                                    horario.dia ||
                                                    '-'}
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">
                                                {horario.hora_inicio || '-'}
                                                {horario.hora_fin
                                                    ? ` - ${horario.hora_fin}`
                                                    : ''}
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">
                                                {horario.profesor
                                                    ? `${horario.profesor.apellido}, ${horario.profesor.nombre}`
                                                    : '-'}
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">
                                                {horario.cancha?.nombre || '-'}
                                            </td>
                                            <td className="px-5 py-3">
                                                <StatusBadge
                                                    status={
                                                        horario.estado
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
                        <EmptyMessage mensaje="No hay horarios registrados para esta categoría." />
                    )}
                </section>

                {/* TORNEOS */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
                        <Trophy className="text-slate-600" size={20} />
                        <div>
                            <h3 className="font-semibold text-slate-900">
                                Torneos
                            </h3>
                            <p className="text-sm text-slate-500">
                                Torneos vinculados a esta categoría.
                            </p>
                        </div>
                    </div>

                    {categoria.torneos.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {categoria.torneos.map((torneo) => (
                                <div
                                    key={torneo.id}
                                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                                >
                                    <span className="font-medium text-slate-800">
                                        {torneo.nombre}
                                    </span>

                                    {torneo.estado !== undefined && (
                                        <StatusBadge
                                            status={
                                                torneo.estado
                                                    ? 'activo'
                                                    : 'inactivo'
                                            }
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyMessage mensaje="Esta categoría no está vinculada a ningún torneo." />
                    )}
                </section>
            </div>
        </>
    );
}

function EmptyMessage({ mensaje }: { mensaje: string }) {
    return (
        <div className="px-5 py-8 text-center text-sm text-slate-500">
            {mensaje}
        </div>
    );
}