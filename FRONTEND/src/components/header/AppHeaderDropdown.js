import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilUser,
  cilAccountLogout,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  
  // Obtener datos del usuario del sessionStorage
  const usuarioString = sessionStorage.getItem('usuario')
  const usuario = usuarioString ? JSON.parse(usuarioString) : null
  
  // Función para obtener las iniciales del nombre
  const getInitials = (nombre) => {
    if (!nombre) return 'U'
    const words = nombre.trim().split(' ')
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }
    return nombre.substring(0, 2).toUpperCase()
  }

  // Función para cerrar sesión
  const handleLogout = () => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('usuario')
    navigate('/login')
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar 
          color="primary" 
          textColor="white"
          size="md"
        >
          {getInitials(usuario?.nombre)}
        </CAvatar>
      </CDropdownToggle>
      
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
          <div>{usuario?.nombre || 'Usuario'}</div>
          <small className="text-muted">{usuario?.email || ''}</small>
        </CDropdownHeader>
        
        {/*BOTON DE PERFIL*/}
        <CDropdownItem href="#/perfil">
          <CIcon icon={cilUser} className="me-2" />
          Mi Perfil
        </CDropdownItem>
        
        <CDropdownDivider />
        
        {/*BOTÓN DE CERRAR SESIÓN*/}
        <CDropdownItem onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilAccountLogout} className="me-2" />
          Cerrar Sesión
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown