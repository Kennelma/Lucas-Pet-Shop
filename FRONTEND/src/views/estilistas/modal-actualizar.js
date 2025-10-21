import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
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
      temp.identidad_estilista = 'La identidad es obligatoria';
    } else if (!/^[0-9]{13}$/.test(formData.identidad_estilista)) {
      temp.identidad_estilista = 'La identidad debe tener exactamente 13 dígitos';
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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `No se pudo actualizar el estilista: ${errorMsg}`
        });
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al actualizar el estilista'
      });
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
        label="Actualizar"
        icon="pi pi-check"
        className="p-button-success p-button-rounded"
        onClick={handleSubmit}
        loading={loading}
      />
    </div>
  );

  return (
    <Dialog
      header={<div className="w-full text-center text-lg font-bold">EDITAR ESTILISTA</div>}
      visible={isOpen}
      style={{ width: '28rem', borderRadius: '1.5rem' }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
    >
      {/* Formulario */}
      <div className="flex flex-col gap-3">
        {/* Nombre */}
        <span>
          <label htmlFor="nombre" className="text-xs font-semibold text-gray-700 mb-1">NOMBRE</label>
          <InputText
            id="nombre"
            name="nombre"
            value={formData.nombre_estilista}
            onChange={(e) => handleChange('nombre_estilista', e.target.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Ej: Juan Carlos"
          />
          {errores.nombre_estilista && <p className="text-xs text-red-600 mt-1">{errores.nombre_estilista}</p>}
        </span>

        {/* Apellido */}
        <span>
          <label htmlFor="apellido" className="text-xs font-semibold text-gray-700 mb-1">APELLIDO</label>
          <InputText
            id="apellido"
            name="apellido"
            value={formData.apellido_estilista}
            onChange={(e) => handleChange('apellido_estilista', e.target.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Ej: González López"
          />
          {errores.apellido_estilista && <p className="text-xs text-red-600 mt-1">{errores.apellido_estilista}</p>}
        </span>

        {/* Identidad */}
        <span>
          <label htmlFor="identidad" className="text-xs font-semibold text-gray-700 mb-1">NÚMERO DE IDENTIDAD</label>
          <InputText
            id="identidad"
            name="identidad"
            value={formData.identidad_estilista}
            onChange={(e) => handleChange('identidad_estilista', e.target.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="0000000000000"
            maxLength={13}
            keyfilter="int"
          />
          {errores.identidad_estilista && <p className="text-xs text-red-600 mt-1">{errores.identidad_estilista}</p>}
        </span>
      </div>
    </Dialog>
  );
};

export default ModalActualizarEstilista;