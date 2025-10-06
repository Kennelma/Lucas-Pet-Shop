import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const Clientes = React.lazy(() => import('./views/clientes/Clientes'))

const Accesorios = React.lazy(() => import('./views/productos/accesorios/Accesorios'))
const Alimentos = React.lazy(() => import('./views/productos/alimentos/Alimentos'))
const Medicamentos = React.lazy(() => import('./views/productos/medicamentos'))
const Animales = React.lazy(() => import('./views/productos/animales/Animales'))
const Recordatorios = React.lazy(() => import('./views/recordatorios/Recordatorios'))


// Peluquería Canina
const Servicios  = React.lazy(() => import('./views/peluqueria-canina/PeluqueriaCanina'))
const Promociones  = React.lazy(() => import('./views/peluqueria-canina/Promociones'))
const SERVICIOS  = React.lazy(() => import('./views/peluqueria-canina/Servicios'))


const routes = [
  { path: '/Dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/clientes', name: 'Clientes', element: Clientes },

  { path: '/productos/alimentos', name: 'Productos / Alimentos', element: Alimentos },
  { path: '/productos/animales', name: 'Productos / Animales', element: Animales },
  { path: '/productos/medicamentos', name: 'Productos / Medicamentos', element: Medicamentos },
  { path: '/productos/accesorios', name: 'Productos / Accesorios', element: Accesorios },

  { path: '/peluqueria-canina/PeluqueriaCanina', name: 'Peluqueria Canina', element: Servicios },
  { path: '/peluqueria-canina/Promociones', name: 'Peluqueria Canina / Promociones', element: Promociones },
  { path: '/peluqueria-canina/Servicios', name: 'Peluqueria Canina / Servicios', element: SERVICIOS },

  //recordatorios
  { path: '/recordatorios/Recordatorios', name: 'Recordatorios', element: Recordatorios },
]


export default routes
