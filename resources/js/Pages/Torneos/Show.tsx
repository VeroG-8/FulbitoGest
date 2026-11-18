import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Trophy,
    ArrowLeft,
    Pencil,
    CalendarDays,
    MapPin,
    Users,
    Building2,
    FileText,
    CheckCircle2,
    XCircle,
    Plus,
    Filter,
    ChevronLeft,
    ChevronRight,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
} from 'lucide-react';

interface Categoria {
    id: number;
    anio: number;
    pivot?: {
        monto_inscripcion?: string | number;
        monto_por_jugador?: string | number;
    };
}

interface Club {
    id: number;
    nombre: string;
}

interface Equipo {
    id: number;
    nombre: string;
    club: Club | null;
    categoria: Categoria | null;
    pivot: {
        id: number;
        torneo_id: number;
        equipo_id: number;
        fecha_inscripcion: string;
        monto_inscripcion?: string | number;
        estado: boolean | number;
    };
}

interface JugadorInscripto {
    id: number;
    nombre: string;
    apellido: string;
    dni?: string;
    categoria: Categoria | null;
    pivot: {
        id: number;
        fecha_inscripcion: string;
        monto_inscripcion?: string | number;
        estado: string;
    };
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

interface Torneo {
    id: number;
    nombre: string;
    tipo: 'propio' | 'externo';
    organizador: string | null;
    fecha_inicio: string;
    fecha_fin: string | null;
    lugar: string | null;
    descripcion: string | null;
    estado: boolean;
    categorias: Categoria[];
}

interface Props {
    torneo: Torneo;
    equipos: Paginacion<Equipo>;
    jugadores: Paginacion<JugadorInscripto>;
    filtros: {
        estado_jugador: string;
        orden_jugador: 'jugador' | 'categoria';
        direccion_jugador: 'asc' | 'desc';
    };
}

interface PaginacionProps {
    actual: number;
    ultima: number;
    anterior: string | null;
    siguiente: string | null;
}

function ControlesPaginacion({
    actual,
    ultima,
    anterior,
    siguiente,
}: PaginacionProps) {
    if (ultima <= 1) return null;

    return (
        <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-4 sm:flex-row">
            <p className="text-sm !text-slate-500">
                Página{' '}
                <span className="font-semibold !text-slate-900">
                    {actual}
                </span>{' '}
                de{' '}
                <span className="font-semibold !text-slate-900">
                    {ultima}
                </span>
            </p>

            <div className="flex items-center gap-2">
                {anterior ? (
                    <Link
                        href={anterior}
                        preserveScroll
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 !bg-white px-3 py-2 text-sm font-medium !text-slate-700 transition hover:!bg-slate-100"
                    >
                        <ChevronLeft size={16} />
                        Anterior
                    </Link>
                ) : (
                    <button
                        type="button"
                        disabled
                        className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-slate-200 !bg-slate-100 px-3 py-2 text-sm font-medium !text-slate-400"
                    >
                        <ChevronLeft size={16} />
                        Anterior
                    </button>
                )}

                {siguiente ? (
                    <Link
                        href={siguiente}
                        preserveScroll
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 !bg-white px-3 py-2 text-sm font-medium !text-slate-700 transition hover:!bg-slate-100"
                    >
                        Siguiente
                        <ChevronRight size={16} />
                    </Link>
                ) : (
                    <button
                        type="button"
                        disabled
                        className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-slate-200 !bg-slate-100 px-3 py-2 text-sm font-medium !text-slate-400"
                    >
                        Siguiente
                        <ChevronRight size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}

export default function Show({
    torneo,
    equipos,
    jugadores,
    filtros,
}: Props) {
    const { auth, flash } = usePage<any>().props;

    const esAdministrador = ['admin', 'superadmin'].includes(
        auth?.user?.rol,
    );

    const esProfesor = auth?.user?.rol === 'profesor';

    const [filtroEstado, setFiltroEstado] = useState(
        filtros?.estado_jugador ?? 'todos',
    );

    const [mostrarFiltro, setMostrarFiltro] = useState(false);
    const ordenJugador = filtros?.orden_jugador ?? 'jugador';
    const direccionJugador = filtros?.direccion_jugador ?? 'asc';

    const ordenarJugadores = (
        columna: 'jugador' | 'categoria',
    ) => {
        const nuevaDireccion =
            ordenJugador === columna && direccionJugador === 'asc'
                ? 'desc'
                : 'asc';

        router.get(
            `/torneos/${torneo.id}`,
            {
                estado_jugador: filtroEstado,
                orden_jugador: columna,
                direccion_jugador: nuevaDireccion,
                equipos_page: equipos.current_page,
                jugadores_page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const iconoOrdenJugador = (
        columna: 'jugador' | 'categoria',
    ) => {
        if (ordenJugador !== columna) {
            return (
                <ArrowUpDown
                    size={15}
                    className="text-slate-400"
                />
            );
        }

        return direccionJugador === 'asc' ? (
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
    const actualizarEstado = (
        jugadorId: number,
        estado: 'pendiente' | 'inscripto' | 'cancelado',
    ) => {
        if (!esAdministrador) return;

        if (estado === 'cancelado') {
            const confirmar = window.confirm(
                '¿Estás segura de que querés cancelar la inscripción de este jugador?',
            );

            if (!confirmar) return;
        }

        router.patch(
            `/torneos/${torneo.id}/jugadores/${jugadorId}`,
            { estado },
            {
                preserveScroll: true,
            },
        );
    };

    const cambiarFiltroEstado = (estado: string) => {
        setFiltroEstado(estado);

        router.get(
            `/torneos/${torneo.id}`,
            {
                estado_jugador: estado,
                equipos_page: equipos.current_page,
                jugadores_page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const formatearFecha = (fecha: string | null) => {
        if (!fecha) return 'Sin definir';

        return new Date(
            `${fecha.substring(0, 10)}T12:00:00`,
        ).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <>
            <Head title={`${torneo.nombre} | FulbitoGest`} />

            <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
                <div className="mx-auto max-w-5xl space-y-6">

                    {/* ENCABEZADO */}
                    <div className="rounded-2xl !bg-slate-950 px-6 py-7 shadow-lg sm:px-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl !bg-slate-800">
                                    <Trophy
                                        size={30}
                                        className="!text-white"
                                    />
                                </div>

                                <div>
                                    <p className="text-sm !text-slate-300">
                                        Gestión deportiva
                                    </p>

                                    <h1 className="text-2xl font-bold !text-white sm:text-3xl">
                                        Detalles del torneo
                                    </h1>

                                    <p className="mt-1 text-sm !text-slate-300">
                                        {torneo.nombre}
                                    </p>

                                    <div className="mt-3">
                                        {torneo.tipo === 'propio' ? (
                                            <span className="inline-flex items-center rounded-full !bg-blue-100 px-3 py-1 text-xs font-bold !text-blue-800">
                                                🏆 Torneo propio
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full !bg-emerald-100 px-3 py-1 text-xs font-bold !text-emerald-800">
                                                ⚽ Torneo externo
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/torneos"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 !bg-slate-800 px-4 py-3 text-sm font-semibold !text-white transition hover:!bg-slate-700"
                                >
                                    <ArrowLeft size={17} />
                                    Volver
                                </Link>

                                {esAdministrador && (
                                    <Link
                                        href={`/torneos/${torneo.id}/edit`}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl !bg-white px-4 py-3 text-sm font-semibold !text-slate-900 transition hover:!bg-slate-100"
                                    >
                                        <Pencil size={17} />
                                        Editar torneo
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MENSAJES */}
                    {flash?.success && (
                        <div
                            role="status"
                            className="rounded-xl border border-emerald-200 !bg-emerald-50 px-5 py-4 shadow-sm"
                        >
                            <p className="text-sm font-semibold !text-emerald-800">
                                ✓ {flash.success}
                            </p>
                        </div>
                    )}

                    {flash?.error && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-200 !bg-red-50 px-5 py-4 shadow-sm"
                        >
                            <p className="text-sm font-semibold !text-red-700">
                                {flash.error}
                            </p>
                        </div>
                    )}

                    {/* INFORMACIÓN GENERAL */}
                    <section className="rounded-2xl border border-slate-200 !bg-white p-6 shadow-sm">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-lg font-bold !text-slate-900">
                                Información general
                            </h2>

                            <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                    torneo.estado
                                        ? '!bg-emerald-100 !text-emerald-800'
                                        : '!bg-slate-200 !text-slate-700'
                                }`}
                            >
                                {torneo.estado ? (
                                    <CheckCircle2 size={15} />
                                ) : (
                                    <XCircle size={15} />
                                )}

                                {torneo.estado ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide !text-slate-500">
                                    Nombre del torneo
                                </p>

                                <p className="text-base font-semibold !text-slate-900">
                                    {torneo.nombre}
                                </p>
                            </div>

                            <div>
                                <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide !text-slate-500">
                                    <Building2 size={15} />
                                    Organizador
                                </p>

                                <p className="text-sm !text-slate-800">
                                    {torneo.organizador || 'No especificado'}
                                </p>
                            </div>

                            <div>
                                <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide !text-slate-500">
                                    <MapPin size={15} />
                                    Lugar
                                </p>

                                <p className="text-sm !text-slate-800">
                                    {torneo.lugar || 'No especificado'}
                                </p>
                            </div>

                            <div>
                                <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide !text-slate-500">
                                    <Users size={15} />
                                    Categorías participantes
                                </p>

                                <p className="text-sm font-semibold !text-slate-900">
                                    {torneo.categorias.length}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* FECHAS */}
                    <section className="rounded-2xl border border-slate-200 !bg-white p-6 shadow-sm">
                        <h2 className="mb-6 flex items-center gap-2 text-lg font-bold !text-slate-900">
                            <CalendarDays size={21} />
                            Fechas del torneo
                        </h2>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 !bg-slate-50 p-5">
                                <p className="mb-2 text-sm font-medium !text-slate-500">
                                    Fecha de inicio
                                </p>

                                <p className="text-base font-semibold !text-slate-900">
                                    {formatearFecha(torneo.fecha_inicio)}
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 !bg-slate-50 p-5">
                                <p className="mb-2 text-sm font-medium !text-slate-500">
                                    Fecha de finalización
                                </p>

                                <p className="text-base font-semibold !text-slate-900">
                                    {formatearFecha(torneo.fecha_fin)}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* CATEGORÍAS PARTICIPANTES */}
                    <section className="rounded-2xl border border-slate-200 !bg-white p-6 shadow-sm">
                        <h2 className="mb-2 flex items-center gap-2 text-lg font-bold !text-slate-900">
                            <Users size={21} />
                            Categorías participantes
                        </h2>

                        <p className="mb-5 text-sm !text-slate-500">
                            Categorías habilitadas para participar en este torneo.
                        </p>

                        {torneo.categorias.length === 0 ? (
                            <div className="rounded-xl border border-amber-200 !bg-amber-50 p-5">
                                <p className="text-sm !text-amber-800">
                                    Este torneo todavía no tiene categorías asociadas.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                                {torneo.categorias.map((categoria) => (
                                    <div
                                        key={categoria.id}
                                        className="flex items-center gap-3 rounded-xl border border-blue-200 !bg-blue-50 px-4 py-3"
                                    >
                                        <Users
                                            size={17}
                                            className="!text-blue-700"
                                        />

                                        <span className="text-sm font-semibold !text-blue-900">
                                            Categoría {categoria.anio}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* EQUIPOS PARTICIPANTES */}
                    {torneo.tipo === 'propio' && (
                        <section className="rounded-2xl border border-slate-200 !bg-white p-6 shadow-sm">
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="flex items-center gap-2 text-lg font-bold !text-slate-900">
                                        <Users size={21} />
                                        Equipos participantes
                                    </h2>

                                    <p className="mt-1 text-sm !text-slate-500">
                                        {esProfesor
                                            ? 'Equipos con inscripción activa en este torneo.'
                                            : 'Equipos invitados inscriptos en este torneo.'}
                                    </p>
                                </div>

                                {esAdministrador && (
                                    <Link
                                        href={`/torneos/${torneo.id}/inscribir-equipo`}
                                        style={{
                                            backgroundColor: '#0f172a',
                                            color: '#ffffff',
                                        }}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-90"
                                    >
                                        <Plus size={18} color="#ffffff" />
                                        <span style={{ color: '#ffffff' }}>
                                            Inscribir equipo
                                        </span>
                                    </Link>
                                )}
                            </div>

                            {equipos.data.length === 0 ? (
                                <div className="rounded-xl border border-slate-200 !bg-slate-50 px-5 py-8 text-center">
                                    <Users
                                        size={35}
                                        className="mx-auto mb-3 !text-slate-400"
                                    />

                                    <p className="text-sm font-semibold !text-slate-700">
                                        Todavía no hay equipos inscriptos.
                                    </p>

                                    {esAdministrador && (
                                        <p className="mt-1 text-sm !text-slate-500">
                                            Podés comenzar inscribiendo un equipo en este torneo.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="w-full min-w-[650px] text-left text-sm">
                                        <thead className="!bg-slate-100">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold !text-slate-700">
                                                    Equipo
                                                </th>

                                                <th className="px-4 py-3 font-semibold !text-slate-700">
                                                    Club
                                                </th>

                                                <th className="px-4 py-3 font-semibold !text-slate-700">
                                                    Categoría
                                                </th>

                                                <th className="px-4 py-3 font-semibold !text-slate-700">
                                                    Fecha de inscripción
                                                </th>

                                                <th className="px-4 py-3 font-semibold !text-slate-700">
                                                    Estado
                                                </th>

                                                {esAdministrador && (
                                                    <th className="px-4 py-3 font-semibold !text-slate-700">
                                                        Acciones
                                                    </th>
                                                )}
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-200">
                                            {equipos.data.map((equipo) => (
                                                <tr
                                                    key={equipo.id}
                                                    className="transition hover:!bg-slate-50"
                                                >
                                                    <td className="px-4 py-4">
                                                        <span className="font-semibold !text-slate-900">
                                                            {equipo.nombre}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4 !text-slate-700">
                                                        {equipo.club?.nombre ?? 'Sin club'}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <span className="rounded-full !bg-blue-100 px-3 py-1 text-xs font-semibold !text-blue-800">
                                                            {equipo.categoria?.anio ?? 'Sin categoría'}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-4 !text-slate-700">
                                                        {formatearFecha(equipo.pivot.fecha_inscripcion)}
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        {Boolean(equipo.pivot.estado) ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full !bg-emerald-100 px-3 py-1 text-xs font-semibold !text-emerald-800">
                                                                <CheckCircle2 size={14} />
                                                                Inscripto
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full !bg-slate-200 px-3 py-1 text-xs font-semibold !text-slate-700">
                                                                <XCircle size={14} />
                                                                Inactivo
                                                            </span>
                                                        )}
                                                    </td>

                                                    {esAdministrador && (
                                                        <td className="px-4 py-4">
                                                            <Link
                                                                href={`/inscripciones-equipo/${equipo.pivot.id}/pagos`}
                                                                className="inline-flex items-center justify-center gap-2 rounded-lg !bg-slate-900 px-3 py-2 text-xs font-semibold !text-white transition hover:!bg-slate-700"
                                                            >
                                                                <FileText size={15} />
                                                                Ver pagos
                                                            </Link>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {equipos.total > 0 && (
                                <>
                                    <p className="mt-4 text-sm !text-slate-500">
                                        Mostrando{' '}
                                        <span className="font-semibold !text-slate-900">
                                            {equipos.from}–{equipos.to}
                                        </span>{' '}
                                        de{' '}
                                        <span className="font-semibold !text-slate-900">
                                            {equipos.total}
                                        </span>{' '}
                                        equipos registrados.
                                    </p>

                                    <ControlesPaginacion
                                        actual={equipos.current_page}
                                        ultima={equipos.last_page}
                                        anterior={equipos.prev_page_url}
                                        siguiente={equipos.next_page_url}
                                    />
                                </>
                            )}
                        </section>
                    )}

                    {/* JUGADORES PARTICIPANTES */}
                    <section className="rounded-2xl border border-slate-200 !bg-white p-6 shadow-sm">
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="flex items-center gap-2 text-lg font-bold !text-slate-900">
                                    <Users size={21} />
                                    Jugadores participantes
                                </h2>

                                <p className="mt-1 text-sm !text-slate-500">
                                    {esProfesor
                                        ? 'Jugadores con inscripción confirmada en este torneo.'
                                        : 'Jugadores de nuestro plantel inscriptos en este torneo.'}
                                </p>
                            </div>

                            {esAdministrador && (
                                <Link
                                    href={`/torneos/${torneo.id}/inscribir-jugador`}
                                    style={{
                                        backgroundColor: '#047857',
                                        color: '#ffffff',
                                    }}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-90"
                                >
                                    <Plus size={18} color="#ffffff" />
                                    <span style={{ color: '#ffffff' }}>
                                        Inscribir jugador
                                    </span>
                                </Link>
                            )}
                        </div>

                        {/* FILTRO POR ESTADO: SOLO ADMINISTRADORES */}
                        {esAdministrador && (
                            <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <label
                                        htmlFor="filtro-estado-jugador"
                                        className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                                    >
                                        <Filter size={16} className="text-slate-500" />
                                        Filtrar jugadores por estado de inscripción
                                    </label>

                                    <select
                                        id="filtro-estado-jugador"
                                        value={filtroEstado}
                                        onChange={(e) => cambiarFiltroEstado(e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
                                    >
                                        <option value="todos">Todos los jugadores</option>
                                        <option value="pendiente">Pendientes</option>
                                        <option value="inscripto">Inscriptos</option>
                                        <option value="cancelado">Cancelados</option>
                                    </select>
                                </div>

                                <div className="text-sm text-slate-500">
                                    Total de jugadores: <span className="font-semibold text-slate-700">{jugadores.total}</span>
                                </div>
                            </div>
                                                    )}

                        {/* LISTADO DE JUGADORES */}
                        {jugadores.data.length === 0 ? (
                            <div className="rounded-xl border border-slate-200 !bg-slate-50 px-5 py-8 text-center">
                                <Users
                                    size={35}
                                    className="mx-auto mb-3 !text-slate-400"
                                />

                                <p className="text-sm font-semibold !text-slate-700">
                                    {esAdministrador && filtroEstado !== 'todos'
                                        ? 'No hay jugadores con el estado seleccionado.'
                                        : esProfesor
                                          ? 'Todavía no hay jugadores con inscripción confirmada.'
                                          : 'Todavía no hay jugadores inscriptos.'}
                                </p>

                                {esAdministrador && filtroEstado === 'todos' && (
                                    <p className="mt-1 text-sm !text-slate-500">
                                        Podés comenzar registrando jugadores participantes en este torneo.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-slate-200">
                                <table className="w-full min-w-[600px] text-left text-sm">
                                    <thead className="!bg-slate-100">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold !text-slate-700">
                                                <button
                                                    type="button"
                                                    onClick={() => ordenarJugadores('jugador')}
                                                    className="inline-flex items-center gap-2 transition hover:!text-blue-700"
                                                >
                                                    Jugador
                                                    {iconoOrdenJugador('jugador')}
                                                </button>
                                            </th>

                                            {esAdministrador && (
                                                <th className="px-4 py-3 font-semibold !text-slate-700">
                                                    DNI
                                                </th>
                                            )}

                                          <th className="px-4 py-3 font-semibold !text-slate-700">
                                                <button
                                                    type="button"
                                                    onClick={() => ordenarJugadores('categoria')}
                                                    className="inline-flex items-center gap-2 transition hover:!text-blue-700"
                                                >
                                                    Categoría
                                                    {iconoOrdenJugador('categoria')}
                                                </button>
                                            </th>

                                            <th className="px-4 py-3 font-semibold !text-slate-700">
                                                Fecha de inscripción
                                            </th>

                                            <th className="px-4 py-3 font-semibold !text-slate-700">
                                                Estado
                                            </th>

                                            {esAdministrador && (
                                                <th className="px-4 py-3 font-semibold !text-slate-700">
                                                    Acciones
                                                </th>
                                            )}
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-200">
                                        {jugadores.data.map((jugador) => (
                                            <tr
                                                key={jugador.id}
                                                className="transition hover:!bg-slate-50"
                                            >
                                                <td className="px-4 py-4">
                                                    <span className="font-semibold !text-slate-900">
                                                        {jugador.apellido}, {jugador.nombre}
                                                    </span>
                                                </td>

                                                {esAdministrador && (
                                                    <td className="px-4 py-4 !text-slate-700">
                                                        {jugador.dni ?? '-'}
                                                    </td>
                                                )}

                                                <td className="px-4 py-4">
                                                    <span className="rounded-full !bg-blue-100 px-3 py-1 text-xs font-semibold !text-blue-800">
                                                        {jugador.categoria?.anio ?? 'Sin categoría'}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4 !text-slate-700">
                                                    {formatearFecha(jugador.pivot.fecha_inscripcion)}
                                                </td>

                                                <td className="px-4 py-4">
                                                    {jugador.pivot.estado === 'inscripto' ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full !bg-emerald-100 px-3 py-1 text-xs font-semibold !text-emerald-800">
                                                            <CheckCircle2 size={14} />
                                                            Inscripto
                                                        </span>
                                                    ) : jugador.pivot.estado === 'pendiente' ? (
                                                        <span className="inline-flex items-center rounded-full !bg-amber-100 px-3 py-1 text-xs font-semibold !text-amber-800">
                                                            Pendiente
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full !bg-red-100 px-3 py-1 text-xs font-semibold !text-red-800">
                                                            <XCircle size={14} />
                                                            Cancelado
                                                        </span>
                                                    )}
                                                </td>

                                                {esAdministrador && (
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col gap-2">
                                                            <select
                                                                value={jugador.pivot.estado}
                                                                onChange={(e) => {
                                                                    const nuevoEstado =
                                                                        e.target.value as
                                                                            | 'pendiente'
                                                                            | 'inscripto'
                                                                            | 'cancelado';

                                                                    actualizarEstado(
                                                                        jugador.id,
                                                                        nuevoEstado,
                                                                    );
                                                                }}
                                                                className="rounded-lg border border-slate-300 !bg-white px-3 py-2 text-sm !text-slate-800"
                                                            >
                                                                <option value="pendiente">
                                                                    Pendiente
                                                                </option>
                                                                <option value="inscripto">
                                                                    Inscripto
                                                                </option>
                                                                <option value="cancelado">
                                                                    Cancelado
                                                                </option>
                                                            </select>

                                                            <Link
                                                                href={`/inscripciones-torneo/${jugador.pivot.id}/pagos`}
                                                                className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                                                            >
                                                                Ver pagos
                                                            </Link>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {jugadores.total > 0 && (
                            <>
                                <p className="mt-4 text-sm !text-slate-500">
                                    Mostrando{' '}
                                    <span className="font-semibold !text-slate-900">
                                        {jugadores.from}–{jugadores.to}
                                    </span>{' '}
                                    de{' '}
                                    <span className="font-semibold !text-slate-900">
                                        {jugadores.total}
                                    </span>{' '}
                                    jugadores inscriptos.
                                </p>

                                <ControlesPaginacion
                                    actual={jugadores.current_page}
                                    ultima={jugadores.last_page}
                                    anterior={jugadores.prev_page_url}
                                    siguiente={jugadores.next_page_url}
                                />
                            </>
                        )}
                    </section>

                    {/* DESCRIPCIÓN */}
                    <section className="rounded-2xl border border-slate-200 !bg-white p-6 shadow-sm">
                        <h2 className="mb-5 flex items-center gap-2 text-lg font-bold !text-slate-900">
                            <FileText size={21} />
                            Descripción
                        </h2>

                        <p className="whitespace-pre-line text-sm leading-relaxed !text-slate-700">
                            {torneo.descripcion ||
                                'No se registró una descripción para este torneo.'}
                        </p>
                    </section>

                    {/* ACCIONES INFERIORES */}
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Link
                            href="/torneos"
                            className="rounded-xl border border-slate-300 !bg-white px-6 py-3 text-center text-sm font-semibold !text-slate-700 transition hover:!bg-slate-100"
                        >
                            Volver al listado
                        </Link>

                        {esAdministrador && (
                            <Link
                                href={`/torneos/${torneo.id}/edit`}
                                className="inline-flex items-center justify-center gap-2 rounded-xl !bg-slate-900 px-6 py-3 text-sm font-semibold !text-white transition hover:!bg-slate-800"
                            >
                                <Pencil size={18} />
                                Editar torneo
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}