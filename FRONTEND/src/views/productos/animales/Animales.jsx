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
    <div className="p-4">
      <button
        onClick={() => setShowModalNuevo(true)}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        + Nuevo Animal
      </button>

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

      <div className="flex flex-wrap gap-4">
        {animales.length === 0 ? (
          <p>No hay animales disponibles.</p>
        ) : (
          animales.map((animal) => (
            <div
              key={animal.id_animal_pk}
              className="border rounded-lg p-4 w-56 shadow hover:shadow-lg relative bg-white"
            >
              <h3 className="text-lg font-semibold mb-2">{animal.nombre_animal}</h3>
              <p><span className="font-bold">Precio:</span> Lps {animal.precio_animal}</p>
              <p><span className="font-bold">Stock:</span> {animal.stock_animal}</p>
              <p><span className="font-bold">Sexo:</span> {animal.sexo}</p>
              <p><span className="font-bold">Especie:</span> {animal.especie}</p>

              {/* Botones de acción */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setAnimalSeleccionado(animal);
                    setShowModalEditar(true);
                  }}
                  title="Editar"
                  className="flex-1 bg-orange-500 text-white rounded p-1 hover:bg-orange-600"
                >
                  📝
                </button>
                <button
                  onClick={() => handleDelete(animal.id_animal_pk)}
                  title="Eliminar"
                  className="flex-1 bg-red-500 text-white rounded p-1 hover:bg-red-600"
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
