import { Link, usePage } from '@inertiajs/react';
import {
    PropsWithChildren,
    ReactNode,
    useEffect,
    useState,
} from 'react';

import type { LucideIcon } from 'lucide-react';

import {
    LayoutDashboard,
    Users,
    UserRound,
    GraduationCap,
    ShieldCheck,
    Trophy,
    Building2,
    UsersRound,
    CalendarDays,
    CreditCard,
    Wallet,
    IdCard,
    UserCog,
    LogOut,
    Menu,
    X,
    ChevronRight,
    ChevronDown,
    CircleUserRound,
    Settings,
    MapPin,
    ClipboardList,
    FileBarChart,
} from 'lucide-react';

// =====================================================
// TIPOS
// =====================================================

type MenuItem = {
    label: string;
    route: string;
    icon: LucideIcon;
};

type MenuSubGroup = {
    title: string;
    items: MenuItem[];
};

type MenuGroup = {
    title: string;
    items: MenuItem[];
    subgroups?: MenuSubGroup[];
};

// =====================================================
// LAYOUT PRINCIPAL
// =====================================================

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const page = usePage();
    const { auth } = page.props as any;
    const user = auth.user;

    const [sidebarOpen, setSidebarOpen] = useState(false);

    // =====================================================
    // ROLES
    // =====================================================

    const roles: Record<string, string> = {
        superadmin: 'Superadministrador',
        admin: 'Administrador',
        profesor: 'Profesor',
        tutor: 'Tutor',
    };

    const esAdministrador = ['superadmin', 'admin'].includes(user.rol);

    const mostrarMiFicha = user.rol === 'profesor';

    // =====================================================
    // GRUPOS DEL MENÚ LATERAL
    // =====================================================

    const gruposMenu: MenuGroup[] = [
        {
            title: 'GENERAL',
            items: [
                {
                    label: 'Dashboard',
                    route: 'dashboard',
                    icon: LayoutDashboard,
                },
            ],
        },

        {
            title: 'GESTIÓN DEPORTIVA',

            items: [
                {
                    label: 'Jugadores',
                    route: 'jugadores.index',
                    icon: Users,
                },
                {
                    label: 'Profesores',
                    route: 'profesores.index',
                    icon: GraduationCap,
                },
                {
                    label: 'Horarios',
                    route: 'horarios.index',
                    icon: CalendarDays,
                },
                {
                    label: 'Carnets',
                    route: 'carnets.index',
                    icon: IdCard,
                },
            ],

            subgroups: [
                {
                    title: 'ENCUENTROS',

                    items: [
                        {
                            label: 'Torneos',
                            route: 'torneos.index',
                            icon: Trophy,
                        },
                        {
                            label: 'Clubes',
                            route: 'clubes.index',
                            icon: Building2,
                        },
                         {
                            label: 'Equipos',
                            route: 'equipos.index',
                            icon: UsersRound,
                        },
                        {
                            label: 'Predios',
                            route: 'predios.index',
                            icon: MapPin,
                        },
                        {
                            label: 'Canchas',
                            route: 'canchas.index',
                            icon: MapPin,
                        },
                    ],
                },
            ],
        },

        {
            title: 'GESTIÓN ADMINISTRATIVA',

            items: [
                {
                    label: 'Tutores',
                    route: 'tutores.index',
                    icon: UserRound,
                },
                {
                    label: 'Usuarios',
                    route: 'usuarios.index',
                    icon: UserCog,
                },
                {
                    label: 'Reportes',
                    route: 'reportes.index',
                    icon: FileBarChart,
                },
            ],

            subgroups: [
                {
                    title: 'CUOTAS',

                    items: [
                        {
                            label: 'Crear cuotas',
                            route: 'cuotas.index',
                            icon: CreditCard,
                        },
                        {
                            label: 'Asignar cuotas',
                            route: 'cuotas.asignaciones.index',
                            icon: ClipboardList,
                        },
                        {
                            label: 'Seguimiento de cuotas',
                            route: 'cuotas.seguimiento',
                            icon: Wallet,
                        },
                    ],
                },
            ],
        },
    ];

    // =====================================================
    // PERMISOS SEGÚN EL ROL
    // =====================================================

    const puedeVerItem = (item: MenuItem) => {
        if (item.route === 'profesores.mi-ficha') {
            return user.rol === 'profesor';
        }

        if (esAdministrador) {
            return true;
        }

        if (user.rol === 'profesor') {
            return [
                'dashboard',
                'jugadores.index',
                'equipos.index',
                'horarios.index',
            ].includes(item.route);
        }

        if (user.rol === 'tutor') {
            return [
                'dashboard',
                'jugadores.index',
            ].includes(item.route);
        }

        return false;
    };

    // =====================================================
    // FILTRAR GRUPOS Y SUBGRUPOS
    // =====================================================

    const gruposVisibles = gruposMenu
        .map((grupo) => ({
            ...grupo,

            items: grupo.items.filter(puedeVerItem),

            subgroups: grupo.subgroups
                ?.map((subgrupo) => ({
                    ...subgrupo,
                    items: subgrupo.items.filter(puedeVerItem),
                }))
                .filter((subgrupo) => subgrupo.items.length > 0),
        }))
        .filter(
            (grupo) =>
                grupo.title !== 'GENERAL' &&
                (
                    grupo.items.length > 0 ||
                    (grupo.subgroups && grupo.subgroups.length > 0)
                ),
        );

    // =====================================================
    // DETECTAR RUTA ACTIVA
    // =====================================================

   const esRutaActiva = (nombreRuta: string) => {
        if (
            nombreRuta === 'cuotas.index' ||
            nombreRuta === 'cuotas.seguimiento'
        ) {
            return route().current(nombreRuta);
        }

        if (nombreRuta === 'cuotas.asignaciones.index') {
            return (
                route().current(nombreRuta) ||
                route().current('cuotas.asignaciones.*')
            );
        }

        return (
            route().current(nombreRuta) ||
            route().current(`${nombreRuta.split('.')[0]}.*`)
        );
    };

    // =====================================================
    // DETECTAR GRUPO ACTIVO
    // =====================================================

    const obtenerGrupoActivo = () =>
        gruposVisibles.find(
            (grupo) =>
                grupo.items.some((item) => esRutaActiva(item.route)) ||
                grupo.subgroups?.some((subgrupo) =>
                    subgrupo.items.some((item) =>
                        esRutaActiva(item.route),
                    ),
                ),
        )?.title;

    // =====================================================
    // DETECTAR SUBGRUPO ACTIVO
    // =====================================================

    const obtenerSubgrupoActivo = () =>
        gruposVisibles
            .flatMap((grupo) =>
                (grupo.subgroups ?? []).map((subgrupo) => ({
                    grupo: grupo.title,
                    subgrupo: subgrupo.title,
                })),
            )
            .find(({ grupo, subgrupo }) => {
                const grupoEncontrado = gruposVisibles.find(
                    (item) => item.title === grupo,
                );

                const subgrupoEncontrado =
                    grupoEncontrado?.subgroups?.find(
                        (item) => item.title === subgrupo,
                    );

                return subgrupoEncontrado?.items.some((item) =>
                    esRutaActiva(item.route),
                );
            });

    // =====================================================
    // ESTADOS DE LOS DESPLEGABLES
    // =====================================================

    const [gruposAbiertos, setGruposAbiertos] = useState<string[]>(() => {
        const grupoActivo = obtenerGrupoActivo();

        return grupoActivo ? [grupoActivo] : [];
    });

    const [subgruposAbiertos, setSubgruposAbiertos] = useState<string[]>(
        () => {
            const activo = obtenerSubgrupoActivo();

            return activo
                ? [`${activo.grupo}-${activo.subgrupo}`]
                : [];
        },
    );

    // Abrir automáticamente la sección correspondiente a la ruta actual.

    useEffect(() => {
        const grupoActivo = obtenerGrupoActivo();
        const subgrupoActivo = obtenerSubgrupoActivo();

        if (grupoActivo) {
            setGruposAbiertos((actuales) =>
                actuales.includes(grupoActivo)
                    ? actuales
                    : [...actuales, grupoActivo],
            );
        }

        if (subgrupoActivo) {
            const clave = `${subgrupoActivo.grupo}-${subgrupoActivo.subgrupo}`;

            setSubgruposAbiertos((actuales) =>
                actuales.includes(clave)
                    ? actuales
                    : [...actuales, clave],
            );
        }
    }, [page.url]);

    // =====================================================
    // FUNCIONES PARA ABRIR Y CERRAR SECCIONES
    // =====================================================

    const toggleGrupo = (titulo: string) => {
        setGruposAbiertos((actuales) =>
            actuales.includes(titulo)
                ? actuales.filter((grupo) => grupo !== titulo)
                : [...actuales, titulo],
        );
    };

    const toggleSubgrupo = (clave: string) => {
        setSubgruposAbiertos((actuales) =>
            actuales.includes(clave)
                ? actuales.filter((grupo) => grupo !== clave)
                : [...actuales, clave],
        );
    };

    // =====================================================
    // CONTENIDO DEL MENÚ LATERAL
    // =====================================================

    const SidebarContent = () => (
        <div className="flex h-full flex-col">

            {/* LOGO */}

            <div className="flex h-20 items-center gap-3 border-b border-slate-700 px-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white">
                    <ShieldCheck size={27} />
                </div>

                <div>
                    <h1 className="text-xl font-bold tracking-wide text-white">
                        FulbitoGest
                    </h1>

                    <p className="text-xs text-slate-400">
                        Gestión deportiva
                    </p>
                </div>
            </div>

            {/* NAVEGACIÓN */}

            <nav className="flex-1 space-y-3 overflow-y-auto px-4 py-6">

                {/* GENERAL: SIN DESPLEGABLE */}

                <div>
                    <p className="px-3 pb-2 text-xs font-bold tracking-widest text-slate-500">
                        GENERAL
                    </p>

                    <div className="space-y-1">

                        {/* DASHBOARD */}

                        <Link
                            href={route('dashboard')}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                                esRutaActiva('dashboard')
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-950/20'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <LayoutDashboard size={19} />

                            <span>Dashboard</span>
                        </Link>

                        {/* MI FICHA DE PROFESOR */}

                        {mostrarMiFicha && (
                            <Link
                                href={route('profesores.mi-ficha')}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                                    esRutaActiva('profesores.mi-ficha')
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-950/20'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <UserRound size={19} />

                                <span>Mis datos personales</span>
                            </Link>
                        )}
                    </div>
                </div>

                {/* GRUPOS PRINCIPALES */}

                {gruposVisibles.map((grupo) => {
                    const abierto = gruposAbiertos.includes(grupo.title);

                    const tieneRutaActiva =
                        grupo.items.some((item) =>
                            esRutaActiva(item.route),
                        ) ||
                        grupo.subgroups?.some((subgrupo) =>
                            subgrupo.items.some((item) =>
                                esRutaActiva(item.route),
                            ),
                        );

                    return (
                        <div key={grupo.title}>

                            {/* ENCABEZADO DEL GRUPO */}

                            <button
                                type="button"
                                onClick={() => toggleGrupo(grupo.title)}
                                aria-expanded={abierto}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-xs font-bold tracking-widest transition ${
                                    tieneRutaActiva
                                        ? 'bg-slate-800 text-emerald-400'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <span>{grupo.title}</span>

                                <ChevronDown
                                    size={17}
                                    className={`transition-transform duration-200 ${
                                        abierto ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {/* CONTENIDO DEL GRUPO */}

                            {abierto && (
                                <div className="ml-3 mt-2 space-y-1 border-l border-slate-700 pl-3">

                                    {/* OPCIONES PRINCIPALES */}

                                    {grupo.items.map((item) => {
                                        const activo = esRutaActiva(item.route);
                                        const Icon = item.icon;

                                        return (
                                            <Link
                                                key={item.route}
                                                href={route(item.route)}
                                                onClick={() =>
                                                    setSidebarOpen(false)
                                                }
                                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                                                    activo
                                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-950/20'
                                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                                }`}
                                            >
                                                <Icon size={19} />

                                                <span>{item.label}</span>

                                                {activo && (
                                                    <ChevronRight
                                                        size={16}
                                                        className="ml-auto"
                                                    />
                                                )}
                                            </Link>
                                        );
                                    })}

                                    {/* SUBGRUPOS */}

                                    {grupo.subgroups?.map((subgrupo) => {
                                        const clave = `${grupo.title}-${subgrupo.title}`;

                                        const subgrupoAbierto =
                                            subgruposAbiertos.includes(clave);

                                        const subgrupoActivo =
                                            subgrupo.items.some((item) =>
                                                esRutaActiva(item.route),
                                            );

                                        return (
                                            <div
                                                key={clave}
                                                className="pt-1"
                                            >

                                                {/* ENCABEZADO DEL SUBGRUPO */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toggleSubgrupo(clave)
                                                    }
                                                    aria-expanded={subgrupoAbierto}
                                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-bold tracking-wider transition ${
                                                        subgrupoActivo
                                                            ? 'text-emerald-400'
                                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                                    }`}
                                                >
                                                    <span>{subgrupo.title}</span>

                                                    <ChevronDown
                                                        size={16}
                                                        className={`transition-transform duration-200 ${
                                                            subgrupoAbierto
                                                                ? 'rotate-180'
                                                                : ''
                                                        }`}
                                                    />
                                                </button>

                                                {/* OPCIONES DEL SUBGRUPO */}

                                                {subgrupoAbierto && (
                                                    <div className="ml-3 mt-1 space-y-1 border-l border-slate-700 pl-3">

                                                        {subgrupo.items.map((item) => {
                                                            const activo =
                                                                esRutaActiva(item.route);

                                                            const Icon = item.icon;

                                                            return (
                                                                <Link
                                                                    key={item.route}
                                                                    href={route(item.route)}
                                                                    onClick={() =>
                                                                        setSidebarOpen(false)
                                                                    }
                                                                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                                                                        activo
                                                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-950/20'
                                                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                                                    }`}
                                                                >
                                                                    <Icon size={19} />

                                                                    <span>
                                                                        {item.label}
                                                                    </span>

                                                                    {activo && (
                                                                        <ChevronRight
                                                                            size={16}
                                                                            className="ml-auto"
                                                                        />
                                                                    )}
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* USUARIO */}

            <div className="border-t border-slate-700 p-4">

                {/* INFORMACIÓN DEL USUARIO */}

                <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-800 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-600 text-white">
                        <CircleUserRound size={23} />
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                            {user.name}
                        </p>

                        <p className="text-xs text-slate-400">
                            {roles[user.rol] ?? user.rol}
                        </p>
                    </div>
                </div>

                {/* MI PERFIL */}

                <Link
                    href={route('profile.edit')}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                    <Settings size={18} />

                    Mi perfil
                </Link>

                {/* CERRAR SESIÓN */}

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                >
                    <LogOut size={18} />

                    Cerrar sesión
                </Link>
            </div>
        </div>
    );

    // =====================================================
    // ESTRUCTURA PRINCIPAL
    // =====================================================

    return (
        <div className="min-h-screen bg-slate-50">

            {/* SIDEBAR ESCRITORIO */}

            <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 bg-slate-950 lg:block">
                <SidebarContent />
            </aside>

            {/* SIDEBAR MÓVIL */}

            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">

                    {/* FONDO OSCURO */}

                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setSidebarOpen(false)}
                    />

                    {/* MENÚ */}

                    <aside className="absolute inset-y-0 left-0 w-72 bg-slate-950">

                        {/* BOTÓN CERRAR */}

                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="absolute right-4 top-5 z-10 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                        >
                            <X size={22} />
                        </button>

                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* CONTENIDO PRINCIPAL */}

            <div className="min-h-screen lg:pl-72">

                {/* BARRA SUPERIOR */}

                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">

                    <div className="flex items-center gap-3">

                        {/* BOTÓN MENÚ MÓVIL */}

                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                        >
                            <Menu size={23} />
                        </button>

                        <div>
                            <p className="text-sm font-semibold text-slate-800">
                                FulbitoGest
                            </p>

                            <p className="text-xs text-slate-500">
                                Sistema de gestión deportiva
                            </p>
                        </div>
                    </div>

                    {/* ROL DEL USUARIO */}

                    <div className="flex items-center gap-2">
                        <span className="hidden rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 sm:block">
                            {roles[user.rol] ?? user.rol}
                        </span>
                    </div>
                </header>

                {/* ENCABEZADO DE PÁGINA */}

                {header && (
                    <div className="px-4 pt-5 sm:px-6">
                        {header}
                    </div>
                )}

                {/* CONTENIDO */}

                <main className="px-4 py-5 sm:px-6 sm:py-6">
                    {children}
                </main>
            </div>
        </div>
    );
}