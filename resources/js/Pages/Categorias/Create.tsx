import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Layers, Save } from 'lucide-react';
import PageHeader from '@/Components/Shared/PageHeader';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        anio: new Date().getFullYear(),
    });

    const guardarCategoria = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/categorias');
    };

    return (
        <>
            <Head title="Nueva categoría | FulbitoGest" />

            <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
                <div className="mx-auto max-w-4xl space-y-6">

                    <PageHeader
                        title="Nueva categoría"
                        description="Registrá un nuevo año para la escuela deportiva."
                        icon={<Layers className="h-7 w-7" />}
                    />

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-200 px-6 py-5">
                            <h2 className="text-lg font-bold text-slate-900">
                                Datos de la categoría
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Completá el año correspondiente para crear la categoría.
                            </p>
                        </div>

                        <form onSubmit={guardarCategoria}>
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
                                        placeholder="Ej. 2015"
                                        required
                                    />

                                    {errors.anio && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {errors.anio}
                                        </p>
                                    )}

                                    <p className="mt-2 text-xs text-slate-500">
                                        El año debe estar comprendido entre 1900 y 2100.
                                        No puede existir otra categoría con el mismo año,
                                        aunque esté inactiva.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                                    <p className="text-sm leading-relaxed text-blue-800">
                                        La categoría se registrará como activa y estará
                                        disponible para asociar jugadores, profesores,
                                        equipos y horarios.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">

                                <Link
                                    href="/categorias"
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
                                    {processing ? 'Guardando...' : 'Guardar categoría'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}