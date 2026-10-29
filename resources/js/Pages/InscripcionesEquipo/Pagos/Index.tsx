import { Head, Link, useForm } from '@inertiajs/react';

interface Equipo {
    id: number;
    nombre: string;
    club?: {
        nombre: string;
    } | null;
    categoria?: {
        nombre: string;
    } | null;
}

interface Torneo {
    id: number;
    nombre: string;
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
    modalidad_pago: ModalidadPago;
    recibo?: Recibo | null;
}

interface Inscripcion {
    id: number;
    equipo_id: number;
    torneo_id: number;
    fecha_inscripcion: string;
    monto_inscripcion: string | number;
    estado: boolean;
    equipo: Equipo;
    torneo: Torneo;
    pagos: Pago[];
}

interface Props {
    inscripcion: Inscripcion;
    totalPagado: number;
    saldoPendiente: number;
    modalidadesPago: ModalidadPago[];
    errors: Record<string, string>;
}

export default function Index({
    inscripcion,
    totalPagado,
    saldoPendiente,
    modalidadesPago,
    errors,
}: Props) {
    const { data, setData, post, processing, reset } = useForm({
        modalidad_pago_id: '',
        fecha_pago: new Date().toLocaleDateString('en-CA'),
        monto: '',
    });

    const formatearMonto = (monto: string | number) =>
        Number(monto).toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
        });

    const formatearFecha = (fecha: string) => {
        const [anio, mes, dia] = fecha.substring(0, 10).split('-');
        return `${dia}/${mes}/${anio}`;
    };

    const registrarPago = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post(
            `/inscripciones-equipo/${inscripcion.id}/pagos`,
            {
                onSuccess: () => reset('modalidad_pago_id', 'monto'),
            },
        );
    };

    return (
        <>
            <Head title="Pagos de inscripción del equipo" />

            <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-6">
                        <Link
                            href={`/torneos/${inscripcion.torneo_id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            ← Volver al torneo
                        </Link>

                        <h1 className="mt-3 text-3xl font-bold text-gray-900">
                            Pagos de inscripción
                        </h1>

                        <p className="mt-1 text-gray-600">
                            {inscripcion.equipo.nombre} ·{' '}
                            {inscripcion.torneo.nombre}
                        </p>
                    </div>

                    <div className="mb-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">
                                Importe de inscripción
                            </p>
                            <p className="mt-2 text-2xl font-bold text-gray-900">
                                {formatearMonto(inscripcion.monto_inscripcion)}
                            </p>
                        </div>

                        <div className="rounded-xl bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">
                                Total pagado
                            </p>
                            <p className="mt-2 text-2xl font-bold text-green-700">
                                {formatearMonto(totalPagado)}
                            </p>
                        </div>

                        <div className="rounded-xl bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">
                                Saldo pendiente
                            </p>
                            <p className="mt-2 text-2xl font-bold text-orange-600">
                                {formatearMonto(saldoPendiente)}
                            </p>
                        </div>
                    </div>

                    {saldoPendiente > 0 && (
                        <form
                            onSubmit={registrarPago}
                            className="mb-8 rounded-xl bg-white p-5 shadow-sm"
                        >
                            <h2 className="mb-4 text-xl font-semibold text-gray-900">
                                Registrar un pago
                            </h2>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div>
                                    <label
                                        htmlFor="modalidad_pago_id"
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        Modalidad de pago
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
                                        className="w-full rounded-lg border border-gray-300 p-2.5"
                                        required
                                    >
                                        <option value="">
                                            Seleccionar modalidad
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
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        Fecha del pago
                                    </label>

                                    <input
                                        id="fecha_pago"
                                        type="date"
                                        value={data.fecha_pago}
                                        onChange={(e) =>
                                            setData('fecha_pago', e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 p-2.5"
                                        required
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
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        Monto a pagar
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
                                        className="w-full rounded-lg border border-gray-300 p-2.5"
                                        placeholder="0,00"
                                        required
                                    />

                                    {errors.monto && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.monto}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing || modalidadesPago.length === 0}
                                className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? 'Registrando...' : 'Registrar pago'}
                            </button>

                            {modalidadesPago.length === 0 && (
                                <p className="mt-2 text-sm text-orange-700">
                                    No hay modalidades de pago activas.
                                </p>
                            )}
                        </form>
                    )}

                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="border-b border-gray-200 p-5">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Historial de pagos
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="px-4 py-3">Fecha</th>
                                        <th className="px-4 py-3">Monto</th>
                                        <th className="px-4 py-3">Modalidad</th>
                                        <th className="px-4 py-3">Estado</th>
                                        <th className="px-4 py-3">Recibo</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {inscripcion.pagos.map((pago) => (
                                        <tr
                                            key={pago.id}
                                            className="border-t border-gray-100"
                                        >
                                            <td className="px-4 py-3">
                                                {formatearFecha(pago.fecha_pago)}
                                            </td>

                                            <td className="px-4 py-3 font-medium">
                                                {formatearMonto(pago.monto)}
                                            </td>

                                            <td className="px-4 py-3">
                                                {pago.modalidad_pago?.nombre ?? '—'}
                                            </td>

                                            <td className="px-4 py-3">
                                                {pago.estado}
                                            </td>

                                            <td className="px-4 py-3">
                                                {pago.recibo ? (
                                                    `N.º ${pago.recibo.numero}`
                                                ) : (
                                                    'Sin recibo'
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {inscripcion.pagos.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                Todavía no hay pagos registrados.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}