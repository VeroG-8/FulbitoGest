
import { Head, Link, router } from '@inertiajs/react';
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
} from 'lucide-react';

interface Cuota {
    id: number;
    nombre: string;
    monto: string;
}

interface Categoria {
    id: number;
    nombre: string;
}

interface Jugador {
    id: number;
    nombre: string;
    apellido: string;
    categoria?: Categoria;
}

interface Asignacion {
    id: number;
    fecha_asignacion: string;
    fecha_vencimiento: string;
    estado: string;
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
    filtros: {
        categoria_id: string | null;
    };
    estadisticas: {
        total: number;
        pendientes: number;
        pagadas: number;
    };
}

export default function Index({
    asignaciones,
    categorias,
    filtros,
    estadisticas,
}: Props) {
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

    const cambiarCategoria = (categoriaId: string) => {
        router.get(
            '/cuotas/asignaciones',
            categoriaId ? { categoria_id: categoriaId } : {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

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
                            <Link
                                href="/cuotas/asignaciones/masivas/crear"
                                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                + Asignación masiva
                            </Link>
                        }
                    />

                    {/* Estadísticas */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    </div>

                    {/* Filtro */}
                    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Filter className="h-5 w-5 text-slate-500" />
                                Filtrar por categoría
                            </div>

                            <select
                                value={filtros.categoria_id ?? ''}
                                onChange={(e) => cambiarCategoria(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-xs"
                            >
                                <option value="">Todas las categorías</option>

                                {categorias.map((categoria) => (
                                    <option key={categoria.id} value={categoria.id}>
                                        {categoria.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
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
                                    {asignaciones.data.map((asignacion) => (
                                        <tr
                                            key={asignacion.id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-800">
                                                {asignacion.jugador.apellido}, {asignacion.jugador.nombre}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                                {asignacion.jugador.categoria?.nombre ?? '-'}
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

                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                <Link
                                                    href={`/cuotas/asignaciones/${asignacion.id}/pagos`}
                                                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    Ver pagos
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}

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
                                                    No se encontraron cuotas asignadas para esta categoría.
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
                                    Mostrando {asignaciones.from} a {asignaciones.to} de {asignaciones.total} asignaciones
                                </p>

                                <div className="flex flex-wrap items-center gap-1">
                                    {asignaciones.links.map((link, index) => {
                                        const esAnterior = link.label.includes('Previous') || link.label.includes('&laquo;');
                                        const esSiguiente = link.label.includes('Next') || link.label.includes('&raquo;');

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
                                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
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
