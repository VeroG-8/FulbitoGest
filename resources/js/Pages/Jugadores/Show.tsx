import { Head, Link, useForm } from '@inertiajs/react';
import { useState, type FormEvent, type ReactNode } from 'react';

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
    Plus,
    X,
    Save,
} from 'lucide-react';

interface Categoria {
    id: number;
    anio: number;
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

interface TutorDisponible {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
}

interface Props {
    jugador: Jugador;
    puedeEditar: boolean;
    puedeAsociarTutor: boolean;
    puedeAdministrarTutores: boolean;
    tutoresDisponibles: TutorDisponible[];
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
    icono?: ReactNode;
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

export default function Show({
    jugador,
    puedeEditar,
    puedeAsociarTutor,
    puedeAdministrarTutores,
    tutoresDisponibles,
}: Props) {
    const tutores = jugador.tutores ?? [];

    const [mostrarFormularioTutor, setMostrarFormularioTutor] = useState(false);
    const [tutorEnEdicion, setTutorEnEdicion] = useState<number | null>(null);

    // Formulario para editar un tutor asociado.
    const formEdicionTutor = useForm({
        dni: '',
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        localidad: '',
        parentesco: '',
        es_tutor_principal: false,
    });

    // Formulario para asociar un tutor existente.
    const formTutor = useForm({
        tutor_id: '',
        parentesco: '',
        es_tutor_principal: false,
    });

    const abrirEdicionTutor = (tutor: Tutor) => {
        setTutorEnEdicion(tutor.id);

        formEdicionTutor.setData({
            dni: tutor.dni ?? '',
            nombre: tutor.nombre ?? '',
            apellido: tutor.apellido ?? '',
            email: tutor.email ?? '',
            telefono: tutor.telefono ?? '',
            direccion: tutor.direccion ?? '',
            localidad: tutor.localidad ?? '',
            parentesco: tutor.pivot?.parentesco ?? '',
            es_tutor_principal: Boolean(tutor.pivot?.es_tutor_principal),
        });

        formEdicionTutor.clearErrors();
    };

    const cancelarEdicionTutor = () => {
        setTutorEnEdicion(null);
        formEdicionTutor.reset();
        formEdicionTutor.clearErrors();
    };

    const guardarEdicionTutor = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (tutorEnEdicion === null) return;

        formEdicionTutor.clearErrors();

        if (!formEdicionTutor.data.dni.trim()) {
            formEdicionTutor.setError('dni', 'El DNI es obligatorio.');
            return;
        }

        if (!formEdicionTutor.data.nombre.trim()) {
            formEdicionTutor.setError('nombre', 'El nombre es obligatorio.');
            return;
        }

        if (!formEdicionTutor.data.apellido.trim()) {
            formEdicionTutor.setError('apellido', 'El apellido es obligatorio.');
            return;
        }

        if (!formEdicionTutor.data.parentesco.trim()) {
            formEdicionTutor.setError(
                'parentesco',
                'Debes indicar el parentesco.'
            );
            return;
        }

        if (formEdicionTutor.data.parentesco.trim().length > 50) {
            formEdicionTutor.setError(
                'parentesco',
                'El parentesco no puede superar los 50 caracteres.'
            );
            return;
        }

        formEdicionTutor.transform((data) => ({
            ...data,
            dni: data.dni.trim(),
            nombre: data.nombre.trim(),
            apellido: data.apellido.trim(),
            parentesco: data.parentesco.trim(),
        }));

        formEdicionTutor.put(
            `/jugadores/${jugador.id}/tutores/${tutorEnEdicion}`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    cancelarEdicionTutor();
                },
            }
        );
    };

    const cerrarFormularioTutor = () => {
        setMostrarFormularioTutor(false);
        formTutor.reset();
        formTutor.clearErrors();
    };

    const asociarTutor = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        formTutor.clearErrors();

        if (!formTutor.data.tutor_id) {
            formTutor.setError('tutor_id', 'Debes seleccionar un tutor.');
            return;
        }

        if (!formTutor.data.parentesco.trim()) {
            formTutor.setError('parentesco', 'Debes indicar el parentesco.');
            return;
        }

        if (formTutor.data.parentesco.trim().length > 50) {
            formTutor.setError(
                'parentesco',
                'El parentesco no puede superar los 50 caracteres.'
            );
            return;
        }

        formTutor.transform((data) => ({
            ...data,
            parentesco: data.parentesco.trim(),
        }));

        formTutor.post(`/jugadores/${jugador.id}/tutores`, {
            preserveScroll: true,
            onSuccess: () => {
                cerrarFormularioTutor();
            },
        });
    };

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

                        {puedeEditar && (
                            <Link
                                href={`/jugadores/${jugador.id}/edit`}
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                            >
                                <Pencil size={17} />
                                Editar jugador
                            </Link>
                        )}
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
                                Categoría: {mostrarDato(jugador.categoria?.anio)}
                            </span>

                            <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-slate-200">
                                Estado: {jugador.estado ? 'Activo' : 'Inactivo'}
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
                                valor={jugador.categoria?.anio}
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

                    {/* Encabezado de tutores */}
                    <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
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

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                                {tutores.length} de 2 tutores
                            </span>

                            {puedeAsociarTutor && (
                                <button
                                    type="button"
                                    onClick={() => setMostrarFormularioTutor(true)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                                >
                                    <Plus size={16} />

                                    {tutores.length === 0
                                        ? 'Agregar tutor'
                                        : 'Agregar segundo tutor'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Formulario para asociar tutor */}
                    {puedeAsociarTutor && mostrarFormularioTutor && (
                        <form
                            onSubmit={asociarTutor}
                            noValidate
                            className="border-b border-slate-100 bg-slate-50 p-6"
                        >
                            <div className="mx-auto max-w-2xl">

                                <div className="mb-5 flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-slate-800">
                                            {tutores.length === 0
                                                ? 'Registrar tutor titular'
                                                : 'Registrar segundo tutor'}
                                        </h4>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Completá los datos para asociar un responsable al jugador.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={cerrarFormularioTutor}
                                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {tutoresDisponibles.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                            {/* Seleccionar tutor */}
                                            <div className="sm:col-span-2">
                                                <label
                                                    htmlFor="tutor_id"
                                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                                >
                                                    Tutor <span className="text-red-500">*</span>
                                                </label>

                                                <select
                                                    id="tutor_id"
                                                    required
                                                    value={formTutor.data.tutor_id}
                                                    onChange={(e) => {
                                                        formTutor.setData('tutor_id', e.target.value);
                                                        formTutor.clearErrors('tutor_id');
                                                    }}
                                                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                                >
                                                    <option value="">
                                                        Seleccionar tutor
                                                    </option>

                                                    {tutoresDisponibles.map((tutor) => (
                                                        <option
                                                            key={tutor.id}
                                                            value={tutor.id}
                                                        >
                                                            {tutor.apellido}, {tutor.nombre} - DNI: {tutor.dni}
                                                        </option>
                                                    ))}
                                                </select>

                                                {formTutor.errors.tutor_id && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {formTutor.errors.tutor_id}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Parentesco */}
                                            <div className="sm:col-span-2">
                                                <label
                                                    htmlFor="parentesco"
                                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                                >
                                                    Parentesco <span className="text-red-500">*</span>
                                                </label>

                                                <input
                                                    id="parentesco"
                                                    type="text"
                                                    required
                                                    maxLength={50}
                                                    value={formTutor.data.parentesco}
                                                    onChange={(e) => {
                                                        formTutor.setData('parentesco', e.target.value);
                                                        formTutor.clearErrors('parentesco');
                                                    }}
                                                    placeholder="Ej. Madre, padre, hermano..."
                                                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                                />

                                                <div className="mt-1 flex justify-between">
                                                    {formTutor.errors.parentesco ? (
                                                        <p className="text-sm text-red-600">
                                                            {formTutor.errors.parentesco}
                                                        </p>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">
                                                            Campo obligatorio.
                                                        </span>
                                                    )}

                                                    <span className="text-xs text-slate-400">
                                                        {formTutor.data.parentesco.length}/50
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Condición del segundo tutor */}
                                        {tutores.length === 0 ? (
                                            <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                                                El primer tutor asociado será establecido automáticamente como titular.
                                            </p>
                                        ) : (
                                            <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm text-slate-700">
                                                <input
                                                    type="checkbox"
                                                    checked={formTutor.data.es_tutor_principal}
                                                    onChange={(e) =>
                                                        formTutor.setData(
                                                            'es_tutor_principal',
                                                            e.target.checked
                                                        )
                                                    }
                                                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />

                                                <span>
                                                    Establecer como titular.

                                                    <span className="block text-xs text-slate-500">
                                                        Si no se marca, quedará como suplente.
                                                    </span>
                                                </span>
                                            </label>
                                        )}

                                        {/* Botones */}
                                        <div className="mt-6 flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={cerrarFormularioTutor}
                                                disabled={formTutor.processing}
                                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                                            >
                                                Cancelar
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={formTutor.processing}
                                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Save size={17} />

                                                {formTutor.processing
                                                    ? 'Guardando...'
                                                    : 'Guardar asociación'}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                                        No hay tutores activos disponibles para asociar.
                                        Primero debes registrar un tutor.
                                    </p>
                                )}
                            </div>
                        </form>
                    )}

                    {/* Listado de tutores */}
                    {tutores.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-2">
                            {tutores.map((tutor) => (
                                <div
                                    key={tutor.id}
                                    className="rounded-xl border border-slate-200 p-5 transition hover:border-blue-200"
                                >
                                    {/* Encabezado del tutor */}
                                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
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

                                        <div className="flex flex-wrap items-center gap-2">
                                            {Boolean(tutor.pivot?.es_tutor_principal) ? (
                                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                    <UserCheck size={14} />
                                                    Titular
                                                </span>
                                            ) : (
                                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                                    Suplente
                                                </span>
                                            )}

                                            {puedeAdministrarTutores && (
                                                <button
                                                    type="button"
                                                    onClick={() => abrirEdicionTutor(tutor)}
                                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                >
                                                    <Pencil size={14} />
                                                    Editar
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Datos del tutor */}
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

                                    {/* Formulario para editar tutor */}
                                    {tutorEnEdicion === tutor.id && (
                                        <form
                                            onSubmit={guardarEdicionTutor}
                                            noValidate
                                            className="mt-5 space-y-4 border-t border-slate-100 pt-5"
                                        >
                                            <h5 className="font-semibold text-slate-800">
                                                Editar datos del tutor
                                            </h5>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                {([
                                                    { campo: 'dni', etiqueta: 'DNI', obligatorio: true },
                                                    { campo: 'nombre', etiqueta: 'Nombre', obligatorio: true },
                                                    { campo: 'apellido', etiqueta: 'Apellido', obligatorio: true },
                                                    { campo: 'email', etiqueta: 'Correo electrónico', obligatorio: false },
                                                    { campo: 'telefono', etiqueta: 'Teléfono', obligatorio: false },
                                                    { campo: 'direccion', etiqueta: 'Dirección', obligatorio: false },
                                                    { campo: 'localidad', etiqueta: 'Localidad', obligatorio: false },
                                                    { campo: 'parentesco', etiqueta: 'Parentesco', obligatorio: true },
                                                ] as const).map((campo) => {
                                                    const clave = campo.campo;
                                                    const error = formEdicionTutor.errors[clave];

                                                    return (
                                                        <div key={clave}>
                                                            <label
                                                                htmlFor={`editar-${clave}-${tutor.id}`}
                                                                className="mb-1.5 block text-sm font-medium text-slate-700"
                                                            >
                                                                {campo.etiqueta}
                                                                {campo.obligatorio && (
                                                                    <span className="text-red-500"> *</span>
                                                                )}
                                                            </label>

                                                            <input
                                                                id={`editar-${clave}-${tutor.id}`}
                                                                type={clave === 'email' ? 'email' : 'text'}
                                                                required={campo.obligatorio}
                                                                maxLength={clave === 'parentesco' ? 50 : undefined}
                                                                value={formEdicionTutor.data[clave]}
                                                                onChange={(e) => {
                                                                    formEdicionTutor.setData(clave, e.target.value);
                                                                    formEdicionTutor.clearErrors(clave);
                                                                }}
                                                                className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                                                                    error ? 'border-red-400' : 'border-slate-300'
                                                                }`}
                                                            />

                                                            {error && (
                                                                <p className="mt-1 text-xs text-red-600">
                                                                    {error}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Titular o suplente */}
                                            <div>
                                                <label
                                                    htmlFor={`condicion-${tutor.id}`}
                                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                                >
                                                    Condición del tutor
                                                </label>

                                                <select
                                                    id={`condicion-${tutor.id}`}
                                                    value={String(formEdicionTutor.data.es_tutor_principal)}
                                                    onChange={(e) =>
                                                        formEdicionTutor.setData(
                                                            'es_tutor_principal',
                                                            e.target.value === 'true'
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                >
                                                    <option value="true">Titular</option>
                                                    <option value="false">Suplente</option>
                                                </select>

                                                {formEdicionTutor.errors.es_tutor_principal && (
                                                    <p className="mt-1 text-xs text-red-600">
                                                        {formEdicionTutor.errors.es_tutor_principal}
                                                    </p>
                                                )}

                                                {tutores.length === 1 && (
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Este jugador tiene un solo tutor asociado, por lo que debe conservar la condición de titular.
                                                    </p>
                                                )}

                                                {tutores.length > 1 && (
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Al cambiar la condición, el otro tutor se actualizará automáticamente.
                                                    </p>
                                                )}
                                            </div>

                                            {/* Botones */}
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={cancelarEdicionTutor}
                                                    disabled={formEdicionTutor.processing}
                                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                                >
                                                    Cancelar
                                                </button>

                                                <button
                                                    type="submit"
                                                    disabled={formEdicionTutor.processing}
                                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                                                >
                                                    <Save size={16} />

                                                    {formEdicionTutor.processing
                                                        ? 'Guardando...'
                                                        : 'Guardar cambios'}
                                                </button>
                                            </div>
                                        </form>
                                    )}
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