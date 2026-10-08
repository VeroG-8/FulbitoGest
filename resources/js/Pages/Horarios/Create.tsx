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
        categoria_id: '',
        dia_semana: '',
        hora_inicio: '',
        hora_fin: '',
        lugar: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/horarios');
    };

    return (
        <>
            <Head title="Nuevo horario" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-2xl">

                    <div className="mb-8 flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-blue-600">
                            Nuevo horario
                        </h1>

                        <Link
                            href="/horarios"
                            className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                        >
                            Volver
                        </Link>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">

                        <form onSubmit={submit} className="space-y-5">

                            <div>
                                <label className="mb-1 block font-medium">
                                    Categoría
                                </label>

                                <select
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
                                            {categoria.nombre} ({categoria.anio})
                                        </option>
                                    ))}
                                </select>

                                {errors.categoria_id && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.categoria_id}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block font-medium">
                                    Día de la semana
                                </label>

                                <select
                                    value={data.dia_semana}
                                    onChange={(e) =>
                                        setData('dia_semana', e.target.value)
                                    }
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                >
                                    <option value="">
                                        Seleccionar día
                                    </option>
                                    <option value="Lunes">Lunes</option>
                                    <option value="Martes">Martes</option>
                                    <option value="Miércoles">Miércoles</option>
                                    <option value="Jueves">Jueves</option>
                                    <option value="Viernes">Viernes</option>
                                    <option value="Sábado">Sábado</option>
                                    <option value="Domingo">Domingo</option>
                                </select>

                                {errors.dia_semana && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.dia_semana}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                <div>
                                    <label className="mb-1 block font-medium">
                                        Hora de inicio
                                    </label>

                                    <input
                                        type="time"
                                        value={data.hora_inicio}
                                        onChange={(e) =>
                                            setData('hora_inicio', e.target.value)
                                        }
                                        className="w-full rounded border border-gray-300 px-3 py-2"
                                    />

                                    {errors.hora_inicio && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.hora_inicio}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block font-medium">
                                        Hora de fin
                                    </label>

                                    <input
                                        type="time"
                                        value={data.hora_fin}
                                        onChange={(e) =>
                                            setData('hora_fin', e.target.value)
                                        }
                                        className="w-full rounded border border-gray-300 px-3 py-2"
                                    />

                                    {errors.hora_fin && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.hora_fin}
                                        </p>
                                    )}
                                </div>

                            </div>

                            <div>
                                <label className="mb-1 block font-medium">
                                    Lugar
                                </label>

                                <input
                                    type="text"
                                    value={data.lugar}
                                    onChange={(e) =>
                                        setData('lugar', e.target.value)
                                    }
                                    className="w-full rounded border border-gray-300 px-3 py-2"
                                    placeholder="Ej.: Cancha principal"
                                />

                                {errors.lugar && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.lugar}
                                    </p>
                                )}
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Guardando...' : 'Guardar horario'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}