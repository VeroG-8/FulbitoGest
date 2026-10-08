import { Head, Link, router } from '@inertiajs/react';

interface Profesor {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
    email: string | null;
    telefono: string | null;
    especialidad: string | null;
}

interface Props {
    profesores: Profesor[];
    flash?: {
        success?: string;
    };
}

export default function Historial({ profesores, flash }: Props) {
    return (
        <>
            <Head title="Historial de profesores" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-6xl">

                    <div className="mb-8 flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-blue-600">
                            Historial de profesores
                        </h1>

                        <Link
                            href="/profesores"
                            className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                        >
                            Volver
                        </Link>
                    </div>

                    {flash?.success && (
                        <div className="mb-6 rounded bg-green-100 px-4 py-3 text-green-700">
                            {flash.success}
                        </div>
                    )}

                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border p-2 text-left">DNI</th>
                                        <th className="border p-2 text-left">Apellido</th>
                                        <th className="border p-2 text-left">Nombre</th>
                                        <th className="border p-2 text-left">Email</th>
                                        <th className="border p-2 text-left">Teléfono</th>
                                        <th className="border p-2 text-left">Especialidad</th>
                                        <th className="border p-2 text-left">Acción</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {profesores.map((profesor) => (
                                        <tr key={profesor.id}>
                                            <td className="border p-2">
                                                {profesor.dni}
                                            </td>

                                            <td className="border p-2">
                                                {profesor.apellido}
                                            </td>

                                            <td className="border p-2">
                                                {profesor.nombre}
                                            </td>

                                            <td className="border p-2">
                                                {profesor.email ?? 'No especificado'}
                                            </td>

                                            <td className="border p-2">
                                                {profesor.telefono ?? 'No especificado'}
                                            </td>

                                            <td className="border p-2">
                                                {profesor.especialidad ?? 'No especificada'}
                                            </td>

                                            <td className="border p-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                '¿Está seguro de reactivar este profesor?'
                                                            )
                                                        ) {
                                                            router.put(
                                                                `/profesores/${profesor.id}/reactivar`
                                                            );
                                                        }
                                                    }}
                                                    className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                                                >
                                                    Reactivar
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