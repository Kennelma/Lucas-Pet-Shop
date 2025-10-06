import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const Clientes = React.lazy(() => import('./views/clientes/Clientes'))

const Accesorios = React.lazy(() => import('./views/productos/accesorios'))
const Alimentos = React.lazy(() => import('./views/productos/alimentos'))
const Medicamentos = React.lazy(() => import('./views/productos/medicamentos'))
const Animales = React.lazy(() => import('./views/productos/animales'))

const Promociones  = React.lazy(() => import('./views/peluqueria-canina/Promociones'))
const Servicios  = React.lazy(() => import('./views/peluqueria-canina/Servicios-peluqueria'))



const routes = [
  { path: '/Dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/clientes', name: 'Clientes', element: Clientes },

  { path: '/productos/Alimentos', name: 'Productos / Alimentos', element: Alimentos },
  { path: '/productos/animales', name: 'Productos / Animales', element: Animales },
  { path: '/productos/accesorios', name: 'Productos / Accesorios', element: Accesorios },
  { path: '/productos/medicamentos', name: 'Productos / Medicamentos', element: Medicamentos },

  { path: '/peluqueria-canina/Promociones', name: 'Peluqueria Canina / Promociones', element: Promociones },
  { path: '/peluqueria-canina/PeluqueriaCanina', name: 'Peluqueria Canina', element: Servicios },
  { path: '/peluqueria-canina/Promociones', name: 'Peluqueria Canina', element: Promociones },
  { path: '/peluqueria-canina/Servicios', name: 'Peluqueria Canina', element: SERVICIOS },

  //recordatorios
 { path: '/recordatorios/Recordatorios', name: 'Recordatorios', element: Recordatorios },
]


export default routes
