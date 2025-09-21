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
    <div className="p-6">
      <button
        onClick={() => setShowModalNuevo(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
      >
        + Nuevo Alimento
      </button>

      {showModalNuevo && (
        <ModalNuevoAlimento
          onClose={() => setShowModalNuevo(false)}
          onSuccess={fetchData}
        />
      )}

      {showModalEditar && alimentoSeleccionado && (
        <ModalActualizarAlimento
          alimento={alimentoSeleccionado}
          onClose={() => {
            setShowModalEditar(false);
            setAlimentoSeleccionado(null);
          }}
          onSuccess={fetchData}
        />
      )}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
        {alimentos.length === 0 ? (
          <p className="text-gray-600">No hay alimentos disponibles.</p>
        ) : (
          alimentos.map((alimento) => (
            <div
              key={alimento.id_alimento_pk}
              className="bg-white shadow-lg rounded-xl p-5 border border-gray-200 flex flex-col justify-between hover:shadow-xl transition"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {alimento.nombre_alimento}
              </h3>
              <p className="text-gray-600">
                <b>Precio:</b> Lps {alimento.precio_alimento}
              </p>
              <p className="text-gray-600">
                <b>Stock:</b> {alimento.stock_alimento}
              </p>
              <p className="text-gray-600">
                <b>Destino:</b> {alimento.alimento_destinado}
              </p>
              <p className="text-gray-600">
                <b>Peso:</b> {alimento.peso_alimento}
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setAlimentoSeleccionado(alimento);
                    setShowModalEditar(true);
                  }}
                  title="Editar"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg shadow transition"
                >
                  📝
                </button>
                <button
                  onClick={() => handleDelete(alimento.id_alimento_pk)}
                  title="Eliminar"
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg shadow transition"
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

export default Alimentos;
