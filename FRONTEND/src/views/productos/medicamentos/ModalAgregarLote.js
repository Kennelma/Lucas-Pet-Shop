import React, { useState, useEffect } from 'react';

const ModalAgregarLote = ({ isOpen, onClose, onSave, medicamento }) => {
  const [data, setData] = useState({ 
    codigoLote: '', 
    fechaVencimiento: '',
    stockLote: 1
  });
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (isOpen) {
      // Generar código de lote automático
      const hoy = new Date();
      const año = hoy.getFullYear();
      const mes = String(hoy.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(Math.random() * 9000) + 1000;
      const codigoAuto = `LOT-${año}${mes}-${random}`;
      
      setData({ 
        codigoLote: codigoAuto, 
        fechaVencimiento: '',
        stockLote: 1
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('1️⃣ Datos del lote:', data);
    
    const newErrors = {};
    if (!data.codigoLote?.trim()) newErrors.codigoLote = true;
    if (!data.fechaVencimiento) newErrors.fechaVencimiento = true;
    if (data.stockLote <= 0) newErrors.stockLote = true;
    
    // Validar que fecha de vencimiento sea mayor a hoy
    if (data.fechaVencimiento) {
      const fechaVenc = new Date(data.fechaVencimiento);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaVenc <= hoy) {
        newErrors.fechaVencimiento = true;
        newErrors.fechaVencimientoMensaje = 'La fecha debe ser futura';
      }
    }
    
    console.log('2️⃣ Errores detectados:', newErrors);
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      console.log('3️⃣ Sin errores, llamando a onSave...');
      const resultado = await onSave(data);
      console.log('4️⃣ Resultado de onSave:', resultado);
      if (resultado !== false) {
        console.log('5️⃣ Cerrando modal...');
        onClose();
      }
    } else {
      console.log('❌ HAY ERRORES, no se puede guardar');
    }
  };

  const calcularDiasVencimiento = () => {
    if (!data.fechaVencimiento) return null;
    const hoy = new Date();
    const fechaVenc = new Date(data.fechaVencimiento);
    const diferencia = fechaVenc - hoy;
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  };

  const diasVencimiento = calcularDiasVencimiento();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b border-gray-300">
          <div>
            <h2 className="font-bold text-lg">AGREGAR NUEVO LOTE</h2>
            <p className="text-sm text-gray-600">{medicamento?.presentacion}</p>
          </div>
          <button onClick={onClose} className="text-2xl hover:text-gray-700">&times;</button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h6 className="text-sm font-semibold text-gray-700 mb-1">Código de Lote</h6>
            <input 
              name="codigoLote" 
              value={data.codigoLote} 
              onChange={handleChange} 
              placeholder="LOT-202401-1234" 
              className={`w-full p-2 border rounded font-mono ${errors.codigoLote ? 'border-red-500' : ''}`} 
            />
            {errors.codigoLote && (
              <p className="text-xs text-red-500 mt-1">El código de lote es obligatorio</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Se generó automáticamente, puedes modificarlo</p>
          </div>

          <div>
            <h6 className="text-sm font-semibold text-gray-700 mb-1">Fecha de Vencimiento</h6>
            <input 
              type="date" 
              name="fechaVencimiento" 
              value={data.fechaVencimiento} 
              onChange={handleChange} 
              className={`w-full p-2 border rounded ${errors.fechaVencimiento ? 'border-red-500' : ''}`} 
            />
            {errors.fechaVencimiento && (
              <p className="text-xs text-red-500 mt-1">
                {errors.fechaVencimientoMensaje || 'La fecha de vencimiento es obligatoria'}
              </p>
            )}
            {diasVencimiento !== null && diasVencimiento > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                📅 Vence en <span className="font-semibold">{diasVencimiento} días</span>
                {diasVencimiento <= 30 && <span className="text-orange-600"> - ⚠️ Pronto a vencer</span>}
              </p>
            )}
          </div>

          <div>
            <h6 className="text-sm font-semibold text-gray-700 mb-1">Stock Inicial del Lote</h6>
            <input 
              type="number" 
              name="stockLote" 
              value={data.stockLote} 
              onChange={handleChange} 
              min="1" 
              className={`w-full p-2 border rounded ${errors.stockLote ? 'border-red-500' : ''}`} 
            />
            {errors.stockLote && (
              <p className="text-xs text-red-500 mt-1">El stock debe ser mayor a 0</p>
            )}
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-sm text-blue-800">
            <p className="font-semibold mb-1">💡 Información:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Fecha de ingreso se registrará automáticamente</li>
              <li>El lote se creará en estado activo</li>
              <li>Podrás modificar el stock posteriormente en movimientos de inventario</li>
            </ul>
          </div>

          <button 
            type="button" 
            onClick={handleSubmit} 
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 font-semibold"
          >
            Guardar Lote
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregarLote;