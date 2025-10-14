import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import loginPhoto from './login-photo.jpg'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai' 


import { login as loginUsuario } from '../../../AXIOS.SERVICES/auth-axios.js'

const Login = () => {
  const navigate = useNavigate()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [loginMessage, setLoginMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [alertType, setAlertType] = useState('danger')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (token) {
      navigate('/dashboard')
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setLoginMessage('')

    // Normaliza el login
    const cleanLogin = login.trim().toLowerCase();

    const data = await loginUsuario({ login: cleanLogin, password })

    if (!data) {
      setLoginMessage('❌ NO SE RECIBIÓ INFORMACIÓN DEL SERVIDOR')
      setAlertType('danger')
    } else {
      setLoginMessage(data.message)
      if (data.success) {
        setAlertType('success')
        sessionStorage.setItem('token', data.token)
        sessionStorage.setItem('usuario', JSON.stringify(data.usuario))
        navigate('/dashboard')
      } else if (data.message && data.message.includes('INEXISTENTE')) {
        setAlertType('danger')
      } else if (data.message && data.message.includes('INACTIVO')) {
        setAlertType('warning')
      } else {
        setAlertType('warning')
      }
    }

    setLoading(false)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="flex w-3/5 max-w-4xl shadow-lg rounded-lg overflow-hidden">
        
        {/*LOGIN A LA IZQUIERDA*/}
        <div className="w-1/2 p-8 bg-white flex flex-col justify-center">
          
        <h2 className="text-center text-2xl font-medium mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>LUCAS PET SHOP</h2>

         <p className="text-center text-gray-600 text-base px-4 py-2 mb-4 font-sans">Portal de acceso: Sistema de facturación</p>


          {loginMessage && (
            <div
              className={`mb-4 px-4 py-2 rounded ${
                alertType === 'success'
                  ? 'bg-green-100 text-green-700'
                  : alertType === 'warning'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {loginMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Usuario o correo"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <div className="relative"> {/* Contenedor para posicionar el ícono */}
                    <input
                        //CAMBIAR EL TIPO DE INPUT BASADO EN EL ESTADO
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        // pr-10 para dejar espacio al icono
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" 
                    />
                    
                    {/* 4. BOTÓN/ÍCONO PARA TOGGLE */}
                    <button
                        type="button" // Evita que el botón envíe el formulario
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-600 focus:outline-none"
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        
                    >
                        {/* 5. MOSTRAR EL ÍCONO CORRECTO */}
                        {showPassword ? (
                            <AiOutlineEye size={20} />
                        ) : (
                            <AiOutlineEyeInvisible size={20} />
                        )}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <button type="button" className="text-blue-600 hover:underline"
                      onClick={() => navigate('/olvide-contrasena')}
              >
                Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </div>

        {/* IMAGE RIGHT SIDE */}
        <div className="w-1/2">
          <img
            src={loginPhoto}
            alt="Login Visual"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}

export default Login
