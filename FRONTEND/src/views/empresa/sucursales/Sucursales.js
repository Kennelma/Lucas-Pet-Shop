import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as freeSolidSvgIcons from '@fortawesome/free-solid-svg-icons';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import Swal from 'sweetalert2';
import { insertar, ver, eliminarRegistro, actualizarRegistro } from '../../../AXIOS.SERVICES/empresa-axios';

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

  const handleEliminarSucursal = async (sucursal) => {
    const result = await Swal.fire({
      title: '¿Eliminar sucursal?',
      html: `
        <div class="text-left my-2 p-2.5 bg-gray-50 rounded-md text-xs">
          <p class="mb-1 text-sm"><span class="font-bold">Nombre:</span> ${sucursal.nombre_sucursal}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Dirección:</span> ${sucursal.direccion_sucursal}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Teléfono:</span> ${sucursal.telefono_sucursal}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      width: 380,
      padding: '16px'
    });

    if (result.isConfirmed) {
      try {
        const resultado = await eliminarRegistro(sucursal.id_sucursal_pk, 'SUCURSALES');
        
        if (resultado.Consulta) {
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'La sucursal ha sido eliminada exitosamente',
            timer: 2000,
            showConfirmButton: false
          });
          cargarDatos(); // Recargar datos
        } else {
          throw new Error(resultado.error || 'Error al eliminar');
        }
      } catch (error) {
        console.error('Error al eliminar sucursal:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la sucursal'
        });
      }
    }
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
          
          <button
            onClick={handleNuevaSucursal}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={freeSolidSvgIcons.faPlus} />
            Nueva Sucursal
          </button>
        </div>

        {/* Lista de sucursales existentes */}
        <div className="space-y-4 mb-6">
          {sucursales.filter(sucursal => 
            sucursal.nombre_sucursal.toLowerCase().includes(globalFilter.toLowerCase()) ||
            sucursal.direccion_sucursal.toLowerCase().includes(globalFilter.toLowerCase()) ||
            sucursal.telefono_sucursal.toLowerCase().includes(globalFilter.toLowerCase()) ||
            (sucursal.nombre_empresa && sucursal.nombre_empresa.toLowerCase().includes(globalFilter.toLowerCase()))
          ).map((sucursal) => (
          <div key={sucursal.id_sucursal_pk} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
                <button
                  onClick={() => handleactualizarSucursal(sucursal)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-colors"
                >
                  <FontAwesomeIcon icon={freeSolidSvgIcons.faEdit} className="w-3 h-3" />
                  Editar
                </button>
                <button
                  onClick={() => handleEliminarSucursal(sucursal)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-colors"
                >
                  <FontAwesomeIcon icon={freeSolidSvgIcons.faTrash} className="w-3 h-3" />
                  Eliminar
                </button>
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
              <button 
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors inline-flex items-center gap-2"
                onClick={handleNuevaSucursal}
              >
                <FontAwesomeIcon icon={freeSolidSvgIcons.faPlus} />
                Nueva Sucursal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal PrimeReact */}
      <Dialog
        header={
          <div className="w-full text-center text-lg font-bold">
            {modoEdicion ? 'EDITAR SUCURSAL' : 'NUEVA SUCURSAL'}
          </div>
        }
        visible={mostrarFormulario}
        style={{ width: '28rem', borderRadius: '1.5rem' }}
        modal
        closable={false}
        onHide={handleClose}
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              onClick={handleClose}
              className="p-button-text p-button-secondary"
              disabled={loading}
            />
            <Button
              label={loading ? (modoEdicion ? 'Actualizando...' : 'Guardando...') : (modoEdicion ? 'Actualizar' : 'Guardar')}
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
              onClick={handleSubmit}
              className="p-button-success"
              loading={loading}
              disabled={loading}
            />
          </div>
        }
        position="center"
        dismissableMask={false}
        draggable={false}
        resizable={false}
      >
        <div className="mt-2">
          <div className="flex flex-col gap-3">
            <span>
              <label htmlFor="id_empresa_fk" className="text-xs font-semibold text-gray-700 mb-1">Empresa</label>
              <Dropdown
                id="id_empresa_fk"
                name="id_empresa_fk"
                value={formSucursal.id_empresa_fk}
                options={empresas}
                onChange={(e) => handleChangeSucursal({ target: { name: 'id_empresa_fk', value: e.value } })}
                optionLabel="nombre_empresa"
                optionValue="id_empresa_pk"
                placeholder="Seleccionar empresa..."
                className="w-full rounded-xl h-9"
                panelClassName="rounded-xl"
              />
              {errores.id_empresa_fk && <p className="text-xs text-red-600 mt-1">{errores.id_empresa_fk}</p>}
            </span>

            {/* Nombre de la Sucursal */}
            <span>
              <label htmlFor="nombre_sucursal" className="text-xs font-semibold text-gray-700 mb-1">Nombre de la sucursal</label>
              <InputText
                id="nombre_sucursal"
                name="nombre_sucursal"
                value={formSucursal.nombre_sucursal}
                onChange={handleChangeSucursal}
                className="w-full rounded-xl h-9 text-sm uppercase"
                placeholder="Ej: Sucursal Norte"
              />
              {errores.nombre_sucursal && <p className="text-xs text-red-600 mt-1">{errores.nombre_sucursal}</p>}
            </span>

            {/* Dirección */}
            <span>
              <label htmlFor="direccion_sucursal" className="text-xs font-semibold text-gray-700 mb-1">Dirección</label>
              <InputText
                id="direccion_sucursal"
                name="direccion_sucursal"
                value={formSucursal.direccion_sucursal}
                onChange={handleChangeSucursal}
                className="w-full rounded-xl h-9 text-sm uppercase"
                placeholder="Ej: Barrio El Carmen"
              />
              {errores.direccion_sucursal && <p className="text-xs text-red-600 mt-1">{errores.direccion_sucursal}</p>}
            </span>

            {/* Teléfono */}
            <span>
              <label htmlFor="telefono_sucursal" className="text-xs font-semibold text-gray-700 mb-1">TELÉFONO</label>
              <InputText
                id="telefono_sucursal"
                name="telefono_sucursal"
                value={formSucursal.telefono_sucursal}
                onChange={handleChangeSucursal}
                className="w-full rounded-xl h-9 text-sm uppercase"
                placeholder="Ej: 9999-8888"
              />
              {errores.telefono_sucursal && <p className="text-xs text-red-600 mt-1">{errores.telefono_sucursal}</p>}
            </span>
          </div>
        </div>
      </Dialog>
    </div>
  );
}