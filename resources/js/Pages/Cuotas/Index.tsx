import { Head, Link, useForm, usePage } from '@inertiajs/react';

interface Cuota {
    id: number;
    nombre: string;
    descripcion: string | null;
    tipo: 'cuota_mensual' | 'inscripcion_torneo';
    monto: string;
    periodo_mes: number | null;
    periodo_anio: number | null;
    fecha_vencimiento: string;
    estado: boolean;
}

interface Props {
    cuotas: Cuota[];
}

const nombresMeses = [
    '',
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
];

export default function Index({ cuotas }: Props) {
    const { flash } = usePage().props as unknown as {
        flash: {
            success?: string;
        };
    };

    const { delete: destroy, processing } = useForm();

    const formatearFecha = (fecha: string) => {
        const [anio, mes, dia] = fecha.substring(0, 10).split('-');
        return `${dia}/${mes}/${anio}`;
    };

    const formatearMonto = (monto: string) => {
        return Number(monto).toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
        });
    };

    const formatearPeriodo = (cuota: Cuota) => {
        if (!cuota.periodo_mes || !cuota.periodo_anio) {
            return 'Sin período';
        }

        return `${nombresMeses[cuota.periodo_mes]} ${cuota.periodo_anio}`;
    };

    const deshabilitar = (id: number) => {
        if (confirm('¿Querés deshabilitar esta cuota?')) {
            destroy(`/cuotas/${id}`);
        }
    };

    return (
        <>
            <Head title="Cuotas" />

            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-7xl">

                    {/* Encabezado */}
                    <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-slate-950 p-6 text-white sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Gestión de cuotas
                            </h1>
                            <p className="mt-1 text-sm text-slate-300">
                                Administración de cuotas mensuales e inscripciones a torneos.
                            </p>
                        </div>

                        <Link
                            href="/cuotas/create"
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                            + Nueva cuota
                        </Link>
                    </div>

                    {/* Mensaje de éxito */}
                    {flash.success && (
                        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                            {flash.success}
                        </div>
                    )}

                    {/* Resumen */}
                    <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Total de cuotas
                            </p>
                            <p className="mt-1 text-2xl font-bold text-slate-900">
                                {cuotas.length}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Cuotas mensuales
                            </p>
                            <p className="mt-1 text-2xl font-bold text-blue-700">
                                {cuotas.filter(c => c.tipo === 'cuota_mensual').length}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Inscripciones a torneos
                            </p>
                            <p className="mt-1 text-2xl font-bold text-violet-700">
                                {cuotas.filter(c => c.tipo === 'inscripcion_torneo').length}
                            </p>
                        </div>
                    </div>

                    {/* Listado */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h2 className="font-semibold text-slate-900">
                                Cuotas registradas
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Consultá los conceptos, períodos e importes.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                                    <tr>
                                        <th className="px-4 py-4 text-left">Nombre</th>
                                        <th className="px-4 py-4 text-left">Tipo</th>
                                        <th className="px-4 py-4 text-left">Período</th>
                                        <th className="px-4 py-4 text-left">Descripción</th>
                                        <th className="px-4 py-4 text-left">Monto</th>
                                        <th className="px-4 py-4 text-left">Vencimiento</th>
                                        <th className="px-4 py-4 text-center">Acciones</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {cuotas.map((cuota) => (
                                        <tr
                                            key={cuota.id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-800">
                                                {cuota.nombre}
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-4">
                                                {cuota.tipo === 'inscripcion_torneo' ? (
                                                    <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                                                        Inscripción
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                                        Cuota mensual
                                                    </span>
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-4">
                                                {cuota.periodo_mes && cuota.periodo_anio ? (
                                                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                                        {formatearPeriodo(cuota)}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">
                                                        Sin período
                                                    </span>
                                                )}
                                            </td>

                                            <td className="max-w-xs px-4 py-4 text-slate-600">
                                                {cuota.descripcion || '-'}
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-800">
                                                {formatearMonto(cuota.monto)}
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                                                {formatearFecha(cuota.fecha_vencimiento)}
                                            </td>

                                            <td className="whitespace-nowrap px-4 py-4">
                                                <div className="flex justify-center gap-3">
                                                    <Link
                                                        href={`/cuotas/${cuota.id}/edit`}
                                                        className="font-semibold text-blue-600 hover:text-blue-800"
                                                    >
                                                        Editar
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() => deshabilitar(cuota.id)}
                                                        disabled={processing}
                                                        className="font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                                                    >
                                                        Deshabilitar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {cuotas.length === 0 && (
                            <div className="p-10 text-center">
                                <p className="font-medium text-slate-700">
                                    No hay cuotas activas registradas.
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Podés comenzar registrando una nueva cuota.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}