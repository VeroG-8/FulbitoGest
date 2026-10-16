import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, ShieldCheck } from 'lucide-react';

interface Club {
    id: number;
    nombre: string;
}

interface Categoria {
    id: number;
    nombre: string;
}

interface Equipo {
    id: number;
    nombre: string;
    estado: boolean;
    club: Club;
    categoria: Categoria;
}

interface Props {
    equipo: Equipo;
}

export default function Show({ equipo }: Props) {
    console.log('Datos del equipo:', equipo);
    return (
        <>
            <Head title={`Equipo: ${equipo.nombre}`} />

            <div className="min-h-screen bg-slate-50 px-4 py-10">
                <div className="mx-auto max-w-3xl">
                    <Link
                        href="/equipos"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
                    >
                        <ArrowLeft size={18} />
                        Volver a equipos
                    </Link>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                       <div className="relative overflow-hidden rounded-t-2xl border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-7 sm:px-8">
                            <div className="flex items-center gap-5">
                                {/* Icono */}
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                                    <ShieldCheck
                                        size={32}
                                        strokeWidth={1.8}
                                        className="!text-white"
                                    />
                                </div>

                                {/* Información del equipo */}
                                <div className="min-w-0 flex-1">
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                                        Gestión de equipos
                                    </p>

                                    <h1 className="!m-0 !text-2xl !font-bold !tracking-tight !text-white sm:!text-3xl">
                                        {equipo.nombre}
                                    </h1>

                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                                        <p className="!m-0 !text-sm !text-slate-300">
                                            Detalles del equipo
                                        </p>

                                        <span className="text-slate-500">·</span>

                                        <span className="text-xs font-medium text-slate-400">
                                            ID {equipo.id}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6 p-6 sm:p-8">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Identificador
                                </p>
                                <p className="mt-1 text-base font-semibold text-slate-800">
                                    #{equipo.id}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Club
                                </p>
                                <p className="mt-1 text-base font-semibold text-slate-800">
                                    {equipo.club?.nombre ?? 'Sin club asignado'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Categoría
                                </p>
                                <p className="mt-1 text-base font-semibold text-slate-800">
                                    {equipo.categoria?.nombre ?? 'Sin categoría asignada'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Estado
                                </p>

                                <span
                                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                        equipo.estado
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    {equipo.estado ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                                <Link
                                    href="/equipos"
                                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Volver
                                </Link>

                                <Link
                                    href={`/equipos/${equipo.id}/edit`}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    <Pencil size={17} />
                                    Editar equipo
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}