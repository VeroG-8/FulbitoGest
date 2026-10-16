import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, ShieldCheck } from 'lucide-react';
import { FormEvent } from 'react';

interface Club {
    id: number;
    nombre: string;
}

interface Categoria {
    id: number;
    nombre: string;
}

interface Equipo {
    id: number;
    nombre: string;
    club_id: number;
    categoria_id: number;
    estado: boolean;
}

interface Props {
    equipo: Equipo;
    clubes: Club[];
    categorias: Categoria[];
}

interface EquipoForm {
    club_id: string;
    categoria_id: string;
    nombre: string;
    estado: string;
}

export default function Edit({
    equipo,
    clubes,
    categorias,
}: Props) {
    const { data, setData, put, processing, errors } =
        useForm<EquipoForm>({
            club_id: String(equipo.club_id),
            categoria_id: String(equipo.categoria_id),
            nombre: equipo.nombre,
            estado: equipo.estado ? '1' : '0',
        });

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        put(`/equipos/${equipo.id}`);
    };

    return (
        <>
            <Head title={`Editar equipo: ${equipo.nombre}`} />

            <div className="min-h-screen bg-slate-50 p-6 md:p-10">
                <div className="mx-auto max-w-3xl">
                    {/* Encabezado */}
                    <div className="mb-8">
                        <Link
                            href="/equipos"
                            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
                        >
                            <ArrowLeft size={17} />
                            Volver a equipos
                        </Link>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                            Editar equipo
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Modificá los datos del equipo{' '}
                            <span className="font-semibold text-slate-700">
                                {equipo.nombre}
                            </span>
                            .
                        </p>
                    </div>

                    {/* Formulario */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
                                <ShieldCheck
                                    size={23}
                                    className="text-blue-600"
                                />
                            </div>

                            <div>
                                <h2 className="font-semibold text-slate-800">
                                    Datos del equipo
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Revisá los datos antes de guardar los
                                    cambios.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-6 p-6">
                            {/* Nombre */}
                            <div>
                                <label
                                    htmlFor="nombre"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Nombre del equipo *
                                </label>

                                <input
                                    id="nombre"
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) =>
                                        setData('nombre', e.target.value)
                                    }
                                    placeholder="Ej.: Primera División"
                                    maxLength={255}
                                    required
                                    autoFocus
                                    className={`w-full rounded-lg border px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-blue-100 ${
                                        errors.nombre
                                            ? 'border-red-400 focus:border-red-500'
                                            : 'border-slate-300 focus:border-blue-500'
                                    }`}
                                />

                                {errors.nombre && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.nombre}
                                    </p>
                                )}
                            </div>

                            {/* Club */}
                            <div>
                                <label
                                    htmlFor="club_id"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Club *
                                </label>

                                <select
                                    id="club_id"
                                    value={data.club_id}
                                    onChange={(e) =>
                                        setData('club_id', e.target.value)
                                    }
                                    required
                                    className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:ring-4 focus:ring-blue-100 ${
                                        errors.club_id
                                            ? 'border-red-400 focus:border-red-500'
                                            : 'border-slate-300 focus:border-blue-500'
                                    }`}
                                >
                                    <option value="">
                                        Seleccioná un club
                                    </option>

                                    {clubes.map((club) => (
                                        <option
                                            key={club.id}
                                            value={club.id}
                                        >
                                            {club.nombre}
                                        </option>
                                    ))}
                                </select>

                                {errors.club_id && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.club_id}
                                    </p>
                                )}

                                {clubes.length === 0 && (
                                    <p className="mt-2 text-sm text-amber-600">
                                        No hay clubes registrados.
                                    </p>
                                )}
                            </div>

                            {/* Categoría */}
                            <div>
                                <label
                                    htmlFor="categoria_id"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Categoría *
                                </label>

                                <select
                                    id="categoria_id"
                                    value={data.categoria_id}
                                    onChange={(e) =>
                                        setData(
                                            'categoria_id',
                                            e.target.value,
                                        )
                                    }
                                    required
                                    className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:ring-4 focus:ring-blue-100 ${
                                        errors.categoria_id
                                            ? 'border-red-400 focus:border-red-500'
                                            : 'border-slate-300 focus:border-blue-500'
                                    }`}
                                >
                                    <option value="">
                                        Seleccioná una categoría
                                    </option>

                                    {categorias.map((categoria) => (
                                        <option
                                            key={categoria.id}
                                            value={categoria.id}
                                        >
                                            {categoria.nombre}
                                        </option>
                                    ))}
                                </select>

                                {errors.categoria_id && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.categoria_id}
                                    </p>
                                )}

                                {categorias.length === 0 && (
                                    <p className="mt-2 text-sm text-amber-600">
                                        No hay categorías registradas.
                                    </p>
                                )}
                            </div>

                            {/* Estado */}
                            <div>
                                <label
                                    htmlFor="estado"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Estado *
                                </label>

                                <select
                                    id="estado"
                                    value={data.estado}
                                    onChange={(e) =>
                                        setData('estado', e.target.value)
                                    }
                                    required
                                    className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:ring-4 focus:ring-blue-100 ${
                                        errors.estado
                                            ? 'border-red-400 focus:border-red-500'
                                            : 'border-slate-300 focus:border-blue-500'
                                    }`}
                                >
                                    <option value="1">Activo</option>
                                    <option value="0">Inactivo</option>
                                </select>

                                {errors.estado && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.estado}
                                    </p>
                                )}
                            </div>

                            {/* Botones */}
                            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                                <Link
                                    href="/equipos"
                                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                    Cancelar
                                </Link>

                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        clubes.length === 0 ||
                                        categorias.length === 0
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Save size={18} />

                                    {processing
                                        ? 'Guardando cambios...'
                                        : 'Guardar cambios'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <p className="mt-4 text-xs text-slate-400">
                        FulbitoGest · Gestión de equipos deportivos.
                    </p>
                </div>
            </div>
        </>
    );
}