
import "@fortawesome/fontawesome-free/css/all.min.css";

import React, { Suspense, useEffect, useState} from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import './scss/examples.scss'
import './tailwind.css'

import ProtectedRoute from "./views/pages/login/ProtectedRoute";
import ForgotPassword from './views/pages/login/forgotPassword';


// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))


// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
import ConexionWhatsApp from './views/whatsApp/ConexionWhatsApp';

// En tus rutas:
<Route path="/whatsapp/conexion" element={<ConexionWhatsApp />} />

const App = () => {

  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps


  return (
    <BrowserRouter>


      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>

          {/**RUTA RAIZ REDIRIGE AL LOGIN */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          import ConexionWhatsApp from './views/whatsapp/ConexionWhatsApp';

          <Route path="/whatsapp/conexion" element={<ConexionWhatsApp />} />


          {/*RUTAS PUBLICAS*/}
          <Route path="/login" element={<Login/>} />
          <Route path="/olvide-contrasena" element={<ForgotPassword />}/>
          <Route exact path="/register" name="Register Page" element={<Register />} />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />


          {/*RUTAS PROTEGIDAS*/}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DefaultLayout />
              </ProtectedRoute>
            }
          />


        </Routes>




      </Suspense>
    </BrowserRouter>
  )
}

export default App
