import { useState, type FormEvent } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    Plus,
    History,
    Search,
    Eye,
    Pencil,
    Trash2,
    MapPin,
    MapPinned,
    ChevronLeft,
    ChevronRight,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatCard from '@/Components/Shared/StatCard';
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
    orden: string;
    direccion: string;
}

interface Props {
    predios: Paginacion;
    filtros: Filtros;
    totalInactivos: number;
}

export default function Index({
    predios,
    filtros,
    totalInactivos,
}: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [orden, setOrden] = useState(filtros.orden ?? 'nombre');
    const [direccion, setDireccion] = useState(
        filtros.direccion ?? 'asc',
    );

    const [predioSeleccionado, setPredioSeleccionado] =
        useState<Predio | null>(null);

    const [procesando, setProcesando] = useState(false);

    // Aplicar búsqueda y filtros.
    const aplicarFiltros = (e?: FormEvent<HTMLFormElement>) => {
        e?.preventDefault();

        router.get(
            '/predios',
            {
                buscar,
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
            '/predios',
            {
                buscar,
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

    // Cambiar ordenamiento.
    const cambiarOrden = (campo: 'nombre' | 'localidad') => {
        const nuevaDireccion =
            orden === campo && direccion === 'asc'
                ? 'desc'
                : 'asc';

        setOrden(campo);
        setDireccion(nuevaDireccion);

        router.get(
            '/predios',
            {
                buscar,
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

    // Desactivar predio.
    const desactivarPredio = () => {
        if (!predioSeleccionado || procesando) return;

        router.delete(`/predios/${predioSeleccionado.id}`, {
            preserveScroll: true,

            onStart: () => setProcesando(true),

            onSuccess: () => setPredioSeleccionado(null),

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

    const totalCanchas = predios.data.reduce(
        (total, predio) => total + predio.canchas_count,
        0,
    );

    return (
        <>
            <Head title="Predios" />

            <div className="space-y-6">

                {/* ENCABEZADO */}
                <PageHeader
                    title="Predios"
                    description="Administrá las instalaciones deportivas de la escuela."
                    icon={<Building2 size={28} />}
                    actions={
                        <>
                            <Link
                                href="/predios/historial"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                            >
                                <History size={17} />
                                Historial
                            </Link>

                            <Link
                                href="/predios/create"
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                            >
                                <Plus size={17} />
                                Nuevo predio
                            </Link>
                        </>
                    }
                />

                {/* ESTADÍSTICAS */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <StatCard
                        title="Predios activos"
                        value={predios.total}
                        description="Total de instalaciones registradas"
                        icon={<Building2 size={23} />}
                        color="blue"
                    />

                    <StatCard
                        title="Predios inactivos"
                        value={totalInactivos}
                        description="Total de instalaciones deshabilitadas"
                        icon={<MapPinned size={23} />}
                        color="amber"
                    />
                </div>

                {/* BÚSQUEDA */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-base font-bold text-slate-800">
                            Buscar predios
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Filtrá por nombre, dirección o localidad.
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
                                placeholder="Buscar por nombre, dirección o localidad..."
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
                                setOrden('nombre');
                                setDireccion('asc');

                                router.get(
                                    '/predios',
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

                {/* TABLA DE PREDIOS */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Listado de predios
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Instalaciones deportivas activas registradas en el sistema.
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
                                        <button
                                            type="button"
                                            onClick={() => cambiarOrden('nombre')}
                                            className="inline-flex items-center gap-2 font-semibold transition hover:text-blue-600"
                                        >
                                            Predio
                                            <IconoOrden campo="nombre" />
                                        </button>
                                    </th>

                                    <th className="px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => cambiarOrden('localidad')}
                                            className="inline-flex items-center gap-2 font-semibold transition hover:text-blue-600"
                                        >
                                            Ubicación
                                            <IconoOrden campo="localidad" />
                                        </button>
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
                                                <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                                    {predio.canchas_count}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusBadge status="activo" />
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

                                                    <Link
                                                        href={`/predios/${predio.id}/edit`}
                                                        title="Editar predio"
                                                        className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                    >
                                                        <Pencil size={18} />
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        title="Desactivar predio"
                                                        onClick={() =>
                                                            setPredioSeleccionado(predio)
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
                                            colSpan={5}
                                            className="px-5 py-12 text-center"
                                        >
                                            <div className="flex flex-col items-center">
                                                <Building2
                                                    size={36}
                                                    className="mb-3 text-slate-300"
                                                />

                                                <p className="font-semibold text-slate-700">
                                                    No se encontraron predios
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Probá modificando los criterios de búsqueda.
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

            {/* CONFIRMACIÓN DE DESACTIVACIÓN */}
            <ConfirmDialog
                show={predioSeleccionado !== null}
                title="Desactivar predio"
                message={
                    predioSeleccionado
                        ? `¿Estás seguro de que querés desactivar el predio ${predioSeleccionado.nombre}? Solo será posible si no tiene canchas activas. El registro se conservará en el historial.`
                        : ''
                }
                confirmText="Sí, desactivar"
                cancelText="Cancelar"
                onConfirm={desactivarPredio}
                onCancel={() => setPredioSeleccionado(null)}
                processing={procesando}
                danger
            />
        </>
    );
}