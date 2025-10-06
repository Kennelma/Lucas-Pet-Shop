import { CNavGroup, CNavItem, CNavTitle} from '@coreui/react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faGaugeHigh,
  faUsers,          
  faBoxesStacked ,            
  faCut,             
  faTags,                  
  faBell,            
  faDollarSign,     
  faChartPie ,  
  faCapsules,
  faDog,
  faUser,
  faGift,
  faBone,
  faCoins,
  faShower, 
  faStore,
  faBuilding,
} from '@fortawesome/free-solid-svg-icons'


const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/',
    icon: <FontAwesomeIcon icon={faGaugeHigh} className="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },

  

  {
    component: CNavTitle,
    name: 'MODULOS',
  },

  //FACTURACIÓN
  {
    component: CNavItem,
    name: 'Facturación',
    to: '/theme/colors',
    icon: <FontAwesomeIcon icon={faDollarSign} className="nav-icon" />,    
   
  },

  //CLIENTES
  {
    component: CNavItem,
    name: 'Clientes',
    to: '/clientes',
    icon: <FontAwesomeIcon icon={faUsers} className="nav-icon" />,
  },


  //GRUPO DE PRODUCTOS EN EL SIDEBAR
  {
    component: CNavGroup,
    name: 'Productos',
    icon: <FontAwesomeIcon icon={faBoxesStacked } className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Alimentos',
        to: '/productos/alimentos',
        style: { paddingLeft: '65px' },
        icon: <FontAwesomeIcon icon={faBone} className="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Medicamentos',
        to: '/productos/medicamentos',
        style: { paddingLeft: '65px' },
        icon: <FontAwesomeIcon icon={faCapsules} className="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Accesorios',
        to: '/productos/accesorios',
        style: { paddingLeft: '65px' },
        icon: <FontAwesomeIcon icon={faGift} className="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Animales',
        to: '/productos/animales',
        style: { paddingLeft: '65px' },
        icon: <FontAwesomeIcon icon={faDog} className="nav-icon" />,
      },
  ],
  },


  //GRUPO DE PELUQUERIA CANINA
  {
    component: CNavGroup,
    name: 'Peluqueria Canina',
    icon: <FontAwesomeIcon icon={faCut} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Servicios',
        style: { paddingLeft: '65px' },
        icon: <FontAwesomeIcon icon={faShower} className="nav-icon" />,
         to: '/peluqueria_canina/servicios',
        
      },
      {
        component: CNavItem,
        name: 'Promociones',
        to: '/peluqueria_canina/promociones',
        style: { paddingLeft: '65px' },
        icon: <FontAwesomeIcon icon={faTags} className="nav-icon" />,
        
      }, 
    ],
  },

  //EMPRESA
  {
    component: CNavGroup,
    name: 'Empresa',
    icon: <FontAwesomeIcon icon={faBuilding} className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Sucursales',
        style: { paddingLeft: '65px' },
        icon: <FontAwesomeIcon icon={faStore} className="nav-icon" />,
        to: '/',
        
      },
      {
        component: CNavItem,
        name: 'Usuarios',
        style: { paddingLeft: '65px' },
        icon: <FontAwesomeIcon icon={faUser} className="nav-icon" />,
        to: '/',
        
      }, 
    ],

  },

  //RECORDATORIOS
  {
    component: CNavItem,
    name: 'Recordatorios',
    to: '/theme/colors',
    icon: <FontAwesomeIcon icon={faBell} className="nav-icon" />,
  },

  //ESTILISTAS Y BONIFICACIONES
  {
    component: CNavItem,
    name: 'Estilistas',
    to: '/theme/colors',
    icon: <FontAwesomeIcon icon={faCoins} className="nav-icon" />,
  },


  //REPORTES
  {
    component: CNavItem,
    name: 'Reportes',
    to: '/theme/colors',
    icon: <FontAwesomeIcon icon={faChartPie} className="nav-icon" />,
   
  },

  
 

]

export default _nav



  