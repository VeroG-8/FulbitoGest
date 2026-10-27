import { Head, Link, router,usePage } from '@inertiajs/react';
import {
    Plus,
    Pencil,
    Eye,
    ShieldCheck,
    Search,
    Trash2,
    Users,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Club {
    id: number;
    nombre: string;
}

interface Categoria {
    id: number;
    nombre: string;
}

interface Equipo {
    id: number;
    nombre: string;
    estado: boolean;
    club: Club | null;
    categoria: Categoria | null;
}

interface Paginacion<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Props {
    equipos: Paginacion<Equipo>;
    filtros: {
        buscar: string;
    };
}

export default function Index({ equipos, filtros }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const { flash } = usePage<{
        flash: {
            success?: string;
            error?: string;
        };
    }>().props;

    const aplicarBusqueda = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        router.get(
            '/equipos',
            { buscar },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const eliminarEquipo = (equipo: Equipo) => {
        if (
            confirm(
                `¿Estás segura de que querés eliminar el equipo "${equipo.nombre}"?`,
            )
        ) {
            router.delete(`/equipos/${equipo.id}`);
        }
    };

    return (
        <>
            <Head title="Equipos" />

            <div className="min-h-screen bg-slate-50 p-6 md:p-10">
                <div className="mx-auto max-w-7xl">
                {/* Notificación de éxito */}
                {flash?.success && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800 shadow-sm">
                        <CheckCircle2 size={22} className="shrink-0" />

                        <p className="text-sm font-medium">
                            {flash.success}
                        </p>
                    </div>
                )}

                {/* Notificación de error */}
                {flash?.error && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-800 shadow-sm">
                        <AlertCircle size={22} className="shrink-0" />

                        <p className="text-sm font-medium">
                            {flash.error}
                        </p>
                    </div>
                )}
                    {/* Encabezado */}
                    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                                Equipos
                            </h1>

                            <p className="mt-2 text-sm text-slate-500">
                                Administrá los equipos registrados en
                                FulbitoGest.
                            </p>
                        </div>

                        <Link
                            href="/equipos/create"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            <Plus size={18} />
                            Registrar equipo
                        </Link>
                    </div>

                    {/* Resumen */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">
                                        Equipos encontrados
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-slate-800">
                                        {equipos.total}
                                    </p>
                                </div>

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                                    <ShieldCheck
                                        size={25}
                                        className="text-blue-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buscador */}
                    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <form
                            onSubmit={aplicarBusqueda}
                            className="flex flex-col gap-3 sm:flex-row"
                        >
                            <div className="relative flex-1">
                                <Search
                                    size={18}
                                    className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    value={buscar}
                                    onChange={(e) =>
                                        setBuscar(e.target.value)
                                    }
                                    placeholder="Buscar por equipo, club o categoría..."
                                    className="w-full rounded-lg border border-slate-300 py-3 pr-4 pl-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                <Search size={17} />
                                Buscar
                            </button>

                            {buscar !== '' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setBuscar('');
                                        router.get('/equipos');
                                    }}
                                    className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                    Limpiar
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Tabla */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h2 className="font-semibold text-slate-800">
                                Listado de equipos
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Consultá y administrá los equipos de cada club
                                y categoría.
                            </p>
                        </div>

                        {equipos.data.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                                    <Users
                                        size={25}
                                        className="text-slate-500"
                                    />
                                </div>

                                <h3 className="font-semibold text-slate-800">
                                    No se encontraron equipos
                                </h3>

                                <p className="mt-2 text-sm text-slate-500">
                                    Registrá un equipo o modificá los criterios
                                    de búsqueda.
                                </p>

                                <Link
                                    href="/equipos/create"
                                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    <Plus size={16} />
                                    Registrar equipo
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-6 py-4">
                                                Equipo
                                            </th>

                                            <th className="px-6 py-4">
                                                Club
                                            </th>

                                            <th className="px-6 py-4">
                                                Categoría
                                            </th>

                                            <th className="px-6 py-4">
                                                Estado
                                            </th>

                                            <th className="px-6 py-4 text-right">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {equipos.data.map((equipo) => (
                                            <tr
                                                key={equipo.id}
                                                className="transition hover:bg-slate-50"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-slate-800">
                                                        {equipo.nombre}
                                                    </div>

                                                    <div className="mt-1 text-xs text-slate-400">
                                                        ID: {equipo.id}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-slate-600">
                                                    {equipo.club?.nombre ??
                                                        'Sin club asignado'}
                                                </td>

                                                <td className="px-6 py-4 text-slate-600">
                                                    {equipo.categoria?.nombre ??
                                                        'Sin categoría'}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                            equipo.estado
                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                : 'bg-red-50 text-red-700'
                                                        }`}
                                                    >
                                                        {equipo.estado
                                                            ? 'Activo'
                                                            : 'Inactivo'}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={`/equipos/${equipo.id}`}
                                                            title="Ver equipo"
                                                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                                                        >
                                                            <Eye size={17} />
                                                        </Link>

                                                        <Link
                                                            href={`/equipos/${equipo.id}/edit`}
                                                            title="Editar equipo"
                                                            className="rounded-lg border border-slate-200 p-2 text-blue-600 transition hover:bg-blue-50"
                                                        >
                                                            <Pencil size={17} />
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                eliminarEquipo(
                                                                    equipo,
                                                                )
                                                            }
                                                            title="Eliminar equipo"
                                                            className="rounded-lg border border-slate-200 p-2 text-red-600 transition hover:bg-red-50"
                                                        >
                                                            <Trash2 size={17} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Paginación */}
                        {equipos.last_page > 1 && (
                            <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-500">
                                    Mostrando {equipos.from ?? 0} a{' '}
                                    {equipos.to ?? 0} de {equipos.total}{' '}
                                    equipos
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={!equipos.prev_page_url}
                                        onClick={() =>
                                            equipos.prev_page_url &&
                                            router.visit(
                                                equipos.prev_page_url,
                                            )
                                        }
                                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Anterior
                                    </button>

                                    <span className="px-2 text-sm text-slate-600">
                                        Página {equipos.current_page} de{' '}
                                        {equipos.last_page}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={!equipos.next_page_url}
                                        onClick={() =>
                                            equipos.next_page_url &&
                                            router.visit(
                                                equipos.next_page_url,
                                            )
                                        }
                                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <p className="mt-4 text-xs text-slate-400">
                        Se muestran los equipos registrados en FulbitoGest.
                    </p>
                </div>
            </div>
        </>
    );
}