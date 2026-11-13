import { Head, Link } from '@inertiajs/react';
import PageHeader from '@/Components/Shared/PageHeader';
import StatCard from '@/Components/Shared/StatCard';
import StatusBadge from '@/Components/Shared/StatusBadge';
import {
    Wallet,
    CheckCircle,
    Clock,
    Receipt,
    ArrowLeft,
    CalendarDays,
    UserRound,
    CreditCard,
} from 'lucide-react';

interface Cuota {
    id: number;
    nombre: string;
    descripcion?: string | null;
    monto: string | number;
}

interface Categoria {
    id: number;
    anio: number;
}

interface Jugador {
    id: number;
    nombre: string;
    apellido: string;
    categoria?: Categoria | null;
}

interface ModalidadPago {
    id: number;
    nombre: string;
}

interface Recibo {
    id: number;
    numero: number;
}

interface Pago {
    id: number;
    fecha_pago: string;
    monto: string | number;
    estado: string;
    modalidad_pago?: ModalidadPago | null;
    recibo?: Recibo | null;
}

interface Asignacion {
    id: number;
    fecha_asignacion: string;
    fecha_vencimiento: string;
    estado: string;
    cuota: Cuota | null;
    jugador: Jugador;
    pagos: Pago[];
}

interface Props {
    asignacion: Asignacion;
    totalPagado: number;
    saldoPendiente: number;
    estadoCalculado: 'pagada' | 'parcial' | 'pendiente';
}

export default function Index({
    asignacion,
    totalPagado,
    saldoPendiente,
    estadoCalculado,
}: Props) {
    const formatearMonto = (monto: number | string) =>
        Number(monto).toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2,
        });

    const formatearFecha = (fecha: string | null) => {
        if (!fecha) return '—';

        const [anio, mes, dia] = fecha.substring(0, 10).split('-');

        return `${dia}/${mes}/${anio}`;
    };

    const montoCuota = Number(asignacion.cuota?.monto ?? 0);

    return (
        <>
            <Head title="Historial de pagos" />

            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-7xl">

                    <PageHeader
                        title="Historial de pagos"
                        description={`Consultá los pagos correspondientes a ${asignacion.cuota?.nombre ?? 'la cuota seleccionada'}.`}
                        icon={<Wallet className="h-7 w-7" />}
                    />

                    <div className="mb-6">
                        <Link
                            href={route('cuotas.mis')}
                            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
                        >
                            <ArrowLeft size={17} />
                            Volver a Mis cuotas
                        </Link>
                    </div>

                    {/* Información del jugador y cuota */}
                    <div className="mb-6 flex flex-col gap-4">

                        {/* Información del jugador */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                                    <UserRound className="h-5 w-5 text-blue-600" />
                                </div>

                                <h2 className="font-bold text-slate-800">
                                    Información del jugador
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                <div>
                                    <p className="mb-1 text-slate-500">Nombre completo</p>
                                    <p className="font-semibold text-slate-800">
                                        {asignacion.jugador.apellido}, {asignacion.jugador.nombre}
                                    </p>
                                </div>

                                <div>
                                    <p className="mb-1 text-slate-500">Categoría</p>
                                    <p className="font-semibold text-slate-800">
                                        {asignacion.jugador.categoria?.anio ?? '—'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Información de la cuota */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                                    <Receipt className="h-5 w-5 text-emerald-600" />
                                </div>

                                <h2 className="font-bold text-slate-800">
                                    Información de la cuota
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                <div>
                                    <p className="mb-1 text-slate-500">Concepto</p>
                                    <p className="font-semibold text-slate-800">
                                        {asignacion.cuota?.nombre ?? '—'}
                                    </p>
                                </div>

                                <div>
                                    <p className="mb-1 text-slate-500">Importe</p>
                                    <p className="font-semibold text-slate-800">
                                        {formatearMonto(asignacion.cuota?.monto ?? 0)}
                                    </p>
                                </div>

                                <div>
                                    <p className="mb-1 text-slate-500">Fecha de asignación</p>
                                    <p className="font-semibold text-slate-800">
                                        {formatearFecha(asignacion.fecha_asignacion)}
                                    </p>
                                </div>

                                <div>
                                    <p className="mb-1 text-slate-500">Fecha de vencimiento</p>
                                    <p className="font-semibold text-slate-800">
                                        {formatearFecha(asignacion.fecha_vencimiento)}
                                    </p>
                                </div>

                                <div className="col-span-2 flex items-center justify-between border-t border-slate-100 pt-3">
                                    <span className="text-slate-500">Estado actual</span>
                                    <StatusBadge status={estadoCalculado} />
                                </div>

                                {asignacion.cuota?.descripcion && (
                                    <div className="col-span-2 border-t border-slate-100 pt-3">
                                        <p className="mb-1 text-slate-500">Descripción</p>
                                        <p className="text-slate-700">
                                            {asignacion.cuota.descripcion}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Resumen económico */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                        <StatCard
                            title="Importe de la cuota"
                            value={formatearMonto(montoCuota)}
                            description="Importe total asignado"
                            icon={<Wallet className="h-6 w-6" />}
                            color="blue"
                        />

                        <StatCard
                            title="Total abonado"
                            value={formatearMonto(totalPagado)}
                            description="Pagos confirmados"
                            icon={<CheckCircle className="h-6 w-6" />}
                            color="emerald"
                        />

                        <StatCard
                            title="Saldo pendiente"
                            value={formatearMonto(saldoPendiente)}
                            description="Importe restante por abonar"
                            icon={<Clock className="h-6 w-6" />}
                            color="amber"
                        />
                    </div>

                    {/* Historial de pagos */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">
                                    Historial de pagos
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Registro completo de los pagos asociados a esta cuota.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">
                                <CreditCard size={17} />
                                {asignacion.pagos.length} registros
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">
                                            Fecha
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Monto
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Modalidad
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Estado
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Recibo
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {asignacion.pagos.map((pago) => (
                                        <tr
                                            key={pago.id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <CalendarDays
                                                        size={16}
                                                        className="text-slate-400"
                                                    />
                                                    {formatearFecha(pago.fecha_pago)}
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-800">
                                                {formatearMonto(pago.monto)}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                                {pago.modalidad_pago?.nombre ?? '—'}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4">
                                                <StatusBadge status={pago.estado} />
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                                {pago.recibo ? (
                                                    <span className="font-medium text-emerald-700">
                                                        N.º {pago.recibo.numero}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">
                                                        Sin recibo
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}

                                    {asignacion.pagos.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-12 text-center"
                                            >
                                                <Receipt className="mx-auto mb-3 h-10 w-10 text-slate-300" />

                                                <p className="font-semibold text-slate-700">
                                                    Todavía no hay pagos registrados
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Cuando se registren pagos para esta cuota, aparecerán en este historial.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Resumen final */}
                        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:gap-10">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Total abonado
                                </p>
                                <p className="mt-1 font-bold text-emerald-600">
                                    {formatearMonto(totalPagado)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">
                                    Saldo pendiente
                                </p>
                                <p className="mt-1 font-bold text-rose-600">
                                    {formatearMonto(saldoPendiente)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}