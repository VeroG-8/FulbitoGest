import { Head, Link, useForm } from '@inertiajs/react';

interface Jugador {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
}

interface Carnet {
    id: number;
    jugador_id: number;
    codigo: string;
    fecha_emision: string;
    fecha_vencimiento: string;
    estado: 'activo' | 'vencido' | 'anulado';
}

interface Props {
    carnet: Carnet;
    jugadores: Jugador[];
}

export default function Edit({ carnet, jugadores }: Props) {
    const formatearFechaInput = (fecha: string) => {
        return fecha.substring(0, 10);
    };

    const { data, setData, put, processing, errors } = useForm({
        jugador_id: String(carnet.jugador_id),
        codigo: carnet.codigo,
        fecha_emision: formatearFechaInput(carnet.fecha_emision),
        fecha_vencimiento: formatearFechaInput(
            carnet.fecha_vencimiento
        ),
        estado: carnet.estado,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        put(`/carnets/${carnet.id}`);
    };

    return (
        <>
            <Head title="Editar carnet" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-3xl">

                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-800">
                            Editar carnet
                        </h1>

                        <Link
                            href="/carnets"
                            className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                        >
                            Volver
                        </Link>
                    </div>

                    <form
                        onSubmit={submit}
                        className="rounded-lg bg-white p-6 shadow"
                    >
                        <div className="mb-4">
                            <label className="mb-1 block font-medium text-gray-700">
                                Jugador
                            </label>

                            <select
                                value={data.jugador_id}
                                onChange={(e) =>
                                    setData('jugador_id', e.target.value)
                                }
                                className="w-full rounded border px-3 py-2"
                            >
                                {jugadores.map((jugador) => (
                                    <option
                                        key={jugador.id}
                                        value={jugador.id}
                                    >
                                        {jugador.apellido}, {jugador.nombre} -
                                        DNI {jugador.dni}
                                    </option>
                                ))}
                            </select>

                            {errors.jugador_id && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.jugador_id}
                                </p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="mb-1 block font-medium text-gray-700">
                                Código
                            </label>

                            <input
                                type="text"
                                value={data.codigo}
                                onChange={(e) =>
                                    setData('codigo', e.target.value)
                                }
                                className="w-full rounded border px-3 py-2"
                            />

                            {errors.codigo && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.codigo}
                                </p>
                            )}
                        </div>

                        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block font-medium text-gray-700">
                                    Fecha de emisión
                                </label>

                                <input
                                    type="date"
                                    value={data.fecha_emision}
                                    onChange={(e) =>
                                        setData(
                                            'fecha_emision',
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded border px-3 py-2"
                                />

                                {errors.fecha_emision && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.fecha_emision}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block font-medium text-gray-700">
                                    Fecha de vencimiento
                                </label>

                                <input
                                    type="date"
                                    value={data.fecha_vencimiento}
                                    onChange={(e) =>
                                        setData(
                                            'fecha_vencimiento',
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded border px-3 py-2"
                                />

                                {errors.fecha_vencimiento && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.fecha_vencimiento}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="mb-1 block font-medium text-gray-700">
                                Estado
                            </label>

                            <select
                                value={data.estado}
                                onChange={(e) =>
                                    setData(
                                        'estado',
                                        e.target.value as
                                            | 'activo'
                                            | 'vencido'
                                            | 'anulado'
                                    )
                                }
                                className="w-full rounded border px-3 py-2"
                            >
                                <option value="activo">Activo</option>
                                <option value="vencido">Vencido</option>
                                <option value="anulado">Anulado</option>
                            </select>

                            {errors.estado && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.estado}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing
                                    ? 'Guardando...'
                                    : 'Guardar cambios'}
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </>
    );
}