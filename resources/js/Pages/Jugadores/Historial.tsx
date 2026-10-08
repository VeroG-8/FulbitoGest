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

export default function Historial({ jugadores }: Props) {
    return (
        <>
            <Head title="Historial de jugadores" />

            <div className="p-6">
                <h1 className="mb-6 text-3xl font-bold text-blue-600">
                    Historial de jugadores
                </h1>

                <Link
                    href="/jugadores"
                    className="mb-6 inline-block rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                >
                    Volver a jugadores
                </Link>

                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2 text-left">DNI</th>
                            <th className="border p-2 text-left">
                                Apellido
                            </th>
                            <th className="border p-2 text-left">
                                Nombre
                            </th>
                            <th className="border p-2 text-left">
                                Categoría
                            </th>
                            <th className="border p-2 text-left">
                                Estado
                            </th>
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
                                    {jugador.estado
                                        ? 'Activo'
                                        : 'Deshabilitado'}
                                </td>
                                <td className="border bg-gray-50 p-2">
                                   <button
                                        type="button"
                                        onClick={() => {
                                            if (confirm('¿Está seguro de reactivar este jugador?')) {
                                                router.put(`/jugadores/${jugador.id}/reactivar`);
                                            }
                                        }}
                                        style={{
                                            backgroundColor: 'green',
                                            color: 'white',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            fontWeight: 'bold',
                                            border: 'none',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Reactivar
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