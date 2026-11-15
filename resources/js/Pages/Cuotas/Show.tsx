import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    ClipboardList,
    FileText,
    Receipt,
    Wallet,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
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
    cuota: Cuota;
}

const meses = [
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

const tiposCuota: Record<TipoCuota, string> = {
    cuota_mensual: 'Cuota mensual',
    inscripcion_escuelita: 'Inscripción a la escuelita',
    inscripcion_torneo: 'Inscripción a torneo',
};

export default function Show({ cuota }: Props) {
    const formatoMoneda = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
    });

    const fechaVencimiento = cuota.fecha_vencimiento
        ? new Date(`${cuota.fecha_vencimiento.substring(0, 10)}T00:00:00`)
        : null;

    const fechaFormateada =
        fechaVencimiento && !Number.isNaN(fechaVencimiento.getTime())
            ? fechaVencimiento.toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
              })
            : '-';

    const periodo =
        cuota.tipo === 'cuota_mensual'
            ? `${cuota.periodo_mes ? meses[cuota.periodo_mes - 1] : '-'} ${cuota.periodo_anio ?? ''}`
            : cuota.periodo_anio?.toString() ?? '-';

    return (
        <>
            <Head title={`Detalle de cuota - ${cuota.nombre}`} />

            <div className="space-y-6">
                <PageHeader
                    title="Detalle de cuota"
                    description="Información completa de la cuota registrada en el sistema."
                    icon={<Receipt className="h-6 w-6" />}
                    actions={
                        <Link
                            href="/cuotas"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Link>
                    }
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-6 py-5">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            {cuota.nombre}
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Información general de la cuota
                                        </p>
                                    </div>

                                    <StatusBadge
                                        status={cuota.estado ? 'activo' : 'inactivo'}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
                                <div>
                                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                                        <ClipboardList className="h-4 w-4" />
                                        Tipo de cuota
                                    </div>
                                    <p className="font-semibold text-slate-900">
                                        {tiposCuota[cuota.tipo] ?? cuota.tipo}
                                    </p>
                                </div>

                                <div>
                                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                                        <CalendarDays className="h-4 w-4" />
                                        Período
                                    </div>
                                    <p className="font-semibold text-slate-900">
                                        {periodo}
                                    </p>
                                </div>

                                <div>
                                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                                        <Wallet className="h-4 w-4" />
                                        Monto
                                    </div>
                                    <p className="text-xl font-bold text-slate-900">
                                        {formatoMoneda.format(Number(cuota.monto) || 0)}
                                    </p>
                                </div>

                                <div>
                                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                                        <CalendarDays className="h-4 w-4" />
                                        Fecha de vencimiento
                                    </div>
                                    <p className="font-semibold text-slate-900">
                                        {fechaFormateada}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-slate-500" />
                                <h2 className="font-semibold text-slate-900">
                                    Descripción
                                </h2>
                            </div>

                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                                {cuota.descripcion || 'No se registró una descripción para esta cuota.'}
                            </p>
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-5 font-semibold text-slate-900">
                                Resumen
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Identificador
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-900">
                                        #{cuota.id}
                                    </p>
                                </div>

                                <div className="border-t border-slate-100 pt-4">
                                    <p className="text-sm text-slate-500">
                                        Tipo
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-900">
                                        {tiposCuota[cuota.tipo] ?? cuota.tipo}
                                    </p>
                                </div>

                                <div className="border-t border-slate-100 pt-4">
                                    <p className="text-sm text-slate-500">
                                        Estado
                                    </p>
                                    <div className="mt-2">
                                        <StatusBadge
                                            status={cuota.estado ? 'activo' : 'inactivo'}
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-4">
                                    <p className="text-sm text-slate-500">
                                        Importe establecido
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-slate-900">
                                        {formatoMoneda.format(Number(cuota.monto) || 0)}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </>
    );
}