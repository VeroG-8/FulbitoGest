import { Head, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Eye, MapPin, Phone, Mail, Ban } from 'lucide-react';

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

export default function Index({ clubes }: Props) {
    const desactivarClub = (id: number, nombre: string) => {
        if (confirm(`¿Estás segura de que querés desactivar el club "${nombre}"?`)) {
            router.delete(`/clubes/${id}`);
        }
    };
    return (
        <>
            <Head title="Clubes" />

            <div className="min-h-screen bg-slate-50 p-6 md:p-10">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                                Clubes
                            </h1>

                            <p className="mt-2 text-sm text-slate-500">
                                Administrá los clubes registrados en FulbitoGest.
                            </p>
                        </div>

                        <Link
                            href="/clubes/create"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            <Plus size={18} />
                            Registrar club
                        </Link>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Clubes activos
                            </p>

                            <p className="mt-2 text-3xl font-bold text-slate-800">
                                {clubes.length}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h2 className="font-semibold text-slate-800">
                                Listado de clubes
                            </h2>
                        </div>

                        {clubes.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                                    <MapPin className="text-slate-500" size={25} />
                                </div>

                                <h3 className="font-semibold text-slate-800">
                                    No hay clubes registrados
                                </h3>

                                <p className="mt-2 text-sm text-slate-500">
                                    Registrá el primer club para comenzar.
                                </p>

                                <Link
                                    href="/clubes/create"
                                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    <Plus size={16} />
                                    Registrar club
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4">Club</th>
                                            <th className="px-6 py-4">Localidad</th>
                                            <th className="px-6 py-4">Contacto</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {clubes.map((club) => (
                                            <tr
                                                key={club.id}
                                                className="transition hover:bg-slate-50"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-slate-800">
                                                        {club.nombre}
                                                    </div>

                                                    <div className="mt-1 text-xs text-slate-500">
                                                        {club.direccion || 'Sin dirección registrada'}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-slate-600">
                                                    {club.localidad || 'No especificada'}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {club.telefono && (
                                                        <div className="mb-1 flex items-center gap-2 text-slate-600">
                                                            <Phone size={14} />
                                                            {club.telefono}
                                                        </div>
                                                    )}

                                                    {club.email && (
                                                        <div className="flex items-center gap-2 text-slate-600">
                                                            <Mail size={14} />
                                                            {club.email}
                                                        </div>
                                                    )}

                                                    {!club.telefono && !club.email && (
                                                        <span className="text-slate-400">
                                                            Sin contacto
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={`/clubes/${club.id}`}
                                                            title="Ver club"
                                                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                                                        >
                                                            <Eye size={17} />
                                                        </Link>

                                                        <Link
                                                            href={`/clubes/${club.id}/edit`}
                                                            title="Editar club"
                                                            className="rounded-lg border border-slate-200 p-2 text-blue-600 transition hover:bg-blue-50"
                                                        >
                                                            <Pencil size={17} />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => desactivarClub(club.id, club.nombre)}
                                                            title="Desactivar club"
                                                            className="rounded-lg border border-slate-200 p-2 text-red-600 transition hover:bg-red-50"
                                                        >
                                                            <Ban size={17} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <p className="mt-4 text-xs text-slate-400">
                        Se muestran únicamente los clubes activos.
                    </p>
                </div>
            </div>
        </>
    );
}