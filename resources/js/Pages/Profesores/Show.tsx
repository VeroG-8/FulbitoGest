import { Head, Link } from '@inertiajs/react';
import {
    UserRound,
    ArrowLeft,
    Pencil,
    IdCard,
    Mail,
    Phone,
    MapPin,
    BriefcaseBusiness,
    Users,
    CalendarDays,
    ShieldCheck,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatusBadge from '@/Components/Shared/StatusBadge';

interface Categoria {
    id: number;
    anio: number;
    estado: boolean;
}

interface Profesor {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
    email: string | null;
    telefono: string | null;
    direccion: string | null;
    localidad: string | null;
    especialidad: string | null;
    estado: boolean;
    categorias: Categoria[];
}

interface Props {
    profesor: Profesor;
}

function Dato({
    etiqueta,
    valor,
    icono,
}: {
    etiqueta: string;
    valor: string;
    icono?: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            {icono && (
                <div className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-500">
                    {icono}
                </div>
            )}

            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {etiqueta}
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-slate-700">
                    {valor}
                </p>
            </div>
        </div>
    );
}

export default function Show({ profesor }: Props) {
    return (
        <>
            <Head
                title={`Profesor ${profesor.apellido}, ${profesor.nombre}`}
            />

            <div className="space-y-6">
                {/* Encabezado */}
                <PageHeader
                    title="Datos del profesor"
                    description="Información personal, profesional y categorías asignadas."
                    icon={<UserRound size={28} />}
                    actions={
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href="/profesores"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                            >
                                <ArrowLeft size={17} />
                                Volver
                            </Link>

                            <Link
                                href={`/profesores/${profesor.id}/edit`}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                <Pencil size={17} />
                                Editar
                            </Link>
                        </div>
                    }
                />

                {/* Tarjeta principal */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <UserRound size={32} />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    {profesor.apellido}, {profesor.nombre}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    DNI: {profesor.dni}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    {profesor.especialidad ||
                                        'Especialidad no especificada'}
                                </p>
                            </div>
                        </div>

                        <StatusBadge
                            status={profesor.estado ? 'activo' : 'inactivo'}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-blue-600">
                                <IdCard size={18} />
                                <span className="text-xs font-semibold uppercase tracking-wide">
                                    Identificación
                                </span>
                            </div>
                            <p className="text-lg font-bold text-slate-800">
                                {profesor.dni}
                            </p>
                            <p className="text-xs text-slate-500">
                                Documento nacional
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-emerald-600">
                                <Users size={18} />
                                <span className="text-xs font-semibold uppercase tracking-wide">
                                    Categorías
                                </span>
                            </div>
                            <p className="text-lg font-bold text-slate-800">
                                {profesor.categorias.length}
                            </p>
                            <p className="text-xs text-slate-500">
                                Categorías asignadas
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-violet-600">
                                <ShieldCheck size={18} />
                                <span className="text-xs font-semibold uppercase tracking-wide">
                                    Estado
                                </span>
                            </div>
                            <p className="text-lg font-bold text-slate-800">
                                {profesor.estado ? 'Activo' : 'Inactivo'}
                            </p>
                            <p className="text-xs text-slate-500">
                                Estado del profesor
                            </p>
                        </div>
                    </div>
                </div>

                {/* Información personal */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                            <IdCard size={21} />
                        </div>

                        <div>
                            <h2 className="font-bold text-slate-800">
                                Información personal
                            </h2>
                            <p className="text-sm text-slate-500">
                                Datos de identificación del profesor.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
                        <Dato
                            etiqueta="Nombre"
                            valor={profesor.nombre}
                        />

                        <Dato
                            etiqueta="Apellido"
                            valor={profesor.apellido}
                        />

                        <Dato
                            etiqueta="DNI"
                            valor={profesor.dni}
                        />

                        <Dato
                            etiqueta="Especialidad"
                            valor={
                                profesor.especialidad || 'No especificada'
                            }
                            icono={<BriefcaseBusiness size={17} />}
                        />
                    </div>
                </div>

                {/* Datos de contacto */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                            <Phone size={21} />
                        </div>

                        <div>
                            <h2 className="font-bold text-slate-800">
                                Datos de contacto
                            </h2>
                            <p className="text-sm text-slate-500">
                                Medios de contacto y ubicación.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
                        <Dato
                            etiqueta="Email"
                            valor={profesor.email || 'No especificado'}
                            icono={<Mail size={17} />}
                        />

                        <Dato
                            etiqueta="Teléfono"
                            valor={profesor.telefono || 'No especificado'}
                            icono={<Phone size={17} />}
                        />

                        <Dato
                            etiqueta="Dirección"
                            valor={profesor.direccion || 'No especificada'}
                            icono={<MapPin size={17} />}
                        />

                        <Dato
                            etiqueta="Localidad"
                            valor={profesor.localidad || 'No especificada'}
                            icono={<MapPin size={17} />}
                        />
                    </div>
                </div>

                {/* Categorías asignadas */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                        <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                            <Users size={21} />
                        </div>

                        <div>
                            <h2 className="font-bold text-slate-800">
                                Categorías asignadas
                            </h2>
                            <p className="text-sm text-slate-500">
                                Categorías en las que participa el profesor.
                            </p>
                        </div>
                    </div>

                    {profesor.categorias.length === 0 ? (
                        <div className="p-8 text-center">
                            <Users
                                size={32}
                                className="mx-auto mb-3 text-slate-300"
                            />
                            <p className="font-semibold text-slate-600">
                                Sin categorías asignadas
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                                Este profesor todavía no tiene categorías
                                asociadas.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4">
                                            Categoría
                                        </th>
                                        <th className="px-6 py-4">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {profesor.categorias.map((categoria) => (
                                        <tr
                                            key={categoria.id}
                                            className="transition hover:bg-slate-50"
                                        >
                                           <td className="px-6 py-4 font-semibold text-slate-700">
                                                Categoría {categoria.anio}
                                            </td>

                                            <td className="px-6 py-4">
                                                <StatusBadge
                                                    status={
                                                        categoria.estado
                                                            ? 'activo'
                                                            : 'inactivo'
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}