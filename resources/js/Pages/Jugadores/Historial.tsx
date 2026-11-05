import { Head, Link, router } from '@inertiajs/react';
import {
    History,
    Users,
    Eye,
    RotateCcw,
    UserRound,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatCard from '@/Components/Shared/StatCard';
import StatusBadge from '@/Components/Shared/StatusBadge';

interface Categoria {
    id: number;
    anio?: number;
}

interface Jugador {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
    nacionalidad: string | null;
    fecha_nacimiento: string | null;
    telefono: string | null;
    direccion: string | null;
    localidad: string | null;
    estado: boolean;
    categoria: Categoria | null;
}

interface Props {
    jugadores: Jugador[];
}

export default function Historial({ jugadores }: Props) {
    const reactivarJugador = (jugador: Jugador) => {
        const confirmar = window.confirm(
            `¿Estás seguro de que querés reactivar a ${jugador.nombre} ${jugador.apellido}?`,
        );

        if (!confirmar) return;

        router.put(
            `/jugadores/${jugador.id}/reactivar`,
            {},
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title="Historial de jugadores" />

            <div className="min-h-screen bg-slate-50 p-6">
                <div className="mx-auto max-w-7xl">

                    <PageHeader
                        title="Historial de jugadores"
                        description="Consultá los jugadores deshabilitados y administrá su reactivación."
                        icon={<History size={28} />}
                        actions={
                            <Link
                                href="/jugadores"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
                            >
                                <Users size={17} />
                                Volver a jugadores
                            </Link>
                        }
                    />

                   <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <StatCard
                            title="Jugadores en historial"
                            value={jugadores.length}
                            description="Total de jugadores deshabilitados"
                            icon={<History size={24} />}
                            color="amber"
                        />
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 p-5">
                            <h2 className="font-semibold text-slate-800">
                                Registro histórico
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Jugadores que fueron deshabilitados del sistema.
                            </p>
                        </div>

                        {jugadores.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[850px] text-left text-sm">
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th className="px-5 py-4">Jugador</th>
                                            <th className="px-5 py-4">DNI</th>
                                            <th className="px-5 py-4">Categoría</th>
                                            <th className="px-5 py-4">Estado</th>
                                            <th className="px-5 py-4 text-center">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {jugadores.map((jugador) => (
                                            <tr
                                                key={jugador.id}
                                                className="transition hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                                            <UserRound size={20} />
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold text-slate-800">
                                                                {jugador.apellido},{' '}
                                                                {jugador.nombre}
                                                            </p>

                                                            <p className="text-xs text-slate-400">
                                                                ID: {jugador.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-slate-600">
                                                    {jugador.dni}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                                                        {jugador.categoria?.anio ?? 'Sin categoría'}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <StatusBadge
                                                        status={
                                                            jugador.estado
                                                                ? 'activo'
                                                                : 'inactivo'
                                                        }
                                                    />
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link
                                                            href={`/jugadores/${jugador.id}`}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                                                        >
                                                            <Eye size={15} />
                                                            Ver
                                                        </Link>

                                                        {!jugador.estado && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    reactivarJugador(jugador)
                                                                }
                                                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                                                            >
                                                                <RotateCcw size={15} />
                                                                Reactivar
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="px-6 py-16 text-center">
                                <History
                                    size={42}
                                    className="mx-auto mb-4 text-slate-300"
                                />

                                <h3 className="font-semibold text-slate-700">
                                    No hay jugadores en el historial
                                </h3>

                                <p className="mt-2 text-sm text-slate-500">
                                    Cuando se deshabiliten jugadores, aparecerán registrados en esta sección.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}