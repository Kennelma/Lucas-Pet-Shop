import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";

const ModalEditarLote = ({ isOpen, onClose, onSave, loteEditar }) => {
  const [formData, setFormData] = useState({
    fecha_vencimiento: "",
    stock_lote: ""
  });

  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (loteEditar && isOpen) {
      setFormData({
        fecha_vencimiento: loteEditar.fecha_vencimiento?.split('T')[0] || "",
        stock_lote: loteEditar.stock_lote || ""
      });
      setErrores({});
    }
  }, [loteEditar, isOpen]);

  if (!isOpen || !loteEditar) return null;

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
  const num = parseInt(value);
  if (isNaN(num) || num < 5) {
    newErrores[field] = 'El stock del lote debe ser mínimo 5 unidades';
  } else {
    newErrores[field] = '';
  }
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
    // ✅ Enviar solo los campos editables + el ID
    onSave({
      id_lote_medicamentos_pk: loteEditar.id_lote_medicamentos_pk,
      fecha_vencimiento: formData.fecha_vencimiento,
      stock_lote: parseInt(formData.stock_lote)
    });
  }
};

  const handleCerrar = () => {
    setFormData({
      fecha_vencimiento: "",
      stock_lote: ""
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
          Actualizar Lote
        </div>
      </button>
    </div>
  );

  return (
    <Dialog
      header={<div className="w-full text-center text-sm sm:text-base md:text-lg font-bold">EDITAR LOTE</div>}
      visible={isOpen}
      className="w-11/12 sm:w-96 md:w-[28rem]"
      modal
      closable={false}
      onHide={handleCerrar}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
    >
      {/* Banner del lote */}
      {loteEditar && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-600 font-semibold text-center">
            <strong>{loteEditar.codigo_lote}</strong>
          </p>
        </div>
      )}

      {/* Formulario */}
      <div className="flex flex-col gap-3">
        {/* Código de Lote - NO EDITABLE */}
        <span>
          <label htmlFor="codigo_lote_display" className="text-xs font-semibold text-gray-700 mb-1">CÓDIGO DE LOTE</label>
          <InputText
            id="codigo_lote_display"
            value={loteEditar?.codigo_lote || ""}
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
          <label htmlFor="stock_lote" className="text-xs font-semibold text-gray-700 mb-1">STOCK DEL LOTE</label>
          <InputText
            id="stock_lote"
            name="stock_lote"
            type="number"
            min="0"
            value={formData.stock_lote}
            onChange={(e) => handleChange('stock_lote', e.target.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="0"
          />
          {errores.stock_lote && <p className="text-xs text-red-600 mt-1">{errores.stock_lote}</p>}
        </span>
      </div>
    </Dialog>
  );
};

export default ModalEditarLote;