import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import loginPhoto from './login-photo.png';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

import { login as loginUsuario } from '../../../AXIOS.SERVICES/auth-axios.js';

const Login = () => {
  const navigate = useNavigate();

  //ESTADOS_DEL_COMPONENTE
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alertaMostrada, setAlertaMostrada] = useState(false);

  //VERIFICAR_SI_YA_HAY_SESION_ACTIVA
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const sessionExpired = sessionStorage.getItem('sessionExpired');

    if (token) {
      navigate('/dashboard');
      return;
    }

    //MOSTRAR_ALERTA_SI_LA_SESION_EXPIRO
    if (sessionExpired && !alertaMostrada) {
      setAlertaMostrada(true);
      Swal.fire({
        icon: 'warning',
        title: 'Sesión expirada',
        text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      sessionStorage.removeItem('sessionExpired');
    }
  }, [navigate, alertaMostrada]);

  //FUNCION_PARA_MANEJAR_EL_INICIO_DE_SESION
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      //NORMALIZAR LOGIN A MINUSCULAS
      const cleanLogin = login.trim().toLowerCase();
      const data = await loginUsuario({ login: cleanLogin, password });

      //SI NO HAY RESPUESTA DEL SERVIDOR
      if (!data) {
        toast.error('No se pudo conectar con el servidor', {
          position: 'top-center',
          autoClose: 5000,
        });
        return;
      }

      //SI EL LOGIN FUE EXITOSO
      if (data.success) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('usuario', JSON.stringify(data.usuario));
        sessionStorage.setItem('showWelcome', 'true');
        navigate('/dashboard');
        return;
      }

      //MANEJO DE ERRORES SEGUN CODIGO
      switch (data.code) {
        case 'USER_NOT_FOUND':
          toast.error('El usuario o correo ingresado no existe en el sistema', {
            position: 'top-center',
            autoClose: 5000,
          });
          break;

        case 'ACCOUNT_BLOCKED':
          toast.error(`${data.bloqueadoHasta ? `Tu cuenta está bloqueada hasta las ${data.bloqueadoHasta}` : 'Tu cuenta está temporalmente bloqueada'}`, {
            position: 'top-center',
            autoClose: 6000,
          });
          break;

        case 'ACCOUNT_BLOCKED_ATTEMPTS':
          toast.error(`Demasiados intentos fallidos. Tu cuenta ha sido bloqueada por ${data.tiempoBloqueo} minutos`, {
            position: 'top-center',
            autoClose: 6000,
          });
          break;

        case 'USER_INACTIVE':
          toast.warning('Tu cuenta está inactiva. Consulta con el administrador', {
            position: 'top-center',
            autoClose: 5000,
          });
          break;

        case 'INVALID_CREDENTIALS':
          toast.error(`Usuario o contraseña incorrectos. Intentos restantes: ${data.intentosRestantes || 0}`, {
            position: 'top-center',
            autoClose: 5000,
          });
          break;

        default:
          toast.error(data.message || 'Ocurrió un error inesperado', {
            position: 'top-center',
            autoClose: 5000,
          });
      }

    } catch (error) {
      console.error('Error en login:', error);
      toast.error('Ocurrió un error al procesar la solicitud', {
        position: 'top-center',
        autoClose: 5000,
      });
    } finally {
      //DESACTIVAR LOADING AL FINALIZAR
      setLoading(false);
    }
  };

  //ALTERNAR VISIBILIDAD DE LA CONTRASEÑA
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  //CONVERTIR LOGIN A MINUSCULAS AL ESCRIBIR
  const handleLoginChange = (e) => {
    setLogin(e.target.value.toLowerCase());
  };

  //RENDERIZADO DEL FORMULARIO
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-gray-100 p-4">
      <div className="flex w-full max-w-3xl shadow-2xl rounded-2xl overflow-hidden h-[450px] backdrop-blur-sm bg-white/95">

        {/* SECCION_IZQUIERDA_FORMULARIO */}
        <div className="w-1/2 p-10 bg-white/90 backdrop-blur-sm flex flex-col justify-center relative">

          {/* TITULO Y SUBTITULO */}
          <div className="text-center mb-6">
            <h3
              className="text-3xl font-bold mb-2 bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              PORTAL DE ACCESO
            </h3>
            <p className="text-gray-600 text-sm font-medium">Sistema de facturación</p>
          </div>

          {/* FORMULARIO DE LOGIN */}
          <form onSubmit={handleLogin} className="space-y-6">

            {/* CAMPO USUARIO O CORREO */}
            <div className="space-y-2">
              <input
                id="login"
                type="text"
                placeholder="Ingresa tu usuario o correo"
                value={login}
                onChange={handleLoginChange}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* CAMPO CONTRASEÑA CON TOGGLE */}

            <div className="space-y-2">
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="off"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-contacts-auto-fill-button]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                />

                {/* BOTON_MOSTRAR_OCULTAR_CONTRASEÑA */}
                {password && (
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-600 transition-colors duration-200 disabled:opacity-50"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* BOTONES_DE_ACCION */}
            <div className="space-y-4">

              {/* BOTON_INICIAR_SESION */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Iniciando...
                    </div>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </div>

              {/* ENLACE_OLVIDE_CONTRASEÑA */}
              <div className="text-center">
                <button
                  type="button"
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => navigate('/olvide-contrasena')}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* SECCION_DERECHA_IMAGEN */}
        <div className="w-1/2 flex items-center justify-center bg-gray-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/20"></div>
          <img
            src={loginPhoto}
            alt="Login Visual"
            className="max-h-full max-w-full object-contain relative z-10 transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;