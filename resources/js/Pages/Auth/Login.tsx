import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Iniciar sesión | FulbitoGest" />


            {status && (
                <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>

                {/* Correo electrónico */}
                <div>
                    <InputLabel
                        htmlFor="email"
                        value="Correo electrónico"
                        className="font-semibold text-slate-700"
                    />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-2 block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm transition focus:border-emerald-500 focus:bg-white focus:ring-emerald-500"
                        autoComplete="username"
                        isFocused={true}
                        placeholder="ejemplo@correo.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Contraseña */}
                <div className="mt-5">
                    <InputLabel
                        htmlFor="password"
                        value="Contraseña"
                        className="font-semibold text-slate-700"
                    />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-2 block w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm transition focus:border-emerald-500 focus:bg-white focus:ring-emerald-500"
                        autoComplete="current-password"
                        placeholder="Ingresá tu contraseña"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Recordar sesión y recuperar contraseña */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">

                    <label className="flex cursor-pointer items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                            className="rounded border-slate-300 text-emerald-600 shadow-sm focus:ring-emerald-500"
                        />

                        <span className="ms-2 text-sm text-slate-600">
                            Recordarme
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-emerald-700 transition hover:text-emerald-900 hover:underline"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    )}
                </div>

                {/* Botón ingresar */}
                <button
                    type="submit"
                    disabled={processing}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {processing ? 'Ingresando...' : 'Ingresar al sistema'}

                    {!processing && (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-4 w-4"
                        >
                            <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                    )}
                </button>

            </form>

            <div className="mt-7 border-t border-slate-100 pt-5 text-center">
                <p className="text-xs leading-relaxed text-slate-400">
                    Sistema de administración y seguimiento deportivo.
                </p>
            </div>

        </GuestLayout>
    );
}