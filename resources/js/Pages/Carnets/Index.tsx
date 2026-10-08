import { Head, Link, router } from '@inertiajs/react';

interface Jugador {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
}

interface Carnet {
    id: number;
    codigo: string;
    qr_token: string;
    fecha_emision: string;
    fecha_vencimiento: string;
    estado: 'activo' | 'vencido' | 'anulado';
    jugador: Jugador;
}

interface Props {
    carnets: Carnet[];
    flash?: {
        success?: string;
    };
}

export default function Index({ carnets, flash }: Props) {
    const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR');
    };
    return (
        <>
            <Head title="Carnets" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-7xl">

                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-800">
                            Carnets
                        </h1>

                        <Link
                            href="/carnets/create"
                            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            Nuevo carnet
                        </Link>
                    </div>

                    {flash?.success && (
                        <div className="mb-6 rounded bg-green-100 px-4 py-3 text-green-700">
                            {flash.success}
                        </div>
                    )}

                    <div className="overflow-x-auto rounded-lg bg-white shadow">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border p-2 text-left">
                                        Código
                                    </th>

                                    <th className="border p-2 text-left">
                                        Jugador
                                    </th>

                                    <th className="border p-2 text-left">
                                        DNI
                                    </th>

                                    <th className="border p-2 text-left">
                                        Emisión
                                    </th>

                                    <th className="border p-2 text-left">
                                        Vencimiento
                                    </th>

                                    <th className="border p-2 text-left">
                                        Estado
                                    </th>

                                    <th className="border p-2 text-left">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {carnets.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="border p-6 text-center text-gray-500"
                                        >
                                            No hay carnets registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    carnets.map((carnet) => (
                                        <tr key={carnet.id}>
                                            <td className="border p-2">
                                                {carnet.codigo}
                                            </td>

                                            <td className="border p-2">
                                                {carnet.jugador.apellido},{' '}
                                                {carnet.jugador.nombre}
                                            </td>

                                            <td className="border p-2">
                                                {carnet.jugador.dni}
                                            </td>

                                            <td className="border p-2">
                                                {formatearFecha(carnet.fecha_emision)}
                                            </td>

                                            <td className="border p-2">
                                                {formatearFecha(carnet.fecha_vencimiento)}
                                            </td>

                                            <td className="border p-2">
                                                <span
                                                    className={`rounded px-2 py-1 text-sm ${
                                                        carnet.estado === 'activo'
                                                            ? 'bg-green-100 text-green-700'
                                                            : carnet.estado === 'vencido'
                                                              ? 'bg-yellow-100 text-yellow-700'
                                                              : 'bg-red-100 text-red-700'
                                                    }`}
                                                >
                                                    {carnet.estado}
                                                </span>
                                            </td>

                                            <td className="border p-2">
                                                <Link
                                                    href={`/carnets/${carnet.id}`}
                                                    className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                                                >
                                                    Ver
                                                </Link>

                                                <Link
                                                    href={`/carnets/${carnet.id}/edit`}
                                                    className="ml-2 rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                                                >
                                                    Editar
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                '¿Está seguro de anular este carnet?'
                                                            )
                                                        ) {
                                                            router.delete(
                                                                `/carnets/${carnet.id}`
                                                            );
                                                        }
                                                    }}
                                                    className="ml-2 rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                                                >
                                                    Anular
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </>
    );
}