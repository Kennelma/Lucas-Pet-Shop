import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const Clientes = React.lazy(() => import('./views/clientes/Clientes'))

const Accesorios = React.lazy(() => import('./views/productos/accesorios/Accesorios'))
const Aliumentos = React.lazy(() => import('./views/productos/alimentos/Alimentos'))
const Medicamentos = React.lazy(() => import('./views/productos/medicamentos'))
const Animales = React.lazy(() => import('./views/productos/animales/Animales'))


//AQUI LAS UNIFICAMOS ENTONCES SOLO DEBERIA APARECER COMO UNO
//const Promociones  = React.lazy(() => import('./views/peluqueria-canina/PeluqueriaCanina'))
const Servicios  = React.lazy(() => import('./views/peluqueria-canina/PeluqueriaCanina'))
//import PeluqueriaCanina from './views/peluqueria-canina/PeluqueriaCanina';


const routes = [
  { path: '/', name: 'Dashboard', element: Dashboard },
  { path: '/clientes', name: 'Clientes', element: Clientes },

  { path: '/productos/alimentos', name: 'Productos / Alimentos', element: Aliumentos },
  { path: '/productos/animales', name: 'Productos / Animales', element: Animales },
  { path: '/productos/medicamentos', name: 'Productos / Medicamentos', element: Medicamentos },
  { path: '/productos/accesorios', name: 'Productos / Accesorios', element: Accesorios },

//  { path: '/peluqueria-canina/Promociones', name: 'Peluqueria Canina / Promociones', element: Promociones },
  { path: '/peluqueria-canina/PeluqueriaCanina', name: 'Peluqueria Canina', element: Servicios },
]


export default routes
