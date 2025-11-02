import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { FaWhatsapp, FaQrcode, FaPhone, FaCheckCircle, FaSpinner, FaRedo, FaSignOutAlt, FaTimes, FaSyncAlt, FaKey, FaExclamationTriangle } from 'react-icons/fa';
import { MdDevices, MdSmartphone } from 'react-icons/md';
import { obtenerQR, verificarEstado, solicitarCodigoEmparejamiento } from '../../AXIOS.SERVICES/whatsapp-axios';

const ConexionWhatsApp = ({ isOpen, onClose, onCerrarSesion }) => {
    const [qr, setQr] = useState(null);
    const [conectado, setConectado] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [metodoConexion, setMetodoConexion] = useState('qr');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pairingCode, setPairingCode] = useState('');

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

    const solicitarCodigo = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            alert('Ingresa un número de teléfono válido');
            return;
        }

        setCargando(true);
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const response = await solicitarCodigoEmparejamiento(cleanPhone);

        if (response.success) {
            setPairingCode(response.code);
        } else {
            alert('Error al solicitar código: ' + response.mensaje);
        }
        setCargando(false);
    };

    useEffect(() => {
        cargarQR();

        // Verificar estado cada 3 segundos
        const interval = setInterval(() => {
            verificarConexion();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const footer = (
        <div className="flex justify-center gap-2">
            {conectado ? (
                <Button
                    label="Cerrar Sesión"
                    icon={<FaSignOutAlt className="mr-2" />}
                    className="p-button-danger p-button-sm"
                    onClick={onCerrarSesion}
                />
            ) : (
                <Button
                    label="Cerrar"
                    className="p-button-secondary p-button-sm"
                    onClick={onClose}
                />
            )}
        </div>
    );

    return (
        <Dialog
            header={
                <div className="w-full text-center text-lg font-bold flex items-center justify-center gap-2">
                    <FaWhatsapp className="text-green-500" />
                    CONEXIÓN WHATSAPP
                </div>
            }
            visible={isOpen}
            style={{ width: '50rem', borderRadius: '1.5rem' }}
            modal
            closable={false}
            onHide={onClose}
            footer={footer}
            position="center"
            dismissableMask={false}
            draggable={false}
            resizable={false}
        >
            <div className="flex flex-col gap-4">
                {cargando ? (
                    <div className="text-center py-8">
                        <div className="flex items-center justify-center mb-3">
                            <FaSpinner className="text-2xl text-green-500 animate-spin" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-700 mb-1">Conectando...</h3>
                        <p className="text-xs text-gray-600">Verificando estado de la conexión</p>
                    </div>
                ) : conectado ? (
                    <div className="text-center py-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full mx-auto mb-3">
                            <FaCheckCircle className="text-white text-2xl" />
                        </div>
                        <h2 className="text-lg font-bold text-green-600 mb-2 flex items-center justify-center gap-2">
                            <FaWhatsapp />
                            WhatsApp Conectado
                        </h2>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                            <p className="text-green-800 font-medium mb-1 flex items-center justify-center gap-1 text-sm">
                                <FaCheckCircle className="text-xs" />
                                ¡Conexión exitosa!
                            </p>
                            <p className="text-green-700 text-xs">
                                Sistema listo para enviar recordatorios automáticos
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Selector de método */}
                        <div className="mb-4">
                            <label className="text-xs font-poppins text-gray-700 mb-2 block text-center">MÉTODO DE CONEXIÓN</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setMetodoConexion('qr')}
                                    className={`p-2 rounded-xl font-medium transition-all border text-xs ${
                                        metodoConexion === 'qr'
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                                    }`}
                                >
                                    <FaQrcode className={`text-base mx-auto mb-1 ${metodoConexion === 'qr' ? 'text-white' : 'text-blue-500'}`} />
                                    <div className="font-semibold">Código QR</div>
                                </button>
                                <button
                                    onClick={() => setMetodoConexion('pairing')}
                                    className={`p-2 rounded-xl font-medium transition-all border text-xs ${
                                        metodoConexion === 'pairing'
                                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-500'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                                    }`}
                                >
                                    <FaPhone className={`text-base mx-auto mb-1 ${metodoConexion === 'pairing' ? 'text-white' : 'text-purple-500'}`} />
                                    <div className="font-semibold">Con Número</div>
                                </button>
                            </div>
                        </div>

                        {metodoConexion === 'qr' ? (
                            qr ? (
                                <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {/* QR Code */}
                                        <div className="text-center">
                                            <div className="bg-white p-3 rounded-xl border border-blue-100 mb-3">
                                                <img src={qr} alt="QR Code" className="w-40 h-40 mx-auto" />
                                            </div>
                                            <Button
                                                label="Recargar QR"
                                                icon={<FaSyncAlt className="mr-1" />}
                                                className="p-button-sm p-button-outlined"
                                                onClick={cargarQR}
                                            />
                                        </div>

                                        {/* Instrucciones */}
                                        <div>
                                            <div className="flex items-center mb-3">
                                                <FaWhatsapp className="text-lg text-green-500 mr-2" />
                                                <h4 className="text-sm font-bold text-gray-800">Cómo conectar</h4>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex items-start">
                                                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">1</span>
                                                    <span className="text-gray-700 text-xs">Abre <strong>WhatsApp</strong></span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">2</span>
                                                    <span className="text-gray-700 text-xs"><strong>Dispositivos vinculados</strong></span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">3</span>
                                                    <span className="text-gray-700 text-xs"><strong>Vincular dispositivo</strong></span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">4</span>
                                                    <span className="text-gray-700 text-xs">Escanea el código</span>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-xs text-blue-700 text-center">
                                                    <FaWhatsapp className="inline mr-1" />
                                                    Código se actualiza automáticamente
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                                    <FaQrcode className="text-2xl text-gray-400 mx-auto mb-2" />
                                    <h4 className="text-sm font-bold text-gray-700 mb-1">QR no disponible</h4>
                                    <p className="text-xs text-gray-600 mb-3">Genera un código QR para conectar</p>
                                    <Button
                                        label="Generar QR"
                                        icon={<FaQrcode className="mr-1" />}
                                        className="p-button-sm"
                                        onClick={cargarQR}
                                    />
                                </div>
                            )
                        ) : (
                            <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-100">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Formulario */}
                                    <div>
                                        <div className="text-center mb-3">
                                            <FaPhone className="text-2xl text-purple-500 mx-auto mb-2" />
                                            <h4 className="text-sm font-bold text-gray-800">Conectar con número</h4>
                                        </div>

                                        <div className="mb-3">
                                            <label className="text-xs font-poppins text-gray-700 mb-1 block">NÚMERO DE TELÉFONO</label>
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                placeholder="50412345678"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-center text-sm focus:border-purple-500 focus:outline-none"
                                            />
                                            <p className="text-xs text-gray-500 mt-1 text-center">
                                                <FaExclamationTriangle className="inline mr-1" />
                                                Incluye código de país (sin +)
                                            </p>
                                        </div>

                                        {pairingCode && (
                                            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
                                                <div className="text-center mb-2">
                                                    <FaCheckCircle className="text-lg text-green-500 inline mr-1" />
                                                    <span className="font-bold text-green-700 text-sm">¡Código listo!</span>
                                                </div>
                                                <div className="bg-white rounded-lg p-2 mb-2 border border-green-100">
                                                    <div className="text-xl font-bold text-green-600 tracking-widest font-mono text-center">
                                                        {pairingCode}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-green-700 text-center">
                                                    <FaWhatsapp className="inline mr-1" />
                                                    Ingresa este código en WhatsApp
                                                </p>
                                            </div>
                                        )}

                                        <Button
                                            label={cargando ? "Generando..." : "Solicitar Código"}
                                            icon={cargando ? <FaSpinner className="mr-1 animate-spin" /> : <FaKey className="mr-1" />}
                                            className="p-button-sm w-full"
                                            onClick={solicitarCodigo}
                                            disabled={cargando}
                                        />
                                    </div>

                                    {/* Instrucciones */}
                                    <div>
                                        <div className="flex items-center mb-3">
                                            <FaWhatsapp className="text-lg text-green-500 mr-2" />
                                            <h4 className="text-sm font-bold text-gray-800">Cómo conectar</h4>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex items-start">
                                                <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">1</span>
                                                <span className="text-gray-700 text-xs">Ingresa tu número con <strong>código de país</strong></span>
                                            </div>
                                            <div className="flex items-start">
                                                <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">2</span>
                                                <span className="text-gray-700 text-xs">Haz clic en <strong>"Solicitar Código"</strong></span>
                                            </div>
                                            <div className="flex items-start">
                                                <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">3</span>
                                                <span className="text-gray-700 text-xs">Abre <strong>WhatsApp</strong> → <strong>Dispositivos vinculados</strong></span>
                                            </div>
                                            <div className="flex items-start">
                                                <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">4</span>
                                                <span className="text-gray-700 text-xs">Selecciona <strong>"Vincular con número"</strong></span>
                                            </div>
                                            <div className="flex items-start">
                                                <span className="bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">5</span>
                                                <span className="text-gray-700 text-xs">Ingresa el código mostrado</span>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
                                            <p className="text-xs text-purple-700 text-center">
                                                <FaPhone className="inline mr-1" />
                                                El código se genera al solicitar
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Dialog>
    );
};

export default ConexionWhatsApp;