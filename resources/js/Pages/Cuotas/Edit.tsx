import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    GraduationCap,
    Info,
    Receipt,
    Save,
    Wallet,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatusBadge from '@/Components/Shared/StatusBadge';

type TipoCuota =
    | 'cuota_mensual'
    | 'inscripcion_escuelita'
    | 'inscripcion_torneo';

interface Cuota {
    id: number;
    nombre: string;
    descripcion: string | null;
    tipo: TipoCuota;
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

const tipos: {
    valor: TipoCuota;
    nombre: string;
    descripcion: string;
    icono: typeof Receipt;
}[] = [
    {
        valor: 'cuota_mensual',
        nombre: 'Cuota mensual',
        descripcion: 'Pago periódico de la actividad deportiva.',
        icono: CalendarDays,
    },
    {
        valor: 'inscripcion_escuelita',
        nombre: 'Inscripción a la escuelita',
        descripcion: 'Concepto de inscripción anual a la escuelita.',
        icono: GraduationCap,
    },
    {
        valor: 'inscripcion_torneo',
        nombre: 'Inscripción a torneo',
        descripcion: 'Concepto de inscripción a una competencia.',
        icono: Receipt,
    },
];

const inputClass =
    'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

const labelClass = 'mb-2 block text-sm font-semibold text-slate-700';

function ErrorMessage({ message }: { message?: string }) {
    if (!message) return null;

    return (
        <p className="mt-1.5 text-sm font-medium text-red-600">
            {message}
        </p>
    );
}

function formatoMoneda(valor: string | number) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) return '$ 0,00';

    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
    }).format(numero);
}

export default function Edit({ cuota }: Props) {
    const anios = Array.from(
        new Set([
            ...Array.from(
                { length: 7 },
                (_, index) => anioActual - 1 + index,
            ),
            cuota.periodo_anio,
        ].filter((anio): anio is number => anio !== null)),
    ).sort((a, b) => a - b);

    const formatearFechaInput = (fecha: string) =>
        fecha ? fecha.substring(0, 10) : '';

    const { data, setData, put, processing, errors } = useForm({
        nombre: cuota.nombre,
        descripcion: cuota.descripcion ?? '',
        tipo: cuota.tipo,
        monto: cuota.monto,
        periodo_mes: cuota.periodo_mes,
        periodo_anio: cuota.periodo_anio ?? anioActual,
        fecha_vencimiento: formatearFechaInput(
            cuota.fecha_vencimiento,
        ),
        cuenta_corriente: '',
    });
    const tipoSeleccionado = tipos.find(
        (tipo) => tipo.valor === data.tipo,
    );

    const mesSeleccionado = meses.find(
        (mes) => mes.valor === data.periodo_mes,
    );

    const cambiarTipo = (tipo: TipoCuota) => {
        setData((actual) => ({
            ...actual,
            tipo,
            periodo_mes:
                tipo === 'cuota_mensual'
                    ? actual.periodo_mes ?? new Date().getMonth() + 1
                    : null,
        }));
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/cuotas/${cuota.id}`);
    };

    return (
        <>
            <Head title="Editar cuota" />

            <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <PageHeader
                        title="Editar cuota"
                        description="Modificá los datos del concepto de cobro seleccionado."
                        icon={<Receipt size={26} />}
                        actions={
                            <Link
                                href="/cuotas"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                            >
                                <ArrowLeft size={17} />
                                Volver a cuotas
                            </Link>
                        }
                    />

                    <form onSubmit={submit}>
                    <ErrorMessage message={errors.cuenta_corriente} />
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="space-y-6 lg:col-span-2">
                                {/* Tipo de concepto */}
                                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                                            <ClipboardList size={20} />
                                        </div>

                                        <div>
                                            <h2 className="font-bold text-slate-900">
                                                Tipo de concepto
                                            </h2>
                                            <p className="text-sm text-slate-500">
                                                Seleccioná la categoría del
                                                cobro.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        {tipos.map((tipo) => {
                                            const Icono = tipo.icono;
                                            const seleccionado =
                                                data.tipo === tipo.valor;

                                            return (
                                                <button
                                                    key={tipo.valor}
                                                    type="button"
                                                    onClick={() =>
                                                        cambiarTipo(tipo.valor)
                                                    }
                                                    aria-pressed={seleccionado}
                                                    className={`relative rounded-xl border p-4 text-left transition ${
                                                        seleccionado
                                                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/10'
                                                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {seleccionado && (
                                                        <CheckCircle2
                                                            size={18}
                                                            className="absolute right-3 top-3 text-blue-600"
                                                        />
                                                    )}

                                                    <Icono
                                                        size={22}
                                                        className={
                                                            seleccionado
                                                                ? 'mb-3 text-blue-700'
                                                                : 'mb-3 text-slate-400'
                                                        }
                                                    />

                                                    <p
                                                        className={`text-sm font-bold ${
                                                            seleccionado
                                                                ? 'text-blue-900'
                                                                : 'text-slate-800'
                                                        }`}
                                                    >
                                                        {tipo.nombre}
                                                    </p>

                                                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                                        {tipo.descripcion}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <ErrorMessage message={errors.tipo} />
                                </section>

                                {/* Datos del concepto */}
                                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                                            <Receipt size={20} />
                                        </div>

                                        <div>
                                            <h2 className="font-bold text-slate-900">
                                                Datos del concepto
                                            </h2>
                                            <p className="text-sm text-slate-500">
                                                Información general del cobro.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div>
                                            <label
                                                htmlFor="nombre"
                                                className={labelClass}
                                            >
                                                Nombre del concepto
                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                id="nombre"
                                                type="text"
                                                required
                                                maxLength={150}
                                                value={data.nombre}
                                                onChange={(e) =>
                                                    setData(
                                                        'nombre',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Ej. Cuota mensual"
                                                className={inputClass}
                                            />

                                            <ErrorMessage
                                                message={errors.nombre}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="descripcion"
                                                className={labelClass}
                                            >
                                                Descripción
                                            </label>

                                            <textarea
                                                id="descripcion"
                                                maxLength={255}
                                                value={data.descripcion}
                                                onChange={(e) =>
                                                    setData(
                                                        'descripcion',
                                                        e.target.value,
                                                    )
                                                }
                                                rows={3}
                                                placeholder="Agregá información adicional sobre este concepto..."
                                                className={`${inputClass} resize-y`}
                                            />

                                            <ErrorMessage
                                                message={errors.descripcion}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="monto"
                                                className={labelClass}
                                            >
                                                Monto
                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>
                                            </label>

                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                                                    $
                                                </span>

                                                <input
                                                    id="monto"
                                                    type="number"
                                                    required
                                                    step="0.01"
                                                    min="0"
                                                    value={data.monto}
                                                    onChange={(e) =>
                                                        setData(
                                                            'monto',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="0.00"
                                                    className={`${inputClass} pl-9`}
                                                />
                                            </div>

                                            <ErrorMessage
                                                message={errors.monto}
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Período y vencimiento */}
                                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="rounded-xl bg-violet-50 p-2.5 text-violet-700">
                                            <CalendarDays size={20} />
                                        </div>

                                        <div>
                                            <h2 className="font-bold text-slate-900">
                                                Período y vencimiento
                                            </h2>
                                            <p className="text-sm text-slate-500">
                                                Indicá a qué período corresponde
                                                el concepto.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        {data.tipo === 'cuota_mensual' && (
                                            <div>
                                                <label
                                                    htmlFor="periodo_mes"
                                                    className={labelClass}
                                                >
                                                    Mes correspondiente
                                                    <span className="ml-1 text-red-500">
                                                        *
                                                    </span>
                                                </label>

                                                <select
                                                    id="periodo_mes"
                                                    required
                                                    value={
                                                        data.periodo_mes ?? ''
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'periodo_mes',
                                                            e.target.value
                                                                ? Number(
                                                                      e.target
                                                                          .value,
                                                                  )
                                                                : null,
                                                        )
                                                    }
                                                    className={inputClass}
                                                >
                                                    <option value="">
                                                        Seleccionar mes
                                                    </option>

                                                    {meses.map((mes) => (
                                                        <option
                                                            key={mes.valor}
                                                            value={mes.valor}
                                                        >
                                                            {mes.nombre}
                                                        </option>
                                                    ))}
                                                </select>

                                                <ErrorMessage
                                                    message={
                                                        errors.periodo_mes
                                                    }
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label
                                                htmlFor="periodo_anio"
                                                className={labelClass}
                                            >
                                                Año correspondiente
                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>
                                            </label>

                                            <select
                                                id="periodo_anio"
                                                required
                                                value={data.periodo_anio}
                                                onChange={(e) =>
                                                    setData(
                                                        'periodo_anio',
                                                        Number(e.target.value),
                                                    )
                                                }
                                                className={inputClass}
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

                                            <ErrorMessage
                                                message={errors.periodo_anio}
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label
                                                htmlFor="fecha_vencimiento"
                                                className={labelClass}
                                            >
                                                Fecha de vencimiento
                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                id="fecha_vencimiento"
                                                type="date"
                                                required
                                                value={
                                                    data.fecha_vencimiento
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'fecha_vencimiento',
                                                        e.target.value,
                                                    )
                                                }
                                                className={inputClass}
                                            />

                                            <ErrorMessage
                                                message={
                                                    errors.fecha_vencimiento
                                                }
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Resumen */}
                            <aside className="space-y-5">
                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <div className="bg-slate-950 p-5 text-white">
                                        <div className="mb-3 flex items-center gap-2 text-slate-300">
                                            <Wallet size={18} />
                                            <span className="text-xs font-semibold uppercase tracking-wider">
                                                Resumen del concepto
                                            </span>
                                        </div>

                                        <p className="text-3xl font-bold">
                                            {formatoMoneda(data.monto)}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Importe configurado
                                        </p>
                                    </div>

                                    <div className="space-y-4 p-5">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                Nombre
                                            </p>
                                            <p className="mt-1 break-words font-semibold text-slate-800">
                                                {data.nombre || 'Sin nombre'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                                                Tipo
                                            </p>
                                            <StatusBadge
                                                status={
                                                    tipoSeleccionado?.nombre ??
                                                    data.tipo
                                                }
                                            />
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                Período
                                            </p>
                                            <p className="mt-1 font-semibold text-slate-800">
                                                {data.tipo ===
                                                'cuota_mensual'
                                                    ? `${mesSeleccionado?.nombre ?? 'Mes sin seleccionar'} ${data.periodo_anio}`
                                                    : data.periodo_anio}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                Vencimiento
                                            </p>
                                            <p className="mt-1 font-semibold text-slate-800">
                                                {data.fecha_vencimiento
                                                    ? new Date(
                                                          `${data.fecha_vencimiento}T00:00:00`,
                                                      ).toLocaleDateString(
                                                          'es-AR',
                                                      )
                                                    : 'Sin fecha'}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                                    <div className="flex gap-3">
                                        <Info
                                            size={19}
                                            className="mt-0.5 shrink-0 text-blue-700"
                                        />

                                        <div>
                                            <p className="text-sm font-bold text-blue-900">
                                                Importante
                                            </p>
                                            <p className="mt-1 text-xs leading-relaxed text-blue-800">
                                                Los cambios realizados
                                                modificarán los datos de este
                                                concepto. Revisá el importe, el
                                                período y la fecha antes de
                                                guardar.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>

                        {/* Acciones */}
                        <div className="mt-6 flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:justify-end sm:p-5">
                            <Link
                                href="/cuotas"
                                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancelar
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save size={17} />
                                {processing
                                    ? 'Guardando cambios...'
                                    : 'Guardar cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
