import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import {
    Trophy,
    Plus,
    Search,
    Eye,
    Pencil,
    CalendarDays,
    MapPin,
    Users,
    CheckCircle2,
    Trash2,
    AlertTriangle,
    X,
} from 'lucide-react';

// Tipos de datos
interface Categoria {
    id: number;
    nombre: string;
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

interface Props {
    torneos: Paginacion<Torneo>;
    filtros: {
        buscar: string;
    };
}
interface FlashMessages {
    success?: string | null;
    error?: string | null;
}
export default function Index({ torneos, filtros }: Props) {
    const { flash } = usePage<{
     flash: FlashMessages;
        }>().props;
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');

    const buscarTorneos = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        router.get(
            '/torneos',
            { buscar },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const [torneoAEliminar, setTorneoAEliminar] = useState<Torneo | null>(null);
    const [eliminando, setEliminando] = useState(false);
    const eliminarTorneo = () => {
        if (!torneoAEliminar || eliminando) return;

        router.delete(`/torneos/${torneoAEliminar.id}`, {
            preserveScroll: true,

            onStart: () => {
                setEliminando(true);
            },

            onSuccess: () => {
                setTorneoAEliminar(null);
            },

            onFinish: () => {
                setEliminando(false);
            },
        });
    };

    const formatearFecha = (fecha: string | null) => {
        if (!fecha) return 'Sin definir';

        return new Date(`${fecha.substring(0, 10)}T12:00:00`)
            .toLocaleDateString('es-AR');
    };

    return (
        <>
            <Head title="Torneos | FulbitoGest" />

            <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* ENCABEZADO */}
                    <div className="overflow-hidden rounded-2xl !bg-slate-950 shadow-lg">
                        <div className="flex flex-col gap-5 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">

                            {/* Título e ícono */}
                            <div className="flex items-center gap-4">

                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl !bg-slate-800">
                                    <Trophy
                                        size={30}
                                        strokeWidth={1.8}
                                        className="!text-white"
                                    />
                                </div>

                                <div>
                                    <p className="mb-1 text-sm font-medium !text-slate-300">
                                        Gestión deportiva
                                    </p>

                                    <h1 className="m-0 text-2xl font-bold tracking-tight !text-white sm:text-3xl">
                                        Torneos
                                    </h1>

                                    <p className="mt-1 text-sm !text-slate-300">
                                        Administración de torneos y categorías
                                    </p>
                                </div>
                            </div>

                            {/* Botón nuevo torneo */}
                            <Link
                                href="/torneos/create"
                                className="inline-flex items-center justify-center gap-2 rounded-xl !bg-white px-5 py-3 text-sm font-semibold !text-slate-900 transition hover:!bg-slate-100"
                            >
                                <Plus size={18} />
                                Nuevo torneo
                            </Link>

                        </div>
                    </div>


                    {/* MENSAJES DE CONFIRMACIÓN */}
                    {flash?.success && (
                        <div
                            role="status"
                            className="flex items-center gap-3 rounded-xl border border-emerald-200 !bg-emerald-50 px-5 py-4 shadow-sm"
                        >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full !bg-emerald-100">
                                <CheckCircle2
                                    size={21}
                                    className="!text-emerald-700"
                                />
                            </div>

                            <div>
                                <p className="text-sm font-semibold !text-emerald-800">
                                    Operación exitosa
                                </p>

                                <p className="text-sm !text-emerald-700">
                                    {flash.success}
                                </p>
                            </div>
                        </div>
                    )}

                    {flash?.error && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-200 !bg-red-50 px-5 py-4 shadow-sm"
                        >
                            <p className="text-sm font-medium !text-red-700">
                                {flash.error}
                            </p>
                        </div>
                    )}

                    {/* ESTADÍSTICAS */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">
                                    Total de torneos
                                </span>
                                <Trophy className="text-slate-400" size={21} />
                            </div>

                            <p className="mt-3 text-3xl font-bold text-slate-900">
                                {torneos.total}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">
                                    Activos en esta página
                                </span>
                                <CalendarDays className="text-emerald-600" size={21} />
                            </div>

                            <p className="mt-3 text-3xl font-bold text-emerald-700">
                                {torneos.data.filter((t) => t.estado).length}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">
                                    Inactivos en esta página
                                </span>
                                <Users className="text-slate-400" size={21} />
                            </div>

                            <p className="mt-3 text-3xl font-bold text-slate-700">
                                {torneos.data.filter((t) => !t.estado).length}
                            </p>
                        </div>
                    </div>

                    {/* LISTADO */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-200 p-5 sm:p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Listado de torneos
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Consultá y administrá los torneos registrados.
                                    </p>
                                </div>

                                <form
                                    onSubmit={buscarTorneos}
                                    className="flex flex-col gap-2 sm:flex-row"
                                >
                                    <input
                                        type="text"
                                        value={buscar}
                                        onChange={(e) => setBuscar(e.target.value)}
                                        placeholder="Buscar torneo..."
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-600 sm:w-64"
                                    />

                                    <button
                                        type="submit"
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white hover:bg-slate-800"
                                    >
                                        <Search size={17} />
                                        Buscar
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                                    <tr>
                                        <th className="px-5 py-4">Torneo</th>
                                        <th className="px-5 py-4">Categorías</th>
                                        <th className="px-5 py-4">Fecha de inicio</th>
                                        <th className="px-5 py-4">Lugar</th>
                                        <th className="px-5 py-4">Estado</th>
                                        <th className="px-5 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {torneos.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-5 py-14 text-center text-slate-500"
                                            >
                                                No se encontraron torneos registrados.
                                            </td>
                                        </tr>
                                    ) : (
                                        torneos.data.map((torneo) => (
                                            <tr
                                                key={torneo.id}
                                                className="transition hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-slate-900">
                                                        {torneo.nombre}
                                                    </p>
                                                    <div className="mt-2">
                                                        {torneo.tipo === 'propio' ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full !bg-blue-100 px-3 py-1 text-xs font-semibold !text-blue-800">
                                                                🏆 Propio
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full !bg-emerald-100 px-3 py-1 text-xs font-semibold !text-emerald-800">
                                                                ⚽ Externo
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500">
                                                        {torneo.organizador || 'Sin organizador'}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex max-w-64 flex-wrap gap-1">
                                                        {torneo.categorias.length > 0 ? (
                                                            torneo.categorias.map((categoria) => (
                                                                <span
                                                                    key={categoria.id}
                                                                    className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                                                                >
                                                                    {categoria.nombre}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-slate-400">
                                                                Sin categorías
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-slate-600">
                                                    {formatearFecha(torneo.fecha_inicio)}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1.5 text-slate-600">
                                                        <MapPin size={15} className="shrink-0" />
                                                        {torneo.lugar || 'Sin definir'}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                            torneo.estado
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : 'bg-slate-200 text-slate-700'
                                                        }`}
                                                    >
                                                        {torneo.estado ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={`/torneos/${torneo.id}`}
                                                            title="Ver torneo"
                                                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                        >
                                                            <Eye size={18} />
                                                        </Link>

                                                        <Link
                                                            href={`/torneos/${torneo.id}/edit`}
                                                            title="Editar torneo"
                                                            className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                        >
                                                            <Pencil size={18} />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            title="Eliminar torneo"
                                                            onClick={() => setTorneoAEliminar(torneo)}
                                                            className="rounded-lg p-2 !text-red-600 transition hover:!bg-red-50"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINACIÓN */}
                        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Mostrando {torneos.from ?? 0} a {torneos.to ?? 0} de{' '}
                                {torneos.total} torneos
                            </p>

                            <div className="flex gap-2">
                                <Link
                                    href={torneos.prev_page_url ?? '#'}
                                    className={`rounded-lg border px-4 py-2 text-sm ${
                                        torneos.prev_page_url
                                            ? 'border-slate-300 text-slate-700 hover:bg-slate-50'
                                            : 'pointer-events-none border-slate-200 text-slate-300'
                                    }`}
                                >
                                    Anterior
                                </Link>

                                <Link
                                    href={torneos.next_page_url ?? '#'}
                                    className={`rounded-lg border px-4 py-2 text-sm ${
                                        torneos.next_page_url
                                            ? 'border-slate-300 text-slate-700 hover:bg-slate-50'
                                            : 'pointer-events-none border-slate-200 text-slate-300'
                                    }`}
                                >
                                    Siguiente
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* MODAL DE CONFIRMACIÓN */}
            {torneoAEliminar && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center !bg-black/60 p-4"
                    role="presentation"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget && !eliminando) {
                            setTorneoAEliminar(null);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-eliminar-torneo"
                        className="w-full max-w-md rounded-2xl !bg-white p-6 shadow-2xl"
                    >
                        {/* ENCABEZADO DEL MODAL */}
                        <div className="mb-5 flex items-start justify-between">

                            <div className="flex h-12 w-12 items-center justify-center rounded-full !bg-red-100">
                                <AlertTriangle
                                    size={24}
                                    className="!text-red-600"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => setTorneoAEliminar(null)}
                                disabled={eliminando}
                                className="rounded-lg p-2 !text-slate-500 hover:!bg-slate-100"
                                aria-label="Cerrar"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <h2
                            id="titulo-eliminar-torneo"
                            className="mb-3 text-xl font-bold !text-slate-900"
                        >
                            ¿Eliminar torneo?
                        </h2>

                        <p className="mb-3 text-sm leading-relaxed !text-slate-600">
                            Estás por eliminar el torneo:
                        </p>

                        <p className="mb-4 rounded-lg !bg-slate-100 px-4 py-3 text-sm font-semibold !text-slate-900">
                            {torneoAEliminar.nombre}
                        </p>

                        <p className="mb-6 text-sm !text-red-600">
                            Esta acción no se puede deshacer.
                            Si el torneo tiene partidos o jugadores inscriptos,
                            el sistema impedirá su eliminación.
                        </p>

                        {/* BOTONES */}
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={() => setTorneoAEliminar(null)}
                                disabled={eliminando}
                                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold !text-slate-700 hover:!bg-slate-100 disabled:opacity-50"
                                style={{ backgroundColor: '#ffffff' }}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={eliminarTorneo}
                                disabled={eliminando}
                                style={{
                                    backgroundColor: '#dc2626',
                                    color: '#ffffff',
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Trash2 size={17} color="#ffffff" />

                                <span style={{ color: '#ffffff' }}>
                                    {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}