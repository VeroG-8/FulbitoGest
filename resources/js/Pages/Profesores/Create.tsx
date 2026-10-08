import { Head, Link, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        dni: '',
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        localidad: '',
        especialidad: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();

        post('/profesores');
    }

    return (
        <>
            <Head title="Nuevo profesor" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-blue-600">
                            Nuevo profesor
                        </h1>

                        <Link
                            href="/profesores"
                            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                        >
                            Cancelar
                        </Link>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <form onSubmit={submit} className="space-y-4">

                            <div>
                                <label className="mb-1 block font-medium">
                                    DNI
                                </label>
                                <input
                                    type="text"
                                    value={data.dni}
                                    onChange={(e) =>
                                        setData('dni', e.target.value)
                                    }
                                    className="w-full rounded border border-gray-300 p-2"
                                />
                                {errors.dni && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.dni}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block font-medium">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) =>
                                        setData('nombre', e.target.value)
                                    }
                                    className="w-full rounded border border-gray-300 p-2"
                                />
                                {errors.nombre && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.nombre}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block font-medium">
                                    Apellido
                                </label>
                                <input
                                    type="text"
                                    value={data.apellido}
                                    onChange={(e) =>
                                        setData('apellido', e.target.value)
                                    }
                                    className="w-full rounded border border-gray-300 p-2"
                                />
                                {errors.apellido && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.apellido}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block font-medium">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="w-full rounded border border-gray-300 p-2"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block font-medium">
                                    Teléfono
                                </label>
                                <input
                                    type="text"
                                    value={data.telefono}
                                    onChange={(e) =>
                                        setData('telefono', e.target.value)
                                    }
                                    className="w-full rounded border border-gray-300 p-2"
                                />
                                {errors.telefono && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.telefono}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block font-medium">
                                    Dirección
                                </label>
                                <input
                                    type="text"
                                    value={data.direccion}
                                    onChange={(e) =>
                                        setData('direccion', e.target.value)
                                    }
                                    className="w-full rounded border border-gray-300 p-2"
                                />
                                {errors.direccion && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.direccion}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block font-medium">
                                    Localidad
                                </label>
                                <input
                                    type="text"
                                    value={data.localidad}
                                    onChange={(e) =>
                                        setData('localidad', e.target.value)
                                    }
                                    className="w-full rounded border border-gray-300 p-2"
                                />
                                {errors.localidad && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.localidad}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block font-medium">
                                    Especialidad
                                </label>
                                <input
                                    type="text"
                                    value={data.especialidad}
                                    onChange={(e) =>
                                        setData('especialidad', e.target.value)
                                    }
                                    className="w-full rounded border border-gray-300 p-2"
                                />
                                {errors.especialidad && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.especialidad}
                                    </p>
                                )}
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Guardando...'
                                        : 'Guardar profesor'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}