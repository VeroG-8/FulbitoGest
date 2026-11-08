import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarDays,
    Clock3,
    MapPin,
    UserRound,
    ArrowLeft,
    RotateCcw,
    History,
    AlertCircle,
} from 'lucide-react';

interface Categoria {
    id: number;
    anio: number;
}

interface Profesor {
    id: number;
    nombre: string;
    apellido: string;
}

interface Predio {
    id: number;
    nombre: string;
}

interface Cancha {
    id: number;
    nombre: string;
    predio: Predio | null;
}

interface Horario {
    id: number;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
    categoria: Categoria;
    profesor: Profesor | null;
    cancha: Cancha | null;
}

interface Props {
    horarios: Horario[];
}

const normalizarDia = (dia: string) => {
    return dia.charAt(0).toUpperCase() + dia.slice(1);
};

export default function Historial({ horarios }: Props) {
    const reactivarHorario = (id: number) => {
        if (
            confirm(
                '¿Estás seguro de que deseas reactivar este horario?',
            )
        ) {
            router.put(`/horarios/${id}/reactivar`);
        }
    };

    return (
        <>
            <Head title="Historial de horarios" />

            <div className="space-y-6">

                {/* Encabezado */}
                <div className="overflow-hidden rounded-2xl bg-slate-950 shadow-sm">
                    <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                                <History size={29} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    Historial de horarios
                                </h1>

                                <p className="mt-1 text-sm text-slate-300">
                                    Consulta y recuperación de horarios deshabilitados.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/horarios"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                            <ArrowLeft size={17} />
                            Volver a horarios
                        </Link>
                    </div>
                </div>

                {/* Estadística */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Horarios deshabilitados
                                </p>

                                <p className="mt-2 text-3xl font-bold text-slate-900">
                                    {horarios.length}
                                </p>
                            </div>

                            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                                <Clock3 size={23} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Categorías involucradas
                                </p>

                                <p className="mt-2 text-3xl font-bold text-slate-900">
                                    {
                                        new Set(
                                            horarios.map(
                                                (horario) => horario.categoria?.id,
                                            ),
                                        ).size
                                    }
                                </p>
                            </div>

                            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                                <CalendarDays size={23} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabla */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="font-semibold text-slate-800">
                            Horarios registrados
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Desde aquí podés consultar y reactivar horarios anteriores.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">
                                        Día
                                    </th>

                                    <th className="px-5 py-4 font-semibold">
                                        Horario
                                    </th>

                                    <th className="px-5 py-4 font-semibold">
                                        Categoría
                                    </th>

                                    <th className="px-5 py-4 font-semibold">
                                        Profesor
                                    </th>

                                    <th className="px-5 py-4 font-semibold">
                                        Ubicación
                                    </th>

                                    <th className="px-5 py-4 text-center font-semibold">
                                        Estado
                                    </th>

                                    <th className="px-5 py-4 text-center font-semibold">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {horarios.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-5 py-14 text-center"
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="mb-3 rounded-2xl bg-slate-100 p-4 text-slate-400">
                                                    <History size={30} />
                                                </div>

                                                <p className="font-semibold text-slate-700">
                                                    No hay horarios en el historial
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Los horarios deshabilitados aparecerán aquí.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    horarios.map((horario) => (
                                        <tr
                                            key={horario.id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-700">
                                                {normalizarDia(horario.dia_semana)}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4">
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <Clock3
                                                        size={15}
                                                        className="text-slate-400"
                                                    />

                                                    <span>
                                                        {horario.hora_inicio.substring(0, 5)}
                                                        {' - '}
                                                        {horario.hora_fin.substring(0, 5)}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4">
                                                <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                                    Categoría {horario.categoria?.anio ?? '-'}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                                {horario.profesor ? (
                                                    <div className="flex items-center gap-2">
                                                        <UserRound
                                                            size={15}
                                                            className="text-slate-400"
                                                        />

                                                        {horario.profesor.apellido},{' '}
                                                        {horario.profesor.nombre}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">
                                                        Sin asignar
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-2">
                                                    <MapPin
                                                        size={15}
                                                        className="mt-0.5 shrink-0 text-slate-400"
                                                    />

                                                    <div>
                                                        <p className="font-medium text-slate-700">
                                                            {horario.cancha?.nombre ?? 'Sin cancha'}
                                                        </p>

                                                        <p className="text-xs text-slate-500">
                                                            {horario.cancha?.predio?.nombre ?? 'Sin predio'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-center">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                    Inactivo
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        reactivarHorario(horario.id)
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                                >
                                                    <RotateCcw size={15} />
                                                    Reactivar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {horarios.length > 0 && (
                        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
                            <p className="text-xs text-slate-500">
                                Total: {horarios.length} horario(s) deshabilitado(s).
                            </p>
                        </div>
                    )}
                </div>

                {/* Información */}
                <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <AlertCircle
                        size={19}
                        className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <div>
                        <p className="text-sm font-semibold text-blue-900">
                            Información sobre la reactivación
                        </p>

                        <p className="mt-1 text-sm text-blue-800">
                            Al reactivar un horario, el sistema verificará que
                            la categoría y la cancha sigan disponibles y que
                            no existan conflictos con otros entrenamientos.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}