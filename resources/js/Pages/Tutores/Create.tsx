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
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();

        post('/tutores', {
            onError: (errors) => {
                console.log('ERRORES DE VALIDACIÓN:', errors);
    },
});
    }

    return (
        <>
            <Head title="Nuevo tutor" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-3xl">

                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-blue-600">
                            Nuevo tutor
                        </h1>

                        <Link
                            href="/tutores"
                            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                        >
                            Volver
                        </Link>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">

                        <form onSubmit={submit}>

                            {/* DNI */}
                            <div className="mb-4">
                                <label
                                    htmlFor="dni"
                                    className="mb-1 block font-semibold text-gray-700"
                                >
                                    DNI
                                </label>

                                <input
                                    id="dni"
                                    type="text"
                                    value={data.dni}
                                    onChange={(e) =>
                                        setData('dni', e.target.value)
                                    }
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                />

                                {errors.dni && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.dni}
                                    </p>
                                )}
                            </div>

                            {/* Nombre */}
                            <div className="mb-4">
                                <label
                                    htmlFor="nombre"
                                    className="mb-1 block font-semibold text-gray-700"
                                >
                                    Nombre
                                </label>

                                <input
                                    id="nombre"
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) =>
                                        setData('nombre', e.target.value)
                                    }
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                />

                                {errors.nombre && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.nombre}
                                    </p>
                                )}
                            </div>

                            {/* Apellido */}
                            <div className="mb-4">
                                <label
                                    htmlFor="apellido"
                                    className="mb-1 block font-semibold text-gray-700"
                                >
                                    Apellido
                                </label>

                                <input
                                    id="apellido"
                                    type="text"
                                    value={data.apellido}
                                    onChange={(e) =>
                                        setData('apellido', e.target.value)
                                    }
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                />

                                {errors.apellido && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.apellido}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="mb-4">
                                <label
                                    htmlFor="email"
                                    className="mb-1 block font-semibold text-gray-700"
                                >
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                />

                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Teléfono */}
                            <div className="mb-4">
                                <label
                                    htmlFor="telefono"
                                    className="mb-1 block font-semibold text-gray-700"
                                >
                                    Teléfono
                                </label>

                                <input
                                    id="telefono"
                                    type="text"
                                    value={data.telefono}
                                    onChange={(e) =>
                                        setData('telefono', e.target.value)
                                    }
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                />

                                {errors.telefono && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.telefono}
                                    </p>
                                )}
                            </div>

                            {/* Dirección */}
                            <div className="mb-4">
                                <label
                                    htmlFor="direccion"
                                    className="mb-1 block font-semibold text-gray-700"
                                >
                                    Dirección
                                </label>

                                <input
                                    id="direccion"
                                    type="text"
                                    value={data.direccion}
                                    onChange={(e) =>
                                        setData('direccion', e.target.value)
                                    }
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                />

                                {errors.direccion && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.direccion}
                                    </p>
                                )}
                            </div>

                            {/* Localidad */}
                            <div className="mb-6">
                                <label
                                    htmlFor="localidad"
                                    className="mb-1 block font-semibold text-gray-700"
                                >
                                    Localidad
                                </label>

                                <input
                                    id="localidad"
                                    type="text"
                                    value={data.localidad}
                                    onChange={(e) =>
                                        setData('localidad', e.target.value)
                                    }
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                />

                                {errors.localidad && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.localidad}
                                    </p>
                                )}
                            </div>

                            {/* Botón */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Guardando...'
                                        : 'Guardar tutor'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}