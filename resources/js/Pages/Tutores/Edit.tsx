import { Head, Link, useForm } from '@inertiajs/react';

interface Tutor {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
    email: string | null;
    telefono: string | null;
    direccion: string | null;
    localidad: string | null;
}

interface Props {
    tutor: Tutor;
}

export default function Edit({ tutor }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        dni: tutor.dni ?? '',
        nombre: tutor.nombre ?? '',
        apellido: tutor.apellido ?? '',
        email: tutor.email ?? '',
        telefono: tutor.telefono ?? '',
        direccion: tutor.direccion ?? '',
        localidad: tutor.localidad ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();

        put(`/tutores/${tutor.id}`);
    }

    return (
        <>
            <Head title="Editar tutor" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-3xl">

                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-blue-600">
                            Editar tutor
                        </h1>

                        <Link
                            href={`/tutores/${tutor.id}`}
                            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                        >
                            Volver
                        </Link>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">
                        <form onSubmit={submit}>

                            {/* DNI */}
                            <div className="mb-4">
                                <label className="mb-1 block font-medium text-gray-700">
                                    DNI
                                </label>

                                <input
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
                                <label className="mb-1 block font-medium text-gray-700">
                                    Nombre
                                </label>

                                <input
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
                                <label className="mb-1 block font-medium text-gray-700">
                                    Apellido
                                </label>

                                <input
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
                                <label className="mb-1 block font-medium text-gray-700">
                                    Email
                                </label>

                                <input
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
                                <label className="mb-1 block font-medium text-gray-700">
                                    Teléfono
                                </label>

                                <input
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
                                <label className="mb-1 block font-medium text-gray-700">
                                    Dirección
                                </label>

                                <input
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
                                <label className="mb-1 block font-medium text-gray-700">
                                    Localidad
                                </label>

                                <input
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

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Guardar cambios
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}