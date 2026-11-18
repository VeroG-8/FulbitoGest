import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import PageHeader from '@/Components/Shared/PageHeader';
import StatCard from '@/Components/Shared/StatCard';
import {
    CalendarDays,
    Users,
    CheckCircle2,
    Clock,
    CircleDollarSign,
    Filter,
    ChevronLeft,
    ChevronRight,
    Wallet,
} from 'lucide-react';

interface Mes {
    estado: 'sin_asignacion' | 'pendiente' | 'parcial' | 'abonado';
    monto: number;
    pagado: number;
    credito_aplicado: number;
    saldo: number;
}

interface Jugador {
    id: number;
    apellido: string;
    nombre: string;
    categoria: number | null;
    meses: Record<number, Mes>;
}

interface Categoria {
    id: number;
    anio: number;
}

interface LinkPaginacion {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginacion {
    data: Jugador[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: LinkPaginacion[];
}

interface Props {
    jugadores: Paginacion;
    categorias: Categoria[];
    filtros: {
        anio: number;
        categoria_id: string | null;
    };
}

const nombresMeses = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

const estadoConfig = {
    abonado: {
        etiqueta: 'Abonado',
        color: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        punto: 'bg-emerald-500',
    },
    parcial: {
        etiqueta: 'Parcial',
        color: 'border-amber-200 bg-amber-50 text-amber-700',
        punto: 'bg-amber-500',
    },
    pendiente: {
        etiqueta: 'Pendiente',
        color: 'border-red-200 bg-red-50 text-red-700',
        punto: 'bg-red-500',
    },
    sin_asignacion: {
        etiqueta: 'Sin asignar',
        color: 'border-slate-200 bg-slate-50 text-slate-500',
        punto: 'bg-slate-300',
    },
};

export default function Index({
    jugadores,
    categorias,
    filtros,
}: Props) {
    const [anio, setAnio] = useState(filtros.anio);
    const [categoriaId, setCategoriaId] = useState(
        filtros.categoria_id ?? '',
    );

    const jugadoresPagina = jugadores.data;

    const formatearMonto = (monto: number) =>
        monto.toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0,
        });

    const aplicarFiltros = () => {
        router.get(
            '/cuotas/seguimiento',
            {
                anio,
                categoria_id: categoriaId || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const limpiarFiltros = () => {
        const anioActual = new Date().getFullYear();

        setAnio(anioActual);
        setCategoriaId('');

        router.get(
            '/cuotas/seguimiento',
            { anio: anioActual },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const cambiarPagina = (url: string | null) => {
        if (!url) return;

        router.get(url, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Resumen correspondiente a los jugadores de la página actual.
    const resumen = jugadoresPagina.reduce(
        (acumulado, jugador) => {
            Object.values(jugador.meses).forEach((mes) => {
                if (mes.estado !== 'sin_asignacion') {
                    acumulado.asignaciones++;
                    acumulado.recaudado += mes.pagado;
                    acumulado.credito += mes.credito_aplicado;
                    acumulado.deuda += mes.saldo;
                }

                if (mes.estado === 'abonado') acumulado.abonados++;
                if (mes.estado === 'parcial') acumulado.parciales++;
                if (mes.estado === 'pendiente') acumulado.pendientes++;
            });

            return acumulado;
        },
        {
            asignaciones: 0,
            abonados: 0,
            parciales: 0,
            pendientes: 0,
            recaudado: 0,
            credito: 0,
            deuda: 0,
        },
    );

    const hayFiltrosAplicados =
        Boolean(filtros.categoria_id) ||
        filtros.anio !== new Date().getFullYear();

    return (
        <>
            <Head title="Seguimiento de cuotas" />

            <div className="space-y-6">

                {/* ENCABEZADO */}
                <PageHeader
                    title="Seguimiento de cuotas"
                    description="Control mensual de asignaciones, pagos y saldos de los jugadores."
                    icon={<CalendarDays className="h-6 w-6" />}
                    actions={
                        <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-white">
                            <CalendarDays className="h-4 w-4 text-blue-300" />
                            <div>
                                <p className="text-xs text-slate-400">
                                    Período seleccionado
                                </p>
                                <p className="font-semibold">
                                    Año {filtros.anio}
                                </p>
                            </div>
                        </div>
                    }
                />

                {/* FILTROS */}
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5 flex items-center gap-2">
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                            <Filter className="h-5 w-5" />
                        </div>

                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Filtros de búsqueda
                            </h2>
                            <p className="text-sm text-slate-500">
                                Seleccioná el período y la categoría que querés consultar.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Año
                            </label>

                            <select
                                value={anio}
                                onChange={(e) => setAnio(Number(e.target.value))}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                {Array.from(
                                    { length: 7 },
                                    (_, i) => new Date().getFullYear() - 1 + i,
                                ).map((a) => (
                                    <option key={a} value={a}>
                                        {a}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Categoría
                            </label>

                            <select
                                value={categoriaId}
                                onChange={(e) => setCategoriaId(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">Todas las categorías</option>

                                {categorias.map((categoria) => (
                                    <option
                                        key={categoria.id}
                                        value={categoria.id}
                                    >
                                        {categoria.anio}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={aplicarFiltros}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                <Filter className="h-4 w-4" />
                                Aplicar filtros
                            </button>

                            {hayFiltrosAplicados && (
                                <button
                                    type="button"
                                    onClick={limpiarFiltros}
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Limpiar
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* ESTADÍSTICAS */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Jugadores"
                        value={jugadores.total}
                        description="Total de jugadores del filtro"
                        icon={<Users className="h-6 w-6" />}
                        color="blue"
                    />

                    <StatCard
                        title="Cuotas abonadas"
                        value={resumen.abonados}
                        description="En la página actual"
                        icon={<CheckCircle2 className="h-6 w-6" />}
                        color="emerald"
                    />

                    <StatCard
                        title="Cuotas parciales"
                        value={resumen.parciales}
                        description="Con pagos pendientes"
                        icon={<Wallet className="h-6 w-6" />}
                        color="amber"
                    />

                    <StatCard
                        title="Cuotas pendientes"
                        value={resumen.pendientes}
                        description="Sin pagos registrados"
                        icon={<Clock className="h-6 w-6" />}
                        color="rose"
                    />
                </section>

                {/* LEYENDA */}
                <section className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <span className="text-sm font-semibold text-slate-700">
                        Estados:
                    </span>

                    {Object.entries(estadoConfig).map(([estado, config]) => (
                        <div key={estado} className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${config.punto}`} />
                            <span className="text-sm text-slate-600">
                                {config.etiqueta}
                            </span>
                        </div>
                    ))}
                </section>

                {/* TABLA */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Estado mensual por jugador
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Consultá el estado de las cuotas de cada mes.
                            </p>
                        </div>

                        <span className="inline-flex w-fit items-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                            {jugadores.total} jugadores
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1200px] text-sm">
                            <thead className="bg-slate-950 text-white">
                                <tr>
                                    <th className="sticky left-0 z-20 bg-slate-950 px-4 py-4 text-left font-semibold">
                                        Jugador
                                    </th>

                                    <th className="bg-slate-950 px-3 py-4 text-left font-semibold">
                                        Categoría
                                    </th>

                                    {nombresMeses.map((mes) => (
                                        <th
                                            key={mes}
                                            className="px-2 py-4 text-center font-semibold"
                                        >
                                            {mes}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {jugadoresPagina.map((jugador) => (
                                    <tr
                                        key={jugador.id}
                                        className="border-b border-slate-100 transition hover:bg-slate-50"
                                    >
                                        <td className="sticky left-0 z-10 whitespace-nowrap bg-white px-4 py-3 font-semibold text-slate-800">
                                            {jugador.apellido}, {jugador.nombre}
                                        </td>

                                        <td className="px-3 py-3 text-slate-600">
                                            {jugador.categoria ?? '-'}
                                        </td>

                                        {nombresMeses.map((_, indice) => {
                                            const numeroMes = indice + 1;
                                            const mes = jugador.meses[numeroMes];
                                            const config = estadoConfig[mes.estado];

                                            return (
                                                <td
                                                    key={numeroMes}
                                                    className="px-2 py-3 text-center"
                                                >
                                                    <div
                                                        title={[
                                                            config.etiqueta,
                                                            `Monto: ${formatearMonto(mes.monto)}`,
                                                            `Pagado: ${formatearMonto(mes.pagado)}`,
                                                            `Crédito aplicado: ${formatearMonto(mes.credito_aplicado)}`,
                                                            `Saldo: ${formatearMonto(mes.saldo)}`,
                                                        ].join(' | ')}
                                                        className={`mx-auto flex w-[82px] flex-col items-center rounded-lg border px-1 py-2 ${config.color}`}
                                                    >
                                                        <span className="text-xs font-semibold">
                                                            {mes.estado === 'sin_asignacion'
                                                                ? '—'
                                                                : config.etiqueta}
                                                        </span>

                                                        {mes.estado !== 'sin_asignacion' && (
                                                            <span className="mt-1 text-[10px] font-medium">
                                                                {formatearMonto(mes.saldo)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* SIN RESULTADOS */}
                    {jugadoresPagina.length === 0 && (
                        <div className="px-5 py-14 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <Users className="h-7 w-7" />
                            </div>

                            <h3 className="font-semibold text-slate-800">
                                No hay jugadores para mostrar
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                No se encontraron jugadores con los filtros seleccionados.
                            </p>
                        </div>
                    )}

                    {/* PAGINACIÓN */}
                    {jugadores.total > 0 && (
                        <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-600">
                                Mostrando{' '}
                                <span className="font-semibold text-slate-900">
                                    {jugadores.from ?? 0}
                                </span>
                                {' '}a{' '}
                                <span className="font-semibold text-slate-900">
                                    {jugadores.to ?? 0}
                                </span>
                                {' '}de{' '}
                                <span className="font-semibold text-slate-900">
                                    {jugadores.total}
                                </span>
                                {' '}jugadores
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-1">
                                {jugadores.links.map((link, indice) => {
                                    const esAnterior = indice === 0;
                                    const esSiguiente =
                                        indice === jugadores.links.length - 1;

                                    return (
                                        <button
                                            key={indice}
                                            type="button"
                                            disabled={!link.url}
                                            onClick={() => cambiarPagina(link.url)}
                                            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition ${
                                                link.active
                                                    ? 'bg-slate-900 text-white'
                                                    : !link.url
                                                        ? 'cursor-not-allowed text-slate-300'
                                                        : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            {esAnterior ? (
                                                <ChevronLeft className="h-4 w-4" />
                                            ) : esSiguiente ? (
                                                <ChevronRight className="h-4 w-4" />
                                            ) : (
                                                link.label
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </section>

                {/* RESUMEN FINANCIERO */}
                <section>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Resumen financiero
                        </h2>
                        <p className="text-sm text-slate-500">
                            Importes correspondientes a los jugadores de esta página.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                            <div className="flex items-center gap-2 text-emerald-700">
                                <CircleDollarSign className="h-5 w-5" />
                                <p className="text-sm font-semibold">
                                    Total recaudado
                                </p>
                            </div>

                            <p className="mt-3 text-2xl font-bold text-emerald-800">
                                {formatearMonto(resumen.recaudado)}
                            </p>
                        </div>

                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                            <div className="flex items-center gap-2 text-blue-700">
                                <Wallet className="h-5 w-5" />
                                <p className="text-sm font-semibold">
                                    Créditos aplicados
                                </p>
                            </div>

                            <p className="mt-3 text-2xl font-bold text-blue-800">
                                {formatearMonto(resumen.credito)}
                            </p>
                        </div>

                        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                            <div className="flex items-center gap-2 text-red-700">
                                <Clock className="h-5 w-5" />
                                <p className="text-sm font-semibold">
                                    Saldo pendiente
                                </p>
                            </div>

                            <p className="mt-3 text-2xl font-bold text-red-800">
                                {formatearMonto(resumen.deuda)}
                            </p>
                        </div>
                    </div>
                </section>

            </div>
        </>
    );
}