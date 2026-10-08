import { Head, Link, router } from '@inertiajs/react';

interface Tutor {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
    email: string | null;
    telefono: string | null;
    localidad: string | null;
    estado: boolean;
}

interface Props {
    tutores: Tutor[];
}

export default function Historial({ tutores }: Props) {
    return (
        <>
            <Head title="Historial de tutores" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-700">
                            Historial de tutores
                        </h1>

                        <Link
                            href="/tutores"
                            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            Volver a tutores
                        </Link>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        {tutores.length === 0 ? (
                            <p className="text-gray-500">
                                No hay tutores deshabilitados.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border p-2 text-left">DNI</th>
                                            <th className="border p-2 text-left">Apellido</th>
                                            <th className="border p-2 text-left">Nombre</th>
                                            <th className="border p-2 text-left">Teléfono</th>
                                            <th className="border p-2 text-left">Email</th>
                                            <th className="border p-2 text-left">Localidad</th>
                                            <th className="border p-2 text-left">Estado</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {tutores.map((tutor) => (
                                            <tr key={tutor.id}>
                                                <td className="border p-2">{tutor.dni}</td>
                                                <td className="border p-2">{tutor.apellido}</td>
                                                <td className="border p-2">{tutor.nombre}</td>
                                                <td className="border p-2">
                                                    {tutor.telefono ?? 'No especificado'}
                                                </td>
                                                <td className="border p-2">
                                                    {tutor.email ?? 'No especificado'}
                                                </td>
                                                <td className="border p-2">
                                                    {tutor.localidad ?? 'No especificada'}
                                                </td>
                                                <td className="border p-2">
                                                    <span className="text-red-600">
                                                        Deshabilitado
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (confirm('¿Estás seguro de reactivar este tutor?')) {
                                                                router.put(`/tutores/${tutor.id}/reactivar`);
                                                            }
                                                        }}
                                                        className="ml-2 rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                                                    >
                                                        Reactivar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}