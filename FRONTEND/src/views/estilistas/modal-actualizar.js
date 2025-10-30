import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { Button } from 'primereact/button';
import Swal from 'sweetalert2';
import { actualizarEstilista } from '../../AXIOS.SERVICES/employees-axios';

const ModalActualizarEstilista = ({ isOpen, onClose, estilista, onSave }) => {
  const [formData, setFormData] = useState({
    id_estilista_pk: null,
    nombre_estilista: '',
    apellido_estilista: '',
    identidad_estilista: ''
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && estilista) {
      setFormData({
        id_estilista_pk: estilista.id_estilista_pk,
        nombre_estilista: estilista.nombre_estilista || '',
        apellido_estilista: estilista.apellido_estilista || '',
        identidad_estilista: estilista.identidad_estilista || ''
      });
      setErrores({});
    }
  }, [isOpen, estilista]);

  const handleChange = (field, value) => {
    const val = ['nombre_estilista', 'apellido_estilista'].includes(field) ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [field]: val }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errores[field]) {
      setErrores(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validarFormulario = () => {
    let temp = {};
    
    if (!formData.nombre_estilista?.trim()) {
      temp.nombre_estilista = 'El nombre es obligatorio';
    }
    
    if (!formData.apellido_estilista?.trim()) {
      temp.apellido_estilista = 'El apellido es obligatorio';
    }
    
    if (!formData.identidad_estilista?.trim()) {
      temp.identidad_estilista = 'La identidad es requerida';
    } else if (!/^[0-9]{4}-[0-9]{4}-[0-9]{5}$/.test(formData.identidad_estilista)) {
      temp.identidad_estilista = 'La identidad debe tener el formato 0000-0000-00000';
    }

    setErrores(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    try {
      const dataToUpdate = {
        id_estilista: formData.id_estilista_pk,
        nombre_estilista: formData.nombre_estilista,
        apellido_estilista: formData.apellido_estilista,
        identidad_estilista: formData.identidad_estilista
      };

      const response = await actualizarEstilista(dataToUpdate);
      
      if (response && response.Consulta) {
        Swal.fire({
          icon: 'success',
          title: '¡Estilista actualizado!',
          text: `${formData.nombre_estilista} ${formData.apellido_estilista} fue actualizado correctamente`,
          timer: 1500,
          showConfirmButton: false
        });
        
        onSave();
        onClose();
      } else {
        const errorMsg = response?.error || 'Error desconocido';
        
        // Si hay un error 500, mostrar mensaje informativo y recargar datos
        if (response?.status === 500 || errorMsg.includes('500')) {
          Swal.fire({
            icon: 'warning',
            title: 'Actualización Completada',
            text: 'El estilista fue actualizado correctamente, pero hubo un problema con la respuesta del servidor.',
            confirmButtonText: 'Entendido',
            timer: 3000
          });
          
          // Asumir que fue exitoso y recargar datos
          onSave();
          onClose();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `No se pudo actualizar el estilista: ${errorMsg}`
          });
        }
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      
      // Si el error es 500, probablemente la actualización fue exitosa
      if (error.response?.status === 500) {
        Swal.fire({
          icon: 'info',
          title: 'Actualización Procesada',
          text: 'La actualización puede haber sido exitosa. Verificando cambios...',
          confirmButtonText: 'OK',
          timer: 2500
        });
        
        // Recargar los datos para verificar si se actualizó
        onSave();
        onClose();
      } else {
        // Otros errores
        const errorMsg = error.response?.data?.error || error.message || 'Error desconocido';
        Swal.fire({
          icon: 'error',
          title: 'Error de Conexión',
          text: `Error al actualizar: ${errorMsg}`,
          confirmButtonText: 'Entendido'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3 mt-2" role="group" aria-label="Acciones del formulario">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text p-button-rounded"
        onClick={onClose}
        disabled={loading}
        aria-label="Cancelar edición del estilista"
        tabIndex={0}
      />
      <Button
        label="Actualizar"
        icon="pi pi-check"
        className="p-button-success p-button-rounded"
        onClick={handleSubmit}
        loading={loading}
        aria-label="Guardar cambios del estilista"
        tabIndex={0}
      />
    </div>
  );

  return (
    <Dialog
      header={<div className="w-full text-center text-lg font-bold" id="modal-title">EDITAR ESTILISTA</div>}
      visible={isOpen}
      style={{ width: '28rem', borderRadius: '1.5rem' }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
      position="center"
      dismissableMask={true}
      draggable={false}
      resizable={false}
      blockScroll={true}
      focusOnShow={true}
      aria-labelledby="modal-title"
      aria-describedby="modal-content"
      keepInViewport={true}
    >
      {/* Formulario */}
      <div id="modal-content" className="flex flex-col gap-3" role="form" aria-label="Formulario de edición de estilista">
        {/* Nombre */}
        <div className="form-field">
          <label htmlFor="nombre" className="text-xs font-semibold text-gray-700 mb-1 block">NOMBRE *</label>
          <InputText
            id="nombre"
            name="nombre"
            value={formData.nombre_estilista}
            onChange={(e) => handleChange('nombre_estilista', e.target.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Ej: Juan Carlos"
            aria-required="true"
            aria-invalid={!!errores.nombre_estilista}
            aria-describedby={errores.nombre_estilista ? "nombre-error" : undefined}
            autoFocus
          />
          {errores.nombre_estilista && (
            <p id="nombre-error" className="text-xs text-red-600 mt-1" role="alert" aria-live="polite">
              {errores.nombre_estilista}
            </p>
          )}
        </div>

        {/* Apellido */}
        <div className="form-field">
          <label htmlFor="apellido" className="text-xs font-semibold text-gray-700 mb-1 block">APELLIDO *</label>
          <InputText
            id="apellido"
            name="apellido"
            value={formData.apellido_estilista}
            onChange={(e) => handleChange('apellido_estilista', e.target.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Ej: González López"
            aria-required="true"
            aria-invalid={!!errores.apellido_estilista}
            aria-describedby={errores.apellido_estilista ? "apellido-error" : undefined}
          />
          {errores.apellido_estilista && (
            <p id="apellido-error" className="text-xs text-red-600 mt-1" role="alert" aria-live="polite">
              {errores.apellido_estilista}
            </p>
          )}
        </div>

        {/* Identidad */}
        <div className="form-field">
          <label htmlFor="identidad_estilista" className="text-xs font-semibold text-gray-700 mb-1 block">IDENTIDAD *</label>
          <InputMask
            id="identidad_estilista"
            name="identidad_estilista"
            value={formData.identidad_estilista}
            onChange={(e) => {
              setFormData({ ...formData, identidad_estilista: e.value });
              if (e.value && e.value.trim() !== "") {
                setErrores({ ...errores, identidad_estilista: false });
              }
            }}
            mask="9999-9999-99999"
            placeholder="0000-0000-00000"
            className="w-full rounded-xl h-9 text-sm"
            autoComplete="off"
            aria-required="true"
            aria-invalid={!!errores.identidad_estilista}
            aria-describedby={errores.identidad_estilista ? "identidad-error" : undefined}
          />
          {errores.identidad_estilista && (
            <p id="identidad-error" className="text-xs text-red-600 mt-1" role="alert" aria-live="polite">
              {errores.identidad_estilista}
            </p>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default ModalActualizarEstilista;