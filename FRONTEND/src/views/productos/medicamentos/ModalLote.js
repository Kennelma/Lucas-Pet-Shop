import React, { useState, useEffect } from "react";

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
    
    // ✅ Encontrar el siguiente número disponible (máximo + 1)
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10">
        {/* Header */}
        <div className="flex justify-between items-center w-full mb-8">
          <div className="flex flex-col">
            <div className="text-xl text-gray-800 font-bold">
              NUEVO LOTE
            </div>
          </div>
        </div>

        {/* Banner del medicamento */}
        {medicamentoSeleccionado && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-2 mb-4">
            <div className="flex items-start gap-3">
              <div>
                <p className="text-sm text-blue-600 mt-1">
                  <strong>{medicamentoSeleccionado.nombre_producto}</strong> - {medicamentoSeleccionado.presentacion_medicamento}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          {/* Código de Lote - AUTOMÁTICO Y NO EDITABLE */}
          <div className="relative col-span-2">
            <input type="text" id="codigo_lote" value={formData.codigo_lote} disabled className="block w-full text-sm h-[50px] px-4 text-slate-900 bg-gray-100 rounded-lg border border-gray-300 cursor-not-allowed font-mono font-bold"/>
            <label htmlFor="codigo_lote" className="absolute text-sm text-gray-600 duration-300 transform -translate-y-[1.2rem] scale-75 top-2 z-10 origin-[0] bg-white px-2 start-1" >
              Código de Lote (Generado Automáticamente)
            </label>
          </div>

          {/* Fecha de Vencimiento */}
          <div className="relative col-span-2">
            <input type="date" id="fecha_vencimiento" value={formData.fecha_vencimiento} onChange={(e) => handleChange('fecha_vencimiento', e.target.value)}
              min={(() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return tomorrow.toISOString().split('T')[0];
              })()}
              className="block w-full text-sm h-[50px] px-4 text-slate-900 bg-white rounded-lg border border-black-200 appearance-none focus:border-transparent focus:outline focus:outline-2 focus:outline-black-500 focus:ring-0 hover:border-black-300 peer transition-all"
              autoFocus
            />
            <label htmlFor="fecha_vencimiento"
              className="absolute text-sm text-black-600 duration-300 transform -translate-y-[1.2rem] scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-[1.2rem] start-1"
            >
              Fecha de Vencimiento
            </label>
            {errores.fecha_vencimiento && ( <p className="text-[10px] text-red-600 mt-1">{errores.fecha_vencimiento}</p> )}
          </div>

          {/* Stock del Lote */}
          <div className="relative col-span-2">
            <input type="number" min="5" id="stock_lote" value={formData.stock_lote} onChange={(e) => handleChange('stock_lote', e.target.value)}
              className="block w-full text-sm h-[50px] px-4 text-slate-900 bg-white rounded-lg border border-black-200 appearance-none focus:border-transparent focus:outline focus:outline-2 focus:outline-black-500 focus:ring-0 hover:border-black-300 peer transition-all"
            />
            <label htmlFor="stock_lote"
              className="absolute text-sm text-black-600 duration-300 transform -translate-y-[1.2rem] scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-[1.2rem] start-1"
            >
              Cantidad Inicial del Lote
            </label>
            {errores.stock_lote && ( <p className="text-[10px] text-red-600 mt-1">{errores.stock_lote}</p> )}
          </div>
        </div>

        {/* Footer con Botones */}
        <div className="flex flex-row-reverse gap-4">
          <button onClick={handleGuardar}
            className="w-fit rounded-lg text-sm px-5 py-2 h-[50px] bg-green-500 hover:bg-green-600 focus:bg-green-700 text-white focus:ring-4 focus:ring-green-200 hover:ring-4 hover:ring-green-100 transition-all duration-300"
            type="button"
          >
            <div className="flex gap-2 items-center font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Guardar Lote
            </div>
          </button>
          
          <button
            onClick={handleCerrar}
            className="w-fit rounded-lg text-sm px-5 py-2 h-[50px] border bg-transparent border-blue-500 text-blue-500 hover:bg-blue-50 focus:ring-4 focus:ring-gray-100 transition-all duration-300"
            type="button"
          >
            <span className="font-semibold">Cancelar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalLote;