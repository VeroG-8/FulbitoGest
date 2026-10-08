import { Head, Link } from '@inertiajs/react';

interface Categoria {
    id: number;
    nombre: string;
    anio: number;
    estado: boolean;
}

interface Profesor {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
    email: string | null;
    telefono: string | null;
    direccion: string | null;
    localidad: string | null;
    especialidad: string | null;
    estado: boolean;
    categorias: Categoria[];
}

interface Props {
    profesor: Profesor;
}

export default function Show({ profesor }: Props) {
    return (
        <>
            <Head title={`Profesor ${profesor.apellido}, ${profesor.nombre}`} />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-4xl">

                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-blue-600">
                            Datos del profesor
                        </h1>

                        <Link
                            href="/profesores"
                            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                        >
                            Volver
                        </Link>
                    </div>

                    <div className="mb-6 rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-xl font-semibold text-gray-700">
                            Información personal
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-gray-500">DNI</p>
                                <p className="font-medium">{profesor.dni}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Apellido</p>
                                <p className="font-medium">{profesor.apellido}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Nombre</p>
                                <p className="font-medium">{profesor.nombre}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Especialidad</p>
                                <p className="font-medium">
                                    {profesor.especialidad ?? 'No especificada'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Estado</p>
                                <p className="font-medium">
                                    {profesor.estado ? 'Activo' : 'Deshabilitado'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-xl font-semibold text-gray-700">
                            Datos de contacto
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">
                                    {profesor.email ?? 'No especificado'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Teléfono</p>
                                <p className="font-medium">
                                    {profesor.telefono ?? 'No especificado'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Dirección</p>
                                <p className="font-medium">
                                    {profesor.direccion ?? 'No especificada'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Localidad</p>
                                <p className="font-medium">
                                    {profesor.localidad ?? 'No especificada'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-xl font-semibold text-gray-700">
                            Categorías asignadas
                        </h2>

                        {profesor.categorias.length === 0 ? (
                            <p className="text-gray-500">
                                Este profesor no tiene categorías asignadas.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border p-2 text-left">
                                                Categoría
                                            </th>
                                            <th className="border p-2 text-left">
                                                Año
                                            </th>
                                            <th className="border p-2 text-left">
                                                Estado
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {profesor.categorias.map((categoria) => (
                                            <tr key={categoria.id}>
                                                <td className="border p-2">
                                                    {categoria.nombre}
                                                </td>

                                                <td className="border p-2">
                                                    {categoria.anio}
                                                </td>

                                                <td className="border p-2">
                                                    {categoria.estado
                                                        ? 'Activa'
                                                        : 'Inactiva'}
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