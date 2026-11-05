import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    Users,
    UserRound,
    UserPlus,
    History,
    Search,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
    IdCard,
    Phone,
    Mail,
    MapPin,
    Eye,
    Pencil,
    UserX,
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
    direccion: string | null;
    localidad: string | null;
    estado: boolean;
}

interface Props {
    tutores: Tutor[];
    totalActivos: number;
    totalInactivos: number;
    flash?: {
        success?: string;
    };
}

type CampoOrden = 'nombre' | 'dni';
type DireccionOrden = 'asc' | 'desc';

const POR_PAGINA = 10;

export default function Index({ tutores, totalActivos,
    totalInactivos,flash }: Props) {

    const [busqueda, setBusqueda] = useState('');
    const [localidadSeleccionada, setLocalidadSeleccionada] = useState('Todas');
    const [campoOrden, setCampoOrden] = useState<CampoOrden>('nombre');
    const [direccionOrden, setDireccionOrden] =
        useState<DireccionOrden>('asc');
    const [paginaActual, setPaginaActual] = useState(1);

    const localidades = useMemo(() => {
        return Array.from(
            new Set(
                tutores
                    .map((tutor) => tutor.localidad)
                    .filter((localidad): localidad is string =>
                        Boolean(localidad?.trim()),
                    ),
            ),
        ).sort((a, b) => a.localeCompare(b));
    }, [tutores]);

    const tutoresFiltrados = useMemo(() => {
        let resultado = [...tutores];

        const termino = busqueda.trim().toLowerCase();

        if (termino) {
            resultado = resultado.filter((tutor) =>
                [
                    tutor.dni,
                    tutor.nombre,
                    tutor.apellido,
                    `${tutor.nombre} ${tutor.apellido}`,
                    `${tutor.apellido} ${tutor.nombre}`,
                ]
                    .join(' ')
                    .toLowerCase()
                    .includes(termino),
            );
        }

        if (localidadSeleccionada !== 'Todas') {
            resultado = resultado.filter(
                (tutor) => tutor.localidad === localidadSeleccionada,
            );
        }

        resultado.sort((a, b) => {
            const valorA =
                campoOrden === 'nombre' ? a.nombre : a.dni;
            const valorB =
                campoOrden === 'nombre' ? b.nombre : b.dni;

            const comparacion = valorA.localeCompare(valorB, 'es', {
                numeric: true,
                sensitivity: 'base',
            });

            return direccionOrden === 'asc'
                ? comparacion
                : -comparacion;
        });

        return resultado;
    }, [tutores, busqueda, localidadSeleccionada, campoOrden, direccionOrden]);

    const totalPaginas = Math.ceil(
        tutoresFiltrados.length / POR_PAGINA,
    );

    const tutoresPaginados = tutoresFiltrados.slice(
        (paginaActual - 1) * POR_PAGINA,
        paginaActual * POR_PAGINA,
    );

   

    const cambiarOrden = (campo: CampoOrden) => {
        if (campoOrden === campo) {
            setDireccionOrden((actual) =>
                actual === 'asc' ? 'desc' : 'asc',
            );
        } else {
            setCampoOrden(campo);
            setDireccionOrden('asc');
        }

        setPaginaActual(1);
    };

    const deshabilitarTutor = (tutor: Tutor) => {
        if (
            confirm(
                `¿Estás seguro de deshabilitar a ${tutor.nombre} ${tutor.apellido}?`,
            )
        ) {
            router.delete(`/tutores/${tutor.id}`);
        }
    };

    const limpiarFiltros = () => {
        setBusqueda('');
        setLocalidadSeleccionada('Todas');
        setPaginaActual(1);
    };

    const iconoOrden = (campo: CampoOrden) => {
        if (campoOrden !== campo) {
            return <ArrowUpDown className="h-3.5 w-3.5" />;
        }

        return direccionOrden === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
        ) : (
            <ChevronDown className="h-4 w-4" />
        );
    };

    return (
        <>
            <Head title="Tutores" />

            <div className="space-y-6">
                <PageHeader
                    title="Tutores"
                    description="Administrá la información de los responsables de los jugadores."
                    icon={<Users size={28} />}
                    actions={
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href="/tutores/historial"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                            >
                                <History className="h-4 w-4" />
                                Historial
                            </Link>

                            <Link
                                href="/tutores/create"
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                            >
                                <UserPlus size={17} />
                                Nuevo tutor
                            </Link>
                        </div>
                    }
                />

                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <StatCard
                        title="Tutores activos"
                        value={totalActivos}
                        description="Responsables habilitados"
                        icon={<UserRound className="h-5 w-5" />}
                        color="emerald"
                    />

                    <StatCard
                        title="Tutores inactivos"
                        value={totalInactivos}
                        description="Responsables deshabilitados"
                        icon={<UserX className="h-5 w-5" />}
                        color="amber"
                    />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-base font-bold text-slate-800">
                            Buscar y filtrar tutores
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Buscá por DNI, nombre o apellido y filtrá por
                            localidad.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_240px_auto]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <input
                                type="text"
                                value={busqueda}
                                onChange={(e) => {
                                    setBusqueda(e.target.value);
                                    setPaginaActual(1);
                                }}
                                placeholder="Buscar por DNI, nombre o apellido..."
                                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <select
                            value={localidadSeleccionada}
                            onChange={(e) => {
                                setLocalidadSeleccionada(e.target.value);
                                setPaginaActual(1);
                            }}
                            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="Todas">Todas las localidades</option>

                            {localidades.map((localidad) => (
                                <option key={localidad} value={localidad}>
                                    {localidad}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={limpiarFiltros}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Listado de tutores
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Información de los responsables registrados.
                            </p>
                        </div>

                        <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
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
                                    <th className="px-6 py-4">
                                        <button
                                            type="button"
                                            onClick={() => cambiarOrden('dni')}
                                            className="inline-flex items-center gap-2 transition hover:text-blue-600"
                                        >
                                            DNI
                                            {iconoOrden('dni')}
                                        </button>
                                    </th>

                                    <th className="px-6 py-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                cambiarOrden('nombre')
                                            }
                                            className="inline-flex items-center gap-2 transition hover:text-blue-600"
                                        >
                                            Tutor
                                            {iconoOrden('nombre')}
                                        </button>
                                    </th>

                                    <th className="px-6 py-4">Contacto</th>
                                    <th className="px-6 py-4">Localidad</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-center">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {tutoresPaginados.length > 0 ? (
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
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
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
                                                <StatusBadge
                                                    status={
                                                        tutor.estado
                                                            ? 'activo'
                                                            : 'inactivo'
                                                    }
                                                />
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={`/tutores/${tutor.id}`}
                                                        title="Ver tutor"
                                                        className="rounded-lg bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>

                                                    <Link
                                                        href={`/tutores/${tutor.id}/edit`}
                                                        title="Editar tutor"
                                                        className="rounded-lg bg-amber-50 p-2 text-amber-600 transition hover:bg-amber-100"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>

                                                    {tutor.estado && (
                                                        <button
                                                            type="button"
                                                            title="Deshabilitar tutor"
                                                            onClick={() =>
                                                                deshabilitarTutor(
                                                                    tutor,
                                                                )
                                                            }
                                                            className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                                                        >
                                                            <UserX className="h-4 w-4" />
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
                                            className="px-6 py-14 text-center"
                                        >
                                            <div className="mx-auto flex max-w-sm flex-col items-center">
                                                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                    <Users className="h-7 w-7" />
                                                </div>

                                                <p className="font-semibold text-slate-700">
                                                    No se encontraron tutores
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Probá modificar la búsqueda
                                                    o los filtros seleccionados.
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
                                Mostrando{' '}
                                {(paginaActual - 1) * POR_PAGINA + 1} a{' '}
                                {Math.min(
                                    paginaActual * POR_PAGINA,
                                    tutoresFiltrados.length,
                                )}{' '}
                                de {tutoresFiltrados.length} tutores
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