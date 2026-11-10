import { useState, type FormEvent } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Users,
    UserPlus,
    History,
    Search,
    Eye,
    Pencil,
    Ban,
    Check,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    UserX,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatCard from '@/Components/Shared/StatCard';
import StatusBadge from '@/Components/Shared/StatusBadge';
import ConfirmDialog from '@/Components/Shared/ConfirmDialog';

interface Categoria {
    id: number;
    anio: number;
}

interface Jugador {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
    nacionalidad: string | null;
    fecha_nacimiento: string;
    telefono: string | null;
    direccion: string | null;
    localidad: string | null;
    estado: boolean;
    categoria: Categoria | null;
}

interface Paginacion {
    data: Jugador[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

interface Filtros {
    buscar: string;
    categoria: string | null;
    orden: string;
    direccion: string;
}

interface Props {
    jugadores: Paginacion;
    categorias: Categoria[];
    filtros: Filtros;
    totalInactivos: number;
    permisos: {
        crear: boolean;
        editar: boolean;
        eliminar: boolean;
        historial: boolean;
    };
}

export default function Index({
    jugadores,
    categorias,
    filtros,
    totalInactivos,
    permisos,
}: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [categoria, setCategoria] = useState<string[]>(
        Array.isArray(filtros.categoria)
            ? filtros.categoria.map(String)
            : filtros.categoria
            ? [String(filtros.categoria)]
            : [],
    );
    const [orden, setOrden] = useState(filtros.orden ?? 'apellido');
    const [direccion, setDireccion] = useState(
        filtros.direccion ?? 'asc',
    );

    const [jugadorSeleccionado, setJugadorSeleccionado] =
        useState<Jugador | null>(null);

    const [procesando, setProcesando] = useState(false);
    const [categoriasAbiertas, setCategoriasAbiertas] = useState(false);

    const toggleCategoria = (id: string) => {
        setCategoria((actuales) =>
            actuales.includes(id)
                ? actuales.filter((item) => item !== id)
                : [...actuales, id]
        );
    };
    // Aplicar búsqueda y filtros.
    const aplicarFiltros = (e?: FormEvent<HTMLFormElement>) => {
        e?.preventDefault();

        router.get(
            '/jugadores',
            {
                buscar,
                categoria,
                orden,
                direccion,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // Cambiar de página conservando los filtros.
    const cambiarPagina = (pagina: number) => {
        router.get(
            '/jugadores',
            {
                buscar,
                categoria,
                orden,
                direccion,
                page: pagina,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Confirmar deshabilitación.
    const deshabilitarJugador = () => {
        if (!jugadorSeleccionado) return;

        router.delete(`/jugadores/${jugadorSeleccionado.id}`, {
            preserveScroll: true,
            onStart: () => setProcesando(true),
            onSuccess: () => setJugadorSeleccionado(null),
            onFinish: () => setProcesando(false),
        });
    };
    const cambiarOrden = (campo: 'apellido' | 'dni') => {
        const nuevaDireccion =
            orden === campo && direccion === 'asc' ? 'desc' : 'asc';

            setOrden(campo);
            setDireccion(nuevaDireccion);

            router.get(
                '/jugadores',
                {
                    buscar,
                    categoria,
                    orden: campo,
                    direccion: nuevaDireccion,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
    };

    return (
        <>
            <Head title="Jugadores" />

            <div className="space-y-6">
                {/* Encabezado */}
                <PageHeader
                    title="Jugadores"
                    description="Administrá los jugadores registrados en la escuela de fútbol."
                    icon={<Users size={28} />}
                    actions={
                        <>
                            {permisos.historial && (
                                <Link
                                    href="/jugadores/historial"
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                                >
                                    <History size={17} />
                                    Historial
                                </Link>
                            )}

                            {permisos.crear && (
                                <Link
                                    href="/jugadores/create"
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                >
                                    <UserPlus size={17} />
                                    Nuevo jugador
                                </Link>
                            )}
                        </>
                    }
                />

                {/* Estadísticas */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <StatCard
                        title="Jugadores activos"
                        value={jugadores.total}
                        description="Total de jugadores registrados"
                        icon={<Users size={23} />}
                        color="blue"
                    />

                    <StatCard
                        title="Jugadores inactivos"
                        value={totalInactivos}
                        description="Total de jugadores deshabilitados"
                        icon={<UserX size={23} />}
                        color="amber"
                    />
                </div>

                {/* Búsqueda y filtros */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-base font-bold text-slate-800">
                            Buscar jugadores
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Filtrá por nombre, apellido o categoría.
                        </p>
                    </div>

                                    
                    <form
                        onSubmit={aplicarFiltros}
                        className="flex flex-col gap-3 sm:flex-row"
                    >
                        {/* Buscador */}
                        <div className="relative flex-1">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={buscar}
                                onChange={(e) => setBuscar(e.target.value)}
                                placeholder="Buscar por nombre, apellido o DNI..."
                                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {/* Categoría */}
                        <div className="sm:w-35">
                        <div className="relative w-full">
                            <button
                                type="button"
                                onClick={() => setCategoriasAbiertas(!categoriasAbiertas)}
                                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 transition hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            >
                                <span>
                                    {categoria.length === 0
                                        ? 'Categorías'
                                        : `${categoria.length} categorías seleccionadas`}
                                </span>

                                <ChevronDown
                                    size={18}
                                    className={`transition-transform ${
                                        categoriasAbiertas ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {categoriasAbiertas && (
                                <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[220px] rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                                    <div className="mb-2 flex items-center justify-between border-b border-slate-100 px-2 pb-2">
                                    
                                        <button
                                            type="button"
                                            onClick={() => setCategoria([])}
                                            className="text-xs font-medium text-blue-600 hover:text-blue-800"
                                        >
                                            Limpiar
                                        </button>
                                    </div>

                                    <div className="max-h-52 space-y-1 overflow-y-auto">
                                        {categorias.map((item) => (
                                            <label
                                                key={item.id}
                                                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-700 transition hover:bg-blue-50"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={categoria.includes(String(item.id))}
                                                    onChange={() =>
                                                        toggleCategoria(String(item.id))
                                                    }
                                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />

                                                <span>
                                                    {item.anio}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        </div>

                        {/* Buscar */}
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            <Search size={16} />
                            Buscar
                        </button>

                        {/* Limpiar */}
                        <button
                            type="button"
                            onClick={() => {
                                setBuscar('');
                                setCategoria([]);
                                setOrden('apellido');
                                setDireccion('asc');

                                router.get('/jugadores', {}, {
                                    preserveState: true,
                                    preserveScroll: true,
                                });
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Limpiar
                        </button>
                    </form>

                </div>

                {/* Tabla de jugadores */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Listado de jugadores
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Jugadores activos registrados en el sistema.
                            </p>
                        </div>

                        <span className="text-sm font-medium text-slate-500">
                            {jugadores.total}{' '}
                            {jugadores.total === 1
                                ? 'jugador encontrado'
                                : 'jugadores encontrados'}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[750px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                <tr>
                                    <th className="px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => cambiarOrden('dni')}
                                            className="inline-flex items-center gap-2 font-semibold transition hover:text-blue-600"
                                        >
                                            DNI
                                            {orden === 'dni' ? (
                                                direccion === 'asc' ? (
                                                    <ArrowUp size={15} className="text-blue-600" />
                                                ) : (
                                                    <ArrowDown size={15} className="text-blue-600" />
                                                )
                                            ) : (
                                                <ArrowUpDown size={15} className="text-slate-400" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => cambiarOrden('apellido')}
                                            className="inline-flex items-center gap-2 font-semibold transition hover:text-blue-600"
                                        >
                                            Jugador
                                            {orden === 'apellido' ? (
                                                direccion === 'asc' ? (
                                                    <ArrowUp size={15} className="text-blue-600" />
                                                ) : (
                                                    <ArrowDown size={15} className="text-blue-600" />
                                                )
                                            ) : (
                                                <ArrowUpDown size={15} className="text-slate-400" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-5 py-4">Categoría</th>
                                    <th className="px-5 py-4">Localidad</th>
                                    <th className="px-5 py-4">Estado</th>
                                    {(permisos.editar || permisos.eliminar || true) && (
                                        <th className="px-5 py-4 text-center">
                                            Acciones
                                        </th>
                                    )}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {jugadores.data.length > 0 ? (
                                    jugadores.data.map((jugador) => (
                                        <tr
                                            key={jugador.id}
                                            className="transition hover:bg-slate-50/80"
                                        >
                                            <td className="px-5 py-4 font-medium text-slate-600">
                                                {jugador.dni}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-slate-800">
                                                    {jugador.apellido},{' '}
                                                    {jugador.nombre}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                                    {jugador.categoria?.anio ?? 'Sin categoría'}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {jugador.localidad || '—'}
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

                                                    {/* Consultar ficha: disponible para todos los roles autorizados */}
                                                    <Link
                                                        href={`/jugadores/${jugador.id}`}
                                                        title="Ver jugador"
                                                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                    >
                                                        <Eye size={18} />
                                                    </Link>

                                                    {/* Editar: solamente administradores */}
                                                    {permisos.editar && (
                                                        <Link
                                                            href={`/jugadores/${jugador.id}/edit`}
                                                            title="Editar jugador"
                                                            className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                        >
                                                            <Pencil size={18} />
                                                        </Link>
                                                    )}

                                                    {/* Deshabilitar: solamente administradores */}
                                                    {permisos.eliminar && (
                                                        <button
                                                            type="button"
                                                            title="Deshabilitar jugador"
                                                            onClick={() => setJugadorSeleccionado(jugador)}
                                                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                                        >
                                                            <UserX size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-12 text-center"
                                        >
                                            <div className="flex flex-col items-center">
                                                <Users
                                                    size={36}
                                                    className="mb-3 text-slate-300"
                                                />

                                                <p className="font-semibold text-slate-700">
                                                    No se encontraron jugadores
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Probá modificando los
                                                    criterios de búsqueda.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {jugadores.total > 0 && (
                        <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Mostrando{' '}
                                <span className="font-semibold text-slate-700">
                                    {jugadores.from ?? 0} - {jugadores.to ?? 0}
                                </span>{' '}
                                de{' '}
                                <span className="font-semibold text-slate-700">
                                    {jugadores.total}
                                </span>{' '}
                                jugadores
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={jugadores.current_page <= 1}
                                    onClick={() =>
                                        cambiarPagina(
                                            jugadores.current_page - 1,
                                        )
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft size={17} />
                                    Anterior
                                </button>

                                <span className="px-2 text-sm font-medium text-slate-600">
                                    Página {jugadores.current_page} de{' '}
                                    {jugadores.last_page}
                                </span>

                                <button
                                    type="button"
                                    disabled={
                                        jugadores.current_page >=
                                        jugadores.last_page
                                    }
                                    onClick={() =>
                                        cambiarPagina(
                                            jugadores.current_page + 1,
                                        )
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Siguiente
                                    <ChevronRight size={17} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmación de deshabilitación */}
            <ConfirmDialog
                show={jugadorSeleccionado !== null}
                title="Deshabilitar jugador"
                message={
                    jugadorSeleccionado
                        ? `¿Estás seguro de que querés deshabilitar a ${jugadorSeleccionado.nombre} ${jugadorSeleccionado.apellido}? El jugador dejará de aparecer en el listado activo.`
                        : ''
                }
                confirmText="Sí, deshabilitar"
                cancelText="Cancelar"
                onConfirm={deshabilitarJugador}
                onCancel={() => setJugadorSeleccionado(null)}
                processing={procesando}
                danger
            />
        </>
    );
}