import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { crearCAI } from '../../AXIOS.SERVICES/sar-axios';
import Swal from 'sweetalert2';

const ModalNuevoCAI = ({ isOpen, onClose }) => {
  // Constantes para los valores fijos
  const ESTABLECIMIENTO = '000';
  const PUNTO_EMISION = '002';
  const TIPO_DOCUMENTO = '01';

  const [formData, setFormData] = useState({
    codigo_cai: '',
    cantidad_facturas: '',
    fecha_limite: '',
  });

  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  // Limpiar formulario cuando se cierra/abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        codigo_cai: '',
        cantidad_facturas: '',
        fecha_limite: '',
      });
      setErrores({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si es el campo codigo_cai, formatear con guiones
    if (name === 'codigo_cai') {
      // Remover todo excepto letras y números
      let cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      
      // Limitar a 30 caracteres (sin guiones)
      cleaned = cleaned.substring(0, 30);
      
      // Agregar guiones cada 6 caracteres
      let formatted = '';
      for (let i = 0; i < cleaned.length; i++) {
        if (i > 0 && i % 6 === 0) {
          formatted += '-';
        }
        formatted += cleaned[i];
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
    } else if (name === 'cantidad_facturas') {
      // Limitar cantidad de facturas a máximo 5000
      const numValue = parseInt(value) || 0;
      if (numValue <= 5000) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar error del campo cuando el usuario escribe
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validar código CAI
    if (!formData.codigo_cai.trim()) {
      nuevosErrores.codigo_cai = 'El código CAI es obligatorio';
    } else {
      // Remover guiones para contar caracteres
      const sinGuiones = formData.codigo_cai.replace(/-/g, '');
      
      if (sinGuiones.length !== 30) {
        nuevosErrores.codigo_cai = 'El código CAI debe tener 30 caracteres (formato: XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX-XX)';
      }
    
    }

    // Validar cantidad de facturas
    if (!formData.cantidad_facturas) {
      nuevosErrores.cantidad_facturas = 'La cantidad de facturas es obligatoria';
    } else if (parseInt(formData.cantidad_facturas) <= 0) {
      nuevosErrores.cantidad_facturas = 'La cantidad debe ser mayor a 0';
    }

    // Validar fecha límite
    if (!formData.fecha_limite) {
      nuevosErrores.fecha_limite = 'La fecha límite es obligatoria';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async () => {
    if (validarFormulario()) {
      // Mostrar confirmación antes de guardar
      const result = await Swal.fire({
        icon: 'question',
        title: '¿Esta seguro que quiere guardar este CAI?',
        text: 'Estos datos no se podrán modificar y tampoco eliminar después de guardarlos.',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#22c55e',
        cancelButtonColor: '#6b7280',
        customClass: {
          container: 'swal-on-top'
        },
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container');
          if (swalContainer) {
            swalContainer.style.zIndex = '9999';
          }
        }
      });

      // Si el usuario cancela, no hacer nada
      if (!result.isConfirmed) {
        return;
      }

      try {
        setGuardando(true);
        
        // Crear el prefijo concatenando establecimiento-punto_emision-tipo_documento
        const prefijo = `${ESTABLECIMIENTO}-${PUNTO_EMISION}-${TIPO_DOCUMENTO}`;
        
        const datosCAI = {
          ...formData,
          cantidad_facturas: parseInt(formData.cantidad_facturas),
          establecimiento: ESTABLECIMIENTO,
          punto_emision: PUNTO_EMISION,
          tipo_documento: TIPO_DOCUMENTO,
          prefijo: prefijo,
          rango_inicio: 1,
          rango_fin: parseInt(formData.cantidad_facturas)
        };
        
        await crearCAI(datosCAI);
        
        handleClose();
        
        setTimeout(() => {
          Swal.fire({
            icon: 'success',
            title: 'CAI Guardado',
            text: 'El CAI se ha registrado correctamente',
            confirmButtonColor: '#22c55e'
          });
        }, 100);
      } catch (error) {
        console.error('Error completo al guardar CAI:', error);
        console.error('Respuesta del servidor:', error.response?.data);
        
        const errorMsg = error.response?.data?.error || error.response?.data?.message || 'No se pudo guardar el CAI';
        
        handleClose();
        
        setTimeout(() => {
          Swal.fire({
            icon: 'warning',
            title: 'CAI No Disponible',
            text: errorMsg,
            confirmButtonColor: '#f59e0b'
          });
        }, 100);
      } finally {
        setGuardando(false);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      codigo_cai: '',
      cantidad_facturas: '',
      fecha_limite: '',
    });
    setErrores({});
    onClose();
  };

  // Calcular el rango de facturas
  const rangoFacturas = formData.cantidad_facturas 
    ? `1 - ${formData.cantidad_facturas}` 
    : '1 - 0';

  const footer = (
    <div className="flex justify-end gap-2 pt-3">
      <Button
        label="Cancelar"
        onClick={handleClose}
        disabled={guardando}
        className="p-button-text p-button-secondary"
        style={{ fontSize: '0.875rem' }}
      />
      <Button
        label="Guardar"
        onClick={handleSubmit}
        disabled={guardando}
        loading={guardando}
        className="bg-green-600 hover:bg-green-700 text-white border-none px-5 py-2 rounded-lg"
        style={{ fontSize: '0.875rem' }}
      />
    </div>
  );

  const tieneErrores = Object.keys(errores).length > 0;

  return (
    <Dialog
      header={
        <div className="w-full text-center text-lg font-bold">
          NUEVO CAI
        </div>
      }
      visible={isOpen}
      style={{ width: '32rem', borderRadius: '1.5rem', maxHeight: tieneErrores ? '90vh' : 'none' }}
      contentStyle={{ overflowY: tieneErrores ? 'auto' : 'visible', maxHeight: tieneErrores ? '60vh' : 'none' }}
      modal
      closable={false}
      onHide={handleClose}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
    >
      <div className="mt-2">
        {/* Formulario */}
        <div className="flex flex-col gap-3">
          {/* Nota Informativa */}
          <p className="text-[10px] text-gray-600 italic uppercase">
            *  Los valores de <strong>Establecimiento </strong>, <strong>Punto de Emisión </strong> y{' '}
            <strong>Tipo de Documento </strong> están configurados por defecto.
          </p>

          {/* CAMPOS NO EDITABLES */}
          <div className="grid grid-cols-3 gap-3">
            {/* Establecimiento */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ESTABLECIMIENTO
              </label>
              <input
                type="text"
                value={ESTABLECIMIENTO}
                readOnly
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Punto de Emisión */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                PUNTO DE EMISIÓN
              </label>
              <input
                type="text"
                value={PUNTO_EMISION}
                readOnly
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Tipo de Documento */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                TIPO DE DOCUMENTO
              </label>
              <input
                type="text"
                value={TIPO_DOCUMENTO}
                readOnly
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Código CAI */}
          <span>
            <label htmlFor="codigo_cai" className="text-xs font-semibold text-gray-700 mb-1">
              CÓDIGO CAI
            </label>
            <InputText
              id="codigo_cai"
              name="codigo_cai"
              value={formData.codigo_cai}
              onChange={handleChange}
              className="w-full rounded-xl h-9 text-sm"
              placeholder="44009D-F53E7E-7C06E0-63BE03-090938-C3"
              autoComplete="off"
              maxLength={35}
            />
           
            {errores.codigo_cai && (
              <p className="text-xs text-red-600 mt-1">{errores.codigo_cai}</p>
            )}
          </span>

          {/* Cantidad de Facturas */}
          <span>
            <label htmlFor="cantidad_facturas" className="text-xs font-semibold text-gray-700 mb-1">
              CANTIDAD DE FACTURAS AUTORIZADAS (Max. 5000)
            </label>
            <InputText
              id="cantidad_facturas"
              name="cantidad_facturas"
              value={formData.cantidad_facturas}
              onChange={handleChange}
              className="w-full rounded-xl h-9 text-sm"
              placeholder="1000"
              keyfilter="int"
              autoComplete="off"
            />
            {errores.cantidad_facturas && (
              <p className="text-xs text-red-600 mt-1">{errores.cantidad_facturas}</p>
            )}
          </span>

          {/* Fecha Límite */}
          <span>
            <label htmlFor="fecha_limite" className="text-xs font-semibold text-gray-700 mb-1">
              FECHA LÍMITE
            </label>
            <input
              type="date"
              id="fecha_limite"
              name="fecha_limite"
              value={formData.fecha_limite}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, fecha_limite: e.target.value }));
                if (errores.fecha_limite) {
                  setErrores(prev => ({ ...prev, fecha_limite: '' }));
                }
              }}
              min={(() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return tomorrow.toISOString().split('T')[0];
              })()}
              className="w-full rounded-xl h-9 text-sm border border-gray-300 px-3"
              autoComplete="off"
            />
            
          </span>

        
        </div>
      </div>
    </Dialog>
  );
};

export default ModalNuevoCAI;
