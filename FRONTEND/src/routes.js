import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const Clientes = React.lazy(() => import('./views/clientes/Clientes'))

const Accesorios = React.lazy(() => import('./views/productos/accesorios/Accesorios'))
const Alimentos = React.lazy(() => import('./views/productos/alimentos/Alimentos'))
const Medicamentos = React.lazy(() => import('./views/productos/medicamentos/Medicamentos'))
const Animales = React.lazy(() => import('./views/productos/animales/Animales'))
const Promociones = React.lazy(() => import('./views/promociones/Promociones'))


const routes = [
  { path: '/Dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/clientes', name: 'Clientes', element: Clientes },
<<<<<<< HEAD
  { path: '/productos/alimentos', name: 'Productos / Alimentos', element: Alimentos },
=======

  { path: '/productos/Alimentos', name: 'Productos / Alimentos', element: Alimentos },
>>>>>>> a91a094d282b63354d24e04a2ff260449eaf1b27
  { path: '/productos/animales', name: 'Productos / Animales', element: Animales },
  { path: '/productos/accesorios', name: 'Productos / Accesorios', element: Accesorios },
  { path: '/productos/medicamentos', name: 'Productos / Medicamentos', element: Medicamentos },
  { path: '/promociones', name: 'Promociones', element: Promociones }

]


export default routes
