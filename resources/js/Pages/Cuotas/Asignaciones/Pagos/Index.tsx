import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';
import {
    CalendarDays,
    CheckCircle2,
    CircleDollarSign,
    CreditCard,
    ReceiptText,
    ShieldCheck,
    Wallet,
    UserRound,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatusBadge from '@/Components/Shared/StatusBadge';

interface Cuota {
    id: number;
    nombre: string;
    monto: number | string;
}

interface Jugador {
    id: number;
    nombre: string;
    apellido: string;
}

interface Recibo {
    id: number;
    numero: number;
}

interface ModalidadPago {
    id: number;
    nombre: string;
}

interface Pago {
    id: number;
    fecha_pago: string;
    monto: number | string;
    estado: string;
    modalidadPago?: ModalidadPago | null;
    recibo?: Recibo | null;
}

interface Asignacion {
    id: number;
    fecha_asignacion: string;
    fecha_vencimiento: string;
    estado: string;
    cuota: Cuota;
    jugador: Jugador;
    pagos: Pago[];
}

interface Props {
    asignacion: Asignacion;
    totalPagado: number;
    creditoAplicado: number;
    creditoDisponible: number;
    totalCubierto: number;
    saldoPendiente: number;
    modalidadesPago: ModalidadPago[];
}

const formatoMoneda = (importe: number | string) =>
    new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
    }).format(Number(importe) || 0);

const formatearFecha = (fecha: string) => {
    if (!fecha) return 'No disponible';

    const [anio, mes, dia] = fecha.substring(0, 10).split('-');

    return `${dia}/${mes}/${anio}`;
};

const fechaActual = () => {
    const fecha = new Date();

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
};

const tarjetasColor = {
    slate: {
        contenedor: 'border-slate-200 bg-white',
        icono: 'bg-slate-100 text-slate-700',
        titulo: 'text-slate-500',
        valor: 'text-slate-900',
        descripcion: 'text-slate-500',
    },
    emerald: {
        contenedor: 'border-emerald-200 bg-emerald-50/70',
        icono: 'bg-emerald-100 text-emerald-700',
        titulo: 'text-emerald-800',
        valor: 'text-emerald-900',
        descripcion: 'text-emerald-700',
    },
    violet: {
        contenedor: 'border-violet-200 bg-violet-50/70',
        icono: 'bg-violet-100 text-violet-700',
        titulo: 'text-violet-800',
        valor: 'text-violet-900',
        descripcion: 'text-violet-700',
    },
    teal: {
        contenedor: 'border-teal-200 bg-teal-50/70',
        icono: 'bg-teal-100 text-teal-700',
        titulo: 'text-teal-800',
        valor: 'text-teal-900',
        descripcion: 'text-teal-700',
    },
    amber: {
        contenedor: 'border-amber-200 bg-amber-50/70',
        icono: 'bg-amber-100 text-amber-700',
        titulo: 'text-amber-800',
        valor: 'text-amber-900',
        descripcion: 'text-amber-700',
    },
};

export default function Index({
    asignacion,
    totalPagado,
    creditoAplicado,
    creditoDisponible,
    totalCubierto,
    saldoPendiente,
    modalidadesPago,
}: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        modalidad_pago_id: '',
        fecha_pago: fechaActual(),
        monto: '',
    });

   const page = usePage();

    const { flash } = page.props as unknown as {
        flash: {
            success?: string;
        };
    };

    const parametrosActuales = page.url.includes('?')
        ? page.url.slice(page.url.indexOf('?'))
        : '';

    const volverAsignacionesUrl =
        `/cuotas/asignaciones${parametrosActuales}`;

    const creditoDisponibleReal = Number(creditoDisponible) || 0;

    const nombreJugador = [
        asignacion.jugador?.nombre,
        asignacion.jugador?.apellido,
    ]
        .filter(Boolean)
        .join(' ') || `Jugador #${asignacion.jugador?.id}`;

    const montoCuota = Number(asignacion.cuota?.monto) || 0;
    const totalPagadoReal = Number(totalPagado) || 0;
    const credito = Number(creditoAplicado) || 0;
    const totalCubiertoReal = Number(totalCubierto) || 0;
    const saldo = Number(saldoPendiente) || 0;

    const estaAnulada = asignacion.estado === 'anulada';
    const estaPagada = saldo <= 0 && !estaAnulada;

    const porcentajeCubierto =
        montoCuota > 0
            ? Math.min(100, Math.round((totalCubiertoReal / montoCuota) * 100))
            : 0;

    const registrarPago = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (estaAnulada || estaPagada || processing) return;

        const importe = Number(data.monto);

        if (!Number.isFinite(importe) || importe <= 0 || importe > saldo) {
            return;
        }

        post(`/cuotas/asignaciones/${asignacion.id}/pagos`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setData('fecha_pago', fechaActual());
            },
        });
    };

    const resumen = [
        {
            titulo: 'Total de la cuota',
            valor: formatoMoneda(montoCuota),
            descripcion: 'Importe original asignado',
            icono: <ReceiptText className="h-5 w-5" />,
            color: 'slate' as const,
        },
        {
            titulo: 'Pagos realizados',
            valor: formatoMoneda(totalPagadoReal),
            descripcion: 'Dinero efectivamente recibido',
            icono: <CircleDollarSign className="h-5 w-5" />,
            color: 'emerald' as const,
        },
        {
            titulo: 'Crédito aplicado',
            valor: formatoMoneda(credito),
            descripcion: 'Crédito utilizado en esta cuota',
            icono: <CreditCard className="h-5 w-5" />,
            color: 'violet' as const,
        },
        {
            titulo: 'Crédito disponible',
            valor: formatoMoneda(creditoDisponibleReal),
            descripcion: 'Saldo de la cuenta corriente',
            icono: <Wallet className="h-5 w-5" />,
            color: 'teal' as const,
        },
        {
            titulo: 'Saldo pendiente',
            valor: formatoMoneda(saldo),
            descripcion: 'Importe que resta cubrir',
            icono: <CircleDollarSign className="h-5 w-5" />,
            color: 'amber' as const,
        },
    ];

    return (
        <>
            <Head title="Pagos de cuota" />

            <div className="min-h-screen bg-slate-50/70 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-6">

                    {/* Mensaje de confirmación */}
                    {flash.success && (
                        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                            <p className="text-sm font-medium">
                                {flash.success}
                            </p>
                        </div>
                    )}

                    {/* Encabezado */}
                    <PageHeader
                        title="Pagos de cuota"
                        description="Administrá los pagos, créditos y saldos pendientes del jugador."
                        icon={<Wallet className="h-6 w-6" />}
                        actions={
                            <Link
                                href={volverAsignacionesUrl}
                                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                                Volver a asignaciones
                            </Link>
                        }
                    />

                    {/* Datos de la asignación */}
                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    Datos de la asignación
                                </h2>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    Información del jugador y de la cuota asignada.
                                </p>
                            </div>

                            <StatusBadge status={asignacion.estado} />
                        </div>

                        <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="flex min-w-0 items-start gap-3">
                                <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                                    <UserRound className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Jugador
                                    </p>
                                    <p className="mt-1 break-words font-semibold text-slate-900">
                                        {nombreJugador}
                                    </p>
                                </div>
                            </div>

                            <div className="flex min-w-0 items-start gap-3">
                                <div className="rounded-lg bg-violet-50 p-2 text-violet-700">
                                    <ReceiptText className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Cuota
                                    </p>
                                    <p className="mt-1 break-words font-semibold text-slate-900">
                                        {asignacion.cuota?.nombre ?? 'No disponible'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex min-w-0 items-start gap-3">
                                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                                    <CalendarDays className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Fecha de asignación
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-900">
                                        {formatearFecha(asignacion.fecha_asignacion)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex min-w-0 items-start gap-3">
                                <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
                                    <CalendarDays className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Fecha de vencimiento
                                    </p>
                                    <p className="mt-1 font-semibold text-slate-900">
                                        {formatearFecha(asignacion.fecha_vencimiento)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Asignación anulada */}
                    {estaAnulada && (
                        <div className="flex items-start gap-3 rounded-xl border border-slate-300 bg-slate-100 p-4">
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />
                            <div>
                                <p className="font-semibold text-slate-800">
                                    Esta asignación se encuentra anulada.
                                </p>
                                <p className="mt-1 text-sm text-slate-600">
                                    No es posible registrar nuevos pagos. El historial
                                    permanece disponible para consulta y trazabilidad.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Resumen económico */}
                    <section>
                        <div className="mb-4">
                            <h2 className="text-base font-bold text-slate-900">
                                Resumen económico
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Estado de los importes de esta asignación.
                            </p>
                        </div>

                        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-4 xl:grid-cols-5">
                            {resumen.map((item) => {
                                const color = tarjetasColor[item.color];

                                return (
                                    <div
                                        key={item.titulo}
                                        className={`min-w-0 overflow-hidden rounded-xl border p-4 shadow-sm transition hover:shadow-md sm:p-5 ${color.contenedor}`}
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color.icono}`}>
                                                {item.icono}
                                            </div>

                                            <p className={`min-w-0 text-sm font-semibold leading-tight ${color.titulo}`}>
                                                {item.titulo}
                                            </p>
                                        </div>

                                        <p
                                            className={`mt-4 min-w-0 break-all text-xl font-bold leading-tight tracking-tight tabular-nums sm:text-2xl ${color.valor}`}
                                        >
                                            {item.valor}
                                        </p>

                                        <p className={`mt-2 min-h-9 text-xs leading-relaxed ${color.descripcion}`}>
                                            {item.descripcion}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Total cubierto */}
                    <section className="overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm">
                        <div className="p-5 sm:p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>

                                        <h2 className="text-base font-bold text-slate-900">
                                            Total cubierto de la cuota
                                        </h2>
                                    </div>

                                    <p className="mt-2 text-sm text-slate-500">
                                        Incluye pagos reales y crédito aplicado.
                                    </p>
                                </div>

                                <p className="break-all text-2xl font-bold tracking-tight text-blue-800 tabular-nums sm:text-3xl">
                                    {formatoMoneda(totalCubiertoReal)}
                                </p>
                            </div>

                            <div className="mt-6">
                                <div className="flex h-3 overflow-hidden rounded-full bg-blue-100">
                                    <div
                                        className="h-full rounded-full bg-blue-600 transition-all duration-500"
                                        style={{
                                            width: `${porcentajeCubierto}%`,
                                        }}
                                    />
                                </div>

                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-500">
                                    <span>
                                        {porcentajeCubierto}% cubierto
                                    </span>
                                    <span>
                                        Objetivo: {formatoMoneda(montoCuota)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Crédito aplicado */}
                    {credito > 0 && (
                        <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4">
                            <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-violet-700" />
                            <div>
                                <p className="font-semibold text-violet-900">
                                    Se aplicó crédito de la cuenta corriente.
                                </p>
                                <p className="mt-1 text-sm text-violet-800">
                                    {formatoMoneda(credito)} de esta cuota fueron cubiertos
                                    mediante crédito disponible del jugador. Este importe
                                    no representa un pago nuevo ni genera un recibo.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Cuota pagada */}
                    {estaPagada && (
                        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                            <div>
                                <p className="font-semibold text-emerald-900">
                                    Esta cuota se encuentra cubierta en su totalidad.
                                </p>
                                <p className="mt-1 text-sm text-emerald-800">
                                    El importe fue cubierto mediante pagos reales,
                                    crédito aplicado o una combinación de ambos.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Formulario de pago */}
                    {!estaAnulada && !estaPagada && saldo > 0 && (
                        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                                        <CircleDollarSign className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <h2 className="text-base font-bold text-slate-900">
                                            Registrar un pago
                                        </h2>
                                        <p className="mt-0.5 text-sm text-slate-500">
                                            Registrá un pago total o parcial de la cuota.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form
                                onSubmit={registrarPago}
                                className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6"
                            >
                                <div className="min-w-0">
                                    <label
                                        htmlFor="modalidad_pago_id"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Modalidad de pago *
                                    </label>

                                    <select
                                        id="modalidad_pago_id"
                                        value={data.modalidad_pago_id}
                                        onChange={(e) =>
                                            setData('modalidad_pago_id', e.target.value)
                                        }
                                        required
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="">
                                            Seleccioná una modalidad
                                        </option>

                                        {modalidadesPago.map((modalidad) => (
                                            <option
                                                key={modalidad.id}
                                                value={modalidad.id}
                                            >
                                                {modalidad.nombre}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.modalidad_pago_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.modalidad_pago_id}
                                        </p>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <label
                                        htmlFor="fecha_pago"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Fecha de pago *
                                    </label>

                                    <input
                                        id="fecha_pago"
                                        type="date"
                                        value={data.fecha_pago}
                                        onChange={(e) =>
                                            setData('fecha_pago', e.target.value)
                                        }
                                        required
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                    {errors.fecha_pago && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.fecha_pago}
                                        </p>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <label
                                        htmlFor="monto"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Importe a pagar *
                                    </label>

                                    <input
                                        id="monto"
                                        type="number"
                                        min="0.01"
                                        max={saldo}
                                        step="0.01"
                                        value={data.monto}
                                        onChange={(e) =>
                                            setData('monto', e.target.value)
                                        }
                                        placeholder="0.00"
                                        required
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />

                                    <p className="mt-1 text-xs text-slate-500">
                                        Máximo disponible: {formatoMoneda(saldo)}
                                    </p>

                                    {errors.monto && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.monto}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {processing
                                            ? 'Registrando pago...'
                                            : 'Registrar pago'}
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    {/* Historial de pagos */}
                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                    <ReceiptText className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Historial de pagos
                                    </h2>
                                    <p className="mt-0.5 text-sm text-slate-500">
                                        Importes efectivamente abonados y números de recibo.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {asignacion.pagos.length === 0 ? (
                            <div className="px-5 py-12 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                    <ReceiptText className="h-6 w-6" />
                                </div>

                                <p className="mt-4 font-semibold text-slate-700">
                                    Todavía no hay pagos reales registrados.
                                </p>

                                <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">
                                    Las aplicaciones de crédito de la cuenta corriente
                                    no aparecen en este historial porque no representan
                                    dinero recibido ni generan recibos.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px] text-left text-sm">
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th className="px-5 py-3 font-semibold">
                                                Fecha
                                            </th>
                                            <th className="px-5 py-3 font-semibold">
                                                Modalidad
                                            </th>
                                            <th className="px-5 py-3 font-semibold">
                                                Importe
                                            </th>
                                            <th className="px-5 py-3 font-semibold">
                                                Estado
                                            </th>
                                            <th className="px-5 py-3 font-semibold">
                                                N.º de recibo
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {asignacion.pagos.map((pago) => (
                                            <tr
                                                key={pago.id}
                                                className="transition hover:bg-slate-50/80"
                                            >
                                                <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                                                    {formatearFecha(pago.fecha_pago)}
                                                </td>

                                                <td className="px-5 py-4 text-slate-700">
                                                    {pago.modalidadPago?.nombre ?? 'No disponible'}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900 tabular-nums">
                                                    {formatoMoneda(pago.monto)}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            pago.estado === 'confirmado'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-amber-100 text-amber-800'
                                                        }`}
                                                    >
                                                        {pago.estado}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 font-semibold text-blue-700">
                                                    {pago.recibo
                                                        ? String(pago.recibo.numero).padStart(6, '0')
                                                        : 'Pendiente'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}