import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import {
    LockKeyhole,
    Eye,
    EyeOff,
    CheckCircle2,
    ShieldCheck,
} from 'lucide-react';

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const [mostrarActual, setMostrarActual] = useState(false);
    const [mostrarNueva, setMostrarNueva] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setMostrarActual(false);
                setMostrarNueva(false);
                setMostrarConfirmacion(false);
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <form onSubmit={updatePassword} className="space-y-6">

                {/* Contraseña actual */}
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Contraseña actual"
                        className="font-medium text-slate-700"
                    />

                    <div className="relative mt-2">
                        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                        <TextInput
                            id="current_password"
                            name="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            type={mostrarActual ? 'text' : 'password'}
                            className="block w-full pr-11 pl-10"
                            autoComplete="current-password"
                            required
                            placeholder="Ingresá tu contraseña actual"
                        />

                        <button
                            type="button"
                            onClick={() => setMostrarActual(!mostrarActual)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                            aria-label={
                                mostrarActual
                                    ? 'Ocultar contraseña actual'
                                    : 'Mostrar contraseña actual'
                            }
                        >
                            {mostrarActual ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    <InputError
                        message={errors.current_password}
                        className="mt-2"
                    />
                </div>

                {/* Nueva contraseña */}
                <div>
                    <InputLabel
                        htmlFor="password"
                        value="Nueva contraseña"
                        className="font-medium text-slate-700"
                    />

                    <div className="relative mt-2">
                        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                        <TextInput
                            id="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type={mostrarNueva ? 'text' : 'password'}
                            className="block w-full pr-11 pl-10"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            placeholder="Ingresá tu nueva contraseña"
                        />
                        <p className="mt-1 text-xs text-slate-500">
                            La contraseña debe tener al menos 8 caracteres.
                        </p>

                        <button
                            type="button"
                            onClick={() => setMostrarNueva(!mostrarNueva)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                            aria-label={
                                mostrarNueva
                                    ? 'Ocultar nueva contraseña'
                                    : 'Mostrar nueva contraseña'
                            }
                        >
                            {mostrarNueva ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-2" />

                    <p className="mt-1 text-xs text-slate-500">
                        Utilizá una contraseña segura y difícil de adivinar.
                    </p>
                </div>

                {/* Confirmación */}
                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmar nueva contraseña"
                        className="font-medium text-slate-700"
                    />

                    <div className="relative mt-2">
                        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                        <TextInput
                            id="password_confirmation"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            type={mostrarConfirmacion ? 'text' : 'password'}
                            className="block w-full pr-11 pl-10"
                            autoComplete="new-password"
                            required
                            placeholder="Repetí la nueva contraseña"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                setMostrarConfirmacion(!mostrarConfirmacion)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                            aria-label={
                                mostrarConfirmacion
                                    ? 'Ocultar confirmación'
                                    : 'Mostrar confirmación'
                            }
                        >
                            {mostrarConfirmacion ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                {/* Información de seguridad */}
                <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                    <p className="text-sm text-blue-800">
                        Para cambiar tu contraseña, primero debés ingresar la
                        contraseña actual. La nueva contraseña deberá cumplir
                        los requisitos de seguridad configurados en el sistema.
                    </p>
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-5">
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Actualizando...' : 'Actualizar contraseña'}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition ease-in duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            Contraseña actualizada correctamente.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}