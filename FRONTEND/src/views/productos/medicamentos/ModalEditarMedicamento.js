import React, { useState, useEffect } from 'react';

const ModalEditarMedicamento = ({ isOpen, onClose, onSave, editData }) => {
  const [data, setData] = useState({ 
    presentacion: '', 
    tipo: 'Analgésico', 
    cantidadContenido: 0, 
    unidadMedida: 'tabletas' 
  });
  const [errors, setErrors] = useState({});

  useEffect(() => { 
    if (isOpen && editData) {
      setData({
        presentacion: editData.presentacion,
        tipo: editData.tipo,
        cantidadContenido: editData.cantidadContenido,
        unidadMedida: editData.unidadMedida
      });
    }
  }, [isOpen, editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!data.presentacion?.trim()) newErrors.presentacion = true;
    if (data.cantidadContenido <= 0) newErrors.cantidadContenido = true;
    setErrors(newErrors);
    if (!Object.keys(newErrors).length && await onSave(data) !== false) onClose();
  };

  if (!isOpen) return null;

  const tiposMedicamentos = [
    'Analgésico',
    'Antiinflamatorio',
    'Antibiótico',
    'Antipirético',
    'Antihistamínico',
    'Antihipertensivo',
    'Antidiabético',
    'Vitaminas',
    'Suplementos',
    'Otros'
  ];

  const unidadesMedida = [
    'tabletas',
    'cápsulas',
    'ml',
    'mg',
    'g',
    'unidades',
    'sobres',
    'ampollas'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50" style={{marginLeft: 'var(--cui-sidebar-occupy-start, 0px)', marginRight: 'var(--cui-sidebar-occupy-end, 0px)'}}>
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-300">
          <h2 className="font-bold text-lg">EDITAR MEDICAMENTO</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h6 className="text-sm font-semibold text-gray-700 mb-1">Tipo de Medicamento</h6>
            <select 
              name="tipo" 
              value={data.tipo} 
              onChange={handleChange} 
              disabled={!!editData}
              className={`w-full p-2 border rounded ${!!editData ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
            >
              {tiposMedicamentos.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
            {!!editData && (
              <p className="text-xs text-gray-500 mt-1">El tipo no se puede modificar</p>
            )}
          </div>

          <div>
            <h6 className="text-sm font-semibold text-gray-700 mb-1">Presentación del Medicamento</h6>
            <input 
              name="presentacion" 
              value={data.presentacion} 
              onChange={handleChange} 
              placeholder="Ej: Paracetamol 500mg - Caja x 10 tabletas" 
              className={`w-full p-2 border rounded ${errors.presentacion ? 'border-red-500' : ''}`} 
            />
            {errors.presentacion && (
              <p className="text-xs text-red-500 mt-1">La presentación es obligatoria</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <h6 className="text-sm font-semibold text-gray-700 mb-1">Cantidad por Unidad</h6>
              <input 
                type="number" 
                name="cantidadContenido" 
                value={data.cantidadContenido} 
                onChange={handleChange} 
                min="1" 
                className={`w-full p-2 border rounded ${errors.cantidadContenido ? 'border-red-500' : ''}`} 
              />
              {errors.cantidadContenido && (
                <p className="text-xs text-red-500 mt-1">Debe ser mayor a 0</p>
              )}
            </div>
            <div>
              <h6 className="text-sm font-semibold text-gray-700 mb-1">Unidad de Medida</h6>
              <select 
                name="unidadMedida" 
                value={data.unidadMedida} 
                onChange={handleChange} 
                className="w-full p-2 border rounded"
              >
                {unidadesMedida.map(unidad => (
                  <option key={unidad} value={unidad}>{unidad}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 text-sm text-yellow-800">
            <p className="font-semibold mb-1">⚠️ Atención:</p>
            <p>Los cambios no afectarán los lotes ya registrados. Para modificar stock, gestiona los lotes individualmente.</p>
          </div>

          <button 
            type="button" 
            onClick={handleSubmit} 
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarMedicamento;