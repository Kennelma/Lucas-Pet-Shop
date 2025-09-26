import { useState, useEffect  } from 'react'

import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { loginUsuario } from '../../../services/apiService.js'

const login = () => {
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

    const data = await loginUsuario(login);

    if (!data) {
      setLoginMessage('No se recibió ninguna respuesta del servidor')
      setAlertType('danger')
    } else {

      switch(Number(data.user)) {

      case 3: //LOGIN EXITOSO
        sessionStorage.setItem('token', data.token)
        sessionStorage.setItem('usuario', JSON.stringify(data.usuario))
        
        setLoginMessage(`✅ Bienvenido ${data.usuario.nombre}`)
        setAlertType('success')
        navigate('/Dashboard')
        break

      case 1: //USUARIO NO ENCONTRADO
        setLoginMessage('❌ Este correo no está asociado a ninguna cuenta en el sistema')
        setAlertType('danger')
        break

      case 2: //USUARIO INACTIVO
        setLoginMessage('⚠️ Tu cuenta está inactiva. Contacta al administrador')
        setAlertType('warning')
        break

      default:
        setLoginMessage('Ocurrió un error inesperado')
        setAlertType('info')
    }
      
    }

    setLoading(false)
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleLogin}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>

                   {loginMessage && <CAlert color={alertType}>{loginMessage}</CAlert>}

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Usuario o Email"
                        autoComplete="username"
                        type="text"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        required
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </CInputGroup>

                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" className="px-4" type="submit" disabled={loading}>
                          {loading ? 'Logging in...' : 'Login'}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>

              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">{/* Espacio para Sign up si quieres */}</CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default login
