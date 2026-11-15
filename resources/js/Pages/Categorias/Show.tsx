import { Head, Link } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    ArrowUpDown,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Edit,
    Eye,
    GraduationCap,
    Layers,
    Users,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatusBadge from '@/Components/Shared/StatusBadge';

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

interface Categoria {
    id: number;
    anio: number;
    estado: boolean;
    profesores: Profesor[];
    horarios: Horario[];
}

interface PaginacionJugadores {
    data: Jugador[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Filtros {
    orden: 'apellido' | 'nombre';
    direccion: 'asc' | 'desc';
}

interface Props {
    categoria: Categoria;
    jugadores: PaginacionJugadores;
    filtros: Filtros;
    puedeGestionar: boolean;
}

export default function Show({
    categoria,
    jugadores,
    filtros,
    puedeGestionar,
}: Props) {
    const cambiarOrden = (campo: 'apellido' | 'nombre') => {
        const direccion =
            filtros.orden === campo && filtros.direccion === 'asc'
                ? 'desc'
                : 'asc';

        return `/categorias/${categoria.id}?orden=${campo}&direccion=${direccion}`;
    };

    const iconoOrden = (campo: 'apellido' | 'nombre') => {
        if (filtros.orden !== campo) {
            return <ArrowUpDown size={14} />;
        }

        return filtros.direccion === 'asc' ? (
            <ArrowUp size={14} />
        ) : (
            <ArrowDown size={14} />
        );
    };

    return (
        <>
            <Head title={`Categoría ${categoria.anio}`} />

            <div className="space-y-6">
                <PageHeader
                    title={`Categoría ${categoria.anio}`}
                    description="Información general y organización deportiva de esta categoría."
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

                {/* INFORMACIÓN GENERAL */}
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

                {/* JUGADORES */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                        <div className="flex items-center gap-3">
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

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                            {jugadores.total}{' '}
                            {jugadores.total === 1
                                ? 'jugador'
                                : 'jugadores'}
                        </span>
                    </div>

                    {jugadores.data.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                        <tr>
                                            <th className="px-5 py-3">
                                                <Link
                                                    href={cambiarOrden('apellido')}
                                                    preserveScroll
                                                    className="inline-flex items-center gap-2 transition hover:text-slate-900"
                                                >
                                                    Jugador
                                                    {iconoOrden('apellido')}
                                                </Link>
                                            </th>

                                            <th className="px-5 py-3">
                                                DNI
                                            </th>

                                            <th className="px-5 py-3">
                                                Estado
                                            </th>

                                            <th className="px-5 py-3 text-right">
                                                Acción
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {jugadores.data.map((jugador) => (
                                            <tr
                                                key={jugador.id}
                                                className="transition hover:bg-slate-50"
                                            >
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
                                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                                                    >
                                                        <Eye size={15} />
                                                        Ver ficha
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* PAGINACIÓN */}
                            <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-500">
                                    Mostrando{' '}
                                    <span className="font-semibold text-slate-700">
                                        {jugadores.from}
                                    </span>{' '}
                                    a{' '}
                                    <span className="font-semibold text-slate-700">
                                        {jugadores.to}
                                    </span>{' '}
                                    de{' '}
                                    <span className="font-semibold text-slate-700">
                                        {jugadores.total}
                                    </span>{' '}
                                    jugadores
                                </p>

                                <div className="flex items-center gap-2">
                                    {jugadores.prev_page_url ? (
                                        <Link
                                            href={jugadores.prev_page_url}
                                            preserveScroll
                                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                        >
                                            <ChevronLeft size={16} />
                                            Anterior
                                        </Link>
                                    ) : (
                                        <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
                                            <ChevronLeft size={16} />
                                            Anterior
                                        </span>
                                    )}

                                    <span className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
                                        {jugadores.current_page} /{' '}
                                        {jugadores.last_page}
                                    </span>

                                    {jugadores.next_page_url ? (
                                        <Link
                                            href={jugadores.next_page_url}
                                            preserveScroll
                                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                        >
                                            Siguiente
                                            <ChevronRight size={16} />
                                        </Link>
                                    ) : (
                                        <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">
                                            Siguiente
                                            <ChevronRight size={16} />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </>
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
                                        <th className="px-5 py-3">
                                            Profesor
                                        </th>
                                        <th className="px-5 py-3">
                                            Especialidad
                                        </th>
                                        <th className="px-5 py-3">
                                            Estado
                                        </th>
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
                                        <th className="px-5 py-3">
                                            Horario
                                        </th>
                                        <th className="px-5 py-3">
                                            Profesor
                                        </th>
                                        <th className="px-5 py-3">
                                            Cancha
                                        </th>
                                        <th className="px-5 py-3">
                                            Estado
                                        </th>
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