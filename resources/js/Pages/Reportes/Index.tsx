import { Head, router } from '@inertiajs/react';
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
    GraduationCap,
    CalendarDays,
    ChevronDown,
    ArrowUp,
    ArrowDown,
    FileText,
} from 'lucide-react';

interface Estadisticas {
    anioSeleccionado: number;
    jugadoresActivos: number;
    categoriasActivas: number;
    recaudacionCuotasMensuales: number;
    deudaCuotasMensuales: number;
    recaudacionInscripcionesEscuelita: number;
    deudaInscripcionesEscuelita: number;
    cuotasVencidas: number;
    deudaVencidaTotal: number;
}

interface RecaudacionMensual {
    mes: string;
    total: number;
}
interface PeriodoRecaudacion {
    value: string;
    label: string;
    inicio: string;
    fin: string;
}

interface CategoriaRecaudacion {
    id: number;
    anio: number;
}

interface FiltrosRecaudacion {
    categoriaId: number | null;
    concepto: string | null;
}

interface ReporteCategoria {
    categoriaId: number;
    categoria: string;
    anio: number;
    jugadoresActivos: number;
    totalRecaudado: number;
    deudaPendiente: number;
}

interface SituacionEconomicaMes {
    mes: number;
    nombreMes: string;
    totalRecaudado: number;
    deudaPendiente: number;
}

interface SituacionEconomicaCategoria {
    categoriaId: number;
    categoria: string;
    anio: number;
    meses: SituacionEconomicaMes[];
}

interface DetalleDeuda {
    jugadorId: number;
    jugador: string;
    estadoJugador: string;
    categoria: string;
     concepto: string;
    cuota: string;
    montoCuota: number;
    totalPagado: number;
    saldoPendiente: number;
    fechaVencimiento: string | null;
    estadoVencimiento: string;
}

interface Props {
    estadisticas: Estadisticas;
    recaudacionMensual: RecaudacionMensual[];
    reportesPorCategoria: ReporteCategoria[];
    situacionEconomicaPorCategoria: SituacionEconomicaCategoria[];
    detalleDeudas: DetalleDeuda[];
    anioSeleccionado: number;
    aniosDisponibles: number[];
    totalRecaudacionMensual: number;
    periodosRecaudacion: PeriodoRecaudacion[];
    periodoRecaudacionSeleccionado: string | null;
    categoriasRecaudacion: CategoriaRecaudacion[];
    filtrosRecaudacion: FiltrosRecaudacion;
}

const MESES = [
    { id: 1, nombre: 'Enero' },
    { id: 2, nombre: 'Febrero' },
    { id: 3, nombre: 'Marzo' },
    { id: 4, nombre: 'Abril' },
    { id: 5, nombre: 'Mayo' },
    { id: 6, nombre: 'Junio' },
    { id: 7, nombre: 'Julio' },
    { id: 8, nombre: 'Agosto' },
    { id: 9, nombre: 'Septiembre' },
    { id: 10, nombre: 'Octubre' },
    { id: 11, nombre: 'Noviembre' },
    { id: 12, nombre: 'Diciembre' },
];

export default function Index({
    estadisticas,
    recaudacionMensual,
    reportesPorCategoria,
    situacionEconomicaPorCategoria,
    detalleDeudas,
    anioSeleccionado,
    aniosDisponibles,
    totalRecaudacionMensual,
    periodosRecaudacion,
    periodoRecaudacionSeleccionado,
    categoriasRecaudacion,
    filtrosRecaudacion,
}: Props) {
    type CampoOrdenDeuda = 'jugador' | 'categoria' | 'concepto';

    const [ordenDeudas, setOrdenDeudas] =
        useState<CampoOrdenDeuda>('jugador');

    const [direccionOrdenDeudas, setDireccionOrdenDeudas] =
        useState<'asc' | 'desc'>('asc');

    const cambiarOrdenDeudas = (campo: CampoOrdenDeuda) => {
        if (ordenDeudas === campo) {
            setDireccionOrdenDeudas((actual) =>
                actual === 'asc' ? 'desc' : 'asc',
            );
        } else {
            setOrdenDeudas(campo);
            setDireccionOrdenDeudas('asc');
        }
    };
    const [filtroCategoria, setFiltroCategoria] = useState('todas');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroVencimiento, setFiltroVencimiento] = useState('todos');

    // Categorías seleccionadas para el gráfico económico.
    // Inicialmente se muestran todas las categorías activas.
    const [categoriasEconomicasSeleccionadas, setCategoriasEconomicasSeleccionadas] =
        useState<number[]>(() =>
            situacionEconomicaPorCategoria.map((item) => item.categoriaId),
        );

    // Meses seleccionados para el gráfico económico.
    // Inicialmente se muestran los doce meses.
    const [mesesEconomicosSeleccionados, setMesesEconomicosSeleccionados] =
        useState<number[]>(() => MESES.map((mes) => mes.id));

    const [mostrarFiltroEconomico, setMostrarFiltroEconomico] = useState(false);
    const [mostrarFiltroMeses, setMostrarFiltroMeses] = useState(false);

    const formatearMoneda = (monto: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 2,
        }).format(monto);
    };

    const cambiarAnio = (anio: number) => {
        router.get(
            '/reportes',
            {
                anio,
                periodo: periodoRecaudacionSeleccionado,
                categoriaId: filtrosRecaudacion.categoriaId,
                concepto: filtrosRecaudacion.concepto,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const maximoRecaudado = Math.max(
        ...recaudacionMensual.map((item) => item.total),
        0,
    );

    const maximoJugadores = Math.max(
        ...reportesPorCategoria.map((item) => item.jugadoresActivos),
        0,
    );

    // Categorías seleccionadas.
    const categoriasEconomicasFiltradas =
        situacionEconomicaPorCategoria.filter((item) =>
            categoriasEconomicasSeleccionadas.includes(item.categoriaId),
        );

    // Calcular los totales de cada categoría según los meses seleccionados.
    const datosEconomicosFiltrados = categoriasEconomicasFiltradas.map(
        (categoria) => {
            const mesesFiltrados = categoria.meses.filter((mes) =>
                mesesEconomicosSeleccionados.includes(mes.mes),
            );

            return {
                ...categoria,
                totalRecaudado: mesesFiltrados.reduce(
                    (total, mes) => total + mes.totalRecaudado,
                    0,
                ),
                deudaPendiente: mesesFiltrados.reduce(
                    (total, mes) => total + mes.deudaPendiente,
                    0,
                ),
            };
        },
    );

    // Escala compartida para comparar recaudación y deuda.
    const maximoEconomico = Math.max(
        ...datosEconomicosFiltrados.flatMap((item) => [
            item.totalRecaudado,
            item.deudaPendiente,
        ]),
        0,
    );

    // Acciones del filtro de categorías.
    const seleccionarTodasLasCategorias = () => {
        setCategoriasEconomicasSeleccionadas(
            situacionEconomicaPorCategoria.map((item) => item.categoriaId),
        );
    };

    const limpiarCategorias = () => {
        setCategoriasEconomicasSeleccionadas([]);
    };

    const alternarCategoriaEconomica = (categoriaId: number) => {
        setCategoriasEconomicasSeleccionadas((actuales) =>
            actuales.includes(categoriaId)
                ? actuales.filter((id) => id !== categoriaId)
                : [...actuales, categoriaId],
        );
    };

    const todasLasCategoriasSeleccionadas =
        situacionEconomicaPorCategoria.length > 0 &&
        categoriasEconomicasSeleccionadas.length ===
            situacionEconomicaPorCategoria.length;

    const textoFiltroEconomico = () => {
        if (categoriasEconomicasSeleccionadas.length === 0) {
            return 'Ninguna categoría seleccionada';
        }

        if (todasLasCategoriasSeleccionadas) {
            return 'Todas las categorías activas';
        }

        if (categoriasEconomicasSeleccionadas.length === 1) {
            return '1 categoría seleccionada';
        }

        return `${categoriasEconomicasSeleccionadas.length} categorías seleccionadas`;
    };

    // Acciones del filtro de meses.
    const seleccionarTodosLosMeses = () => {
        setMesesEconomicosSeleccionados(MESES.map((mes) => mes.id));
    };

    const limpiarMeses = () => {
        setMesesEconomicosSeleccionados([]);
    };

    const alternarMesEconomico = (mesId: number) => {
        setMesesEconomicosSeleccionados((actuales) =>
            actuales.includes(mesId)
                ? actuales.filter((id) => id !== mesId)
                : [...actuales, mesId],
        );
    };

    const todosLosMesesSeleccionados =
        mesesEconomicosSeleccionados.length === MESES.length;

    const textoFiltroMeses = () => {
        if (mesesEconomicosSeleccionados.length === 0) {
            return 'Ningún mes seleccionado';
        }

        if (todosLosMesesSeleccionados) {
            return 'Todos los meses';
        }

        if (mesesEconomicosSeleccionados.length === 1) {
            return MESES.find(
                (mes) => mes.id === mesesEconomicosSeleccionados[0],
            )?.nombre ?? '1 mes seleccionado';
        }

        return `${mesesEconomicosSeleccionados.length} meses seleccionados`;
    };
    const cambiarFiltrosRecaudacion = (
        filtros: {
            periodo?: string | null;
            categoriaId?: number | null;
            concepto?: string | null;
        },
    ) => {
        router.get(
            '/reportes',
            {
                anio: anioSeleccionado,
                periodo: filtros.periodo !== undefined
                    ? filtros.periodo
                    : periodoRecaudacionSeleccionado,
                categoriaId: filtros.categoriaId !== undefined
                    ? filtros.categoriaId
                    : filtrosRecaudacion.categoriaId,
                concepto: filtros.concepto !== undefined
                    ? filtros.concepto
                    : filtrosRecaudacion.concepto,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const urlExportacion = () => {
        const parametros = new URLSearchParams({
            anio: String(anioSeleccionado),
        });

        if (periodoRecaudacionSeleccionado) {
            parametros.set('periodo', periodoRecaudacionSeleccionado);
        }

        if (filtrosRecaudacion.categoriaId !== null) {
            parametros.set(
                'categoriaId',
                String(filtrosRecaudacion.categoriaId),
            );
        }

        if (filtrosRecaudacion.concepto) {
            parametros.set('concepto', filtrosRecaudacion.concepto);
        }

        return `/reportes/exportar?${parametros.toString()}`;
    };
    const urlExportacionPdf = () => {
        const parametros = new URLSearchParams({
            anio: String(anioSeleccionado),
        });

        if (periodoRecaudacionSeleccionado) {
            parametros.set('periodo', periodoRecaudacionSeleccionado);
        }

        if (filtrosRecaudacion.categoriaId !== null) {
            parametros.set(
                'categoriaId',
                String(filtrosRecaudacion.categoriaId),
            );
        }

        if (filtrosRecaudacion.concepto) {
            parametros.set('concepto', filtrosRecaudacion.concepto);
        }

        return `/reportes/exportar-pdf?${parametros.toString()}`;
    };

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
            titulo: 'Recaudación anual de cuotas mensuales',
            valor: formatearMoneda(estadisticas.recaudacionCuotasMensuales),
            icono: Wallet,
            color: 'text-emerald-600',
            fondo: 'bg-emerald-50',
        },
        {
            titulo: 'Deuda anual de cuotas mensuales',
            valor: formatearMoneda(estadisticas.deudaCuotasMensuales),
            icono: AlertTriangle,
            color: 'text-amber-600',
            fondo: 'bg-amber-50',
        },
        {
            titulo: 'Recaudación anual de inscripciones a la escuelita',
            valor: formatearMoneda(
                estadisticas.recaudacionInscripcionesEscuelita,
            ),
            icono: GraduationCap,
            color: 'text-emerald-600',
            fondo: 'bg-emerald-50',
        },
        {
            titulo: 'Deuda anual de inscripciones a la escuelita',
            valor: formatearMoneda(
                estadisticas.deudaInscripcionesEscuelita,
            ),
            icono: Clock,
            color: 'text-rose-600',
            fondo: 'bg-rose-50',
        },
    ];

    return (
        <>
            <Head title="Reportes y estadísticas | FulbitoGest" />

            <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* ENCABEZADO */}
<div className="overflow-hidden rounded-2xl !bg-slate-950 shadow-lg">
    <div className="flex flex-col gap-6 px-6 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between">

        {/* TÍTULO */}
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

       {/* FILTRO Y EXPORTACIONES */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end lg:gap-8">

            {/* SELECTOR DE AÑO */}
            <div className="w-full sm:w-36">
                <label
                    htmlFor="anio-reporte"
                    className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300"
                >
                    <CalendarDays size={16} />
                    Año del reporte
                </label>

                <select
                    id="anio-reporte"
                    value={anioSeleccionado}
                    onChange={(e) =>
                        cambiarAnio(Number(e.target.value))
                    }
                    className="h-11 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 text-sm font-semibold text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                >
                    {aniosDisponibles.map((anio) => (
                        <option key={anio} value={anio}>
                            {anio}
                        </option>
                    ))}
                </select>
            </div>

            {/* BOTONES DE EXPORTACIÓN */}
            <div className="flex w-full flex-col items-end gap-2 sm:w-44">

                <a
                    href={urlExportacion()}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                    <FileSpreadsheet size={18} />
                    Exportar Excel
                </a>

                <a
                    href={urlExportacionPdf()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
                >
                    <FileText size={18} />
                    Exportar PDF
                </a>

            </div>
        </div>
    </div>
</div>

                    {/* INDICADORES GENERALES */}
                    <section>
                        <div className="mb-4">
                            <h2 className="text-lg font-bold text-slate-900">
                                Resumen general
                            </h2>

                            <p className="text-sm text-slate-500">
                                Indicadores económicos correspondientes al año {anioSeleccionado}.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {estadisticasCards.map((card) => {
                                const Icono = card.icono;

                                return (
                                    <div
                                        key={card.titulo}
                                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-sm font-medium text-slate-500">
                                                {card.titulo}
                                            </span>

                                            <div
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.fondo}`}
                                            >
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
                                                <Users
                                                    size={23}
                                                    className="text-blue-600"
                                                />
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
                                            const porcentaje =
                                                maximoJugadores > 0
                                                    ? (item.jugadoresActivos / maximoJugadores) * 100
                                                    : 0;

                                            return (
                                                <div key={item.categoriaId}>
                                                    <div className="mb-2 flex items-center justify-between gap-3">
                                                        <span className="text-sm font-medium text-slate-700">
                                                            Categoría {item.anio}
                                                        </span>

                                                        <span className="text-sm font-bold text-slate-900">
                                                            {item.jugadoresActivos}
                                                        </span>
                                                    </div>

                                                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                                        <div
                                                            className="h-full rounded-full bg-blue-500 transition-all duration-300"
                                                            style={{
                                                                width: `${porcentaje}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* SITUACIÓN ECONÓMICA POR CATEGORÍA */}
                                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                    <div className="mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                                                <Wallet
                                                    size={23}
                                                    className="text-emerald-600"
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="font-bold text-slate-900">
                                                    Situación económica
                                                </h3>

                                                <p className="text-sm text-slate-500">
                                                    Cuotas mensuales del año {anioSeleccionado}.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* FILTROS */}
                                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

                                        {/* FILTRO DE CATEGORÍAS */}
                                        <div
                                            className={`relative ${
                                                mostrarFiltroEconomico ? 'z-30' : 'z-10'
                                            }`}
                                        >
                                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                                Categorías activas
                                            </label>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMostrarFiltroEconomico(
                                                        !mostrarFiltroEconomico,
                                                    );
                                                    setMostrarFiltroMeses(false);
                                                }}
                                                aria-expanded={mostrarFiltroEconomico}
                                                className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm text-slate-700 shadow-sm transition hover:border-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                            >
                                                <span className="truncate">
                                                    {textoFiltroEconomico()}
                                                </span>

                                                <ChevronDown
                                                    size={18}
                                                    className={`shrink-0 text-slate-500 transition-transform ${
                                                        mostrarFiltroEconomico
                                                            ? 'rotate-180'
                                                            : ''
                                                    }`}
                                                />
                                            </button>

                                            {mostrarFiltroEconomico && (
                                                <div className="absolute left-0 right-0 z-30 mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                                        <button
                                                            type="button"
                                                            onClick={seleccionarTodasLasCategorias}
                                                            className="text-xs font-semibold text-emerald-700 transition hover:text-emerald-800"
                                                        >
                                                            Seleccionar todas
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={limpiarCategorias}
                                                            className="text-xs font-semibold text-slate-500 transition hover:text-slate-700"
                                                        >
                                                            Limpiar selección
                                                        </button>
                                                    </div>

                                                    {situacionEconomicaPorCategoria.length === 0 ? (
                                                        <p className="py-3 text-center text-sm text-slate-500">
                                                            No hay categorías activas.
                                                        </p>
                                                    ) : (
                                                        <div className="max-h-52 space-y-1 overflow-y-auto">
                                                            {situacionEconomicaPorCategoria.map(
                                                                (item) => (
                                                                    <label
                                                                        key={item.categoriaId}
                                                                        className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={categoriasEconomicasSeleccionadas.includes(
                                                                                item.categoriaId,
                                                                            )}
                                                                            onChange={() =>
                                                                                alternarCategoriaEconomica(
                                                                                    item.categoriaId,
                                                                                )
                                                                            }
                                                                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                                        />

                                                                        <span>
                                                                            Categoría {item.anio}
                                                                        </span>
                                                                    </label>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* FILTRO DE MESES */}
                                        <div
                                            className={`relative ${
                                                mostrarFiltroMeses ? 'z-30' : 'z-10'
                                            }`}
                                        >
                                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                                Meses
                                            </label>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMostrarFiltroMeses(
                                                        !mostrarFiltroMeses,
                                                    );
                                                    setMostrarFiltroEconomico(false);
                                                }}
                                                aria-expanded={mostrarFiltroMeses}
                                                className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm text-slate-700 shadow-sm transition hover:border-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                            >
                                                <span className="truncate">
                                                    {textoFiltroMeses()}
                                                </span>

                                                <ChevronDown
                                                    size={18}
                                                    className={`shrink-0 text-slate-500 transition-transform ${
                                                        mostrarFiltroMeses
                                                            ? 'rotate-180'
                                                            : ''
                                                    }`}
                                                />
                                            </button>

                                            {mostrarFiltroMeses && (
                                                <div className="absolute left-0 right-0 z-30 mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                                        <button
                                                            type="button"
                                                            onClick={seleccionarTodosLosMeses}
                                                            className="text-xs font-semibold text-emerald-700 transition hover:text-emerald-800"
                                                        >
                                                            Seleccionar todos
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={limpiarMeses}
                                                            className="text-xs font-semibold text-slate-500 transition hover:text-slate-700"
                                                        >
                                                            Limpiar selección
                                                        </button>
                                                    </div>

                                                    <div className="max-h-52 space-y-1 overflow-y-auto">
                                                        {MESES.map((mes) => (
                                                            <label
                                                                key={mes.id}
                                                                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={mesesEconomicosSeleccionados.includes(
                                                                        mes.id,
                                                                    )}
                                                                    onChange={() =>
                                                                        alternarMesEconomico(
                                                                            mes.id,
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                                />

                                                                <span>
                                                                    {mes.nombre}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* REFERENCIAS */}
                                    <div className="mb-6 flex flex-wrap gap-4 text-xs font-medium text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-sm bg-emerald-500" />
                                            Recaudación
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-sm bg-amber-500" />
                                            Deuda pendiente
                                        </div>
                                    </div>

                                    {/* BARRAS ECONÓMICAS */}
                                    {categoriasEconomicasFiltradas.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center">
                                            <Layers3
                                                size={30}
                                                className="mx-auto mb-2 text-slate-400"
                                            />

                                            <p className="text-sm font-semibold text-slate-700">
                                                No hay categorías seleccionadas.
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Seleccioná una o más categorías para visualizar su situación económica.
                                            </p>
                                        </div>
                                    ) : mesesEconomicosSeleccionados.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center">
                                            <CalendarDays
                                                size={30}
                                                className="mx-auto mb-2 text-slate-400"
                                            />

                                            <p className="text-sm font-semibold text-slate-700">
                                                No hay meses seleccionados.
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Seleccioná uno o más meses para visualizar los importes.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="max-h-[480px] space-y-6 overflow-y-auto pr-1">
                                            {datosEconomicosFiltrados.map((item) => {
                                                const porcentajeRecaudado =
                                                    maximoEconomico > 0
                                                        ? (item.totalRecaudado / maximoEconomico) * 100
                                                        : 0;

                                                const porcentajeDeuda =
                                                    maximoEconomico > 0
                                                        ? (item.deudaPendiente / maximoEconomico) * 100
                                                        : 0;

                                                return (
                                                    <div key={item.categoriaId}>
                                                        <p className="mb-3 text-sm font-semibold text-slate-800">
                                                            Categoría {item.anio}
                                                        </p>

                                                        {/* RECAUDACIÓN */}
                                                        <div className="mb-3">
                                                            <div className="mb-1 flex justify-between gap-2 text-xs text-slate-500">
                                                                <span>
                                                                    Recaudación
                                                                </span>

                                                                <span className="font-semibold text-emerald-700">
                                                                    {formatearMoneda(item.totalRecaudado)}
                                                                </span>
                                                            </div>

                                                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                                                <div
                                                                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                                                                    style={{
                                                                        width: `${porcentajeRecaudado}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* DEUDA */}
                                                        <div>
                                                            <div className="mb-1 flex justify-between gap-2 text-xs text-slate-500">
                                                                <span>
                                                                    Deuda pendiente
                                                                </span>

                                                                <span className="font-semibold text-amber-700">
                                                                    {formatearMoneda(item.deudaPendiente)}
                                                                </span>
                                                            </div>

                                                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                                                                <div
                                                                    className="h-full rounded-full bg-amber-500 transition-all duration-300"
                                                                    style={{
                                                                        width: `${porcentajeDeuda}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <p className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-400">
                                        Se consideran únicamente cuotas mensuales y pagos confirmados. La recaudación se agrupa por fecha del pago; la deuda, por período de la cuota. Se contemplan los pagos parciales y jugadores activos e inactivos.
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* DETALLE DE DEUDAS */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 p-5 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                                    <Clock
                                        size={23}
                                        className="text-amber-600"
                                    />
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

                        <div className="mt-5 space-y-5 rounded-xl border border-slate-200 bg-white p-5">

                            {/* FILTROS */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Categoría
                                    </label>

                                    <select
                                        value={filtroCategoria}
                                        onChange={(e) =>
                                            setFiltroCategoria(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="todas">
                                            Todas las categorías
                                        </option>

                                        {reportesPorCategoria.map((item) => (
                                            <option
                                                key={item.categoriaId}
                                                value={item.categoria}
                                            >
                                                Categoría {item.anio}
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
                                        onChange={(e) =>
                                            setFiltroEstado(e.target.value)
                                        }
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
                                        onChange={(e) =>
                                            setFiltroVencimiento(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="todos">
                                            Todos los estados
                                        </option>
                                        <option value="Vencida">Vencidas</option>
                                        <option value="Pendiente">Pendientes</option>
                                        <option value="Sin vencimiento">
                                            Sin vencimiento
                                        </option>
                                    </select>
                                </div>
                            </div>
                            {/* ORDENAMIENTO */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:items-end">
                                <div className="w-full sm:max-w-xs">
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Ordenar por
                                    </label>

                                    <select
                                        value={ordenDeudas}
                                        onChange={(e) =>
                                            cambiarOrdenDeudas(e.target.value as CampoOrdenDeuda)
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                    >
                                        <option value="jugador">Nombre del jugador</option>
                                        <option value="categoria">Categoría</option>
                                        <option value="concepto">Concepto</option>
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setDireccionOrdenDeudas((actual) =>
                                            actual === 'asc' ? 'desc' : 'asc',
                                        )
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50"
                                >
                                    {direccionOrdenDeudas === 'asc' ? (
                                        <>
                                            <ArrowUp size={17} />
                                            Ascendente
                                        </>
                                    ) : (
                                        <>
                                            <ArrowDown size={17} />
                                            Descendente
                                        </>
                                    )}
                                </button>
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

                                    return (
                                        coincideCategoria &&
                                        coincideEstado &&
                                        coincideVencimiento
                                    );
                                });
                                const deudasOrdenadas = [...deudasFiltradas].sort((a, b) => {
                                let comparacion = 0;

                                switch (ordenDeudas) {
                                    case 'jugador':
                                        comparacion = a.jugador.localeCompare(
                                            b.jugador,
                                            'es',
                                            { sensitivity: 'base' },
                                        );
                                        break;

                                    case 'categoria':
                                        comparacion =
                                            Number(a.categoria) - Number(b.categoria);
                                        break;

                                    case 'concepto':
                                        comparacion = a.concepto.localeCompare(
                                            b.concepto,
                                            'es',
                                            { sensitivity: 'base' },
                                        );
                                        break;
                                }

                                return direccionOrdenDeudas === 'asc'
                                    ? comparacion
                                    : -comparacion;
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
                                                <table className="w-full min-w-[1050px] text-left text-sm">
                                                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                                        <tr>
                                                            <th className="px-4 py-3">Jugador</th>
                                                            <th className="px-4 py-3">Estado</th>
                                                            <th className="px-4 py-3">Categoría</th>
                                                            <th className="px-4 py-3">Concepto</th>
                                                            <th className="px-4 py-3">Cuota</th>
                                                            <th className="px-4 py-3">Monto</th>
                                                            <th className="px-4 py-3">Pagado</th>
                                                            <th className="px-4 py-3">Saldo</th>
                                                            <th className="px-4 py-3">Estado de vencimiento</th>
                                                            <th className="px-4 py-3">Vencimiento</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody className="divide-y divide-slate-100">
                                                        {deudasOrdenadas.map((item, index) => (
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
                                                                    Categoría {item.categoria}
                                                                </td>
                                                                <td className="px-4 py-4 text-slate-600">
                                                                    {item.concepto}
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
                                                                        ? new Date(`${item.fechaVencimiento}T00:00:00`).toLocaleDateString('es-AR')
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
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="w-full sm:w-64">
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Período de recaudación
                                </label>

                                <select
                                    value={periodoRecaudacionSeleccionado ?? ''}
                                    onChange={(e) =>
                                        cambiarFiltrosRecaudacion({
                                            periodo: e.target.value || null,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                >
                                    {periodosRecaudacion.map((periodo) => (
                                        <option key={periodo.value} value={periodo.value}>
                                            {periodo.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 border-b border-slate-100 p-5 sm:grid-cols-3 sm:p-6">

                            {/* PERÍODO */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Período
                                </label>

                                <select
                                    value={periodoRecaudacionSeleccionado ?? ''}
                                    onChange={(e) =>
                                        cambiarFiltrosRecaudacion({
                                            periodo: e.target.value || null,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                >
                                    {periodosRecaudacion.length === 0 ? (
                                        <option value="">Sin períodos disponibles</option>
                                    ) : (
                                        periodosRecaudacion.map((periodo) => (
                                            <option key={periodo.value} value={periodo.value}>
                                                {periodo.label}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            {/* CATEGORÍA */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Categoría
                                </label>

                                <select
                                    value={filtrosRecaudacion.categoriaId ?? ''}
                                    onChange={(e) =>
                                        cambiarFiltrosRecaudacion({
                                            categoriaId: e.target.value
                                                ? Number(e.target.value)
                                                : null,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                >
                                    <option value="">Todas las categorías</option>

                                    {[...categoriasRecaudacion]
                                        .sort((a, b) => a.anio - b.anio)
                                        .map((categoria) => (
                                            <option key={categoria.id} value={categoria.id}>
                                                Categoría {categoria.anio}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            {/* CONCEPTO */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Concepto
                                </label>

                                <select
                                    value={filtrosRecaudacion.concepto ?? ''}
                                    onChange={(e) =>
                                        cambiarFiltrosRecaudacion({
                                            concepto: e.target.value || null,
                                        })
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                >
                                    <option value="">Todos los conceptos</option>
                                    <option value="cuota_mensual">Cuotas mensuales</option>
                                    <option value="inscripcion_torneo">Inscripciones a torneos</option>
                                    <option value="inscripcion_escuelita">
                                        Inscripciones a la escuelita
                                    </option>
                                </select>
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
                                                {formatearMoneda(totalRecaudacionMensual)}
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                            Pagos confirmados
                                        </span>
                                    </div>

                                    <div className="flex h-64 items-end gap-3 border-b border-slate-200 px-2 sm:gap-6">
                                        {recaudacionMensual.map((item) => {
                                            const altura =
                                                maximoRecaudado > 0
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
                {/* EXPORTACIÓN DE REPORTES */}
                <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <FileSpreadsheet
                                size={21}
                                className="text-emerald-600"
                            />

                            <h2 className="font-bold text-slate-900">
                                Exportar reportes
                            </h2>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                            Descargá los reportes en Excel o PDF según los filtros seleccionados.
                             Los demás indicadores conservarán sus criterios generales.
                        </p>
                    </div>

                   <div className="flex flex-wrap gap-3">
                        <a
                            href={urlExportacion()}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                            <FileSpreadsheet size={18} />
                            Exportar Excel
                        </a>

                        <a
                            href={urlExportacionPdf()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                        >
                            <FileText size={18} />
                            Exportar PDF
                        </a>
                    </div>
                </section>
            </div>
        </>
    );
}