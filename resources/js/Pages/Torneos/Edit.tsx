import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import {
    Trophy,
    ArrowLeft,
    Save,
    CalendarDays,
    MapPin,
    Users,
} from 'lucide-react';

interface Categoria {
    id: number;
    nombre: string;
}

interface Torneo {
    id: number;
    nombre: string;
    tipo: 'propio' | 'externo';
    organizador: string | null;
    fecha_inicio: string;
    fecha_fin: string | null;
    lugar: string | null;
    descripcion: string | null;
    estado: boolean;
    categorias: (Categoria & {
        pivot: {
            monto_inscripcion: string | number;
        };
    })[];
}

interface Props {
    torneo: Torneo;
    categorias: Categoria[];
}

interface TorneoForm {
    nombre: string;
    tipo: 'propio' | 'externo';
    organizador: string;
    fecha_inicio: string;
    fecha_fin: string;
    lugar: string;
    descripcion: string;
    estado: boolean;
    categorias: number[];
    montos_categorias: Record<number, string>;
}

// Convierte fechas ISO a YYYY-MM-DD para inputs type="date"
const formatearFechaInput = (fecha: string | null): string => {
    return fecha ? fecha.substring(0, 10) : '';
};

export default function Edit({ torneo, categorias }: Props) {
    const { data, setData, put, processing, errors } =
        useForm<TorneoForm>({
            nombre: torneo.nombre,
            tipo: torneo.tipo,
            organizador: torneo.organizador ?? '',
            fecha_inicio: formatearFechaInput(torneo.fecha_inicio),
            fecha_fin: formatearFechaInput(torneo.fecha_fin),
            lugar: torneo.lugar ?? '',
            descripcion: torneo.descripcion ?? '',
            estado: torneo.estado,
            categorias: torneo.categorias.map((categoria) => categoria.id),
            montos_categorias: Object.fromEntries(
                torneo.categorias.map((categoria) => [
                    categoria.id,
                    String(categoria.pivot.monto_inscripcion ?? '0'),
                ])
            ),
        });

    const actualizarTorneo = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        put(`/torneos/${torneo.id}`);
    };

    const seleccionarCategoria = (id: number) => {
        if (data.categorias.includes(id)) {
            setData(
                'categorias',
                data.categorias.filter((categoria) => categoria !== id)
            );

            setData(
                'montos_categorias',
                Object.fromEntries(
                    Object.entries(data.montos_categorias).filter(
                        ([categoriaId]) => Number(categoriaId) !== id
                    )
                )
            );
        } else {
            setData('categorias', [...data.categorias, id]);

            setData('montos_categorias', {
                ...data.montos_categorias,
                [id]: '',
            });
        }
    };

    const inputClass =
        'w-full rounded-lg border border-slate-300 !bg-white px-4 py-3 text-sm !text-slate-900 outline-none focus:border-slate-700';

    return (
        <>
            <Head title={`Editar ${torneo.nombre} | FulbitoGest`} />

            <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
                <div className="mx-auto max-w-5xl space-y-6">

                    {/* ENCABEZADO */}
                    <div className="rounded-2xl !bg-slate-950 px-6 py-7 shadow-lg sm:px-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl !bg-slate-800">
                                    <Trophy size={30} className="!text-white" />
                                </div>

                                <div>
                                    <p className="text-sm !text-slate-300">
                                        Gestión deportiva
                                    </p>

                                    <h1 className="text-2xl font-bold !text-white sm:text-3xl">
                                        Editar torneo
                                    </h1>

                                    <p className="mt-1 text-sm !text-slate-300">
                                        {torneo.nombre}
                                    </p>
                                </div>
                            </div>

                            <Link
                                href="/torneos"
                                className="inline-flex items-center justify-center gap-2 rounded-xl !bg-white px-5 py-3 text-sm font-semibold !text-slate-900 hover:!bg-slate-100"
                            >
                                <ArrowLeft size={18} />
                                Volver al listado
                            </Link>

                        </div>
                    </div>

                    {/* FORMULARIO */}
                    <form onSubmit={actualizarTorneo} className="space-y-6">
                        {/* TIPO DE TORNEO */}
                        <section className="rounded-2xl border border-slate-200 !bg-white p-6 shadow-sm">

                            <h2 className="mb-2 text-lg font-bold !text-slate-900">
                                Tipo de torneo
                            </h2>

                            <p className="mb-5 text-sm !text-slate-500">
                                Seleccioná el tipo de competencia que corresponde a este torneo.
                            </p>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                {/* TORNEO PROPIO */}
                                <label
                                    className={`cursor-pointer rounded-xl border-2 p-5 transition ${
                                        data.tipo === 'propio'
                                            ? 'border-blue-600 !bg-blue-50'
                                            : 'border-slate-200 !bg-white hover:!bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">

                                        <input
                                            type="radio"
                                            name="tipo"
                                            value="propio"
                                            checked={data.tipo === 'propio'}
                                            onChange={() => setData('tipo', 'propio')}
                                            className="mt-1 h-4 w-4 accent-blue-600"
                                        />

                                        <div>
                                            <h3 className="font-bold !text-slate-900">
                                                🏆 Torneo propio
                                            </h3>

                                            <p className="mt-2 text-sm leading-relaxed !text-slate-600">
                                                Organizado por la escuela de fútbol.
                                                Permite inscribir equipos, administrar
                                                partidos y generar el fixture.
                                            </p>
                                        </div>

                                    </div>
                                </label>

                                {/* TORNEO EXTERNO */}
                                <label
                                    className={`cursor-pointer rounded-xl border-2 p-5 transition ${
                                        data.tipo === 'externo'
                                            ? 'border-emerald-600 !bg-emerald-50'
                                            : 'border-slate-200 !bg-white hover:!bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">

                                        <input
                                            type="radio"
                                            name="tipo"
                                            value="externo"
                                            checked={data.tipo === 'externo'}
                                            onChange={() => setData('tipo', 'externo')}
                                            className="mt-1 h-4 w-4 accent-emerald-600"
                                        />

                                        <div>
                                            <h3 className="font-bold !text-slate-900">
                                                ⚽ Torneo externo
                                            </h3>

                                            <p className="mt-2 text-sm leading-relaxed !text-slate-600">
                                                Organizado por otra institución.
                                                Permite registrar jugadores participantes,
                                                controlar confirmaciones y pagos,
                                                y consultar fechas y lugares.
                                            </p>
                                        </div>

                                    </div>
                                </label>

                            </div>

                            {/* ERROR DE VALIDACIÓN */}
                            {errors.tipo && (
                                <p className="mt-3 text-sm !text-red-600">
                                    {errors.tipo}
                                </p>
                            )}

                        </section>
                        {/* INFORMACIÓN GENERAL */}
                        <section className="rounded-2xl border border-slate-200 !bg-white p-6 shadow-sm">

                            <h2 className="mb-5 text-lg font-bold !text-slate-900">
                                Información general
                            </h2>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                {/* NOMBRE */}
                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="nombre"
                                        className="mb-2 block text-sm font-semibold !text-slate-700"
                                    >
                                        Nombre del torneo *
                                    </label>

                                    <input
                                        id="nombre"
                                        type="text"
                                        value={data.nombre}
                                        onChange={(e) =>
                                            setData('nombre', e.target.value)
                                        }
                                        required
                                        maxLength={150}
                                        className={inputClass}
                                    />

                                    {errors.nombre && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.nombre}
                                        </p>
                                    )}
                                </div>
                                               
                                {/* ORGANIZADOR */}
                                <div>
                                    <label
                                        htmlFor="organizador"
                                        className="mb-2 block text-sm font-semibold !text-slate-700"
                                    >
                                        Organizador
                                    </label>

                                    <input
                                        id="organizador"
                                        type="text"
                                        value={data.organizador}
                                        onChange={(e) =>
                                            setData('organizador', e.target.value)
                                        }
                                        maxLength={150}
                                        className={inputClass}
                                    />

                                    {errors.organizador && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.organizador}
                                        </p>
                                    )}
                                </div>

                                {/* LUGAR */}
                                <div>
                                    <label
                                        htmlFor="lugar"
                                        className="mb-2 flex items-center gap-2 text-sm font-semibold !text-slate-700"
                                    >
                                        <MapPin size={16} />
                                        Lugar
                                    </label>

                                    <input
                                        id="lugar"
                                        type="text"
                                        value={data.lugar}
                                        onChange={(e) =>
                                            setData('lugar', e.target.value)
                                        }
                                        maxLength={150}
                                        className={inputClass}
                                    />

                                    {errors.lugar && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.lugar}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* FECHAS */}
                        <section className="rounded-2xl border border-slate-200 !bg-white p-6 shadow-sm">

                            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold !text-slate-900">
                                <CalendarDays size={21} />
                                Fechas del torneo
                            </h2>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                <div>
                                    <label
                                        htmlFor="fecha_inicio"
                                        className="mb-2 block text-sm font-semibold !text-slate-700"
                                    >
                                        Fecha de inicio *
                                    </label>

                                    <input
                                        id="fecha_inicio"
                                        type="date"
                                        value={data.fecha_inicio}
                                        onChange={(e) =>
                                            setData('fecha_inicio', e.target.value)
                                        }
                                        required
                                        className={inputClass}
                                    />

                                    {errors.fecha_inicio && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.fecha_inicio}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="fecha_fin"
                                        className="mb-2 block text-sm font-semibold !text-slate-700"
                                    >
                                        Fecha de finalización
                                    </label>

                                    <input
                                        id="fecha_fin"
                                        type="date"
                                        min={data.fecha_inicio || undefined}
                                        value={data.fecha_fin}
                                        onChange={(e) =>
                                            setData('fecha_fin', e.target.value)
                                        }
                                        className={inputClass}
                                    />

                                    {errors.fecha_fin && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.fecha_fin}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* CATEGORÍAS */}
                        <section className="rounded-2xl border border-slate-200 !bg-white p-6 shadow-sm">

                            <h2 className="mb-2 flex items-center gap-2 text-lg font-bold !text-slate-900">
                                <Users size={21} />
                                Categorías participantes
                            </h2>

                            <p className="mb-5 text-sm text-slate-500">
                                Podés agregar o quitar categorías del torneo.
                            </p>

                            {categorias.length === 0 ? (
                                <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-700">
                                    No hay categorías registradas.
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">

                                    {categorias.map((categoria) => {
                                        const seleccionada = data.categorias.includes(categoria.id);

                                        return (
                                            <div
                                                key={categoria.id}
                                                className={`rounded-xl border p-4 transition ${
                                                    seleccionada
                                                        ? 'border-blue-500 !bg-blue-50'
                                                        : 'border-slate-200 !bg-white hover:!bg-slate-50'
                                                }`}
                                            >
                                                <label className="flex cursor-pointer items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={seleccionada}
                                                        onChange={() => seleccionarCategoria(categoria.id)}
                                                        className="h-4 w-4 accent-blue-600"
                                                    />

                                                    <span className="text-sm font-medium !text-slate-800">
                                                        {categoria.nombre}
                                                    </span>
                                                </label>

                                                {seleccionada && (
                                                    <div className="mt-4">
                                                        <label
                                                            htmlFor={`monto_categoria_${categoria.id}`}
                                                            className="mb-2 block text-sm font-semibold !text-slate-700"
                                                        >
                                                            Importe por jugador ($) *
                                                        </label>

                                                        <input
                                                            id={`monto_categoria_${categoria.id}`}
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={data.montos_categorias[categoria.id] ?? ''}
                                                            onChange={(e) =>
                                                                setData('montos_categorias', {
                                                                    ...data.montos_categorias,
                                                                    [categoria.id]: e.target.value,
                                                                })
                                                            }
                                                            placeholder="Ej.: 50000"
                                                            required
                                                            className={inputClass}
                                                        />

                                                        {errors.montos_categorias && (
                                                            <p className="mt-1 text-sm text-red-600">
                                                                {errors.montos_categorias}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {errors.categorias && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.categorias}
                                </p>
                            )}
                        </section>

                        {/* INFORMACIÓN ADICIONAL */}
                        <section className="rounded-2xl border border-slate-200 !bg-white p-6 shadow-sm">

                            <h2 className="mb-5 text-lg font-bold !text-slate-900">
                                Información adicional
                            </h2>

                            <div className="space-y-5">

                                <div>
                                    <label
                                        htmlFor="descripcion"
                                        className="mb-2 block text-sm font-semibold !text-slate-700"
                                    >
                                        Descripción
                                    </label>

                                    <textarea
                                        id="descripcion"
                                        value={data.descripcion}
                                        onChange={(e) =>
                                            setData('descripcion', e.target.value)
                                        }
                                        rows={4}
                                        className={inputClass}
                                    />

                                    {errors.descripcion && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.descripcion}
                                        </p>
                                    )}
                                </div>

                                <label className="flex cursor-pointer items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={data.estado}
                                        onChange={(e) =>
                                            setData('estado', e.target.checked)
                                        }
                                        className="h-4 w-4 accent-emerald-600"
                                    />

                                    <span className="text-sm font-medium !text-slate-700">
                                        Torneo activo
                                    </span>
                                </label>

                                {errors.estado && (
                                    <p className="text-sm text-red-600">
                                        {errors.estado}
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* BOTONES */}
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                            <Link
                                href="/torneos"
                                className="rounded-xl border border-slate-300 !bg-white px-6 py-3 text-center text-sm font-semibold !text-slate-700 hover:!bg-slate-100"
                            >
                                Cancelar
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                style={{
                                    backgroundColor: '#0f172a',
                                    color: '#ffffff',
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-900 px-6 py-3 text-sm font-semibold shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Save size={18} style={{ color: '#ffffff' }} />

                                <span style={{ color: '#ffffff' }}>
                                    {processing ? 'Guardando...' : 'Guardar cambios'}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}