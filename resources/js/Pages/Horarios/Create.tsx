import { useForm, Link } from '@inertiajs/react';
import { useState, type FormEvent, type ReactNode } from 'react';
import {
    CalendarDays,
    Clock3,
    MapPin,
    UserRound,
    Users,
    ArrowLeft,
    Save,
    Info,
    CheckCircle2,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';

interface Profesor {
    id: number;
    nombre: string;
    apellido: string;
}

interface Categoria {
    id: number;
    anio: number;
    profesores: Profesor[];
}

interface Predio {
    id: number;
    nombre: string;
}

interface Cancha {
    id: number;
    nombre: string;
    predio: Predio;
}

interface Props {
    categorias: Categoria[];
    canchas: Cancha[];
}

interface HorarioForm {
    categoria_id: string;
    cancha_id: string;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
}

const diasSemana = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
];

const inputStyles =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

const labelStyles =
    'mb-2 block text-sm font-semibold text-slate-700';

function FormField({
    label,
    icon,
    children,
    error,
}: {
    label: string;
    icon: ReactNode;
    children: ReactNode;
    error?: string;
}) {
    return (
        <div>
            <label className={labelStyles}>
                <span className="mb-2 flex items-center gap-2">
                    <span className="text-slate-400">{icon}</span>
                    {label}
                </span>
            </label>

            {children}

            {error && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

export default function Create({ categorias, canchas }: Props) {
    const { data, setData, post, processing, errors } =
        useForm<HorarioForm>({
            categoria_id: '',
            cancha_id: '',
            dia_semana: '',
            hora_inicio: '',
            hora_fin: '',
        });

    const [categoriaSeleccionada, setCategoriaSeleccionada] =
        useState<Categoria | null>(null);

    const profesorResponsable =
        categoriaSeleccionada?.profesores?.[0] ?? null;

    const seleccionarCategoria = (valor: string) => {
        setData('categoria_id', valor);

        const categoria =
            categorias.find((item) => item.id === Number(valor)) ?? null;

        setCategoriaSeleccionada(categoria);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/horarios');
    };

    return (
        <>
            <PageHeader
                title="Nuevo horario"
                description="Configurá los días y horarios de entrenamiento."
                icon={<CalendarDays size={24} />}
            />

            <div className="mx-auto max-w-5xl space-y-6">
                <form onSubmit={submit} className="space-y-6">
                    {/* Categoría y profesor */}
                    <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                                    <Users size={21} />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-slate-900">
                                        Asignación del horario
                                    </h2>
                                    <p className="mt-0.5 text-sm text-slate-500">
                                        Seleccioná la categoría y consultá su
                                        profesor responsable.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-5 p-6 md:grid-cols-2">
                            <FormField
                                label="Categoría"
                                icon={<Users size={16} />}
                                error={errors.categoria_id}
                            >
                                <select
                                    value={data.categoria_id}
                                    onChange={(e) =>
                                        seleccionarCategoria(e.target.value)
                                    }
                                    className={inputStyles}
                                    required
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
                            </FormField>

                            <FormField
                                label="Profesor responsable"
                                icon={<UserRound size={16} />}
                            >
                                <div
                                    className={`flex min-h-[43px] items-center gap-3 rounded-xl border px-4 py-2.5 ${
                                        profesorResponsable
                                            ? 'border-emerald-200 bg-emerald-50'
                                            : 'border-slate-200 bg-slate-50'
                                    }`}
                                >
                                    {profesorResponsable ? (
                                        <>
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                                <UserRound size={16} />
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {profesorResponsable.apellido},{' '}
                                                    {profesorResponsable.nombre}
                                                </p>
                                                <p className="text-xs text-emerald-700">
                                                    Profesor asignado
                                                </p>
                                            </div>

                                            <CheckCircle2
                                                size={18}
                                                className="ml-auto shrink-0 text-emerald-600"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <Info
                                                size={18}
                                                className="shrink-0 text-slate-400"
                                            />
                                            <p className="text-sm text-slate-500">
                                                {data.categoria_id
                                                    ? 'Sin profesor asignado'
                                                    : 'Seleccioná una categoría'}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </FormField>
                        </div>
                    </section>

                    {/* Ubicación */}
                    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                                    <MapPin size={21} />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-slate-900">
                                        Ubicación
                                    </h2>
                                    <p className="mt-0.5 text-sm text-slate-500">
                                        Indicá la cancha donde se realizará el
                                        entrenamiento.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <FormField
                                label="Cancha"
                                icon={<MapPin size={16} />}
                                error={errors.cancha_id}
                            >
                                <select
                                    value={data.cancha_id}
                                    onChange={(e) =>
                                        setData('cancha_id', e.target.value)
                                    }
                                    className={inputStyles}
                                    required
                                >
                                    <option value="">
                                        Seleccionar cancha
                                    </option>

                                    {canchas.map((cancha) => (
                                        <option
                                            key={cancha.id}
                                            value={cancha.id}
                                        >
                                            {cancha.nombre} —{' '}
                                            {cancha.predio?.nombre ?? 'Sin predio'}
                                        </option>
                                    ))}
                                </select>
                            </FormField>
                        </div>
                    </section>

                    {/* Día y horario */}
                    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                                    <Clock3 size={21} />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-slate-900">
                                        Día y horario
                                    </h2>
                                    <p className="mt-0.5 text-sm text-slate-500">
                                        Definí el día y la duración del
                                        entrenamiento.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-5 p-6 md:grid-cols-3">
                            <FormField
                                label="Día de la semana"
                                icon={<CalendarDays size={16} />}
                                error={errors.dia_semana}
                            >
                                <select
                                    value={data.dia_semana}
                                    onChange={(e) =>
                                        setData('dia_semana', e.target.value)
                                    }
                                    className={inputStyles}
                                    required
                                >
                                    <option value="">Seleccionar día</option>

                                    {diasSemana.map((dia) => (
                                        <option
                                            key={dia.value}
                                            value={dia.value}
                                        >
                                            {dia.label}
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField
                                label="Hora de inicio"
                                icon={<Clock3 size={16} />}
                                error={errors.hora_inicio}
                            >
                                <input
                                    type="time"
                                    value={data.hora_inicio}
                                    onChange={(e) =>
                                        setData('hora_inicio', e.target.value)
                                    }
                                    className={inputStyles}
                                    required
                                />
                            </FormField>

                            <FormField
                                label="Hora de finalización"
                                icon={<Clock3 size={16} />}
                                error={errors.hora_fin}
                            >
                                <input
                                    type="time"
                                    value={data.hora_fin}
                                    onChange={(e) =>
                                        setData('hora_fin', e.target.value)
                                    }
                                    className={inputStyles}
                                    required
                                />
                            </FormField>
                        </div>
                    </section>

                    {/* Información */}
                    <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3.5">
                        <Info
                            size={19}
                            className="mt-0.5 shrink-0 text-blue-600"
                        />

                        <p className="text-sm leading-relaxed text-blue-800">
                            El profesor se asignará automáticamente según la
                            categoría seleccionada. Si la categoría todavía no
                            tiene profesor responsable, el horario podrá
                            crearse igualmente y se actualizará cuando se
                            realice la asignación.
                        </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                        <Link
                            href="/horarios"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            <ArrowLeft size={17} />
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save size={17} />
                            {processing ? 'Guardando...' : 'Guardar horario'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}