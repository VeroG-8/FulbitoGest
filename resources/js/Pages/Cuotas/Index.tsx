import { Head, Link, useForm, usePage } from '@inertiajs/react';

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

export default function Index({ cuotas }: Props) {

    const page = usePage();

    const { flash } = usePage().props as unknown as {
        flash: {
            success?: string;
        };
    };

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

    const deshabilitar = (id: number) => {
    if (confirm('¿Querés deshabilitar esta cuota?')) {
        destroy(`/cuotas/${id}`);
    }
    };
    const { delete: destroy, processing } = useForm();

    return (
        <>
            <Head title="Cuotas" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-700">
                                Cuotas
                            </h1>

                            <p className="mt-1 text-gray-600">
                                Gestión de cuotas de los jugadores
                            </p>
                        </div>

                        <Link
                            href="/cuotas/create"
                            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                        >
                            Nueva cuota
                        </Link>
                    </div>

                    <div className="overflow-hidden rounded-xl bg-white shadow">
                        {flash.success && (
                            <div className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-green-700">
                                {flash.success}
                            </div>
                        )}
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
                                        Acciones
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
                                            <div className="flex justify-center gap-4">
                                                <Link
                                                    href={`/cuotas/${cuota.id}/edit`}
                                                    className="font-medium text-blue-600 hover:text-blue-800"
                                                >
                                                    Editar
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => deshabilitar(cuota.id)}
                                                    disabled={processing}
                                                    className="font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                                                >
                                                    Deshabilitar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {cuotas.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No hay cuotas activas registradas.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}