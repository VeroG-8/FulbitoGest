import { Head, Link, useForm } from '@inertiajs/react';
import PageHeader from '@/Components/Shared/PageHeader';
import {
    ArrowLeft,
    CalendarDays,
    Check,
    Info,
    Layers,
    Receipt,
    Users,
} from 'lucide-react';

interface Cuota {
    id: number;
    nombre: string;
    monto: string;
}

interface Categoria {
    id: number;
    anio: number;
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

    const formularioDeshabilitado =
        processing || cuotas.length === 0 || categorias.length === 0;

    const inputClass =
        'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

    return (
        <>
            <Head title="Asignación masiva de cuotas" />

            <div className="space-y-6">
                <PageHeader
                    title="Asignación masiva de cuotas"
                    description="Asigná una misma cuota a todos los jugadores activos de una categoría."
                    icon={<Users className="h-6 w-6" />}
                    actions={
                        <Link
                            href="/cuotas/asignaciones"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver
                        </Link>
                    }
                />

                <div className="mx-auto max-w-4xl space-y-6">
                    {/* Información */}
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                                <Info className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="font-semibold text-blue-900">
                                    ¿Cómo funciona la asignación masiva?
                                </h2>

                                <p className="mt-1 text-sm leading-relaxed text-blue-800">
                                    Se asignará la cuota seleccionada a todos
                                    los jugadores activos de la categoría
                                    elegida. Los jugadores que ya tengan esa
                                    cuota asignada serán omitidos para evitar
                                    duplicaciones.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Formulario */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                                    <Layers className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Datos de la asignación
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Completá los datos para realizar la
                                        asignación.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-6 p-6">
                            {/* Selección de cuota y categoría */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="cuota_id"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Cuota <span className="text-red-500">*</span>
                                    </label>

                                    <div className="relative">
                                        <Receipt className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <select
                                            id="cuota_id"
                                            value={data.cuota_id}
                                            onChange={(e) =>
                                                setData('cuota_id', e.target.value)
                                            }
                                            required
                                            className={`${inputClass} pl-10`}
                                        >
                                            <option value="">
                                                Seleccionar cuota
                                            </option>

                                            {cuotas.map((cuota) => (
                                                <option
                                                    key={cuota.id}
                                                    value={cuota.id}
                                                >
                                                    {cuota.nombre} - ${cuota.monto}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {errors.cuota_id && (
                                        <p className="mt-1.5 text-sm text-red-600">
                                            {errors.cuota_id}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="categoria_id"
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        Categoría <span className="text-red-500">*</span>
                                    </label>

                                    <div className="relative">
                                        <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <select
                                            id="categoria_id"
                                            value={data.categoria_id}
                                            onChange={(e) =>
                                                setData('categoria_id', e.target.value)
                                            }
                                            required
                                            className={`${inputClass} pl-10`}
                                        >
                                            <option value="">
                                                Seleccionar categoría
                                            </option>

                                            {categorias.map((categoria) => (
                                                <option
                                                    key={categoria.id}
                                                    value={categoria.id}
                                                >
                                                    {categoria.anio}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {errors.categoria_id && (
                                        <p className="mt-1.5 text-sm text-red-600">
                                            {errors.categoria_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Fechas */}
                            <div className="border-t border-slate-200 pt-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5 text-slate-500" />
                                    <h3 className="font-semibold text-slate-800">
                                        Fechas de la asignación
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="fecha_asignacion"
                                            className="mb-2 block text-sm font-medium text-slate-700"
                                        >
                                            Fecha de asignación{' '}
                                            <span className="text-red-500">*</span>
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
                                            className={inputClass}
                                        />

                                        {errors.fecha_asignacion && (
                                            <p className="mt-1.5 text-sm text-red-600">
                                                {errors.fecha_asignacion}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="fecha_vencimiento"
                                            className="mb-2 block text-sm font-medium text-slate-700"
                                        >
                                            Fecha de vencimiento{' '}
                                            <span className="text-red-500">*</span>
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
                                            className={inputClass}
                                        />

                                        {errors.fecha_vencimiento && (
                                            <p className="mt-1.5 text-sm text-red-600">
                                                {errors.fecha_vencimiento}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sin datos disponibles */}
                            {(cuotas.length === 0 || categorias.length === 0) && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                    <p className="text-sm font-medium text-amber-800">
                                        {cuotas.length === 0 && categorias.length === 0
                                            ? 'No hay cuotas ni categorías activas disponibles.'
                                            : cuotas.length === 0
                                                ? 'No hay cuotas activas disponibles para asignar.'
                                                : 'No hay categorías activas disponibles.'}
                                    </p>
                                </div>
                            )}

                            {/* Acciones */}
                            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                                <Link
                                    href="/cuotas/asignaciones"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Cancelar
                                </Link>

                                <button
                                    type="submit"
                                    disabled={formularioDeshabilitado}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Check className="h-4 w-4" />
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
