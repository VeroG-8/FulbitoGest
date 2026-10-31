import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    Users,
    UserPlus,
    Mail,
    GraduationCap,
    UserRound,
    ChevronLeft,
    ChevronRight,
    Power,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatCard from '@/Components/Shared/StatCard';
import StatusBadge from '@/Components/Shared/StatusBadge';
import type { PageProps } from '@/types';
interface Persona {
    id: number;
    nombre: string;
    apellido: string;
}

interface Usuario {
    id: number;
    name: string;
    email: string;
    rol: 'admin' |'superadmin' | 'tutor' | 'profesor';
    activo: boolean;
    tutor?: Persona | null;
    profesor?: Persona | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginator {
    data: Usuario[];
    total: number;
    current_page: number;
    last_page: number;
    links: PaginationLink[];
}

interface Props {
    usuarios: Paginator;
}
interface Flash {
    success?: string | null;
    error?: string | null;
}

export default function Index({ usuarios }: Props) {
    const { flash } = usePage<PageProps>().props;
    const cambiarEstado = (usuario: Usuario) => {
    const accion = usuario.activo ? 'deshabilitar' : 'habilitar';

        if (!confirm(`¿Estás segura de que deseas ${accion} esta cuenta?`)) {
            return;
        }

        router.patch(route('usuarios.estado', usuario.id), {}, {
            preserveScroll: true,
        });
    };
    return (
        <>
            <Head title="Gestión de usuarios" />

            <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">

                    <PageHeader
                        title="Gestión de usuarios"
                        description="Administrá las cuentas de acceso de tutores, profesores y administradores."
                        icon={<Users size={28} />}
                        actions={
                            <Link
                                href={route('usuarios.create')}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                <UserPlus size={18} />
                                Nueva cuenta
                            </Link>
                        }
                    />
                    {(flash.success || flash.error) && (
                        <div
                            className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
                                flash.success
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-red-200 bg-red-50 text-red-700'
                            }`}
                            role="alert"
                        >
                            {flash.success || flash.error}
                        </div>
                    )}

                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard
                            title="Total de cuentas"
                            value={usuarios.total}
                            description="Usuarios registrados en el sistema"
                            icon={<Users size={24} />}
                            color="blue"
                        />
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-5">
                            <h2 className="text-lg font-bold text-slate-900">
                                Cuentas registradas
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Listado de personas que tienen acceso al sistema.
                            </p>
                        </div>

                        {usuarios.data.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold">
                                                    Usuario
                                                </th>
                                                <th className="px-6 py-4 font-semibold">
                                                    Correo electrónico
                                                </th>
                                                <th className="px-6 py-4 font-semibold">
                                                    Rol
                                                </th>
                                                <th className="px-6 py-4 font-semibold">
                                                    Persona vinculada
                                                </th>
                                                <th className="px-6 py-4 font-semibold">
                                                    Estado
                                                </th>
                                                <th className="px-6 py-4 font-semibold text-center">
                                                    Acciones
                                                </th>
                                                                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100">
                                            {usuarios.data.map((usuario) => {
                                                const persona =
                                                    usuario.tutor ??
                                                    usuario.profesor;

                                                return (
                                                    <tr
                                                        key={usuario.id}
                                                        className="transition hover:bg-slate-50"
                                                    >
                                                        <td className="whitespace-nowrap px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                                                    {usuario.rol === 'profesor' ? (
                                                                        <GraduationCap size={20} />
                                                                    ) : (
                                                                        <UserRound size={20} />
                                                                    )}
                                                                </div>

                                                                <span className="font-semibold text-slate-800">
                                                                    {usuario.name}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                                                            <div className="flex items-center gap-2">
                                                                <Mail
                                                                    size={15}
                                                                    className="text-slate-400"
                                                                />
                                                                {usuario.email}
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <StatusBadge
                                                                status={usuario.rol}
                                                            />
                                                        </td>

                                                        <td className="px-6 py-4 text-slate-600">
                                                            {persona
                                                                ? `${persona.nombre} ${persona.apellido}`
                                                                : usuario.rol === 'admin'
                                                                    ? 'Cuenta administrativa'
                                                                    : 'Sin vinculación'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <StatusBadge
                                                                status={usuario.activo ? 'Activo' : 'Deshabilitado'}
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => cambiarEstado(usuario)}
                                                                title={usuario.activo ? 'Deshabilitar cuenta' : 'Habilitar cuenta'}
                                                                className={`inline-flex items-center justify-center rounded-lg p-2 transition-colors ${
                                                                    usuario.activo
                                                                        ? 'text-red-600 hover:bg-red-50'
                                                                        : 'text-emerald-600 hover:bg-emerald-50'
                                                                }`}
                                                            >
                                                                <Power className="h-5 w-5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex flex-col gap-4 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm text-slate-500">
                                        Página {usuarios.current_page} de {usuarios.last_page}
                                        {' · '}
                                        {usuarios.total} cuentas en total
                                    </p>

                                    <div className="flex flex-wrap items-center gap-1">
                                        {usuarios.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url ?? '#'}
                                                preserveScroll
                                                className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition ${
                                                    link.active
                                                        ? 'bg-slate-950 text-white'
                                                        : link.url
                                                            ? 'text-slate-600 hover:bg-slate-100'
                                                            : 'cursor-not-allowed text-slate-300'
                                                }`}
                                                aria-disabled={!link.url}
                                            >
                                                {link.label.includes('Previous') ? (
                                                    <ChevronLeft size={17} />
                                                ) : link.label.includes('Next') ? (
                                                    <ChevronRight size={17} />
                                                ) : (
                                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                    <Users size={30} />
                                </div>

                                <h3 className="mt-4 text-base font-bold text-slate-800">
                                    Todavía no hay cuentas registradas
                                </h3>

                                <p className="mt-2 text-sm text-slate-500">
                                    Creá una cuenta para que un tutor o profesor pueda acceder al sistema.
                                </p>

                                <Link
                                    href={route('usuarios.create')}
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                    <UserPlus size={17} />
                                    Crear primera cuenta
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}