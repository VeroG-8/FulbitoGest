import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    GraduationCap,
    History,
    Receipt,
    RefreshCw,
    Trophy,
    Wallet,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatCard from '@/Components/Shared/StatCard';
import StatusBadge from '@/Components/Shared/StatusBadge';

type TipoCuota =
    | 'cuota_mensual'
    | 'inscripcion_escuelita'
    | 'inscripcion_torneo';

interface Cuota {
    id: number;
    nombre: string;
    descripcion: string | null;
    tipo: TipoCuota;
    monto: string | number;
    periodo_mes: number | null;
    periodo_anio: number | null;
    fecha_vencimiento: string;
    estado: boolean;
}

interface Props {
    cuotas: Cuota[];
}

interface FlashProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

const tiposCuota: Record<TipoCuota, string> = {
    cuota_mensual: 'Cuota mensual',
    inscripcion_escuelita: 'Inscripción a la escuelita',
    inscripcion_torneo: 'Inscripción a torneo',
};

const nombresMeses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
];

export default function Historial({ cuotas }: Props) {
    const { flash } = usePage().props as unknown as FlashProps;

    const { put, processing } = useForm();

    const formatearFecha = (fecha: string) => {
        if (!fecha) return '-';

        const [anio, mes, dia] = fecha.substring(0, 10).split('-');

        return `${dia}/${mes}/${anio}`;
    };

    const formatearMonto = (monto: string | number) => {
        return Number(monto).toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2,
        });
    };

    const formatearPeriodo = (cuota: Cuota) => {
        if (!cuota.periodo_anio) return '-';

        if (
            cuota.tipo === 'cuota_mensual' &&
            cuota.periodo_mes !== null
        ) {
            return `${nombresMeses[cuota.periodo_mes - 1]} ${cuota.periodo_anio}`;
        }

        return String(cuota.periodo_anio);
    };

    const tipoLabel = (tipo: TipoCuota) => {
        return tiposCuota[tipo] ?? tipo;
    };

    const reactivar = (cuota: Cuota) => {
        if (
            confirm(
                `¿Querés reactivar la cuota "${cuota.nombre}"?`,
            )
        ) {
            put(`/cuotas/${cuota.id}/reactivar`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Historial de cuotas" />

            <div className="space-y-6">
                <PageHeader
                    title="Historial de cuotas"
                    description="Consultá las cuotas deshabilitadas y administrá su reactivación."
                    icon={<History className="h-6 w-6" />}
                    actions={
                        <Link
                            href="/cuotas"
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            <ArrowLeft size={17} />
                            Volver a cuotas
                        </Link>
                    }
                />

                {/* Mensajes del sistema */}
                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                        {flash.error}
                    </div>
                )}

                {/* Estadística */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Cuotas deshabilitadas"
                        value={cuotas.length}
                        description="Conceptos en el historial"
                        icon={<History className="h-6 w-6" />}
                        color="rose"
                    />

                    <StatCard
                        title="Cuotas mensuales"
                        value={
                            cuotas.filter(
                                (cuota) => cuota.tipo === 'cuota_mensual',
                            ).length
                        }
                        description="Cuotas periódicas"
                        icon={<CalendarDays className="h-6 w-6" />}
                        color="blue"
                    />

                    <StatCard
                        title="Inscripciones escuelita"
                        value={
                            cuotas.filter(
                                (cuota) =>
                                    cuota.tipo === 'inscripcion_escuelita',
                            ).length
                        }
                        description="Inscripciones anuales"
                        icon={<GraduationCap className="h-6 w-6" />}
                        color="emerald"
                    />

                    <StatCard
                        title="Inscripciones a torneos"
                        value={
                            cuotas.filter(
                                (cuota) =>
                                    cuota.tipo === 'inscripcion_torneo',
                            ).length
                        }
                        description="Inscripciones deportivas"
                        icon={<Trophy className="h-6 w-6" />}
                        color="amber"
                    />
                </section>

                {/* Listado */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Cuotas deshabilitadas
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Registro de conceptos de cobro que ya no se
                                encuentran activos.
                            </p>
                        </div>
                    </div>

                    {/* Información del listado */}
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3 text-sm text-slate-500 sm:px-6">
                        <span>
                            {cuotas.length > 0
                                ? `${cuotas.length} cuotas en el historial`
                                : 'No hay cuotas para mostrar'}
                        </span>
                    </div>

                    {/* Tabla */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                                <tr>
                                    <th className="whitespace-nowrap px-4 py-4 text-left">
                                        Nombre
                                    </th>

                                    <th className="whitespace-nowrap px-4 py-4 text-left">
                                        Tipo
                                    </th>

                                    <th className="whitespace-nowrap px-4 py-4 text-left">
                                        Período
                                    </th>

                                    <th className="whitespace-nowrap px-4 py-4 text-left">
                                        Monto
                                    </th>

                                    <th className="whitespace-nowrap px-4 py-4 text-left">
                                        Vencimiento
                                    </th>

                                    <th className="whitespace-nowrap px-4 py-4 text-center">
                                        Estado
                                    </th>

                                    <th className="whitespace-nowrap px-4 py-4 text-center">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {cuotas.map((cuota) => (
                                    <tr
                                        key={cuota.id}
                                        className="transition hover:bg-slate-50"
                                    >
                                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-800">
                                            <div>{cuota.nombre}</div>

                                            {cuota.descripcion && (
                                                <p className="mt-1 max-w-xs truncate text-xs font-normal text-slate-500">
                                                    {cuota.descripcion}
                                                </p>
                                            )}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                    cuota.tipo ===
                                                    'cuota_mensual'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : cuota.tipo ===
                                                            'inscripcion_escuelita'
                                                          ? 'bg-emerald-100 text-emerald-700'
                                                          : 'bg-violet-100 text-violet-700'
                                                }`}
                                            >
                                                {tipoLabel(cuota.tipo)}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                                            {formatearPeriodo(cuota)}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-800">
                                            {formatearMonto(cuota.monto)}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                                            {formatearFecha(
                                                cuota.fecha_vencimiento,
                                            )}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 text-center">
                                            <StatusBadge status="inactivo" />
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => reactivar(cuota)}
                                                disabled={processing}
                                                title="Reactivar cuota"
                                                aria-label={`Reactivar ${cuota.nombre}`}
                                                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                                Reactivar
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {cuotas.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-14 text-center"
                                        >
                                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                                                <Wallet className="h-7 w-7 text-slate-400" />
                                            </div>

                                            <p className="mt-4 font-semibold text-slate-700">
                                                No hay cuotas deshabilitadas
                                            </p>

                                            <p className="mt-1 text-sm text-slate-500">
                                                Las cuotas que deshabilites
                                                aparecerán en este historial.
                                            </p>

                                            <Link
                                                href="/cuotas"
                                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                Volver a cuotas activas
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </>
    );
}