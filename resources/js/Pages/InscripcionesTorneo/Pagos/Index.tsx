import { Head, Link, useForm } from '@inertiajs/react';

interface Jugador {
    id: number;
    nombre?: string;
    apellido?: string;
}

interface Torneo {
    id: number;
    nombre?: string;
}

interface Recibo {
    id: number;
    numero: number;
}

interface ModalidadPago {
    id: number;
    nombre: string;
}

interface PagoInscripcion {
    id: number;
    fecha_pago: string;
    monto: number | string;
    estado: string;
    modalidadPago?: ModalidadPago | null;
    modalidad_pago?: ModalidadPago | null;
    recibo?: Recibo | null;
}

interface Inscripcion {
    id: number;
    jugador_id: number;
    torneo_id: number;
    fecha_inscripcion: string;
    monto_inscripcion: number | string;
    jugador: Jugador;
    torneo: Torneo;
    pagos: PagoInscripcion[];
}

interface Props {
    inscripcion: Inscripcion;
    totalPagado: number;
    saldoPendiente: number;
    modalidadesPago: ModalidadPago[];
}

const formatoMoneda = (importe: number | string) =>
    new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
    }).format(Number(importe) || 0);

const fechaActual = () => {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
};

export default function Index({
    inscripcion,
    totalPagado,
    saldoPendiente,
    modalidadesPago,
}: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        modalidad_pago_id: '',
        fecha_pago: fechaActual(),
        monto: '',
    });

    const nombreJugador = [
        inscripcion.jugador?.nombre,
        inscripcion.jugador?.apellido,
    ]
        .filter(Boolean)
        .join(' ') || `Jugador #${inscripcion.jugador_id}`;

    const nombreTorneo =
        inscripcion.torneo?.nombre || `Torneo #${inscripcion.torneo_id}`;

    const montoInscripcion = Number(inscripcion.monto_inscripcion) || 0;

    const registrarPago = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(`/inscripciones-torneo/${inscripcion.id}/pagos`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setData('fecha_pago', fechaActual());
            },
        });
    };

    return (
        <>
            <Head title="Pagos de inscripción" />

            <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                                FulbitoGest
                            </p>
                            <h1 className="mt-1 text-2xl font-bold text-slate-900">
                                Pagos de inscripción
                            </h1>
                            <p className="mt-1 text-sm text-slate-600">
                                Administrá los pagos y consultá el saldo del
                                jugador.
                            </p>
                        </div>

                        <Link
                            href={`/torneos/${inscripcion.torneo_id}`}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                            Volver al torneo
                        </Link>
                    </div>

                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900">
                            Datos de la inscripción
                        </h2>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Jugador
                                </p>
                                <p className="font-semibold text-slate-800">
                                    {nombreJugador}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">
                                    Torneo
                                </p>
                                <p className="font-semibold text-slate-800">
                                    {nombreTorneo}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">
                                    Fecha de inscripción
                                </p>
                                <p className="font-medium text-slate-800">
                                    {inscripcion.fecha_inscripcion
                                        ? new Date(
                                              `${inscripcion.fecha_inscripcion.slice(0, 10)}T12:00:00`,
                                          ).toLocaleDateString('es-AR')
                                        : 'No disponible'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500">
                                    Importe de inscripción
                                </p>
                                <p className="font-semibold text-slate-800">
                                    {formatoMoneda(montoInscripcion)}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Total de inscripción
                            </p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {formatoMoneda(montoInscripcion)}
                            </p>
                        </div>

                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                            <p className="text-sm font-medium text-emerald-800">
                                Total pagado
                            </p>
                            <p className="mt-2 text-2xl font-bold text-emerald-900">
                                {formatoMoneda(totalPagado)}
                            </p>
                        </div>

                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                            <p className="text-sm font-medium text-amber-800">
                                Saldo pendiente
                            </p>
                            <p className="mt-2 text-2xl font-bold text-amber-900">
                                {formatoMoneda(saldoPendiente)}
                            </p>
                        </div>
                    </section>

                    {saldoPendiente > 0 && (
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900">
                                Registrar un pago
                            </h2>

                            <p className="mt-1 text-sm text-slate-600">
                                Podés registrar un pago total o parcial. El
                                importe no puede superar el saldo pendiente.
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
                                            setData(
                                                'modalidad_pago_id',
                                                e.target.value,
                                            )
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
                                            setData(
                                                'fecha_pago',
                                                e.target.value,
                                            )
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
                                        max={saldoPendiente}
                                        step="0.01"
                                        value={data.monto}
                                        onChange={(e) =>
                                            setData('monto', e.target.value)
                                        }
                                        placeholder="0,00"
                                        required
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />

                                    <p className="mt-1 text-xs text-slate-500">
                                        Máximo disponible:{' '}
                                        {formatoMoneda(saldoPendiente)}
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

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-5 py-4">
                            <h2 className="text-lg font-bold text-slate-900">
                                Historial de pagos
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Consultá los importes abonados y los números de
                                recibo de cada pago.
                            </p>
                        </div>

                        {inscripcion.pagos.length === 0 ? (
                            <div className="px-5 py-10 text-center">
                                <p className="font-medium text-slate-700">
                                    Todavía no hay pagos registrados.
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Cuando registres el primer pago, aparecerá
                                    en este historial.
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
                                        {inscripcion.pagos.map((pago) => (
                                            <tr key={pago.id}>
                                                <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                                                    {new Date(
                                                        `${pago.fecha_pago.slice(0, 10)}T12:00:00`,
                                                    ).toLocaleDateString(
                                                        'es-AR',
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-slate-700">
                                                    {pago.modalidadPago?.nombre ??
                                                        pago.modalidad_pago?.nombre ??
                                                        'No disponible'}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                                                    {formatoMoneda(pago.monto)}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            pago.estado ===
                                                            'confirmado'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-amber-100 text-amber-800'
                                                        }`}
                                                    >
                                                        {pago.estado}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 font-semibold text-blue-700">
                                                    {pago.recibo
                                                        ? String(
                                                              pago.recibo.numero,
                                                          ).padStart(6, '0')
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