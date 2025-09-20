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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Editar Alimento</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input type="text" name="nombre_alimento" placeholder="Nombre" value={formData.nombre_alimento} onChange={handleChange} required />
          <input type="number" step="0.01" name="precio_alimento" placeholder="Precio" value={formData.precio_alimento} onChange={handleChange} required />
          <input type="number" name="stock_alimento" placeholder="Stock" value={formData.stock_alimento} onChange={handleChange} required />

          <select name="alimento_destinado" value={formData.alimento_destinado} onChange={handleChange} required>
            <option value="">Seleccione destino</option>
            <option value="PERROS">PERROS</option>
            <option value="GATOS">GATOS</option>
            <option value="TORTUGAS">TORTUGAS</option>
            <option value="CANARIOS">CANARIOS</option>
            <option value="CONEJOS">CONEJOS</option>
          </select>

          <input type="text" name="peso_alimento" placeholder="Peso" value={formData.peso_alimento} onChange={handleChange} required />

          <div style={styles.buttons}>
            <button type="submit">Actualizar</button>
            <button type="button" onClick={onClose} style={{ background: "gray" }}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" },
  modal: { background: "#fff", padding: "20px", borderRadius: "10px", width: "350px", boxShadow: "2px 2px 10px rgba(0,0,0,0.2)" },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  buttons: { display: "flex", justifyContent: "space-between", marginTop: "15px" },
};

export default ModalActualizarAlimento;
