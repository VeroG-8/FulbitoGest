import { Head, Link } from '@inertiajs/react';
import QRCode from 'react-qr-code';

interface Jugador {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
}

interface Carnet {
    id: number;
    jugador_id: number;
    codigo: string;
    qr_token: string;
    fecha_emision: string;
    fecha_vencimiento: string;
    estado: 'activo' | 'vencido' | 'anulado';
    jugador: Jugador;
}

interface Props {
    carnet: Carnet;
}

export default function Show({ carnet }: Props) {

    const urlConsulta = `http://192.168.1.7:8001/carnet/consulta/${carnet.qr_token}`;

    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-AR');
    };

    return (
        <>
            <Head title="Detalle del carnet" />

            <div className="min-h-screen bg-gray-100 p-6">
                <div className="mx-auto max-w-3xl">

                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-800">
                            Detalle del carnet
                        </h1>

                        <Link
                            href="/carnets"
                            className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                        >
                            Volver
                        </Link>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow">

                        <div className="mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                {carnet.jugador.apellido},{' '}
                                {carnet.jugador.nombre}
                            </h2>

                            <p className="text-gray-600">
                                DNI: {carnet.jugador.dni}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Código
                                </p>

                                <p className="text-lg font-semibold text-gray-800">
                                    {carnet.codigo}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Estado
                                </p>

                                <span
                                    className={`inline-block rounded px-2 py-1 text-sm ${
                                        carnet.estado === 'activo'
                                            ? 'bg-green-100 text-green-700'
                                            : carnet.estado === 'vencido'
                                              ? 'bg-yellow-100 text-yellow-700'
                                              : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    {carnet.estado}
                                </span>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Fecha de emisión
                                </p>

                                <p className="text-gray-800">
                                    {formatearFecha(carnet.fecha_emision)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Fecha de vencimiento
                                </p>

                                <p className="text-gray-800">
                                    {formatearFecha(
                                        carnet.fecha_vencimiento
                                    )}
                                </p>
                            </div>

                        </div>

                        <div className="mt-6 border-t pt-4">
                            <p className="text-sm font-medium text-gray-500">
                                Token QR
                            </p>

                            <p className="mt-1 break-all rounded bg-gray-100 p-3 font-mono text-sm text-gray-700">
                                {carnet.qr_token}
                            </p>
                            <div className="mt-6 flex flex-col items-center">
                                <p className="mb-3 text-sm font-medium text-gray-600">
                                    Código QR de consulta
                                </p>

                                <div className="rounded-xl border bg-white p-4 shadow-sm">
                                    <QRCode value={urlConsulta} size={180} />
                                </div>

                                <p className="mt-3 text-xs text-gray-400">
                                    Escaneá el código para consultar el carnet.
                                </p>
                                <p className="mt-2 text-xs text-gray-400 break-all">
                                    {urlConsulta}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <Link
                                href={`/carnets/${carnet.id}/edit`}
                                className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                            >
                                Editar
                            </Link>

                            <Link
                                href="/carnets"
                                className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                            >
                                Volver
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}