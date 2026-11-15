import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import {
    UserRound,
    ArrowLeft,
    IdCard,
    MapPin,
    Save,
    Users,
    UserRoundCheck,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';

interface Jugador {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
    pivot: {
        parentesco: string;
        es_tutor_principal: boolean | number;
    };
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
    jugadores: Jugador[];
}

interface Props {
    tutor: Tutor;
    puedeAdministrarRelaciones: boolean;
}

const inputStyles =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

interface CampoProps {
    id: string;
    label: string;
    value: string;
    error?: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    onChange: (value: string) => void;
}

function Campo({
    id,
    label,
    value,
    error,
    type = 'text',
    placeholder,
    required = false,
    onChange,
}: CampoProps) {
    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
                {required && <span className="text-red-500"> *</span>}
            </label>

            <input
                id={id}
                type={type}
                value={value}
                required={required}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className={`${inputStyles} ${
                    error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''
                }`}
            />

            {error && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

export default function Edit({
    tutor,
    puedeAdministrarRelaciones,
}: Props) {
    const { data, setData, put, processing, errors } = useForm({
        dni: tutor.dni ?? '',
        nombre: tutor.nombre ?? '',
        apellido: tutor.apellido ?? '',
        email: tutor.email ?? '',
        telefono: tutor.telefono ?? '',
        direccion: tutor.direccion ?? '',
        localidad: tutor.localidad ?? '',
        relaciones: (tutor.jugadores ?? []).map((jugador) => ({
            jugador_id: jugador.id,
            parentesco: jugador.pivot?.parentesco ?? '',
        })),
    });

    const actualizarParentesco = (jugadorId: number, parentesco: string) => {
        setData(
            'relaciones',
            data.relaciones.map((relacion) =>
                relacion.jugador_id === jugadorId
                    ? { ...relacion, parentesco }
                    : relacion
            )
        );
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();

        put(`/tutores/${tutor.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Editar tutor" />

            <div className="space-y-6">
                <PageHeader
                    title="Editar tutor"
                    description={`Actualizá la información personal y de contacto de ${tutor.nombre} ${tutor.apellido}.`}
                    icon={<UserRound size={28} />}
                    actions={
                        <Link
                            href={`/tutores/${tutor.id}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                            <ArrowLeft size={17} />
                            Volver a la ficha
                        </Link>
                    }
                />

                <form onSubmit={submit} className="space-y-6">
                    {/* Datos personales */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <IdCard size={21} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-800">
                                    Datos personales
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Información de identificación del tutor.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                            <Campo
                                id="dni"
                                label="DNI"
                                required
                                value={data.dni}
                                error={errors.dni}
                                placeholder="Ingresar DNI"
                                onChange={(value) => setData('dni', value)}
                            />

                            <Campo
                                id="nombre"
                                label="Nombre"
                                required
                                value={data.nombre}
                                error={errors.nombre}
                                placeholder="Nombre"
                                onChange={(value) => setData('nombre', value)}
                            />

                            <Campo
                                id="apellido"
                                label="Apellido"
                                required
                                value={data.apellido}
                                error={errors.apellido}
                                placeholder="Apellido"
                                onChange={(value) => setData('apellido', value)}
                            />
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
                            <Campo
                                id="email"
                                label="Correo electrónico"
                                type="email"
                                value={data.email}
                                error={errors.email}
                                placeholder="correo@ejemplo.com"
                                onChange={(value) => setData('email', value)}
                            />

                            <Campo
                                id="telefono"
                                label="Teléfono"
                                type="tel"
                                value={data.telefono}
                                error={errors.telefono}
                                placeholder="Número de teléfono"
                                onChange={(value) => setData('telefono', value)}
                            />

                            <Campo
                                id="localidad"
                                label="Localidad"
                                value={data.localidad}
                                error={errors.localidad}
                                placeholder="Localidad"
                                onChange={(value) => setData('localidad', value)}
                            />

                            <Campo
                                id="direccion"
                                label="Dirección"
                                value={data.direccion}
                                error={errors.direccion}
                                placeholder="Calle, número y barrio"
                                onChange={(value) => setData('direccion', value)}
                            />
                        </div>
                    </section>

                    {/* Jugadores asociados */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                <Users size={21} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-800">
                                    Jugadores asociados
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Parentesco de este tutor con cada jugador.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 p-6">
                            {tutor.jugadores.length > 0 ? (
                                tutor.jugadores.map((jugador, index) => {
                                    const errorParentesco = errors[
                                        `relaciones.${index}.parentesco` as keyof typeof errors
                                    ] as string | undefined;

                                    return (
                                        <div
                                            key={jugador.id}
                                            className="rounded-xl border border-slate-200 p-4"
                                        >
                                            <div className="mb-4 flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                                    <UserRoundCheck size={20} />
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {jugador.nombre} {jugador.apellido}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        DNI: {jugador.dni}
                                                    </p>
                                                </div>
                                            </div>

                                            {puedeAdministrarRelaciones ? (
                                                <div>
                                                    <label
                                                        htmlFor={`parentesco-${jugador.id}`}
                                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                                    >
                                                        Parentesco <span className="text-red-500">*</span>
                                                    </label>

                                                    <input
                                                        id={`parentesco-${jugador.id}`}
                                                        required
                                                        maxLength={50}
                                                        value={data.relaciones[index]?.parentesco ?? ''}
                                                        onChange={(e) =>
                                                            actualizarParentesco(
                                                                jugador.id,
                                                                e.target.value
                                                            )
                                                        }
                                                        className={`${inputStyles} ${
                                                            errorParentesco
                                                                ? 'border-red-400'
                                                                : ''
                                                        }`}
                                                        placeholder="Ej. Madre, padre, abuelo..."
                                                    />

                                                    {errorParentesco && (
                                                        <p className="mt-1.5 text-xs text-red-600">
                                                            {errorParentesco}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                        Parentesco
                                                    </p>
                                                    <p className="mt-1 font-medium text-slate-700">
                                                        {jugador.pivot?.parentesco || 'No especificado'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="rounded-xl bg-slate-50 p-5 text-center">
                                    <Users size={30} className="mx-auto mb-2 text-slate-300" />
                                    <p className="text-sm font-medium text-slate-600">
                                        Este tutor todavía no tiene jugadores asociados.
                                    </p>
                                </div>
                            )}

                            {!puedeAdministrarRelaciones && tutor.jugadores.length > 0 && (
                                <p className="text-xs text-slate-500">
                                    Los parentescos son administrados por la comisión directiva.
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Botones */}
                    <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                        <Link
                            href={`/tutores/${tutor.id}`}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save size={18} />
                            {processing ? 'Guardando cambios...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}