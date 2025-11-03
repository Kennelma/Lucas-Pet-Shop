import React, { useState, useEffect } from "react";

const ModalMedicamento = ({ isOpen, onClose, onSave, medicamentoEditando, medicamentosExistentes = [] }) => {
  const [paso, setPaso] = useState(1);
  const [formData, setFormData] = useState({ nombre_producto: "", precio_producto: "", presentacion: "", tipo: "", 
    cantidad_contenido: "", unidad_medida: "", sku: "", codigo_lote: "", fecha_vencimiento: "", stock_lote: "", activo: true
  });

  const [errores, setErrores] = useState({});

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
        
        const nuevoFormData = { nombre_producto: medicamentoEditando.nombre_producto || "", precio_producto: medicamentoEditando.precio_producto || "",
          presentacion: normalizarTexto(medicamentoEditando.presentacion_medicamento || medicamentoEditando.presentacion),
          tipo: normalizarTexto(medicamentoEditando.tipo_medicamento || medicamentoEditando.tipo), cantidad_contenido: medicamentoEditando.cantidad_contenido || "",
          unidad_medida: medicamentoEditando.unidad_medida || "", sku: generarSKU(medicamentoEditando.nombre_producto) || "",
          activo: medicamentoEditando.activo !== undefined ? medicamentoEditando.activo : true,
          codigo_lote: "", fecha_vencimiento: "", stock_lote: ""
        };
        
        setFormData(nuevoFormData);
        setPaso(1);
      } else {
        setFormData({ nombre_producto: "", precio_producto: "", presentacion: "", tipo: "", cantidad_contenido: "",
          unidad_medida: "", sku: "", activo: true, codigo_lote: "", fecha_vencimiento: "", stock_lote: ""
        });
        setPaso(1);
      }
      setErrores({});
    }
  }, [isOpen, medicamentoEditando]);

  if (!isOpen) return null;

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
      } else if (field === 'precio_producto') { newErrores[field] = parseFloat(value) > 0 ? '' : 'El precio debe ser mayor a 0';
      } else if (field === 'presentacion') { newErrores[field] = value ? '' : 'La presentación es obligatoria';
      } else if (field === 'tipo') { newErrores[field] = value ? '' : 'El tipo es obligatorio';
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
    if (medicamentoEditando) {
      if (validarPaso1()) { onSave(formData);
      }
    } else {
      if (validarPaso2()) { onSave(formData);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10">
        <div className="flex justify-between items-center w-full mb-8">
          <div className="flex flex-col">
            <div className="text-xl text-gray-800 font-bold">
              {medicamentoEditando ? "EDITAR MEDICAMENTO" : paso === 2 ? "NUEVO LOTE" : "NUEVO MEDICAMENTO"}
            </div>
          </div>
          
          {!medicamentoEditando && (
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                paso === 1 ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`h-1 w-8 transition-all ${paso === 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                paso === 2 ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
          )}
        </div>

        {paso === 1 && (
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="relative col-span-2">
              <input type="text" id="nombre_producto" value={formData.nombre_producto}
                onChange={(e) => handleChange('nombre_producto', e.target.value)}
                className="block w-full text-sm h-[50px] px-4 text-slate-900 bg-white rounded-lg border border-black-200 appearance-none focus:border-transparent focus:outline focus:outline-2 focus:outline-black-500 focus:ring-0 hover:border-black-300 peer transition-all"
              />
              <label htmlFor="nombre_producto"
                className="absolute text-sm text-black-600 duration-300 transform -translate-y-[1.2rem] scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-[1.2rem] start-1"
              >
                Nombre del Producto
              </label>
              {errores.nombre_producto && (
                <p className="text-[10px] text-red-600 mt-1">{errores.nombre_producto}</p>
              )}
            </div>

            <div className="relative col-span-2">
              <input type="text" id="sku" value={formData.sku} readOnly
                className="block w-full text-sm h-[50px] px-4 text-slate-900 bg-gray-100 rounded-lg border border-gray-300 cursor-not-allowed"
              />
              <label htmlFor="sku"
                className="absolute text-sm text-gray-600 duration-300 transform -translate-y-[1.2rem] scale-75 top-2 z-10 origin-[0] bg-white px-2 start-1"
              >
                SKU
              </label>
            </div>

            <div className="relative">
              <input type="number" step="0.01" min="0" id="precio_producto" value={formData.precio_producto}
                onChange={(e) => handleChange('precio_producto', e.target.value)}
                className="block w-full text-sm h-[50px] px-4 text-slate-900 bg-white rounded-lg border border-black-200 appearance-none focus:border-transparent focus:outline focus:outline-2 focus:outline-black-500 focus:ring-0 hover:border-black-300 peer transition-all"
              />
              <label htmlFor="precio_producto"
                className="absolute text-sm text-black-600 duration-300 transform -translate-y-[1.2rem] scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-[1.2rem] start-1"
              >
                Precio (L)
              </label>
              {errores.precio_producto && ( <p className="text-[10px] text-red-600 mt-1">{errores.precio_producto}</p>
              )}
            </div>

            <div className="relative">
              <select id="presentacion" value={formData.presentacion} onChange={(e) => handleChange('presentacion', e.target.value)}
                className="block w-full text-sm h-[50px] px-4 text-slate-900 bg-white rounded-lg border border-black-200 appearance-none focus:border-transparent focus:outline focus:outline-2 focus:outline-black-500 focus:ring-0 hover:border-black-300 peer transition-all"
              >
                <option value="">Seleccione...</option>
                <option value="Tabletas">Tabletas</option>
                <option value="Cápsulas">Cápsulas</option>
                <option value="Jarabe">Jarabe</option>
                <option value="Inyectable">Inyectable</option>
                <option value="Pomada">Pomada</option>
                <option value="Spray">Spray</option>
                <option value="Champú">Champú</option>
                <option value="Gotas">Gotas</option>
                <option value="Pipeta">Pipeta</option>
                <option value="Suplemento">Suplemento</option>
                <option value="Otros">Otros</option>
              </select>
              <label htmlFor="presentacion"
                className="absolute text-sm text-black-600 duration-300 transform -translate-y-[1.2rem] scale-75 top-2 z-10 origin-[0] bg-white px-2 start-1"
              >
                Presentación
              </label>
              {errores.presentacion && (
                <p className="text-[10px] text-red-600 mt-1">{errores.presentacion}</p>
              )}
            </div>

            <div className="relative">
              <select id="tipo" value={formData.tipo} onChange={(e) => handleChange('tipo', e.target.value)}
                className="block w-full text-sm h-[50px] px-4 text-slate-900 bg-white rounded-lg border border-black-200 appearance-none focus:border-transparent focus:outline focus:outline-2 focus:outline-black-500 focus:ring-0 hover:border-black-300 peer transition-all"
              >
                <option value="">Seleccione...</option>
                <option value="Antibiótico">Antibiótico</option>
                <option value="Antiparasitario">Antiparasitario</option>
                <option value="Antiinflamatorio">Antiinflamatorio</option>
                <option value="Analgésico">Analgésico</option>
                <option value="Antifúngico">Antifúngico</option>
                <option value="Antiviral">Antiviral</option>
                <option value="Antipirético">Antipirético</option>
                <option value="Antialérgico">Antialérgico</option>
                <option value="Anestésico">Anestésico</option>
                <option value="Antidiarreico">Antidiarreico</option>
                <option value="Probiotico">Probiotico</option>
                <option value="Desinfectante">Desinfectante</option>
                <option value="Hormonal">Hormonal</option>
                <option value="Inmunoestimulante">Inmunoestimulante</option>
                <option value="Cicatrizante">Cicatrizante</option>
                <option value="Otro">Otro</option>
              </select>
              <label htmlFor="tipo"
                className="absolute text-sm text-black-600 duration-300 transform -translate-y-[1.2rem] scale-75 top-2 z-10 origin-[0] bg-white px-2 start-1"
              >
                Tipo de Medicamento
              </label>
              {errores.tipo && ( <p className="text-[10px] text-red-600 mt-1">{errores.tipo}</p> )}
            </div>

            <div className="relative">
              <input type="number" id="cantidad_contenido" value={formData.cantidad_contenido} onChange={(e) => handleChange('cantidad_contenido', e.target.value)}
                className="block w-full text-sm h-[50px] px-4 text-slate-900 bg-white rounded-lg border border-black-200 appearance-none focus:border-transparent focus:outline focus:outline-2 focus:outline-black-500 focus:ring-0 hover:border-black-300 peer transition-all"
              />
              <label htmlFor="cantidad_contenido"
                className="absolute text-sm text-black-600 duration-300 transform -translate-y-[1.2rem] scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-[1.2rem] start-1"
              >
                Cantidad
              </label>
            </div>

            <div className="relative">
              <select id="unidad_medida" value={formData.unidad_medida} onChange={(e) => handleChange('unidad_medida', e.target.value)}
                className="block w-full text-sm h-[50px] px-4 text-slate-900 bg-white rounded-lg border border-black-200 appearance-none focus:border-transparent focus:outline focus:outline-2 focus:outline-black-500 focus:ring-0 hover:border-black-300 peer transition-all"
              >
                <option value="">Seleccione...</option>
                <option value="MG">MG (Miligramos)</option>
                <option value="G">G (Gramos)</option>
                <option value="MCG">MCG (Microgramos)</option>
                <option value="ML">ML (Mililitros)</option>
                <option value="CC">CC (Centímetros Cúbicos)</option>
                <option value="OZ">OZ (Onzas)</option>
                <option value="GOTAS">GOTAS</option>
                <option value="UNIDADES">UNIDADES</option>
              </select>
              <label htmlFor="unidad_medida"
                className="absolute text-sm text-black-600 duration-300 transform -translate-y-[1.2rem] scale-75 top-2 z-10 origin-[0] bg-white px-2 start-1"
              >
                Unidad de Medida
              </label>
            </div>

            {medicamentoEditando && (
              <div className="col-span-1 flex items-center justify-start">
                <label className="relative inline-flex items-center cursor-pointer">
            type="className="sr-ochecked={formData.activo}
                    onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                  />
                  <div className="group peer bg-gray-200 rounded-full duration-300 w-16 h-8 after:duration-300 after:bg-gray-400 peer-checked:after:bg-green-500 peer-checked:bg-green-200 after:rounded-full after:absolute after:h-6 after:w-6 after:top-1 after:left-1 after:flex after:justify-center after:items-center peer-checked:after:translate-x-8 peer-hover:after:scale-95 peer-focus:ring-4 peer-focus:ring-blue-300"></div>
                  <span className={`ml-3 text-sm font-medium ${formData.activo ? 'text-green-600' : 'text-gray-500'}`}>
                    {formData.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </label>
              </div>
            )}
          </div>
        )}

        {paso === 2 && !medicamentoEditando && (
          <div className="space-y-6 mb-10">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center">
                <p className="text-sm font-bold text-black text-center">
                  {formData.nombre_producto} - {formData.presentacion}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="relative col-span-2">
                <input type="text" id="codigo_lote" value={formData.codigo_lote} disabled
                  className="block w-full text-sm h-[50px] px-4 text-slate-900 bg-gray-100 rounded-lg border border-gray-300 cursor-not-allowed"
                />
                <label htmlFor="codigo_lote"
                  className="absolute text-sm text-gray-600 duration-300 transform -translate-y-[1.2rem] scale-75 top-2 z-10 origin-[0] bg-white px-2 start-1"
                >
                  Código de Lote (Generado Automáticamente)
                </label>
              </div>

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
                {errores.fecha_vencimiento && (
                  <p className="text-[10px] text-red-600 mt-1">{errores.fecha_vencimiento}</p>
                )}
              </div>

              <div className="relative col-span-2">
                <input type="number" min="5" id="stock_lote" value={formData.stock_lote} onChange={(e) => handleChange('stock_lote', e.target.value)}
                  className="block w-full text-sm h-[50px] px-4 text-slate-900 bg-white rounded-lg border border-black-200 appearance-none focus:border-transparent focus:outline focus:outline-2 focus:outline-black-500 focus:ring-0 hover:border-black-300 peer transition-all"
                />
                <label htmlFor="stock_lote"
                  className="absolute text-sm text-black-600 duration-300 transform -translate-y-[1.2rem] scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-[1.2rem] start-1"
                >
                  Cantidad Inicial del Lote
                </label>
                {errores.stock_lote && (
                  <p className="text-[10px] text-red-600 mt-1">{errores.stock_lote}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-row-reverse gap-4">
          {paso === 1 && !medicamentoEditando ? (
            <button onClick={handleSiguiente}
              className="w-fit rounded-lg text-sm px-5 py-2 h-[50px] bg-green-500 hover:bg-green-600 focus:bg-green-700 text-white focus:ring-4 focus:ring-green-200 hover:ring-4 hover:ring-green-100 transition-all duration-300"
              type="button"
            >
              <div className="flex gap-2 items-center font-semibold">
                SIGUIENTE
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ) : (
            <button onClick={handleGuardar}
              className="w-fit rounded-lg text-sm px-5 py-2 h-[50px] bg-green-500 hover:bg-green-600 focus:bg-green-700 text-white focus:ring-4 focus:ring-green-200 hover:ring-4 hover:ring-green-100 transition-all duration-300"
              type="button"
            >
              <div className="flex gap-2 items-center font-semibold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                GUARDAR
              </div>
            </button>
          )}
          
          {paso === 2 && !medicamentoEditando && (
            <button onClick={() => setPaso(1)}
              className="w-fit rounded-lg text-sm px-5 py-2 h-[50px] bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all duration-300"
              type="button"
            >
              <div className="flex gap-2 items-center font-semibold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                ANTERIOR
              </div>
            </button>
          )}
          
          <button
            onClick={onClose}
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

export default ModalMedicamento;