import { Head, Link, useForm } from '@inertiajs/react';

interface Cuota {
    id: number;
    nombre: string;
    descripcion: string | null;
    monto: string;
    fecha_vencimiento: string;
    estado: boolean;
}

interface Props {
    cuotas: Cuota[];
}

export default function Historial({ cuotas }: Props) {
    const { put, processing } = useForm();

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

    const reactivar = (id: number) => {
        if (confirm('¿Querés reactivar esta cuota?')) {
            put(`/cuotas/${id}/reactivar`);
        }
    };

    return (
        <>
            <Head title="Historial de cuotas" />

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
                            Historial de cuotas
                        </h1>

                        <p className="mt-1 text-gray-600">
                            Cuotas que fueron deshabilitadas.
                        </p>
                    </div>

                    <div className="overflow-hidden rounded-xl bg-white shadow">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        Nombre
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Descripción
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Monto
                                    </th>

                                    <th className="px-4 py-3 text-left">
                                        Vencimiento
                                    </th>

                                    <th className="px-4 py-3 text-center">
                                        Acción
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {cuotas.map((cuota) => (
                                    <tr
                                        key={cuota.id}
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {cuota.nombre}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {cuota.descripcion || '-'}
                                        </td>

                                        <td className="px-4 py-3">
                                            {formatearMonto(cuota.monto)}
                                        </td>

                                        <td className="px-4 py-3">
                                            {formatearFecha(
                                                cuota.fecha_vencimiento,
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    reactivar(cuota.id)
                                                }
                                                disabled={processing}
                                                className="font-medium text-green-600 hover:text-green-800 disabled:opacity-50"
                                            >
                                                Reactivar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {cuotas.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No hay cuotas deshabilitadas.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}