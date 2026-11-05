import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
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
    ChevronDown,
    ChevronRight,
    CircleUserRound,
    Settings,
} from 'lucide-react';

type MenuItem = {
    label: string;
    route: string;
    icon: ReactNode;
};

type MenuGroup = {
    title: string;
    items: MenuItem[];
};

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth } = usePage().props as any;
    const user = auth.user;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const roles: Record<string, string> = {
        superadmin: 'Superadministrador',
        admin: 'Administrador',
        profesor: 'Profesor',
        tutor: 'Tutor',
    };

    const esAdministrador = ['superadmin', 'admin'].includes(user.rol);

    const gruposMenu: MenuGroup[] = [
        {
            title: 'GENERAL',
            items: [
                {
                    label: 'Dashboard',
                    route: 'dashboard',
                    icon: <LayoutDashboard size={19} />,
                },
            ],
        },
        {
            title: 'GESTIÓN DEPORTIVA',
            items: [
                {
                    label: 'Jugadores',
                    route: 'jugadores.index',
                    icon: <Users size={19} />,
                },
                {
                    label: 'Profesores',
                    route: 'profesores.index',
                    icon: <GraduationCap size={19} />,
                },
                {
                    label: 'Equipos',
                    route: 'equipos.index',
                    icon: <UsersRound size={19} />,
                },
                {
                    label: 'Clubes',
                    route: 'clubes.index',
                    icon: <Building2 size={19} />,
                },
                {
                    label: 'Torneos',
                    route: 'torneos.index',
                    icon: <Trophy size={19} />,
                },
                {
                    label: 'Horarios',
                    route: 'horarios.index',
                    icon: <CalendarDays size={19} />,
                },
                {
                    label: 'Carnets',
                    route: 'carnets.index',
                    icon: <IdCard size={19} />,
                },
            ],
        },
        {
            title: 'ADMINISTRACIÓN',
            items: [
                {
                    label: 'Tutores',
                    route: 'tutores.index',
                    icon: <UserRound size={19} />,
                },
                {
                    label: 'Cuotas',
                    route: 'cuotas.index',
                    icon: <CreditCard size={19} />,
                },
                {
                    label: 'Pagos',
                    route: 'pagos.index',
                    icon: <Wallet size={19} />,
                },
                {
                    label: 'Usuarios',
                    route: 'usuarios.index',
                    icon: <UserCog size={19} />,
                },
            ],
        },
    ];

    const gruposVisibles = gruposMenu
        .map((grupo) => ({
            ...grupo,
            items: grupo.items.filter((item) => {
                if (esAdministrador) return true;

                if (user.rol === 'profesor') {
                    return ['dashboard', 'jugadores.index', 'equipos.index'].includes(
                        item.route,
                    );
                }

                if (user.rol === 'tutor') {
                    return ['dashboard', 'jugadores.index'].includes(item.route);
                }

                return false;
            }),
        }))
        .filter((grupo) => grupo.items.length > 0);

    const esRutaActiva = (nombreRuta: string) =>
        route().current(nombreRuta) ||
        route().current(`${nombreRuta.split('.')[0]}.*`);

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            {/* Logo */}
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

            {/* Navegación */}
            <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-7">
                {gruposVisibles.map((grupo) => (
                    <div key={grupo.title}>
                        <p className="mb-3 px-3 text-xs font-bold tracking-widest text-slate-500">
                            {grupo.title}
                        </p>

                        <div className="space-y-1">
                            {grupo.items.map((item) => {
                                const activo = esRutaActiva(item.route);

                                return (
                                    <Link
                                        key={item.route}
                                        href={route(item.route)}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                                            activo
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-950/20'
                                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    >
                                        {item.icon}
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
                        </div>
                    </div>
                ))}
            </nav>

            {/* Usuario */}
            <div className="border-t border-slate-700 p-4">
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

                <Link
                    href={route('profile.edit')}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                    <Settings size={18} />
                    Mi perfil
                </Link>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                    <LogOut size={17} />
                    Cerrar sesión
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar escritorio */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 bg-slate-950 lg:block">
                <SidebarContent />
            </aside>

            {/* Sidebar móvil */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setSidebarOpen(false)}
                    />

                    <aside className="absolute inset-y-0 left-0 w-72 bg-slate-950">
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

            {/* Contenido principal */}
            <div className="min-h-screen lg:pl-72">
                {/* Barra superior */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
                    <div className="flex items-center gap-3">
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

                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                            <CircleUserRound size={21} />
                            <span className="hidden sm:block">
                                {user.name}
                            </span>
                            <ChevronDown size={16} />
                        </button>

                        {userMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                                <Link
                                    href={route('profile.edit')}
                                    onClick={() => setUserMenuOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                    <Settings size={17} />
                                    Mi perfil
                                </Link>

                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                >
                                    <LogOut size={17} />
                                    Cerrar sesión
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                {/* Encabezado de página */}
                {header && (
                    <div className="px-4 pt-5 sm:px-6">
                        {header}
                    </div>
                )}

                <main className="px-4 py-5 sm:px-6 sm:py-6">
                    {children}
                </main>
            </div>
        </div>
    );
}