import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const Clientes = React.lazy(() => import('./views/clientes/Clientes.js'))
const Accesorios = lazy(() => import("./views/productos/Accesorios.js"))
const Alimentos = React.lazy(() => import('./views/productos/Alimentos.js'))
const Medicamentos = React.lazy(() => import('./views/productos/Medicamentos.js'))
const Animales = React.lazy(() => import('./views/productos/Animales.js'))

const Promociones  = React.lazy(() => import('./views/peluqueria-canina/Promociones.js'))
const Servicios  = React.lazy(() => import('./views/peluqueria-canina/Servicios-peluqueria.js'))



const routes = [
  { path: '/', name: 'Dashboard', element: Dashboard },
  { path: '/clientes', name: 'Clientes', element: Clientes },

  { path: '/productos/Alimentos', name: 'Productos / Alimentos', element: Alimentos },
  { path: '/productos/animales', name: 'Productos / Animales', element: Animales },
  { path: '/productos/medicamentos', name: 'Productos / Medicamentos', element: Medicamentos },
  { path: '/productos/accesorios', name: 'Productos / Accesorios', element: Accesorios },

  { path: '/peluqueria-canina/Promociones', name: 'Peluqueria Canina / Promociones', element: Promociones },
  { path: '/peluqueria-canina/Servicios-peluqueria', name: 'Peluqueria Canina / Servicios peluqueria', element: Servicios },
]


export default routes
