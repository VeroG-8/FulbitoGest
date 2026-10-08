import { Head, Link, useForm } from '@inertiajs/react';

interface Cuota {
    id: number;
    nombre: string;
    monto: string;
    fecha_vencimiento: string;
}

interface Jugador {
    id: number;
    nombre: string;
    apellido: string;
}

interface Props {
    cuotas: Cuota[];
    jugadores: Jugador[];
}

export default function Create({ cuotas, jugadores }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        cuota_id: '',
        jugador_id: '',
        fecha_asignacion: new Date().toISOString().substring(0, 10),
        fecha_vencimiento: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/cuotas/asignaciones');
    };

    return (
        <>
            <Head title="Asignar cuota" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-2xl">

                    <div className="mb-6">
                        <Link
                            href="/cuotas/asignaciones"
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            ← Volver a asignaciones
                        </Link>

                        <h1 className="mt-3 text-3xl font-bold text-blue-700">
                            Asignar cuota
                        </h1>

                        <p className="mt-1 text-gray-600">
                            Asignar una cuota a un jugador.
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow">
                        <form onSubmit={submit} className="space-y-5">

                            <div>
                                <label className="mb-1 block font-medium text-gray-700">
                                    Cuota
                                </label>

                                <select
                                    value={data.cuota_id}
                                    onChange={(e) =>
                                        setData('cuota_id', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                >
                                    <option value="">
                                        Seleccionar cuota
                                    </option>

                                    {cuotas.map((cuota) => (
                                        <option
                                            key={cuota.id}
                                            value={cuota.id}
                                        >
                                            {cuota.nombre} - $
                                            {cuota.monto}
                                        </option>
                                    ))}
                                </select>

                                {errors.cuota_id && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.cuota_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block font-medium text-gray-700">
                                    Jugador
                                </label>

                                <select
                                    value={data.jugador_id}
                                    onChange={(e) =>
                                        setData('jugador_id', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                >
                                    <option value="">
                                        Seleccionar jugador
                                    </option>

                                    {jugadores.map((jugador) => (
                                        <option
                                            key={jugador.id}
                                            value={jugador.id}
                                        >
                                            {jugador.apellido},{' '}
                                            {jugador.nombre}
                                        </option>
                                    ))}
                                </select>

                                {errors.jugador_id && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.jugador_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block font-medium text-gray-700">
                                    Fecha de asignación
                                </label>

                                <input
                                    type="date"
                                    value={data.fecha_asignacion}
                                    onChange={(e) =>
                                        setData(
                                            'fecha_asignacion',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                />

                                {errors.fecha_asignacion && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.fecha_asignacion}
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
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                                />

                                {errors.fecha_vencimiento && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.fecha_vencimiento}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 border-t pt-5">

                                <Link
                                    href="/cuotas/asignaciones"
                                    className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Guardando...'
                                        : 'Asignar cuota'}
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}