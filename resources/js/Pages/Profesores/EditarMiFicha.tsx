import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Save,
    UserRound,
    IdCard,
    Mail,
    Phone,
    MapPin,
    BriefcaseBusiness,
    GraduationCap,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';

interface Categoria {
    id: number;
    anio: number;
}

interface Profesor {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    email: string | null;
    telefono: string | null;
    direccion: string | null;
    localidad: string | null;
    especialidad: string | null;
    categorias: Categoria[];
}

interface Props {
    profesor: Profesor;
}

interface Formulario {
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
    telefono: string;
    direccion: string;
    localidad: string;
    especialidad: string;
}

interface CampoProps {
    label: string;
    name: keyof Formulario;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    icon: React.ReactNode;
    placeholder?: string;
}

    function Campo({
    label,
    name,
    value,
    onChange,
    error,
    icon,
    placeholder,
}: CampoProps) {
    return (
        <div>
            <label
                htmlFor={name}
                className="mb-2 block text-sm font-semibold text-slate-700"
            >
                {label}
            </label>

            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    {icon}
                </div>

                <input
                    id={name}
                    name={name}
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`!m-0 block w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-none outline-none transition focus:ring-2 focus:ring-emerald-100 ${
                        error
                            ? '!border-red-400 focus:!border-red-400'
                            : '!border-slate-200 focus:!border-emerald-500'
                    }`}
                />
            </div>

            {error && (
                <p className="mt-1 text-xs text-red-600">{error}</p>
            )}
        </div>
    );
}

export default function EditarMiFicha({ profesor }: Props) {
    const { data, setData, put, processing, errors } = useForm<Formulario>({
        nombre: profesor.nombre ?? '',
        apellido: profesor.apellido ?? '',
        dni: profesor.dni ?? '',
        email: profesor.email ?? '',
        telefono: profesor.telefono ?? '',
        direccion: profesor.direccion ?? '',
        localidad: profesor.localidad ?? '',
        especialidad: profesor.especialidad ?? '',
    });

    const enviarFormulario = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('profesores.mi-ficha.actualizar'));
    };

    return (
        <>
            <Head title="Editar mis datos" />

            <div className="space-y-6">
                <PageHeader
                    title="Editar mis datos"
                    description="Actualizá tu información personal y profesional."
                    icon={<UserRound size={24} />}
                    actions={
                        <Link
                            href={route('profesores.mi-ficha')}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            <ArrowLeft size={17} />
                            Volver a mi ficha
                        </Link>
                    }
                />

                <form onSubmit={enviarFormulario} className="space-y-6">
                    {/* DATOS PERSONALES */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
                            <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700">
                                <IdCard size={21} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-800">
                                    Datos personales
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Información de identificación del profesor.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                            <Campo
                                label="Nombre"
                                name="nombre"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                                error={errors.nombre}
                                icon={<UserRound size={17} />}
                            />

                            <Campo
                                label="Apellido"
                                name="apellido"
                                value={data.apellido}
                                onChange={(e) => setData('apellido', e.target.value)}
                                error={errors.apellido}
                                icon={<UserRound size={17} />}
                            />

                            <Campo
                                label="DNI"
                                name="dni"
                                value={data.dni}
                                onChange={(e) => setData('dni', e.target.value)}
                                error={errors.dni}
                                icon={<IdCard size={17} />}
                            />

                            <Campo
                                label="Especialidad"
                                name="especialidad"
                                value={data.especialidad}
                                onChange={(e) => setData('especialidad', e.target.value)}
                                error={errors.especialidad}
                                icon={<BriefcaseBusiness size={17} />}
                            />
                        </div>
                    </section>

                    {/* DATOS DE CONTACTO */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
                            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
                                <Phone size={21} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-800">
                                    Datos de contacto
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Información para mantener actualizada tu ficha.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                            <Campo
                                label="Correo electrónico"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                                icon={<Mail size={17} />}
                            />

                            <Campo
                                label="Teléfono"
                                name="telefono"
                                value={data.telefono}
                                onChange={(e) => setData('telefono', e.target.value)}
                                error={errors.telefono}
                                icon={<Phone size={17} />}
                            />

                            <Campo
                                label="Dirección"
                                name="direccion"
                                value={data.direccion}
                                onChange={(e) => setData('direccion', e.target.value)}
                                error={errors.direccion}
                                icon={<MapPin size={17} />}
                            />

                            <Campo
                                label="Localidad"
                                name="localidad"
                                value={data.localidad}
                                onChange={(e) => setData('localidad', e.target.value)}
                                error={errors.localidad}
                                icon={<MapPin size={17} />}
                            />
                        </div>
                    </section>

                    {/* CATEGORÍAS ASIGNADAS */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
                            <div className="rounded-xl bg-violet-100 p-2.5 text-violet-700">
                                <GraduationCap size={21} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-800">
                                    Categorías asignadas
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Esta información es administrada por la institución.
                                </p>
                            </div>
                        </div>

                        <div className="p-6">
                            {profesor.categorias?.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {profesor.categorias.map((categoria) => (
                                        <span
                                            key={categoria.id}
                                            className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700"
                                        >
                                            Categoría {categoria.anio}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">
                                    No tenés categorías asignadas.
                                </p>
                            )}

                            <p className="mt-4 text-xs text-slate-500">
                                No es posible modificar las categorías desde esta sección.
                                Si necesitás realizar algún cambio, comunicate con la administración.
                            </p>
                        </div>
                    </section>

                    {/* ACCIONES */}
                    <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                        <Link
                            href={route('profesores.mi-ficha')}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save size={18} />
                            {processing ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}