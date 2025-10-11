import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const Clientes = React.lazy(() => import('./views/clientes/Clientes'))

const Accesorios = React.lazy(() => import('./views/productos/accesorios/Accesorios'))
const Alimentos = React.lazy(() => import('./views/productos/alimentos/Alimentos'))
const Medicamentos = React.lazy(() => import('./views/productos/medicamentos/Medicamentos'))
const Animales = React.lazy(() => import('./views/productos/animales/Animales'))
const Promociones = React.lazy(() => import('./views/promociones/Promociones'))
const Servicios = React.lazy(() => import('./views/serviciosPeluqueria/Servicios'))
const Recordatorios = React.lazy(() => import('./views/recordatorios/Recordatorios'))


const routes = [
  { path: '/Dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/clientes', name: 'Clientes', element: Clientes },
  { path: '/productos/alimentos', name: 'Productos / Alimentos', element: Alimentos },
  { path: '/productos/animales', name: 'Productos / Animales', element: Animales },
  { path: '/productos/accesorios', name: 'Productos / Accesorios', element: Accesorios },
  { path: '/productos/medicamentos', name: 'Productos / Medicamentos', element: Medicamentos },
  { path: '/peluqueria_canina/promociones', name: 'Peluquería Canina / Promociones', element: Promociones },
  { path: '/peluqueria_canina/servicios', name: 'Peluquería Canina / Servicios', element: Servicios },
  { path: '/recordatorios', name: 'Recordatorios', element: Recordatorios },

]


export default routes
