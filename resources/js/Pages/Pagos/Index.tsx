import { Head, Link } from '@inertiajs/react';

interface Cuota {
    id: number;
    nombre: string;
    monto: string;
}

interface Jugador {
    id: number;
    nombre: string;
    apellido: string;
}

interface CuotaXJugador {
    id: number;
    cuota: Cuota;
    jugador: Jugador;
}

interface ModalidadPago {
    id: number;
    nombre: string;
}

interface Pago {
    id: number;
    fecha_pago: string;
    monto: string;
    comprobante: string | null;
    estado: string;
    cuota_x_jugador: CuotaXJugador;
    modalidad_pago: ModalidadPago;
}

interface Props {
    pagos: Pago[];
}

export default function Index({ pagos }: Props) {
    const formatearFecha = (fecha: string) => {
        const [anio, mes, dia] = fecha.substring(0, 10).split('-');

        return `${dia}/${mes}/${anio}`;
    };

    const formatearMonto = (monto: string) => {
        return Number(monto).toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
        });
    };

    return (
        <>
            <Head title="Pagos" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-6xl">

                    <div className="mb-6">
                        <Link
                            href="/cuotas"
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            ← Volver a cuotas
                        </Link>

                        <h1 className="mt-3 text-3xl font-bold text-blue-700">
                            Pagos
                        </h1>

                        <p className="mt-1 text-gray-600">
                            Pagos registrados de los jugadores.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-xl bg-white shadow">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        Jugador
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Cuota
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Fecha
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Monto
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Modalidad
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Estado
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {pagos.map((pago) => (
                                    <tr
                                        key={pago.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {pago.cuota_x_jugador.jugador.apellido},{' '}
                                            {pago.cuota_x_jugador.jugador.nombre}
                                        </td>

                                        <td className="px-4 py-3">
                                            {pago.cuota_x_jugador.cuota.nombre}
                                        </td>

                                        <td className="px-4 py-3">
                                            {formatearFecha(pago.fecha_pago)}
                                        </td>

                                        <td className="px-4 py-3">
                                            {formatearMonto(pago.monto)}
                                        </td>

                                        <td className="px-4 py-3">
                                            {pago.modalidad_pago.nombre}
                                        </td>

                                        <td className="px-4 py-3">
                                            {pago.estado}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {pagos.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No hay pagos registrados.
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}