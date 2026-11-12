import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import {
    UserRound,
    Users,
    ArrowLeft,
    Save,
    IdCard,
    CalendarDays,
    Phone,
    MapPin,
    MapPinned,
    ShieldCheck,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';

interface Categoria {
    id: number;
    anio: number;
}

interface Props {
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
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
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

interface SeccionProps {
    titulo: string;
    descripcion: string;
    icono: React.ReactNode;
    children: React.ReactNode;
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
                    <h2 className="font-bold text-slate-800">{titulo}</h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                        {descripcion}
                    </p>
                </div>
            </div>

            <div className="p-6">{children}</div>
        </section>
    );
}

export default function Create({ categorias }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        dni: '',
        nombre: '',
        apellido: '',
        nacionalidad: '',
        fecha_nacimiento: '',
        telefono: '',
        direccion: '',
        localidad: '',
        categoria_id: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        post('/jugadores');
    };

    return (
        <>
            <Head title="Nuevo jugador" />

            <div className="space-y-6">
                {/* Encabezado */}
                <PageHeader
                    title="Nuevo jugador"
                    description="Registrá los datos personales y deportivos del jugador."
                    icon={<UserRound size={28} />}
                    actions={
                        <Link
                            href="/jugadores"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                            <ArrowLeft size={17} />
                            Volver
                        </Link>
                    }
                />

                <form onSubmit={submit} className="space-y-6">
                    {/* Datos personales */}
                    <Seccion
                        titulo="Datos personales"
                        descripcion="Información de identificación del jugador."
                        icono={<IdCard size={21} />}
                    >
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                                placeholder="Ingresar nombre"
                                onChange={(value) => setData('nombre', value)}
                            />

                            <Campo
                                label="Apellido"
                                value={data.apellido}
                                error={errors.apellido}
                                placeholder="Ingresar apellido"
                                onChange={(value) => setData('apellido', value)}
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
                    </Seccion>

                    {/* Datos de contacto */}
                    <Seccion
                        titulo="Datos de contacto"
                        descripcion="Información de comunicación y domicilio."
                        icono={<MapPin size={21} />}
                    >
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <Campo
                                label="Teléfono"
                                value={data.telefono}
                                error={errors.telefono}
                                placeholder="Ingresar teléfono"
                                onChange={(value) =>
                                    setData('telefono', value)
                                }
                            />

                            <Campo
                                label="Localidad"
                                value={data.localidad}
                                error={errors.localidad}
                                placeholder="Ingresar localidad"
                                onChange={(value) =>
                                    setData('localidad', value)
                                }
                            />

                            <Campo
                                label="Dirección"
                                value={data.direccion}
                                error={errors.direccion}
                                placeholder="Ingresar dirección"
                                onChange={(value) =>
                                    setData('direccion', value)
                                }
                            />
                        </div>
                    </Seccion>

                    {/* Asignación deportiva */}
                    <Seccion
                        titulo="Asignación deportiva"
                        descripcion="Seleccioná la categoría a la que pertenece el jugador."
                        icono={<ShieldCheck size={21} />}
                    >
                        <div className="max-w-xl">
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                Categoría
                            </label>

                            <select
                                value={data.categoria_id}
                                onChange={(e) =>
                                    setData('categoria_id', e.target.value)
                                }
                                className={`${inputStyles} ${
                                    errors.categoria_id
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                                        : ''
                                }`}
                            >
                                <option value="">
                                    Seleccionar categoría
                                </option>

                                {categorias.map((categoria) => (
                                    <option
                                        key={categoria.id}
                                        value={categoria.id}
                                    >
                                        {categoria.anio}
                                    </option>
                                ))}
                            </select>

                            {errors.categoria_id && (
                                <p className="mt-1.5 text-xs font-medium text-red-600">
                                    {errors.categoria_id}
                                </p>
                            )}

                            {categorias.length === 0 && (
                                <p className="mt-2 text-xs text-amber-600">
                                    No hay categorías disponibles para asignar.
                                </p>
                            )}
                        </div>
                    </Seccion>

                    {/* Botones */}
                    <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-200 pt-5 sm:flex-row">
                        <Link
                            href="/jugadores"
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
                                : 'Guardar jugador'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}