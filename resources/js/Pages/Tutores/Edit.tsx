import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import {
    UserRound,
    ArrowLeft,
    IdCard,
    MapPin,
    Save,
    Mail,
    Phone,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';

interface Tutor {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
    email: string | null;
    telefono: string | null;
    direccion: string | null;
    localidad: string | null;
}

interface Props {
    tutor: Tutor;
}

const inputStyles =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

interface CampoProps {
    label: string;
    value: string;
    error?: string;
    type?: string;
    placeholder?: string;
    onChange: (value: string) => void;
}

function Campo({
    label,
    value,
    error,
    type = 'text',
    placeholder,
    onChange,
}: CampoProps) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </label>

            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className={`${inputStyles} ${
                    error
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                        : ''
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

export default function Edit({ tutor }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        dni: tutor.dni ?? '',
        nombre: tutor.nombre ?? '',
        apellido: tutor.apellido ?? '',
        email: tutor.email ?? '',
        telefono: tutor.telefono ?? '',
        direccion: tutor.direccion ?? '',
        localidad: tutor.localidad ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        put(`/tutores/${tutor.id}`);
    };

    return (
        <>
            <Head title="Editar tutor" />

            <div className="space-y-6">
                {/* Encabezado */}
                <PageHeader
                    title="Editar mis datos"
                    description={`Actualizá la información personal y de contacto de ${tutor.nombre} ${tutor.apellido}.`}
                    icon={<UserRound size={28} />}
                    actions={
                        <Link
                            href={`/tutores/${tutor.id}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                            <ArrowLeft size={17} />
                            Volver a mi ficha
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
                                label="DNI"
                                value={data.dni}
                                error={errors.dni}
                                placeholder="Ingresar DNI"
                                onChange={(value) => setData('dni', value)}
                            />

                            <Campo
                                label="Nombre"
                                value={data.nombre}
                                error={errors.nombre}
                                placeholder="Nombre"
                                onChange={(value) => setData('nombre', value)}
                            />

                            <Campo
                                label="Apellido"
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
                                label="Email"
                                type="email"
                                value={data.email}
                                error={errors.email}
                                placeholder="correo@ejemplo.com"
                                onChange={(value) => setData('email', value)}
                            />

                            <Campo
                                label="Teléfono"
                                type="tel"
                                value={data.telefono}
                                error={errors.telefono}
                                placeholder="Número de teléfono"
                                onChange={(value) => setData('telefono', value)}
                            />

                            <Campo
                                label="Localidad"
                                value={data.localidad}
                                error={errors.localidad}
                                placeholder="Localidad"
                                onChange={(value) => setData('localidad', value)}
                            />

                            <Campo
                                label="Dirección"
                                value={data.direccion}
                                error={errors.direccion}
                                placeholder="Calle, número y barrio"
                                onChange={(value) => setData('direccion', value)}
                            />
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

                            {processing
                                ? 'Guardando cambios...'
                                : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}