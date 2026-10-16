import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

interface Club {
    id: number;
    nombre: string;
    localidad: string | null;
    direccion: string | null;
    telefono: string | null;
    email: string | null;
    estado: boolean;
}

interface ClubForm {
    nombre: string;
    localidad: string;
    direccion: string;
    telefono: string;
    email: string;
}

interface Props {
    club: Club;
}

export default function Edit({ club }: Props) {
    const { data, setData, put, processing, errors } = useForm<ClubForm>({
        nombre: club.nombre ?? '',
        localidad: club.localidad ?? '',
        direccion: club.direccion ?? '',
        telefono: club.telefono ?? '',
        email: club.email ?? '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(`/clubes/${club.id}`);
    };

    const campos = [
        {
            nombre: 'nombre',
            etiqueta: 'Nombre del club',
            placeholder: 'Ej.: Club Deportivo Fulbito',
            requerido: true,
        },
        {
            nombre: 'localidad',
            etiqueta: 'Localidad',
            placeholder: 'Ej.: Salta Capital',
            requerido: false,
        },
        {
            nombre: 'direccion',
            etiqueta: 'Dirección',
            placeholder: 'Calle y número',
            requerido: false,
        },
        {
            nombre: 'telefono',
            etiqueta: 'Teléfono',
            placeholder: 'Ej.: 3871234567',
            requerido: false,
        },
        {
            nombre: 'email',
            etiqueta: 'Correo electrónico',
            placeholder: 'club@ejemplo.com',
            requerido: false,
        },
    ] as const;

    return (
        <>
            <Head title={`Editar ${club.nombre}`} />

            <div className="min-h-screen bg-slate-50 p-6 md:p-10">
                <div className="mx-auto max-w-3xl">
                    <Link
                        href={`/clubes/${club.id}`}
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
                    >
                        <ArrowLeft size={17} />
                        Volver al club
                    </Link>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-6 md:px-8">
                            <h1 className="text-2xl font-bold text-slate-800">
                                Editar club
                            </h1>

                            <p className="mt-2 text-sm text-slate-500">
                                Modificá los datos de {club.nombre}.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6 p-6 md:p-8"
                        >
                            {campos.map((campo) => (
                                <div key={campo.nombre}>
                                    <label
                                        htmlFor={campo.nombre}
                                        className="mb-2 block text-sm font-medium text-slate-700"
                                    >
                                        {campo.etiqueta}
                                        {campo.requerido && (
                                            <span className="ml-1 text-red-500">*</span>
                                        )}
                                    </label>

                                    <input
                                        id={campo.nombre}
                                        type={
                                            campo.nombre === 'email'
                                                ? 'email'
                                                : 'text'
                                        }
                                        value={data[campo.nombre]}
                                        onChange={(e) =>
                                            setData(campo.nombre, e.target.value)
                                        }
                                        placeholder={campo.placeholder}
                                        required={campo.requerido}
                                        maxLength={255}
                                        className={`w-full rounded-lg border px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                                            errors[campo.nombre]
                                                ? 'border-red-400'
                                                : 'border-slate-300'
                                        }`}
                                    />

                                    {errors[campo.nombre] && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {errors[campo.nombre]}
                                        </p>
                                    )}
                                </div>
                            ))}

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                                <Link
                                    href={`/clubes/${club.id}`}
                                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Cancelar
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Save size={17} />
                                    {processing
                                        ? 'Guardando...'
                                        : 'Guardar cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}