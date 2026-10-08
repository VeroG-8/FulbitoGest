import { Head, Link, usePage } from '@inertiajs/react';

interface Cuota {
    id: number;
    nombre: string;
    monto: string;
    fecha_vencimiento: string;
}

interface Jugador {
    id: number;
    nombre: string;
    apellido: string;
}

interface Asignacion {
    id: number;
    fecha_asignacion: string;
    fecha_vencimiento: string;
    estado: string;
    cuota: Cuota;
    jugador: Jugador;
}

interface Props {
    asignaciones: Asignacion[];
}

export default function Index({ asignaciones }: Props) {

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

    const { flash } = usePage().props as unknown as {
        flash: {
            success?: string;
        };
    };

    return (
        <>
            <Head title="Asignaciones de cuotas" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-6xl">
                    {flash.success && (
                        <div className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-green-700">
                            {flash.success}
                        </div>
                    )}
                    <div className="mb-6">
                        <Link
                            href="/cuotas"
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            ← Volver a cuotas
                        </Link>

                        <h1 className="mt-3 text-3xl font-bold text-blue-700">
                            Asignaciones de cuotas
                        </h1>

                        <p className="mt-1 text-gray-600">
                            Cuotas asignadas a los jugadores.
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
                                        Monto
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Asignación
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Vencimiento
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Estado
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {asignaciones.map((asignacion) => (
                                    <tr
                                        key={asignacion.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {asignacion.jugador.apellido},{' '}
                                            {asignacion.jugador.nombre}
                                        </td>

                                        <td className="px-4 py-3">
                                            {asignacion.cuota.nombre}
                                        </td>

                                        <td className="px-4 py-3">
                                            {formatearMonto(
                                                asignacion.cuota.monto,
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            {formatearFecha(
                                                asignacion.fecha_asignacion,
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            {formatearFecha(
                                                asignacion.fecha_vencimiento,
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            {asignacion.estado}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {asignaciones.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No hay cuotas asignadas a jugadores.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}