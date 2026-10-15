import { Head, Link } from '@inertiajs/react';

interface Categoria {
    id: number;
    nombre: string;
    anio: number;
}

interface Tutor {
    id: number;
    nombre: string;
    apellido: string;
    telefono: string | null;
    email: string | null;
}

interface Carnet {
    id: number;
    codigo: string;
    qr_token: string;
    fecha_emision: string;
    fecha_vencimiento: string;
    estado: string;
}

interface Torneo {
    id: number;
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
}

interface Viaje {
    id: number;
    destino: string;
    fecha_salida: string;
    fecha_regreso: string;
}

interface Pase {
    id: number;
    fecha: string;
    estado: string;
}

interface Jugador {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
    nacionalidad: string | null;
    fecha_nacimiento: string;
    telefono: string | null;
    direccion: string | null;
    localidad: string | null;
    estado: boolean;
    categoria: Categoria;
    tutores: Tutor[];
    carnets: Carnet[];
    torneos: Torneo[];
    viajes: Viaje[];
    pases: Pase[];
}

interface Props {
    jugador: Jugador;
}

export default function Show({ jugador }: Props) {
    return (
        <>
            <Head title={`Jugador - ${jugador.nombre} ${jugador.apellido}`} />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-6xl">

                    {/* Encabezado */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-600">
                                Ficha del jugador
                            </h1>

                            <p className="mt-1 text-gray-600">
                                {jugador.apellido}, {jugador.nombre}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Link
                                href="/jugadores"
                                className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                            >
                                Volver
                            </Link>

                            <Link
                                href={`/jugadores/${jugador.id}/edit`}
                                className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                            >
                                Editar
                            </Link>
                        </div>
                    </div>

                    {/* Datos personales */}
                    <div className="mb-6 rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 border-b pb-2 text-xl font-bold text-gray-700">
                            Datos personales
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

                            <div>
                                <p className="text-sm text-gray-500">DNI</p>
                                <p className="font-semibold">{jugador.dni}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Apellido</p>
                                <p className="font-semibold">
                                    {jugador.apellido}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Nombre</p>
                                <p className="font-semibold">
                                    {jugador.nombre}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Nacionalidad
                                </p>
                                <p className="font-semibold">
                                    {jugador.nacionalidad ?? 'No especificada'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Fecha de nacimiento
                                </p>
                                <p className="font-semibold">
                                    {jugador.fecha_nacimiento
                                        ? jugador.fecha_nacimiento.substring(0, 10).split('-').reverse().join('/')
                                        : 'No especificada'
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Categoría
                                </p>
                                <p className="font-semibold">
                                    {jugador.categoria?.nombre} -{' '}
                                    {jugador.categoria?.anio}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Estado
                                </p>

                                <span
                                    className={`inline-block rounded px-3 py-1 text-sm font-semibold ${
                                        jugador.estado
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    {jugador.estado
                                        ? 'Activo'
                                        : 'Deshabilitado'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Contacto */}
                    <div className="mb-6 rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 border-b pb-2 text-xl font-bold text-gray-700">
                            Datos de contacto
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                            <div>
                                <p className="text-sm text-gray-500">
                                    Teléfono
                                </p>
                                <p className="font-semibold">
                                    {jugador.telefono ?? 'No especificado'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Dirección
                                </p>
                                <p className="font-semibold">
                                    {jugador.direccion ?? 'No especificada'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Localidad
                                </p>
                                <p className="font-semibold">
                                    {jugador.localidad ?? 'No especificada'}
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* Tutores */}
                    <div className="mb-6 rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 border-b pb-2 text-xl font-bold text-gray-700">
                            Tutores
                        </h2>

                        {jugador.tutores.length === 0 ? (
                            <p className="text-gray-500">
                                No hay tutores asociados.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border p-2 text-left">
                                                Nombre
                                            </th>
                                            <th className="border p-2 text-left">
                                                Teléfono
                                            </th>
                                            <th className="border p-2 text-left">
                                                Email
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {jugador.tutores.map((tutor) => (
                                            <tr key={tutor.id}>
                                                <td className="border p-2">
                                                    {tutor.apellido},{' '}
                                                    {tutor.nombre}
                                                </td>

                                                <td className="border p-2">
                                                    {tutor.telefono ??
                                                        'No especificado'}
                                                </td>

                                                <td className="border p-2">
                                                    {tutor.email ??
                                                        'No especificado'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Carnets */}
                    <div className="mb-6 rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 border-b pb-2 text-xl font-bold text-gray-700">
                            Carnets
                        </h2>

                        {jugador.carnets.length === 0 ? (
                            <p className="text-gray-500">
                                No hay carnets registrados.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border p-2 text-left">
                                                Código
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
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {jugador.carnets.map((carnet) => (
                                            <tr key={carnet.id}>
                                                <td className="border p-2">
                                                    {carnet.codigo}
                                                </td>

                                                <td className="border p-2">
                                                    {carnet.fecha_emision}
                                                </td>

                                                <td className="border p-2">
                                                    {carnet.fecha_vencimiento}
                                                </td>

                                                <td className="border p-2">
                                                    {carnet.estado}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Torneos */}
                    <div className="mb-6 rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 border-b pb-2 text-xl font-bold text-gray-700">
                            Torneos
                        </h2>

                        {jugador.torneos.length === 0 ? (
                            <p className="text-gray-500">
                                No hay torneos registrados.
                            </p>
                        ) : (
                            <ul className="list-inside list-disc space-y-2">
                                {jugador.torneos.map((torneo) => (
                                    <li key={torneo.id}>
                                        {torneo.nombre}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Viajes */}
                    <div className="mb-6 rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 border-b pb-2 text-xl font-bold text-gray-700">
                            Viajes
                        </h2>

                        {jugador.viajes.length === 0 ? (
                            <p className="text-gray-500">
                                No hay viajes registrados.
                            </p>
                        ) : (
                            <ul className="list-inside list-disc space-y-2">
                                {jugador.viajes.map((viaje) => (
                                    <li key={viaje.id}>
                                        {viaje.destino}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Pases */}
                    <div className="mb-6 rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 border-b pb-2 text-xl font-bold text-gray-700">
                            Pases
                        </h2>

                        {jugador.pases.length === 0 ? (
                            <p className="text-gray-500">
                                No hay pases registrados.
                            </p>
                        ) : (
                            <ul className="list-inside list-disc space-y-2">
                                {jugador.pases.map((pase) => (
                                    <li key={pase.id}>
                                        {pase.fecha} — {pase.estado}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}