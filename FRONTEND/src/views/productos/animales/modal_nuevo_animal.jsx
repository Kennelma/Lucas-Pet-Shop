// modal_nuevo_animal.jsx
import React, { useState } from "react";
import { insertarRegistro } from "../../../services/apiService";

const ModalNuevoAnimal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre_animal: "",
    precio_animal: "",
    stock_animal: "",
    sexo: "",
    especie: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await insertarRegistro("tbl_animales", formData);
      onSuccess(); // refresca la lista
      onClose();   // cierra el modal
    } catch (error) {
      console.error("Error al insertar animal:", error);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Agregar Nuevo Animal</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="nombre_animal"
            placeholder="Nombre del animal"
            value={formData.nombre_animal}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            step="0.01"
            name="precio_animal"
            placeholder="Precio"
            value={formData.precio_animal}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="stock_animal"
            placeholder="Stock"
            value={formData.stock_animal}
            onChange={handleChange}
            required
          />
          <select
            name="sexo"
            value={formData.sexo}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione sexo</option>
            <option value="HEMBRA">Hembra</option>
            <option value="MACHO">Macho</option>
          </select>
          <input
            type="text"
            name="especie"
            placeholder="Especie"
            value={formData.especie}
            onChange={handleChange}
            required
          />

          <div style={styles.buttons}>
            <button type="submit">Guardar</button>
            <button type="button" onClick={onClose} style={{ background: "gray" }}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0,
    width: "100%", height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  modal: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "350px",
    boxShadow: "2px 2px 10px rgba(0,0,0,0.2)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  buttons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px",
  },
};

export default ModalNuevoAnimal;
