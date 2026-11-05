import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import {
    Users,
    ArrowLeft,
    UserRound,
    MapPin,
    Save,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';

interface Categoria {
    id: number;
    nombre: string;
    anio: number;
}

interface Jugador {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
    nacionalidad: string | null;
    fecha_nacimiento: string;
    telefono: string | null;
    direccion: string | null;
    localidad: string | null;
    categoria_id: number;
}

interface Props {
    jugador: Jugador;
    categorias: Categoria[];
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
                className={`${inputStyles} ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
            />

            {error && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

export default function Edit({ jugador, categorias }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        dni: jugador.dni,
        nombre: jugador.nombre,
        apellido: jugador.apellido,
        nacionalidad: jugador.nacionalidad ?? '',
        fecha_nacimiento: jugador.fecha_nacimiento.substring(0, 10),
        telefono: jugador.telefono ?? '',
        direccion: jugador.direccion ?? '',
        localidad: jugador.localidad ?? '',
        categoria_id: String(jugador.categoria_id),
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        put(`/jugadores/${jugador.id}`);
    };

    return (
        <>
            <Head title="Editar jugador" />

            <div className="space-y-6">
                {/* Encabezado */}
                <PageHeader
                    title="Editar jugador"
                    description={`Modificá los datos de ${jugador.nombre} ${jugador.apellido}.`}
                    icon={<UserRound size={28} />}
                    actions={
                        <Link
                            href="/jugadores"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                            <ArrowLeft size={17} />
                            Volver al listado
                        </Link>
                    }
                />

                <form onSubmit={submit} className="space-y-6">
                    {/* Datos personales */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <UserRound size={21} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-800">
                                    Datos personales
                                </h2>

                                <p className="text-xs text-slate-500">
                                    Información de identificación del jugador.
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
                                placeholder="Nombre del jugador"
                                onChange={(value) => setData('nombre', value)}
                            />

                            <Campo
                                label="Apellido"
                                value={data.apellido}
                                error={errors.apellido}
                                placeholder="Apellido del jugador"
                                onChange={(value) =>
                                    setData('apellido', value)
                                }
                            />

                            <Campo
                                label="Nacionalidad"
                                value={data.nacionalidad}
                                error={errors.nacionalidad}
                                placeholder="Ej. Argentina"
                                onChange={(value) =>
                                    setData('nacionalidad', value)
                                }
                            />

                            <Campo
                                label="Fecha de nacimiento"
                                type="date"
                                value={data.fecha_nacimiento}
                                error={errors.fecha_nacimiento}
                                onChange={(value) =>
                                    setData('fecha_nacimiento', value)
                                }
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
                                label="Teléfono"
                                type="tel"
                                value={data.telefono}
                                error={errors.telefono}
                                placeholder="Número de teléfono"
                                onChange={(value) =>
                                    setData('telefono', value)
                                }
                            />

                            <Campo
                                label="Localidad"
                                value={data.localidad}
                                error={errors.localidad}
                                placeholder="Localidad"
                                onChange={(value) =>
                                    setData('localidad', value)
                                }
                            />

                            <div className="md:col-span-2">
                                <Campo
                                    label="Dirección"
                                    value={data.direccion}
                                    error={errors.direccion}
                                    placeholder="Calle, número y barrio"
                                    onChange={(value) =>
                                        setData('direccion', value)
                                    }
                                />
                            </div>
                        </div>
                    </section>

                    {/* Categoría */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                <Users size={21} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-800">
                                    Asignación deportiva
                                </h2>

                                <p className="text-xs text-slate-500">
                                    Categoría en la que participa el jugador.
                                </p>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="max-w-md">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Categoría
                                </label>

                                <select
                                    value={data.categoria_id}
                                    onChange={(e) =>
                                        setData(
                                            'categoria_id',
                                            e.target.value,
                                        )
                                    }
                                    className={`${inputStyles} ${errors.categoria_id ? 'border-red-400' : ''}`}
                                >
                                    <option value="">
                                        Seleccionar categoría
                                    </option>

                                    {categorias.map((categoria) => (
                                        <option
                                            key={categoria.id}
                                            value={categoria.id}
                                        >
                                            {categoria.nombre} ({categoria.anio})
                                        </option>
                                    ))}
                                </select>

                                {errors.categoria_id && (
                                    <p className="mt-1.5 text-xs font-medium text-red-600">
                                        {errors.categoria_id}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Botones */}
                    <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                        <Link
                            href="/jugadores"
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