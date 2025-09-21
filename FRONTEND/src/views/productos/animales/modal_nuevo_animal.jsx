import React, { useState } from "react";
import { insertarRegistro } from "../../../services/apiService";

const ModalNuevoAnimal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre_animal: "",
    precio_animal: "",
    stock_animal: "",
    sexo: "",
    especie: ""
  });

  const handleChange = e => {
    const { name, value } = e.target;

    if (["precio_animal", "stock_animal"].includes(name)) {
      if (value !== "" && parseFloat(value) < 1) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await insertarRegistro("tbl_animales", formData);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-semibold mb-4">Nuevo Animal</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            name="nombre_animal"
            placeholder="Nombre"
            value={formData.nombre_animal}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
          <input
            type="number"
            step="0.01"
            name="precio_animal"
            placeholder="Precio"
            value={formData.precio_animal}
            onChange={handleChange}
            min="1"
            required
            className="p-2 border rounded"
          />
          <input
            type="number"
            name="stock_animal"
            placeholder="Stock"
            value={formData.stock_animal}
            onChange={handleChange}
            min="1"
            required
            className="p-2 border rounded"
          />
          <select
            name="sexo"
            value={formData.sexo}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          >
            <option value="">Sexo</option>
            <option value="HEMBRA">Hembra</option>
            <option value="MACHO">Macho</option>
          </select>
          <input
            name="especie"
            placeholder="Especie"
            value={formData.especie}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
          <div className="flex justify-between mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Guardar
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

export default ModalNuevoAnimal;
