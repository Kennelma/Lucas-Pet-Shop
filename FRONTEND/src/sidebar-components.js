//IMPORTACIONES DE COMPONENTES DE COREUI PARA EL SIDEBAR
import { CNavGroup, CNavItem, CNavTitle} from '@coreui/react'

//IMPORTACIONES DE FONTAWESOME PARA LOS ICONOS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGaugeHigh,
  faUsers,
  faBoxesStacked,
  faCut,
  faTags,
  faBell,
  faDollarSign,
  faChartPie,
  faCapsules,
  faDog,
  faGift,
  faBone,
  faCoins,
  faShower,
  faStore,
  faShield,
  faChartArea,
  faBorderAll
} from '@fortawesome/free-solid-svg-icons'

//FUNCIÓN PARA OBTENER LA NAVEGACIÓN FILTRADA SEGÚN EL ROL DEL USUARIO
const getNavigation = () => {
  //OBTENER EL USUARIO LOGUEADO DEL SESSION STORAGE
  const usuarioActual = JSON.parse(sessionStorage.getItem('usuario') || '{}');
  const rolActual = usuarioActual?.rol?.toLowerCase();

  //DEFINICIÓN COMPLETA DE TODOS LOS ITEMS DEL SIDEBAR
  const navCompleto = [

    //DASHBOARD - VISIBLE PARA TODOS LOS ROLES
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: <FontAwesomeIcon icon={faGaugeHigh} className="nav-icon" />,
      badge: {
        color: 'info',
      },
    },

    //TÍTULO DE SECCIÓN
    {
      component: CNavTitle,
      name: 'MODULOS',
    },

    //1. FACTURACIÓN - VISIBLE PARA TODOS LOS ROLES
    {
      component: CNavItem,
      name: 'Facturación',
      to: '/facturacion',
      icon: <FontAwesomeIcon icon={faDollarSign} className="nav-icon" />,
    },

    //2. GRUPO DE PRODUCTOS CON SUBMENÚ - VISIBLE PARA TODOS LOS ROLES
    {
      component: CNavGroup,
      name: 'Productos',
      icon: <FontAwesomeIcon icon={faBoxesStacked} className="nav-icon" />,
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

    //3. GRUPO DE PELUQUERÍA CANINA CON SUBMENÚ - VISIBLE PARA TODOS LOS ROLES
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

    //4. CLIENTES - VISIBLE PARA TODOS LOS ROLES
    {
      component: CNavItem,
      name: 'Clientes',
      to: '/clientes',
      icon: <FontAwesomeIcon icon={faUsers} className="nav-icon" />,
    },

    //5. SEGURIDAD
    {
      component: CNavItem,
      name: 'Seguridad',
      to: '/seguridad',
      icon: <FontAwesomeIcon icon={faShield} className="nav-icon" />,
    },

    //6. RECORDATORIOS
    {
      component: CNavItem,
      name: 'Recordatorios',
      to: '/recordatorios',
      icon: <FontAwesomeIcon icon={faBell} className="nav-icon" />,
    },

    //7. ESTILISTAS Y BONIFICACIONES
    {
      component: CNavItem,
      name: 'Estilistas',
      to: '/estilistas',
      icon: <FontAwesomeIcon icon={faCoins} className="nav-icon" />,
    },

    //8. REPORTES CON SUBMENÚ
    {
      component: CNavGroup,
      name: 'Reportes',
      icon: <FontAwesomeIcon icon={faChartPie} className="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Grafica',
          to: '/reportes',
          style: { paddingLeft: '65px' },
          icon: <FontAwesomeIcon icon={faChartArea} className="nav-icon" />,
        },
        {
          component: CNavItem,
          name: 'Tabla',
          to: '/reportes/Tabla',
          style: { paddingLeft: '65px' },
          icon: <FontAwesomeIcon icon={faBorderAll} className="nav-icon" />,
        }
      ]
    },

  //ESTILISTAS Y BONIFICACIONES
  {
    component: CNavItem,
    name: 'Estilistas',
    to: '/estilistas',
    icon: <FontAwesomeIcon icon={faCoins} className="nav-icon" />,
  },


  //REPORTES
{
  component: CNavItem,
  name: 'Reportes',
  to: '/reportes',
  icon: <FontAwesomeIcon icon={faChartPie} className="nav-icon" />,
},





];
  //FILTRAR LOS ITEMS DEL NAV SEGÚN EL ROL DEL USUARIO
  return navCompleto.filter(item => {
    //SI EL ITEM NO TIENE RESTRICCIÓN DE ROLES, MOSTRARLO A TODOS
    if (!item.rolesPermitidos) {
      return true;
    }
    //SI TIENE RESTRICCIÓN, VERIFICAR SI EL ROL DEL USUARIO ESTÁ EN LA LISTA PERMITIDA
    return item.rolesPermitidos.includes(rolActual);
  });
};

//EXPORTAR LA FUNCIÓN DIRECTAMENTE PARA QUE SE EJECUTE CADA VEZ QUE SE NECESITE
export default getNavigation;