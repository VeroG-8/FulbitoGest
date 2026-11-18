import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import PageHeader from '@/Components/Shared/PageHeader';
import StatCard from '@/Components/Shared/StatCard';
import StatusBadge from '@/Components/Shared/StatusBadge';
import {
    Wallet,
    Clock,
    CheckCircle,
    Users,
    Eye,
    ChevronLeft,
    ChevronRight,
    Filter,
    Search,
    X,
    UserPlus,
    Ban,
    RotateCcw,
} from 'lucide-react';

interface Cuota {
    id: number;
    nombre: string;
    monto: string;
}

interface Categoria {
    id: number;
    anio: number;
}

interface Jugador {
    id: number;
    nombre: string;
    apellido: string;
    categoria?: {
        id: number;
        anio: number;
    };
}

interface Asignacion {
    id: number;
    fecha_asignacion: string;
    fecha_vencimiento: string;
    estado: string;
    pagos_count: number;
    cuota: Cuota;
    jugador: Jugador;
}

interface Paginacion {
    data: Asignacion[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface Props {
    asignaciones: Paginacion;
    categorias: Categoria[];
    anios: number[];
    filtros: {
        categoria_id: string | null;
        buscar: string;
        anio: string | null;
    };
    estadisticas: {
        total: number;
        pendientes: number;
        pagadas: number;
        anuladas: number;
    };
}

export default function Index({
    asignaciones,
    categorias,
    anios,
    filtros,
    estadisticas,
}: Props) {
    const { url } = usePage();

    const parametrosActuales = url.includes('?')
        ? url.slice(url.indexOf('?'))
        : '';
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');

    const formatearFecha = (fecha: string) => {
        if (!fecha) return '-';

        const [anio, mes, dia] = fecha.substring(0, 10).split('-');
        return `${dia}/${mes}/${anio}`;
    };

    const formatearMonto = (monto: string) => {
        return Number(monto).toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2,
        });
    };

    // Aplicar búsqueda y categoría conjuntamente.
    const aplicarFiltros = (
        categoriaId: string,
        termino: string,
        anio: string,
    ) => {
        const parametros: Record<string, string> = {};

        if (categoriaId) {
            parametros.categoria_id = categoriaId;
        }

        if (termino.trim()) {
            parametros.buscar = termino.trim();
        }

        if (anio) {
            parametros.anio = anio;
        }

        router.get('/cuotas/asignaciones', parametros, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const cambiarCategoria = (categoriaId: string) => {
        aplicarFiltros(categoriaId, buscar, filtros.anio ?? '');
    };

    const cambiarAnio = (anio: string) => {
        aplicarFiltros(
            filtros.categoria_id ?? '',
            buscar,
            anio,
        );
    };

    const buscarJugador = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        aplicarFiltros(
            filtros.categoria_id ?? '',
            buscar,
            filtros.anio ?? '',
        );
    };

    const limpiarFiltros = () => {
        setBuscar('');

        router.get('/cuotas/asignaciones', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const anularAsignacion = (asignacion: Asignacion) => {
        const confirmar = window.confirm(
            `¿Estás seguro de anular la asignación de ${asignacion.jugador.apellido}, ${asignacion.jugador.nombre}?\n\nEsta acción solo está permitida si no existen pagos asociados.`
        );

        if (!confirmar) return;

        router.put(
            `/cuotas/asignaciones/${asignacion.id}/anular`,
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const reactivarAsignacion = (asignacion: Asignacion) => {
        const confirmar = window.confirm(
            `¿Deseás reactivar la asignación de ${asignacion.jugador.apellido}, ${asignacion.jugador.nombre}?`
        );

        if (!confirmar) return;

        router.put(
            `/cuotas/asignaciones/${asignacion.id}/reactivar`,
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const hayFiltrosAplicados =
    Boolean(filtros.categoria_id) ||
    Boolean(filtros.buscar) ||
    Boolean(filtros.anio);

    return (
        <>
            <Head title="Asignaciones de cuotas" />

            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-7xl">

                    <PageHeader
                        title="Asignaciones de cuotas"
                        description="Administración y seguimiento de cuotas asignadas a los jugadores."
                        icon={<Wallet className="h-7 w-7" />}
                        actions={
                            <div className="flex flex-nowrap items-center gap-3 whitespace-nowrap">
                                <Link
                                    href="/cuotas/asignaciones/create"
                                    className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Asignación individual
                                </Link>

                                <Link
                                    href="/cuotas/asignaciones/masivas/crear"
                                    className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    <Users className="h-4 w-4" />
                                    Asignación masiva
                                </Link>
                            </div>
                        }
                    />

                    {/* Estadísticas */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total de asignaciones"
                            value={estadisticas.total}
                            description="Cuotas asignadas a jugadores"
                            icon={<Users className="h-6 w-6" />}
                            color="blue"
                        />

                        <StatCard
                            title="Pendientes"
                            value={estadisticas.pendientes}
                            description="Asignaciones por pagar"
                            icon={<Clock className="h-6 w-6" />}
                            color="amber"
                        />

                        <StatCard
                            title="Pagadas"
                            value={estadisticas.pagadas}
                            description="Cuotas abonadas"
                            icon={<CheckCircle className="h-6 w-6" />}
                            color="emerald"
                        />

                        <StatCard
                            title="Anuladas"
                            value={estadisticas.anuladas}
                            description="Asignaciones dadas de baja"
                            icon={<Ban className="h-6 w-6" />}
                            color="blue"
                        />
                    </div>

                    {/* Filtros */}
                    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Filter className="h-5 w-5 text-slate-500" />
                            <h2 className="font-semibold text-slate-800">
                                Filtros de búsqueda
                            </h2>
                        </div>

                       <div className="space-y-4">
                        {/* Primera fila: filtros */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Filtro por categoría */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Categoría
                                </label>

                                <select
                                    value={filtros.categoria_id ?? ''}
                                    onChange={(e) => cambiarCategoria(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">Todas las categorías</option>
                                    {categorias.map((categoria) => (
                                        <option key={categoria.id} value={categoria.id}>
                                            {categoria.anio}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filtro por año de asignación */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Año de asignación
                                </label>

                                <select
                                    value={filtros.anio ?? ''}
                                    onChange={(e) => cambiarAnio(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">Todos los años</option>
                                    {anios.map((anio) => (
                                        <option key={anio} value={anio}>
                                            {anio}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Segunda fila: buscador */}
                        <form
                            onSubmit={buscarJugador}
                            className="flex flex-col gap-3 sm:flex-row sm:items-end"
                        >
                            <div className="min-w-0 flex-1">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Buscar jugador
                                </label>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                    <input
                                        type="text"
                                        value={buscar}
                                        onChange={(e) => setBuscar(e.target.value)}
                                        placeholder="Ingresá el nombre o apellido..."
                                        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                                >
                                    <Search className="h-4 w-4" />
                                    Buscar
                                </button>

                                {hayFiltrosAplicados && (
                                    <button
                                        type="button"
                                        onClick={limpiarFiltros}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                                    >
                                        <X className="h-4 w-4" />
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                        {hayFiltrosAplicados && (
                            <p className="mt-4 text-xs text-slate-500">
                                Los resultados y las estadísticas muestran las asignaciones
                                que coinciden con los filtros aplicados.
                            </p>
                        )}
                    </div>

                    {/* Tabla */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h2 className="text-lg font-bold text-slate-800">
                                Listado de asignaciones
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Registro de cuotas correspondientes a cada jugador.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Jugador</th>
                                        <th className="px-6 py-4 font-semibold">Categoría</th>
                                        <th className="px-6 py-4 font-semibold">Cuota</th>
                                        <th className="px-6 py-4 font-semibold">Monto</th>
                                        <th className="px-6 py-4 font-semibold">Asignación</th>
                                        <th className="px-6 py-4 font-semibold">Vencimiento</th>
                                        <th className="px-6 py-4 font-semibold">Estado</th>
                                        <th className="px-6 py-4 text-right font-semibold">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {asignaciones.data.map((asignacion) => {
                                        const puedeAnular =
                                            asignacion.estado === 'pendiente' &&
                                            asignacion.pagos_count === 0;

                                        const puedeReactivar =
                                            asignacion.estado === 'anulada' &&
                                            asignacion.pagos_count === 0;

                                        return (
                                            <tr
                                                key={asignacion.id}
                                                className="transition hover:bg-slate-50"
                                            >
                                                <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-800">
                                                    {asignacion.jugador.apellido},{' '}
                                                    {asignacion.jugador.nombre}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                                    {asignacion.jugador.categoria?.anio ?? '-'}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                                    {asignacion.cuota.nombre}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700">
                                                    {formatearMonto(asignacion.cuota.monto)}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                                    {formatearFecha(asignacion.fecha_asignacion)}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                                    {formatearFecha(asignacion.fecha_vencimiento)}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <StatusBadge status={asignacion.estado} />
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex items-center justify-end gap-1">

                                                        {/* Consultar pagos */}
                                                      <Link
                                                            href={`/cuotas/asignaciones/${asignacion.id}/pagos${parametrosActuales}`}
                                                            title="Ver pagos"
                                                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            <span>Ver pagos</span>
                                                        </Link>

                                                        {/* Anular asignación */}
                                                        {puedeAnular && (
                                                            <button
                                                                type="button"
                                                                onClick={() => anularAsignacion(asignacion)}
                                                                title="Anular asignación"
                                                                className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 transition hover:bg-red-50 hover:text-red-800"
                                                            >
                                                                <Ban className="h-4 w-4" />
                                                            </button>
                                                        )}

                                                        {/* Reactivar asignación */}
                                                        {puedeReactivar && (
                                                            <button
                                                                type="button"
                                                                onClick={() => reactivarAsignacion(asignacion)}
                                                                title="Reactivar asignación"
                                                                className="inline-flex items-center justify-center rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-800"
                                                            >
                                                                <RotateCcw className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {asignaciones.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="px-6 py-12 text-center"
                                            >
                                                <Wallet className="mx-auto mb-3 h-10 w-10 text-slate-300" />

                                                <p className="font-semibold text-slate-700">
                                                    No hay asignaciones disponibles
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    No se encontraron asignaciones que coincidan
                                                    con los filtros seleccionados.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        {asignaciones.last_page > 1 && (
                            <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-slate-500">
                                    Mostrando {asignaciones.from} a {asignaciones.to} de{' '}
                                    {asignaciones.total} asignaciones
                                </p>

                                <div className="flex flex-wrap items-center gap-1">
                                    {asignaciones.links.map((link, index) => {
                                        const esAnterior =
                                            link.label.includes('Previous') ||
                                            link.label.includes('&laquo;');

                                        const esSiguiente =
                                            link.label.includes('Next') ||
                                            link.label.includes('&raquo;');

                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.get(link.url)}
                                                className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white text-slate-600 hover:bg-slate-100'
                                                } disabled:cursor-not-allowed disabled:opacity-40`}
                                            >
                                                {esAnterior ? (
                                                    <ChevronLeft className="h-4 w-4" />
                                                ) : esSiguiente ? (
                                                    <ChevronRight className="h-4 w-4" />
                                                ) : (
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-5">
                        <Link
                            href="/cuotas"
                            className="text-sm font-semibold text-slate-500 transition hover:text-blue-600"
                        >
                            ← Volver a cuotas
                        </Link>
                    </div>

                </div>
            </div>
        </>
    );
}