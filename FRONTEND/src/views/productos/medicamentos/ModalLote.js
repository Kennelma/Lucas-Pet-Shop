import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";

const ModalLote = ({ isOpen, onClose, onSave, medicamentoSeleccionado, lotesExistentes = [] }) => {
  const [formData, setFormData] = useState({
    codigo_lote: "",
    fecha_vencimiento: "",
    stock_lote: "",
    id_producto_fk: null
  });

  const [errores, setErrores] = useState({});

  // Genera código basándose en el MÁXIMO número existente
  const generarCodigoLote = (nombreMedicamento, lotesDelMedicamento) => {
    const nombreSinEspacios = nombreMedicamento.replace(/\s+/g, '').toUpperCase();
    const letras = nombreSinEspacios.substring(0, 4).padEnd(4, 'X');
    
    //Extraer todos los números de los códigos existentes
    const numerosExistentes = lotesDelMedicamento
      .map(lote => {
        const match = lote.codigo_lote.match(/LOTE-(\d+)-/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => n > 0);
    
    //Encontrar el siguiente número disponible (máximo + 1)
    const siguienteNumero = numerosExistentes.length > 0 
      ? Math.max(...numerosExistentes) + 1 
      : 1;
    
    const numeroFormateado = siguienteNumero.toString().padStart(2, '0');
    
    return `LOTE-${numeroFormateado}-${letras}`;
  };

  useEffect(() => {
    if (medicamentoSeleccionado && isOpen) {
      const lotesDelMedicamento = lotesExistentes.filter( lote => lote.id_producto_fk === medicamentoSeleccionado.id_producto_pk );
      
      const codigoAuto = generarCodigoLote( medicamentoSeleccionado.nombre_producto, lotesDelMedicamento );
      
      setFormData({
        codigo_lote: codigoAuto,
        fecha_vencimiento: "",
        stock_lote: "",
        id_producto_fk: medicamentoSeleccionado.id_producto_pk
      });
      setErrores({});
    }
  }, [medicamentoSeleccionado, isOpen, lotesExistentes]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    setErrores(prev => {
      const newErrores = { ...prev };
      
      if (field === 'fecha_vencimiento') {
        if (!value) {
          newErrores[field] = 'La fecha de vencimiento es obligatoria';
        } else {
          const fechaSeleccionada = new Date(value);
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);
          if (fechaSeleccionada <= hoy) {
            newErrores[field] = 'La fecha de vencimiento debe ser mayor a la fecha actual';
          } else {
            newErrores[field] = '';
          }
        }
      } else if (field === 'stock_lote') {
        newErrores[field] = parseInt(value) >= 5 ? '' : 'El stock del lote debe ser mínimo 5 unidades';
      }
      
      return newErrores;
    });
  };

  const validarFormulario = () => {
    let temp = {};
    
    if (!formData.fecha_vencimiento) {
      temp.fecha_vencimiento = 'La fecha de vencimiento es obligatoria';
    } else {
      const fechaSeleccionada = new Date(formData.fecha_vencimiento);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaSeleccionada <= hoy) {
        temp.fecha_vencimiento = 'La fecha de vencimiento debe ser mayor a la fecha actual';
      }
    }
    if (!formData.stock_lote || parseInt(formData.stock_lote) < 5) {
      temp.stock_lote = 'El stock del lote debe ser mínimo 5 unidades';
    }

    setErrores(temp);
    return Object.keys(temp).length === 0;
  };

  const handleGuardar = () => {
    if (validarFormulario()) {
      console.log("✅ Datos del lote a guardar:", formData);
      onSave(formData);
    }
  };

  const handleCerrar = () => {
    setFormData({
      codigo_lote: "",
      fecha_vencimiento: "",
      stock_lote: "",
      id_producto_fk: null
    });
    setErrores({});
    onClose();
  };

  const footer = (
    <div className="flex justify-end gap-3 mt-2">
      <button
        className="p-button p-button-text p-button-rounded px-4 py-2 border border-blue-500 text-blue-500 bg-transparent hover:bg-blue-50 font-semibold"
        onClick={handleCerrar}
        type="button"
      >
        Cancelar
      </button>
      <button
        className="p-button p-button-success p-button-rounded px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold"
        onClick={handleGuardar}
        type="button"
      >
        <div className="flex gap-2 items-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Guardar Lote
        </div>
      </button>
    </div>
  );

  return (
    <Dialog
      header={<div className="w-full text-center text-lg font-bold">NUEVO LOTE</div>}
      visible={isOpen}
      style={{ width: '28rem', borderRadius: '1.5rem' }}
      modal
      closable={false}
      onHide={handleCerrar}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
    >
      {/* Banner del medicamento */}
      {medicamentoSeleccionado && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-600 font-semibold text-center">
            <strong>{medicamentoSeleccionado.nombre_producto}</strong> - {medicamentoSeleccionado.presentacion_medicamento}
          </p>
        </div>
      )}

      {/* Formulario */}
      <div className="flex flex-col gap-3">
        {/* Código de Lote - AUTOMÁTICO Y NO EDITABLE */}
        <span>
          <label htmlFor="codigo_lote" className="text-xs font-semibold text-gray-700 mb-1">CÓDIGO DE LOTE (GENERADO AUTOMÁTICAMENTE)</label>
          <InputText
            id="codigo_lote"
            name="codigo_lote"
            value={formData.codigo_lote}
            readOnly
            className="w-full rounded-xl h-9 text-sm bg-gray-100 font-mono font-bold"
          />
        </span>

        {/* Fecha de Vencimiento */}
        <span>
          <label htmlFor="fecha_vencimiento" className="text-xs font-semibold text-gray-700 mb-1">FECHA DE VENCIMIENTO</label>
          <input
            type="date"
            id="fecha_vencimiento"
            name="fecha_vencimiento"
            value={formData.fecha_vencimiento}
            onChange={(e) => handleChange('fecha_vencimiento', e.target.value)}
            min={(() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              return tomorrow.toISOString().split('T')[0];
            })()}
            className="w-full rounded-xl h-9 text-sm border border-gray-300 px-3"
            autoFocus
          />
          {errores.fecha_vencimiento && <p className="text-xs text-red-600 mt-1">{errores.fecha_vencimiento}</p>}
        </span>

        {/* Stock del Lote */}
        <span>
          <label htmlFor="stock_lote" className="text-xs font-semibold text-gray-700 mb-1">CANTIDAD INICIAL DEL LOTE</label>
          <InputText
            id="stock_lote"
            name="stock_lote"
            type="number"
            min="5"
            value={formData.stock_lote}
            onChange={(e) => handleChange('stock_lote', e.target.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Mínimo 5 unidades"
          />
          {errores.stock_lote && <p className="text-xs text-red-600 mt-1">{errores.stock_lote}</p>}
        </span>
      </div>
    </Dialog>
  );
};

export default ModalLote;