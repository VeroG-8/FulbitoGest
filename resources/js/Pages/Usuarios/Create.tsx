import { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    UserPlus,
    Users,
    GraduationCap,
    Mail,
    Lock,
    User,
} from 'lucide-react';

import PageHeader from '@/Components/Shared/PageHeader';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

interface Persona {
    id: number;
    nombre: string;
    apellido: string;
    email: string | null;
}

interface Props {
    tutores: Persona[];
    profesores: Persona[];
}

export default function Create({ tutores, profesores }: Props) {
    const [rol, setRol] = useState<'tutor' | 'profesor'>('tutor');
    const [personaId, setPersonaId] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        rol: 'tutor',
        tutor_id: '',
        profesor_id: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const personas = rol === 'tutor' ? tutores : profesores;

    const personaSeleccionada = personas.find(
        (persona) => persona.id.toString() === personaId
    );

    useEffect(() => {
        setPersonaId('');
        setData({
            ...data,
            rol,
            tutor_id: '',
            profesor_id: '',
            email: '',
        });
    }, [rol]);

    useEffect(() => {
        setData((previous) => ({
            ...previous,
            tutor_id: rol === 'tutor' ? personaId : '',
            profesor_id: rol === 'profesor' ? personaId : '',
            email: personaSeleccionada?.email ?? '',
        }));
    }, [personaId, personaSeleccionada, rol]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(route('usuarios.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <Head title="Crear cuenta de usuario" />

            <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <PageHeader
                        title="Crear cuenta de acceso"
                        description="Registrá las credenciales de acceso de un tutor o profesor."
                        icon={<UserPlus size={28} />}
                        actions={
                            <Link
                                href={route('usuarios.index')}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                <ArrowLeft size={17} />
                                Volver
                            </Link>
                        }
                    />

                    <form onSubmit={handleSubmit}>
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div className="mb-6">
                                <h2 className="text-lg font-bold text-slate-900">
                                    Datos de la cuenta
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Seleccioná la persona a la que estará
                                    vinculada la cuenta.
                                </p>
                            </div>

                            {/* Tipo de usuario */}
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Tipo de cuenta
                                </label>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() => setRol('tutor')}
                                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                                            rol === 'tutor'
                                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                                                : 'border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Users
                                            size={24}
                                            className={
                                                rol === 'tutor'
                                                    ? 'text-blue-600'
                                                    : 'text-slate-400'
                                            }
                                        />
                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                Tutor
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Cuenta para responsables.
                                            </p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setRol('profesor')}
                                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                                            rol === 'profesor'
                                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                                                : 'border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <GraduationCap
                                            size={24}
                                            className={
                                                rol === 'profesor'
                                                    ? 'text-blue-600'
                                                    : 'text-slate-400'
                                            }
                                        />
                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                Profesor
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Cuenta para entrenadores.
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Selección de persona */}
                            <div className="mb-6">
                                <label
                                    htmlFor="persona"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Seleccionar {rol}
                                </label>

                                <select
                                    id="persona"
                                    value={personaId}
                                    required
                                    onChange={(event) =>
                                        setPersonaId(event.target.value)
                                    }
                                    className="w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">
                                        Seleccioná una persona...
                                    </option>

                                    {personas.map((persona) => (
                                        <option
                                            key={persona.id}
                                            value={persona.id}
                                        >
                                            {persona.apellido}, {persona.nombre}
                                        </option>
                                    ))}
                                </select>

                                {errors.tutor_id && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.tutor_id}
                                    </p>
                                )}

                                {errors.profesor_id && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.profesor_id}
                                    </p>
                                )}

                                {personas.length === 0 && (
                                    <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                        <p className="text-sm font-medium text-amber-800">
                                            No hay {rol === 'tutor' ? 'tutores' : 'profesores'} disponibles.
                                        </p>
                                        <p className="mt-1 text-xs text-amber-700">
                                            Para crear una cuenta, primero debe existir una persona
                                            activa y sin una cuenta de acceso asociada.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Datos personales */}
                            <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
                                <h3 className="mb-4 text-sm font-bold text-slate-800">
                                    Información de la persona
                                </h3>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-slate-600">
                                            Nombre completo
                                        </label>

                                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3">
                                            <User
                                                size={18}
                                                className="text-slate-400"
                                            />
                                            <span className="text-sm text-slate-700">
                                                {personaSeleccionada
                                                    ? `${personaSeleccionada.nombre} ${personaSeleccionada.apellido}`
                                                    : 'Se completará al seleccionar'}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="mb-2 block text-sm font-medium text-slate-600"
                                        >
                                            Correo electrónico
                                        </label>

                                        <div className="relative">
                                            <Mail
                                                size={18}
                                                className="absolute left-3 top-3 text-slate-400"
                                            />

                                            <input
                                                id="email"
                                                type="email"
                                                required={!personaSeleccionada?.email}
                                                value={data.email}
                                                onChange={(event) =>
                                                    setData(
                                                        'email',
                                                        event.target.value
                                                    )
                                                }
                                                disabled={
                                                    !!personaSeleccionada?.email
                                                }
                                                placeholder="correo@ejemplo.com"
                                                className="w-full rounded-xl border-slate-300 pl-10 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                                            />
                                        </div>

                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.email}
                                            </p>
                                        )}

                                        <p className="mt-1 text-xs text-slate-500">
                                            {personaSeleccionada?.email
                                                ? 'Correo obtenido del registro personal.'
                                                : 'Ingresá un correo para la cuenta de acceso.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Contraseña */}
                            <div className="mb-6">
                                <h3 className="mb-4 text-sm font-bold text-slate-800">
                                    Credenciales de acceso
                                </h3>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="password"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Contraseña
                                        </label>

                                        <div className="relative">
                                            <Lock
                                                size={18}
                                                className="absolute left-3 top-3 text-slate-400"
                                            />
                                            <input
                                                id="password"
                                                type="password"
                                                required
                                                value={data.password}
                                                onChange={(event) =>
                                                    setData(
                                                        'password',
                                                        event.target.value
                                                    )
                                                }
                                                autoComplete="new-password"
                                                className="w-full rounded-xl border-slate-300 pl-10 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>

                                        {errors.password && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="password_confirmation"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Confirmar contraseña
                                        </label>

                                        <div className="relative">
                                            <Lock
                                                size={18}
                                                className="absolute left-3 top-3 text-slate-400"
                                            />
                                            <input
                                                id="password_confirmation"
                                                type="password"
                                                required
                                                value={
                                                    data.password_confirmation
                                                }
                                                onChange={(event) =>
                                                    setData(
                                                        'password_confirmation',
                                                        event.target.value
                                                    )
                                                }
                                                autoComplete="new-password"
                                                className="w-full rounded-xl border-slate-300 pl-10 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                                <Link
                                    href={route('usuarios.index')}
                                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Cancelar
                                </Link>

                                <PrimaryButton
                                    type="submit"
                                    disabled={processing || !personaId}
                                >
                                    {processing
                                        ? 'Creando cuenta...'
                                        : 'Crear cuenta'}
                                </PrimaryButton>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}