import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { ver, insertar, actualizarRegistro } from '../../AXIOS.SERVICES/empresa-axios';

// Importar modales reales
import ModalAgregarEmpresa from './informacion-empresa/modal-agregar-empresa';
import ModalAgregarSucursal from './sucursales/modal-agregar-sucursal';

// Importar funciones de eliminación existentes
import { eliminarEmpresa } from './informacion-empresa/modal-eliminar-empresa';
import { eliminarSucursal } from './sucursales/modal-eliminar-sucursal';

export default function GestionEmpresa() {
  const [empresas, setEmpresas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para modales unificados
  // modalEmpresa: { show: boolean, mode: 'create'|'edit', data: empresa_object|null }
  const [modalEmpresa, setModalEmpresa] = useState({ show: false, mode: 'create', data: null });
  
  // modalSucursal: { show: boolean, mode: 'create'|'edit', data: { sucursal_object, empresaData, empresasDisponibles } }
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
      
      // Combinar empresas con sus sucursales
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

  // Validación individual de campos al perder el foco
  const validarCampoEmpresa = (name, value) => {
    let error = '';
    
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
        } else if (value.length < 10) {
          error = 'El RTN debe tener al menos 10 caracteres';
        }
        break;
    }
    
    setErrores(prev => ({ ...prev, [name]: error }));
  };

  const validarCampoSucursal = (name, value) => {
    let error = '';
    
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
    } else if (formDataEmpresa.telefono_empresa.length < 8) {
      erroresTemp.telefono_empresa = 'El teléfono debe tener al menos 8 dígitos';
    }
    
    if (!formDataEmpresa.rtn_empresa?.trim()) {
      erroresTemp.rtn_empresa = 'El RTN de la empresa es obligatorio';
    } else if (formDataEmpresa.rtn_empresa.length < 10) {
      erroresTemp.rtn_empresa = 'El RTN debe tener al menos 10 caracteres';
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

  // Validación de campos de sucursal con mensajes específicos
  const validarSucursal = () => {
    const erroresTemp = {};
    
    if (!formDataSucursal.id_empresa_fk) {
      erroresTemp.id_empresa_fk = 'Debe seleccionar el tipo de empresa';
    }
    
    if (!formDataSucursal.nombre_sucursal?.trim()) {
      erroresTemp.nombre_sucursal = 'El nombre de la sucursal es obligatorio';
    }
    
    if (!formDataSucursal.direccion_sucursal?.trim()) {
      erroresTemp.direccion_sucursal = 'La dirección de la sucursal es obligatoria';
    }
    
    if (!formDataSucursal.telefono_sucursal?.trim()) {
      erroresTemp.telefono_sucursal = 'El teléfono de la sucursal es obligatorio';
    } else if (formDataSucursal.telefono_sucursal.length < 8) {
      erroresTemp.telefono_sucursal = 'El teléfono debe tener al menos 8 dígitos';
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
      <button
        className="bg-purple-500 text-white px-6 py-3 rounded hover:bg-purple-600 transition-colors inline-flex items-center gap-2"
        onClick={() => abrirModalEmpresa('create')}
      >
        <Plus size={16} />
        NUEVA EMPRESA
      </button>
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Título */}
      <div
        className="rounded-xl p-6 mb-3 bg-cover bg-center"
        style={{
          backgroundImage: 'url("/H8.jpg")',
          backgroundColor: '#C7E4E2',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right center',
          boxShadow: '0 0 8px #FF9A9840, 0 0 0 1px #FF9A9833'
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
      <div className="bg-white rounded-lg p-6 mb-6" style={{boxShadow: '0 0 8px #FF9A9840, 0 0 0 1px #FF9A9833'}}>
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
              className="bg-rose-300 text-black px-6 py-2 rounded hover:bg-rose-600 transition-colors flex items-center gap-2"
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
                  : 'bg-rose-300 hover:bg-rose-600'
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
        ) : empresasFiltradas.length === 0 ? (
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
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Empresa</th>
                    <th className="px-6 py-4 text-left font-semibold">Sucursal</th>
                    <th className="px-6 py-4 text-left font-semibold">Dirección</th>
                    <th className="px-6 py-4 text-left font-semibold">Teléfono</th>
                    <th className="px-6 py-4 text-center font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empresasFiltradas.flatMap(empresa => {
                    const filas = [];
                    
                    // Si la empresa no tiene sucursales, mostrar solo la empresa
                    if (!empresa.sucursales || empresa.sucursales.length === 0) {
                      filas.push(
                        <tr
                          key={`empresa-${empresa.id_empresa_pk}`}
                          className="border-b border-gray-200 hover:bg-blue-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-bold text-gray-800 bg-gray-50 border-r-2 border-blue-200">
                            <div className="flex items-center gap-2">
                              <Building2 size={20} className="text-blue-600" />
                              <div>
                                <div className="font-semibold">{empresa.nombre_empresa}</div>
                                <div className="text-xs text-gray-500 font-normal">
                                  Email: {empresa.correo_empresa}
                                </div>
                                <div className="text-xs text-gray-500 font-normal">
                                  Teléfono: {empresa.telefono_empresa}
                                </div>
                                <div className="text-xs text-gray-500 font-normal">
                                  RTN: {empresa.rtn_empresa}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500">-</td>
                          <td className="px-6 py-4 text-gray-500">-</td>
                          <td className="px-6 py-4 text-gray-500">-</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button 
                                onClick={() => abrirModalEmpresa('edit', empresa)}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                                title="Editar empresa"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => manejarEliminarEmpresa(empresa)}
                                className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                title="Eliminar empresa"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    } else {
                      // Si tiene sucursales, agregar filas como en el diseño original
                      empresa.sucursales.forEach((sucursal, idx) => {
                        filas.push(
                          <tr
                            key={`sucursal-${sucursal.id_sucursal_pk}`}
                            className="border-b border-gray-200 hover:bg-blue-50 transition-colors"
                          >
                            {idx === 0 && (
                              <td
                                rowSpan={empresa.sucursales.length}
                                className="px-6 py-4 font-bold text-gray-800 bg-gray-50 border-r-2 border-blue-200"
                              >
                                <div className="flex items-center gap-2">
                                  <Building2 size={20} className="text-blue-600" />
                                  <div>
                                    <div className="font-semibold">{empresa.nombre_empresa}</div>
                                    <div className="text-xs text-gray-500 font-normal">
                                      Email: {empresa.correo_empresa}
                                    </div>
                                    <div className="text-xs text-gray-500 font-normal">
                                      Teléfono: {empresa.telefono_empresa}
                                    </div>
                                    <div className="text-xs text-gray-500 font-normal">
                                      RTN: {empresa.rtn_empresa}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            )}
                            <td className="px-6 py-4 font-medium text-gray-800">
                              {sucursal.nombre_sucursal}
                            </td>
                            <td className="px-6 py-4 text-gray-600 text-sm">
                              {sucursal.direccion_sucursal}
                            </td>
                            <td className="px-6 py-4 text-gray-600 text-sm">
                              {sucursal.telefono_sucursal}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-1">
                                {/* Acciones de Sucursal */}
                                <div className="flex gap-1 mr-1">
                                  <button 
                                    onClick={() => abrirModalSucursal('edit', sucursal, empresa)}
                                    className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors" 
                                    title="Editar sucursal"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => manejarEliminarSucursal(sucursal)}
                                    className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                    title="Eliminar sucursal"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                                
                                {/* Acciones de Empresa (solo en la primera fila) */}
                                {idx === 0 && (
                                  <>
                                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                                    <div className="flex gap-1">
                                      <button 
                                        onClick={() => abrirModalEmpresa('edit', empresa)}
                                        className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
                                        title="Editar empresa"
                                      >
                                        <Building2 size={16} />
                                      </button>
                                      <button 
                                        onClick={() => manejarEliminarEmpresa(empresa)}
                                        className="text-red-700 hover:text-red-900 p-1 rounded transition-colors"
                                        title="Eliminar empresa"
                                      >
                                        <Building2 size={16} />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    }

                    return filas;
                  })}
                </tbody>
              </table>
            </div>
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
  );
}
