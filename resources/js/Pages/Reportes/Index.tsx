import { Head } from '@inertiajs/react';
import { useState } from 'react';
import {
    BarChart3,
    AlertTriangle,
    Users,
    Layers3,
    CheckCircle2,
    Clock,
    Wallet,
    TrendingUp,
    FileSpreadsheet,
} from 'lucide-react';

interface Estadisticas {
    jugadoresActivos: number;
    categoriasActivas: number;
    cuotasPagadas: number;
    cuotasPendientes: number;
    totalRecaudado: number;
    cuotasVencidas: number;
    deudaVencidaTotal: number;
}

interface RecaudacionMensual {
    mes: string;
    total: number;
}

interface Props {
    estadisticas: Estadisticas;
    recaudacionMensual: RecaudacionMensual[];
    reportesPorCategoria: ReporteCategoria[];
    detalleDeudas: DetalleDeuda[];
}

interface ReporteCategoria {
    categoriaId: number;
    categoria: string;
    anio: number;
    jugadoresActivos: number;
    totalRecaudado: number;
    deudaPendiente: number;
}

interface DetalleDeuda {
    jugadorId: number;
    jugador: string;
    estadoJugador: string;
    categoria: string;
    cuota: string;
    montoCuota: number;
    totalPagado: number;
    saldoPendiente: number;
    fechaVencimiento: string;
    estadoVencimiento: string;
}
export default function Index({
    estadisticas,
    recaudacionMensual,
    reportesPorCategoria,
    detalleDeudas,
}: Props) {
    const [filtroCategoria, setFiltroCategoria] = useState('todas');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroVencimiento, setFiltroVencimiento] = useState('todos');
    const formatearMoneda = (monto: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 2,
        }).format(monto);
    };

    const maximoRecaudado = Math.max(
        ...recaudacionMensual.map((item) => item.total),
        0,
    );
    // Máximo de jugadores activos por categoría
    const maximoJugadores = Math.max(
        ...reportesPorCategoria.map((item) => item.jugadoresActivos),
        0,
    );

    // Máximo de recaudación y deuda por categoría
    const maximoEconomico = Math.max(
        ...reportesPorCategoria.flatMap((item) => [
            item.totalRecaudado,
            item.deudaPendiente,
        ]),
        0,
    );

    const estadisticasCards = [
        {
            titulo: 'Jugadores activos',
            valor: estadisticas.jugadoresActivos,
            icono: Users,
            color: 'text-blue-600',
            fondo: 'bg-blue-50',
        },
        {
            titulo: 'Categorías activas',
            valor: estadisticas.categoriasActivas,
            icono: Layers3,
            color: 'text-violet-600',
            fondo: 'bg-violet-50',
        },
        {
            titulo: 'Cuotas pagadas',
            valor: estadisticas.cuotasPagadas,
            icono: CheckCircle2,
            color: 'text-emerald-600',
            fondo: 'bg-emerald-50',
        },
        {
            titulo: 'Cuotas pendientes',
            valor: estadisticas.cuotasPendientes,
            icono: Clock,
            color: 'text-amber-600',
            fondo: 'bg-amber-50',
        },
        {
            titulo: 'Cuotas vencidas',
            valor: estadisticas.cuotasVencidas,
            icono: AlertTriangle,
            color: 'text-rose-600',
            fondo: 'bg-rose-50',
        },
        {
            titulo: 'Deuda vencida',
            valor: formatearMoneda(estadisticas.deudaVencidaTotal),
            icono: Wallet,
            color: 'text-red-700',
            fondo: 'bg-red-50',
        },
        {
            titulo: 'Total recaudado',
            valor: formatearMoneda(estadisticas.totalRecaudado),
            icono: Wallet,
            color: 'text-emerald-600',
            fondo: 'bg-emerald-50',
        },
    ];

    return (
        <>
            <Head title="Reportes y estadísticas | FulbitoGest" />

            <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
                <div className="mx-auto max-w-7xl space-y-6">

                {/* ENCABEZADO */}
                <div className="overflow-hidden rounded-2xl !bg-slate-950 shadow-lg">
                    <div className="flex flex-col gap-5 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">

                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl !bg-slate-800">
                                <BarChart3
                                    size={30}
                                    strokeWidth={1.8}
                                    className="!text-white"
                                />
                            </div>

                            <div>
                                <p className="mb-1 text-sm font-medium !text-slate-300">
                                    Administración y seguimiento
                                </p>

                                <h1 className="m-0 text-2xl font-bold tracking-tight !text-white sm:text-3xl">
                                    Reportes y estadísticas
                                </h1>

                                <p className="mt-1 text-sm !text-slate-300">
                                    Información general y seguimiento económico de la escuela.
                                </p>
                            </div>
                        </div>

                        {/* BOTÓN EXPORTAR EXCEL */}
                        <a
                            href="/reportes/exportar"
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-950"
                        >
                            <FileSpreadsheet size={19} />
                            Exportar Excel
                        </a>

                    </div>
                </div>


                    {/* INDICADORES GENERALES */}
                    <section>
                        <div className="mb-4">
                            <h2 className="text-lg font-bold text-slate-900">
                                Resumen general
                            </h2>

                            <p className="text-sm text-slate-500">
                                Estado actual de la información registrada.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {estadisticasCards.map((card) => {
                                const Icono = card.icono;

                                return (
                                    <div
                                        key={card.titulo}
                                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm text-slate-500">
                                                {card.titulo}
                                            </span>

                                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.fondo}`}>
                                                <Icono
                                                    size={21}
                                                    className={card.color}
                                                />
                                            </div>
                                        </div>

                                        <p className="mt-4 break-words text-2xl font-bold text-slate-900">
                                            {card.valor}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                    {/* REPORTES POR CATEGORÍA */}
                    <section className="space-y-6">

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Estadísticas por categoría
                            </h2>

                            <p className="text-sm text-slate-500">
                                Distribución de jugadores y seguimiento económico.
                            </p>
                        </div>

                        {reportesPorCategoria.length === 0 ? (
                            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                                No hay categorías registradas para mostrar.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                                {/* JUGADORES POR CATEGORÍA */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                                    <div className="mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                                                <Users size={23} className="text-blue-600" />
                                            </div>

                                            <div>
                                                <h3 className="font-bold text-slate-900">
                                                    Jugadores por categoría
                                                </h3>

                                                <p className="text-sm text-slate-500">
                                                    Jugadores activos registrados.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5">

                                        {reportesPorCategoria.map((item) => {
                                            const porcentaje = maximoJugadores > 0
                                                ? (item.jugadoresActivos / maximoJugadores) * 100
                                                : 0;

                                            return (
                                                <div key={item.categoriaId}>

                                                    <div className="mb-2 flex items-center justify-between gap-3">
                                                        <span className="text-sm font-medium text-slate-700">
                                                            {item.categoria} ({item.anio})
                                                        </span>

                                                        <span className="text-sm font-bold text-slate-900">
                                                            {item.jugadoresActivos}
                                                        </span>
                                                    </div>

                                                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                                        <div
                                                            className="h-full rounded-full bg-blue-500 transition-all duration-300"
                                                            style={{ width: `${porcentaje}%` }}
                                                        />
                                                    </div>

                                                </div>
                                            );
                                        })}

                                    </div>
                                </div>

                                {/* RECAUDACIÓN Y DEUDA POR CATEGORÍA */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                                    <div className="mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                                                <Wallet size={23} className="text-emerald-600" />
                                            </div>

                                            <div>
                                                <h3 className="font-bold text-slate-900">
                                                    Situación económica
                                                </h3>

                                                <p className="text-sm text-slate-500">
                                                    Recaudación y deuda por categoría.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* REFERENCIAS */}
                                    <div className="mb-6 flex flex-wrap gap-4 text-xs font-medium text-slate-600">

                                        <div className="flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-sm bg-emerald-500" />
                                            Recaudado
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-sm bg-amber-500" />
                                            Deuda pendiente
                                        </div>

                                    </div>

                                    <div className="space-y-6">

                                        {reportesPorCategoria.map((item) => {
                                            const porcentajeRecaudado = maximoEconomico > 0
                                                ? (item.totalRecaudado / maximoEconomico) * 100
                                                : 0;

                                            const porcentajeDeuda = maximoEconomico > 0
                                                ? (item.deudaPendiente / maximoEconomico) * 100
                                                : 0;

                                            return (
                                                <div key={item.categoriaId}>

                                                    <p className="mb-3 text-sm font-semibold text-slate-800">
                                                        {item.categoria} ({item.anio})
                                                    </p>

                                                    <div className="mb-2">
                                                        <div className="mb-1 flex justify-between gap-2 text-xs text-slate-500">
                                                            <span>Recaudado</span>

                                                            <span className="font-semibold text-emerald-700">
                                                                {formatearMoneda(item.totalRecaudado)}
                                                            </span>
                                                        </div>

                                                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                                            <div
                                                                className="h-full rounded-full bg-emerald-500"
                                                                style={{ width: `${porcentajeRecaudado}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="mb-1 flex justify-between gap-2 text-xs text-slate-500">
                                                            <span>Deuda pendiente</span>

                                                            <span className="font-semibold text-amber-700">
                                                                {formatearMoneda(item.deudaPendiente)}
                                                            </span>
                                                        </div>

                                                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                                            <div
                                                                className="h-full rounded-full bg-amber-500"
                                                                style={{ width: `${porcentajeDeuda}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                </div>
                                            );
                                        })}

                                    </div>
                                </div>

                            </div>
                        )}

                    </section>
                    {/* DETALLE DE DEUDAS */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-200 p-5 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                                    <Clock size={23} className="text-amber-600" />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Detalle de cuotas pendientes
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Seguimiento de deudas de jugadores activos e inactivos.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5 p-5 sm:p-6">

                            {/* FILTROS */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Categoría
                                    </label>

                                    <select
                                        value={filtroCategoria}
                                        onChange={(e) => setFiltroCategoria(e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="todas">Todas las categorías</option>

                                        {reportesPorCategoria.map((item) => (
                                            <option
                                                key={item.categoriaId}
                                                value={item.categoria}
                                            >
                                                {item.categoria}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Estado del jugador
                                    </label>

                                    <select
                                        value={filtroEstado}
                                        onChange={(e) => setFiltroEstado(e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="todos">Todos</option>
                                        <option value="Activo">Activos</option>
                                        <option value="Inactivo">Inactivos</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                        Estado de vencimiento
                                    </label>

                                    <select
                                        value={filtroVencimiento}
                                        onChange={(e) => setFiltroVencimiento(e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="todos">Todos los estados</option>
                                        <option value="Vencida">Vencidas</option>
                                        <option value="Pendiente">Pendientes</option>
                                        <option value="Sin vencimiento">Sin vencimiento</option>
                                    </select>
                                </div>

                            </div>

                            {/* RESULTADOS FILTRADOS */}
                            {(() => {
                                const deudasFiltradas = detalleDeudas.filter((item) => {
                                    const coincideCategoria =
                                        filtroCategoria === 'todas' ||
                                        item.categoria === filtroCategoria;

                                    const coincideEstado =
                                        filtroEstado === 'todos' ||
                                        item.estadoJugador === filtroEstado;

                                    const coincideVencimiento =
                                        filtroVencimiento === 'todos' ||
                                        item.estadoVencimiento === filtroVencimiento;

                                    return coincideCategoria && coincideEstado && coincideVencimiento;
                                });

                                const totalDeuda = deudasFiltradas.reduce(
                                    (total, item) => total + item.saldoPendiente,
                                    0,
                                );

                                return (
                                    <>
                                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 p-4">
                                            <div>
                                                <p className="text-sm text-amber-800">
                                                    Saldo pendiente del filtro seleccionado
                                                </p>

                                                <p className="mt-1 text-xl font-bold text-amber-900">
                                                    {formatearMoneda(totalDeuda)}
                                                </p>
                                            </div>

                                            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-amber-700">
                                                {deudasFiltradas.length} cuotas pendientes
                                            </span>
                                        </div>

                                        {/* TABLA */}
                                        {deudasFiltradas.length === 0 ? (
                                            <div className="py-10 text-center">
                                                <CheckCircle2
                                                    size={35}
                                                    className="mx-auto mb-3 text-emerald-500"
                                                />

                                                <p className="font-semibold text-slate-700">
                                                    No se encontraron deudas.
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    No hay cuotas pendientes con los filtros seleccionados.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full min-w-[900px] text-left text-sm">

                                                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                                        <tr>
                                                            <th className="px-4 py-3">Jugador</th>
                                                            <th className="px-4 py-3">Estado</th>
                                                            <th className="px-4 py-3">Categoría</th>
                                                            <th className="px-4 py-3">Cuota</th>
                                                            <th className="px-4 py-3">Monto</th>
                                                            <th className="px-4 py-3">Pagado</th>
                                                            <th className="px-4 py-3">Saldo</th>
                                                            <th className="px-4 py-3">Estado de vencimiento</th>
                                                            <th className="px-4 py-3">Vencimiento</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody className="divide-y divide-slate-100">

                                                        {deudasFiltradas.map((item, index) => (
                                                            <tr
                                                                key={`${item.jugadorId}-${item.cuota}-${index}`}
                                                                className="transition-colors hover:bg-slate-50"
                                                            >
                                                                <td className="px-4 py-4 font-semibold text-slate-800">
                                                                    {item.jugador}
                                                                </td>

                                                                <td className="px-4 py-4">
                                                                    <span
                                                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                                            item.estadoJugador === 'Activo'
                                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                                : 'bg-rose-50 text-rose-700'
                                                                        }`}
                                                                    >
                                                                        {item.estadoJugador}
                                                                    </span>
                                                                </td>

                                                                <td className="px-4 py-4 text-slate-600">
                                                                    {item.categoria}
                                                                </td>

                                                                <td className="px-4 py-4 text-slate-600">
                                                                    {item.cuota}
                                                                </td>

                                                                <td className="px-4 py-4 text-slate-600">
                                                                    {formatearMoneda(item.montoCuota)}
                                                                </td>

                                                                <td className="px-4 py-4 text-emerald-700">
                                                                    {formatearMoneda(item.totalPagado)}
                                                                </td>

                                                                <td className="px-4 py-4 font-bold text-amber-700">
                                                                    {formatearMoneda(item.saldoPendiente)}
                                                                </td>
                                                                <td className="px-4 py-4">
                                                                    <span
                                                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                                            item.estadoVencimiento === 'Vencida'
                                                                                ? 'bg-rose-50 text-rose-700'
                                                                                : item.estadoVencimiento === 'Pendiente'
                                                                                    ? 'bg-amber-50 text-amber-700'
                                                                                    : 'bg-slate-100 text-slate-600'
                                                                        }`}
                                                                    >
                                                                        {item.estadoVencimiento}
                                                                    </span>
                                                                </td>

                                                                <td className="px-4 py-4 text-slate-600">
                                                                    {item.fechaVencimiento
                                                                    ? new Date(item.fechaVencimiento).toLocaleDateString('es-AR')
                                                                    : 'Sin vencimiento'}
                                                                </td>
                                                            </tr>
                                                        ))}

                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                            

                        </div>
                    </section>
                    {/* RECAUDACIÓN MENSUAL */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-200 p-5 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                                    <TrendingUp
                                        size={23}
                                        className="text-emerald-600"
                                    />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Recaudación mensual
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Ingresos registrados durante los últimos seis meses.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 sm:p-6">

                            {recaudacionMensual.length === 0 ? (
                                <div className="py-12 text-center text-slate-500">
                                    No hay información de recaudación disponible.
                                </div>
                            ) : (
                                <>
                                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm text-slate-500">
                                                Total recaudado en el período
                                            </p>

                                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                                {formatearMoneda(
                                                    recaudacionMensual.reduce(
                                                        (total, item) => total + item.total,
                                                        0,
                                                    ),
                                                )}
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                            Pagos confirmados
                                        </span>
                                    </div>

                                    <div className="flex h-64 items-end gap-3 border-b border-slate-200 px-2 sm:gap-6">
                                        {recaudacionMensual.map((item) => {
                                            const altura = maximoRecaudado > 0
                                                ? (item.total / maximoRecaudado) * 100
                                                : 0;

                                            return (
                                                <div
                                                    key={item.mes}
                                                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                                                >
                                                    <span className="mb-2 text-center text-xs font-semibold text-slate-600">
                                                        {formatearMoneda(item.total)}
                                                    </span>

                                                    <div className="flex h-[75%] w-full items-end justify-center">
                                                        <div
                                                            title={`${item.mes}: ${formatearMoneda(item.total)}`}
                                                            className="w-full max-w-16 rounded-t-lg bg-emerald-500 transition-all duration-300 hover:bg-emerald-600"
                                                            style={{
                                                                height: `${altura}%`,
                                                                minHeight: item.total > 0 ? '4px' : '0',
                                                            }}
                                                        />
                                                    </div>

                                                    <span className="mt-3 whitespace-nowrap text-xs font-medium text-slate-500">
                                                        {item.mes}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                </div>
            </div>
        </>
    );
}