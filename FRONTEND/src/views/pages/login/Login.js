import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import loginPhoto from './login-photo.png'
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

  const handleLoginChange = (e) => {
    const value = e.target.value
    if (value.length > 0) {
      
      //CONVIERTE LA PRIMER LETRA MINUSCULA
      const lowercased = value.charAt(0).toLowerCase() + value.slice(1)
      setLogin(lowercased)
    } else {
      setLogin(value)
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br  from-blue-50 to-gray-100 p-4">

      <div className="flex w-full max-w-3xl shadow-2xl rounded-2xl overflow-hidden h-[450px] backdrop-blur-sm bg-white/95">
        
        {/*LOGIN A LA IZQUIERDA*/}
        <div className="w-1/2 p-10 bg-white/90 backdrop-blur-sm flex flex-col justify-center relative">
          
        <div className="text-center mb-2">
          <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" style={{ fontFamily: 'Outfit, sans-serif' }}>
            PORTAL DE ACCESO
          </h3>
          <p className="text-gray-600 text-sm font-medium">Sistema de facturación</p>
        </div>


          {loginMessage && (
            <div
              className={`mb-4 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                alertType === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : alertType === 'warning'
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}
            >
              {loginMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <input
                id="login"
                type="text"
                placeholder="Ingresa tu usuario o correo"
                value={login}
                onChange={handleLoginChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400" 
                />
                
                <button
                  type="button" 
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-600 focus:outline-none transition-colors duration-200"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 font-medium"
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
              
              <div className="text-center">
                <button type="button" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 text-sm"
                        onClick={() => navigate('/olvide-contrasena')}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>
          </form>
        </div>

        {/*LOGO DE LA EMPRESA*/}
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
  )
}

export default Login
