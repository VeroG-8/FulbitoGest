import { useState } from 'react';
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
    Layers,
    ChevronDown,
    Search,
    Check,
    X,
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

interface Categoria {
    id: number;
    anio: number;
}

interface Props {
    profesor: Profesor;
    categorias: Categoria[];
    categoria_ids: number[];
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
    categoria_ids: number[];
}

export default function Edit({
    profesor,
    categorias,
    categoria_ids,
}: Props) {
    const [selectorAbierto, setSelectorAbierto] = useState(false);
    const [busquedaCategoria, setBusquedaCategoria] = useState('');

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
            categoria_ids: categoria_ids ?? [],
        });

    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        put(`/profesores/${profesor.id}`);
    }

    function toggleCategoria(id: number) {
        const seleccionadas = data.categoria_ids.includes(id)
            ? data.categoria_ids.filter((categoriaId) => categoriaId !== id)
            : [...data.categoria_ids, id];

        setData('categoria_ids', seleccionadas);
    }

    function quitarCategoria(id: number) {
        setData(
            'categoria_ids',
            data.categoria_ids.filter((categoriaId) => categoriaId !== id),
        );
    }

    const categoriasFiltradas = categorias.filter((categoria) =>
        String(categoria.anio).includes(busquedaCategoria.trim()),
    );

    const categoriasSeleccionadas = categorias.filter((categoria) =>
        data.categoria_ids.includes(categoria.id),
    );

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

                    {/* Categorías asignadas */}
                    <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 rounded-t-2xl border-b border-slate-100 px-6 py-5">
                            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                                <Layers size={21} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-800">
                                    Categorías asignadas
                                </h2>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    Seleccioná las categorías a cargo de este
                                    profesor.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 p-6">
                            <div className="relative max-w-xl">
                                <label className={labelClass}>
                                    Categorías
                                </label>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectorAbierto(!selectorAbierto)
                                    }
                                    className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 py-2.5 text-left text-sm transition ${
                                        selectorAbierto
                                            ? 'border-blue-500 ring-2 ring-blue-100'
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <span className="text-slate-600">
                                        {data.categoria_ids.length > 0
                                            ? `${data.categoria_ids.length} ${
                                                  data.categoria_ids.length === 1
                                                      ? 'categoría seleccionada'
                                                      : 'categorías seleccionadas'
                                              }`
                                            : 'Seleccionar categorías'}
                                    </span>

                                    <ChevronDown
                                        size={18}
                                        className={`text-slate-400 transition ${
                                            selectorAbierto ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {selectorAbierto && (
                                    <div className="absolute top-full right-0 left-0 z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                                        <div className="border-b border-slate-100 p-3">
                                            <div className="relative">
                                                <Search
                                                    size={16}
                                                    className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                                                />

                                                <input
                                                    type="text"
                                                    value={busquedaCategoria}
                                                    onChange={(e) =>
                                                        setBusquedaCategoria(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Buscar por año..."
                                                    className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-9 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                />
                                            </div>
                                        </div>

                                        <div className="max-h-60 overflow-y-auto p-2">
                                            {categoriasFiltradas.length > 0 ? (
                                                categoriasFiltradas.map(
                                                    (categoria) => {
                                                        const seleccionada =
                                                            data.categoria_ids.includes(
                                                                categoria.id,
                                                            );

                                                        return (
                                                            <button
                                                                key={
                                                                    categoria.id
                                                                }
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleCategoria(
                                                                        categoria.id,
                                                                    )
                                                                }
                                                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                                                                    seleccionada
                                                                        ? 'bg-blue-50 text-blue-700'
                                                                        : 'text-slate-600 hover:bg-slate-50'
                                                                }`}
                                                            >
                                                                <span>
                                                                    Categoría{' '}
                                                                    {
                                                                        categoria.anio
                                                                    }
                                                                </span>

                                                                {seleccionada && (
                                                                    <Check
                                                                        size={
                                                                            17
                                                                        }
                                                                        className="text-blue-600"
                                                                    />
                                                                )}
                                                            </button>
                                                        );
                                                    },
                                                )
                                            ) : (
                                                <p className="px-3 py-4 text-center text-sm text-slate-400">
                                                    No se encontraron categorías
                                                    disponibles.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Categorías seleccionadas */}
                            {categoriasSeleccionadas.length > 0 ? (
                                <div>
                                    <p className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                        Categorías seleccionadas
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {categoriasSeleccionadas.map(
                                            (categoria) => (
                                                <span
                                                    key={categoria.id}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                                                >
                                                    Categoría {categoria.anio}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            quitarCategoria(
                                                                categoria.id,
                                                            )
                                                        }
                                                        className="rounded-full p-0.5 transition hover:bg-blue-100"
                                                        title="Quitar categoría"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </span>
                                            ),
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400">
                                    Este profesor todavía no tiene categorías
                                    asignadas.
                                </p>
                            )}

                            {errors.categoria_ids && (
                                <p className={errorClass}>
                                    {errors.categoria_ids}
                                </p>
                            )}

                            {errors['categoria_ids.0'] && (
                                <p className={errorClass}>
                                    {errors['categoria_ids.0']}
                                </p>
                            )}

                            <p className="text-xs text-slate-500">
                                Cada categoría puede tener un solo profesor
                                responsable. Al guardar los cambios, los
                                horarios de las categorías se actualizarán
                                automáticamente.
                            </p>
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