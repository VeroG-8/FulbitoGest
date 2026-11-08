import { useState, type FormEvent } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    History,
    Search,
    Eye,
    MapPin,
    MapPinned,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatusBadge from '@/Components/Shared/StatusBadge';
import ConfirmDialog from '@/Components/Shared/ConfirmDialog';

interface Predio {
    id: number;
    nombre: string;
    direccion: string | null;
    localidad: string | null;
    descripcion: string | null;
    estado: boolean;
    canchas_count: number;
}

interface Paginacion {
    data: Predio[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

interface Filtros {
    buscar: string;
}

interface Props {
    predios: Paginacion;
    filtros: Filtros;
}

export default function Historial({ predios, filtros }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');

    const [predioSeleccionado, setPredioSeleccionado] =
        useState<Predio | null>(null);

    const [procesando, setProcesando] = useState(false);

    // Aplicar búsqueda.
    const aplicarFiltros = (e?: FormEvent<HTMLFormElement>) => {
        e?.preventDefault();

        router.get(
            '/predios/historial',
            { buscar },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // Cambiar de página conservando la búsqueda.
    const cambiarPagina = (pagina: number) => {
        router.get(
            '/predios/historial',
            {
                buscar,
                page: pagina,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Reactivar predio.
    const reactivarPredio = () => {
        if (!predioSeleccionado || procesando) return;

        router.put(
            `/predios/${predioSeleccionado.id}/reactivar`,
            {},
            {
                preserveScroll: true,

                onStart: () => setProcesando(true),

                onSuccess: () => setPredioSeleccionado(null),

                onFinish: () => setProcesando(false),
            },
        );
    };

    return (
        <>
            <Head title="Historial de predios" />

            <div className="space-y-6">

                {/* ENCABEZADO */}
                <PageHeader
                    title="Historial de predios"
                    description="Consultá las instalaciones deportivas que fueron desactivadas."
                    icon={<History size={28} />}
                    actions={
                        <Link
                            href="/predios"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                            <Building2 size={17} />
                            Predios activos
                        </Link>
                    }
                />

                {/* BÚSQUEDA */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-base font-bold text-slate-800">
                            Buscar en el historial
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Filtrá los predios por nombre o localidad.
                        </p>
                    </div>

                    <form
                        onSubmit={aplicarFiltros}
                        className="flex flex-col gap-3 sm:flex-row"
                    >
                        <div className="relative flex-1">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={buscar}
                                onChange={(e) => setBuscar(e.target.value)}
                                placeholder="Buscar por nombre o localidad..."
                                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <button
                            type="submit"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            <Search size={16} />
                            Buscar
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setBuscar('');

                                router.get(
                                    '/predios/historial',
                                    {},
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Limpiar
                        </button>
                    </form>
                </div>

                {/* TABLA DE PREDIOS INACTIVOS */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Predios desactivados
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Instalaciones deportivas que ya no se encuentran activas.
                            </p>
                        </div>

                        <span className="text-sm font-medium text-slate-500">
                            {predios.total}{' '}
                            {predios.total === 1
                                ? 'predio encontrado'
                                : 'predios encontrados'}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[750px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-5 py-4">
                                        Predio
                                    </th>

                                    <th className="px-5 py-4">
                                        Ubicación
                                    </th>

                                    <th className="px-5 py-4 text-center">
                                        Canchas
                                    </th>

                                    <th className="px-5 py-4">
                                        Estado
                                    </th>

                                    <th className="px-5 py-4 text-center">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {predios.data.length > 0 ? (
                                    predios.data.map((predio) => (
                                        <tr
                                            key={predio.id}
                                            className="transition hover:bg-slate-50/80"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-slate-800">
                                                    {predio.nombre}
                                                </div>

                                                {predio.descripcion && (
                                                    <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                                                        {predio.descripcion}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-2 text-slate-600">
                                                    <MapPin
                                                        size={16}
                                                        className="mt-0.5 shrink-0 text-slate-400"
                                                    />

                                                    <div>
                                                        <p>
                                                            {predio.direccion || 'Sin dirección'}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {predio.localidad || 'Sin localidad'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                                    {predio.canchas_count}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusBadge status="inactivo" />
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={`/predios/${predio.id}`}
                                                        title="Ver predio"
                                                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                    >
                                                        <Eye size={18} />
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        title="Reactivar predio"
                                                        onClick={() =>
                                                            setPredioSeleccionado(predio)
                                                        }
                                                        className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                                                    >
                                                        <RotateCcw size={18} />
                                                    </button>
                                                </div>
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
                                                <MapPinned
                                                    size={36}
                                                    className="mb-3 text-slate-300"
                                                />

                                                <p className="font-semibold text-slate-700">
                                                    No hay predios en el historial
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    No se encontraron predios desactivados con esos criterios.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN */}
                    {predios.total > 0 && (
                        <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Mostrando{' '}
                                <span className="font-semibold text-slate-700">
                                    {predios.from ?? 0} - {predios.to ?? 0}
                                </span>{' '}
                                de{' '}
                                <span className="font-semibold text-slate-700">
                                    {predios.total}
                                </span>{' '}
                                predios
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={predios.current_page <= 1}
                                    onClick={() =>
                                        cambiarPagina(predios.current_page - 1)
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft size={17} />
                                    Anterior
                                </button>

                                <span className="px-2 text-sm font-medium text-slate-600">
                                    Página {predios.current_page} de {predios.last_page}
                                </span>

                                <button
                                    type="button"
                                    disabled={predios.current_page >= predios.last_page}
                                    onClick={() =>
                                        cambiarPagina(predios.current_page + 1)
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Siguiente
                                    <ChevronRight size={17} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CONFIRMACIÓN DE REACTIVACIÓN */}
            <ConfirmDialog
                show={predioSeleccionado !== null}
                title="Reactivar predio"
                message={
                    predioSeleccionado
                        ? `¿Estás seguro de que querés reactivar el predio ${predioSeleccionado.nombre}? Volverá a estar disponible en el listado de predios activos.`
                        : ''
                }
                confirmText="Sí, reactivar"
                cancelText="Cancelar"
                onConfirm={reactivarPredio}
                onCancel={() => setPredioSeleccionado(null)}
                processing={procesando}
            />
        </>
    );
}