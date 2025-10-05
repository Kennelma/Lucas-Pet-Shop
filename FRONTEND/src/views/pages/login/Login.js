import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import loginPhoto from './login-photo.jpg'
import { loginUsuario } from '../../../services/apiService.js'

const Login = () => {
  const navigate = useNavigate()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [loginMessage, setLoginMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [alertType, setAlertType] = useState('danger')

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (token) {
      navigate('/Dashboard')
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setLoginMessage('')

    const data = await loginUsuario(login, password)

    if (!data) {
      setLoginMessage('❌ NO SE RECIBIÓ INFORMACIÓN DEL SERVIDOR')
      setAlertType('danger')
    } else {
      setLoginMessage(data.message)
      setAlertType(data.success ? 'success' : 'warning')

      if (data.success) {
        sessionStorage.setItem('token', data.token)
        sessionStorage.setItem('usuario', JSON.stringify(data.usuario))
        navigate('/Dashboard')
      }
    }

    setLoading(false)
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

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <button type="button" className="text-blue-600 hover:underline">
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

//export default Login
