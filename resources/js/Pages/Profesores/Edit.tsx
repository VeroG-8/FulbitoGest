import { Head, Link, useForm } from '@inertiajs/react';
import {
    UserRound,
    ArrowLeft,
    Save,
    IdCard,
    Mail,
    Phone,
    MapPin,
    BriefcaseBusiness,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';

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
}

interface Props {
    profesor: Profesor;
}

interface ProfesorForm {
    dni: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    direccion: string;
    localidad: string;
    especialidad: string;
}

export default function Edit({ profesor }: Props) {
    const { data, setData, put, processing, errors } =
        useForm<ProfesorForm>({
            dni: profesor.dni ?? '',
            nombre: profesor.nombre ?? '',
            apellido: profesor.apellido ?? '',
            email: profesor.email ?? '',
            telefono: profesor.telefono ?? '',
            direccion: profesor.direccion ?? '',
            localidad: profesor.localidad ?? '',
            especialidad: profesor.especialidad ?? '',
        });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        put(`/profesores/${profesor.id}`);
    }

    const inputClass =
        'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

    const labelClass =
        'mb-1.5 block text-sm font-semibold text-slate-700';

    const errorClass = 'mt-1.5 text-xs font-medium text-red-600';

    return (
        <>
            <Head title="Editar profesor" />

            <div className="space-y-6">
                {/* Encabezado */}
                <PageHeader
                    title="Editar profesor"
                    description={`Modificá los datos de ${profesor.apellido}, ${profesor.nombre}.`}
                    icon={<UserRound size={28} />}
                    actions={
                        <Link
                            href="/profesores"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                            <ArrowLeft size={17} />
                            Volver
                        </Link>
                    }
                />

                <form onSubmit={submit} className="space-y-6">
                    {/* Datos personales */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                                <IdCard size={21} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-800">
                                    Datos personales
                                </h2>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    Información de identificación del profesor.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>DNI</label>
                                <input
                                    type="text"
                                    value={data.dni}
                                    onChange={(e) =>
                                        setData('dni', e.target.value)
                                    }
                                    className={inputClass}
                                />
                                {errors.dni && (
                                    <p className={errorClass}>{errors.dni}</p>
                                )}
                            </div>

                            <div>
                                <label className={labelClass}>Nombre</label>
                                <input
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) =>
                                        setData('nombre', e.target.value)
                                    }
                                    className={inputClass}
                                />
                                {errors.nombre && (
                                    <p className={errorClass}>
                                        {errors.nombre}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className={labelClass}>Apellido</label>
                                <input
                                    type="text"
                                    value={data.apellido}
                                    onChange={(e) =>
                                        setData('apellido', e.target.value)
                                    }
                                    className={inputClass}
                                />
                                {errors.apellido && (
                                    <p className={errorClass}>
                                        {errors.apellido}
                                    </p>
                                )}
                            </div>
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
                                <p className="mt-0.5 text-sm text-slate-500">
                                    Información para comunicarse con el profesor.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Email</label>
                                <div className="relative">
                                    <Mail
                                        size={17}
                                        className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                                    />
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        className={`${inputClass} pl-10`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className={errorClass}>
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className={labelClass}>Teléfono</label>
                                <div className="relative">
                                    <Phone
                                        size={17}
                                        className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                                    />
                                    <input
                                        type="text"
                                        value={data.telefono}
                                        onChange={(e) =>
                                            setData('telefono', e.target.value)
                                        }
                                        className={`${inputClass} pl-10`}
                                    />
                                </div>
                                {errors.telefono && (
                                    <p className={errorClass}>
                                        {errors.telefono}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className={labelClass}>Dirección</label>
                                <div className="relative">
                                    <MapPin
                                        size={17}
                                        className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                                    />
                                    <input
                                        type="text"
                                        value={data.direccion}
                                        onChange={(e) =>
                                            setData('direccion', e.target.value)
                                        }
                                        className={`${inputClass} pl-10`}
                                    />
                                </div>
                                {errors.direccion && (
                                    <p className={errorClass}>
                                        {errors.direccion}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className={labelClass}>Localidad</label>
                                <div className="relative">
                                    <MapPin
                                        size={17}
                                        className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                                    />
                                    <input
                                        type="text"
                                        value={data.localidad}
                                        onChange={(e) =>
                                            setData('localidad', e.target.value)
                                        }
                                        className={`${inputClass} pl-10`}
                                    />
                                </div>
                                {errors.localidad && (
                                    <p className={errorClass}>
                                        {errors.localidad}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Datos profesionales */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                            <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                                <BriefcaseBusiness size={21} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-800">
                                    Información profesional
                                </h2>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    Especialidad o área de desempeño.
                                </p>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="max-w-xl">
                                <label className={labelClass}>
                                    Especialidad
                                </label>
                                <input
                                    type="text"
                                    value={data.especialidad}
                                    onChange={(e) =>
                                        setData(
                                            'especialidad',
                                            e.target.value,
                                        )
                                    }
                                    className={inputClass}
                                />
                                {errors.especialidad && (
                                    <p className={errorClass}>
                                        {errors.especialidad}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                        <Link
                            href="/profesores"
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save size={17} />
                            {processing
                                ? 'Guardando...'
                                : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}