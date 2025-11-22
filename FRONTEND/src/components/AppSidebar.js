import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
  useColorModes
} from '@coreui/react'
import { AppSidebarNav } from './AppSidebarNav'
import getNavigation from '../sidebar-components'
import logo from '../assets/brand/logo-empresa.png'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  const { colorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const sidebarColorScheme = colorMode === 'light' ? 'light' : 'dark'

  //OBTENER LA NAVEGACIÓN FILTRADA SEGÚN EL ROL ACTUAL
  const navigation = getNavigation()

  return (
    <CSidebar
      className="border-end"
      colorScheme={sidebarColorScheme}
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onShow={() => dispatch({ type: 'set', sidebarShow: true })}
      onHide={() => dispatch({ type: 'set', sidebarShow: false })}
    >
      {/* HEADER */}
      <CSidebarHeader className="border-bottom flex justify-between items-center">
        <CSidebarBrand
          to="/"
          className="flex items-center no-underline"
          style={{ textDecoration: 'none' }} // quitar subrayado
        >
          {/* Modo abierto */}
          <div className="flex items-center sidebar-brand-full">
            <img src={logo} alt="Lucas Pet Shop" className="h-16 w-auto" />
            <span className="font-bold text-lg whitespace-nowrap" style={{ fontFamily: 'Poppins, Roboto, Arial, sans-serif' }}>
              LUCAS PET SHOP
            </span>
          </div>

          {/* Modo colapsado / narrow */}
          <div className="sidebar-brand-narrow">
            <img src={logo} alt="logo-small" className="h-10 w-auto" />
          </div>
        </CSidebarBrand>

        <CCloseButton
          className="d-lg-none"
          dark={sidebarColorScheme === 'dark'}
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>

      {/* NAV */}
      <AppSidebarNav items={navigation} />

      {/* FOOTER */}
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)