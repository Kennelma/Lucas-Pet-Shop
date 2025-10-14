import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'; 
// Asegúrate de que esta ruta de importación sea correcta
import { solicitarCodigoReseteo, resetearContrasena } from '../../../AXIOS.SERVICES/auth-axios.js'; 

const ForgotPassword = () => {
    const navigate = useNavigate();
    
    // Estados principales
    const [message, setMessage] = useState('');
    const [alertType, setAlertType] = useState('info');
    const [loading, setLoading] = useState(false);
    
    // Lógica multi-paso
    const [step, setStep] = useState(1); // 1: Solicitar Email, 2: Resetear con Código
    const [idUsuario, setIdUsuario] = useState(null); // Para guardar el ID devuelto por el servidor
    
    // Inputs del formulario
    const [email, setEmail] = useState('');
    const [codigoOTP, setCodigoOTP] = useState('');
    const [nuevaContrasena, setNuevaContrasena] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // ===================================
    // FUNCIÓN DE SOLICITUD DE CÓDIGO (Paso 1)
    // ===================================
    const handleSolicitarCodigo = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const cleanEmail = email.trim().toLowerCase();

        const data = await solicitarCodigoReseteo(cleanEmail);

        if (data && data.success) {
            setMessage(data.message);
            setAlertType('success');
            
            // Éxito: Guardamos el ID de usuario para el siguiente paso y avanzamos
            setIdUsuario(data.idUsuario);
            setStep(2);
        } else {
            // Nota: El backend envía una respuesta genérica (casi siempre 'success' true) por seguridad, 
            // pero si falla la conexión, este es el manejo
            setMessage(data?.message || '⚠️ Se envió una solicitud. Revise su correo.');
            setAlertType('warning');
        }
        
        setLoading(false);
    };

    // ===================================
    // FUNCIÓN DE RESTABLECIMIENTO (Paso 2)
    // ===================================
    const handleResetearContrasena = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        
        if (!idUsuario) {
            setMessage('❌ El proceso debe iniciar desde el Paso 1.');
            setAlertType('danger');
            setLoading(false);
            return;
        }

        const data = await resetearContrasena(idUsuario, codigoOTP, nuevaContrasena);

        if (data && data.success) {
            setMessage(data.message + ' Redirigiendo al login...');
            setAlertType('success');
            
            // Reset exitoso, redirigimos al login
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } else {
            // Error: código incorrecto, expirado, etc.
            setMessage(data?.message || '❌ Error al restablecer. Solicite un nuevo código.');
            setAlertType('danger');
        }

        setLoading(false);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // ===================================
    // RENDERIZADO
    // ===================================
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
                <h2 className="text-center text-2xl font-medium mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {step === 1 ? 'Recuperar Contraseña' : 'Validar Código y Resetear'}
                </h2>

                {/* MENSAJE DE ALERTA */}
                {message && (
                    <div className={`mb-4 px-4 py-2 rounded ${
                        alertType === 'success' ? 'bg-green-100 text-green-700' :
                        alertType === 'danger' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                        {message}
                    </div>
                )}

                {/* --- PASO 1: SOLICITAR CÓDIGO --- */}
                {step === 1 && (
                    <form onSubmit={handleSolicitarCodigo} className="space-y-4">
                        <p className="text-gray-600 text-sm">Ingresa el correo asociado a tu cuenta.</p>
                        <input
                            type="email"
                            placeholder="Correo Electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Solicitando Código...' : 'Enviar Código de Verificación'}
                        </button>
                    </form>
                )}

                {/* --- PASO 2: RESETEAR CONTRASEÑA --- */}
                {step === 2 && (
                    <form onSubmit={handleResetearContrasena} className="space-y-4">
                        <p className="text-gray-600 text-sm">Ingresa el código que te enviamos y tu nueva contraseña.</p>

                        <input
                            type="text"
                            placeholder="Código OTP (6 dígitos)"
                            value={codigoOTP}
                            onChange={(e) => setCodigoOTP(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Nueva Contraseña"
                                value={nuevaContrasena}
                                onChange={(e) => setNuevaContrasena(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" 
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-600 focus:outline-none"
                            >
                                {showPassword ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
                            </button>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => { setStep(1); setMessage(''); }} 
                            className="w-full text-sm text-blue-600 hover:underline mt-2"
                        >
                            Solicitar un código diferente o reenviar
                        </button>

                    </form>
                )}
                
                <hr className="my-4" />
                <button
                    onClick={() => navigate('/')}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                >
                    &larr; Volver al Login
                </button>
            </div>
        </div>
    );
};

export default ForgotPassword;