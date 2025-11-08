import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";

const ModalMedicamento = ({ isOpen, onClose, onSave, medicamentoEditando, medicamentosExistentes = [] }) => {
  const [paso, setPaso] = useState(1);
  const [formData, setFormData] = useState({
    nombre_producto: "",
    precio_producto: "",
    presentacion: "",
    tipo: "",
    cantidad_contenido: "",
    unidad_medida: "",
    sku: "",
    codigo_lote: "",
    fecha_vencimiento: "",
    stock_lote: "",
    stock_minimo: "5",
    activo: true,
    tasaImpuesto: 15
  });

  const [errores, setErrores] = useState({});
  const [aplicaImpuesto, setAplicaImpuesto] = useState(true);

  // Función para normalizar texto: Primera letra mayúscula, resto minúscula
  const normalizarTexto = (texto) => {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  const generarSKU = (nombre) => {
    if (!nombre) return '';
    const partes = nombre.trim().split(' ').map(p => p.substring(0, 3).toUpperCase());
    return partes.join('-');
  };

  const generarCodigoLote = (nombreMedicamento) => {
    const nombreSinEspacios = nombreMedicamento.replace(/\s+/g, '').toUpperCase();
    const letras = nombreSinEspacios.substring(0, 4).padEnd(4, 'X');
    return `LOTE-01-${letras}`;
  };

  useEffect(() => {
    
    if (isOpen) {
      if (medicamentoEditando) {
        setFormData({
          nombre_producto: medicamentoEditando.nombre_producto,
          precio_producto: medicamentoEditando.precio_producto,
          presentacion: medicamentoEditando.presentacion_medicamento,
          tipo: medicamentoEditando.tipo_medicamento,
          cantidad_contenido: medicamentoEditando.cantidad_contenido,
          unidad_medida: medicamentoEditando.unidad_medida,
          sku: generarSKU(medicamentoEditando.nombre_producto),
          activo: medicamentoEditando.activo,
          stock_minimo: medicamentoEditando.stock_minimo || "5",
          codigo_lote: "",
          fecha_vencimiento: "",
          stock_lote: "",
          tasaImpuesto: medicamentoEditando.tasa_impuesto || 15
        });
        setAplicaImpuesto(medicamentoEditando.aplica_impuesto !== undefined ? medicamentoEditando.aplica_impuesto : true);
        setPaso(1);
      } else {
        setFormData({
          nombre_producto: "",
          precio_producto: "",
          presentacion: "",
          tipo: "",
          cantidad_contenido: "",
          unidad_medida: "",
          sku: "",
          activo: true,
          stock_minimo: "5",
          codigo_lote: "",
          fecha_vencimiento: "",
          stock_lote: "",
          tasaImpuesto: 15
        });
        setAplicaImpuesto(true);
        setPaso(1);
      }
      setErrores({});
    }
  }, [isOpen, medicamentoEditando]);



  const handleChange = (field, value) => { const camposTexto = ['nombre_producto']; const valorFinal = camposTexto.includes(field) ? value.toUpperCase() : value;
    
    setFormData(prev => {
      const newData = { ...prev, [field]: valorFinal };
      
      if (field === 'nombre_producto') { newData.sku = generarSKU(valorFinal);
      }
      
      return newData;
    });

    setErrores(prev => {
      const newErrores = { ...prev };
      
      if (field === 'nombre_producto') {
        if (!valorFinal.trim()) {
          newErrores[field] = 'El nombre del producto es obligatorio';
        } else {
          const nombreExiste = medicamentosExistentes.some(med => 
            med.nombre_producto.toLowerCase() === valorFinal.trim().toLowerCase() &&
            (!medicamentoEditando || med.id_medicamento !== medicamentoEditando.id_medicamento)
          );
          
          if (nombreExiste) { newErrores[field] = 'Ya existe un medicamento con este nombre';
          } else {
            newErrores[field] = '';
          }
        }
      } else if (field === 'precio_producto') {
        newErrores[field] = parseFloat(value) > 0 ? '' : 'El precio debe ser mayor a 0';
      } else if (field === 'stock_minimo') {
        newErrores[field] = parseInt(value) >= 1 ? '' : 'El stock mínimo debe ser al menos 1';
      } else if (field === 'presentacion') {
        newErrores[field] = value ? '' : 'La presentación es obligatoria';
      } else if (field === 'tipo') {
        newErrores[field] = value ? '' : 'El tipo es obligatorio';
      } else if (field === 'fecha_vencimiento') {
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

  const validarPaso1 = () => {
    let temp = {};
    
    if (!formData.nombre_producto.trim()) { temp.nombre_producto = 'El nombre del producto es obligatorio';
    } else {
      const nombreExiste = medicamentosExistentes.some(med => 
        med.nombre_producto.toLowerCase() === formData.nombre_producto.trim().toLowerCase() &&
        (!medicamentoEditando || med.id_medicamento !== medicamentoEditando.id_medicamento)
      );
      
      if (nombreExiste) { temp.nombre_producto = 'Ya existe un medicamento con este nombre';
      }
    }
    
    if (!formData.precio_producto || parseFloat(formData.precio_producto) <= 0) {
      temp.precio_producto = 'El precio debe ser mayor a 0';
    }
    if (!formData.stock_minimo || parseInt(formData.stock_minimo) < 1) {
      temp.stock_minimo = 'El stock mínimo debe ser al menos 1';
    }
    if (!formData.presentacion) {
      temp.presentacion = 'La presentación es obligatoria';
    }
    if (!formData.tipo) {
      temp.tipo = 'El tipo es obligatorio';
    }

    setErrores(temp);
    return Object.keys(temp).length === 0;
  };

  const validarPaso2 = () => {
    let temp = {};
    
    if (!formData.fecha_vencimiento) { temp.fecha_vencimiento = 'La fecha de vencimiento es obligatoria';
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

  const handleSiguiente = () => {
    if (validarPaso1()) { const codigoAuto = generarCodigoLote(formData.nombre_producto);
      setFormData(prev => ({ ...prev, codigo_lote: codigoAuto }));
      setPaso(2);
    }
  };

  const handleGuardar = () => {
    console.log('🎯 Intentando guardar medicamento:', formData);
    console.log('🔍 Es edición:', !!medicamentoEditando);
    console.log('📋 Paso actual:', paso);
    
    if (medicamentoEditando) {
      if (validarPaso1()) {
        console.log('✅ Validación Paso 1 exitosa (edición)');
        onSave(formData);
      } else {
        console.log('❌ Error en validación Paso 1 (edición)');
      }
    } else {
      if (validarPaso2()) {
        console.log('✅ Validación Paso 2 exitosa (creación)');
        onSave(formData);
      } else {
        console.log('❌ Error en validación Paso 2 (creación)');
      }
    }
  };

  const footer = (
    <div className="flex justify-between gap-3 mt-2">
      {/* Botón Anterior (solo visible en paso 2) */}
      <div>
        {paso === 2 && !medicamentoEditando && (
          <button
            className="p-button p-button-text p-button-rounded px-4 py-2 border border-gray-500 text-gray-500 bg-transparent hover:bg-gray-50 font-semibold"
            onClick={() => setPaso(1)}
            type="button"
          >
            Anterior
          </button>
        )}
      </div>

      {/* Botones principales */}
      <div className="flex gap-3">
        <button
          className="p-button p-button-text p-button-rounded px-4 py-2 border border-blue-500 text-blue-500 bg-transparent hover:bg-blue-50 font-semibold"
          onClick={onClose}
          type="button"
        >
          Cancelar
        </button>
        
        {medicamentoEditando ? (
          <button
            className="p-button p-button-success p-button-rounded px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold"
            onClick={handleGuardar}
            type="button"
          >
            Guardar
          </button>
        ) : paso === 1 ? (
          <button
            className="p-button p-button-success p-button-rounded px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold"
            onClick={handleSiguiente}
            type="button"
          >
            Siguiente
          </button>
        ) : (
          <button
            className="p-button p-button-success p-button-rounded px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold"
            onClick={handleGuardar}
            type="button"
          >
            Guardar
          </button>
        )}
      </div>
    </div>
  );

  return (
    <Dialog
      header={<div className="w-full text-center text-lg font-bold">{medicamentoEditando ? 'EDITAR MEDICAMENTO' : 'NUEVO MEDICAMENTO'}</div>}
      visible={isOpen}
      style={{ 
        width: '30rem', 
        maxHeight: '90vh', 
        borderRadius: '1.5rem' 
      }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
      contentStyle={{ 
        overflowY: 'auto', 
        maxHeight: 'calc(90vh - 140px)',
        padding: '1rem' 
      }}
    >
      {/* Indicador de pasos */}
      {!medicamentoEditando && (
        <div className="flex justify-center mb-4">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${paso === 1 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
              1
            </div>
            <div className={`w-12 h-0.5 ${paso === 2 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${paso === 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
              2
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div className={`flex flex-col ${medicamentoEditando ? 'gap-2.5' : 'gap-3'}`}>
        {/* PASO 1: Información del Medicamento */}
        {(paso === 1 || medicamentoEditando) && (
          <>
            {/* Nombre del Medicamento */}
            <span>
              <label htmlFor="nombre_producto" className="text-xs font-semibold text-gray-700 mb-1">NOMBRE DEL MEDICAMENTO</label>
              <InputText
                id="nombre_producto"
                name="nombre_producto"
                value={formData.nombre_producto}
                onChange={e => handleChange('nombre_producto', e.target.value)}
                className="w-full rounded-xl h-9 text-sm"
                placeholder="Ej: Amoxicilina"
              />
              {errores.nombre_producto && <p className="text-xs text-red-600 mt-1">{errores.nombre_producto}</p>}
            </span>

       
        {/* Precio y Stock Mínimo */}
        <div className="grid grid-cols-2 gap-2">
          <span>
            <label htmlFor="precio_producto" className="text-xs font-semibold text-gray-700 mb-1">PRECIO (L)</label>
            <InputText
              id="precio_producto"
              name="precio_producto"
              value={formData.precio_producto}
              onChange={e => handleChange('precio_producto', e.target.value)}
              className="w-full rounded-xl h-9 text-sm"
              placeholder="0.00"
            />
            {errores.precio_producto && <p className="text-xs text-red-600 mt-1">{errores.precio_producto}</p>}
          </span>
          
        </div>

        {/* Presentación */}
        <span>
          <label htmlFor="presentacion" className="text-xs font-semibold text-gray-700 mb-1">PRESENTACIÓN</label>
          <select
            id="presentacion"
            name="presentacion"
            value={formData.presentacion}
            onChange={e => handleChange('presentacion', e.target.value)}
            className="w-full rounded-xl h-9 text-sm border border-gray-300"
          >
            <option value="">Seleccione...</option>
            {(() => {
              const baseItems = [
                "TABLETAS","CÁPSULAS","JARABE","INYECTABLE","POMADA","SPRAY","CHAMPÚ","GOTAS","PIPETA","SUPLEMENTO"
              ];
              // Agrega presentaciones ya ingresadas (en mayúsculas) que no estén en la lista base
              const existentes = (medicamentosExistentes || [])
                .map(m => (m.presentacion_medicamento || '').toUpperCase())
                .filter(v => v && ![...baseItems, "OTROS"].includes(v));
              // Eliminar duplicados y agregar "OTROS" al final
              const opciones = [...baseItems, ...existentes.filter((v, i, arr) => arr.indexOf(v) === i), "OTROS"];
              return opciones.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ));
            })()}
          </select>
          {errores.presentacion && <p className="text-xs text-red-600 mt-1">{errores.presentacion}</p>}
        </span>

        {/* Tipo */}
        <span>
          <label htmlFor="tipo" className="text-xs font-semibold text-gray-700 mb-1">TIPO</label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={e => handleChange('tipo', e.target.value)}
            className="w-full rounded-xl h-9 text-sm border border-gray-300"
          >
            <option value="">Seleccione...</option>
            {(() => {
              const baseItems = [
                "ANTIBIÓTICO",
                "ANTIPARASITARIO",
                "ANTIINFLAMATORIO",
                "ANALGÉSICO",
                "ANTIFÚNGICO",
                "ANTIVIRAL",
                "VACUNA",
                "DESPARASITANTE",
                "SUPLEMENTO",
                "VITAMINAS"
              ];
              // Agrega tipos ya ingresados que no estén en la lista base
              const existentes = (medicamentosExistentes || [])
                .map(m => m.tipo_medicamento)
                .filter(v => v && ![...baseItems, "OTROS"].includes(v));
              const opciones = [...baseItems, ...existentes.filter((v, i, arr) => arr.indexOf(v) === i), "OTROS"];
              return opciones.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ));
            })()}
          </select>
          {errores.tipo && <p className="text-xs text-red-600 mt-1">{errores.tipo}</p>}
        </span>

            {/* Cantidad y Unidad de Medida */}
            <div className="grid grid-cols-2 gap-2">
              <span>
                <label htmlFor="cantidad_contenido" className="text-xs font-semibold text-gray-700 mb-1">CANTIDAD DE CONTENIDO</label>
                <InputText
                  id="cantidad_contenido"
                  name="cantidad_contenido"
                  value={formData.cantidad_contenido}
                  onChange={e => handleChange('cantidad_contenido', e.target.value)}
                  className="w-full rounded-xl h-9 text-sm"
                  placeholder="Ej: 500"
                />
              </span>
              <span>
                <label htmlFor="unidad_medida" className="text-xs font-semibold text-gray-700 mb-1">UNIDAD DE MEDIDA</label>
                <select
                  id="unidad_medida"
                  name="unidad_medida"
                  value={formData.unidad_medida}
                  onChange={e => handleChange('unidad_medida', e.target.value)}
                  className="w-full rounded-xl h-9 text-sm border border-gray-300"
                >
                  <option value="">Seleccione...</option>
                  <option value="MG">MG (Miligramos)</option>
                  <option value="G">G (Gramos)</option>
                  <option value="ML">ML (Mililitros)</option>
                  <option value="OZ">OZ (Onzas)</option>
                  <option value="GOTAS">GOTAS</option>
                  <option value="UNIDADES">UNIDADES</option>
                </select>
              </span>
            </div>

         
          </>
        )}

        {/* PASO 2: Lote Inicial */}
        {paso === 2 && !medicamentoEditando && (
          <>
            <div className="bg-blue-50 p-3 rounded-lg mb-3">
              <p className="text-sm font-semibold text-blue-800 mb-1">🏷️ LOTE INICIAL</p>
              <p className="text-xs text-blue-600">Configure el primer lote para este medicamento</p>
            </div>

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
          </>
        )}
      </div>
    </Dialog>
  );
};

export default ModalMedicamento;