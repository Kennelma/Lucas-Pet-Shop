import React, { useState, useEffect } from 'react';
import { obtenerQR, verificarEstado } from '../../AXIOS.SERVICES/whatsapp-axios';

const ConexionWhatsApp = () => {
    const [qr, setQr] = useState(null);
    const [conectado, setConectado] = useState(false);
    const [cargando, setCargando] = useState(true);

    const cargarQR = async () => {
        setCargando(true);
        const response = await obtenerQR();

        if (response.success) {
            if (response.conectado) {
                setConectado(true);
                setQr(null);
            } else {
                setQr(response.qr);
                setConectado(false);
            }
        }
        setCargando(false);
    };

    const verificarConexion = async () => {
        const response = await verificarEstado();
        if (response.conectado) {
            setConectado(true);
            setQr(null);
        }
    };

    useEffect(() => {
        cargarQR();

        // Verificar estado cada 3 segundos
        const interval = setInterval(() => {
            verificarConexion();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Conexión de WhatsApp
                </h1>

                {cargando ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando...</p>
                    </div>
                ) : conectado ? (
                    <div className="text-center py-12">
                        <div className="mb-4">
                            <svg className="w-16 h-16 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-green-600 mb-2">
                            ✅ WhatsApp Conectado
                        </h2>
                        <p className="text-gray-600">
                            El sistema está listo para enviar recordatorios
                        </p>
                    </div>
                ) : qr ? (
                    <div className="text-center">
                        <p className="text-gray-700 mb-4">
                            Escanea este código QR con WhatsApp
                        </p>
                        <div className="bg-white p-4 rounded-lg inline-block border-2 border-gray-200">
                            <img src={qr} alt="QR Code" className="w-64 h-64" />
                        </div>
                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-gray-700 font-semibold mb-2">
                                📱 Pasos para conectar:
                            </p>
                            <ol className="text-left text-sm text-gray-600 space-y-1">
                                <li>1. Abre WhatsApp en tu teléfono</li>
                                <li>2. Ve a Configuración → Dispositivos vinculados</li>
                                <li>3. Toca en "Vincular un dispositivo"</li>
                                <li>4. Escanea este código QR</li>
                            </ol>
                        </div>
                        <button
                            onClick={cargarQR}
                            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            🔄 Recargar QR
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-600 mb-4">
                            QR no disponible
                        </p>
                        <button
                            onClick={cargarQR}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Intentar de nuevo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConexionWhatsApp;