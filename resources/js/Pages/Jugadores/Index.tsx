import { Head, Link, router } from '@inertiajs/react';

interface Categoria {
    id: number;
    nombre: string;
    anio: number;
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
}

interface Props {
    jugadores: Jugador[];
}

export default function Index({ jugadores }: Props) {
    return (
        <>
            <Head title="Jugadores" />

            <div className="p-6">
                <div className="mb-8 flex items-center justify-between" >
                    <h1 className="mb-6 text-3xl font-bold text-blue-600">
                        Jugadores
                    </h1>
                    <div className="flex gap-2">
                        <Link
                        href="/jugadores/historial"
                        className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                        >
                             Historial
                        </Link>
                        <Link
                        href="/jugadores/create"
                        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                            Nuevo jugador
                        </Link>
                    </div>
                    
                </div>
                <div className="rounded-lg bg-white p-6 shadow">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2 text-left">DNI</th>
                                <th className="border p-2 text-left">Apellido</th>
                                <th className="border p-2 text-left">Nombre</th>
                                <th className="border p-2 text-left">Categoría</th>
                                <th className="border p-2 text-left">Estado</th>
                                <th className="border p-2 text-left">Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {jugadores.map((jugador) => (
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
                                        {jugador.categoria?.nombre}
                                    </td>

                                    <td className="border p-2">
                                        {jugador.estado ? 'Activo' : 'Inactivo'}
                                    </td>
                                    <td className="border p-2">

                                        <Link
                                            href={`/jugadores/${jugador.id}`}
                                            className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                                        >
                                            Ver
                                        </Link>

                                        <Link
                                            href={`/jugadores/${jugador.id}/edit`}
                                            className="ml-2 rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                                        >
                                            Editar
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (confirm('¿Está seguro de deshabilitar este jugador?')) {
                                                    router.delete(`/jugadores/${jugador.id}`);
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
        </>
    );
}