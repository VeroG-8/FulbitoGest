import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import PageHeader from '@/Components/Shared/PageHeader';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { UserRound, ShieldCheck } from 'lucide-react';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <>
            <Head title="Mi perfil" />

            <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

                <PageHeader
                    title="Mi perfil"
                    description="Administrá tu información personal y la seguridad de tu cuenta."
                    icon={<UserRound className="h-6 w-6" />}
                />

                {/* Información personal */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                            <UserRound className="h-5 w-5" />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                Información personal
                            </h2>
                            <p className="text-sm text-slate-500">
                                Actualizá tus datos de usuario.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-2xl"
                        />
                    </div>
                </section>

                {/* Seguridad */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-6 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                            <ShieldCheck className="h-5 w-5" />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold text-slate-900">
                                Seguridad de la cuenta
                            </h2>
                            <p className="text-sm text-slate-500">
                                Modificá tu contraseña para proteger tu cuenta.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        <UpdatePasswordForm className="max-w-2xl" />
                    </div>
                </section>

            </div>
        </>
    );
}