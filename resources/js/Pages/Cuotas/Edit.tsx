import { Head, Link, useForm } from '@inertiajs/react';

interface Cuota {
    id: number;
    nombre: string;
    descripcion: string | null;
    monto: string;
    fecha_vencimiento: string;
}

interface Props {
    cuota: Cuota;
}

export default function Edit({ cuota }: Props) {

    const formatearFechaInput = (fecha: string) => {
    return fecha.substring(0, 10);
    };

    const { data, setData, put, processing, errors } = useForm({
        nombre: cuota.nombre,
        descripcion: cuota.descripcion ?? '',
        monto: cuota.monto,
        fecha_vencimiento: formatearFechaInput(cuota.fecha_vencimiento),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        put(`/cuotas/${cuota.id}`);
    };

    return (
        <>
            <Head title="Editar cuota" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-2xl">

                    <div className="mb-6">
                        <Link
                            href="/cuotas"
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            ← Volver a cuotas
                        </Link>

                        <h1 className="mt-3 text-3xl font-bold text-blue-700">
                            Editar cuota
                        </h1>

                        <p className="mt-1 text-gray-600">
                            Modificar los datos de la cuota.
                        </p>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow">
                        <form onSubmit={submit} className="space-y-5">

                            <div>
                                <label className="mb-1 block font-medium text-gray-700">
                                    Nombre
                                </label>

                                <input
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) =>
                                        setData('nombre', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                />

                                {errors.nombre && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.nombre}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block font-medium text-gray-700">
                                    Descripción
                                </label>

                                <textarea
                                    value={data.descripcion}
                                    onChange={(e) =>
                                        setData('descripcion', e.target.value)
                                    }
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                />

                                {errors.descripcion && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.descripcion}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block font-medium text-gray-700">
                                    Monto
                                </label>

                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.monto}
                                    onChange={(e) =>
                                        setData('monto', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                />

                                {errors.monto && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.monto}
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
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                                />

                                {errors.fecha_vencimiento && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.fecha_vencimiento}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 border-t pt-5">

                                <Link
                                    href="/cuotas"
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
                                        : 'Guardar cambios'}
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}