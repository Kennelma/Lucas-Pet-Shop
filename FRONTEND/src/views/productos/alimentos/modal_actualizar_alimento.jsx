import React, { useState, useEffect } from "react";
import { actualizarRegistro } from "../../../services/apiService";

const ModalActualizarAlimento = ({ alimento, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre_alimento: "",
    precio_alimento: "",
    stock_alimento: "",
    alimento_destinado: "",
    peso_alimento: ""
  });

  useEffect(() => {
    if (alimento) {
      setFormData({
        nombre_alimento: alimento.nombre_alimento,
        precio_alimento: alimento.precio_alimento,
        stock_alimento: alimento.stock_alimento,
        alimento_destinado: alimento.alimento_destinado,
        peso_alimento: alimento.peso_alimento
      });
    }
  }, [alimento]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["precio_alimento", "stock_alimento", "peso_alimento"].includes(name)) {
      if (value !== "" && parseFloat(value) < 1) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actualizarRegistro("tbl_alimentos", alimento.id_alimento_pk, formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al actualizar alimento:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Editar Alimento</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            name="nombre_alimento"
            placeholder="Nombre"
            value={formData.nombre_alimento}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
          <input
            type="number"
            step="0.01"
            name="precio_alimento"
            placeholder="Precio"
            value={formData.precio_alimento}
            onChange={handleChange}
            required
            min="1"
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="stock_alimento"
            placeholder="Stock"
            value={formData.stock_alimento}
            onChange={handleChange}
            required
            min="1"
            className="p-2 border rounded"
          />
          <select
            name="alimento_destinado"
            value={formData.alimento_destinado}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          >
            <option value="">Seleccione destino</option>
            <option value="PERROS">PERROS</option>
            <option value="GATOS">GATOS</option>
            <option value="TORTUGAS">TORTUGAS</option>
            <option value="CANARIOS">CANARIOS</option>
            <option value="CONEJOS">CONEJOS</option>
          </select>
          <input
            type="number"
            name="peso_alimento"
            placeholder="Peso"
            value={formData.peso_alimento}
            onChange={handleChange}
            required
            min="1"
            className="p-2 border rounded"
          />
          <div className="flex justify-between mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Actualizar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalActualizarAlimento;
