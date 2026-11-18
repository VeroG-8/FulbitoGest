import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { UserRound, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name ?? '',
            email: user.email ?? '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-6">

                {/* Nombre */}
                <div>
                    <InputLabel
                        htmlFor="name"
                        value="Nombre completo"
                        className="font-medium text-slate-700"
                    />

                    <div className="relative mt-2">
                        <UserRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                        <TextInput
                            id="name"
                            name="name"
                            className="block w-full pl-10"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            maxLength={255}
                            autoComplete="name"
                            placeholder="Ingresá tu nombre completo"
                        />
                    </div>

                    <InputError className="mt-2" message={errors.name} />

                    <p className="mt-1 text-xs text-slate-500">
                        Este dato identifica tu cuenta dentro del sistema.
                    </p>
                </div>

                {/* Correo electrónico */}
                <div>
                    <InputLabel
                        htmlFor="email"
                        value="Correo electrónico"
                        className="font-medium text-slate-700"
                    />

                    <div className="relative mt-2">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                        <TextInput
                            id="email"
                            name="email"
                            type="email"
                            className="block w-full pl-10"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            maxLength={255}
                            autoComplete="email"
                            autoCapitalize="none"
                            placeholder="ejemplo@correo.com"
                        />
                    </div>

                    <InputError className="mt-2" message={errors.email} />

                    <p className="mt-1 text-xs text-slate-500">
                        Si modificás tu correo, tendrás que verificar la nueva dirección.
                    </p>
                </div>

                {/* Verificación de correo */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                            <div>
                                <p className="text-sm font-semibold text-amber-900">
                                    Correo electrónico sin verificar
                                </p>

                                <p className="mt-1 text-sm text-amber-800">
                                    Tu dirección de correo todavía no está verificada.
                                    Podés solicitar un nuevo enlace de verificación.
                                </p>

                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="mt-2 text-sm font-semibold text-amber-900 underline decoration-amber-400 underline-offset-2 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                                >
                                    Reenviar correo de verificación
                                </Link>

                                {status === 'verification-link-sent' && (
                                    <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-700">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Se envió un nuevo enlace de verificación.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Acciones */}
                <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-5">
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Guardando...' : 'Guardar cambios'}
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
                            Cambios guardados correctamente.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}