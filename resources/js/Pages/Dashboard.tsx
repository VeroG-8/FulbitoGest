import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import {
    Users,
    GraduationCap,
    Trophy,
    Wallet,
    CalendarDays,
    CalendarCheck,
    UserRound,
    ArrowRight,
    ShieldCheck,
    ClipboardList,
    CreditCard,
    CheckCircle2,
    Clock3,
    AlertCircle,
    ReceiptText,
    Banknote,
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

function EstadoBadge({ estado }: { estado: string }) {
    const estilos: Record<string, string> = {
        pendiente: 'bg-amber-100 text-amber-700',
        parcial: 'bg-blue-100 text-blue-700',
        abonado: 'bg-emerald-100 text-emerald-700',
        inscripto: 'bg-emerald-100 text-emerald-700',
        cancelado: 'bg-red-100 text-red-700',
    };

    const etiquetas: Record<string, string> = {
        pendiente: 'Pendiente',
        parcial: 'Pago parcial',
        abonado: 'Abonado',
        inscripto: 'Inscripto',
        cancelado: 'Cancelado',
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                estilos[estado] ?? 'bg-slate-100 text-slate-600'
            }`}
        >
            {etiquetas[estado] ?? estado}
        </span>
    );
}

export default function Dashboard() {
    const {
        auth,
        estadisticas: datosEstadisticos,
        datosTutor,
        datosProfesor,
    } = usePage().props as any;

    const user = auth.user;

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
        {
            titulo: 'Mis equipos',
            descripcion: 'Consultar equipos asignados',
            icono: <ShieldCheck size={22} />,
            ruta: 'equipos.index',
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
        <AuthenticatedLayout>
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

                            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
                                Desde aquí podés acceder a las herramientas
                                disponibles para gestionar y consultar la
                                información de la institución.
                            </p>
                        </div>

                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                            <ShieldCheck size={36} />
                        </div>
                    </div>
                </section>

                {/* Información del usuario */}
                <section>
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-slate-800">
                            Panel de control
                        </h2>
                        <p className="text-sm text-slate-500">
                            Resumen de tu espacio de trabajo
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                <UserRound size={25} />
                            </div>

                            <div>
                                <p className="font-semibold text-slate-800">
                                    {user.name}
                                </p>
                                <p className="text-sm text-slate-500">
                                    {roles[user.rol] ?? user.rol}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================================================== */}
                {/* ADMINISTRADOR */}
                {/* ================================================== */}

                {esAdministrador && (
                    <>
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
                                {[
                                    {
                                        titulo: 'Total de jugadores',
                                        valor: datosEstadisticos?.jugadores,
                                        icono: <Users size={23} />,
                                        color: 'bg-blue-100 text-blue-600',
                                    },
                                    {
                                        titulo: 'Jugadores activos',
                                        valor: datosEstadisticos?.jugadoresActivos,
                                        icono: <Users size={23} />,
                                        color: 'bg-emerald-100 text-emerald-600',
                                    },
                                    {
                                        titulo: 'Equipos activos',
                                        valor: datosEstadisticos?.equiposActivos,
                                        icono: <ShieldCheck size={23} />,
                                        color: 'bg-purple-100 text-purple-600',
                                    },
                                    {
                                        titulo: 'Categorías activas',
                                        valor: datosEstadisticos?.categoriasActivas,
                                        icono: <ClipboardList size={23} />,
                                        color: 'bg-amber-100 text-amber-600',
                                    },
                                    {
                                        titulo: 'Profesores activos',
                                        valor: datosEstadisticos?.profesoresActivos,
                                        icono: <GraduationCap size={23} />,
                                        color: 'bg-indigo-100 text-indigo-600',
                                    },
                                    {
                                        titulo: 'Tutores activos',
                                        valor: datosEstadisticos?.tutoresActivos,
                                        icono: <UserRound size={23} />,
                                        color: 'bg-pink-100 text-pink-600',
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.titulo}
                                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                                    >
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}>
                                            {item.icono}
                                        </div>

                                        <p className="mt-4 text-sm font-medium text-slate-500">
                                            {item.titulo}
                                        </p>

                                        <p className="mt-1 text-2xl font-bold text-slate-800">
                                            {item.valor ?? 0}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Gestión general */}
                        <section>
                            <div className="mb-4">
                                <h2 className="text-lg font-bold text-slate-800">
                                    Gestión general
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Accedé rápidamente a los principales módulos de gestión.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {accesosGestion.map((item) => (
                                    <Link
                                        key={item.titulo}
                                        href={route(item.ruta)}
                                        className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
                                    >
                                        <div className="mb-5 flex items-center justify-between">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}>
                                                {item.icono}
                                            </div>

                                            <ArrowRight
                                                size={19}
                                                className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600"
                                            />
                                        </div>

                                        <h3 className="font-bold text-slate-800">
                                            {item.titulo}
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {item.descripcion}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* Administración */}
                        <section>
                            <div className="mb-4">
                                <h2 className="text-lg font-bold text-slate-800">
                                    Administración
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Gestioná los responsables, cuotas, asignaciones,
                                    pagos y recursos económicos de la institución.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                <AccesoRapido
                                    titulo="Tutores"
                                    descripcion="Gestionar responsables de los jugadores"
                                    ruta="tutores.index"
                                    icono={<UserRound size={22} />}
                                />

                                <AccesoRapido
                                    titulo="Cuotas"
                                    descripcion="Crear y administrar cuotas institucionales"
                                    ruta="cuotas.index"
                                    icono={<CreditCard size={22} />}
                                />

                                <AccesoRapido
                                    titulo="Asignaciones"
                                    descripcion="Asignar cuotas a jugadores y categorías"
                                    ruta="cuotas.asignaciones.index"
                                    icono={<ClipboardList size={22} />}
                                />

                                <AccesoRapido
                                    titulo="Seguimiento mensual"
                                    descripcion="Consultar el estado de las cuotas por jugador y período"
                                    ruta="cuotas.seguimiento"
                                    icono={<CalendarCheck size={22} />}
                                />

                                <AccesoRapido
                                    titulo="Pagos"
                                    descripcion="Consultar pagos e historial de cobros"
                                    ruta="pagos.index"
                                    icono={<Wallet size={22} />}
                                />

                                <AccesoRapido
                                    titulo="Reportes y estadísticas"
                                    descripcion="Consultar recaudación, deudas e indicadores"
                                    ruta="reportes.index"
                                    icono={<CalendarDays size={22} />}
                                />
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

                            <div className="grid gap-4 sm:grid-cols-2">
                                <TarjetaResumen
                                    titulo="Mis categorías"
                                    valor={datosProfesor?.total_categorias ?? 0}
                                    icono={<ClipboardList size={23} />}
                                    color="bg-purple-100 text-purple-700"
                                />

                                <TarjetaResumen
                                    titulo="Jugadores a cargo"
                                    valor={datosProfesor?.total_jugadores ?? 0}
                                    icono={<Users size={23} />}
                                    color="bg-blue-100 text-blue-700"
                                />
                            </div>
                        </section>

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
                                                        {categoria.nombre}
                                                    </h3>
                                                    <p className="text-sm text-slate-500">
                                                        Año: {categoria.anio ?? 'No especificado'}
                                                    </p>
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

                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                        <TarjetaResumen
                                            titulo="Jugadores a cargo"
                                            valor={datosTutor.total_jugadores}
                                            icono={<Users size={23} />}
                                            color="bg-blue-100 text-blue-700"
                                        />

                                        <TarjetaResumen
                                            titulo="Cuotas pendientes"
                                            valor={datosTutor.total_cuotas_pendientes}
                                            icono={<Clock3 size={23} />}
                                            color="bg-amber-100 text-amber-700"
                                        />

                                        <TarjetaResumen
                                            titulo="Cuotas parciales"
                                            valor={datosTutor.total_cuotas_parciales}
                                            icono={<AlertCircle size={23} />}
                                            color="bg-blue-100 text-blue-700"
                                        />

                                        <TarjetaResumen
                                            titulo="Cuotas abonadas"
                                            valor={datosTutor.total_cuotas_abonadas}
                                            icono={<CheckCircle2 size={23} />}
                                            color="bg-emerald-100 text-emerald-700"
                                        />

                                        <TarjetaResumen
                                            titulo="Total abonado"
                                            valor={formatoMoneda(datosTutor.monto_abonado)}
                                            icono={<Banknote size={23} />}
                                            color="bg-emerald-100 text-emerald-700"
                                        />

                                        <TarjetaResumen
                                            titulo="Saldo pendiente"
                                            valor={formatoMoneda(datosTutor.saldo_pendiente)}
                                            icono={<Wallet size={23} />}
                                            color="bg-red-100 text-red-700"
                                        />
                                    </div>
                                </section>

                                {/* Jugadores */}
                                <section>
                                    <div className="mb-4">
                                        <h2 className="text-lg font-bold text-slate-800">
                                            Mis jugadores
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            Información deportiva y económica individual.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        {datosTutor.jugadores.map((jugador: any) => (
                                            <div
                                                key={jugador.id}
                                                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                                            >
                                                {/* Encabezado del jugador */}
                                                <div className="flex flex-col justify-between gap-3 bg-slate-950 p-5 text-white sm:flex-row sm:items-center">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                                                            <UserRound size={25} />
                                                        </div>

                                                        <div>
                                                            <h3 className="font-bold">
                                                                {jugador.apellido}, {jugador.nombre}
                                                            </h3>

                                                            <p className="text-sm text-slate-300">
                                                                Categoría: {jugador.categoria ?? 'Sin categoría'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                                                        {jugador.estado ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </div>

                                                <div className="space-y-6 p-5">

                                                    {/* Resumen de cuotas */}
                                                    <div className="grid gap-3 sm:grid-cols-3">
                                                        <div className="rounded-lg bg-slate-50 p-4">
                                                            <p className="text-xs font-medium text-slate-500">
                                                                Cuotas pendientes
                                                            </p>
                                                            <p className="mt-1 text-xl font-bold text-amber-600">
                                                                {jugador.resumen_cuotas.pendientes}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-lg bg-slate-50 p-4">
                                                            <p className="text-xs font-medium text-slate-500">
                                                                Cuotas parciales
                                                            </p>
                                                            <p className="mt-1 text-xl font-bold text-blue-600">
                                                                {jugador.resumen_cuotas.parciales}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-lg bg-slate-50 p-4">
                                                            <p className="text-xs font-medium text-slate-500">
                                                                Cuotas abonadas
                                                            </p>
                                                            <p className="mt-1 text-xl font-bold text-emerald-600">
                                                                {jugador.resumen_cuotas.abonadas}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Cuotas */}
                                                    <div>
                                                        <div className="mb-3 flex items-center gap-2">
                                                            <CreditCard size={19} className="text-emerald-600" />
                                                            <h4 className="font-bold text-slate-800">
                                                                Cuotas y asignaciones
                                                            </h4>
                                                        </div>

                                                        {jugador.cuotas.length > 0 ? (
                                                            <div className="overflow-x-auto rounded-lg border border-slate-200">
                                                                <table className="w-full text-left text-sm">
                                                                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                                                        <tr>
                                                                            <th className="px-4 py-3">Concepto</th>
                                                                            <th className="px-4 py-3">Período</th>
                                                                            <th className="px-4 py-3">Importe</th>
                                                                            <th className="px-4 py-3">Abonado</th>
                                                                            <th className="px-4 py-3">Saldo</th>
                                                                            <th className="px-4 py-3">Estado</th>
                                                                        </tr>
                                                                    </thead>

                                                                    <tbody className="divide-y divide-slate-100">
                                                                        {jugador.cuotas.map((cuota: any) => (
                                                                            <tr key={cuota.id}>
                                                                                <td className="px-4 py-3 font-medium text-slate-700">
                                                                                    <div>{cuota.cuota}</div>
                                                                                    {cuota.tipo === 'inscripcion_torneo' && (
                                                                                        <span className="text-xs text-purple-600">
                                                                                            Inscripción
                                                                                        </span>
                                                                                    )}
                                                                                </td>

                                                                                <td className="px-4 py-3 text-slate-600">
                                                                                    {obtenerPeriodo(cuota.periodo_mes, cuota.periodo_anio)}
                                                                                </td>

                                                                                <td className="px-4 py-3 text-slate-600">
                                                                                    {formatoMoneda(cuota.monto)}
                                                                                </td>

                                                                                <td className="px-4 py-3 font-medium text-emerald-700">
                                                                                    {formatoMoneda(cuota.pagado)}
                                                                                </td>

                                                                                <td className="px-4 py-3 font-medium text-slate-700">
                                                                                    {formatoMoneda(cuota.saldo)}
                                                                                </td>

                                                                                <td className="px-4 py-3">
                                                                                    <EstadoBadge estado={cuota.estado} />
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <MensajeVacio mensaje="Este jugador todavía no tiene cuotas asignadas." />
                                                        )}
                                                    </div>

                                                    {/* Inscripciones a torneos */}
                                                    <div>
                                                        <div className="mb-3 flex items-center gap-2">
                                                            <Trophy size={19} className="text-amber-500" />
                                                            <h4 className="font-bold text-slate-800">
                                                                Inscripciones a torneos
                                                            </h4>
                                                        </div>

                                                        {jugador.inscripciones.length > 0 ? (
                                                            <div className="space-y-3">
                                                                {jugador.inscripciones.map((inscripcion: any) => (
                                                                    <div
                                                                        key={inscripcion.id}
                                                                        className="flex flex-col justify-between gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center"
                                                                    >
                                                                        <div>
                                                                            <p className="font-semibold text-slate-800">
                                                                                {inscripcion.torneo}
                                                                            </p>

                                                                            <p className="mt-1 text-xs text-slate-500">
                                                                                Fecha de inscripción: {inscripcion.fecha_inscripcion}
                                                                            </p>

                                                                            <p className="mt-1 text-xs text-slate-500">
                                                                                Inicio: {inscripcion.fecha_inicio ?? 'Sin fecha'}
                                                                                {' · '}
                                                                                Fin: {inscripcion.fecha_fin ?? 'Sin fecha'}
                                                                            </p>
                                                                        </div>

                                                                        <div className="flex items-center gap-3">
                                                                            <p className="font-bold text-slate-700">
                                                                                {formatoMoneda(inscripcion.monto)}
                                                                            </p>

                                                                            <EstadoBadge estado={inscripcion.estado} />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <MensajeVacio mensaje="Este jugador no tiene inscripciones a torneos." />
                                                        )}
                                                    </div>

                                                    {/* Historial de pagos */}
                                                    <div>
                                                        <div className="mb-3 flex items-center gap-2">
                                                            <ReceiptText size={19} className="text-emerald-600" />
                                                            <h4 className="font-bold text-slate-800">
                                                                Historial de pagos
                                                            </h4>
                                                        </div>

                                                        {jugador.historial_pagos.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {jugador.historial_pagos.map((pago: any) => (
                                                                    <div
                                                                        key={pago.id}
                                                                        className="flex flex-col justify-between gap-2 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-center"
                                                                    >
                                                                        <div>
                                                                            <p className="text-sm font-medium text-slate-700">
                                                                                {pago.cuota}
                                                                            </p>
                                                                            <p className="text-xs text-slate-500">
                                                                                Fecha: {pago.fecha}
                                                                            </p>
                                                                        </div>

                                                                        <p className="font-bold text-emerald-700">
                                                                            {formatoMoneda(pago.monto)}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <MensajeVacio mensaje="Todavía no hay pagos confirmados para este jugador." />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
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
        </AuthenticatedLayout>
    );
}

/* ================================================== */
/* COMPONENTES REUTILIZABLES */
/* ================================================== */

function TarjetaResumen({
    titulo,
    valor,
    icono,
    color,
}: {
    titulo: string;
    valor: string | number;
    icono: React.ReactNode;
    color: string;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                {icono}
            </div>

            <p className="mt-4 text-sm font-medium text-slate-500">
                {titulo}
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-800">
                {valor}
            </p>
        </div>
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