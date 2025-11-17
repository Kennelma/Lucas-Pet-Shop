import React, { useState, useEffect, useRef } from 'react';
import { Building2, Plus, Edit2, Trash2, Search, MoreHorizontal } from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ver, insertar, actualizarRegistro } from '../../AXIOS.SERVICES/empresa-axios';

// Importar modales reales
import ModalAgregarEmpresa from './informacion-empresa/modal-agregar-empresa';
import ModalAgregarSucursal from './sucursales/modal-agregar-sucursal';

// Importar funciones de eliminación existentes
import { eliminarEmpresa } from './informacion-empresa/modal-eliminar-empresa';
import { eliminarSucursal } from './sucursales/modal-eliminar-sucursal';

// Componente para el menú de acciones con posicionamiento dinámico
const ActionMenu = ({ actions, rowIndex, totalRows }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShowAbove, setShouldShowAbove] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const checkPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const menuHeight = actions.length * 40;

      const showAbove = rect.bottom + menuHeight > viewportHeight - 50;
      setShouldShowAbove(showAbove);
    }
  };
// Verificar posición al abrir el menú
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleResize = () => setIsOpen(false);
    const handleScroll = () => setIsOpen(false);

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
    }
    setIsOpen(!isOpen);
  };
// Renderizar el botón y el menú
  return (

    <div className="relative flex justify-center" ref={menuRef}>
      <button
        ref={buttonRef}
        className="w-8 h-8 bg-gray-400 hover:bg-gray-500 rounded flex items-center justify-center transition-colors"
        onClick={handleToggleMenu}
        title="Más opciones"
      >
        <MoreHorizontal size={16} className="text-white" />
      </button>

      {isOpen && (
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-xl min-w-[140px] z-50"
          style={{
            position: 'fixed',
            left: buttonRef.current ? buttonRef.current.getBoundingClientRect().right - 140 : 'auto',
            top: shouldShowAbove ?
              (buttonRef.current ? buttonRef.current.getBoundingClientRect().top - (actions.length * 40) : 'auto') :
              (buttonRef.current ? buttonRef.current.getBoundingClientRect().bottom + 5 : 'auto')
          }}
        >
          {actions.map((action, index) => (
            <div
              key={index}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2 transition-colors first:rounded-t-lg last:rounded-b-lg"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                action.onClick();
              }}
            >
              {action.icon}
              {action.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function GestionEmpresa() {
  const [empresas, setEmpresas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para modales unificados

  const [modalEmpresa, setModalEmpresa] = useState({ show: false, mode: 'create', data: null });


  const [modalSucursal, setModalSucursal] = useState({ show: false, mode: 'create', data: null });

  // Estados para formularios
  const [formDataEmpresa, setFormDataEmpresa] = useState({});
  const [formDataSucursal, setFormDataSucursal] = useState({});
  const [errores, setErrores] = useState({});

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrar empresas basado en el término de búsqueda
  const empresasFiltradas = empresas.filter(empresa => {
    // Validar que searchTerm existe y no esté vacío
    if (!searchTerm || typeof searchTerm !== 'string') return true;

    const busqueda = searchTerm.trim().toLowerCase();
    if (busqueda === '') return true;
    // Verificar campos de empresa y sucursales
    return (
      empresa.nombre_empresa?.toLowerCase().includes(busqueda) ||
      empresa.direccion_empresa?.toLowerCase().includes(busqueda) ||
      empresa.telefono_empresa?.toLowerCase().includes(busqueda) ||
      empresa.correo_empresa?.toLowerCase().includes(busqueda) ||
      empresa.sucursales?.some(sucursal =>
        sucursal.nombre_sucursal?.toLowerCase().includes(busqueda) ||
        sucursal.direccion_sucursal?.toLowerCase().includes(busqueda) ||
        sucursal.telefono_sucursal?.toLowerCase().includes(busqueda)
      )
    );
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [empresasData, sucursalesData] = await Promise.all([
        ver('empresa'),
        ver('sucursales')
      ]);
      // Asociar sucursales a sus respectivas empresas
      const empresasConSucursales = (empresasData || []).map(empresa => ({
        ...empresa,
        sucursales: (sucursalesData || []).filter(sucursal =>
          sucursal.id_empresa_fk === empresa.id_empresa_pk
        )
      }));

      setEmpresas(empresasConSucursales);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error al cargar datos:', error);
      }
      const mensajeError = error?.response?.data?.message || error?.message || 'Error desconocido';
      alert(`Error al cargar los datos: ${mensajeError}. Por favor, inténtelo de nuevo.`);
      setEmpresas([]);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar cambios en formularios
  const handleChangeEmpresa = (e) => {
    const { name, value } = e.target;
    setFormDataEmpresa(prev => ({ ...prev, [name]: value }));

    // Limpiar error si el usuario está escribiendo
    if (value.trim() !== '' && errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleChangeSucursal = (e) => {
    const { name, value } = e.target;
    setFormDataSucursal(prev => ({ ...prev, [name]: value }));

    // Limpiar error si el usuario está escribiendo
    if (value.trim() !== '' && errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Funciones para validación al perder el foco
  const handleBlurEmpresa = (e) => {
    const { name, value } = e.target;
    validarCampoEmpresa(name, value);
  };

  const handleBlurSucursal = (e) => {
    const { name, value } = e.target;
    validarCampoSucursal(name, value);
  };

  // Funciones para abrir modales
  const abrirModalEmpresa = (mode = 'create', data = null) => {
    if (mode === 'edit' && data) {
      setFormDataEmpresa(data);
    } else {
      setFormDataEmpresa({});
    }
    setErrores({});
    setModalEmpresa({ show: true, mode, data });
  };

  const abrirModalSucursal = (mode = 'create', data = null, empresaData = null) => {
    if (mode === 'edit' && data) {
      setFormDataSucursal(data);
    } else {
      // Al crear, usar la empresa proporcionada o dejar vacío para selector
      const empresaId = empresaData?.id_empresa_pk || '';
      setFormDataSucursal({ id_empresa_fk: empresaId });
    }
    setErrores({});
    setModalSucursal({
      show: true,
      mode,
      data: {
        ...data,
        empresaData,
        empresasDisponibles: empresas // Pasar todas las empresas disponibles
      }
    });
  };

  const validarCampoEmpresa = (name, value) => {
    let error = '';
    // Validaciones específicas por campo
    switch (name) {
      case 'nombre_empresa':
        if (!value?.trim()) error = 'El nombre de la empresa es obligatorio';
        break;
      case 'correo_empresa':
        if (!value?.trim()) {
          error = 'El correo de la empresa es obligatorio';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'El correo no tiene un formato válido';
        }
        break;
      case 'telefono_empresa':
        if (!value?.trim()) {
          error = 'El teléfono de la empresa es obligatorio';
        } else if (value.length < 8) {
          error = 'El teléfono debe tener al menos 8 dígitos';
        }
        break;
      case 'rtn_empresa':
        if (!value?.trim()) {
          error = 'El RTN de la empresa es obligatorio';
        } else if (value.length !== 14) {
          error = 'El RTN debe tener exactamente 14 dígitos';
        }
        break;
    }

    setErrores(prev => ({ ...prev, [name]: error }));
  };

  const validarCampoSucursal = (name, value) => {
    let error = '';
    // Validaciones específicas por campo
    switch (name) {
      case 'id_empresa_fk':
        if (!value) error = 'Debe seleccionar el tipo de empresa';
        break;
      case 'nombre_sucursal':
        if (!value?.trim()) error = 'El nombre de la sucursal es obligatorio';
        break;
      case 'direccion_sucursal':
        if (!value?.trim()) error = 'La dirección de la sucursal es obligatoria';
        break;
      case 'telefono_sucursal':
        if (!value?.trim()) {
          error = 'El teléfono de la sucursal es obligatorio';
        } else if (value.length < 8) {
          error = 'El teléfono debe tener al menos 8 dígitos';
        }
        break;
    }

    setErrores(prev => ({ ...prev, [name]: error }));
  };

  // Funciones para abrir modales
  const cerrarModalEmpresa = () => {
    setModalEmpresa({ show: false, mode: 'create', data: null });
    setFormDataEmpresa({});
    setErrores({});
  };

  const cerrarModalSucursal = () => {
    setModalSucursal({ show: false, mode: 'create', data: null });
    setFormDataSucursal({});
    setErrores({});
  };

  const [loadingModal, setLoadingModal] = useState(false);

  // Función genérica para refrescar datos después de operaciones
  const refrescarDatos = () => {
    setSearchTerm('');
    cargarDatos();
  };

  // Funciones para eliminar
  const manejarEliminarEmpresa = async (empresa) => {
    await eliminarEmpresa(empresa, refrescarDatos);
  };

  const manejarEliminarSucursal = async (sucursal) => {
    await eliminarSucursal(sucursal, refrescarDatos);
  };

  // Validación de campos de empresa con mensajes específicos
  const validarEmpresa = () => {
    const erroresTemp = {};

    if (!formDataEmpresa.nombre_empresa?.trim()) {
      erroresTemp.nombre_empresa = 'El nombre de la empresa es obligatorio';
    }

    if (!formDataEmpresa.correo_empresa?.trim()) {
      erroresTemp.correo_empresa = 'El correo de la empresa es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formDataEmpresa.correo_empresa)) {
      erroresTemp.correo_empresa = 'El correo no tiene un formato válido';
    }

    if (!formDataEmpresa.telefono_empresa?.trim()) {
      erroresTemp.telefono_empresa = 'El teléfono de la empresa es obligatorio';
    } else if (formDataEmpresa.telefono_empresa.length !== 8) {
      erroresTemp.telefono_empresa = 'El teléfono debe tener 8 dígitos';
    }

    if (!formDataEmpresa.rtn_empresa?.trim()) {
      erroresTemp.rtn_empresa = 'El RTN de la empresa es obligatorio';
    } else if (formDataEmpresa.rtn_empresa.length !== 14) {
      erroresTemp.rtn_empresa = 'El RTN debe tener 14 dígitos';
    }

    setErrores(erroresTemp);
    return Object.keys(erroresTemp).length === 0;
  };

  // Función para guardar empresa
  const guardarEmpresa = async () => {
    if (!validarEmpresa()) {
      return;
    }

    setLoadingModal(true);
    try {
      let resultado;
      if (modalEmpresa.mode === 'edit') {
        resultado = await actualizarRegistro(formDataEmpresa.id_empresa_pk, 'EMPRESA', formDataEmpresa);
      } else {
        resultado = await insertar('EMPRESA', formDataEmpresa);
      }

      if (resultado?.Consulta !== false) {
        cerrarModalEmpresa();
        refrescarDatos();
      } else {
        alert('Error al guardar empresa: ' + (resultado?.error || 'Error desconocido'));
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error al guardar empresa:', error);
      }
      alert('Error al guardar empresa: ' + error.message);
    } finally {
      setLoadingModal(false);
    }
  };

  // Validación de campos de sucursal
  const validarSucursal = () => {
    const erroresTemp = {};

    if (!formDataSucursal.id_empresa_fk) {
      erroresTemp.id_empresa_fk = 'Debe seleccionar el tipo de empresa';
    }

    if (!formDataSucursal.nombre_sucursal?.trim()) {
      erroresTemp.nombre_sucursal = 'El nombre de la sucursal es obligatorio';
    } else {
      // Validar duplicado de nombre de sucursal en la misma empresa
      const nombreNormalizado = formDataSucursal.nombre_sucursal.trim().toUpperCase();
      const empresaActual = empresas.find(e => e.id_empresa_pk === formDataSucursal.id_empresa_fk);

      if (empresaActual && empresaActual.sucursales) {
        const nombreDuplicado = empresaActual.sucursales.some(s => {
          // Si estamos editando, excluir la sucursal actual
          const esSucursalActual = modalSucursal.mode === 'edit' &&
            s.id_sucursal_pk === formDataSucursal.id_sucursal_pk;

          if (esSucursalActual) return false;

          return s.nombre_sucursal.trim().toUpperCase() === nombreNormalizado;
        });

        if (nombreDuplicado) {
          erroresTemp.nombre_sucursal = 'Ya existe una sucursal con este nombre en esta empresa';
        }
      }
    }

    if (!formDataSucursal.direccion_sucursal?.trim()) {
      erroresTemp.direccion_sucursal = 'La dirección de la sucursal es obligatoria';
    }

    if (!formDataSucursal.telefono_sucursal?.trim()) {
      erroresTemp.telefono_sucursal = 'El teléfono de la sucursal es obligatorio';
    } else if (formDataSucursal.telefono_sucursal.length !== 8) {
      erroresTemp.telefono_sucursal = 'El teléfono debe tener 8 dígitos';
    } else {
      // Validar duplicado de teléfono en todas las sucursales
      const telefonoNormalizado = formDataSucursal.telefono_sucursal.trim();
      const telefonoDuplicado = empresas.some(empresa =>
        empresa.sucursales && empresa.sucursales.some(s => {
          // Si estamos editando, excluir la sucursal actual
          const esSucursalActual = modalSucursal.mode === 'edit' &&
            s.id_sucursal_pk === formDataSucursal.id_sucursal_pk;

          if (esSucursalActual) return false;

          return s.telefono_sucursal.trim() === telefonoNormalizado;
        })
      );

      if (telefonoDuplicado) {
        erroresTemp.telefono_sucursal = 'Este número de teléfono ya está registrado en otra sucursal';
      }
    }

    setErrores(erroresTemp);
    return Object.keys(erroresTemp).length === 0;
  };

  // Función para guardar sucursal
  const guardarSucursal = async () => {
    if (!validarSucursal()) {
      return;
    }

    setLoadingModal(true);
    try {
      let resultado;
      if (modalSucursal.mode === 'edit') {
        resultado = await actualizarRegistro(formDataSucursal.id_sucursal_pk, 'SUCURSALES', formDataSucursal);
      } else {
        resultado = await insertar('SUCURSALES', formDataSucursal);
      }

      if (resultado?.Consulta !== false) {
        cerrarModalSucursal();
        refrescarDatos();
      } else {
        alert('Error al guardar sucursal: ' + (resultado?.error || 'Error desconocido'));
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error al guardar sucursal:', error);
      }
      alert('Error al guardar sucursal: ' + error.message);
    } finally {
      setLoadingModal(false);
    }
  };

  const EmptyState = () => (
    <div className="text-center py-12">
      <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-semibold text-gray-700 mb-2 uppercase">No hay empresas</h3>
      <p className="text-gray-500 mb-6">Crea tu primera empresa para gestionar el negocio.</p>

    </div>
  );

  // Preparar datos para DataTable
  const prepararDatosParaTabla = () => {
    const datos = [];

    empresasFiltradas.forEach(empresa => {
      if (!empresa.sucursales || empresa.sucursales.length === 0) {
        // Empresa sin sucursales
        datos.push({
          id: `empresa-${empresa.id_empresa_pk}`,
          tipo: 'empresa_sin_sucursales',
          empresa: empresa,
          sucursal: null,
          nombre_empresa: empresa.nombre_empresa,
          correo_empresa: empresa.correo_empresa,
          telefono_empresa: empresa.telefono_empresa,
          rtn_empresa: empresa.rtn_empresa,
          nombre_sucursal: null,
          direccion_sucursal: null,
          telefono_sucursal: null,
          empresa_info: `${empresa.nombre_empresa} - ${empresa.correo_empresa}`
        });
      } else {
        // Empresa con sucursales
        empresa.sucursales.forEach((sucursal, idx) => {
          datos.push({
            id: `sucursal-${sucursal.id_sucursal_pk}`,
            tipo: 'empresa_con_sucursales',
            empresa: empresa,
            sucursal: sucursal,
            esNuevoGrupo: idx === 0,
            nombre_empresa: empresa.nombre_empresa,
            correo_empresa: empresa.correo_empresa,
            telefono_empresa: empresa.telefono_empresa,
            rtn_empresa: empresa.rtn_empresa,
            nombre_sucursal: sucursal.nombre_sucursal,
            direccion_sucursal: sucursal.direccion_sucursal,
            telefono_sucursal: sucursal.telefono_sucursal,
            empresa_info: `${empresa.nombre_empresa} - ${empresa.correo_empresa}`
          });
        });
      }
    });

    return datos;
  };

  // Templates para las columnas
  const empresaBodyTemplate = (rowData) => {
    const { empresa, tipo, esNuevoGrupo } = rowData;

    // Solo mostrar info de empresa en primera fila del grupo o empresa sin sucursales
    if (tipo === 'empresa_sin_sucursales' || esNuevoGrupo) {
      return (
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border-l-4 border-blue-500">
          <Building2 size={20} className="text-blue-600" />
          <div>
            <div className="font-semibold text-gray-800">{empresa.nombre_empresa}</div>
            <div className="text-xs text-gray-500">
              Email: {empresa.correo_empresa}
            </div>
            <div className="text-xs text-gray-500">
              Teléfono: +504 {empresa.telefono_empresa?.replace(/(\d{4})(\d{4})/, '$1-$2') || empresa.telefono_empresa}
            </div>
            <div className="text-xs text-gray-500">
              RTN: {empresa.rtn_empresa}
            </div>
          </div>
        </div>
      );
    }

    return <div className="text-gray-400 text-sm">↳ Sucursal de {empresa.nombre_empresa}</div>;
  };
// Template para columna de sucursal
  const sucursalBodyTemplate = (rowData) => {
    return rowData.nombre_sucursal ? (
      <span className="font-medium text-gray-800">{rowData.nombre_sucursal}</span>
    ) : (
      <span className="text-gray-400">-</span>
    );
  };

  const direccionBodyTemplate = (rowData) => {
    return rowData.direccion_sucursal ? (
      <span className="text-gray-600 text-sm">{rowData.direccion_sucursal}</span>
    ) : (
      <span className="text-gray-400">-</span>
    );
  };

  const telefonoBodyTemplate = (rowData) => {
    if (!rowData.telefono_sucursal) {
      return <span className="text-gray-400">-</span>;
    }

    // Formatear el teléfono: si viene sin guión, agregarlo (ej: 99998888 -> 9999-8888)
    const telefono = rowData.telefono_sucursal.replace(/(\d{4})(\d{4})/, '$1-$2');

    return <span className="text-gray-600 text-sm">+504 {telefono}</span>;
  };

  const accionesBodyTemplate = (rowData) => {
    const { empresa, sucursal, tipo, esNuevoGrupo } = rowData;

    const acciones = [];

    // 1. Editar Sucursal (si existe)
    if (sucursal) {
      acciones.push({
        label: 'EDITAR SUCURSAL',
        icon: <Edit2 size={14} className="text-blue-600" />,
        onClick: () => abrirModalSucursal('edit', sucursal, empresa)

      });
    }

    // 2. Editar Empresa (solo en primera fila del grupo o empresa sin sucursales)
    if (tipo === 'empresa_sin_sucursales' || esNuevoGrupo) {
      acciones.push({
        label: 'EDITAR EMPRESA',
        icon: <Edit2 size={14} className="text-blue-600" />,
        onClick: () => abrirModalEmpresa('edit', empresa)
      });
    }

    // 3. Eliminar Sucursal (si existe)
    if (sucursal) {
      acciones.push({
        label: 'ELIMINAR SUCURSAL',
        icon: <Trash2 size={14} className="text-red-600" />,
        onClick: () => manejarEliminarSucursal(sucursal)
      });
    }

    // 4. Eliminar Empresa (solo en primera fila del grupo o empresa sin sucursales)
    if (tipo === 'empresa_sin_sucursales' || esNuevoGrupo) {
      acciones.push({
        label: 'ELIMINAR EMPRESA',
        icon: <Trash2 size={14} className="text-red-700" />,
        onClick: () => manejarEliminarEmpresa(empresa)
      });
    }

    return (
      <ActionMenu
        rowIndex={0}
        totalRows={1}
        actions={acciones}
      />
    );
  };

  return (

    <div className="min-h-screen p-6 bg-gray-50" style={{ fontFamily: 'Poppins' }}>
    <div className="min-h-screen p-6 bg-gray-50" style={{ fontFamily: 'Poppins' }}>
      {/* Título */}
      <div
        className="rounded-xl p-6 mb-3 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/H8.jpg")',
          backgroundColor: '#C7E4E2',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right center',
          boxShadow: '0 0 8px #C7E4E240, 0 0 0 1px #C7E4E233'
        }}
      >
        <div className="flex justify-center items-center">
          <h2 className="text-2xl font-black text-center text-black">
            GESTIÓN DE EMPRESAS
          </h2>
        </div>
        <p className="text-center text-black italic mt-2">
          Administra empresas y sucursales del sistema
        </p>
      </div>

      {/* Sección Principal */}
      <div className="bg-white rounded-lg p-6 mb-6" style={{boxShadow: '0 0 8px #C7E4E240, 0 0 0 1px #C7E4E233'}}>
        {/* Barra de búsqueda + botones */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-80">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar empresas o sucursales..."
              className="w-full px-4 py-2 border rounded-full"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2 text-gray-500"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              className="bg-[#C7E4E2] text-black px-6 py-2 rounded hover:bg-[#A3D2CA4] transition-colors flex items-center gap-2"
              onClick={() => abrirModalEmpresa('create')}
            >
              <Plus size={16} />
              NUEVA EMPRESA
            </button>
            <button
              onClick={() => {
                if (!empresas?.length) {
                  alert('Primero debe crear al menos una empresa para poder agregar sucursales');
                  return;
                }
                // Abrir modal con lista de empresas disponibles
                abrirModalSucursal('create', null, null);
              }}
              disabled={!empresas?.length}
              className={`${
                !empresas?.length
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#C7E4E2] hover:bg-[#A3D2CA]'
              } text-black px-6 py-2 rounded transition-colors flex items-center gap-2`}
            >
              <Plus size={16} />
              NUEVA SUCURSAL
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <span className="ml-3 text-gray-600">Cargando datos...</span>
          </div>
        ) : (
          <DataTable
            value={prepararDatosParaTabla()}
            loading={loading}
            loadingIcon={() => (
              <div className="flex items-center justify-center space-x-2 py-8 text-gray-500">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                <span>Cargando datos...</span>
              </div>
            )}
            globalFilter={searchTerm}
            globalFilterFields={['nombre_empresa', 'correo_empresa', 'telefono_empresa', 'rtn_empresa', 'nombre_sucursal', 'direccion_sucursal', 'telefono_sucursal']}
            showGridlines
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 20, 25]}
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            tableStyle={{ minWidth: '50rem' }}
            className="mt-4"
            size="small"
            emptyMessage={
              searchTerm ? (
                <div className="p-6 text-center">
                  <Search size={48} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    No se encontraron resultados
                  </h3>
                  <p className="text-gray-500">
                    No hay empresas o sucursales que coincidan con "{searchTerm}"
                  </p>
                </div>
              ) : (
                <div className="p-6">
                  <EmptyState />
                </div>
              )
            }
          >
            <Column
              field="empresa_info"
              header="EMPRESA"
              body={empresaBodyTemplate}
              sortable
              className="w-[300px]"
            />
            <Column
              field="nombre_sucursal"
              header="SUCURSAL"
              body={sucursalBodyTemplate}
              sortable
              className="w-[200px]"
            />
            <Column
              field="direccion_sucursal"
              header="DIRECCIÓN"
              body={direccionBodyTemplate}
              sortable
              className="w-[250px]"
            />
            <Column
              field="telefono_sucursal"
              header="CELULAR"
              body={telefonoBodyTemplate}
              sortable
              className="w-[150px]"
            />
            <Column
              header="ACCIONES"
              body={accionesBodyTemplate}
              className="w-[120px] text-center"
              style={{ position: 'relative', overflow: 'visible' }}
            />
          </DataTable>
        )}
      </div>

      {/* Modal Agregar/Editar Empresa */}
      {modalEmpresa.show && (
        <ModalAgregarEmpresa
          visible={modalEmpresa.show}
          onHide={cerrarModalEmpresa}
          formData={formDataEmpresa}
          onChange={handleChangeEmpresa}
          onBlur={handleBlurEmpresa}
          onSave={guardarEmpresa}
          loading={loadingModal}
          editando={modalEmpresa.mode === 'edit'}
          errores={errores}
        />
      )}

      {/* Modal Agregar/Editar Sucursal */}
      {modalSucursal.show && (
        <ModalAgregarSucursal
          visible={modalSucursal.show}
          onHide={cerrarModalSucursal}
          formData={formDataSucursal}
          onChange={handleChangeSucursal}
          onBlur={handleBlurSucursal}
          onSave={guardarSucursal}
          loading={loadingModal}
          editando={modalSucursal.mode === 'edit'}
          errores={errores}
          empresas={empresas}
        />
      )}
    </div>
  </div>
  );
}
