import { Head } from '@inertiajs/react';

interface Jugador {
    id: number;
    nombre: string;
    apellido: string;
    categoria: Categoria;
}
interface Categoria {
    id: number;
    nombre: string;
    anio: number;
}

interface Carnet {
    codigo: string;
    fecha_emision: string;
    fecha_vencimiento: string;
    estado: 'activo' | 'vencido' | 'anulado';
    jugador: Jugador;
}

interface Props {
    carnet: Carnet;
}

export default function Consulta({ carnet }: Props) {
    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-AR');
    };

    const estadoTexto = {
        activo: 'Carnet activo',
        vencido: 'Carnet vencido',
        anulado: 'Carnet anulado',
    };

    return (
        <>
            <Head title="Consulta de carnet" />

            <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">

                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-blue-700">
                            FulbitoGest
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Consulta de carnet
                        </p>
                    </div>

                    <div className="mb-6 rounded-xl bg-gray-50 p-5">
                        <h2 className="text-xl font-bold text-gray-800">
                            {carnet.jugador.apellido},{' '}
                            {carnet.jugador.nombre}
                        </h2>

                        <p className="mt-2 text-gray-600">
                            Código: {carnet.codigo}
                        </p>
                        <p className="mt-1 text-gray-600">
                            Categoría: {carnet.jugador.categoria.nombre}
                        </p>
                    </div>

                    <div
                        className={`mb-6 rounded-lg px-4 py-3 font-semibold ${
                            carnet.estado === 'activo'
                                ? 'bg-green-100 text-green-700'
                                : carnet.estado === 'vencido'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {estadoTexto[carnet.estado]}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div>
                            <p className="text-sm text-gray-500">
                                Fecha de emisión
                            </p>

                            <p className="font-medium text-gray-800">
                                {formatearFecha(carnet.fecha_emision)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Fecha de vencimiento
                            </p>

                            <p className="font-medium text-gray-800">
                                {formatearFecha(
                                    carnet.fecha_vencimiento
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 border-t pt-4">
                        <p className="text-sm text-gray-500">
                            Documento de consulta digital
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                            Información proporcionada por FulbitoGest.
                        </p>
                    </div>

                </div>
            </div>
        </>
    );
}