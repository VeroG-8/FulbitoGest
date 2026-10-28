import { Head, Link,usePage } from '@inertiajs/react';
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
} from 'lucide-react';

interface Categoria {
    id: number;
    nombre: string;
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
        torneo_id: number;
        equipo_id: number;
        fecha_inscripcion: string;
        estado: boolean | number;
    };
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
     // Nueva propiedad
    equipos: Equipo[];
    jugadores: JugadorInscripto[];
}

interface JugadorInscripto {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    categoria: {
        id: number;
        nombre: string;
    } | null;
    pivot: {
        fecha_inscripcion: string;
        estado: string;
    };
}
interface Props {
    torneo: Torneo;
}

export default function Show({ torneo }: Props) {


    const { flash } = usePage<{
        flash: {
            success?: string | null;
            error?: string | null;
        };
    }>().props;

    // Formatear fechas recibidas desde Laravel
    const formatearFecha = (fecha: string | null) => {
        if (!fecha) return 'Sin definir';

        return new Date(
            `${fecha.substring(0, 10)}T12:00:00`
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
                                    {/* TIPO DE TORNEO */}
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

                                <Link
                                    href={`/torneos/${torneo.id}/edit`}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl !bg-white px-4 py-3 text-sm font-semibold !text-slate-900 transition hover:!bg-slate-100"
                                >
                                    <Pencil size={17} />
                                    Editar torneo
                                </Link>

                            </div>
                        </div>

                        
                    </div>
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

                            {/* NOMBRE */}
                            <div>
                                <p className="mb-1 text-xs font-semibold uppercase tracking-wide !text-slate-500">
                                    Nombre del torneo
                                </p>

                                <p className="text-base font-semibold !text-slate-900">
                                    {torneo.nombre}
                                </p>
                            </div>

                            {/* ORGANIZADOR */}
                            <div>
                                <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide !text-slate-500">
                                    <Building2 size={15} />
                                    Organizador
                                </p>

                                <p className="text-sm !text-slate-800">
                                    {torneo.organizador || 'No especificado'}
                                </p>
                            </div>

                            {/* LUGAR */}
                            <div>
                                <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide !text-slate-500">
                                    <MapPin size={15} />
                                    Lugar
                                </p>

                                <p className="text-sm !text-slate-800">
                                    {torneo.lugar || 'No especificado'}
                                </p>
                            </div>

                            {/* CATEGORÍAS */}
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
                                            {categoria.nombre}
                                        </span>
                                    </div>

                                ))}

                            </div>

                        )}
                    </section>
                    {/* EQUIPOS PARTICIPANTES */}
                    {torneo.tipo === 'propio' && (
                        <section className="rounded-2xl border border-slate-200 !bg-white p-6 shadow-sm">

                            {/* ENCABEZADO */}
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                <div>
                                    <h2 className="flex items-center gap-2 text-lg font-bold !text-slate-900">
                                        <Users size={21} />
                                        Equipos participantes
                                    </h2>

                                    <p className="mt-1 text-sm !text-slate-500">
                                        Equipos inscriptos en este torneo.
                                    </p>
                                </div>

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
                            </div>

                            {/* LISTADO DE EQUIPOS */}
                            {torneo.equipos.length === 0 ? (

                                <div className="rounded-xl border border-slate-200 !bg-slate-50 px-5 py-8 text-center">
                                    <Users
                                        size={35}
                                        className="mx-auto mb-3 !text-slate-400"
                                    />

                                    <p className="text-sm font-semibold !text-slate-700">
                                        Todavía no hay equipos inscriptos.
                                    </p>

                                    <p className="mt-1 text-sm !text-slate-500">
                                        Podés comenzar inscribiendo un equipo en este torneo.
                                    </p>
                                </div>

                            ) : (

                                <div className="overflow-x-auto rounded-xl border border-slate-200">

                                    <table className="w-full min-w-[700px] text-left text-sm">

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
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-200">

                                            {torneo.equipos.map((equipo) => (

                                                <tr
                                                    key={equipo.id}
                                                    className="transition hover:!bg-slate-50"
                                                >

                                                    {/* EQUIPO */}
                                                    <td className="px-4 py-4">
                                                        <span className="font-semibold !text-slate-900">
                                                            {equipo.nombre}
                                                        </span>
                                                    </td>

                                                    {/* CLUB */}
                                                    <td className="px-4 py-4 !text-slate-700">
                                                        {equipo.club?.nombre ?? 'Sin club'}
                                                    </td>

                                                    {/* CATEGORÍA */}
                                                    <td className="px-4 py-4">
                                                        <span className="rounded-full !bg-blue-100 px-3 py-1 text-xs font-semibold !text-blue-800">
                                                            {equipo.categoria?.nombre ?? 'Sin categoría'}
                                                        </span>
                                                    </td>

                                                    {/* FECHA DE INSCRIPCIÓN */}
                                                    <td className="px-4 py-4 !text-slate-700">
                                                        {formatearFecha(equipo.pivot.fecha_inscripcion)}
                                                    </td>

                                                    {/* ESTADO */}
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

                                                </tr>

                                            ))}

                                        </tbody>
                                    </table>
                                </div>

                            )}

                            {/* TOTAL DE EQUIPOS */}
                            {torneo.equipos.length > 0 && (
                                <p className="mt-4 text-sm !text-slate-500">
                                    Total de equipos registrados:{' '}
                                    <span className="font-semibold !text-slate-900">
                                        {torneo.equipos.length}
                                    </span>
                                </p>
                            )}

                        </section>
                    )}    

                   {/* PARTICIPACIÓN EN TORNEOS EXTERNOS */}
                        {torneo.tipo === 'externo' && (
                            <section className="rounded-2xl border border-slate-200 !bg-white p-6 shadow-sm">

                                {/* ENCABEZADO */}
                                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                    <div>
                                        <h2 className="flex items-center gap-2 text-lg font-bold !text-slate-900">
                                            <Users size={21} />
                                            Jugadores participantes
                                        </h2>

                                        <p className="mt-1 text-sm !text-slate-500">
                                            Jugadores inscriptos en este torneo externo.
                                        </p>
                                    </div>

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

                                </div>

                                {/* LISTADO DE JUGADORES */}
                                {torneo.jugadores.length === 0 ? (

                                    <div className="rounded-xl border border-slate-200 !bg-slate-50 px-5 py-8 text-center">

                                        <Users
                                            size={35}
                                            className="mx-auto mb-3 !text-slate-400"
                                        />

                                        <p className="text-sm font-semibold !text-slate-700">
                                            Todavía no hay jugadores inscriptos.
                                        </p>

                                        <p className="mt-1 text-sm !text-slate-500">
                                            Podés comenzar registrando jugadores
                                            participantes en este torneo.
                                        </p>

                                    </div>

                                ) : (

                                    <div className="overflow-x-auto rounded-xl border border-slate-200">

                                        <table className="w-full min-w-[700px] text-left text-sm">

                                            <thead className="!bg-slate-100">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold !text-slate-700">
                                                        Jugador
                                                    </th>

                                                    <th className="px-4 py-3 font-semibold !text-slate-700">
                                                        DNI
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
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-slate-200">

                                                {torneo.jugadores.map((jugador) => (

                                                    <tr
                                                        key={jugador.id}
                                                        className="transition hover:!bg-slate-50"
                                                    >

                                                        {/* JUGADOR */}
                                                        <td className="px-4 py-4">
                                                            <span className="font-semibold !text-slate-900">
                                                                {jugador.apellido}, {jugador.nombre}
                                                            </span>
                                                        </td>

                                                        {/* DNI */}
                                                        <td className="px-4 py-4 !text-slate-700">
                                                            {jugador.dni}
                                                        </td>

                                                        {/* CATEGORÍA */}
                                                        <td className="px-4 py-4">
                                                            <span className="rounded-full !bg-blue-100 px-3 py-1 text-xs font-semibold !text-blue-800">
                                                                {jugador.categoria?.nombre ?? 'Sin categoría'}
                                                            </span>
                                                        </td>

                                                        {/* FECHA DE INSCRIPCIÓN */}
                                                        <td className="px-4 py-4 !text-slate-700">
                                                            {formatearFecha(jugador.pivot.fecha_inscripcion)}
                                                        </td>

                                                        {/* ESTADO */}
                                                        <td className="px-4 py-4">

                                                            {jugador.pivot.estado === 'inscripto' ? (

                                                                <span className="inline-flex items-center gap-1 rounded-full !bg-emerald-100 px-3 py-1 text-xs font-semibold !text-emerald-800">
                                                                    <CheckCircle2 size={14} />
                                                                    Inscripto
                                                                </span>

                                                            ) : jugador.pivot.estado === 'pendiente' ? (

                                                                <span className="inline-flex items-center gap-1 rounded-full !bg-amber-100 px-3 py-1 text-xs font-semibold !text-amber-800">
                                                                    Pendiente
                                                                </span>

                                                            ) : (

                                                                <span className="inline-flex items-center gap-1 rounded-full !bg-slate-200 px-3 py-1 text-xs font-semibold !text-slate-700">
                                                                    {jugador.pivot.estado}
                                                                </span>

                                                            )}

                                                        </td>

                                                    </tr>

                                                ))}

                                            </tbody>
                                        </table>

                                    </div>

                                )}

                                {/* TOTAL DE JUGADORES */}
                                {torneo.jugadores.length > 0 && (

                                    <p className="mt-4 text-sm !text-slate-500">
                                        Total de jugadores inscriptos:{' '}

                                        <span className="font-semibold !text-slate-900">
                                            {torneo.jugadores.length}
                                        </span>
                                    </p>

                                )}

                            </section>
                        )}
                    {/* DESCRIPCIÓN */}
                    <section className="rounded-2xl border border-slate-200 !bg-white p-6 shadow-sm">

                        <h2 className="mb-5 flex items-center gap-2 text-lg font-bold !text-slate-900">
                            <FileText size={21} />
                            Descripción
                        </h2>

                        <p className="whitespace-pre-line text-sm leading-relaxed !text-slate-700">
                            {torneo.descripcion || 'No se registró una descripción para este torneo.'}
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

                        <Link
                            href={`/torneos/${torneo.id}/edit`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl !bg-slate-900 px-6 py-3 text-sm font-semibold !text-white transition hover:!bg-slate-800"
                        >
                            <Pencil size={18} />
                            Editar torneo
                        </Link>

                    </div>

                </div>
            </div>
        </>
    );
}