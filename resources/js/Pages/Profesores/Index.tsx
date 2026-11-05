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
    ChevronLeft,
    ChevronRight,
    UserX,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import StatCard from '@/Components/Shared/StatCard';
import StatusBadge from '@/Components/Shared/StatusBadge';
import ConfirmDialog from '@/Components/Shared/ConfirmDialog';

interface Profesor {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
    email: string | null;
    telefono: string | null;
    direccion: string | null;
    localidad: string | null;
    especialidad: string | null;
    estado: boolean;
}

interface Paginacion {
    data: Profesor[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

interface Filtros {
    buscar: string;
    especialidad: string;
    orden: string;
    direccion: string;
}

interface Props {
    profesores: Paginacion;
    especialidades: string[];
    filtros: Filtros;
    totalInactivos: number;
}

export default function Index({
    profesores,
    especialidades,
    filtros,
    totalInactivos,
}: Props) {
    const [buscar, setBuscar] = useState(filtros.buscar ?? '');
    const [especialidad, setEspecialidad] = useState(
        filtros.especialidad ?? '',
    );
    const [orden, setOrden] = useState(filtros.orden ?? 'apellido');
    const [direccion, setDireccion] = useState(
        filtros.direccion ?? 'asc',
    );

    const [profesorSeleccionado, setProfesorSeleccionado] =
        useState<Profesor | null>(null);

    const [procesando, setProcesando] = useState(false);

    // Aplicar búsqueda y filtros.
    const aplicarFiltros = (e?: FormEvent<HTMLFormElement>) => {
        e?.preventDefault();

        router.get(
            '/profesores',
            {
                buscar,
                especialidad,
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

    // Cambiar de página conservando filtros y orden.
    const cambiarPagina = (pagina: number) => {
        router.get(
            '/profesores',
            {
                buscar,
                especialidad,
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

    // Cambiar orden ascendente o descendente.
    const cambiarOrden = (campo: 'apellido' | 'dni') => {
        const nuevaDireccion =
            orden === campo && direccion === 'asc' ? 'desc' : 'asc';

        setOrden(campo);
        setDireccion(nuevaDireccion);

        router.get(
            '/profesores',
            {
                buscar,
                especialidad,
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

    // Confirmar deshabilitación.
    const deshabilitarProfesor = () => {
        if (!profesorSeleccionado) return;

        router.delete(`/profesores/${profesorSeleccionado.id}`, {
            preserveScroll: true,
            onStart: () => setProcesando(true),
            onSuccess: () => setProfesorSeleccionado(null),
            onFinish: () => setProcesando(false),
        });
    };

    return (
        <>
            <Head title="Profesores" />

            <div className="space-y-6">
                {/* Encabezado */}
                <PageHeader
                    title="Profesores"
                    description="Administrá los profesores y entrenadores de la escuela de fútbol."
                    icon={<Users size={28} />}
                    actions={
                        <>
                            <Link
                                href="/profesores/historial"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                            >
                                <History size={17} />
                                Historial
                            </Link>

                            <Link
                                href="/profesores/create"
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                            >
                                <UserPlus size={17} />
                                Nuevo profesor
                            </Link>
                        </>
                    }
                />

                {/* Estadísticas */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <StatCard
                        title="Profesores activos"
                        value={profesores.total}
                        description="Total de profesores registrados"
                        icon={<Users size={23} />}
                        color="blue"
                    />

                    <StatCard
                        title="Profesores inactivos"
                        value={totalInactivos}
                        description="Total de profesores deshabilitados"
                        icon={<UserX size={23} />}
                        color="amber"
                    />
                </div>

                {/* Búsqueda y filtros */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-base font-bold text-slate-800">
                            Buscar profesores
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Filtrá por nombre, apellido, DNI o especialidad.
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

                        {/* Especialidad */}
                        <div className="sm:w-48">
                            <select
                                value={especialidad}
                                onChange={(e) =>
                                    setEspecialidad(e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">Especialidades</option>

                                {especialidades.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
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
                                setEspecialidad('');
                                setOrden('apellido');
                                setDireccion('asc');

                                router.get(
                                    '/profesores',
                                    {},
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Limpiar
                        </button>
                    </form>
                </div>

                {/* Tabla de profesores */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Listado de profesores
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Profesores activos registrados en el sistema.
                            </p>
                        </div>

                        <span className="text-sm font-medium text-slate-500">
                            {profesores.total}{' '}
                            {profesores.total === 1
                                ? 'profesor encontrado'
                                : 'profesores encontrados'}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left text-sm">
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
                                            Profesor
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

                                    <th className="px-5 py-4">Especialidad</th>
                                    <th className="px-5 py-4">Teléfono</th>
                                    <th className="px-5 py-4">Localidad</th>
                                    <th className="px-5 py-4">Estado</th>
                                    <th className="px-5 py-4 text-center">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {profesores.data.length > 0 ? (
                                    profesores.data.map((profesor) => (
                                        <tr
                                            key={profesor.id}
                                            className="transition hover:bg-slate-50/80"
                                        >
                                            <td className="px-5 py-4 font-medium text-slate-600">
                                                {profesor.dni}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-slate-800">
                                                    {profesor.apellido},{' '}
                                                    {profesor.nombre}
                                                </div>
                                                <div className="mt-1 text-xs text-slate-500">
                                                    {profesor.email || 'Sin email'}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                {profesor.especialidad ? (
                                                    <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                                        {profesor.especialidad}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">
                                                        Sin especialidad
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {profesor.telefono || '—'}
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {profesor.localidad || '—'}
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusBadge
                                                    status={
                                                        profesor.estado
                                                            ? 'activo'
                                                            : 'inactivo'
                                                    }
                                                />
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={`/profesores/${profesor.id}`}
                                                        title="Ver profesor"
                                                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                    >
                                                        <Eye size={18} />
                                                    </Link>

                                                    <Link
                                                        href={`/profesores/${profesor.id}/edit`}
                                                        title="Editar profesor"
                                                        className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                                                    >
                                                        <Pencil size={18} />
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        title="Deshabilitar profesor"
                                                        onClick={() =>
                                                            setProfesorSeleccionado(
                                                                profesor,
                                                            )
                                                        }
                                                        className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                                    >
                                                        <UserX size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-5 py-12 text-center"
                                        >
                                            <div className="flex flex-col items-center">
                                                <Users
                                                    size={36}
                                                    className="mb-3 text-slate-300"
                                                />

                                                <p className="font-semibold text-slate-700">
                                                    No se encontraron profesores
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
                    {profesores.total > 0 && (
                        <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500">
                                Mostrando{' '}
                                <span className="font-semibold text-slate-700">
                                    {profesores.from ?? 0} - {profesores.to ?? 0}
                                </span>{' '}
                                de{' '}
                                <span className="font-semibold text-slate-700">
                                    {profesores.total}
                                </span>{' '}
                                profesores
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={profesores.current_page <= 1}
                                    onClick={() =>
                                        cambiarPagina(
                                            profesores.current_page - 1,
                                        )
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <ChevronLeft size={17} />
                                    Anterior
                                </button>

                                <span className="px-2 text-sm font-medium text-slate-600">
                                    Página {profesores.current_page} de{' '}
                                    {profesores.last_page}
                                </span>

                                <button
                                    type="button"
                                    disabled={
                                        profesores.current_page >=
                                        profesores.last_page
                                    }
                                    onClick={() =>
                                        cambiarPagina(
                                            profesores.current_page + 1,
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
                show={profesorSeleccionado !== null}
                title="Deshabilitar profesor"
                message={
                    profesorSeleccionado
                        ? `¿Estás segura de que querés deshabilitar a ${profesorSeleccionado.nombre} ${profesorSeleccionado.apellido}? El profesor dejará de aparecer en el listado activo.`
                        : ''
                }
                confirmText="Sí, deshabilitar"
                cancelText="Cancelar"
                onConfirm={deshabilitarProfesor}
                onCancel={() => setProfesorSeleccionado(null)}
                processing={procesando}
                danger
            />
        </>
    );
}