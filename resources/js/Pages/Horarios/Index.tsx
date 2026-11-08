import { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import interactionPlugin from '@fullcalendar/react/interaction';
import {
    CalendarDays,
    Clock3,
    Users,
    MapPin,
    Filter,
    CalendarCheck,
    ChevronDown,
} from 'lucide-react';

import themePlugin from '@fullcalendar/react/themes/breezy';

import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/breezy/theme.css';
import '@fullcalendar/react/themes/breezy/palettes/indigo.css';


interface Categoria {
    id: number;
    anio: number;
}

interface Profesor {
    id: number;
    nombre: string;
    apellido: string;
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
    profesor_id: number;
    cancha_id: number;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
    estado: boolean;
    categoria: Categoria;
    profesor: Profesor;
    cancha: Cancha;
}

interface Props {
    horarios: Horario[];
}
interface EventoCalendario {
    id: string;
    title: string;
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    extendedProps: {
        horario: Horario;
    };
}

const diasSemana: Record<string, number> = {
    domingo: 0,
    lunes: 1,
    martes: 2,
    miercoles: 3,
    miércoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
    sábado: 6,
};

const colores = [
    '#bfdbfe', // Azul
    '#bbf7d0', // Verde
    '#ddd6fe', // Violeta
    '#fed7aa', // Naranja
    '#fbcfe8', // Rosa
    '#a5f3fc', // Celeste
    '#c7d2fe', // Índigo
    '#d9f99d', // Lima
];

function obtenerColor(id: number): string {
    return colores[(id - 1) % colores.length];
}

function normalizarDia(dia: string): number | undefined {
    return diasSemana[dia.trim().toLocaleLowerCase('es')];
}

export default function Index({ horarios }: Props) {
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
    const [predioSeleccionado, setPredioSeleccionado] = useState('todos');

    const categorias = useMemo(() => {
        const resultado = new Map<number, Categoria>();

        horarios.forEach((horario) => {
            if (horario.categoria) {
                resultado.set(horario.categoria.id, horario.categoria);
            }
        });

        return Array.from(resultado.values()).sort(
            (a, b) => a.anio - b.anio,
        );
    }, [horarios]);

    const predios = useMemo(() => {
        const resultado = new Map<number, Predio>();

        horarios.forEach((horario) => {
            if (horario.cancha?.predio) {
                resultado.set(
                    horario.cancha.predio.id,
                    horario.cancha.predio,
                );
            }
        });

        return Array.from(resultado.values()).sort((a, b) =>
            a.nombre.localeCompare(b.nombre),
        );
    }, [horarios]);

    const horariosFiltrados = useMemo(() => {
        return horarios.filter((horario) => {
            const coincideCategoria =
                categoriaSeleccionada === 'todas' ||
                String(horario.categoria_id) === categoriaSeleccionada;

            const coincidePredio =
                predioSeleccionado === 'todos' ||
                String(horario.cancha?.predio?.id) === predioSeleccionado;

            return coincideCategoria && coincidePredio;
        });
    }, [horarios, categoriaSeleccionada, predioSeleccionado]);

    const eventos = useMemo<EventoCalendario[]>(() => {
    const resultado: EventoCalendario[] = [];

    horariosFiltrados.forEach((horario) => {
        const dia = normalizarDia(horario.dia_semana);

        // Excluir sábados, domingos y días no reconocidos.
        if (dia === undefined || dia < 1 || dia > 5) {
            return;
        }

        const color = obtenerColor(horario.categoria_id);

        resultado.push({
            id: String(horario.id),
            title: `Categoría ${horario.categoria?.anio ?? '-'}`,
            daysOfWeek: [dia],
            startTime: horario.hora_inicio,
            endTime: horario.hora_fin,
            backgroundColor: color,
            borderColor: color,
            textColor: '#1e293b',
            extendedProps: {
                horario,
            },
        });
    });

    return resultado;
}, [horariosFiltrados]);

    const profesoresUnicos = new Set(
        horariosFiltrados.map((horario) => horario.profesor_id),
    );

    const categoriasActivas = new Set(
        horariosFiltrados.map((horario) => horario.categoria_id),
    );

    const limpiarFiltros = () => {
        setCategoriaSeleccionada('todas');
        setPredioSeleccionado('todos');
    };

    return (
        <>
            <Head title="Horarios" />

            <div className="space-y-6">
                {/* Encabezado */}
                <div className="overflow-hidden rounded-2xl bg-slate-950 shadow-sm">
                    <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                                <CalendarDays size={29} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    Horarios de entrenamiento
                                </h1>
                                <p className="mt-1 text-sm text-slate-300">
                                    Organización semanal de las actividades deportivas.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => router.visit('/horarios/create')}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                        >
                            <CalendarCheck size={18} />
                            Nuevo horario
                        </button>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Entrenamientos
                                </p>
                                <p className="mt-2 text-3xl font-bold text-slate-900">
                                    {horariosFiltrados.length}
                                </p>
                            </div>
                            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                                <Clock3 size={23} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Categorías
                                </p>
                                <p className="mt-2 text-3xl font-bold text-slate-900">
                                    {categoriasActivas.size}
                                </p>
                            </div>
                            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                                <CalendarDays size={23} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Profesores
                                </p>
                                <p className="mt-2 text-3xl font-bold text-slate-900">
                                    {profesoresUnicos.size}
                                </p>
                            </div>
                            <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                                <Users size={23} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter size={18} className="text-slate-500" />
                            <h2 className="font-semibold text-slate-800">
                                Filtros del calendario
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={limpiarFiltros}
                            className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
                        >
                            Limpiar filtros
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Categoría
                            </label>

                            <div className="relative">
                                <select
                                    value={categoriaSeleccionada}
                                    onChange={(e) =>
                                        setCategoriaSeleccionada(e.target.value)
                                    }
                                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="todas">
                                        Todas las categorías
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

                                <ChevronDown
                                    size={17}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Predio
                            </label>

                            <div className="relative">
                                <select
                                    value={predioSeleccionado}
                                    onChange={(e) =>
                                        setPredioSeleccionado(e.target.value)
                                    }
                                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="todos">
                                        Todos los predios
                                    </option>

                                    {predios.map((predio) => (
                                        <option
                                            key={predio.id}
                                            value={predio.id}
                                        >
                                            {predio.nombre}
                                        </option>
                                    ))}
                                </select>

                                <ChevronDown
                                    size={17}
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Referencias de colores */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                        <MapPin size={18} className="text-slate-500" />
                        <h2 className="font-semibold text-slate-800">
                            Referencias de categorías
                        </h2>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-3">
                        {categorias.map((categoria) => (
                            <div
                                key={categoria.id}
                                className="flex items-center gap-2"
                            >
                                <span
                                    className="h-3 w-3 rounded-full"
                                    style={{
                                        backgroundColor: obtenerColor(categoria.id),
                                    }}
                                />

                                <span className="text-sm text-slate-600">
                                    Categoría {categoria.anio}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calendario */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-slate-900">
                            Calendario semanal
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Entrenamientos programados de lunes a viernes.
                        </p>
                    </div>

                    <div className="horarios-calendar">
                        <FullCalendar
                            plugins={[
                            themePlugin,
                            timeGridPlugin,
                            dayGridPlugin,
                            interactionPlugin,
                        ]}
                            initialView="timeGridWeek"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'timeGridWeek,timeGridDay,dayGridMonth',
                            }}
                            buttons={{
                                today: {
                                    text: 'Hoy',
                                },
                                timeGridWeek: {
                                    text: 'Semana',
                                },
                                timeGridDay: {
                                    text: 'Día',
                                },
                                dayGridMonth: {
                                    text: 'Mes',
                                },
                            }}
                            locale="es"
                            firstDay={1}
                            weekends={false}
                            hiddenDays={[0, 6]}
                            allDaySlot={false}
                            slotDuration="00:30:00"
                            slotHeaderInterval="01:00"
                            expandRows={true}
                            height="auto"
                            nowIndicator={true}
                            editable={false}
                            selectable={false}
                            events={eventos}
                            eventClick={(info) => {
                                router.visit(
                                    `/horarios/${info.event.id}`,
                                );
                            }}
                            eventContent={(info) => {
                                const horario = info.event.extendedProps
                                    .horario as Horario;

                                return (
                                    <div className="h-full overflow-hidden px-1 py-0.5 text-left leading-tight">
                                        <div className="truncate text-xs font-bold">
                                            Categoría {horario.categoria?.anio}
                                        </div>

                                        <div className="mt-1 truncate text-[11px]">
                                            {horario.profesor?.apellido},{' '}
                                            {horario.profesor?.nombre}
                                        </div>

                                        <div className="mt-0.5 truncate text-[11px] opacity-90">
                                            {horario.cancha?.predio?.nombre}
                                        </div>

                                        <div className="truncate text-[11px] opacity-90">
                                            {horario.cancha?.nombre}
                                        </div>
                                    </div>
                                );
                            }}
                        />
                    </div>
                </div>
            </div>

            <style>{`
                .horarios-calendar {
                    --fc-border-color: #e2e8f0;
                    --fc-page-bg-color: #ffffff;
                    --fc-neutral-bg-color: #f8fafc;
                    --fc-today-bg-color: #eff6ff;
                    --fc-now-indicator-color: #ef4444;
                    font-size: 13px;
                }

                .horarios-calendar .fc {
                    font-family: inherit;
                }

                .horarios-calendar .fc .fc-toolbar-title {
                    color: #0f172a;
                    font-size: 1.15rem;
                    font-weight: 700;
                    text-transform: capitalize;
                }

                .horarios-calendar .fc .fc-button {
                    border: 1px solid #e2e8f0;
                    background: #ffffff;
                    color: #334155;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: capitalize;
                    box-shadow: none;
                }

                .horarios-calendar .fc .fc-button:hover {
                    border-color: #cbd5e1;
                    background: #f1f5f9;
                    color: #0f172a;
                }

                .horarios-calendar .fc .fc-button-primary:not(:disabled).fc-button-active,
                .horarios-calendar .fc .fc-button-primary:not(:disabled):active {
                    border-color: #0f172a;
                    background: #0f172a;
                    color: #ffffff;
                }

                .horarios-calendar .fc .fc-button:focus {
                    box-shadow: none;
                }

                .horarios-calendar .fc .fc-col-header-cell {
                    background: #f8fafc;
                    padding: 10px 0;
                }

                .horarios-calendar .fc .fc-col-header-cell-cushion {
                    color: #475569;
                    font-weight: 600;
                    text-decoration: none;
                }

                .horarios-calendar .fc .fc-timegrid-slot-label {
                    color: #64748b;
                    font-size: 11px;
                }

                .horarios-calendar .fc .fc-event {
                    border-radius: 6px;
                    cursor: pointer;
                    padding: 2px;
                }

                .horarios-calendar .fc .fc-event:hover {
                    filter: brightness(0.95);
                }

                .horarios-calendar .fc .fc-daygrid-day-number {
                    color: #475569;
                    text-decoration: none;
                }

                @media (max-width: 640px) {
                    .horarios-calendar .fc .fc-toolbar {
                        display: flex;
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                    }

                    .horarios-calendar .fc .fc-toolbar-title {
                        text-align: center;
                    }

                    .horarios-calendar .fc .fc-toolbar-chunk {
                        display: flex;
                        justify-content: center;
                    }
                }
            `}</style>
        </>
    );
}