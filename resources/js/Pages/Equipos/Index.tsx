import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

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
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface Props {
    equipos: Paginacion<Equipo>;
    filtros: {
        buscar: string;
    };
}

export default function Index({ equipos, filtros }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');

    function aplicarBusqueda(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        router.get(
            '/equipos',
            { buscar },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }

    function limpiarBusqueda() {
        setBuscar('');

        router.get(
            '/equipos',
            {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    }

    return (
        <>
            <Head title="Equipos" />

            <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-10">
                <div className="mx-auto max-w-7xl">
                    {/* Encabezado */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                                FulbitoGest
                            </p>

                            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-800">
                                Equipos
                            </h1>

                            <p className="mt-2 text-sm text-slate-500">
                                Consultá los equipos, sus clubes y categorías.
                            </p>
                        </div>

                        <Link
                            href="/dashboard"
                            className="inline-flex w-fit items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            Volver al panel
                        </Link>
                    </div>

                    {/* Contenido */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        {/* Título y cantidad */}
                        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">
                                    Listado de equipos
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {equipos.total}{' '}
                                    {equipos.total === 1
                                        ? 'equipo registrado'
                                        : 'equipos registrados'}
                                </p>
                            </div>
                        </div>

                        {/* Buscador */}
                        <div className="border-b border-slate-200 bg-slate-50/70 p-6">
                            <form
                                onSubmit={aplicarBusqueda}
                                className="flex flex-col gap-3 sm:flex-row"
                            >
                                <div className="flex-1">
                                    <label
                                        htmlFor="buscar"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Buscar equipo
                                    </label>

                                    <input
                                        id="buscar"
                                        type="text"
                                        value={buscar}
                                        onChange={(e) =>
                                            setBuscar(e.target.value)
                                        }
                                        placeholder="Nombre del equipo, club o categoría..."
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                <div className="flex items-end gap-2">
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >
                                        Buscar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={limpiarBusqueda}
                                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                    >
                                        Limpiar
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Tabla */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">
                                            ID
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Equipo
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Club
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Categoría
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {equipos.data.length > 0 ? (
                                        equipos.data.map((equipo) => (
                                            <tr
                                                key={equipo.id}
                                                className="transition hover:bg-blue-50/50"
                                            >
                                                <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                                                    {equipo.id}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-800">
                                                    {equipo.nombre}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                                    {equipo.club?.nombre ??
                                                        'Sin club asignado'}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4">
                                                    {equipo.categoria ? (
                                                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                                            {
                                                                equipo.categoria
                                                                    .nombre
                                                            }
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">
                                                            Sin categoría
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-16 text-center"
                                            >
                                                <p className="font-medium text-slate-700">
                                                    No se encontraron equipos.
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Probá con otro nombre de
                                                    equipo, club o categoría.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {equipos.last_page > 1 && (
                            <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-500">
                                    Mostrando{' '}
                                    <span className="font-medium text-slate-700">
                                        {equipos.from ?? 0}
                                    </span>{' '}
                                    a{' '}
                                    <span className="font-medium text-slate-700">
                                        {equipos.to ?? 0}
                                    </span>{' '}
                                    de{' '}
                                    <span className="font-medium text-slate-700">
                                        {equipos.total}
                                    </span>{' '}
                                    equipos
                                </p>

                                <div className="flex flex-wrap gap-1">
                                    {equipos.links.map((link, index) => {
                                        const esAnterior =
                                            link.label.includes('Previous') ||
                                            link.label.includes('Anterior');

                                        const esSiguiente =
                                            link.label.includes('Next') ||
                                            link.label.includes('Siguiente');

                                        const etiqueta = esAnterior
                                            ? 'Anterior'
                                            : esSiguiente
                                              ? 'Siguiente'
                                              : link.label.replace(
                                                    /&laquo;|&raquo;|&amp;laquo;|&amp;raquo;/g,
                                                    ''
                                                );

                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                disabled={!link.url}
                                                onClick={() => {
                                                    if (link.url) {
                                                        router.visit(link.url, {
                                                            preserveScroll: true,
                                                            preserveState: true,
                                                        });
                                                    }
                                                }}
                                                className={`rounded-lg border px-3 py-2 text-sm transition ${
                                                    link.active
                                                        ? 'border-blue-600 bg-blue-600 font-semibold text-white'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                                } disabled:cursor-not-allowed disabled:opacity-40`}
                                            >
                                                {etiqueta}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}