import React, { useState, useEffect } from "react";

const ModalMovimiento = ({ isOpen, onClose, onSave, loteSeleccionado }) => {
  const [formData, setFormData] = useState({
    tipo_movimiento: "ENTRADA",
    cantidad: "",
    motivo: "",
    id_lote_fk: null
  });

  useEffect(() => {
    if (loteSeleccionado) {
      setFormData(prev => ({
        ...prev,
        id_lote_fk: loteSeleccionado
      }));
    }
  }, [loteSeleccionado]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Registrar Movimiento</h2>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Tipo de Movimiento</label>
            <select
              value={formData.tipo_movimiento}
              onChange={(e) => setFormData({...formData, tipo_movimiento: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
              <option value="AJUSTE">Ajuste</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Cantidad *</label>
            <input
              type="number"
              value={formData.cantidad}
              onChange={(e) => setFormData({...formData, cantidad: e.target.value})}
              placeholder="10"
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Motivo</label>
            <textarea
              value={formData.motivo}
              onChange={(e) => setFormData({...formData, motivo: e.target.value})}
              placeholder="Venta, donación, ajuste de inventario..."
              className="w-full px-3 py-2 border rounded"
              rows="3"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => onSave(formData)}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700"
          >
            Guardar
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 rounded font-semibold hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalMovimiento;