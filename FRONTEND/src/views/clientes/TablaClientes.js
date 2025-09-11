import { useState } from "react";
import ModalNuevoCliente from "./Modal-NuevoCliente.js"
import { insertarRegistro } from "../../services/apiService.js"; 

const TablaClientes = ({
  clientes,
  setClientes,
  searchTerm,
  setSearchTerm,
  clienteSeleccionado,
  handleSeleccionarCliente
}) => {

  const [modalOpen, setModalOpen] = useState(false); // abrir/cerrar modal

  // Función que se pasa al modal para guardar el cliente
  const handleAgregarCliente = async (formData) => {
  try {
    const nuevoCliente = await insertarRegistro("clientes", {
      nombre_cliente: formData.nombre,
      telefono_cliente: formData.telefono,
      identidad_cliente: formData.identidad,
    });
    
    if (nuevoCliente) {
      setClientes(prevClientes => [...prevClientes, nuevoCliente]); // Actualiza la tabla automáticamente
      setModalOpen(false);
    }
  } catch (error) {
    console.error("Error al agregar cliente:", error);
  }
};

  return (
    <section className="bg-white border border-gray-300 rounded-xl p-6 overflow-y-auto flex flex-col max-w-5xl w-full mx-auto">
      <div className="flex justify-center mb-4">
        <span className="font-semibold text-gray-700">CLIENTES REGISTRADOS</span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
         <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-200 whitespace-nowrap"
          onClick={() => setModalOpen(true)} // abrir modal
        >
          Nuevo Cliente
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
              <th className="py-3 px-6 text-left border-b border-gray-300">ID-Cliente</th>
              <th className="py-3 px-6 text-left border-b border-gray-300">Nombre</th>
              <th className="py-3 px-6 text-left border-b border-gray-300">Teléfono</th>
              <th className="py-3 px-6 text-center border-b border-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {clientes
              .filter((cliente) => {
                const nombre = (cliente.nombre_cliente || "").toLowerCase();
                const telefono = String(cliente.telefono_cliente || "");
                const term = searchTerm.toLowerCase();
                return nombre.includes(term) || telefono.includes(term);
              })
              .map((cliente) => (
                <tr
                  key={cliente.identidad_cliente}
                  className={`hover:bg-gray-100 transition duration-300 ease-in-out cursor-pointer ${
                    clienteSeleccionado?.identidad_cliente === cliente.identidad_cliente
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : ""
                  }`}
                  onClick={() => handleSeleccionarCliente(cliente)}
                >
                  <td className="py-3 px-6 border-b">{cliente.id_cliente_pk}</td>
                  <td className="py-3 px-6 border-b font-medium">{cliente.nombre_cliente}</td>
                  <td className="py-3 px-6 border-b font-medium">{cliente.telefono_cliente || "—"}</td>
                  <td className="py-3 px-6 border-b text-center">
                    <div className="flex justify-center space-x-3">
                      <button className="text-purple-500 hover:scale-110 transform transition">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="text-red-500 hover:scale-110 transform transition">
                        <i className="fas fa-trash"></i>
                      </button>
                      <button className="text-blue-500 hover:scale-110 transform transition">
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {clientes.filter((cliente) => {
        const nombre = (cliente.nombre_cliente || "").toLowerCase();
        const telefono = String(cliente.telefono_cliente || "");
        const term = searchTerm.toLowerCase();
        return nombre.includes(term) || telefono.includes(term);
      }).length === 0 && (
        <p className="text-gray-500 text-center py-6">No se encontraron clientes</p>
      )}

      {/*MODAL DE NUEVO CLIENTE*/}
      <ModalNuevoCliente
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAgregarCliente}
      />
      
    </section>
  );
};

export default TablaClientes;
