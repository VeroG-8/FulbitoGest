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
    flash?: {
        success?: string;
    };
}

export default function Index({ horarios, flash }: Props) {
    return (
        <>
            <Head title="Horarios" />

            <div className="min-h-screen bg-gray-100 p-6">

                <div className="mx-auto max-w-6xl">

                    <div className="mb-8 flex items-center justify-between">
                        {flash?.success && (
                            <div className="mb-6 rounded bg-green-100 px-4 py-3 text-green-700">
                                {flash.success}
                            </div>
                        )}
                        <h1 className="mb-6 text-3xl font-bold text-blue-600">
                            Horarios
                        </h1>

                        <div className="flex gap-2">
                            <Link
                                href="/horarios/historial"
                                className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                            >
                                Historial
                            </Link>

                            <Link
                                href="/horarios/create"
                                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                                Nuevo horario
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
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
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {horarios.map((horario) => (
                                        <tr key={horario.id}>
                                            <td className="border p-2">
                                                {horario.dia_semana}
                                            </td>

                                            <td className="border p-2">
                                                {horario.hora_inicio}
                                            </td>

                                            <td className="border p-2">
                                                {horario.hora_fin}
                                            </td>

                                            <td className="border p-2">
                                                {horario.categoria.nombre}
                                                {' '}
                                                ({horario.categoria.anio})
                                            </td>

                                            <td className="border p-2">
                                                {horario.lugar ?? 'No especificado'}
                                            </td>
                                            <td className="border p-2">
                                                <Link
                                                    href={`/horarios/${horario.id}`}
                                                    className="ml-2 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-800"
                                                >
                                                    Ver
                                                </Link>
                                                <Link
                                                    href={`/horarios/${horario.id}/edit`}
                                                    className="ml-2 rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                                                >
                                                    Editar
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (confirm('¿Está seguro de deshabilitar este horario?')) {
                                                            router.delete(`/horarios/${horario.id}`);
                                                        }
                                                    }}
                                                    className="ml-2 rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                                                >
                                                    Deshabilitar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}