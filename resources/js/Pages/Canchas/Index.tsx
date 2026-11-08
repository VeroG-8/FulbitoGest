import { useState, type FormEvent } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Goal,
    Plus,
    History,
    Search,
    Eye,
    Pencil,
    Trash2,
    MapPin,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    X,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatCard from '@/Components/Shared/StatCard';
import StatusBadge from '@/Components/Shared/StatusBadge';
import ConfirmDialog from '@/Components/Shared/ConfirmDialog';

interface Predio {
    id: number;
    nombre: string;
}

interface Cancha {
    id: number;
    predio_id: number;
    nombre: string;
    descripcion: string | null;
    estado: boolean;
    horarios_count: number;
    created_at: string;
    predio: Predio;
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
    predio_ids: (number | string)[];
    orden: string;
    direccion: string;
}

interface Props {
    canchas: Paginacion;
    predios: Predio[];
    filtros: Filtros;
    totalInactivas: number;
}

export default function Index({
    canchas,
    predios,
    filtros,
    totalInactivas,
}: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');

    const [prediosSeleccionados, setPrediosSeleccionados] = useState<number[]>(
        Array.isArray(filtros.predio_ids)
            ? filtros.predio_ids.map(Number)
            : [],
    );

    const [orden, setOrden] = useState(filtros.orden ?? 'nombre');

    const [direccion, setDireccion] = useState(
        filtros.direccion ?? 'asc',
    );

    const [filtroAbierto, setFiltroAbierto] = useState(false);

    const [canchaSeleccionada, setCanchaSeleccionada] =
        useState<Cancha | null>(null);

    const [procesando, setProcesando] = useState(false);

    // Seleccionar o deseleccionar un predio.
    const cambiarPredio = (id: number) => {
        setPrediosSeleccionados((actuales) =>
            actuales.includes(id)
                ? actuales.filter((item) => item !== id)
                : [...actuales, id],
        );
    };

    // Aplicar búsqueda y filtros.
    const aplicarFiltros = (e?: FormEvent<HTMLFormElement>) => {
        e?.preventDefault();

        router.get(
            '/canchas',
            {
                buscar,
                predio_ids: prediosSeleccionados,
                orden,
                direccion,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // Cambiar de página conservando los filtros.
    const cambiarPagina = (pagina: number) => {
        router.get(
            '/canchas',
            {
                buscar,
                predio_ids: prediosSeleccionados,
                orden,
                direccion,
                page: pagina,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Cambiar ordenamiento conservando los filtros.
    const cambiarOrden = (campo: 'nombre' | 'created_at') => {
        const nuevaDireccion =
            orden === campo && direccion === 'asc'
                ? 'desc'
                : 'asc';

        setOrden(campo);
        setDireccion(nuevaDireccion);

        router.get(
            '/canchas',
            {
                buscar,
                predio_ids: prediosSeleccionados,
                orden: campo,
                direccion: nuevaDireccion,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // Limpiar todos los filtros.
    const limpiarFiltros = () => {
        setBuscar('');
        setPrediosSeleccionados([]);
        setOrden('nombre');
        setDireccion('asc');
        setFiltroAbierto(false);

        router.get(
            '/canchas',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // Desactivar cancha.
    const desactivarCancha = () => {
        if (!canchaSeleccionada || procesando) return;

        router.delete(`/canchas/${canchaSeleccionada.id}`, {
            preserveScroll: true,

            onStart: () => setProcesando(true),

            onSuccess: () => setCanchaSeleccionada(null),

            onFinish: () => setProcesando(false),
        });
    };

    // Indicador de ordenamiento.
    const IconoOrden = ({ campo }: { campo: string }) => {
        if (orden !== campo) {
            return (
                <ArrowUpDown
                    size={15}
                    className="text-slate-400"
                />
            );
        }

        return direccion === 'asc' ? (
            <ArrowUp size={15} className="text-blue-600" />
        ) : (
            <ArrowDown size={15} className="text-blue-600" />
        );
    };

    return (
        <>
            <Head title="Canchas" />

            <div className="space-y-6">
                {/* ENCABEZADO */}
                <PageHeader
                    title="Canchas"
                    description="Administrá las canchas de las instalaciones deportivas de la escuela."
                    icon={<Goal size={28} />}
                    actions={
                        <>
                            <Link
                                href="/canchas/historial"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                            >
                                <History size={17} />
                                Historial
                            </Link>

                            <Link
                                href="/canchas/create"
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                            >
                                <Plus size={17} />
                                Nueva cancha
                            </Link>
                        </>
                    }
                />

                {/* ESTADÍSTICAS */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <StatCard
                        title="Canchas activas"
                        value={canchas.total}
                        description="Total de canchas disponibles"
                        icon={<Goal size={23} />}
                        color="blue"
                    />

                    <StatCard
                        title="Canchas inactivas"
                        value={totalInactivas}
                        description="Total de canchas deshabilitadas"
                        icon={<History size={23} />}
                        color="amber"
                    />
                </div>

                {/* BÚSQUEDA Y FILTROS */}
<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <form onSubmit={aplicarFiltros}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

            {/* BUSCAR POR NOMBRE */}
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

            {/* SELECTOR DE PREDIOS */}
            <div className="relative w-full sm:w-48 sm:shrink-0">
                <button
                    type="button"
                    onClick={() => setFiltroAbierto(!filtroAbierto)}
                    className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm transition hover:border-blue-400"
                >
                    <span className="flex min-w-0 items-center gap-2">
                        <MapPin size={16} className="shrink-0 text-slate-500" />

                        <span className="truncate text-slate-700">
                            {prediosSeleccionados.length === 0
                                ? 'Todos los predios'
                                : `Predios (${prediosSeleccionados.length})`}
                        </span>
                    </span>

                    <ChevronDown
                        size={16}
                        className={`shrink-0 text-slate-400 transition-transform ${
                            filtroAbierto ? 'rotate-180' : ''
                        }`}
                    />
                </button>

                {/* OPCIONES DEL SELECTOR */}
                {filtroAbierto && (
                    <div className="absolute left-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700">
                                Seleccionar predios
                            </span>

                            <button
                                type="button"
                                onClick={() => setPrediosSeleccionados([])}
                                className="text-xs font-medium text-blue-600 hover:text-blue-800"
                            >
                                Limpiar
                            </button>
                        </div>

                        <div className="grid max-h-36 grid-cols-2 gap-1 overflow-y-auto">
                            {predios.map((predio) => {
                                const seleccionado =
                                    prediosSeleccionados.includes(predio.id);

                                return (
                                    <label
                                        key={predio.id}
                                        className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs transition ${
                                            seleccionado
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={seleccionado}
                                            onChange={() =>
                                                cambiarPredio(predio.id)
                                            }
                                            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />

                                        <span className="truncate">
                                            {predio.nombre}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={() => setFiltroAbierto(false)}
                            className="mt-2 w-full rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
                        >
                            Cerrar
                        </button>
                    </div>
                )}
            </div>

            {/* BOTONES */}
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
                    onClick={limpiarFiltros}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                    Limpiar
                </button>
            </div>
        </div>
    </form>
</div>

                {/* TABLA DE CANCHAS */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Listado de canchas
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Canchas activas registradas en las instalaciones
                                deportivas.
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
                        <table className="w-full min-w-[800px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                cambiarOrden('nombre')
                                            }
                                            className="inline-flex items-center gap-2 font-semibold transition hover:text-blue-600"
                                        >
                                            Cancha
                                            <IconoOrden campo="nombre" />
                                        </button>
                                    </th>

                                    <th className="px-5 py-4">
                                        Predio
                                    </th>

                                    <th className="px-5 py-4 text-center">
                                        Horarios
                                    </th>

                                    <th className="px-5 py-4">
                                        Estado
                                    </th>

                                    <th className="px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                cambiarOrden('created_at')
                                            }
                                            className="inline-flex items-center gap-2 font-semibold transition hover:text-blue-600"
                                        >
                                            Fecha de registro
                                            <IconoOrden campo="created_at" />
                                        </button>
                                    </th>

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
                                                        {cancha.predio?.nombre ||
                                                            'Sin predio'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                                    {cancha.horarios_count}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusBadge status="activo" />
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {cancha.created_at
                                                    ? new Date(
                                                          cancha.created_at,
                                                      ).toLocaleDateString(
                                                          'es-AR',
                                                      )
                                                    : '-'}
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

                                                    <Link
                                                        href={`/canchas/${cancha.id}/edit`}
                                                        title="Editar cancha"
                                                        className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                    >
                                                        <Pencil size={18} />
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        title="Desactivar cancha"
                                                        onClick={() =>
                                                            setCanchaSeleccionada(
                                                                cancha,
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-12 text-center"
                                        >
                                            <div className="flex flex-col items-center">
                                                <Goal
                                                    size={36}
                                                    className="mb-3 text-slate-300"
                                                />

                                                <p className="font-semibold text-slate-700">
                                                    No se encontraron canchas
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Probá modificando los
                                                    criterios de búsqueda.
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

            {/* CONFIRMACIÓN DE DESACTIVACIÓN */}
            <ConfirmDialog
                show={canchaSeleccionada !== null}
                title="Desactivar cancha"
                message={
                    canchaSeleccionada
                        ? `¿Estás seguro de que querés desactivar la cancha ${canchaSeleccionada.nombre}? No será posible desactivarla si tiene horarios asociados. El registro se conservará en el historial.`
                        : ''
                }
                confirmText="Sí, desactivar"
                cancelText="Cancelar"
                onConfirm={desactivarCancha}
                onCancel={() => setCanchaSeleccionada(null)}
                processing={procesando}
                danger
            />
        </>
    );
}

// Ícono de selección.
function CheckIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m5 12 4 4L19 6" />
        </svg>
    );
}