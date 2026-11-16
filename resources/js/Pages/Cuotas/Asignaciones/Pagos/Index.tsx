import { Head, Link, useForm, usePage } from '@inertiajs/react';

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

export default function Index({
    asignacion,
    totalPagado,
    creditoAplicado,
    totalCubierto,
    saldoPendiente,
    modalidadesPago,
}: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        modalidad_pago_id: '',
        fecha_pago: fechaActual(),
        monto: '',
    });

    const { flash } = usePage().props as unknown as {
        flash: {
            success?: string;
        };
    };

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

    const registrarPago = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (estaAnulada || estaPagada) return;

        post(`/cuotas/asignaciones/${asignacion.id}/pagos`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setData('fecha_pago', fechaActual());
            },
        });
    };

    return (
        <>
            <Head title="Pagos de cuota" />

            <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl space-y-6">

                    {flash.success && (
                        <div className="rounded-lg bg-emerald-100 px-4 py-3 text-emerald-800">
                            {flash.success}
                        </div>
                    )}

                    {/* Encabezado */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                                FulbitoGest
                            </p>

                            <h1 className="mt-1 text-2xl font-bold text-slate-900">
                                Pagos de cuota
                            </h1>

                            <p className="mt-1 text-sm text-slate-600">
                                Administrá los pagos y consultá el saldo del jugador.
                            </p>
                        </div>

                        <Link
                            href="/cuotas/asignaciones"
                            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                            Volver a asignaciones
                        </Link>
                    </div>

                    {/* Datos de la asignación */}
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-lg font-bold text-slate-900">
                                Datos de la asignación
                            </h2>

                            <span
                                className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                    estaAnulada
                                        ? 'bg-slate-100 text-slate-600'
                                        : asignacion.estado === 'pagada'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-amber-100 text-amber-700'
                                }`}
                            >
                                {asignacion.estado.replaceAll('_', ' ')}
                            </span>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-slate-500">Jugador</p>
                                <p className="font-semibold text-slate-800">
                                    {nombreJugador}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">Cuota</p>
                                <p className="font-semibold text-slate-800">
                                    {asignacion.cuota?.nombre}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">
                                    Fecha de asignación
                                </p>
                                <p className="font-medium text-slate-800">
                                    {formatearFecha(asignacion.fecha_asignacion)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">
                                    Fecha de vencimiento
                                </p>
                                <p className="font-medium text-slate-800">
                                    {formatearFecha(asignacion.fecha_vencimiento)}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Aviso de asignación anulada */}
                    {estaAnulada && (
                        <div className="rounded-xl border border-slate-300 bg-slate-100 p-4">
                            <p className="font-semibold text-slate-800">
                                Esta asignación se encuentra anulada.
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                                No es posible registrar nuevos pagos. El historial
                                de pagos permanece disponible para consulta y trazabilidad.
                            </p>
                        </div>
                    )}

                    {/* Resumen económico */}
                    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                        {/* Importe de la cuota */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Total de la cuota
                            </p>

                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {formatoMoneda(montoCuota)}
                            </p>
                        </div>

                        {/* Pagos reales */}
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                            <p className="text-sm font-medium text-emerald-800">
                                Pagos realizados
                            </p>

                            <p className="mt-2 text-2xl font-bold text-emerald-900">
                                {formatoMoneda(totalPagadoReal)}
                            </p>

                            <p className="mt-1 text-xs text-emerald-700">
                                Dinero efectivamente recibido
                            </p>
                        </div>

                        {/* Crédito aplicado */}
                        <div className="rounded-xl border border-violet-200 bg-violet-50 p-5">
                            <p className="text-sm font-medium text-violet-800">
                                Crédito aplicado
                            </p>

                            <p className="mt-2 text-2xl font-bold text-violet-900">
                                {formatoMoneda(credito)}
                            </p>

                            <p className="mt-1 text-xs text-violet-700">
                                Cubierto con saldo de cuenta corriente
                            </p>
                        </div>

                        {/* Saldo pendiente */}
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                            <p className="text-sm font-medium text-amber-800">
                                Saldo pendiente
                            </p>

                            <p className="mt-2 text-2xl font-bold text-amber-900">
                                {formatoMoneda(saldo)}
                            </p>
                        </div>
                    </section>

                    {/* Total cubierto */}
                    <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-blue-900">
                                    Total cubierto de la cuota
                                </p>

                                <p className="mt-1 text-xs text-blue-700">
                                    Incluye pagos reales y crédito aplicado.
                                </p>
                            </div>

                            <p className="text-2xl font-bold text-blue-900">
                                {formatoMoneda(totalCubiertoReal)}
                            </p>
                        </div>

                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-blue-100">
                            <div
                                className="h-full rounded-full bg-blue-600 transition-all"
                                style={{
                                    width: `${
                                        montoCuota > 0
                                            ? Math.min(
                                                100,
                                                (totalCubiertoReal / montoCuota) * 100
                                            )
                                            : 0
                                    }%`,
                                }}
                            />
                        </div>

                        <div className="mt-2 flex justify-between text-xs text-blue-700">
                            <span>
                                {montoCuota > 0
                                    ? `${Math.min(
                                        100,
                                        Math.round(
                                            (totalCubiertoReal / montoCuota) * 100
                                        )
                                    )}% cubierto`
                                    : '0% cubierto'}
                            </span>

                            <span>
                                {formatoMoneda(montoCuota)}
                            </span>
                        </div>
                    </section>

                    {/* Aviso de crédito aplicado */}
                    {credito > 0 && (
                        <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                            <p className="font-semibold text-violet-900">
                                Se aplicó crédito de la cuenta corriente.
                            </p>

                            <p className="mt-1 text-sm text-violet-800">
                                {formatoMoneda(credito)} de esta cuota fueron cubiertos
                                mediante crédito disponible del jugador. Este importe
                                no representa un pago nuevo ni genera un recibo.
                            </p>
                        </div>
                    )}

                    {/* Aviso de cuota pagada */}
                    {estaPagada && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <p className="font-semibold text-emerald-900">
                                Esta cuota se encuentra cubierta en su totalidad.
                            </p>

                            <p className="mt-1 text-sm text-emerald-800">
                                El importe fue cubierto mediante pagos reales,
                                crédito aplicado o una combinación de ambos.
                            </p>
                        </div>
                    )}

                    {/* Formulario de pago */}
                    {!estaAnulada && !estaPagada && saldo > 0 && (
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900">
                                Registrar un pago
                            </h2>

                            <p className="mt-1 text-sm text-slate-600">
                                Podés registrar un pago total o parcial. El importe
                                no puede superar el saldo pendiente.
                            </p>

                            <form
                                onSubmit={registrarPago}
                                className="mt-5 grid gap-5 sm:grid-cols-2"
                            >
                                <div>
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
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
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

                                <div>
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
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />

                                    {errors.fecha_pago && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.fecha_pago}
                                        </p>
                                    )}
                                </div>

                                <div>
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
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
                                        className="w-full rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {processing
                                            ? 'Registrando pago...'
                                            : 'Registrar pago'}
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    {/* Historial de pagos reales */}
                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-5 py-4">
                            <h2 className="text-lg font-bold text-slate-900">
                                Historial de pagos
                            </h2>

                            <p className="mt-1 text-sm text-slate-600">
                                Consultá los importes efectivamente abonados
                                y los números de recibo.
                            </p>
                        </div>

                        {asignacion.pagos.length === 0 ? (
                            <div className="px-5 py-10 text-center">
                                <p className="font-medium text-slate-700">
                                    Todavía no hay pagos reales registrados.
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Las aplicaciones de crédito de la cuenta corriente
                                    no aparecen en este historial porque no representan
                                    dinero recibido ni generan recibos.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[650px] text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-600">
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
                                            <tr key={pago.id}>
                                                <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                                                    {formatearFecha(pago.fecha_pago)}
                                                </td>

                                                <td className="px-5 py-4 text-slate-700">
                                                    {pago.modalidadPago?.nombre ?? 'No disponible'}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
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