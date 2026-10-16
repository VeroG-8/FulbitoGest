import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, RotateCcw, Building2 } from 'lucide-react';

interface Club {
    id: number;
    nombre: string;
    localidad: string | null;
    direccion: string | null;
    telefono: string | null;
    email: string | null;
    estado: boolean;
}

interface Props {
    clubes: Club[];
}

export default function Historial({ clubes }: Props) {
    const reactivarClub = (club: Club) => {
        if (confirm(`¿Querés reactivar el club "${club.nombre}"?`)) {
            router.put(`/clubes/${club.id}/reactivar`);
        }
    };

    return (
        <>
            <Head title="Historial de clubes" />

            <div className="min-h-screen bg-slate-50 p-6 md:p-10">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <Link
                                href="/clubes"
                                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
                            >
                                <ArrowLeft size={17} />
                                Volver a clubes
                            </Link>

                            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                                Historial de clubes
                            </h1>

                            <p className="mt-2 text-sm text-slate-500">
                                Consultá y reactivá los clubes que fueron desactivados.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                            <Building2 className="text-slate-500" size={22} />

                            <div>
                                <p className="text-sm text-slate-500">
                                    Clubes inactivos
                                </p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {clubes.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        {clubes.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <Building2
                                    className="mx-auto mb-4 text-slate-400"
                                    size={40}
                                />

                                <h2 className="font-semibold text-slate-800">
                                    No hay clubes inactivos
                                </h2>

                                <p className="mt-2 text-sm text-slate-500">
                                    Los clubes que desactives aparecerán aquí.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4">Club</th>
                                            <th className="px-6 py-4">Localidad</th>
                                            <th className="px-6 py-4">Contacto</th>
                                            <th className="px-6 py-4">Estado</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {clubes.map((club) => (
                                            <tr key={club.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-slate-800">
                                                        {club.nombre}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {club.direccion || 'Sin dirección registrada'}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-4 text-slate-600">
                                                    {club.localidad || 'No especificada'}
                                                </td>

                                                <td className="px-6 py-4 text-slate-600">
                                                    <p>{club.telefono || 'Sin teléfono'}</p>
                                                    <p className="mt-1 text-xs">
                                                        {club.email || 'Sin correo'}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                                        Inactivo
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => reactivarClub(club)}
                                                        className="inline-flex items-center gap-2 rounded-lg border border-green-200 px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                                                    >
                                                        <RotateCcw size={16} />
                                                        Reactivar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}