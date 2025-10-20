import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as freeSolidSvgIcons from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { insertar, ver, actualizarRegistro } from '../../../AXIOS.SERVICES/empresa-axios';
import ModalAgregarSucursal, { BotonAgregarSucursal } from './modal-agregar-sucursal';
import { BotonEditarSucursal } from './modal-editar-sucursal';
import { BotonEliminarSucursal } from './modal-eliminar-sucursal';

export default function Sucursales() {
  const [loading, setLoading] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [sucursalEditando, setSucursalEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [errores, setErrores] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  
  const [formSucursal, setFormSucursal] = useState({
    nombre_sucursal: '',
    direccion_sucursal: '',
    telefono_sucursal: '',
    id_empresa_fk: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Cargar empresas desde la API
      const empresasData = await ver('EMPRESA');
      setEmpresas(empresasData || []);

      // Cargar sucursales desde la API
      const sucursalesData = await ver('SUCURSALES');
      setSucursales(sucursalesData || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos de sucursales'
      });
    }
  };

  const handleChangeSucursal = (e) => {
    setFormSucursal({ ...formSucursal, [e.target.name]: e.target.value });
    // Limpiar errores mientras el usuario escribe
    if (errores[e.target.name]) {
      setErrores({ ...errores, [e.target.name]: '' });
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formSucursal.nombre_sucursal.trim()) {
      nuevosErrores.nombre_sucursal = 'El nombre de la sucursal es obligatorio';
    }

    if (!formSucursal.direccion_sucursal.trim()) {
      nuevosErrores.direccion_sucursal = 'La dirección es obligatoria';
    }

    if (!formSucursal.telefono_sucursal.trim()) {
      nuevosErrores.telefono_sucursal = 'El teléfono es obligatorio';
    }

    if (!formSucursal.id_empresa_fk) {
      nuevosErrores.id_empresa_fk = 'Debe seleccionar una empresa';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const limpiarFormulario = () => {
    setFormSucursal({
      nombre_sucursal: '',
      direccion_sucursal: '',
      telefono_sucursal: '',
      id_empresa_fk: ''
    });
    setErrores({});
    setModoEdicion(false);
    setSucursalEditando(null);
  };

  const handleClose = () => {
    limpiarFormulario();
    setMostrarFormulario(false);
  };

  const handleNuevaSucursal = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const handleactualizarSucursal = (sucursal) => {
    setFormSucursal({
      nombre_sucursal: sucursal.nombre_sucursal,
      direccion_sucursal: sucursal.direccion_sucursal,
      telefono_sucursal: sucursal.telefono_sucursal,
      id_empresa_fk: sucursal.id_empresa_fk
    });
    setSucursalEditando(sucursal);
    setModoEdicion(true);
    setMostrarFormulario(true);
  };



  const handleSubmit = async () => {
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      let resultado;
      
      if (modoEdicion) {
        // Actualizar sucursal existente
        resultado = await actualizarRegistro(sucursalEditando.id_sucursal_pk, 'SUCURSALES', formSucursal);
      } else {
        // Crear nueva sucursal
        resultado = await insertar('SUCURSALES', formSucursal);
      }

      if (resultado.Consulta) {
        Swal.fire({
          icon: 'success',
          title: modoEdicion ? 'Actualizada' : 'Creada',
          text: modoEdicion ? 'La sucursal ha sido actualizada exitosamente' : 'La sucursal ha sido creada exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
        
        handleClose();
        cargarDatos(); // Recargar datos
      } else {
        throw new Error(resultado.error || 'Error en la operación');
      }
    } catch (error) {
      console.error('Error al guardar sucursal:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la sucursal'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">

        {/* Controles superiores */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-80">
            <input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar sucursales..."
              className="w-full px-4 py-2 border rounded-full"
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter('')}
                className="absolute right-3 top-2 text-gray-500"
              >
                ×
              </button>
            )}
          </div>
          
          <BotonAgregarSucursal 
            onClick={handleNuevaSucursal}
            loading={loading}
          />
        </div>

        {/* Lista de sucursales existentes */}
        <div className="space-y-4 mb-6">
          {sucursales.filter(sucursal => 
            sucursal.nombre_sucursal.toLowerCase().includes(globalFilter.toLowerCase()) ||
            sucursal.direccion_sucursal.toLowerCase().includes(globalFilter.toLowerCase()) ||
            sucursal.telefono_sucursal.toLowerCase().includes(globalFilter.toLowerCase()) ||
            (sucursal.nombre_empresa && sucursal.nombre_empresa.toLowerCase().includes(globalFilter.toLowerCase()))
          ).map((sucursal) => (
          <div key={sucursal.id_sucursal_pk} className="bg-blue-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="mb-2">
                  <h4 className="font-semibold text-gray-900">{sucursal.nombre_sucursal}</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={freeSolidSvgIcons.faMapMarkerAlt} className="w-3 h-3" />
                    {sucursal.direccion_sucursal}
                  </div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={freeSolidSvgIcons.faPhone} className="w-3 h-3" />
                    {sucursal.telefono_sucursal}
                  </div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={freeSolidSvgIcons.faBuilding} className="w-3 h-3" />
                    {sucursal.nombre_empresa}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <BotonEditarSucursal 
                  sucursal={sucursal}
                  onEdit={handleactualizarSucursal}
                />
                <BotonEliminarSucursal 
                  sucursal={sucursal}
                  onReload={cargarDatos}
                />
              </div>
            </div>
          </div>
          ))}
        
          {sucursales.filter(sucursal => 
            sucursal.nombre_sucursal.toLowerCase().includes(globalFilter.toLowerCase()) ||
            sucursal.direccion_sucursal.toLowerCase().includes(globalFilter.toLowerCase()) ||
            sucursal.telefono_sucursal.toLowerCase().includes(globalFilter.toLowerCase()) ||
            (sucursal.nombre_empresa && sucursal.nombre_empresa.toLowerCase().includes(globalFilter.toLowerCase()))
          ).length === 0 && sucursales.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              <FontAwesomeIcon icon={freeSolidSvgIcons.faSearch} className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No se encontraron sucursales</p>
              <p className="text-sm">Intenta con otros términos de búsqueda</p>
            </div>
          )}
        
          {sucursales.length === 0 && (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={freeSolidSvgIcons.faStore} className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay sucursales registradas</h3>
              <p className="text-gray-500 mb-6">Crea tu primera sucursal para comenzar.</p>
              <BotonAgregarSucursal 
                onClick={handleNuevaSucursal}
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal Modular */}
      <ModalAgregarSucursal 
        visible={mostrarFormulario}
        onHide={handleClose}
        formData={formSucursal}
        onChange={handleChangeSucursal}
        onSave={handleSubmit}
        loading={loading}
        editando={modoEdicion}
        errores={errores}
        empresas={empresas}
      />
    </div>
  );
}