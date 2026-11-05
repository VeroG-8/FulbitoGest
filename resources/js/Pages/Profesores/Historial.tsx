import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    UserRound,
    RotateCcw,
    IdCard,
    Mail,
    Phone,
    BriefcaseBusiness,
    Users,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatCard from '@/Components/Shared/StatCard';

interface Profesor {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
    email: string | null;
    telefono: string | null;
    especialidad: string | null;
}

interface Props {
    profesores: Profesor[];
    flash?: {
        success?: string;
    };
}

export default function Historial({ profesores, flash }: Props) {
    const reactivarProfesor = (profesor: Profesor) => {
        if (
            confirm(
                `¿Está seguro de reactivar al profesor ${profesor.nombre} ${profesor.apellido}?`,
            )
        ) {
            router.put(`/profesores/${profesor.id}/reactivar`);
        }
    };

    return (
        <>
            <Head title="Historial de profesores" />

            <div className="space-y-6">
                <PageHeader
                    title="Historial de profesores"
                    description="Consultá los profesores inactivos y gestioná su reactivación."
                    icon={<UserRound className="h-6 w-6" />}
                    actions={
                        <Link
                            href="/profesores"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver a profesores
                        </Link>
                    }
                />

                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <StatCard
                        title="Profesores inactivos"
                        value={profesores.length}
                        description="Registros disponibles para reactivar"
                        icon={<Users className="h-5 w-5" />}
                        color="amber"
                    />
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Profesores dados de baja
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Listado de profesores que actualmente se
                                encuentran inactivos.
                            </p>
                        </div>

                        <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                            {profesores.length}{' '}
                            {profesores.length === 1
                                ? 'registro'
                                : 'registros'}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                    <th className="px-6 py-4">DNI</th>
                                    <th className="px-6 py-4">Profesor</th>
                                    <th className="px-6 py-4">Contacto</th>
                                    <th className="px-6 py-4">Especialidad</th>
                                    <th className="px-6 py-4 text-center">
                                        Acción
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {profesores.length > 0 ? (
                                    profesores.map((profesor) => (
                                        <tr
                                            key={profesor.id}
                                            className="transition hover:bg-slate-50/80"
                                        >
                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <IdCard className="h-4 w-4 text-slate-400" />
                                                    {profesor.dni}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                                        <UserRound className="h-5 w-5" />
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-slate-800">
                                                            {profesor.apellido},{' '}
                                                            {profesor.nombre}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            Profesor
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                        <span>
                                                            {profesor.email ??
                                                                'Sin email'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                        <span>
                                                            {profesor.telefono ??
                                                                'Sin teléfono'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <BriefcaseBusiness className="h-4 w-4 text-slate-400" />
                                                    {profesor.especialidad ??
                                                        'No especificada'}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        reactivarProfesor(
                                                            profesor,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                                                >
                                                    <RotateCcw className="h-3.5 w-3.5" />
                                                    Reactivar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-14 text-center"
                                        >
                                            <div className="mx-auto flex max-w-sm flex-col items-center">
                                                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                    <Users className="h-7 w-7" />
                                                </div>

                                                <p className="font-semibold text-slate-700">
                                                    No hay profesores
                                                    inactivos
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Cuando un profesor sea dado
                                                    de baja, aparecerá en este
                                                    historial.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}