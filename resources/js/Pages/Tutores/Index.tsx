import { Head, Link, router } from '@inertiajs/react';

interface Tutor {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
    email: string | null;
    telefono: string | null;
    direccion: string | null;
    localidad: string | null;
    estado: boolean;
}

interface Props {
    tutores: Tutor[];
    flash?: {
        success?: string;
    };
}

interface PageProps {
    flash: {
        success?: string;
    };
}

export default function Index({ tutores, flash }: Props) {

    
    return (
        <>
            <Head title="Tutores" />

            <div className="p-6">
                {flash?.success && (
                <div className="mb-4 rounded bg-green-100 p-4 text-green-800">
                    {flash.success}
                </div>
                )}
               <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-blue-600">
                        Tutores
                    </h1>

                    <div className="flex gap-2">
                        <Link
                            href="/tutores/historial"
                            className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                        >
                            Historial
                        </Link>

                        <Link
                            href="/tutores/create"
                            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            Nuevo tutor
                        </Link>
                    </div>
                </div>

                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2 text-left">
                                DNI
                            </th>

                            <th className="border p-2 text-left">
                                Apellido
                            </th>

                            <th className="border p-2 text-left">
                                Nombre
                            </th>

                            <th className="border p-2 text-left">
                                Teléfono
                            </th>

                            <th className="border p-2 text-left">
                                Email
                            </th>

                            <th className="border p-2 text-left">
                                Localidad
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
                        {tutores.map((tutor) => (
                            <tr key={tutor.id}>
                                <td className="border p-2">
                                    {tutor.dni}
                                </td>

                                <td className="border p-2">
                                    {tutor.apellido}
                                </td>

                                <td className="border p-2">
                                    {tutor.nombre}
                                </td>

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
                                    {tutor.estado
                                        ? 'Activo'
                                        : 'Deshabilitado'}
                                </td>

                                <td className="border p-2">
                                    <Link
                                        href={`/tutores/${tutor.id}`}
                                        className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                                    >
                                        Ver
                                    </Link>

                                    <Link
                                        href={`/tutores/${tutor.id}/edit`}
                                        className="ml-2 rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm('¿Estás seguro de deshabilitar este tutor?')) {
                                                router.delete(`/tutores/${tutor.id}`);
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
        </>
    );
}