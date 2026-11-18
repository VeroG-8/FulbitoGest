import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    Users,
    UserRound,
    History,
    Search,
    IdCard,
    Phone,
    Mail,
    MapPin,
    RotateCcw,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatCard from '@/Components/Shared/StatCard';
import StatusBadge from '@/Components/Shared/StatusBadge';

interface Tutor {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
    email: string | null;
    telefono: string | null;
    localidad: string | null;
    estado: boolean;
}

interface Props {
    tutores: Tutor[];
}

export default function Historial({ tutores }: Props) {
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);

    const POR_PAGINA = 10;
    const tutoresFiltrados = useMemo(() => {
        const termino = busqueda.trim().toLowerCase();

        if (!termino) return tutores;

        return tutores.filter((tutor) =>
            [
                tutor.dni,
                tutor.nombre,
                tutor.apellido,
                `${tutor.nombre} ${tutor.apellido}`,
                `${tutor.apellido} ${tutor.nombre}`,
                tutor.email ?? '',
                tutor.telefono ?? '',
                tutor.localidad ?? '',
            ]
                .join(' ')
                .toLowerCase()
                .includes(termino),
        );
    }, [tutores, busqueda]);

    const totalPaginas = Math.ceil(
        tutoresFiltrados.length / POR_PAGINA,
    );

    const tutoresPaginados = tutoresFiltrados.slice(
        (paginaActual - 1) * POR_PAGINA,
        paginaActual * POR_PAGINA,
    );

    const desde = tutoresFiltrados.length === 0
        ? 0
        : (paginaActual - 1) * POR_PAGINA + 1;

    const hasta = Math.min(
        paginaActual * POR_PAGINA,
        tutoresFiltrados.length,
    );
    const reactivarTutor = (tutor: Tutor) => {
        if (
            confirm(
                `¿Estás seguro de reactivar a ${tutor.nombre} ${tutor.apellido}?`,
            )
        ) {
            router.put(`/tutores/${tutor.id}/reactivar`);
        }
    };

    return (
        <>
            <Head title="Historial de tutores" />

            <div className="space-y-6">
                <PageHeader
                    title="Historial de tutores"
                    description="Consultá los responsables deshabilitados y gestioná su reactivación."
                    icon={<History className="h-6 w-6" />}
                    actions={
                        <Link
                            href="/tutores"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-800"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver a tutores
                        </Link>
                    }
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <StatCard
                        title="Tutores deshabilitados"
                        value={tutores.length}
                        description="Responsables en el historial"
                        icon={<UserRound className="h-5 w-5" />}
                        color="amber"
                    />

                    <StatCard
                        title="Resultados encontrados"
                        value={tutoresFiltrados.length}
                        description="Según la búsqueda actual"
                        icon={<Users className="h-5 w-5" />}
                        color="blue"
                    />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-base font-bold text-slate-800">
                            Buscar tutores
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Buscá por DNI, nombre, apellido o datos de contacto.
                        </p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => {
                                setBusqueda(e.target.value);
                                setPaginaActual(1);
                            }}
                            placeholder="Buscar por DNI, nombre, apellido, teléfono o email..."
                            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Tutores deshabilitados
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Responsables que ya no se encuentran activos en el sistema.
                            </p>
                        </div>

                        <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            {tutoresFiltrados.length}{' '}
                            {tutoresFiltrados.length === 1
                                ? 'resultado'
                                : 'resultados'}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                                    <th className="px-6 py-4">DNI</th>
                                    <th className="px-6 py-4">Tutor</th>
                                    <th className="px-6 py-4">Contacto</th>
                                    <th className="px-6 py-4">Localidad</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-center">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {tutoresFiltrados.length > 0 ? (
                                    tutoresPaginados.map((tutor) => (
                                        <tr
                                            key={tutor.id}
                                            className="transition hover:bg-slate-50/80"
                                        >
                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <IdCard className="h-4 w-4 text-slate-400" />
                                                    {tutor.dni}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                                        <UserRound className="h-5 w-5" />
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-slate-800">
                                                            {tutor.apellido},{' '}
                                                            {tutor.nombre}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            Tutor
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                        <span>
                                                            {tutor.telefono ??
                                                                'Sin teléfono'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                                        <span>
                                                            {tutor.email ??
                                                                'Sin email'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                                                    {tutor.localidad ??
                                                        'No especificada'}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <StatusBadge status="inactivo" />
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            reactivarTutor(tutor)
                                                        }
                                                        title="Reactivar tutor"
                                                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                        Reactivar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-14 text-center"
                                        >
                                            <div className="mx-auto flex max-w-sm flex-col items-center">
                                                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                    <Users className="h-7 w-7" />
                                                </div>

                                                <p className="font-semibold text-slate-700">
                                                    {tutores.length === 0
                                                        ? 'No hay tutores deshabilitados'
                                                        : 'No se encontraron tutores'}
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    {tutores.length === 0
                                                        ? 'Los tutores que deshabilites aparecerán en esta sección.'
                                                        : 'Probá modificar el término de búsqueda.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                   {tutoresFiltrados.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-500">
                            Mostrando {desde} a {hasta} de{' '}
                            {tutoresFiltrados.length} tutores
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={paginaActual === 1}
                                onClick={() =>
                                    setPaginaActual((actual) => actual - 1)
                                }
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            <span className="px-2 text-sm font-medium text-slate-600">
                                Página {paginaActual} de {totalPaginas}
                            </span>

                            <button
                                type="button"
                                disabled={paginaActual >= totalPaginas}
                                onClick={() =>
                                    setPaginaActual((actual) => actual + 1)
                                }
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )} 
                </div>
            </div>
        </>
    );
}