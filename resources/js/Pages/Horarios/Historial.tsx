import { Head, Link, router } from '@inertiajs/react';

interface Categoria {
    id: number;
    nombre: string;
    anio: number;
}

interface Horario {
    id: number;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
    lugar: string | null;
    categoria: Categoria;
}

interface Props {
    horarios: Horario[];
}

export default function Historial({ horarios }: Props) {
    return (
        <>
            <Head title="Historial de horarios" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-6xl">

                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-800">
                            Historial de horarios
                        </h1>

                        <Link
                            href="/horarios"
                            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            Volver a horarios
                        </Link>
                    </div>

                    <div className="overflow-x-auto rounded-lg bg-white shadow">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border p-2 text-left">
                                        Día
                                    </th>

                                    <th className="border p-2 text-left">
                                        Hora inicio
                                    </th>

                                    <th className="border p-2 text-left">
                                        Hora fin
                                    </th>

                                    <th className="border p-2 text-left">
                                        Categoría
                                    </th>

                                    <th className="border p-2 text-left">
                                        Lugar
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
                                {horarios.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="border p-6 text-center text-gray-500"
                                        >
                                            No hay horarios deshabilitados.
                                        </td>
                                    </tr>
                                ) : (
                                    horarios.map((horario) => (
                                        <tr key={horario.id}>
                                            <td className="border p-2">
                                                {horario.dia_semana}
                                            </td>

                                            <td className="border p-2">
                                                {horario.hora_inicio.substring(0, 5)}
                                            </td>

                                            <td className="border p-2">
                                                {horario.hora_fin.substring(0, 5)}
                                            </td>

                                            <td className="border p-2">
                                                {horario.categoria.nombre}{' '}
                                                ({horario.categoria.anio})
                                            </td>

                                            <td className="border p-2">
                                                {horario.lugar ?? '-'}
                                            </td>

                                            <td className="border p-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (confirm('¿Está seguro de reactivar este horario?')) {
                                                            router.put(`/horarios/${horario.id}/reactivar`);
                                                        }
                                                    }}
                                                    className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                                                >
                                                    Reactivar
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