
import { Head, Link } from '@inertiajs/react';

interface Jugador {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
}

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
    jugadores: Jugador[];
}

interface Props {
    tutor: Tutor;
}

export default function Show({ tutor }: Props) {
    return (
        <>
            <Head title={`Tutor ${tutor.apellido}, ${tutor.nombre}`} />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-4xl">

                    {/* Encabezado */}
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-blue-600">
                            Datos del tutor
                        </h1>

                        <Link
                            href="/tutores"
                            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                        >
                            Volver
                        </Link>
                    </div>

                    {/* Datos personales */}
                    <div className="mb-6 rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-xl font-semibold text-gray-700">
                            Información personal
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-gray-500">DNI</p>
                                <p className="font-medium">{tutor.dni}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Apellido</p>
                                <p className="font-medium">{tutor.apellido}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Nombre</p>
                                <p className="font-medium">{tutor.nombre}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Estado</p>
                                <p className="font-medium">
                                    {tutor.estado ? 'Activo' : 'Deshabilitado'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Datos de contacto */}
                    <div className="mb-6 rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-xl font-semibold text-gray-700">
                            Datos de contacto
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">
                                    {tutor.email ?? 'No especificado'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Teléfono</p>
                                <p className="font-medium">
                                    {tutor.telefono ?? 'No especificado'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Dirección</p>
                                <p className="font-medium">
                                    {tutor.direccion ?? 'No especificada'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Localidad</p>
                                <p className="font-medium">
                                    {tutor.localidad ?? 'No especificada'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Jugadores asociados */}
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-xl font-semibold text-gray-700">
                            Jugadores asociados
                        </h2>

                        {tutor.jugadores.length === 0 ? (
                            <p className="text-gray-500">
                                Este tutor no tiene jugadores asociados.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
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
                                                Acción
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {tutor.jugadores.map((jugador) => (
                                            <tr key={jugador.id}>
                                                <td className="border p-2">
                                                    {jugador.dni}
                                                </td>

                                                <td className="border p-2">
                                                    {jugador.apellido}
                                                </td>

                                                <td className="border p-2">
                                                    {jugador.nombre}
                                                </td>

                                                <td className="border p-2">
                                                    <Link
                                                        href={`/jugadores/${jugador.id}`}
                                                        className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                                                    >
                                                        Ver jugador
                                                    </Link>
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

