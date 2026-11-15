import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import {
    UserRound,
    ArrowLeft,
    IdCard,
    MapPin,
    Save,
    Users,
    UserPlus,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';

interface Jugador {
    id: number;
    dni: string;
    nombre: string;
    apellido: string;
    tutores_count: number;
}

interface Props {
    jugadores: Jugador[];
}

const inputStyles =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

export default function Create({ jugadores }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        dni: '',
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        localidad: '',
        jugador_id: '',
        parentesco: '',
    });

    const jugadorSeleccionado = jugadores.find(
        (jugador) => String(jugador.id) === data.jugador_id
    );

    const submit = (e: FormEvent) => {
        e.preventDefault();

        if (data.jugador_id && !data.parentesco.trim()) {
            return;
        }

        post('/tutores', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Nuevo tutor" />

            <div className="space-y-6">
                <PageHeader
                    title="Nuevo tutor"
                    description="Registrá los datos personales y de contacto de un nuevo tutor."
                    icon={<UserPlus size={28} />}
                    actions={
                        <Link
                            href="/tutores"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                        >
                            <ArrowLeft size={17} />
                            Volver
                        </Link>
                    }
                />

                <form onSubmit={submit} className="space-y-6">
                    {/* Datos personales */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <IdCard size={21} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-800">
                                    Datos personales
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Información de identificación del tutor.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                            <div>
                                <label htmlFor="dni" className="mb-2 block text-sm font-semibold text-slate-700">
                                    DNI <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="dni"
                                    required
                                    value={data.dni}
                                    onChange={(e) => setData('dni', e.target.value)}
                                    className={inputStyles}
                                    placeholder="Ingresar DNI"
                                />
                                {errors.dni && <p className="mt-1.5 text-xs text-red-600">{errors.dni}</p>}
                            </div>

                            <div>
                                <label htmlFor="nombre" className="mb-2 block text-sm font-semibold text-slate-700">
                                    Nombre <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="nombre"
                                    required
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    className={inputStyles}
                                    placeholder="Nombre"
                                />
                                {errors.nombre && <p className="mt-1.5 text-xs text-red-600">{errors.nombre}</p>}
                            </div>

                            <div>
                                <label htmlFor="apellido" className="mb-2 block text-sm font-semibold text-slate-700">
                                    Apellido <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="apellido"
                                    required
                                    value={data.apellido}
                                    onChange={(e) => setData('apellido', e.target.value)}
                                    className={inputStyles}
                                    placeholder="Apellido"
                                />
                                {errors.apellido && <p className="mt-1.5 text-xs text-red-600">{errors.apellido}</p>}
                            </div>
                        </div>
                    </section>

                    {/* Datos de contacto */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <MapPin size={21} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-800">
                                    Datos de contacto
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Información de contacto y domicilio.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                            <div>
                                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                                    Correo electrónico
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={inputStyles}
                                    placeholder="correo@ejemplo.com"
                                />
                                {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="telefono" className="mb-2 block text-sm font-semibold text-slate-700">
                                    Teléfono
                                </label>
                                <input
                                    id="telefono"
                                    type="tel"
                                    value={data.telefono}
                                    onChange={(e) => setData('telefono', e.target.value)}
                                    className={inputStyles}
                                    placeholder="Número de teléfono"
                                />
                                {errors.telefono && <p className="mt-1.5 text-xs text-red-600">{errors.telefono}</p>}
                            </div>

                            <div>
                                <label htmlFor="localidad" className="mb-2 block text-sm font-semibold text-slate-700">
                                    Localidad
                                </label>
                                <input
                                    id="localidad"
                                    value={data.localidad}
                                    onChange={(e) => setData('localidad', e.target.value)}
                                    className={inputStyles}
                                    placeholder="Localidad"
                                />
                                {errors.localidad && <p className="mt-1.5 text-xs text-red-600">{errors.localidad}</p>}
                            </div>

                            <div>
                                <label htmlFor="direccion" className="mb-2 block text-sm font-semibold text-slate-700">
                                    Dirección
                                </label>
                                <input
                                    id="direccion"
                                    value={data.direccion}
                                    onChange={(e) => setData('direccion', e.target.value)}
                                    className={inputStyles}
                                    placeholder="Calle, número y barrio"
                                />
                                {errors.direccion && <p className="mt-1.5 text-xs text-red-600">{errors.direccion}</p>}
                            </div>
                        </div>
                    </section>

                    {/* Asociación opcional */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                <Users size={21} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-800">
                                    Asociación con un jugador
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Esta sección es opcional. Podés asociar el tutor ahora o hacerlo más adelante.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-5 p-6">
                            <div>
                                <label htmlFor="jugador_id" className="mb-2 block text-sm font-semibold text-slate-700">
                                    Jugador
                                </label>

                                <select
                                    id="jugador_id"
                                    value={data.jugador_id}
                                    onChange={(e) => {
                                        setData((actual) => ({
                                            ...actual,
                                            jugador_id: e.target.value,
                                            parentesco: '',
                                        }));
                                    }}
                                    className={inputStyles}
                                >
                                    <option value="">Registrar sin asociar a un jugador</option>

                                    {jugadores.map((jugador) => (
                                        <option
                                            key={jugador.id}
                                            value={jugador.id}
                                            disabled={jugador.tutores_count >= 2}
                                        >
                                            {jugador.apellido}, {jugador.nombre} — DNI: {jugador.dni}
                                            {jugador.tutores_count >= 2
                                                ? ' (máximo de tutores alcanzado)'
                                                : ''}
                                        </option>
                                    ))}
                                </select>

                                {errors.jugador_id && (
                                    <p className="mt-1.5 text-xs text-red-600">{errors.jugador_id}</p>
                                )}
                            </div>

                            {data.jugador_id && (
                                <>
                                    <div>
                                        <label htmlFor="parentesco" className="mb-2 block text-sm font-semibold text-slate-700">
                                            Parentesco <span className="text-red-500">*</span>
                                        </label>

                                        <input
                                            id="parentesco"
                                            required
                                            maxLength={50}
                                            value={data.parentesco}
                                            onChange={(e) => setData('parentesco', e.target.value)}
                                            className={inputStyles}
                                            placeholder="Ej. Madre, padre, abuelo, tutor legal..."
                                        />

                                        {errors.parentesco && (
                                            <p className="mt-1.5 text-xs text-red-600">{errors.parentesco}</p>
                                        )}
                                    </div>

                                    <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                                        {jugadorSeleccionado?.tutores_count === 0
                                            ? 'Este será el primer tutor asociado y se establecerá automáticamente como titular.'
                                            : 'Este tutor se asociará como suplente. Podrás cambiar la titularidad desde la ficha del jugador.'}
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Botones */}
                    <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                        <Link
                            href="/tutores"
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save size={18} />
                            {processing ? 'Guardando...' : 'Guardar tutor'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}