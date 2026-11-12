import { useForm, Link } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
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
    predio_id: number;
    predio: Predio;
}

interface Horario {
    id: number;
    categoria_id: number;
    profesor_id: number | null;
    cancha_id: number;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
}

interface Props {
    horario: Horario;
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

const inputStyles =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400';

const labelStyles =
    'mb-2 block text-sm font-semibold text-slate-700';

const diasSemana = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
];

interface FormFieldProps {
    label: string;
    icon: ReactNode;
    error?: string;
    children: ReactNode;
}

function FormField({ label, icon, error, children }: FormFieldProps) {
    return (
        <div>
            <label className={labelStyles}>
                <span className="flex items-center gap-2">
                    <span className="text-slate-400">{icon}</span>
                    {label}
                </span>
            </label>

            {children}

            {error && (
                <p className="mt-2 text-sm font-medium text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

function normalizarDia(dia: string): string {
    return dia
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

export default function Edit({
    horario,
    categorias,
    canchas,
}: Props) {
    const { data, setData, put, processing, errors } =
        useForm<HorarioForm>({
            categoria_id: String(horario.categoria_id),
            cancha_id: String(horario.cancha_id),
            dia_semana: normalizarDia(horario.dia_semana),
            hora_inicio: horario.hora_inicio.slice(0, 5),
            hora_fin: horario.hora_fin.slice(0, 5),
        });

    const categoriaSeleccionada = categorias.find(
        (categoria) => String(categoria.id) === data.categoria_id,
    );

    const profesorResponsable =
        categoriaSeleccionada?.profesores?.[0] ?? null;

    const submit = (e: FormEvent) => {
        e.preventDefault();

        put(`/horarios/${horario.id}`);
    };

    return (
        <>
            <PageHeader
                title="Editar horario"
                description="Modificá los días, horarios o cancha del entrenamiento."
                icon={<CalendarDays size={28} />}
                actions={
                    <Link
                        href="/horarios"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                        <ArrowLeft size={17} />
                        Volver
                    </Link>
                }
            />

            <div className="space-y-6">
                <form onSubmit={submit} className="space-y-6">

                    {/* Información del entrenamiento */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Users size={20} />
                            </div>

                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    Información del entrenamiento
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Modificá la categoría y consultá su profesor responsable.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
                            <FormField
                                label="Categoría"
                                icon={<Users size={17} />}
                                error={errors.categoria_id}
                            >
                                <select
                                    value={data.categoria_id}
                                    onChange={(e) =>
                                        setData('categoria_id', e.target.value)
                                    }
                                    className={inputStyles}
                                    required
                                >
                                    <option value="">
                                        Seleccioná una categoría
                                    </option>

                                    {categorias.map((categoria) => (
                                        <option
                                            key={categoria.id}
                                            value={categoria.id}
                                        >Categoría {categoria.anio}
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField
                                label="Profesor responsable"
                                icon={<UserRound size={17} />}
                            >
                                <div
                                    className={`flex min-h-[49px] items-center gap-3 rounded-xl border px-4 py-2.5 ${
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
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <MapPin size={20} />
                            </div>

                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    Ubicación
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Modificá el lugar donde se realizará el entrenamiento.
                                </p>
                            </div>
                        </div>

                        <div className="p-6">
                            <FormField
                                label="Cancha"
                                icon={<MapPin size={17} />}
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
                                        Seleccioná una cancha
                                    </option>

                                    {canchas.map((cancha) => (
                                        <option
                                            key={cancha.id}
                                            value={cancha.id}
                                        >
                                            {cancha.predio?.nombre ?? 'Predio'} —{' '}
                                            {cancha.nombre}
                                        </option>
                                    ))}
                                </select>
                            </FormField>
                        </div>
                    </section>

                    {/* Día y horario */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                <Clock3 size={20} />
                            </div>

                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    Día y horario
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Modificá cuándo se realizará el entrenamiento.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
                            <FormField
                                label="Día de la semana"
                                icon={<CalendarDays size={17} />}
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
                                    <option value="">
                                        Seleccioná un día
                                    </option>

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
                                icon={<Clock3 size={17} />}
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
                                icon={<Clock3 size={17} />}
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
                    <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
                        <Info
                            size={20}
                            className="mt-0.5 shrink-0 text-blue-600"
                        />

                        <p className="text-sm leading-relaxed text-blue-800">
                            El profesor se obtiene automáticamente de la
                            categoría seleccionada. El sistema verifica que
                            no existan superposiciones para la misma categoría,
                            profesor o cancha.
                        </p>
                    </div>

                    {/* Botones */}
                    <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-200 pt-5 sm:flex-row">
                        <Link
                            href="/horarios"
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save size={18} />
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