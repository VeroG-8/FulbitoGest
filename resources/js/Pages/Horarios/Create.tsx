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

interface Props {
    categorias: Categoria[];
    canchas: Cancha[];
}

interface HorarioForm {
    categoria_id: string;
    profesor_id: string;
    cancha_id: string;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
}

const inputStyles =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

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

export default function Create({ categorias, canchas }: Props) {
    const { data, setData, post, processing, errors } =
        useForm<HorarioForm>({
            categoria_id: '',
            profesor_id: '',
            cancha_id: '',
            dia_semana: '',
            hora_inicio: '',
            hora_fin: '',
        });

    const categoriaSeleccionada = categorias.find(
        (categoria) => String(categoria.id) === data.categoria_id,
    );

    const profesoresDisponibles =
        categoriaSeleccionada?.profesores ?? [];

    const submit = (e: FormEvent) => {
        e.preventDefault();

        post('/horarios');
    };

    return (
        <>
            <PageHeader
                title="Nuevo horario"
                description="Asigná días, horarios, profesores y canchas para los entrenamientos."
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
                                    Seleccioná la categoría y su profesor responsable.
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
                                    onChange={(e) => {
                                        setData('categoria_id', e.target.value);
                                        setData('profesor_id', '');
                                    }}
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
                                        >
                                            Categoría {categoria.anio}
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField
                                label="Profesor responsable"
                                icon={<UserRound size={17} />}
                                error={errors.profesor_id}
                            >
                                <select
                                    value={data.profesor_id}
                                    onChange={(e) =>
                                        setData('profesor_id', e.target.value)
                                    }
                                    className={inputStyles}
                                    disabled={!data.categoria_id}
                                    required
                                >
                                    <option value="">
                                        {!data.categoria_id
                                            ? 'Primero seleccioná una categoría'
                                            : profesoresDisponibles.length === 0
                                              ? 'No hay profesores asignados'
                                              : 'Seleccioná un profesor'}
                                    </option>

                                    {profesoresDisponibles.map((profesor) => (
                                        <option
                                            key={profesor.id}
                                            value={profesor.id}
                                        >
                                            {profesor.apellido}, {profesor.nombre}
                                        </option>
                                    ))}
                                </select>

                                {data.categoria_id && (
                                    <p className="mt-2 text-xs text-slate-500">
                                        Solo se muestran los profesores asignados a esta categoría.
                                    </p>
                                )}
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
                                    Indicá dónde se realizará el entrenamiento.
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
                                            {cancha.predio?.nombre ?? 'Predio'} — {cancha.nombre}
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
                                    Definí cuándo se realizará el entrenamiento.
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
                            Los horarios se asignan de lunes a viernes.
                            El sistema verifica que no existan superposiciones
                            para la misma categoría, profesor o cancha.
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
                                : 'Guardar horario'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}