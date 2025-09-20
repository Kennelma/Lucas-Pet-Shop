import React, { useEffect, useState } from "react";
import { verRegistro, borrarRegistro } from "../../../services/apiService";
import ModalNuevoAnimal from "./modal_nuevo_animal";
import ModalActualizarAnimal from "./modal_actualizar_animal";

const Animales = () => {
  const [animales, setAnimales] = useState([]);
  const [showModalNuevo, setShowModalNuevo] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);

  const fetchData = async () => {
    const data = await verRegistro("tbl_animales");
    setAnimales(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres borrar este animal?")) {
      await borrarRegistro("tbl_animales", id);
      fetchData();
    }
  };

  return (
    <div>
      <button onClick={() => setShowModalNuevo(true)}>+ Nuevo Animal</button>

      {showModalNuevo && (
        <ModalNuevoAnimal
          onClose={() => setShowModalNuevo(false)}
          onSuccess={fetchData}
        />
      )}

      {showModalEditar && animalSeleccionado && (
        <ModalActualizarAnimal
          animal={animalSeleccionado}
          onClose={() => {
            setShowModalEditar(false);
            setAnimalSeleccionado(null);
          }}
          onSuccess={fetchData}
        />
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginTop: "20px" }}>
        {animales.length === 0 ? (
          <p>No hay animales disponibles.</p>
        ) : (
          animales.map((animal) => (
            <div key={animal.id_animal_pk} style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              width: "220px",
              boxShadow: "2px 2px 8px rgba(0,0,0,0.1)",
              position: "relative"
            }}>
              <h3>{animal.nombre_animal}</h3>
              <p><b>Precio:</b> Lps {animal.precio_animal}</p>
              <p><b>Stock:</b> {animal.stock_animal}</p>
              <p><b>Sexo:</b> {animal.sexo}</p>
              <p><b>Especie:</b> {animal.especie}</p>

              {/* Botones de acción */}
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  onClick={() => {
                    setAnimalSeleccionado(animal);
                    setShowModalEditar(true);
                  }}
                  title="Editar"
                  style={{ background: "orange", border: "none", padding: "5px", cursor: "pointer", borderRadius: "5px" }}
                >
                  📝
                </button>
                <button
                  onClick={() => handleDelete(animal.id_animal_pk)}
                  title="Eliminar"
                  style={{ background: "red", color: "white", border: "none", padding: "5px", cursor: "pointer", borderRadius: "5px" }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Animales;
