import React, { useEffect, useState } from "react";
import { verRegistro, borrarRegistro } from "../../../services/apiService";
import ModalNuevoAlimento from "./modal_nuevo_alimento";
import ModalActualizarAlimento from "./modal_actualizar_alimento";

const Alimentos = () => {
  const [alimentos, setAlimentos] = useState([]);
  const [showModalNuevo, setShowModalNuevo] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [alimentoSeleccionado, setAlimentoSeleccionado] = useState(null);

  const fetchData = async () => {
    const data = await verRegistro("tbl_alimentos");
    setAlimentos(data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres borrar este alimento?")) {
      await borrarRegistro("tbl_alimentos", id);
      fetchData();
    }
  };

  return (
    <div>
      <button onClick={() => setShowModalNuevo(true)}>+ Nuevo Alimento</button>

      {showModalNuevo && <ModalNuevoAlimento onClose={() => setShowModalNuevo(false)} onSuccess={fetchData} />}
      {showModalEditar && alimentoSeleccionado && (
        <ModalActualizarAlimento
          alimento={alimentoSeleccionado}
          onClose={() => { setShowModalEditar(false); setAlimentoSeleccionado(null); }}
          onSuccess={fetchData}
        />
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginTop: "20px" }}>
        {alimentos.length === 0 ? (
          <p>No hay alimentos disponibles.</p>
        ) : (
          alimentos.map((alimento) => (
            <div key={alimento.id_alimento_pk} style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              width: "220px",
              boxShadow: "2px 2px 8px rgba(0,0,0,0.1)",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}>
              <h3>{alimento.nombre_alimento}</h3>
              <p><b>Precio:</b> Lps {alimento.precio_alimento}</p>
              <p><b>Stock:</b> {alimento.stock_alimento}</p>
              <p><b>Destino:</b> {alimento.alimento_destinado}</p>
              <p><b>Peso:</b> {alimento.peso_alimento}</p>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button onClick={() => { setAlimentoSeleccionado(alimento); setShowModalEditar(true); }} title="Editar" style={{ background: "orange", border: "none", padding: "5px", cursor: "pointer", borderRadius: "5px" }}>📝</button>
                <button onClick={() => handleDelete(alimento.id_alimento_pk)} title="Eliminar" style={{ background: "red", color: "white", border: "none", padding: "5px", cursor: "pointer", borderRadius: "5px" }}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alimentos;
