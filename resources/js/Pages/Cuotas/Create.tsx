import { Head, Link, useForm } from '@inertiajs/react';

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

const tipos = [
    { valor: 'cuota_mensual', nombre: 'Cuota mensual' },
    { valor: 'inscripcion_escuelita', nombre: 'Inscripción a la escuelita' },
    { valor: 'inscripcion_torneo', nombre: 'Inscripción a torneo' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        descripcion: '',
        tipo: 'cuota_mensual',
        monto: '',
        periodo_mes: new Date().getMonth() + 1,
        periodo_anio: anioActual,
        fecha_vencimiento: '',
    });

    const esCuotaMensual = data.tipo === 'cuota_mensual';

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/cuotas');
    };

    return (
        <>
            <Head title="Nueva cuota" />

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
                            Nueva cuota
                        </h1>

                        <p className="mt-1 text-slate-500">
                            Registrar un nuevo concepto de cobro.
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
                                        setData('tipo', e.target.value)
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                >
                                    {tipos.map((tipo) => (
                                        <option
                                            key={tipo.valor}
                                            value={tipo.valor}
                                        >
                                            {tipo.nombre}
                                        </option>
                                    ))}
                                </select>

                                {errors.tipo && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.tipo}
                                    </p>
                                )}

                                <p className="mt-1 text-sm text-slate-500">
                                    Seleccioná el concepto al que corresponde
                                    este cobro.
                                </p>
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
                                    placeholder={
                                        data.tipo === 'cuota_mensual'
                                            ? 'Ej. Cuota Noviembre 2026'
                                            : data.tipo === 'inscripcion_escuelita'
                                              ? 'Ej. Inscripción anual 2026'
                                              : 'Ej. Inscripción Copa Salta 2026'
                                    }
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
                                    placeholder="Detalle del concepto de cobro..."
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
                                    placeholder="30000"
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
                                    {esCuotaMensual
                                        ? 'Indicá el mes y año al que corresponde esta cuota.'
                                        : 'Indicá el año al que corresponde esta inscripción.'}
                                </p>

                                <div
                                    className={`grid grid-cols-1 gap-5 ${
                                        esCuotaMensual
                                            ? 'sm:grid-cols-2'
                                            : 'sm:grid-cols-1'
                                    }`}
                                >
                                    {esCuotaMensual && (
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
                                    )}

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
                                        : 'Guardar concepto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}