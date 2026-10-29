import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { type PageProps } from '@/types';
import {
    ArrowLeft,
    Search,
    Users,
    Trophy,
    UserPlus,
} from 'lucide-react';

interface Categoria {
    id: number;
    nombre: string;
}

interface Jugador {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    categoria_id: number;
    categoria: Categoria;
}

interface Torneo {
    id: number;
    nombre: string;
    tipo: 'propio' | 'externo';
    categorias: Categoria[];
}

interface Props {
    torneo: Torneo;
    jugadores: Jugador[];
}

export default function InscribirJugador({ torneo, jugadores }: Props) {
    const [buscar, setBuscar] = useState('');
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

    const jugadoresFiltrados = jugadores.filter((jugador) => {
        const nombreCompleto =
            `${jugador.nombre} ${jugador.apellido}`.toLowerCase();

        const coincideBusqueda =
            nombreCompleto.includes(buscar.toLowerCase()) ||
            String(jugador.dni).includes(buscar);

        const coincideCategoria =
            categoriaSeleccionada === '' ||
            jugador.categoria_id === Number(categoriaSeleccionada);

        return coincideBusqueda && coincideCategoria;
    });

    const inscribirJugador = (jugadorId: number) => {
        router.post(
            `/torneos/${torneo.id}/inscribir-jugador`,
            {
                jugador_id: jugadorId,
            },
            {
                preserveScroll: true,
            }
        );
    };
    const { flash, errors } = usePage<
        PageProps<{
            flash: {
                success?: string;
                error?: string;
            };
            errors: {
                jugador_id?: string;
            };
        }>
    >().props;

    return (
        <>
            <Head title={`Inscribir jugadores | ${torneo.nombre}`} />

            <div className="min-h-screen !bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
                <div className="mx-auto max-w-5xl space-y-6">

                    {/* ENCABEZADO */}
                    <div className="rounded-2xl !bg-slate-950 px-6 py-7 shadow-lg">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl !bg-slate-800">
                                    <Trophy size={28} className="!text-white" />
                                </div>

                                <div>
                                    <p className="text-sm !text-slate-300">
                                        Torneo externo
                                    </p>

                                    <h1 className="text-2xl font-bold !text-white sm:text-3xl">
                                        Inscribir jugadores
                                    </h1>

                                    <p className="mt-1 text-sm !text-slate-300">
                                        {torneo.nombre}
                                    </p>
                                </div>
                            </div>

                            <Link
                                href={`/torneos/${torneo.id}`}
                                className="inline-flex items-center justify-center gap-2 rounded-xl !bg-white px-5 py-3 text-sm font-semibold !text-slate-900"
                            >
                                <ArrowLeft size={18} />
                                Volver al torneo
                            </Link>

                        </div>
                    </div>

                    {/* MENSAJES */}
                    {flash?.success && (
                        <div className="rounded-xl border border-emerald-200 !bg-emerald-50 p-4 text-sm font-medium !text-emerald-800">
                            {flash.success}
                        </div>
                    )}

                    {errors?.jugador_id && (
                        <div className="rounded-xl border border-red-200 !bg-red-50 p-4 text-sm font-medium !text-red-700">
                            {errors.jugador_id}
                        </div>
                    )}

                    {/* FILTROS */}
                    <section className="rounded-2xl border border-slate-200 !bg-white p-6 shadow-sm">

                        <h2 className="mb-5 text-lg font-bold !text-slate-900">
                            Buscar jugadores
                        </h2>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                            <div>
                                <label className="mb-2 block text-sm font-semibold !text-slate-700">
                                    Nombre o DNI
                                </label>

                                <div className="relative">
                                    <Search
                                        size={18}
                                        className="absolute left-3 top-3.5 !text-slate-400"
                                    />

                                    <input
                                        type="text"
                                        value={buscar}
                                        onChange={(e) => setBuscar(e.target.value)}
                                        placeholder="Buscar jugador..."
                                        className="w-full rounded-lg border border-slate-300 !bg-white py-3 pl-10 pr-4 text-sm !text-slate-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold !text-slate-700">
                                    Categoría
                                </label>

                                <select
                                    value={categoriaSeleccionada}
                                    onChange={(e) =>
                                        setCategoriaSeleccionada(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-slate-300 !bg-white px-4 py-3 text-sm !text-slate-900"
                                >
                                    <option value="">Todas las categorías</option>

                                    {torneo.categorias.map((categoria) => (
                                        <option
                                            key={categoria.id}
                                            value={categoria.id}
                                        >
                                            {categoria.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                        </div>
                    </section>

                    {/* LISTADO DE JUGADORES */}
                    <section className="rounded-2xl border border-slate-200 !bg-white p-6 shadow-sm">

                        <div className="mb-5 flex items-center justify-between gap-3">

                            <h2 className="flex items-center gap-2 text-lg font-bold !text-slate-900">
                                <Users size={21} />
                                Jugadores disponibles
                            </h2>

                            <span className="rounded-full !bg-slate-100 px-3 py-1 text-sm font-semibold !text-slate-700">
                                {jugadoresFiltrados.length}
                            </span>

                        </div>

                        {jugadoresFiltrados.length === 0 ? (

                            <div className="rounded-xl border border-dashed border-slate-300 !bg-slate-50 p-8 text-center">
                                <Users
                                    size={36}
                                    className="mx-auto mb-3 !text-slate-400"
                                />

                                <p className="font-medium !text-slate-700">
                                    No hay jugadores disponibles.
                                </p>

                                <p className="mt-2 text-sm !text-slate-500">
                                    Verificá las categorías del torneo
                                    o modificá los filtros de búsqueda.
                                </p>
                            </div>

                        ) : (

                            <div className="space-y-3">

                                {jugadoresFiltrados.map((jugador) => (

                                    <div
                                        key={jugador.id}
                                        className="flex flex-col gap-4 rounded-xl border border-slate-200 !bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >

                                        <div>
                                            <p className="font-semibold !text-slate-900">
                                                {jugador.apellido}, {jugador.nombre}
                                            </p>

                                            <p className="mt-1 text-sm !text-slate-500">
                                                DNI: {jugador.dni}
                                            </p>

                                            <span className="mt-2 inline-block rounded-full !bg-blue-100 px-3 py-1 text-xs font-semibold !text-blue-800">
                                                {jugador.categoria.nombre}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => inscribirJugador(jugador.id)}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg !bg-emerald-700 px-4 py-2 text-sm font-semibold !text-white transition hover:!bg-emerald-800"
                                        >
                                            <UserPlus size={17} />
                                            Inscribir
                                        </button>

                                    </div>

                                ))}

                            </div>

                        )}

                    </section>

                </div>
            </div>
        </>
    );
}