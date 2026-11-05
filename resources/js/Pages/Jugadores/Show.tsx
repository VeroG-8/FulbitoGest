import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Pencil,
    UserRound,
    Users,
    Phone,
    Mail,
    MapPin,
    CalendarDays,
    IdCard,
    ShieldCheck,
    UserCheck,
} from 'lucide-react';

interface Categoria {
    id: number;
    nombre: string;
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
    pivot: {
        parentesco: string | null;
        es_tutor_principal: boolean | number;
    };
}

interface Jugador {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
    nacionalidad: string | null;
    fecha_nacimiento: string | null;
    telefono: string | null;
    direccion: string | null;
    localidad: string | null;
    estado: boolean;
    categoria: Categoria | null;
    tutores: Tutor[];
}

interface Props {
    jugador: Jugador;
}

function mostrarDato(valor: string | number | null | undefined): string {
    if (valor === null || valor === undefined || valor === '') {
        return 'No especificado';
    }

    return String(valor);
}

function formatearFecha(fecha: string | null): string {
    if (!fecha) return 'No especificada';

    const partes = fecha.substring(0, 10).split('-');

    if (partes.length !== 3) return fecha;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function Dato({
    etiqueta,
    valor,
    icono,
}: {
    etiqueta: string;
    valor: string | number | null | undefined;
    icono?: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            {icono && (
                <div className="mt-1 text-slate-400">
                    {icono}
                </div>
            )}

            <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {etiqueta}
                </p>

                <p className="mt-1 font-medium text-slate-700">
                    {mostrarDato(valor)}
                </p>
            </div>
        </div>
    );
}

export default function Show({ jugador }: Props) {
    const tutores = jugador.tutores ?? [];

    return (
        <>
            <Head title={`Jugador - ${jugador.nombre} ${jugador.apellido}`} />

            <div className="w-full space-y-6">

                    {/* Encabezado */}
                    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Ficha del jugador
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Información personal y responsables asociados.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Link
                                href="/jugadores"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                            >
                                <ArrowLeft size={17} />
                                Volver
                            </Link>

                            <Link
                                href={`/jugadores/${jugador.id}/edit`}
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                            >
                                <Pencil size={17} />
                                Editar jugador
                            </Link>
                        </div>
                    </div>

                    {/* Identificación del jugador */}
                    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col justify-between gap-4 bg-slate-950 p-6 text-white sm:flex-row sm:items-center">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                                    <UserRound size={30} />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold">
                                        {jugador.nombre} {jugador.apellido}
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-300">
                                        DNI: {jugador.dni}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-slate-200">
                                    {mostrarDato(jugador.categoria?.nombre)}
                                </span>

                                <span
                                    className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                                        jugador.estado
                                            ? 'bg-emerald-400/20 text-emerald-300'
                                            : 'bg-red-400/20 text-red-300'
                                    }`}
                                >
                                    {jugador.estado ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                        </div>

                        {/* Datos personales */}
                        <div className="p-6">
                            <div className="mb-5 flex items-center gap-2">
                                <IdCard className="text-blue-600" size={21} />

                                <h3 className="font-semibold text-slate-800">
                                    Datos personales
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <Dato
                                    etiqueta="Nombre"
                                    valor={jugador.nombre}
                                    icono={<UserRound size={18} />}
                                />

                                <Dato
                                    etiqueta="Apellido"
                                    valor={jugador.apellido}
                                    icono={<UserRound size={18} />}
                                />

                                <Dato
                                    etiqueta="DNI"
                                    valor={jugador.dni}
                                    icono={<IdCard size={18} />}
                                />

                                <Dato
                                    etiqueta="Nacionalidad"
                                    valor={jugador.nacionalidad}
                                />

                                <Dato
                                    etiqueta="Fecha de nacimiento"
                                    valor={formatearFecha(jugador.fecha_nacimiento)}
                                    icono={<CalendarDays size={18} />}
                                />

                                <Dato
                                    etiqueta="Categoría"
                                    valor={jugador.categoria?.nombre}
                                    icono={<ShieldCheck size={18} />}
                                />
                            </div>

                            <div className="my-6 border-t border-slate-100" />

                            <div className="mb-5 flex items-center gap-2">
                                <MapPin className="text-blue-600" size={21} />

                                <h3 className="font-semibold text-slate-800">
                                    Datos de contacto
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <Dato
                                    etiqueta="Teléfono"
                                    valor={jugador.telefono}
                                    icono={<Phone size={18} />}
                                />

                                <Dato
                                    etiqueta="Dirección"
                                    valor={jugador.direccion}
                                    icono={<MapPin size={18} />}
                                />

                                <Dato
                                    etiqueta="Localidad"
                                    valor={jugador.localidad}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tutores asociados */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Users size={23} />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-slate-800">
                                        Tutores asociados
                                    </h3>

                                    <p className="text-sm text-slate-500">
                                        Responsables del jugador.
                                    </p>
                                </div>
                            </div>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                                {tutores.length} {tutores.length === 1 ? 'tutor' : 'tutores'}
                            </span>
                        </div>

                        {tutores.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-2">
                                {tutores.map((tutor) => (
                                    <div
                                        key={tutor.id}
                                        className="rounded-xl border border-slate-200 p-5 transition hover:border-blue-200"
                                    >
                                        <div className="mb-4 flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                                    <UserRound size={22} />
                                                </div>

                                                <div>
                                                    <h4 className="font-semibold text-slate-800">
                                                        {tutor.nombre} {tutor.apellido}
                                                    </h4>

                                                    <p className="text-sm text-slate-500">
                                                        DNI: {mostrarDato(tutor.dni)}
                                                    </p>
                                                </div>
                                            </div>

                                            {Boolean(tutor.pivot?.es_tutor_principal) && (
                                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                    <UserCheck size={14} />
                                                    Principal
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-3 border-t border-slate-100 pt-4">
                                            <Dato
                                                etiqueta="Parentesco"
                                                valor={tutor.pivot?.parentesco}
                                            />

                                            <Dato
                                                etiqueta="Teléfono"
                                                valor={tutor.telefono}
                                                icono={<Phone size={17} />}
                                            />

                                            <Dato
                                                etiqueta="Correo electrónico"
                                                valor={tutor.email}
                                                icono={<Mail size={17} />}
                                            />

                                            <Dato
                                                etiqueta="Dirección"
                                                valor={tutor.direccion}
                                                icono={<MapPin size={17} />}
                                            />

                                            <Dato
                                                etiqueta="Localidad"
                                                valor={tutor.localidad}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 text-center">
                                <Users
                                    size={38}
                                    className="mx-auto mb-3 text-slate-300"
                                />

                                <p className="font-medium text-slate-600">
                                    No hay tutores asociados.
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                    Este jugador todavía no tiene responsables registrados.
                                </p>
                            </div>
                        )}
                    </div>
            </div>
        </>
    );
}