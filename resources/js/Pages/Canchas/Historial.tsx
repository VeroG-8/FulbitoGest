import { useState, type FormEvent } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Goal,
    ArrowLeft,
    Search,
    Eye,
    RotateCcw,
    MapPin,
    ChevronLeft,
    ChevronRight,
    History,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatusBadge from '@/Components/Shared/StatusBadge';
import ConfirmDialog from '@/Components/Shared/ConfirmDialog';

interface Predio {
    id: number;
    nombre: string;
}

interface Cancha {
    id: number;
    nombre: string;
    descripcion: string | null;
    estado: boolean;
    horarios_count: number;
    predio: Predio | null;
}

interface Paginacion {
    data: Cancha[];
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
    canchas: Paginacion;
    filtros: Filtros;
}

export default function Historial({ canchas, filtros }: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');

    const [canchaSeleccionada, setCanchaSeleccionada] =
        useState<Cancha | null>(null);

    const [procesando, setProcesando] = useState(false);

    // Aplicar búsqueda.
    const aplicarBusqueda = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        router.get(
            '/canchas/historial',
            { buscar },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // Limpiar búsqueda.
    const limpiarBusqueda = () => {
        setBuscar('');

        router.get(
            '/canchas/historial',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // Cambiar página.
    const cambiarPagina = (pagina: number) => {
        router.get(
            '/canchas/historial',
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

    // Reactivar cancha.
    const reactivarCancha = () => {
        if (!canchaSeleccionada || procesando) return;

        router.put(
            `/canchas/${canchaSeleccionada.id}/reactivar`,
            {},
            {
                preserveScroll: true,

                onStart: () => setProcesando(true),

                onSuccess: () => setCanchaSeleccionada(null),

                onFinish: () => setProcesando(false),
            },
        );
    };

    return (
        <>
            <Head title="Historial de canchas" />

            <div className="space-y-6">
                {/* ENCABEZADO */}
                <PageHeader
                    title="Historial de canchas"
                    description="Consultá las canchas que fueron desactivadas y administrá su reactivación."
                    icon={<History size={28} />}
                    actions={
                        <Link
                            href="/canchas"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                            <ArrowLeft size={17} />
                            Volver a canchas
                        </Link>
                    }
                />

                {/* BÚSQUEDA */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <form
                        onSubmit={aplicarBusqueda}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center"
                    >
                        <div className="relative min-w-0 flex-1">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={buscar}
                                onChange={(e) => setBuscar(e.target.value)}
                                placeholder="Buscar cancha o predio..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                <Search size={16} />
                                Buscar
                            </button>

                            <button
                                type="button"
                                onClick={limpiarBusqueda}
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                                Limpiar
                            </button>
                        </div>
                    </form>
                </div>

                {/* TABLA */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Canchas inactivas
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Registros conservados en el historial del sistema.
                            </p>
                        </div>

                        <span className="text-sm font-medium text-slate-500">
                            {canchas.total}{' '}
                            {canchas.total === 1
                                ? 'cancha encontrada'
                                : 'canchas encontradas'}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[750px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-5 py-4">Cancha</th>
                                    <th className="px-5 py-4">Predio</th>
                                    <th className="px-5 py-4 text-center">
                                        Horarios
                                    </th>
                                    <th className="px-5 py-4">Estado</th>
                                    <th className="px-5 py-4 text-center">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {canchas.data.length > 0 ? (
                                    canchas.data.map((cancha) => (
                                        <tr
                                            key={cancha.id}
                                            className="transition hover:bg-slate-50/80"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-slate-800">
                                                    {cancha.nombre}
                                                </div>

                                                {cancha.descripcion && (
                                                    <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                                                        {cancha.descripcion}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <MapPin
                                                        size={16}
                                                        className="shrink-0 text-slate-400"
                                                    />

                                                    <span>
                                                        {cancha.predio?.nombre ??
                                                            'Predio no disponible'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                                    {cancha.horarios_count}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusBadge status="inactivo" />
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={`/canchas/${cancha.id}`}
                                                        title="Ver cancha"
                                                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                    >
                                                        <Eye size={18} />
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        title="Reactivar cancha"
                                                        onClick={() =>
                                                            setCanchaSeleccionada(
                                                                cancha,
                                                            )
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
                                                <Goal
                                                    size={36}
                                                    className="mb-3 text-slate-300"
                                                />

                                                <p className="font-semibold text-slate-700">
                                                    No hay canchas inactivas
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    No se encontraron registros con esos criterios de búsqueda.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINACIÓN */}
                    {canchas.total > 0 && (
                        <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Mostrando{' '}
                                <span className="font-semibold text-slate-700">
                                    {canchas.from ?? 0} - {canchas.to ?? 0}
                                </span>{' '}
                                de{' '}
                                <span className="font-semibold text-slate-700">
                                    {canchas.total}
                                </span>{' '}
                                canchas
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={canchas.current_page <= 1}
                                    onClick={() =>
                                        cambiarPagina(
                                            canchas.current_page - 1,
                                        )
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft size={17} />
                                    Anterior
                                </button>

                                <span className="px-2 text-sm font-medium text-slate-600">
                                    Página {canchas.current_page} de{' '}
                                    {canchas.last_page}
                                </span>

                                <button
                                    type="button"
                                    disabled={
                                        canchas.current_page >=
                                        canchas.last_page
                                    }
                                    onClick={() =>
                                        cambiarPagina(
                                            canchas.current_page + 1,
                                        )
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
                show={canchaSeleccionada !== null}
                title="Reactivar cancha"
                message={
                    canchaSeleccionada
                        ? `¿Estás seguro de que querés reactivar la cancha ${canchaSeleccionada.nombre}? Volverá a estar disponible en el listado de canchas.`
                        : ''
                }
                confirmText="Sí, reactivar"
                cancelText="Cancelar"
                onConfirm={reactivarCancha}
                onCancel={() => setCanchaSeleccionada(null)}
                processing={procesando}
            />
        </>
    );
}