import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Layers, Save } from 'lucide-react';
import PageHeader from '@/Components/Shared/PageHeader';

interface Categoria {
    id: number;
    anio: number;
    estado: boolean;
}

interface Props {
    categoria: Categoria;
}

export default function Edit({ categoria }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        anio: categoria.anio,
    });

    const actualizarCategoria = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(`/categorias/${categoria.id}`);
    };

    return (
        <>
            <Head title="Editar categoría | FulbitoGest" />

            <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
                <div className="mx-auto max-w-4xl space-y-6">

                    <PageHeader
                        title="Editar categoría"
                        description={`Modificá los datos de la categoría ${categoria.anio}.`}
                        icon={<Layers className="h-7 w-7" />}
                    />

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-200 px-6 py-5">
                            <h2 className="text-lg font-bold text-slate-900">
                                Datos de la categoría
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Actualizá el año de la categoría seleccionada.
                            </p>
                        </div>

                        <form onSubmit={actualizarCategoria}>
                            <div className="space-y-6 p-6">

                                <div className="max-w-sm">
                                    <label
                                        htmlFor="anio"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Año de la categoría
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <input
                                        id="anio"
                                        type="number"
                                        min="1900"
                                        max="2100"
                                        value={data.anio}
                                        onChange={(e) =>
                                            setData('anio', Number(e.target.value))
                                        }
                                        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${
                                            errors.anio
                                                ? 'border-red-400'
                                                : 'border-slate-300'
                                        }`}
                                        required
                                    />

                                    {errors.anio && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {errors.anio}
                                        </p>
                                    )}

                                    <p className="mt-2 text-xs text-slate-500">
                                        El año debe estar comprendido entre 1900 y 2100.
                                        No puede coincidir con otra categoría, incluso si
                                        está inactiva.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                                    <p className="text-sm leading-relaxed text-amber-800">
                                        Los cambios se aplicarán a la categoría existente.
                                        Los jugadores, profesores, equipos y horarios
                                        asociados conservarán su relación.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">

                                <Link
                                    href={`/categorias/${categoria.id}`}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                    <ArrowLeft size={17} />
                                    Cancelar
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Save size={17} />
                                    {processing ? 'Actualizando...' : 'Guardar cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}