import React, { useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import ModalNuevoUsuario from './modal-agregar-usuarios';
import ModalActualizarUsuario from './modal-actualizar-usuario';
import PerfilUsuario from './perfil-usuario';
import { verUsuarios, eliminarUsuario } from "../../../AXIOS.SERVICES/security-axios";

const ActionMenu = ({ rowData, onEditar, onEliminar, rowIndex, totalRows }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShowAbove, setShouldShowAbove] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const checkPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const menuHeight = 80;

      const showAbove = rect.bottom + menuHeight > viewportHeight - 50;
      setShouldShowAbove(showAbove);
    } else {
      const showAbove = rowIndex >= 2 || rowIndex >= (totalRows - 3);
      setShouldShowAbove(showAbove);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      setIsOpen(false);
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  const handleToggleMenu = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      checkPosition();
      requestAnimationFrame(() => {
        checkPosition();
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative flex justify-center" ref={menuRef}>
      <button
        ref={buttonRef}
        className="w-8 h-8 bg-gray-400 hover:bg-gray-500 rounded flex items-center justify-center transition-colors"
        onClick={handleToggleMenu}
        title="Más opciones"
      >
        <i className="pi pi-ellipsis-h text-white text-xs"></i>
      </button>

      {isOpen && (
        <div
          className={`fixed ${shouldShowAbove ? 'bottom-auto' : 'top-auto'} bg-white border border-gray-200 rounded-lg shadow-lg min-w-[140px]`}
          style={{
            zIndex: 99999,
            position: 'fixed',
            left: buttonRef.current ? buttonRef.current.getBoundingClientRect().right - 140 : 'auto',
            top: shouldShowAbove ?
              (buttonRef.current ? buttonRef.current.getBoundingClientRect().top - 80 : 'auto') :
              (buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + 5 : 'auto')
          }}
        >
          <div
            className="px-2 py-1.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onEditar(rowData);
            }}
          >
            <i className="pi pi-pencil text-xs"></i>
            <span className="uppercase">Editar</span>
          </div>

          <hr className="my-0 border-gray-200" />

          <div
            className="px-2 py-1.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onEliminar(rowData);
            }}
          >
            <i className="pi pi-trash text-xs"></i>
            <span className="uppercase">Eliminar</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [openNuevoUsuario, setOpenNuevoUsuario] = useState(false);
  const [openEditarUsuario, setOpenEditarUsuario] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [usuarioPerfilSeleccionado, setUsuarioPerfilSeleccionado] = useState(null);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState(null);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await verUsuarios();
      const data = response?.datos || response?.entidad || response || [];

      const normalizados = (Array.isArray(data) ? data : []).map(u => ({
        id_usuario_pk: u.id_usuario_pk,
        usuario: u.usuario || '',
        email_usuario: u.email_usuario || '',
        intentosFallidos: u.intentos_fallidos ?? 0,
        bloqueadoHasta: u.bloqueado_hasta,
        id_sucursal_fk: u.id_sucursal_fk,
        nombreSucursal: u.nombre_sucursal || 'Sin sucursal',
        cat_estado_fk: u.cat_estado_fk,
        estado: u.nombre_estado || 'Desconocido',
        id_rol_fk: u.id_roles ? parseInt(u.id_roles.split(',')[0]) : null,
        roles: u.roles || 'Sin roles'
      }));

      setUsuarios(normalizados);

      if (normalizados && normalizados.length > 0) {
        const ultimoUsuario = normalizados[normalizados.length - 1];
        setUsuarioPerfilSeleccionado(ultimoUsuario);
        setSelectedUsuarioId(ultimoUsuario.id_usuario_pk);
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los usuarios',
      });
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const filtroUsuarios = usuarios.filter(u => {
    const q = filtro.toLowerCase();
    return u.usuario.toLowerCase().includes(q) ||
           u.email_usuario.toLowerCase().includes(q) ||
           u.nombreSucursal.toLowerCase().includes(q) ||
           u.roles.toLowerCase().includes(q);
  });

  const sucursalBody = (row) => {
    return (
      <div className="text-sm text-center">
        <span className="text-gray-900">Principal</span>
      </div>
    );
  };

  const estadoBody = (row) => {
    const estado = row.estado || 'Desconocido';
    let colorClasses = 'bg-gray-100 text-gray-800';

    if (estado.toLowerCase() === 'activo') colorClasses = 'bg-green-100 text-green-800';
    else if (estado.toLowerCase() === 'bloqueado') colorClasses = 'bg-red-100 text-red-800';
    else if (estado.toLowerCase() === 'inactivo') colorClasses = 'bg-yellow-100 text-yellow-800';

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>
        {estado}
      </span>
    );
  };

  const rolesBody = (row) => {
    const roles = row.roles || 'Sin roles';
    let colorClasses = 'bg-purple-100 text-purple-800';

    if (roles.toLowerCase().includes('administrador') || roles.toLowerCase().includes('empleado')) colorClasses = 'bg-blue-100 text-blue-800';
    else if (roles.toLowerCase().includes('operador de inventario')) colorClasses = 'bg-rose-100 text-rose-800';
    else if (roles === 'Sin roles') colorClasses = 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>
        {roles}
      </span>
    );
  };

  const handleEditar = (usuario) => {
    const usuarioActual = JSON.parse(sessionStorage.getItem('usuario'));
    const rolActual = usuarioActual?.rol?.toLowerCase();

    if (rolActual !== 'administrador') {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para editar usuarios',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    setUsuarioSeleccionado(usuario);
    setOpenEditarUsuario(true);
  };

  const handleUsuarioCreado = () => {
    Swal.fire({
      icon: 'success',
      title: '¡Usuario creado!',
      text: 'El usuario se ha creado correctamente',
      confirmButtonText: 'Aceptar'
    });
    cargarUsuarios();
  };

  const handleUsuarioActualizado = () => {
    Swal.fire({
      icon: 'success',
      title: '¡Usuario actualizado!',
      text: 'El usuario se ha actualizado correctamente',
      confirmButtonText: 'Aceptar'
    });
    cargarUsuarios();
  };

  const handleEliminar = async (usuario) => {
    const usuarioActual = JSON.parse(sessionStorage.getItem('usuario'));
    const rolActual = usuarioActual?.rol?.toLowerCase();

    if (rolActual !== 'administrador') {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso Denegado',
        text: 'No tienes permisos para eliminar usuarios',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      html: `
        <div class="text-left my-2 p-2.5 bg-gray-50 rounded-md text-xs">
          <p class="mb-1 text-sm"><span class="font-bold">Usuario:</span> ${usuario.usuario}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Email:</span> ${usuario.email_usuario}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Sucursal:</span> ${usuario.nombreSucursal}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      width: 380,
      padding: '16px',
      customClass: {
        confirmButton: 'bg-red-600 hover:bg-red-700 text-white p-button p-component',
        cancelButton: 'p-button-text p-button p-component',
      },
    });

    if (result.isConfirmed) {
      try {
        const response = await eliminarUsuario(usuario.id_usuario_pk);

        if (response?.Consulta === true) {
          Swal.fire({
            icon: 'success',
            title: '¡Usuario eliminado!',
            text: 'El usuario se ha eliminado correctamente',
            confirmButtonText: 'Aceptar'
          });
          cargarUsuarios();
        } else {
          throw new Error(response?.mensaje || 'Error al eliminar usuario');
        }
      } catch (error) {
        console.error("Error eliminando usuario:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.mensaje || error.message || 'No se pudo eliminar el usuario',
        });
      }
    }
  };

  const handleRowClick = (e) => {
    setUsuarioPerfilSeleccionado(e.data);
    setSelectedUsuarioId(e.data.id_usuario_pk);
  };

  // Los estilos ahora están en el archivo custom-styles.scss

  return (
    <>

      <div className="min-h-screen p-6 bg-gray-50">
        <div className="rounded-xl p-6 mb-3"
        style={{
          backgroundImage: 'url("/h7.jpg")',
          backgroundColor: '#E4B389',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left center',
          boxShadow: '0 0 8px #E4B38940, 0 0 0 1px #E4B38933'
        }}
      >
        <div className="flex justify-center items-center">
          <h2 className="text-2xl font-black text-center uppercase text-black">
            GESTION DE SEGURIDAD
          </h2>
        </div>
          <p className="text-center text-black italic mt-2">
            Administra los usuarios del sistema y sus permisos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 bg-white border border-gray-300 rounded-xl overflow-hidden">
            <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-80">
              <input
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Buscar usuarios..."
                className="w-full px-4 py-2 border rounded-full"
              />
              {filtro && (
                <button
                  onClick={() => setFiltro('')}
                  className="absolute right-3 top-2 text-gray-500"
                >
                  ×
                </button>
              )}
            </div>
            <button
              className="bg-[#E5B489] text-black px-6 py-2 rounded hover:bg-[#C29874] transition-colors flex items-center gap-2"
              onClick={() => {
                const usuarioActual = JSON.parse(sessionStorage.getItem('usuario'));
                const rolActual = usuarioActual?.rol?.toLowerCase();

                if (rolActual !== 'administrador') {
                  Swal.fire({
                    icon: 'warning',
                    title: 'Acceso Denegado',
                    text: 'No tienes permisos para crear usuarios',
                    confirmButtonText: 'Aceptar'
                  });
                  return;
                }

                setOpenNuevoUsuario(true);
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
              NUEVO USUARIO
            </button>
          </div>

          <DataTable
            value={filtroUsuarios}
            loading={loading}
            loadingIcon={() => (
              <div className="flex items-center justify-center space-x-2 py-8 text-gray-500">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                <span>Cargando datos...</span>
              </div>
            )}
            globalFilter={filtro}
            globalFilterFields={['usuario', 'email_usuario', 'nombreSucursal', 'roles']}
            showGridlines
            paginator
            rows={5}
            rowsPerPageOptions={[5, 10, 20, 25]}
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            tableStyle={{ minWidth: '50rem' }}
            className="mt-4"
            size="small"
            selectionMode="single"
            rowClassName={(rowData) => rowData.id_usuario_pk === selectedUsuarioId ? 'fila-seleccionada cursor-pointer' : 'hover:bg-gray-50 cursor-pointer'}
            onRowClick={handleRowClick}
          >
            <Column
              field="id_usuario_pk"
              header="ID"
              body={(rowData) => filtroUsuarios.length - filtroUsuarios.indexOf(rowData)}
              sortable
              className="w-[50px]"
            />
            <Column
              field="usuario"
              header="USUARIO"
              sortable
              className="w-[150px]"
            />
            <Column
              field="roles"
              header="ROLES"
              body={rolesBody}
              sortable
              className="w-[150px]"
            />
            <Column
              header="ACCIONES"
              body={(rowData) => {
                const rowIndex = usuarios.indexOf(rowData);
                return (
                  <ActionMenu
                    rowData={rowData}
                    rowIndex={rowIndex}
                    totalRows={usuarios.length}
                    onEditar={handleEditar}
                    onEliminar={handleEliminar}
                  />
                );
              }}
              className="py-2 pr-9 pl-1 border-b text-sm"
              style={{ position: 'relative', overflow: 'visible' }}
            />
          </DataTable>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-gray-300 rounded-xl overflow-hidden">
            <PerfilUsuario usuarioSeleccionado={usuarioPerfilSeleccionado} />
          </div>
        </div>

        {openNuevoUsuario && (
          <ModalNuevoUsuario
            onClose={() => setOpenNuevoUsuario(false)}
            onUsuarioCreado={handleUsuarioCreado}
          />
        )}

        {openEditarUsuario && usuarioSeleccionado && (
          <ModalActualizarUsuario
            usuarioData={usuarioSeleccionado}
            onClose={() => {
              setOpenEditarUsuario(false);
              setUsuarioSeleccionado(null);
            }}
            onUsuarioActualizado={handleUsuarioActualizado}
          />
        )}
      </div>
    </>
  );
}
