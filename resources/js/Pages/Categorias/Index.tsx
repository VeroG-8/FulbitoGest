import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import {
    Layers,
    Plus,
    Search,
    Eye,
    Pencil,
    Users,
    GraduationCap,
    ShieldCheck,
    CalendarDays,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    History,
    Trash2,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatusBadge from '@/Components/Shared/StatusBadge';
import StatCard from '@/Components/Shared/StatCard';
import ConfirmDialog from '@/Components/Shared/ConfirmDialog';

interface Categoria {
    id: number;
    anio: number;
    estado: boolean;
    jugadores_activos_count: number;
    profesores_activos_count: number;
    equipos_activos_count: number;
    horarios_activos_count: number;
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
    categorias: Paginacion<Categoria>;
    filtros: {
        buscar: string;
        orden: string;
        direccion: string;
    };
    totalInactivas: number;
    puedeGestionar: boolean;
}

export default function Index({
    categorias,
    filtros,
    totalInactivas,
    puedeGestionar,
}: Props) {
    const { flash } = usePage<any>().props;

    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [categoriaADesactivar, setCategoriaADesactivar] =
        useState<Categoria | null>(null);
    const [procesando, setProcesando] = useState(false);

    // Búsqueda
    const buscarCategorias = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        router.get(
            '/categorias',
            {
                buscar,
                orden: filtros.orden,
                direccion: filtros.direccion,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // Limpiar búsqueda
    const limpiarBusqueda = () => {
        setBuscar('');

        router.get(
            '/categorias',
            {
                orden: filtros.orden,
                direccion: filtros.direccion,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // Ordenamiento
    const ordenarPor = (columna: string) => {
        const nuevaDireccion =
            filtros.orden === columna && filtros.direccion === 'asc'
                ? 'desc'
                : 'asc';

        router.get(
            '/categorias',
            {
                buscar,
                orden: columna,
                direccion: nuevaDireccion,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const iconoOrden = (columna: string) => {
        if (filtros.orden !== columna) {
            return <ArrowUpDown size={14} className="text-slate-400" />;
        }

        return filtros.direccion === 'asc' ? (
            <ArrowUp size={14} className="text-slate-900" />
        ) : (
            <ArrowDown size={14} className="text-slate-900" />
        );
    };

    // Desactivar categoría
    const desactivarCategoria = () => {
        if (!categoriaADesactivar || procesando) return;

        router.delete(`/categorias/${categoriaADesactivar.id}`, {
            preserveScroll: true,

            onStart: () => {
                setProcesando(true);
            },

            onSuccess: () => {
                setCategoriaADesactivar(null);
            },

            onFinish: () => {
                setProcesando(false);
            },
        });
    };

    return (
        <>
            <Head title="Categorías | FulbitoGest" />

            <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* ENCABEZADO */}
                    <PageHeader
                        title="Categorías"
                        description={
                            puedeGestionar
                                ? 'Administración de categorías de la escuela deportiva.'
                                : 'Consulta de las categorías deportivas disponibles.'
                        }
                        icon={<Layers className="h-7 w-7" />}
                        actions={
                            puedeGestionar ? (
                                <div className="flex flex-wrap items-center gap-2">
                                    <Link
                                        href="/categorias/historial"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-white/10"
                                    >
                                        <History size={18} />
                                        Historial
                                        </Link>

                                    <Link
                                        href="/categorias/create"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl !bg-white px-5 py-3 text-sm font-semibold !text-slate-900 transition hover:!bg-slate-100"
                                    >
                                        <Plus size={18} />
                                        Nueva categoría
                                    </Link>
                                </div>
                            ) : undefined
                        }
                    />

                    {/* MENSAJES */}
                    {flash?.success && (
                        <div
                            role="status"
                            className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm"
                        >
                            <p className="text-sm font-semibold text-emerald-800">
                                Operación exitosa
                            </p>
                            <p className="mt-1 text-sm text-emerald-700">
                                {flash.success}
                            </p>
                        </div>
                    )}

                    {flash?.error && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm"
                        >
                            <p className="text-sm font-medium text-red-700">
                                {flash.error}
                            </p>
                        </div>
                    )}

                    {/* ESTADÍSTICAS */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <StatCard
                            title="Categorías activas"
                            value={categorias.total}
                            description="Categorías actualmente disponibles"
                            icon={<Layers size={24} />}
                            color="blue"
                        />

                        <StatCard
                            title="Categorías inactivas"
                            value={totalInactivas}
                            description="Categorías en el historial"
                            icon={<History size={24} />}
                            color="amber"
                        />
                    </div>

                    {/* LISTADO */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        {/* CABECERA Y BÚSQUEDA */}
                        <div className="border-b border-slate-200 p-5 sm:p-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Listado de categorías
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Consultá los años y las personas y recursos asociados.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <form
                                        onSubmit={buscarCategorias}
                                        className="flex flex-col gap-2 sm:flex-row"
                                    >
                                        <input
                                            type="text"
                                            value={buscar}
                                            onChange={(e) =>
                                                setBuscar(e.target.value)
                                            }
                                            placeholder="Buscar por año..."
                                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-600 sm:w-52"
                                        />

                                        <button
                                            type="submit"
                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold !text-white hover:bg-slate-800"
                                        >
                                            <Search size={17} />
                                            Buscar
                                        </button>
                                    </form>

                                    {buscar && (
                                        <button
                                            type="button"
                                            onClick={limpiarBusqueda}
                                            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                                        >
                                            Limpiar
                                        </button>
                                    )}
                                </div>
                            </div>

                          
                        </div>

                        {/* TABLA */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                                    <tr>
                                        <th className="px-5 py-4">
                                            <button
                                                type="button"
                                                onClick={() => ordenarPor('anio')}
                                                className="inline-flex items-center gap-2 font-semibold transition hover:text-slate-950"
                                            >
                                                Año
                                                {iconoOrden('anio')}
                                            </button>
                                        </th>

                                        <th className="px-5 py-4">
                                            <span className="inline-flex items-center gap-2">
                                                <Users size={15} />
                                                Jugadores
                                            </span>
                                        </th>

                                        <th className="px-5 py-4">
                                            <span className="inline-flex items-center gap-2">
                                                <GraduationCap size={15} />
                                                Profesores
                                            </span>
                                        </th>

                                        <th className="px-5 py-4">
                                            <span className="inline-flex items-center gap-2">
                                                <ShieldCheck size={15} />
                                                Equipos
                                            </span>
                                        </th>

                                        <th className="px-5 py-4">
                                            <span className="inline-flex items-center gap-2">
                                                <CalendarDays size={15} />
                                                Horarios
                                            </span>
                                        </th>

                                        <th className="px-5 py-4">
                                            Estado
                                        </th>

                                        <th className="px-5 py-4 text-right">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {categorias.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-5 py-14 text-center"
                                            >
                                                <Layers
                                                    size={36}
                                                    className="mx-auto mb-3 text-slate-300"
                                                />

                                                <p className="font-semibold text-slate-600">
                                                    No se encontraron categorías.
                                                </p>

                                                <p className="mt-1 text-sm text-slate-400">
                                                    {buscar
                                                        ? 'Probá con otro año de búsqueda.'
                                                        : 'Todavía no hay categorías registradas.'}
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        categorias.data.map((categoria) => (
                                            <tr
                                                key={categoria.id}
                                                className="transition hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-base font-bold text-slate-900">
                                                        {categoria.anio}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="font-semibold text-slate-700">
                                                        {categoria.jugadores_activos_count}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="font-semibold text-slate-700">
                                                        {categoria.profesores_activos_count}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="font-semibold text-slate-700">
                                                        {categoria.equipos_activos_count}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="font-semibold text-slate-700">
                                                        {categoria.horarios_activos_count}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <StatusBadge status="activo" />
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={`/categorias/${categoria.id}`}
                                                            title="Ver categoría"
                                                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                        >
                                                            <Eye size={18} />
                                                        </Link>

                                                        {puedeGestionar && (
                                                            <>
                                                                <Link
                                                                    href={`/categorias/${categoria.id}/edit`}
                                                                    title="Editar categoría"
                                                                    className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                                >
                                                                    <Pencil size={18} />
                                                                </Link>

                                                                <button
                                                                    type="button"
                                                                    title="Desactivar categoría"
                                                                    onClick={() =>
                                                                        setCategoriaADesactivar(
                                                                            categoria,
                                                                        )
                                                                    }
                                                                    className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </>
                                                        )}
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
                                Mostrando {categorias.from ?? 0} a{' '}
                                {categorias.to ?? 0} de {categorias.total}{' '}
                                categorías
                            </p>

                            <div className="flex gap-2">
                                <Link
                                    href={categorias.prev_page_url ?? '#'}
                                    aria-disabled={!categorias.prev_page_url}
                                    className={`rounded-lg border px-4 py-2 text-sm ${
                                        categorias.prev_page_url
                                            ? 'border-slate-300 text-slate-700 hover:bg-slate-50'
                                            : 'pointer-events-none border-slate-200 text-slate-300'
                                    }`}
                                >
                                    Anterior
                                </Link>

                                <Link
                                    href={categorias.next_page_url ?? '#'}
                                    aria-disabled={!categorias.next_page_url}
                                    className={`rounded-lg border px-4 py-2 text-sm ${
                                        categorias.next_page_url
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

            {/* CONFIRMACIÓN DE DESACTIVACIÓN */}
            <ConfirmDialog
                show={!!categoriaADesactivar}
                title="¿Desactivar categoría?"
                message={`Estás por desactivar la categoría del año ${categoriaADesactivar?.anio ?? ''}. La categoría dejará de aparecer en el listado activo y pasará al historial. No se eliminarán sus registros asociados.`}
                confirmText="Sí, desactivar"
                cancelText="Cancelar"
                onConfirm={desactivarCategoria}
                onCancel={() => setCategoriaADesactivar(null)}
                processing={procesando}
                danger
            />
        </>
    );
}