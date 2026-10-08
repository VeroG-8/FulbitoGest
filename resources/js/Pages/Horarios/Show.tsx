import { Head, Link } from '@inertiajs/react';

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
    horario: Horario;
}

export default function Show({ horario }: Props) {
    return (
        <>
            <Head title="Detalle del horario" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-2xl">

                    <div className="mb-8 flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-blue-600">
                            Detalle del horario
                        </h1>

                        <Link
                            href="/horarios"
                            className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                        >
                            Volver
                        </Link>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">

                        <div className="space-y-4">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Categoría
                                </p>
                                <p className="text-lg text-gray-900">
                                    {horario.categoria.nombre} ({horario.categoria.anio})
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Día
                                </p>
                                <p className="text-lg text-gray-900">
                                    {horario.dia_semana}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Horario
                                </p>
                                <p className="text-lg text-gray-900">
                                    {horario.hora_inicio} - {horario.hora_fin}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Lugar
                                </p>
                                <p className="text-lg text-gray-900">
                                    {horario.lugar ?? 'No especificado'}
                                </p>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}