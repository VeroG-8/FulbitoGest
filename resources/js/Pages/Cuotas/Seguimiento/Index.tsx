import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    CalendarDays,
    Users,
    CheckCircle2,
    Clock,
    CircleDollarSign,
    Filter,
} from 'lucide-react';

interface Mes {
    estado: 'sin_asignacion' | 'pendiente' | 'parcial' | 'abonado';
    monto: number;
    pagado: number;
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

interface Props {
    jugadores: Jugador[];
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
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        punto: 'bg-emerald-500',
    },
    parcial: {
        etiqueta: 'Parcial',
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        punto: 'bg-amber-500',
    },
    pendiente: {
        etiqueta: 'Pendiente',
        color: 'bg-red-100 text-red-700 border-red-200',
        punto: 'bg-red-500',
    },
    sin_asignacion: {
        etiqueta: 'Sin asignar',
        color: 'bg-slate-100 text-slate-500 border-slate-200',
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

    // Resumen general de los meses asignados.
    const resumen = jugadores.reduce(
        (acumulado, jugador) => {
            Object.values(jugador.meses).forEach((mes) => {
                if (mes.estado !== 'sin_asignacion') {
                    acumulado.asignaciones++;
                    acumulado.recaudado += mes.pagado;
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
            deuda: 0,
        },
    );

    return (
        <>
            <Head title="Seguimiento mensual de cuotas" />

            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-[1600px] space-y-6">

                    {/* ENCABEZADO */}
                    <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-lg">
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                            <div>
                                <div className="mb-2 flex items-center gap-2 text-blue-300">
                                    <CalendarDays size={20} />
                                    <span className="text-sm font-semibold uppercase tracking-wider">
                                        Administración
                                    </span>
                                </div>

                                <h1 className="text-3xl font-bold">
                                    Seguimiento de cuotas
                                </h1>

                                <p className="mt-2 text-sm text-slate-300">
                                    Control mensual de pagos de los jugadores.
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3">
                                <p className="text-xs text-slate-400">
                                    Período seleccionado
                                </p>
                                <p className="text-2xl font-bold">
                                    Año {anio}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* FILTROS */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Filter size={18} className="text-blue-600" />
                            <h2 className="font-semibold text-slate-800">
                                Filtros de búsqueda
                            </h2>
                        </div>

                        <div className="flex flex-col gap-4 md:flex-row md:items-end">
                            <div className="flex-1">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Año
                                </label>

                                <select
                                    value={anio}
                                    onChange={(e) => setAnio(Number(e.target.value))}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

                            <div className="flex-1">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Categoría
                                </label>

                                <select
                                    value={categoriaId}
                                    onChange={(e) => setCategoriaId(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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

                            <button
                                type="button"
                                onClick={aplicarFiltros}
                                className="rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white transition hover:bg-blue-700"
                            >
                                Aplicar filtros
                            </button>
                        </div>
                    </div>

                    {/* ESTADÍSTICAS */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            titulo="Jugadores"
                            valor={jugadores.length.toString()}
                            icono={<Users size={22} />}
                            color="blue"
                        />

                        <StatCard
                            titulo="Cuotas abonadas"
                            valor={resumen.abonados.toString()}
                            icono={<CheckCircle2 size={22} />}
                            color="emerald"
                        />

                        <StatCard
                            titulo="Cuotas pendientes"
                            valor={(resumen.pendientes + resumen.parciales).toString()}
                            icono={<Clock size={22} />}
                            color="amber"
                        />

                        <StatCard
                            titulo="Deuda pendiente"
                            valor={formatearMonto(resumen.deuda)}
                            icono={<CircleDollarSign size={22} />}
                            color="red"
                        />
                    </div>

                    {/* LEYENDA */}
                    <div className="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-4">
                        {Object.entries(estadoConfig).map(([estado, config]) => (
                            <div key={estado} className="flex items-center gap-2">
                                <span className={`h-3 w-3 rounded-full ${config.punto}`} />
                                <span className="text-sm text-slate-600">
                                    {config.etiqueta}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* TABLA */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 p-5">
                            <h2 className="text-lg font-bold text-slate-900">
                                Estado mensual por jugador
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Seleccioná un mes para consultar el estado de cada cuota.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1200px] text-sm">
                                <thead className="bg-slate-950 text-white">
                                    <tr>
                                        <th className="sticky left-0 z-10 bg-slate-950 px-4 py-4 text-left">
                                            Jugador
                                        </th>

                                        <th className="px-3 py-4 text-left">
                                            Categoría
                                        </th>

                                        {nombresMeses.map((mes) => (
                                            <th
                                                key={mes}
                                                className="px-2 py-4 text-center"
                                            >
                                                {mes}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {jugadores.map((jugador) => (
                                        <tr
                                            key={jugador.id}
                                            className="border-b border-slate-100 hover:bg-slate-50"
                                        >
                                            <td className="sticky left-0 z-10 bg-white px-4 py-3 font-semibold text-slate-800">
                                                {jugador.apellido}, {jugador.nombre}
                                            </td>

                                            <td className="px-3 py-3 text-slate-500">
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
                                                            title={`${config.etiqueta} | Pagado: ${formatearMonto(mes.pagado)} | Saldo: ${formatearMonto(mes.saldo)}`}
                                                            className={`mx-auto flex w-[78px] flex-col items-center rounded-lg border px-1 py-2 ${config.color}`}
                                                        >
                                                            <span className="text-xs font-bold">
                                                                {config.etiqueta === 'Sin asignar'
                                                                    ? '—'
                                                                    : config.etiqueta}
                                                            </span>

                                                            {mes.estado !== 'sin_asignacion' && (
                                                                <span className="mt-1 text-[10px]">
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

                        {jugadores.length === 0 && (
                            <div className="p-12 text-center">
                                <Users className="mx-auto mb-3 text-slate-300" size={40} />

                                <h3 className="font-semibold text-slate-700">
                                    No hay jugadores para mostrar
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Probá modificando los filtros seleccionados.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* RECAUDACIÓN */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                            <p className="text-sm font-medium text-emerald-700">
                                Total recaudado en el año
                            </p>

                            <p className="mt-2 text-2xl font-bold text-emerald-800">
                                {formatearMonto(resumen.recaudado)}
                            </p>
                        </div>

                        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                            <p className="text-sm font-medium text-red-700">
                                Total pendiente de cobro
                            </p>

                            <p className="mt-2 text-2xl font-bold text-red-800">
                                {formatearMonto(resumen.deuda)}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

interface StatCardProps {
    titulo: string;
    valor: string;
    icono: React.ReactNode;
    color: 'blue' | 'emerald' | 'amber' | 'red';
}

function StatCard({ titulo, valor, icono, color }: StatCardProps) {
    const colores = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        red: 'bg-red-50 text-red-600',
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                    {titulo}
                </p>

                <div className={`rounded-xl p-3 ${colores[color]}`}>
                    {icono}
                </div>
            </div>

            <p className="mt-4 text-2xl font-bold text-slate-900">
                {valor}
            </p>
        </div>
    );
}
