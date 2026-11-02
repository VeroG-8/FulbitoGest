import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col lg:flex-row">

            {/* PANEL IZQUIERDO: IDENTIDAD INSTITUCIONAL */}
            <section className="relative flex min-h-[420px] w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-6 py-12 text-center lg:min-h-screen lg:w-[42%] lg:px-10">

                {/* Luces decorativas */}
                <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-red-500/10 blur-3xl" />

                {/* Círculos decorativos */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]" />

                <div className="relative z-10 max-w-md">

                    {/* Escudo */}
                    <img
                        src="/images/escudo-changuitos.jpeg"
                        alt="Escudo de Changuitos V.S.A."
                        className="mx-auto mb-7 h-40 w-40 rounded-full object-contain shadow-2xl"
                    />

                    {/* Nombre de la institución */}
                    <h1 className="text-3xl font-extrabold tracking-wide text-white sm:text-4xl">
                        CHANGUITOS V.S.A
                    </h1>

                    <p className="mt-3 text-sm font-medium leading-relaxed text-slate-300 sm:text-base">
                        Escuela Formativa de Fútbol Infantil
                    </p>

                    {/* Separador institucional */}
                    <div className="mx-auto mt-6 flex h-1 w-28 overflow-hidden rounded-full">
                        <div className="w-1/3 bg-red-500" />
                        <div className="w-1/3 bg-white" />
                        <div className="w-1/3 bg-blue-500" />
                    </div>

                    {/* Presentación del sistema */}
                    <div className="mt-8">
                        <p className="text-2xl font-bold tracking-wide text-emerald-400">
                            FulbitoGest
                        </p>

                        <p className="mt-2 text-xs font-semibold tracking-[0.2em] text-slate-400">
                            SISTEMA DE GESTIÓN DEPORTIVA
                        </p>

                        <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-slate-400">
                            Una herramienta para organizar y acompañar el
                            crecimiento deportivo de nuestros jugadores.
                        </p>
                    </div>
                </div>

                {/* Pie del panel */}
                <p className="relative z-10 mt-10 text-xs text-slate-500">
                    © {new Date().getFullYear()} Changuitos V.S.A.
                </p>
            </section>

            {/* PANEL DERECHO: INICIO DE SESIÓN */}
            <main className="flex min-h-[550px] w-full flex-1 items-center justify-center bg-slate-50 px-5 py-12 sm:px-10 lg:min-h-screen lg:px-16">

                <div className="w-full max-w-md">

                    {/* Encabezado del formulario */}
                    <div className="mb-8">
                        <div className="mb-3 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            ACCESO AL SISTEMA
                        </div>

                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                            ¡Bienvenido!
                        </h2>

                        <p className="mt-2 text-sm leading-relaxed text-slate-500">
                            Ingresá tus credenciales para acceder a FulbitoGest.
                        </p>
                    </div>

                    {/* Formulario */}
                    <div className="rounded-2xl border border-slate-200 bg-white px-7 py-9 shadow-xl shadow-slate-200/50 sm:px-9">
                        {children}
                    </div>

                    {/* Pie del formulario */}
                    <p className="mt-7 text-center text-xs text-slate-400">
                        Plataforma de administración y seguimiento deportivo.
                    </p>
                </div>
            </main>
        </div>
    );
}