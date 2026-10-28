import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Trophy,
    Users,
    Shield,
    CalendarDays,
    Save,
} from 'lucide-react';
import { FormEvent } from 'react';

interface Categoria {
    id: number;
    nombre: string;
}

interface Club {
    id: number;
    nombre: string;
}

interface Equipo {
    id: number;
    nombre: string;
    club: Club | null;
    categoria: Categoria | null;
}

interface Torneo {
    id: number;
    nombre: string;
    fecha_inicio: string;
    categorias: Categoria[];
}

interface Props {
    torneo: Torneo;
    equiposDisponibles: Equipo[];
}

export default function InscribirEquipo({
    torneo,
    equiposDisponibles,
}: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        equipo_id: string;
    }>({
        equipo_id: '',
    });

    const equipoSeleccionado = equiposDisponibles.find(
        (equipo) => equipo.id === Number(data.equipo_id)
    );

    const enviarFormulario = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!data.equipo_id || processing) return;

        post(`/torneos/${torneo.id}/inscribir-equipo`);
    };

    return (
        <>
            <Head title={`Inscribir equipo - ${torneo.nombre}`} />

            <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
                <div className="mx-auto max-w-4xl space-y-6">

                    {/* ENCABEZADO */}
                    <div className="rounded-2xl !bg-slate-950 px-6 py-7 shadow-lg sm:px-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl !bg-slate-800">
                                    <Trophy
                                        size={29}
                                        className="!text-white"
                                    />
                                </div>

                                <div>
                                    <p className="text-sm !text-slate-300">
                                        Gestión de torneos
                                    </p>

                                    <h1 className="text-2xl font-bold !text-white sm:text-3xl">
                                        Inscribir equipo
                                    </h1>

                                    <p className="mt-1 text-sm !text-slate-300">
                                        {torneo.nombre}
                                    </p>
                                </div>
                            </div>

                            <Link
                                href={`/torneos/${torneo.id}`}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 !bg-slate-800 px-4 py-3 text-sm font-semibold !text-white hover:!bg-slate-700"
                            >
                                <ArrowLeft size={17} />
                                Volver al torneo
                            </Link>
                        </div>
                    </div>

                    {/* INFORMACIÓN DEL TORNEO */}
                    <section className="rounded-2xl border border-slate-200 !bg-white p-6 shadow-sm">
                        <h2 className="mb-5 text-lg font-bold !text-slate-900">
                            Información del torneo
                        </h2>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                            <div>
                                <p className="mb-2 flex items-center gap-2 text-sm !text-slate-500">
                                    <Trophy size={17} />
                                    Torneo
                                </p>

                                <p className="font-semibold !text-slate-900">
                                    {torneo.nombre}
                                </p>
                            </div>

                            <div>
                                <p className="mb-2 flex items-center gap-2 text-sm !text-slate-500">
                                    <CalendarDays size={17} />
                                    Fecha de inicio
                                </p>

                                <p className="font-semibold !text-slate-900">
                                    {torneo.fecha_inicio.substring(0, 10)}
                                </p>
                            </div>
                        </div>

                        {/* CATEGORÍAS HABILITADAS */}
                        <div className="mt-6 border-t border-slate-200 pt-5">
                            <p className="mb-3 flex items-center gap-2 text-sm font-semibold !text-slate-700">
                                <Users size={17} />
                                Categorías habilitadas
                            </p>

                            {torneo.categorias.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {torneo.categorias.map((categoria) => (
                                        <span
                                            key={categoria.id}
                                            className="rounded-full !bg-blue-100 px-3 py-1.5 text-sm font-medium !text-blue-800"
                                        >
                                            {categoria.nombre}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm !text-amber-700">
                                    Este torneo no tiene categorías habilitadas.
                                </p>
                            )}
                        </div>
                    </section>

                    {/* FORMULARIO */}
                    <section className="rounded-2xl border border-slate-200 !bg-white p-6 shadow-sm">

                        <h2 className="mb-2 flex items-center gap-2 text-lg font-bold !text-slate-900">
                            <Shield size={21} />
                            Seleccionar equipo
                        </h2>

                        <p className="mb-6 text-sm !text-slate-500">
                            Solo aparecen equipos pertenecientes a las
                            categorías habilitadas y que todavía no están
                            inscriptos en este torneo.
                        </p>

                        <form
                            onSubmit={enviarFormulario}
                            className="space-y-6"
                        >
                            <div>
                                <label
                                    htmlFor="equipo_id"
                                    className="mb-2 block text-sm font-semibold !text-slate-700"
                                >
                                    Equipo participante *
                                </label>

                                <select
                                    id="equipo_id"
                                    value={data.equipo_id}
                                    onChange={(e) =>
                                        setData('equipo_id', e.target.value)
                                    }
                                    disabled={equiposDisponibles.length === 0}
                                    className="w-full rounded-xl border border-slate-300 !bg-white px-4 py-3 text-sm !text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                >
                                    <option value="">
                                        Seleccionar un equipo
                                    </option>

                                    {equiposDisponibles.map((equipo) => (
                                        <option
                                            key={equipo.id}
                                            value={equipo.id}
                                        >
                                            {equipo.nombre}
                                            {' - '}
                                            {equipo.categoria?.nombre ?? 'Sin categoría'}
                                        </option>
                                    ))}
                                </select>

                                {errors.equipo_id && (
                                    <p className="mt-2 text-sm !text-red-600">
                                        {errors.equipo_id}
                                    </p>
                                )}
                            </div>

                            {/* EQUIPO SELECCIONADO */}
                            {equipoSeleccionado && (
                                <div className="rounded-xl border border-blue-200 !bg-blue-50 p-5">
                                    <h3 className="mb-4 font-semibold !text-blue-900">
                                        Equipo seleccionado
                                    </h3>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                                        <div>
                                            <p className="mb-1 text-xs !text-slate-500">
                                                Equipo
                                            </p>
                                            <p className="text-sm font-semibold !text-slate-900">
                                                {equipoSeleccionado.nombre}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="mb-1 text-xs !text-slate-500">
                                                Club
                                            </p>
                                            <p className="text-sm font-semibold !text-slate-900">
                                                {equipoSeleccionado.club?.nombre ?? 'Sin club'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="mb-1 text-xs !text-slate-500">
                                                Categoría
                                            </p>
                                            <p className="text-sm font-semibold !text-slate-900">
                                                {equipoSeleccionado.categoria?.nombre ?? 'Sin categoría'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {equiposDisponibles.length === 0 && (
                                <div className="rounded-xl border border-amber-200 !bg-amber-50 p-4">
                                    <p className="text-sm !text-amber-800">
                                        No hay equipos disponibles para inscribir.
                                        Verificá las categorías habilitadas
                                        y los equipos registrados.
                                    </p>
                                </div>
                            )}

                            {/* ACCIONES */}
                            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">

                                <Link
                                    href={`/torneos/${torneo.id}`}
                                    className="rounded-xl border border-slate-300 !bg-white px-6 py-3 text-center text-sm font-semibold !text-slate-700 hover:!bg-slate-100"
                                >
                                    Cancelar
                                </Link>

                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !data.equipo_id ||
                                        equiposDisponibles.length === 0
                                    }
                                    style={{
                                        backgroundColor: '#0f172a',
                                        color: '#ffffff',
                                    }}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Save size={18} color="#ffffff" />

                                    <span style={{ color: '#ffffff' }}>
                                        {processing
                                            ? 'Inscribiendo...'
                                            : 'Inscribir equipo'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </>
    );
}