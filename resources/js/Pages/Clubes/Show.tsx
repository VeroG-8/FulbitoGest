import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil, MapPin, Phone, Mail, Building2 } from 'lucide-react';

interface Club {
    id: number;
    nombre: string;
    localidad: string | null;
    direccion: string | null;
    telefono: string | null;
    email: string | null;
    estado: boolean;
}

interface Props {
    club: Club;
}

export default function Show({ club }: Props) {
    const datos = [
        {
            etiqueta: 'Localidad',
            valor: club.localidad,
            icono: MapPin,
        },
        {
            etiqueta: 'Dirección',
            valor: club.direccion,
            icono: Building2,
        },
        {
            etiqueta: 'Teléfono',
            valor: club.telefono,
            icono: Phone,
        },
        {
            etiqueta: 'Correo electrónico',
            valor: club.email,
            icono: Mail,
        },
    ];

    return (
        <>
            <Head title={`Club: ${club.nombre}`} />

            <div className="min-h-screen bg-slate-50 p-6 md:p-10">
                <div className="mx-auto max-w-4xl">
                    <Link
                        href="/clubes"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
                    >
                        <ArrowLeft size={17} />
                        Volver al listado
                    </Link>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center md:p-8">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Building2 size={28} />
                                </div>

                                <div>
                                    <p className="text-sm text-slate-500">
                                        Información del club
                                    </p>

                                    <h1 className="mt-1 text-2xl font-bold text-slate-800">
                                        {club.nombre}
                                    </h1>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Código: {club.id}
                                    </p>
                                </div>
                            </div>

                            <Link
                                href={`/clubes/${club.id}/edit`}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                <Pencil size={16} />
                                Editar club
                            </Link>
                        </div>

                        <div className="p-6 md:p-8">
                            <h2 className="mb-5 text-lg font-semibold text-slate-800">
                                Datos generales
                            </h2>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {datos.map((dato) => {
                                    const Icono = dato.icono;

                                    return (
                                        <div
                                            key={dato.etiqueta}
                                            className="rounded-xl border border-slate-200 p-5"
                                        >
                                            <div className="mb-3 flex items-center gap-2 text-slate-500">
                                                <Icono size={18} />

                                                <span className="text-sm font-medium">
                                                    {dato.etiqueta}
                                                </span>
                                            </div>

                                            <p className="break-words font-semibold text-slate-800">
                                                {dato.valor || 'No especificado'}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 rounded-xl bg-slate-50 p-5">
                                <p className="text-sm text-slate-500">
                                    Estado del club
                                </p>

                                <span
                                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                        club.estado
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    {club.estado ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}