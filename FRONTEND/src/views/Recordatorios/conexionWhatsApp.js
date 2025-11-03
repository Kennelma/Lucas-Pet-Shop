import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { FaWhatsapp, FaQrcode, FaPhone, FaCheckCircle, FaSpinner, FaSignOutAlt, FaTimes, FaSyncAlt, FaKey, FaExclamationTriangle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { obtenerQR, verificarEstado, solicitarCodigoEmparejamiento, cerrarSesionWhatsApp } from '../../AXIOS.SERVICES/whatsapp-axios';

const ConexionWhatsApp = ({ isOpen, onClose, onCerrarSesion }) => {
    const [qr, setQr] = useState(null);
    const [conectado, setConectado] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [cargandoCodigo, setCargandoCodigo] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [pairingCode, setPairingCode] = useState('');
    const [qrExpired, setQrExpired] = useState(false);
    const [qrTimer, setQrTimer] = useState(null);
    const [qrCountdown, setQrCountdown] = useState(60);

    const cargarQR = async () => {
        setCargando(true);
        setQrExpired(false);

        if (qrTimer) {
            clearTimeout(qrTimer);
        }

        try {
            const response = await obtenerQR();

            if (response.success) {
                if (response.conectado) {
                    setConectado(true);
                    setQr(null);
                } else if (response.qr) {
                    setQr(response.qr);
                    setConectado(false);

                    // Timer de expiración del QR
                    const timer = setTimeout(() => {
                        setQrExpired(true);
                    }, 60000);
                    setQrTimer(timer);
                } else {
                    // QR no disponible
                }
            } else {
                console.error('Error:', response.mensaje);
            }
        } catch (error) {
            console.error('Error al cargar QR:', error);
        }

        setCargando(false);
    };

    const verificarConexion = async () => {
        try {
            const response = await verificarEstado();
            if (response?.conectado) {
                setConectado(true);
                setQr(null);
            }
        } catch (error) {
            console.error('Error verificando conexión:', error);
        }
    };

    const solicitarCodigo = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            alert('Ingresa un número de teléfono válido');
            return;
        }

        setCargandoCodigo(true);

        try {
            const cleanPhone = phoneNumber.replace(/\D/g, '');
            const response = await solicitarCodigoEmparejamiento(cleanPhone);

            if (response?.success) {
                setPairingCode(response.code);
            } else {
                alert('Error al solicitar código: ' + (response?.mensaje || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error solicitando código:', error);
            alert('Error al solicitar código');
        } finally {
            setCargandoCodigo(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            cargarQR();

            const interval = setInterval(verificarConexion, 5000);
            return () => {
                clearInterval(interval);
                if (qrTimer) {
                    clearTimeout(qrTimer);
                }
            };
        }
    }, [isOpen, qrTimer]);

    // Countdown para el QR
    useEffect(() => {
        if (qr && !qrExpired) {
            setQrCountdown(60);
            const countdownInterval = setInterval(() => {
                setQrCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(countdownInterval);
        }
    }, [qr, qrExpired]);

    const handleCerrarSesion = async () => {
        //CERRAR EL MODAL PRIMERO PARA EVITAR CONFLICTO DE Z-INDEX
        onClose();

        //ESPERAR UN MOMENTO PARA QUE SE CIERRE EL MODAL
        setTimeout(async () => {
            const result = await Swal.fire({
                title: '¿Cerrar sesión de WhatsApp?',
                text: 'Tendrás que escanear el código QR nuevamente para reconectar',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Sí, cerrar sesión',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                try {
                    setCargando(true);

                    const response = await cerrarSesionWhatsApp();

                    if (response.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Sesión cerrada',
                            text: 'WhatsApp desconectado correctamente',
                            timer: 2000,
                            showConfirmButton: false
                        });

                        //REINICIAR ESTADOS
                        setQr(null);
                        setConectado(false);
                        setQrExpired(false);
                        setQrCountdown(60);
                        setPairingCode('');
                        setPhoneNumber('');

                        if (qrTimer) {
                            clearTimeout(qrTimer);
                            setQrTimer(null);
                        }

                        setTimeout(cargarQR, 1000);
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'No se pudo cerrar la sesión'
                        });
                    }

                } catch (error) {
                    console.error('Error al cerrar sesión:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Ocurrió un error al cerrar la sesión'
                    });
                } finally {
                    setCargando(false);
                }
            }
        }, 200);
    };

    const footer = (
        <div className="flex justify-center gap-2">
            {conectado && (
                <Button
                    label="Desconectar sesión de WhatsApp"
                    icon={<FaSignOutAlt className="mr-1" />}
                    className="p-button-danger text-xs px-3 py-1"
                    onClick={handleCerrarSesion}
                    disabled={cargando}
                />
            )}
            <Button
                label="Cerrar"
                className="p-button-secondary text-xs px-3 py-1"
                onClick={onClose}
            />
        </div>
    );

    return (
        <>
        <Dialog

            visible={isOpen}
            style={{
                width: '32rem',
                borderRadius: '1.5rem',
                maxHeight: '85vh',
                overflow: 'hidden'
            }}
            breakpoints={{'960px': '75vw', '641px': '90vw'}}
            contentStyle={{
                overflow: 'hidden',
                maxHeight: 'none',
                padding: '0.5rem 1rem 1rem 1rem'
            }}
            modal
            closable={false}
            onHide={onClose}
            footer={footer}
            position="center"
            dismissableMask={false}
            draggable={false}
            resizable={false}
        >
            <div className="flex flex-col gap-1">
                {conectado ? (
                    <div className="text-center py-2 relative">

                        <button
                            onClick={onClose}
                            className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <FaTimes className="text-xs" />
                        </button>

                        <h2 className="text-lg font-bold text-green-600 mb-2 flex items-center justify-center gap-2">
                            <FaWhatsapp />
                            WhatsApp Conectado
                        </h2>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-green-800 font-medium mb-2 flex items-center justify-center gap-1 text-sm">
                                <FaCheckCircle className="text-xs" />
                                ¡Conexión exitosa!
                            </p>
                            <p className="text-green-700 text-xs mb-2">
                                Sistema listo para enviar recordatorios automáticos
                            </p>


                                <p className="text-green-600 text-xs font-medium mb-1">
                                     Dispositivo activo en WhatsApp
                                </p>
                                <p className="text-green-600 text-xs">
                                    Para desconectar completamente, usa "Cerrar Sesión"
                                </p>

                        </div>
                    </div>
                ) : (
                    <div className="w-full">
                        <style>
                            {`
                                .centered-tabs .p-tabview-nav {
                                    justify-content: center !important;
                                    display: flex !important;
                                }
                            `}
                        </style>
                        <TabView className="w-full centered-tabs">

                            <TabPanel
                            header={
                                <div className="flex items-center gap-2 justify-center">
                                    <FaQrcode className="text-sm text" />
                                    <span>CÓDIGO QR</span>
                                </div>
                            }
                        >
                            {
                                qr ? (
                                    <div className="bg-gradient-to-br from-blue-50 to-white p-3 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* QR Code */}
                                        <div className="text-center">
                                            <div className="bg-white p-4 rounded-xl border border-blue-100 mb-3 w-fit mx-auto relative shadow-lg">
                                                <img
                                                    src={qr}
                                                    alt="Código QR de WhatsApp"
                                                    className={`w-48 h-48 transition-all duration-300 ${qrExpired ? 'blur-sm opacity-50' : ''}`}
                                                    style={{
                                                        imageRendering: 'crisp-edges',
                                                        maxWidth: '100%',
                                                        height: 'auto'
                                                    }}
                                                />

                                                {/* Botón de recargar estilo WhatsApp - texto con ícono y blur */}
                                                {qrExpired && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-xl cursor-pointer" onClick={cargarQR}>
                                                        <div className="text-white text-sm text-center font-medium flex flex-col items-center gap-2">
                                                            <FaSyncAlt className="text-white text-lg" />
                                                            <div>
                                                                <div>Haz clic para</div>
                                                                <div>actualizar el código QR</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-3">
                                                <p className="text-xs text-blue-700 text-center">
                                                    <FaWhatsapp className="inline mr-1" />
                                                    {qrExpired ? 'Código expirado - Haz clic para actualizar' : `Se actualiza en ${qrCountdown}s`}
                                                </p>
                                            </div>
                                        </div>

                                       {/* Instrucciones */}
                                        <div>
                                            <div className="flex items-center mb-3">
                                                <h4 className="text-sm font-bold text-gray-800">Pasos para iniciar sesión</h4>
                                            </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-start">
                                                        <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">1</span>
                                                        <span className="text-gray-700 text-xs">Abre WhatsApp <FaWhatsapp className="inline text-green-500 mx-1" /> en tu teléfono</span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">2</span>
                                                        <span className="text-gray-700 text-xs">En Android, toca <strong>Menú ⋮</strong>. En iPhone, toca <strong>Ajustes ⚙️</strong></span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">3</span>
                                                        <span className="text-gray-700 text-xs">Toca <strong>Dispositivos vinculados</strong> y, luego, <strong>Vincular dispositivo</strong></span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">4</span>
                                                        <span className="text-gray-700 text-xs">Escanea el código QR para confirmar</span>
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
                                )}
                            </TabPanel>

                            <TabPanel
                                header={
                                    <div className="flex items-center gap-2 justify-center">
                                        <FaPhone className="text-sm" />
                                        <span>CON NÚMERO</span>
                                    </div>
                                }
                            >
                                <div className="bg-gradient-to-br from-purple-50 to-white p-3 rounded-xl border border-purple-100 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                label="Solicitar Código"
                                                icon={<FaKey className="mr-1" />}
                                                className="p-button-sm w-full"
                                                onClick={solicitarCodigo}
                                                disabled={cargandoCodigo}
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

                                    </div>
                                </div>
                            </TabPanel>
                        </TabView>
                    </div>
                )}
            </div>
        </Dialog>
        </>
    );
};

export default ConexionWhatsApp;