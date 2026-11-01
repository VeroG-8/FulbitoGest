import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import {
    Users,
    GraduationCap,
    Trophy,
    Wallet,
    CalendarDays,
    UserRound,
    ArrowRight,
    ShieldCheck,
    ClipboardList,
    CreditCard,
} from 'lucide-react';

export default function Dashboard() {
    const { auth, estadisticas: datosEstadisticos } = usePage().props as any;
    const user = auth.user;

    const roles: Record<string, string> = {
        superadmin: 'Superadministrador',
        admin: 'Administrador',
        profesor: 'Profesor',
        tutor: 'Tutor',
    };

    const esAdministrador = ['superadmin', 'admin'].includes(user.rol);

    const estadisticas = [
        {
            titulo: 'Jugadores',
            descripcion: 'Gestionar jugadores',
            icono: <Users size={23} />,
            color: 'bg-blue-100 text-blue-600',
            ruta: 'jugadores.index',
        },
        {
            titulo: 'Profesores',
            descripcion: 'Consultar profesores',
            icono: <GraduationCap size={23} />,
            color: 'bg-purple-100 text-purple-600',
            ruta: 'profesores.index',
        },
        {
            titulo: 'Equipos',
            descripcion: 'Gestionar equipos',
            icono: <Users size={23} />,
            color: 'bg-emerald-100 text-emerald-600',
            ruta: 'equipos.index',
        },
        {
            titulo: 'Torneos',
            descripcion: 'Consultar torneos',
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

                {/* Administrador */}
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
                                    valor: datosEstadisticos.jugadores,
                                    icono: <Users size={23} />,
                                    color: 'bg-blue-100 text-blue-600',
                                },
                                {
                                    titulo: 'Jugadores activos',
                                    valor: datosEstadisticos.jugadoresActivos,
                                    icono: <Users size={23} />,
                                    color: 'bg-emerald-100 text-emerald-600',
                                },
                                {
                                    titulo: 'Equipos activos',
                                    valor: datosEstadisticos.equiposActivos,
                                    icono: <ShieldCheck size={23} />,
                                    color: 'bg-purple-100 text-purple-600',
                                },
                                {
                                    titulo: 'Categorías activas',
                                    valor: datosEstadisticos.categoriasActivas,
                                    icono: <ClipboardList size={23} />,
                                    color: 'bg-amber-100 text-amber-600',
                                },
                                {
                                    titulo: 'Profesores activos',
                                    valor: datosEstadisticos.profesoresActivos,
                                    icono: <GraduationCap size={23} />,
                                    color: 'bg-indigo-100 text-indigo-600',
                                },
                                {
                                    titulo: 'Tutores activos',
                                    valor: datosEstadisticos.tutoresActivos,
                                    icono: <UserRound size={23} />,
                                    color: 'bg-pink-100 text-pink-600',
                                },
                            ].map((item) => (
                                <div
                                    key={item.titulo}
                                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}>
                                            {item.icono}
                                        </div>
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
                        <section>
                            <div className="mb-4">
                                <h2 className="text-lg font-bold text-slate-800">
                                    Gestión general
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Accedé rápidamente a los principales módulos.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {estadisticas.map((item) => (
                                    <Link
                                        key={item.titulo}
                                        href={route(item.ruta)}
                                        className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
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

                        <section>
                            <h2 className="mb-4 text-lg font-bold text-slate-800">
                                Administración
                            </h2>

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                <AccesoRapido
                                    titulo="Tutores"
                                    descripcion="Gestionar responsables de jugadores"
                                    ruta="tutores.index"
                                    icono={<UserRound size={22} />}
                                />

                                <AccesoRapido
                                    titulo="Cuotas"
                                    descripcion="Administrar cuotas de la institución"
                                    ruta="cuotas.index"
                                    icono={<CreditCard size={22} />}
                                />

                                <AccesoRapido
                                    titulo="Pagos"
                                    descripcion="Consultar pagos registrados"
                                    ruta="pagos.index"
                                    icono={<Wallet size={22} />}
                                />
                            </div>
                        </section>
                    </>
                )}

                {/* Profesor */}
                {user.rol === 'profesor' && (
                    <section>
                        <h2 className="mb-4 text-lg font-bold text-slate-800">
                            Mi actividad
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {accesosProfesor.map((item) => (
                                <AccesoRapido
                                    key={item.titulo}
                                    {...item}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Tutor */}
                {user.rol === 'tutor' && (
                    <section>
                        <h2 className="mb-4 text-lg font-bold text-slate-800">
                            Mi espacio
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {accesosTutor.map((item) => (
                                <AccesoRapido
                                    key={item.titulo}
                                    {...item}
                                />
                            ))}
                        </div>
                    </section>
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