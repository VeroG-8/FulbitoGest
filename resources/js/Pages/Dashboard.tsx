
import { useMemo, useState,  } from 'react';
import { Head, usePage, Link, router } from '@inertiajs/react';
import StatCard from '@/Components/Shared/StatCard';
import StatusBadge from '@/Components/Shared/StatusBadge';

import {
    Users,
    GraduationCap,
    Trophy,
    Wallet,
    CalendarDays,
    CalendarCheck,
    CalendarClock,
    CalendarX,
    AlertTriangle,
    UserRound,
    ArrowRight,
    ShieldCheck,
    ClipboardList,
    CreditCard,
    CheckCircle2,
    Clock3,
    CircleUserRound,
    ShieldUser,
} from 'lucide-react';

const formatoMoneda = (valor: number | string | null | undefined) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
    }).format(Number(valor ?? 0));
};

const nombresMeses = [
    '',
    'Enero', 'Febrero', 'Marzo', 'Abril',
    'Mayo', 'Junio', 'Julio', 'Agosto',
    'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const obtenerPeriodo = (mes: number | null, anio: number | null) => {
    if (!mes || !anio) return 'Sin período';

    return `${nombresMeses[mes] ?? ''} ${anio}`;
};

export default function Dashboard() {
        const {
            auth,
            estadisticas: datosEstadisticos,
            datosAdministrador,
            datosTutor,
            datosProfesor,
        } = usePage().props as any;

        const user = auth.user;

        // Filtros del gráfico de cuotas del tutor
        const [anioCuotasTutor, setAnioCuotasTutor] = useState(
            String(datosTutor?.anio_cuotas_grafico ?? new Date().getFullYear())
        );

        const [jugadorCuotasTutor, setJugadorCuotasTutor] = useState(
            String(datosTutor?.jugador_cuotas_grafico ?? 'todos')
        );

        // Filtro de cuotas del administrador
        const [categoriaCuotasSeleccionada, setCategoriaCuotasSeleccionada] = useState('todas');

        const categoriasCuotas = datosAdministrador?.categorias_cuotas ?? [];


        const datosCuotasAdministrador = useMemo(() => {
            if (categoriaCuotasSeleccionada === 'todas') {
                return {
                    datos: datosAdministrador?.estado_cuotas ?? [],
                    total: Number(datosAdministrador?.total_cuotas ?? 0),
                };
            }

            const categoria = categoriasCuotas.find(
                (item: any) => String(item.id) === categoriaCuotasSeleccionada
            );

            if (!categoria) {
                return { datos: [], total: 0 };
            }

            return {
                datos: [
                    { estado: 'Vencidas', total: Number(categoria.vencidas ?? 0) },
                    { estado: 'Pendientes', total: Number(categoria.pendientes ?? 0) },
                    { estado: 'Abonadas', total: Number(categoria.pagadas ?? categoria.abonadas ?? 0) },
                ],
                total: Number(categoria.total ?? 0),
            };
        }, [
            categoriaCuotasSeleccionada,
            datosAdministrador?.estado_cuotas,
            datosAdministrador?.total_cuotas,
            categoriasCuotas,
        ]);

        const [anioCuotasSeleccionado, setAnioCuotasSeleccionado] = useState(
        String(datosAdministrador?.anio_cuotas ?? new Date().getFullYear())
    );

    const cambiarAnioCuotas = (anio: string) => {
        setAnioCuotasSeleccionado(anio);

        router.get(
            window.location.pathname,
            { anio_cuotas: anio },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };
    const cambiarFiltrosCuotasTutor = (
        anio: string,
        jugador: string
    ) => {
        setAnioCuotasTutor(anio);
        setJugadorCuotasTutor(jugador);

        router.get(
            window.location.pathname,
            {
                anio_cuotas_tutor: anio,
                jugador_cuotas_tutor: jugador,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };
    const esAdministrador = ['superadmin', 'admin'].includes(user.rol);

    const roles: Record<string, string> = {
        superadmin: 'Superadministrador',
        admin: 'Administrador',
        profesor: 'Profesor',
        tutor: 'Tutor',
    };

    const accesosGestion = [
        {
            titulo: 'Jugadores',
            descripcion: 'Gestionar jugadores de la institución',
            icono: <Users size={23} />,
            color: 'bg-blue-100 text-blue-600',
            ruta: 'jugadores.index',
        },
        {
            titulo: 'Profesores',
            descripcion: 'Consultar y administrar profesores',
            icono: <GraduationCap size={23} />,
            color: 'bg-purple-100 text-purple-600',
            ruta: 'profesores.index',
        },
        {
            titulo: 'Equipos',
            descripcion: 'Gestionar equipos deportivos',
            icono: <ShieldCheck size={23} />,
            color: 'bg-emerald-100 text-emerald-600',
            ruta: 'equipos.index',
        },
        {
            titulo: 'Torneos',
            descripcion: 'Consultar y administrar torneos',
            icono: <Trophy size={23} />,
            color: 'bg-amber-100 text-amber-600',
            ruta: 'torneos.index',
        },
    ];

    const accesosProfesor = [
        {
            titulo: 'Mis jugadores',
            descripcion: 'Consultar jugadores de mis categorías',
            icono: <Users size={22} />,
            ruta: 'jugadores.index',
        },
    ];

    const accesosTutor = [
        {
            titulo: 'Mis jugadores',
            descripcion: 'Consultar información de mis jugadores',
            icono: <Users size={22} />,
            ruta: 'jugadores.index',
        },
        {
            titulo: 'Mi perfil',
            descripcion: 'Consultar mis datos personales',
            icono: <UserRound size={22} />,
            ruta: 'profile.edit',
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="mx-auto max-w-7xl space-y-8">

                {/* Bienvenida */}
                <section className="rounded-2xl bg-slate-950 p-7 text-white shadow-lg sm:p-9">
                    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                        <div>
                            <p className="mb-2 text-sm font-medium text-emerald-400">
                                SISTEMA DE GESTIÓN DEPORTIVA
                            </p>

                            <h1 className="text-2xl font-bold sm:text-3xl">
                                ¡Bienvenido/a, {user.name}!
                            </h1>

                            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-4 py-1.5 text-sm font-bold text-emerald-300 shadow-sm">
                                <ShieldUser size={16} />
                                {roles[user.rol] ?? user.rol}
                            </div>

                            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
                                Desde aquí podés acceder a las herramientas
                                disponibles para gestionar y consultar la
                                información de la institución.
                            </p>
                        </div>

                       <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-400 bg-slate-800 shadow-lg">
                            {user.foto ? (
                                <img
                                    src={`/storage/${user.foto}`}
                                    alt={`Foto de ${user.name}`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <CircleUserRound size={50} className="text-emerald-400" />
                            )}
                        </div>
                    </div>
                </section>

             

                {/* ================================================== */}
                {/* ADMINISTRADOR */}
                {/* ================================================== */}

               {esAdministrador && (
    <>
        {/* Resumen institucional */}
        <section>
            <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-800">
                    Resumen de la institución
                </h2>
                <p className="text-sm text-slate-500">
                    Estado actual de la escuela de fútbol.
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                    title="Jugadores activos"
                    value={datosEstadisticos?.jugadoresActivos ?? 0}
                    icon={<Users size={23} />}
                    color="emerald"
                />

                <StatCard
                    title="Categorías activas"
                    value={datosEstadisticos?.categoriasActivas ?? 0}
                    icon={<ClipboardList size={23} />}
                    color="amber"
                />

                <StatCard
                    title="Profesores activos"
                    value={datosEstadisticos?.profesoresActivos ?? 0}
                    icon={<GraduationCap size={23} />}
                    color="violet"
                />
            </div>
        </section>

        {/* Indicadores institucionales */}
        <section>
            <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-800">
                    Indicadores institucionales
                </h2>
                <p className="text-sm text-slate-500">
                    Distribución de jugadores y situación de las cuotas mensuales.
                </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <GraficoBarras
                    titulo="Jugadores por categoría"
                    descripcion="Cantidad de jugadores activos en cada categoría."
                    datos={datosAdministrador?.jugadores_por_categoria ?? []}
                    etiqueta={(item: any) => `Cat. ${item.categoria ?? 's/a'}`}
                    valor={(item: any) => Number(item.total ?? 0)}
                    color="emerald"
                />

                <div className="space-y-3">
                   
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="w-full sm:max-w-xs">
                        <label
                            htmlFor="anio-cuotas"
                            className="mb-1 block text-sm font-medium text-slate-600"
                        >
                            Filtrar por año
                        </label>

                        <select
                            id="anio-cuotas"
                            value={anioCuotasSeleccionado}
                            onChange={(event) => cambiarAnioCuotas(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        >
                            {(datosAdministrador?.anios_cuotas ?? []).map((anio: number) => (
                                <option key={anio} value={String(anio)}>
                                    {anio}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full sm:max-w-xs">
                        <label
                            htmlFor="categoria-cuotas"
                            className="mb-1 block text-sm font-medium text-slate-600"
                        >
                            Filtrar por categoría
                        </label>

                        <select
                            id="categoria-cuotas"
                            value={categoriaCuotasSeleccionada}
                            onChange={(event) => setCategoriaCuotasSeleccionada(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        >
                            <option value="todas">Todas las categorías</option>

                            {categoriasCuotas.map((categoria: any) => (
                                <option key={categoria.id} value={String(categoria.id)}>
                                    Categoría {categoria.categoria ?? categoria.anio ?? categoria.id}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                    <GraficoCircular
                        titulo="Estado de cuotas"
                        descripcion="Distribución de las cuotas mensuales según saldo y vencimiento."
                        datos={datosCuotasAdministrador.datos}
                        total={datosCuotasAdministrador.total}
                    />
                </div>
            </div>
        </section>
    </>
)}

                {/* ================================================== */}
                {/* PROFESOR */}
                {/* ================================================== */}

                {user.rol === 'profesor' && (
                    <>
                        <section>
                            <div className="mb-4">
                                <h2 className="text-lg font-bold text-slate-800">
                                    Mi actividad deportiva
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Información de tus categorías y jugadores asignados.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                <StatCard
                                    title="Mis categorías"
                                    value={datosProfesor?.total_categorias ?? 0}
                                    description="Categorías asignadas"
                                    icon={<ClipboardList size={23} />}
                                    color="violet"
                                />

                                <StatCard
                                    title="Jugadores a cargo"
                                    value={datosProfesor?.total_jugadores ?? 0}
                                    description="Jugadores de mis categorías"
                                    icon={<Users size={23} />}
                                    color="blue"
                                />

                                <StatCard
                                    title="Horarios activos"
                                    value={datosProfesor?.total_horarios ?? 0}
                                    description="Entrenamientos programados"
                                    icon={<CalendarCheck size={23} />}
                                    color="emerald"
                                />
                            </div>
                        </section>

                        <section>
                            <div className="mb-4">
                                <h2 className="text-lg font-bold text-slate-800">Resumen de jugadores</h2>
                                <p className="text-sm text-slate-500">Distribución de los jugadores activos de tus categorías.</p>
                            </div>
                            <GraficoBarras
                                titulo="Jugadores por categoría"
                                descripcion="Cantidad de jugadores activos asignados."
                                datos={datosProfesor?.categorias ?? []}
                                etiqueta={(item: any) => `Cat. ${item.anio ?? 's/a'}`}
                                valor={(item: any) => Number(item.total_jugadores ?? 0)}
                                color="blue"
                            />
                        </section>

                        <div className="grid gap-4 xl:grid-cols-2">
                            <PanelAlertas
                                titulo="Categorías sin horarios"
                                descripcion="Categorías que todavía no tienen entrenamientos activos asignados."
                                icono={<CalendarX size={21} />}
                                vacio="Todas tus categorías tienen horarios activos."
                                cantidad={datosProfesor?.total_categorias_sin_horario ?? 0}
                            >
                                {(datosProfesor?.categorias_sin_horario ?? []).map((categoria: any) => (
                                    <div key={categoria.id} className="flex items-center gap-3 rounded-lg border border-amber-100 bg-amber-50/70 p-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700"><CalendarX size={18} /></div>
                                        <p className="font-semibold text-slate-700">Categoría {categoria.anio ?? 'Sin año'}</p>
                                    </div>
                                ))}
                            </PanelAlertas>

                            <PanelAlertas
                                titulo="Próximos entrenamientos"
                                descripcion="Tus siguientes actividades programadas."
                                icono={<CalendarClock size={21} />}
                                vacio="No tenés entrenamientos próximos registrados."
                                cantidad={(datosProfesor?.proximos_entrenamientos ?? []).length}
                            >
                                {(datosProfesor?.proximos_entrenamientos ?? []).map((horario: any) => (
                                    <div key={horario.id} className="rounded-lg border border-slate-200 p-3">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="font-semibold text-slate-800">Categoría {horario.categoria_anio ?? 's/a'}</p>
                                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{horario.dia} · {horario.fecha}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-600">{horario.hora_inicio} a {horario.hora_fin}</p>
                                        <p className="mt-1 text-xs text-slate-500">{[horario.cancha, horario.predio].filter(Boolean).join(' · ') || 'Lugar no especificado'}</p>
                                    </div>
                                ))}
                            </PanelAlertas>
                        </div>

                        <section>
                            <div className="mb-4">
                                <h2 className="text-lg font-bold text-slate-800">
                                    Mis categorías
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Jugadores pertenecientes a cada categoría asignada.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {datosProfesor?.categorias?.length > 0 ? (
                                    datosProfesor.categorias.map((categoria: any) => (
                                        <div
                                            key={categoria.id}
                                            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                                        >
                                            <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center">
                                                <div>
                                                    <h3 className="font-bold text-slate-800">
                                                        Categoría {categoria.anio ?? 'Sin año'}
                                                    </h3>
                                                </div>

                                                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                                                    {categoria.total_jugadores} jugadores
                                                </span>
                                            </div>

                                            <div className="p-5">
                                                {categoria.jugadores.length > 0 ? (
                                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                        {categoria.jugadores.map((jugador: any) => (
                                                            <div
                                                                key={jugador.id}
                                                                className="flex items-center gap-3 rounded-lg border border-slate-100 p-3"
                                                            >
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                                                    <UserRound size={19} />
                                                                </div>

                                                                <p className="text-sm font-medium text-slate-700">
                                                                    {jugador.apellido}, {jugador.nombre}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-500">
                                                        Esta categoría todavía no tiene jugadores activos.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <MensajeVacio mensaje="Todavía no tenés categorías asignadas." />
                                )}
                            </div>
                        </section>

                        <section>
                            <h2 className="mb-4 text-lg font-bold text-slate-800">
                                Accesos rápidos
                            </h2>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {accesosProfesor.map((item) => (
                                    <AccesoRapido key={item.titulo} {...item} />
                                ))}
                            </div>
                        </section>
                    </>
                )}

                {/* ================================================== */}
                {/* TUTOR */}
                {/* ================================================== */}

                {user.rol === 'tutor' && (
                    <>
                        {datosTutor ? (
                            <>
                                {/* Resumen general */}
                                <section>
                                    <div className="mb-4">
                                        <h2 className="text-lg font-bold text-slate-800">
                                            Resumen familiar
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            Estado general de tus jugadores y sus cuotas mensuales.
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-3">
                                        <StatCard
                                            title="Jugadores a cargo"
                                            value={datosTutor.total_jugadores ?? 0}
                                            description="Jugadores vinculados"
                                            icon={<Users size={23} />}
                                            color="blue"
                                        />
                                        <StatCard
                                            title="Jugadores activos"
                                            value={datosTutor.total_jugadores_activos ?? 0}
                                            description="Jugadores en actividad"
                                            icon={<CheckCircle2 size={23} />}
                                            color="emerald"
                                        />

                                        <StatCard
                                            title="Cuotas por cancelar"
                                            value={(datosTutor.total_cuotas_pendientes ?? 0)+(datosTutor.total_cuotas_parciales ?? 0)}
                                            description="Cuotas sin cancelar"
                                            icon={<Clock3 size={23} />}
                                            color="amber"
                                        />

                                      
                                    </div>
                                </section>

                                {/* Gráficos y alertas del tutor */}
                                <section>
                                    <div className="mb-4">
                                        <h2 className="text-lg font-bold text-slate-800">
                                            Resumen de cuotas
                                        </h2>

                                        <p className="text-sm text-slate-500">
                                            Estado de las cuotas mensuales según el año y el jugador seleccionado.
                                        </p>
                                    </div>

                                    <div className="mb-5 grid gap-3 sm:grid-cols-2">

                                        {/* Filtro por año */}
                                        <div>
                                            <label
                                                htmlFor="anio-cuotas-tutor"
                                                className="mb-1.5 block text-sm font-medium text-slate-700"
                                            >
                                                Año
                                            </label>

                                            <select
                                                id="anio-cuotas-tutor"
                                                value={anioCuotasTutor}
                                                onChange={(e) =>
                                                    cambiarFiltrosCuotasTutor(
                                                        e.target.value,
                                                        jugadorCuotasTutor
                                                    )
                                                }
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                            >
                                                {(datosTutor.anios_cuotas_grafico ?? []).map((anio: number) => (
                                                    <option key={anio} value={String(anio)}>
                                                        {anio}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Filtro por jugador */}
                                        <div>
                                            <label
                                                htmlFor="jugador-cuotas-tutor"
                                                className="mb-1.5 block text-sm font-medium text-slate-700"
                                            >
                                                Jugador
                                            </label>

                                            <select
                                                id="jugador-cuotas-tutor"
                                                value={jugadorCuotasTutor}
                                                onChange={(e) =>
                                                    cambiarFiltrosCuotasTutor(
                                                        anioCuotasTutor,
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                            >
                                                <option value="todos">
                                                    Todos los jugadores
                                                </option>

                                                {(datosTutor.jugadores_filtro_cuotas ?? []).map((jugador: any) => (
                                                    <option key={jugador.id} value={String(jugador.id)}>
                                                        {jugador.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 xl:grid-cols-2">
                                        <GraficoCircular
                                            titulo="Estado de cuotas"
                                            descripcion={`Cuotas mensuales de ${jugadorCuotasTutor === 'todos'
                                                ? 'todos los jugadores'
                                                : datosTutor.jugadores_filtro_cuotas?.find(
                                                    (j: any) => String(j.id) === jugadorCuotasTutor
                                                )?.nombre ?? 'jugador seleccionado'
                                            } durante ${anioCuotasTutor}.`}
                                            datos={datosTutor.estado_cuotas ?? []}
                                            total={datosTutor.total_cuotas_grafico ?? 0}
                                        />
                                    </div>
                                </section>

                                <div className="grid gap-4 xl:grid-cols-2">
                                    <PanelAlertas
                                        titulo="Cuotas vencidas"
                                        descripcion="Cuotas mensuales con saldo pendiente y vencimiento pasado."
                                        icono={<AlertTriangle size={21} />}
                                        vacio="No tenés cuotas vencidas pendientes."
                                        cantidad={datosTutor.total_cuotas_vencidas ?? 0}
                                    >
                                        {(datosTutor.cuotas_vencidas ?? []).map((cuota: any) => (
                                            <div key={cuota.id} className="flex flex-col justify-between gap-2 rounded-lg border border-rose-100 bg-rose-50/60 p-3 sm:flex-row sm:items-center">
                                                <div>
                                                    <p className="font-semibold text-slate-800">{cuota.jugador}</p>
                                                    <p className="text-xs text-slate-500">{cuota.cuota ?? 'Cuota'} · Venció el {cuota.fecha_vencimiento}</p>
                                                </div>
                                                <p className="font-bold text-rose-700">{formatoMoneda(cuota.saldo)}</p>
                                            </div>
                                        ))}
                                    </PanelAlertas>

                                    <PanelAlertas
                                        titulo="Próximos vencimientos"
                                        descripcion="Cuotas que vencen durante los próximos siete días."
                                        icono={<CalendarClock size={21} />}
                                        vacio="No hay vencimientos próximos."
                                        cantidad={(datosTutor.proximos_vencimientos ?? []).length}
                                    >
                                        {(datosTutor.proximos_vencimientos ?? []).map((cuota: any) => (
                                            <div key={cuota.id} className="flex flex-col justify-between gap-2 rounded-lg border border-amber-100 bg-amber-50/60 p-3 sm:flex-row sm:items-center">
                                                <div>
                                                    <p className="font-semibold text-slate-800">{cuota.jugador}</p>
                                                    <p className="text-xs text-slate-500">{cuota.cuota ?? 'Cuota'} · Vence el {cuota.fecha_vencimiento}</p>
                                                </div>
                                                <p className="font-bold text-amber-700">{formatoMoneda(cuota.saldo)}</p>
                                            </div>
                                        ))}
                                    </PanelAlertas>
                                </div>

                                
                            </>
                        ) : (
                            <MensajeVacio mensaje="Tu usuario todavía no tiene un tutor vinculado. Contactá al administrador de la institución." />
                        )}

                        {/* Accesos del tutor */}
                        <section>
                            <h2 className="mb-4 text-lg font-bold text-slate-800">
                                Accesos rápidos
                            </h2>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {accesosTutor.map((item) => (
                                    <AccesoRapido key={item.titulo} {...item} />
                                ))}
                            </div>
                        </section>
                    </>
                )}

                {/* Pie */}
                <div className="border-t border-slate-200 pt-5">
                    <p className="text-center text-xs text-slate-400">
                        FulbitoGest · Sistema de gestión deportiva
                    </p>
                </div>
            </div>
        </>
    );
}

/* ================================================== */
/* COMPONENTES REUTILIZABLES */
/* ================================================== */

function GraficoBarras({
    titulo,
    descripcion,
    datos,
    etiqueta,
    valor,
    color = 'emerald',
}: {
    titulo: string;
    descripcion: string;
    datos: any[];
    etiqueta: (item: any) => string;
    valor: (item: any) => number;
    color?: 'emerald' | 'blue';
}) {
    const maximo = Math.max(...datos.map(valor), 1);
    const colorBarra = color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500';

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
                <h3 className="font-bold text-slate-800">{titulo}</h3>
                <p className="mt-1 text-xs text-slate-500">{descripcion}</p>
            </div>
            {datos.length > 0 ? (
                <div className="space-y-4">
                    {datos.map((item, index) => {
                        const cantidad = Math.max(0, valor(item));
                        const porcentaje = cantidad === 0 ? 0 : Math.max(4, (cantidad / maximo) * 100);
                        return (
                            <div key={`${etiqueta(item)}-${index}`}>
                                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                                    <span className="font-medium text-slate-700">{etiqueta(item)}</span>
                                    <span className="font-bold tabular-nums text-slate-800">{cantidad}</span>
                                </div>
                                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                    <div className={`h-full rounded-full ${colorBarra} transition-all`} style={{ width: `${porcentaje}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <MensajeVacio mensaje="Todavía no hay datos suficientes para mostrar este gráfico." />
            )}
        </div>
    );
}

function GraficoCircular({
    titulo,
    descripcion,
    datos,
    total,
}: {
    titulo: string;
    descripcion: string;
    datos: { estado: string; total: number }[];
    total: number;
}) {
    const obtenerTotal = (...prefijos: string[]) => {
        const dato = datos.find((item) =>
            prefijos.some((prefijo) =>
                String(item.estado ?? '').toLowerCase().startsWith(prefijo)
            )
        );

        return Number(dato?.total ?? 0);
    };

    const segmentos = [
        { nombre: 'Vencidas', color: '#ef4444', valor: obtenerTotal('venc') },
        { nombre: 'Pendientes', color: '#f59e0b', valor: obtenerTotal('pend') },
        { nombre: 'Abonadas', color: '#10b981', valor: obtenerTotal('abon', 'pagad') },
    ];
    let acumulado = 0;
    const totalSegmentos = segmentos.reduce((suma, segmento) => suma + segmento.valor, 0);
    const totalGrafico = totalSegmentos > 0 ? totalSegmentos : Number(total ?? 0);

    const gradiente = totalGrafico > 0
        ? `conic-gradient(${segmentos.map((segmento) => {
            const inicio = acumulado;
            acumulado += (segmento.valor / totalGrafico) * 100;
            return `${segmento.color} ${inicio}% ${acumulado}%`;
        }).join(', ')})`
        : '#e2e8f0';

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
                <h3 className="font-bold text-slate-800">{titulo}</h3>
                <p className="mt-1 text-xs text-slate-500">{descripcion}</p>
            </div>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
                <div className="relative h-36 w-36 shrink-0 rounded-full" style={{ background: gradiente }}>
                    <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white">
                        <span className="text-2xl font-bold text-slate-800">{totalGrafico}</span>
                        <span className="text-xs text-slate-500">Cuotas</span>
                    </div>
                </div>
                <div className="w-full space-y-3 sm:max-w-xs">
                    {segmentos.map((segmento) => (
                        <div key={segmento.nombre} className="flex items-center justify-between gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: segmento.color }} />
                                <span className="text-slate-600">{segmento.nombre}</span>
                            </div>
                            <span className="font-semibold tabular-nums text-slate-800">{segmento.valor}</span>
                        </div>
                    ))}
                    {totalGrafico === 0 && <p className="text-xs text-slate-400">No hay cuotas para representar.</p>}
                </div>
            </div>
        </div>
    );
}

function PanelAlertas({
    titulo,
    descripcion,
    icono,
    cantidad,
    vacio,
    children,
}: {
    titulo: string;
    descripcion: string;
    icono: React.ReactNode;
    cantidad: number;
    vacio: string;
    children: React.ReactNode;
}) {
    const tieneElementos = cantidad > 0;

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tieneElementos ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {icono}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">{titulo}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">{descripcion}</p>
                    </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tieneElementos ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {cantidad}
                </span>
            </div>
            {tieneElementos ? (
                <div className="space-y-2">{children}</div>
            ) : (
                <div className="rounded-lg bg-emerald-50 px-4 py-5 text-center text-sm text-emerald-800">{vacio}</div>
            )}
        </section>
    );
}

function MensajeVacio({ mensaje }: { mensaje: string }) {
    return (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">
                {mensaje}
            </p>
        </div>
    );
}

function AccesoRapido({
    titulo,
    descripcion,
    ruta,
    icono,
}: {
    titulo: string;
    descripcion: string;
    ruta: string;
    icono: React.ReactNode;
}) {
    return (
        <Link
            href={route(ruta)}
            className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
        >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                {icono}
            </div>

            <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-800">
                    {titulo}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                    {descripcion}
                </p>
            </div>

            <ArrowRight
                size={19}
                className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600"
            />
        </Link>
    );
}