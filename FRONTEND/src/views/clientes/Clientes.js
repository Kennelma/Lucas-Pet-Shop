import { useEffect, useState } from "react";
import { verRegistro } from "../../services/apiService.js";
import PerfilCliente from "./PerfilCliente.js";
import TablaClientes from "./TablaClientes.js";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSeleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
  };

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await verRegistro("clientes");
        setClientes(data);
      } catch (err) {
        setError("Error al cargar los clientes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-100 space-y-6">
      <main className="bg-white border border-gray-300 rounded-xl overflow-hidden flex max-w-5xl w-full mx-auto">
        <PerfilCliente clienteSeleccionado={clienteSeleccionado} />
      </main>
      <TablaClientes
        clientes={clientes}
        setClientes={setClientes} 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        clienteSeleccionado={clienteSeleccionado}
        handleSeleccionarCliente={handleSeleccionarCliente}
      />
    </div>
  );
};

export default Clientes;
