import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import {
    Goal,
    ArrowLeft,
    Save,
    MapPin,
    FileText,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';

interface Predio {
    id: number;
    nombre: string;
    estado?: boolean;
}

interface Cancha {
    id: number;
    predio_id: number;
    nombre: string;
    descripcion: string | null;
}

interface Props {
    cancha: Cancha;
    predios: Predio[];
}

const inputStyles =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

const labelStyles =
    'mb-2 block text-sm font-semibold text-slate-700';

export default function Edit({ cancha, predios }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        predio_id: String(cancha.predio_id),
        nombre: cancha.nombre ?? '',
        descripcion: cancha.descripcion ?? '',
    });

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        put(`/canchas/${cancha.id}`);
    };

    return (
        <>
            <Head title="Editar cancha" />

            <div className="space-y-6">
                {/* ENCABEZADO */}
                <PageHeader
                    title="Editar cancha"
                    description={`Modificá los datos de la cancha ${cancha.nombre}.`}
                    icon={<Goal size={28} />}
                    actions={
                        <Link
                            href={`/canchas/${cancha.id}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                            <ArrowLeft size={17} />
                            Volver
                        </Link>
                    }
                />

                <form onSubmit={submit} className="space-y-6">

                    {/* DATOS DE LA CANCHA */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Goal size={21} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-800">
                                    Datos de la cancha
                                </h2>

                                <p className="mt-0.5 text-sm text-slate-500">
                                    Actualizá la información de la instalación deportiva.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                            {/* PREDIO */}
                            <div>
                                <label
                                    htmlFor="predio_id"
                                    className={labelStyles}
                                >
                                    Predio
                                    <span className="ml-1 text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <MapPin
                                        size={17}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <select
                                        id="predio_id"
                                        value={data.predio_id}
                                        onChange={(e) =>
                                            setData('predio_id', e.target.value)
                                        }
                                        className={`${inputStyles} appearance-none pl-10`}
                                    >
                                        <option value="">
                                            Seleccioná un predio
                                        </option>

                                        {predios.map((predio) => (
                                            <option
                                                key={predio.id}
                                                value={predio.id}
                                            >
                                                {predio.nombre}
                                                {predio.estado === false
                                                    ? ' (Inactivo)'
                                                    : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {errors.predio_id && (
                                    <p className="mt-1.5 text-sm text-red-600">
                                        {errors.predio_id}
                                    </p>
                                )}
                            </div>

                            {/* NOMBRE */}
                            <div>
                                <label
                                    htmlFor="nombre"
                                    className={labelStyles}
                                >
                                    Nombre de la cancha
                                    <span className="ml-1 text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <Goal
                                        size={17}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="nombre"
                                        type="text"
                                        value={data.nombre}
                                        onChange={(e) =>
                                            setData('nombre', e.target.value)
                                        }
                                        placeholder="Ej. Cancha principal"
                                        maxLength={255}
                                        className={`${inputStyles} pl-10`}
                                    />
                                </div>

                                {errors.nombre && (
                                    <p className="mt-1.5 text-sm text-red-600">
                                        {errors.nombre}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* DESCRIPCIÓN */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <FileText size={21} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-800">
                                    Descripción
                                </h2>

                                <p className="mt-0.5 text-sm text-slate-500">
                                    Información adicional sobre la cancha.
                                </p>
                            </div>
                        </div>

                        <div className="p-6">
                            <label
                                htmlFor="descripcion"
                                className={labelStyles}
                            >
                                Descripción
                                <span className="ml-1 font-normal text-slate-400">
                                    (Opcional)
                                </span>
                            </label>

                            <textarea
                                id="descripcion"
                                rows={4}
                                value={data.descripcion}
                                onChange={(e) =>
                                    setData('descripcion', e.target.value)
                                }
                                placeholder="Agregá características u observaciones de la cancha..."
                                className={`${inputStyles} resize-none`}
                            />

                            {errors.descripcion && (
                                <p className="mt-1.5 text-sm text-red-600">
                                    {errors.descripcion}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* BOTONES */}
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Link
                            href={`/canchas/${cancha.id}`}
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