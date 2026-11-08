import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import {
    Building2,
    ArrowLeft,
    Save,
    MapPin,
    MapPinned,
    FileText,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';

const inputStyles =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

interface CampoProps {
    label: string;
    value: string;
    error?: string;
    placeholder?: string;
    onChange: (value: string) => void;
}

function Campo({
    label,
    value,
    error,
    placeholder,
    onChange,
}: CampoProps) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                {label}
            </label>

            <input
                type="text"
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

interface SeccionProps {
    titulo: string;
    descripcion: string;
    icono: ReactNode;
    children: ReactNode;
}

function Seccion({
    titulo,
    descripcion,
    icono,
    children,
}: SeccionProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    {icono}
                </div>

                <div>
                    <h2 className="font-bold text-slate-800">
                        {titulo}
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                        {descripcion}
                    </p>
                </div>
            </div>

            <div className="p-6">
                {children}
            </div>
        </section>
    );
}

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        direccion: '',
        localidad: '',
        descripcion: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        post('/predios');
    };

    return (
        <>
            <Head title="Nuevo predio" />

            <div className="space-y-6">
                {/* ENCABEZADO */}
                <PageHeader
                    title="Nuevo predio"
                    description="Registrá una instalación deportiva de la escuela."
                    icon={<Building2 size={28} />}
                    actions={
                        <Link
                            href="/predios"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                            <ArrowLeft size={17} />
                            Volver
                        </Link>
                    }
                />

                <form onSubmit={submit} className="space-y-6">
                    {/* DATOS GENERALES */}
                    <Seccion
                        titulo="Datos generales"
                        descripcion="Información principal de la instalación deportiva."
                        icono={<Building2 size={21} />}
                    >
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Campo
                                label="Nombre del predio"
                                value={data.nombre}
                                error={errors.nombre}
                                placeholder="Ej. Complejo Deportivo Central"
                                onChange={(value) =>
                                    setData('nombre', value)
                                }
                            />

                            <div>
                                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                    Descripción
                                </label>

                                <textarea
                                    value={data.descripcion}
                                    onChange={(e) =>
                                        setData('descripcion', e.target.value)
                                    }
                                    placeholder="Descripción o información adicional del predio..."
                                    rows={3}
                                    className={`${inputStyles} resize-y ${
                                        errors.descripcion
                                            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                                            : ''
                                    }`}
                                />

                                {errors.descripcion && (
                                    <p className="mt-1.5 text-xs font-medium text-red-600">
                                        {errors.descripcion}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Seccion>

                    {/* UBICACIÓN */}
                    <Seccion
                        titulo="Ubicación"
                        descripcion="Indicá dónde se encuentra el predio."
                        icono={<MapPin size={21} />}
                    >
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <Campo
                                label="Dirección"
                                value={data.direccion}
                                error={errors.direccion}
                                placeholder="Ej. Av. principal 123"
                                onChange={(value) =>
                                    setData('direccion', value)
                                }
                            />

                            <Campo
                                label="Localidad"
                                value={data.localidad}
                                error={errors.localidad}
                                placeholder="Ej. Salta"
                                onChange={(value) =>
                                    setData('localidad', value)
                                }
                            />
                        </div>
                    </Seccion>

                    {/* BOTONES */}
                    <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-200 pt-5 sm:flex-row">
                        <Link
                            href="/predios"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save size={17} />

                            {processing
                                ? 'Guardando...'
                                : 'Guardar predio'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}