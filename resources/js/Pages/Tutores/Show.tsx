import { Head, Link } from '@inertiajs/react';

import {
    UserRound,
    ArrowLeft,
    Pencil,
    Users,
    Mail,
    Phone,
    MapPin,
    IdCard,
    Eye,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatusBadge from '@/Components/Shared/StatusBadge';

interface Jugador {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
}

interface Tutor {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
    email: string | null;
    telefono: string | null;
    direccion: string | null;
    localidad: string | null;
    estado: boolean;
    jugadores: Jugador[];
}

interface Props {
    tutor: Tutor;
}

export default function Show({ tutor }: Props) {
    return (
        <>
            <Head title={`Tutor ${tutor.apellido}, ${tutor.nombre}`} />

            <div className="space-y-6">
                {/* Encabezado */}
                <PageHeader
                    title="Datos del tutor"
                    description={`Información personal y jugadores asociados a ${tutor.nombre} ${tutor.apellido}.`}
                    icon={<UserRound size={28} />}
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                href={`/tutores/${tutor.id}/edit`}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                            >
                                <Pencil size={17} />
                                Editar mis datos
                            </Link>

                            <Link
                                href="/tutores"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                            >
                                <ArrowLeft size={17} />
                                Volver
                            </Link>
                        </div>
                    }
                />

                {/* Información personal */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <IdCard size={21} />
                        </div>

                        <div>
                            <h2 className="font-bold text-slate-800">
                                Información personal
                            </h2>

                            <p className="text-xs text-slate-500">
                                Datos de identificación del tutor.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                        <div>
                            <p className="mb-1 text-sm font-medium text-slate-500">
                                DNI
                            </p>
                            <p className="font-semibold text-slate-800">
                                {tutor.dni}
                            </p>
                        </div>

                        <div>
                            <p className="mb-1 text-sm font-medium text-slate-500">
                                Apellido
                            </p>
                            <p className="font-semibold text-slate-800">
                                {tutor.apellido}
                            </p>
                        </div>

                        <div>
                            <p className="mb-1 text-sm font-medium text-slate-500">
                                Nombre
                            </p>
                            <p className="font-semibold text-slate-800">
                                {tutor.nombre}
                            </p>
                        </div>

                        <div>
                            <p className="mb-1 text-sm font-medium text-slate-500">
                                Estado
                            </p>

                            <StatusBadge
                                status={tutor.estado ? 'activo' : 'inactivo'}
                            />
                        </div>
                    </div>
                </section>

                {/* Datos de contacto */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <MapPin size={21} />
                        </div>

                        <div>
                            <h2 className="font-bold text-slate-800">
                                Datos de contacto
                            </h2>

                            <p className="text-xs text-slate-500">
                                Información de contacto y domicilio.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                        <div>
                            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-500">
                                <Mail size={15} />
                                Email
                            </div>

                            <p className="font-semibold text-slate-800">
                                {tutor.email || 'No especificado'}
                            </p>
                        </div>

                        <div>
                            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-500">
                                <Phone size={15} />
                                Teléfono
                            </div>

                            <p className="font-semibold text-slate-800">
                                {tutor.telefono || 'No especificado'}
                            </p>
                        </div>

                        <div>
                            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-500">
                                <MapPin size={15} />
                                Dirección
                            </div>

                            <p className="font-semibold text-slate-800">
                                {tutor.direccion || 'No especificada'}
                            </p>
                        </div>

                        <div>
                            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-500">
                                <MapPin size={15} />
                                Localidad
                            </div>

                            <p className="font-semibold text-slate-800">
                                {tutor.localidad || 'No especificada'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Jugadores asociados */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                <Users size={21} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-800">
                                    Jugadores asociados
                                </h2>

                                <p className="text-xs text-slate-500">
                                    Jugadores vinculados a este tutor.
                                </p>
                            </div>
                        </div>

                        <span className="rounded-full bg-violet-50 px-3 py-1 text-sm font-bold text-violet-700">
                            {tutor.jugadores.length}
                        </span>
                    </div>

                    {tutor.jugadores.length === 0 ? (
                        <div className="p-8 text-center">
                            <Users
                                size={32}
                                className="mx-auto mb-3 text-slate-300"
                            />

                            <p className="font-medium text-slate-600">
                                No hay jugadores asociados.
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                                Los jugadores vinculados al tutor aparecerán aquí.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">
                                            DNI
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Apellido
                                        </th>

                                        <th className="px-6 py-4 font-semibold">
                                            Nombre
                                        </th>

                                        <th className="px-6 py-4 text-center font-semibold">
                                            Acción
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {tutor.jugadores.map((jugador) => (
                                        <tr
                                            key={jugador.id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                {jugador.dni}
                                            </td>

                                            <td className="px-6 py-4 text-slate-700">
                                                {jugador.apellido}
                                            </td>

                                            <td className="px-6 py-4 text-slate-700">
                                                {jugador.nombre}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <Link
                                                    href={`/jugadores/${jugador.id}`}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                                                >
                                                    <Eye size={15} />
                                                    Ver jugador
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}