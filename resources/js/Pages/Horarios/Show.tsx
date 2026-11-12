import { Head, Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    Clock3,
    MapPin,
    Users,
    UserRound,
    ArrowLeft,
    Pencil,
    Info,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';

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
    horario: Horario;
}

function capitalizar(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function Show({ horario }: Props) {
    const { auth } = usePage<any>().props;

    const esAdministrador = ['admin', 'superadmin'].includes(
        auth?.user?.rol,
    );

    const dia = capitalizar(
        horario.dia_semana
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''),
    );

    return (
        <>
            <Head title="Detalle del horario" />

            <PageHeader
                title="Detalle del horario"
                description="Información del entrenamiento y sus asignaciones."
                icon={<CalendarDays size={28} />}
                actions={
                    <div className="flex items-center gap-2">
                        {esAdministrador && (
                            <Link
                                href={`/horarios/${horario.id}/edit`}
                                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                            >
                                <Pencil size={17} />
                                Editar
                            </Link>
                        )}

                        <Link
                            href="/horarios"
                            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                        >
                            <ArrowLeft size={17} />
                            Volver
                        </Link>
                    </div>
                }
            />

            <div className="mx-auto max-w-5xl space-y-6">

                {/* Información general */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <CalendarDays size={20} />
                        </div>

                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Información del entrenamiento
                            </h2>
                            <p className="text-sm text-slate-500">
                                Datos generales del horario asignado.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6 p-6 sm:grid-cols-2">
                        <div>
                            <p className="mb-2 text-sm font-medium text-slate-500">
                                Categoría
                            </p>

                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Users size={20} />
                                </div>

                                <div>
                                    <p className="font-semibold text-slate-900">
                                        Categoría {horario.categoria?.anio ?? '-'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Categoría asignada
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium text-slate-500">
                                Profesor responsable
                            </p>

                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <UserRound size={20} />
                                </div>

                                <div>
                                    <p className="font-semibold text-slate-900">
                                        {horario.profesor
                                            ? `${horario.profesor.apellido}, ${horario.profesor.nombre}`
                                            : 'Sin profesor asignado'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Profesor de la categoría
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Día y horario */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <Clock3 size={20} />
                        </div>

                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Día y horario
                            </h2>
                            <p className="text-sm text-slate-500">
                                Información de la jornada de entrenamiento.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6 p-6 sm:grid-cols-2">
                        <div>
                            <p className="mb-2 text-sm font-medium text-slate-500">
                                Día de la semana
                            </p>
                            <p className="text-lg font-semibold text-slate-800">
                                {dia}
                            </p>
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium text-slate-500">
                                Horario
                            </p>

                            <div className="flex items-center gap-2">
                                <Clock3 size={18} className="text-blue-600" />

                                <p className="text-lg font-semibold text-slate-800">
                                    {horario.hora_inicio.slice(0, 5)} -{' '}
                                    {horario.hora_fin.slice(0, 5)}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Ubicación */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <MapPin size={20} />
                        </div>

                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Ubicación del entrenamiento
                            </h2>
                            <p className="text-sm text-slate-500">
                                Predio y cancha donde se realiza la actividad.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-6 p-6 sm:grid-cols-2">
                        <div>
                            <p className="mb-2 text-sm font-medium text-slate-500">
                                Predio
                            </p>

                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <MapPin size={19} />
                                </div>

                                <p className="font-semibold text-slate-900">
                                    {horario.cancha?.predio?.nombre ?? 'No especificado'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 text-sm font-medium text-slate-500">
                                Cancha
                            </p>

                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <MapPin size={19} />
                                </div>

                                <p className="font-semibold text-slate-900">
                                    {horario.cancha?.nombre ?? 'No especificada'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Información adicional */}
                <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
                    <Info
                        size={20}
                        className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <p className="text-sm leading-relaxed text-blue-800">
                        El profesor responsable se obtiene automáticamente
                        según la categoría asignada al horario.
                    </p>
                </div>
            </div>
        </>
    );
}