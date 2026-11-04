import { Head, Link, useForm } from '@inertiajs/react';

interface Cuota {
    id: number;
    nombre: string;
    monto: string;
}

interface Categoria {
    id: number;
    nombre: string;
}

interface Props {
    cuotas: Cuota[];
    categorias: Categoria[];
}

export default function CreateMasivo({ cuotas, categorias }: Props) {
    const fechaActual = () => {
        const fecha = new Date();
        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');

        return `${anio}-${mes}-${dia}`;
    };

    const { data, setData, post, processing, errors } = useForm({
        cuota_id: '',
        categoria_id: '',
        fecha_asignacion: fechaActual(),
        fecha_vencimiento: '',
    });

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        post('/cuotas/asignaciones/masivas');
    };

    return (
        <>
            <Head title="Asignación masiva de cuotas" />

            <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl space-y-6">

                    <div>
                        <Link
                            href="/cuotas/asignaciones"
                            className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                        >
                            ← Volver a asignaciones
                        </Link>

                        <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-blue-700">
                            FulbitoGest
                        </p>

                        <h1 className="mt-1 text-2xl font-bold text-slate-900">
                            Asignación masiva de cuotas
                        </h1>

                        <p className="mt-1 text-sm text-slate-600">
                            Asigná una misma cuota a todos los jugadores activos
                            de una categoría.
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
                            <h2 className="font-semibold text-blue-900">
                                ¿Cómo funciona?
                            </h2>

                            <p className="mt-1 text-sm text-blue-800">
                                Se incluirán todos los jugadores activos de la
                                categoría seleccionada. Los que ya tengan
                                asignada esta cuota serán omitidos para evitar
                                duplicaciones.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">

                            <div>
                                <label
                                    htmlFor="cuota_id"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Cuota *
                                </label>

                                <select
                                    id="cuota_id"
                                    value={data.cuota_id}
                                    onChange={(e) =>
                                        setData('cuota_id', e.target.value)
                                    }
                                    required
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">Seleccionar cuota</option>

                                    {cuotas.map((cuota) => (
                                        <option key={cuota.id} value={cuota.id}>
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
                                <label
                                    htmlFor="categoria_id"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Categoría *
                                </label>

                                <select
                                    id="categoria_id"
                                    value={data.categoria_id}
                                    onChange={(e) =>
                                        setData('categoria_id', e.target.value)
                                    }
                                    required
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
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

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="fecha_asignacion"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Fecha de asignación *
                                    </label>

                                    <input
                                        id="fecha_asignacion"
                                        type="date"
                                        value={data.fecha_asignacion}
                                        onChange={(e) =>
                                            setData(
                                                'fecha_asignacion',
                                                e.target.value,
                                            )
                                        }
                                        required
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />

                                    {errors.fecha_asignacion && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.fecha_asignacion}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="fecha_vencimiento"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Fecha de vencimiento *
                                    </label>

                                    <input
                                        id="fecha_vencimiento"
                                        type="date"
                                        value={data.fecha_vencimiento}
                                        onChange={(e) =>
                                            setData(
                                                'fecha_vencimiento',
                                                e.target.value,
                                            )
                                        }
                                        min={data.fecha_asignacion}
                                        required
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />

                                    {errors.fecha_vencimiento && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.fecha_vencimiento}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-200 pt-5 sm:flex-row">
                                <Link
                                    href="/cuotas/asignaciones"
                                    className="rounded-lg border border-slate-300 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancelar
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing || cuotas.length === 0 || categorias.length === 0}
                                    className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Asignando cuotas...'
                                        : 'Asignar a la categoría'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}