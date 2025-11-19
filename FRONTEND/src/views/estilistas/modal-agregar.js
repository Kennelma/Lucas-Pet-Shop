import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { Button } from 'primereact/button';
import Swal from 'sweetalert2';
import { insertarEstilista } from '../../AXIOS.SERVICES/employees-axios';

const ModalAgregarEstilista = ({ isOpen, onClose, onSave, estilistas = [] }) => {
  const [formData, setFormData] = useState({
    nombre_estilista: '',
    apellido_estilista: '',
    identidad_estilista: ''
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [identidadDuplicada, setIdentidadDuplicada] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre_estilista: '',
        apellido_estilista: '',
        identidad_estilista: ''
      });
      setErrores({});
      setIdentidadDuplicada(false);
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    const val = ['nombre_estilista', 'apellido_estilista'].includes(field) ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [field]: val }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errores[field]) {
      setErrores(prev => ({ ...prev, [field]: '' }));
    }

    // Validación en tiempo real para identidad duplicada
    if (field === 'identidad_estilista') {
      verificarIdentidadDuplicada(value);
    }
  };

  const verificarIdentidadDuplicada = (identidad) => {
    if (!identidad || identidad.includes('_')) {
      setIdentidadDuplicada(false);
      return false;
    }

    const existe = estilistas.some(
      est => est.identidad_estilista === identidad
    );

    setIdentidadDuplicada(existe);
    return existe;
  };

  const validarFormulario = () => {
    let temp = {};
    
    if (!formData.nombre_estilista?.trim()) {
      temp.nombre_estilista = 'El nombre es obligatorio';
    } else if (formData.nombre_estilista.trim().length < 2) {
      temp.nombre_estilista = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!formData.apellido_estilista?.trim()) {
      temp.apellido_estilista = 'El apellido es obligatorio';
    } else if (formData.apellido_estilista.trim().length < 2) {
      temp.apellido_estilista = 'El apellido debe tener al menos 2 caracteres';
    }
    
    if (!formData.identidad_estilista?.trim()) {
      temp.identidad_estilista = 'La identidad es requerida';
    } else if (!/^[0-9]{4}-[0-9]{4}-[0-9]{5}$/.test(formData.identidad_estilista)) {
      temp.identidad_estilista = 'La identidad debe tener el formato 0000-0000-00000';
    } else if (verificarIdentidadDuplicada(formData.identidad_estilista)) {
      temp.identidad_estilista = 'Esta identidad ya está registrada';
    }

    setErrores(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) {
      // Mostrar notificación de campos incompletos
      Swal.fire({
        icon: 'warning',
        title: 'Campos Incompletos',
        text: 'Por favor completa todos los campos correctamente',
        confirmButtonColor: '#f59e0b',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Confirmación antes de guardar
    const confirmacion = await Swal.fire({
      title: '¿Confirmar registro?',
      html: `
        <div class="text-left">
          <p><strong>Nombre:</strong> ${formData.nombre_estilista}</p>
          <p><strong>Apellido:</strong> ${formData.apellido_estilista}</p>
          <p><strong>Identidad:</strong> ${formData.identidad_estilista}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Revisar'
    });

    if (!confirmacion.isConfirmed) return;

    setLoading(true);
    try {
      // Verificar duplicado antes de enviar al backend
      if (verificarIdentidadDuplicada(formData.identidad_estilista)) {
        await Swal.fire({
          icon: 'error',
          title: 'Identidad Duplicada',
          text: 'Esta identidad ya está registrada en el sistema',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'Entendido'
        });
        setLoading(false);
        return;
      }

      const response = await insertarEstilista(formData);
      
      if (response && response.Consulta) {
        await Swal.fire({
          icon: 'success',
          title: '¡Estilista Agregado!',
          html: `
            <p class="text-lg font-semibold text-green-600">
              ${formData.nombre_estilista} ${formData.apellido_estilista}
            </p>
            <p class="text-sm text-gray-600 mt-2">
              Ha sido registrado exitosamente en el sistema
            </p>
          `,
          timer: 2000,
          showConfirmButton: false
        });
        
        setFormData({
          nombre_estilista: '',
          apellido_estilista: '',
          identidad_estilista: ''
        });
        
        onSave();
        onClose();
      } else {
        const errorTipo = response?.errorTipo;
        
        // Usar el tipo de error para mostrar mensaje específico
        if (errorTipo === 'IDENTIDAD_DUPLICADA') {
          await Swal.fire({
            icon: 'error',
            title: 'Identidad Duplicada',
            text: 'Esta identidad ya está registrada en el sistema',
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Entendido'
          });
          setErrores(prev => ({ ...prev, identidad_estilista: 'Identidad ya registrada' }));
          setIdentidadDuplicada(true);
        } else if (errorTipo === 'ERROR_SERVIDOR') {
          await Swal.fire({
            icon: 'error',
            title: 'Error del Servidor',
            html: `
              <p class="mb-2">Hubo un problema al procesar la solicitud.</p>
              <p class="text-sm text-gray-600">Posibles causas:</p>
              <ul class="text-sm text-left mt-2">
                <li>• La identidad ya está registrada</li>
                <li>• Error interno del servidor</li>
                <li>• Base de datos no disponible</li>
              </ul>
              <p class="text-xs text-gray-500 mt-3">Por favor, intenta nuevamente</p>
            `,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Entendido'
          });
        } else if (errorTipo === 'DATOS_INVALIDOS') {
          await Swal.fire({
            icon: 'warning',
            title: 'Datos Inválidos',
            text: 'Los datos ingresados no son válidos. Verifica e intenta nuevamente.',
            confirmButtonColor: '#f59e0b',
            confirmButtonText: 'Entendido'
          });
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Error al Guardar',
            text: response?.error || 'No se pudo agregar el estilista',
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Entendido'
          });
        }
      }
    } catch (error) {
      // Verificar primero si es identidad duplicada localmente
      if (verificarIdentidadDuplicada(formData.identidad_estilista)) {
        await Swal.fire({
          icon: 'error',
          title: 'Identidad Duplicada',
          text: 'Esta identidad ya está registrada en el sistema',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'Entendido'
        });
        setErrores(prev => ({ ...prev, identidad_estilista: 'Identidad ya registrada' }));
        setIdentidadDuplicada(true);
      } else if (error.response?.status === 500 || 
                 error.message?.includes('500') ||
                 error.toString().includes('500')) {
        // Error 500 sin verificación local - asumir duplicado o error del servidor
        await Swal.fire({
          icon: 'error',
          title: 'Error al Guardar',
          html: `
            <p class="mb-2">No se pudo agregar el estilista.</p>
            <p class="text-sm text-gray-600">Posibles causas:</p>
            <ul class="text-sm text-left mt-2">
              <li>• La identidad ya está registrada</li>
              <li>• Error en el servidor</li>
              <li>• Datos inválidos</li>
            </ul>
            <p class="text-xs text-gray-500 mt-3">Verifica los datos e intenta nuevamente</p>
          `,
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'Entendido'
        });
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error de Conexión',
          text: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'Entendido'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3 mt-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text p-button-rounded"
        onClick={onClose}
        disabled={loading}
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        className="p-button-success p-button-rounded"
        onClick={handleSubmit}
        loading={loading}
        disabled={identidadDuplicada}
      />
    </div>
  );

  return (
    <Dialog
      header={<div className="w-full text-center text-lg font-bold">NUEVO ESTILISTA</div>}
      visible={isOpen}
      style={{ width: '28rem', borderRadius: '1.5rem', zIndex: 9999 }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
      baseZIndex={9999}
      appendTo="self"
    >
      {/* Formulario */}
      <div className="flex flex-col gap-3">
        {/* Nombre */}
        <span>
          <label htmlFor="nombre" className="text-xs font-poppins text-gray-700 mb-1 block">
            NOMBRE <span className="text-red-500">*</span>
          </label>
          <InputText
            id="nombre"
            name="nombre"
            value={formData.nombre_estilista}
            onChange={(e) => handleChange('nombre_estilista', e.target.value)}
            className={`w-full rounded-xl h-9 text-sm ${errores.nombre_estilista ? 'border-red-500' : ''}`}
            placeholder="Ej: Juan Carlos"
            autoFocus
          />
          {errores.nombre_estilista && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <i className="pi pi-exclamation-circle"></i>
              {errores.nombre_estilista}
            </p>
          )}
        </span>

        {/* Apellido */}
        <span>
          <label htmlFor="apellido" className="text-xs font-poppins text-gray-700 mb-1 block">
            APELLIDO <span className="text-red-500">*</span>
          </label>
          <InputText
            id="apellido"
            name="apellido"
            value={formData.apellido_estilista}
            onChange={(e) => handleChange('apellido_estilista', e.target.value)}
            className={`w-full rounded-xl h-9 text-sm ${errores.apellido_estilista ? 'border-red-500' : ''}`}
            placeholder="Ej: González López"
          />
          {errores.apellido_estilista && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <i className="pi pi-exclamation-circle"></i>
              {errores.apellido_estilista}
            </p>
          )}
        </span>

        {/* Identidad */}
        <span>
          <label htmlFor="identidad_estilista" className="text-xs font-poppins text-gray-700 mb-1 block">
            IDENTIDAD <span className="text-red-500">*</span>
          </label>
          <InputMask
            id="identidad_estilista"
            name="identidad_estilista"
            value={formData.identidad_estilista}
            onChange={(e) => handleChange('identidad_estilista', e.value)}
            mask="9999-9999-99999"
            placeholder="0000-0000-00000"
            className={`w-full rounded-xl h-9 text-sm ${
              errores.identidad_estilista || identidadDuplicada ? 'border-red-500' : ''
            } ${identidadDuplicada ? 'bg-red-50' : ''}`}
            autoComplete="off"
          />
          {identidadDuplicada && !errores.identidad_estilista && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <i className="pi pi-times-circle"></i>
              Esta identidad ya está registrada
            </p>
          )}
          {errores.identidad_estilista && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <i className="pi pi-exclamation-circle"></i>
              {errores.identidad_estilista}
            </p>
          )}
        </span>
      </div>
    </Dialog>
  );
};

export default ModalAgregarEstilista;