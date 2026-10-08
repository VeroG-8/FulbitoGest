import { Head, Link, useForm } from '@inertiajs/react';

interface Categoria {
    id: number;
    nombre: string;
    anio: number;
}

interface Props {
    categorias: Categoria[];
}

export default function Create({ categorias }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        dni: '',
        nombre: '',
        apellido: '',
        nacionalidad: '',
        fecha_nacimiento: '',
        telefono: '',
        direccion: '',
        localidad: '',
        categoria_id: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/jugadores');
    };

    return (
        <>
            <Head title="Nuevo jugador" />

            <div className="p-6">
                <h1 className="mb-6 text-3xl font-bold text-blue-600">
                    Nuevo jugador
                </h1>

                <form
                    onSubmit={submit}
                    className="max-w-2xl space-y-4"
                >
                    {/* DNI */}
                    <div>
                        <label className="mb-1 block font-medium">
                            DNI
                        </label>

                        <input
                            type="text"
                            name="dni"
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
                    <div>
                        <label className="mb-1 block font-medium">
                            Nombre
                        </label>

                        <input
                            type="text"
                            name="nombre"
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
                    <div>
                        <label className="mb-1 block font-medium">
                            Apellido
                        </label>

                        <input
                            type="text"
                            name="apellido"
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

                    {/* Nacionalidad */}
                    <div>
                        <label className="mb-1 block font-medium">
                            Nacionalidad
                        </label>

                        <input
                            type="text"
                            name="nacionalidad"
                            value={data.nacionalidad}
                            onChange={(e) =>
                                setData('nacionalidad', e.target.value)
                            }
                            className="w-full rounded border border-gray-300 px-3 py-2"
                        />

                        {errors.nacionalidad && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.nacionalidad}
                            </p>
                        )}
                    </div>

                    {/* Fecha de nacimiento */}
                    <div>
                        <label className="mb-1 block font-medium">
                            Fecha de nacimiento
                        </label>

                        <input
                            type="date"
                            name="fecha_nacimiento"
                            value={data.fecha_nacimiento}
                            onChange={(e) =>
                                setData(
                                    'fecha_nacimiento',
                                    e.target.value,
                                )
                            }
                            className="w-full rounded border border-gray-300 px-3 py-2"
                        />

                        {errors.fecha_nacimiento && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.fecha_nacimiento}
                            </p>
                        )}
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label className="mb-1 block font-medium">
                            Teléfono
                        </label>

                        <input
                            type="text"
                            name="telefono"
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
                    <div>
                        <label className="mb-1 block font-medium">
                            Dirección
                        </label>

                        <input
                            type="text"
                            name="direccion"
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
                    <div>
                        <label className="mb-1 block font-medium">
                            Localidad
                        </label>

                        <input
                            type="text"
                            name="localidad"
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

                    {/* Categoría */}
                    <div>
                        <label className="mb-1 block font-medium">
                            Categoría
                        </label>

                        <select
                            name="categoria_id"
                            value={data.categoria_id}
                            onChange={(e) =>
                                setData('categoria_id', e.target.value)
                            }
                            className="w-full rounded border border-gray-300 px-3 py-2"
                        >
                            <option value="">
                                Seleccionar categoría
                            </option>

                            {categorias.map((categoria) => (
                                <option
                                    key={categoria.id}
                                    value={categoria.id}
                                >
                                    {categoria.nombre}
                                </option>
                            ))}
                        </select>

                        {errors.categoria_id && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.categoria_id}
                            </p>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing
                                ? 'Guardando...'
                                : 'Guardar jugador'}
                        </button>

                        <Link
                            href="/jugadores"
                            className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                        >
                            Cancelar
                        </Link>
                    </div>
                </form>
            </div>
        </>
    );
}