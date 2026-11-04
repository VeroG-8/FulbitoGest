import { Head, Link, useForm } from '@inertiajs/react';

interface Cuota {
    id: number;
    nombre: string;
    descripcion: string | null;
    tipo: 'cuota_mensual' | 'inscripcion_torneo';
    monto: string;
    periodo_mes: number | null;
    periodo_anio: number | null;
    fecha_vencimiento: string;
}

interface Props {
    cuota: Cuota;
}

const meses = [
    { valor: 1, nombre: 'Enero' },
    { valor: 2, nombre: 'Febrero' },
    { valor: 3, nombre: 'Marzo' },
    { valor: 4, nombre: 'Abril' },
    { valor: 5, nombre: 'Mayo' },
    { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' },
    { valor: 8, nombre: 'Agosto' },
    { valor: 9, nombre: 'Septiembre' },
    { valor: 10, nombre: 'Octubre' },
    { valor: 11, nombre: 'Noviembre' },
    { valor: 12, nombre: 'Diciembre' },
];

const anioActual = new Date().getFullYear();

const anios = Array.from(
    { length: 7 },
    (_, index) => anioActual - 1 + index,
);

export default function Edit({ cuota }: Props) {
    const formatearFechaInput = (fecha: string) => {
        return fecha.substring(0, 10);
    };

    const { data, setData, put, processing, errors } = useForm({
        nombre: cuota.nombre,
        descripcion: cuota.descripcion ?? '',
        tipo: cuota.tipo,
        monto: cuota.monto,
        periodo_mes: cuota.periodo_mes ?? new Date().getMonth() + 1,
        periodo_anio: cuota.periodo_anio ?? anioActual,
        fecha_vencimiento: formatearFechaInput(cuota.fecha_vencimiento),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/cuotas/${cuota.id}`);
    };

    return (
        <>
            <Head title="Editar cuota" />

            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-2xl">
                    <div className="mb-6">
                        <Link
                            href="/cuotas"
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            ← Volver a cuotas
                        </Link>

                        <h1 className="mt-3 text-3xl font-bold text-slate-900">
                            Editar cuota
                        </h1>

                        <p className="mt-1 text-slate-500">
                            Modificar los datos del concepto de cobro.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <form onSubmit={submit} className="space-y-5">

                            {/* Tipo de concepto */}
                            <div>
                                <label className="mb-1 block font-medium text-slate-700">
                                    Tipo de concepto
                                </label>

                                <select
                                    value={data.tipo}
                                    onChange={(e) =>
                                        setData(
                                            'tipo',
                                            e.target.value as
                                                | 'cuota_mensual'
                                                | 'inscripcion_torneo',
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="cuota_mensual">
                                        Cuota mensual
                                    </option>
                                    <option value="inscripcion_torneo">
                                        Inscripción
                                    </option>
                                </select>

                                {errors.tipo && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.tipo}
                                    </p>
                                )}
                            </div>

                            {/* Nombre */}
                            <div>
                                <label className="mb-1 block font-medium text-slate-700">
                                    Nombre
                                </label>

                                <input
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) =>
                                        setData('nombre', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                                />

                                {errors.nombre && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.nombre}
                                    </p>
                                )}
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="mb-1 block font-medium text-slate-700">
                                    Descripción
                                </label>

                                <textarea
                                    value={data.descripcion}
                                    onChange={(e) =>
                                        setData('descripcion', e.target.value)
                                    }
                                    rows={3}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                                />

                                {errors.descripcion && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.descripcion}
                                    </p>
                                )}
                            </div>

                            {/* Monto */}
                            <div>
                                <label className="mb-1 block font-medium text-slate-700">
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
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                                />

                                {errors.monto && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.monto}
                                    </p>
                                )}
                            </div>

                            {/* Período */}
                            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                                <h3 className="mb-1 font-semibold text-slate-800">
                                    Período del concepto
                                </h3>

                                <p className="mb-4 text-sm text-slate-500">
                                    Mes y año al que corresponde este cobro,
                                    independientemente de su fecha de
                                    vencimiento.
                                </p>

                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block font-medium text-slate-700">
                                            Mes correspondiente
                                        </label>

                                        <select
                                            value={data.periodo_mes}
                                            onChange={(e) =>
                                                setData(
                                                    'periodo_mes',
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                                        >
                                            {meses.map((mes) => (
                                                <option
                                                    key={mes.valor}
                                                    value={mes.valor}
                                                >
                                                    {mes.nombre}
                                                </option>
                                            ))}
                                        </select>

                                        {errors.periodo_mes && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.periodo_mes}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1 block font-medium text-slate-700">
                                            Año correspondiente
                                        </label>

                                        <select
                                            value={data.periodo_anio}
                                            onChange={(e) =>
                                                setData(
                                                    'periodo_anio',
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                                        >
                                            {anios.map((anio) => (
                                                <option
                                                    key={anio}
                                                    value={anio}
                                                >
                                                    {anio}
                                                </option>
                                            ))}
                                        </select>

                                        {errors.periodo_anio && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.periodo_anio}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Fecha de vencimiento */}
                            <div>
                                <label className="mb-1 block font-medium text-slate-700">
                                    Fecha de vencimiento
                                </label>

                                <input
                                    type="date"
                                    value={data.fecha_vencimiento}
                                    onChange={(e) =>
                                        setData(
                                            'fecha_vencimiento',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none"
                                />

                                {errors.fecha_vencimiento && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.fecha_vencimiento}
                                    </p>
                                )}
                            </div>

                            {/* Botones */}
                            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                                <Link
                                    href="/cuotas"
                                    className="rounded-lg border border-slate-300 px-5 py-2.5 text-slate-700 hover:bg-slate-50"
                                >
                                    Cancelar
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-slate-950 px-5 py-2.5 font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
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