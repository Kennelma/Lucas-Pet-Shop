import { useEffect, useState } from "react";
import { verRegistro } from "../../services/apiService.js";
import clienteImage from '../../views/clientes/clientes-dog.png';

const Clientes = () => {
  // ESTADOS USADOS
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar todos los registros de la tabla "clientes"
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

  // FUNCION PARA SELECCIONAR UN CLIENTE Y MOSTRAR SU INFORMACION
  const handleSeleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[1fr_500px] gap-4 p-4 bg-gray-100">
      
      {/* CONTENEDOR DE INFORMACIÓN DEL HISTORIAL DE COMPRA DEL CLIENTE */}
      <main className="bg-white border border-gray-300 rounded-xl overflow-hidden flex flex-col">
        
        {/*HEADER CON INFO DEL CLIENTE - FIJO*/}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
          <span>PERFIL DE CLIENTE </span>
          {clienteSeleccionado ? (
            <div className="flex items-center gap-4">
              <img
                src={clienteImage}
                alt="Cliente"
                className="w-16 h-16 object-cover rounded-full border-2 border-white shadow-md"
              />
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800">{clienteSeleccionado.nombre_cliente}</h3>
                <p className="text-sm text-gray-600">ID: {clienteSeleccionado.identidad_cliente}</p>
                <p className="text-sm text-gray-600">
                  {clienteSeleccionado.telefono_cliente || "Sin teléfono"} | 
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Selecciona un cliente para ver su historial</p>
            </div>
          )}
        </div>

        {/* HISTORIAL DE COMPRAS - SCROLLABLE */}
        <div className="flex-1 p-4 overflow-y-auto min-h-0">
          {clienteSeleccionado ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-700">Historial de Compras</h4>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Total: 15 compras
                </span>
              </div>
              
              <div className="space-y-3">
                {/* Simulando múltiples compras para probar el scroll */}
                {[...Array(10)].map((_, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-400 hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm text-gray-800">Compra #{String(index + 1).padStart(3, '0')}</span>
                      <span className="text-xs text-gray-500">12/0{(index % 9) + 1}/2024</span>
                    </div>
                    <p className="text-gray-600 text-xs mb-2">
                      {index % 3 === 0 && "2x Correa de cuero, 1x Collar anti-pulgas"}
                      {index % 3 === 1 && "1x Alimento Premium 15kg, 3x Juguetes"}
                      {index % 3 === 2 && "1x Cama para perro, 2x Snacks, 1x Champú"}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 font-semibold text-sm">
                        ${(Math.random() * 100 + 20).toFixed(2)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        index % 4 === 0 ? 'bg-green-100 text-green-700' :
                        index % 4 === 1 ? 'bg-yellow-100 text-yellow-700' :
                        index % 4 === 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {index % 4 === 0 ? 'Completado' :
                         index % 4 === 1 ? 'Pendiente' :
                         index % 4 === 2 ? 'Procesando' : 'Cancelado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p className="text-center text-sm">Historial de compras</p>
              <p className="text-center text-xs mt-1">Selecciona un cliente para ver sus compras</p>
            </div>
          )}
        </div>
      </main>

      {/*CONTENEDOR QUE MUESTRA TODOS LOS CLIENTES EN TABLA*/}
      <section className="bg-white border border-gray-300 rounded-xl p-6 overflow-y-auto flex flex-col">
        <div className="flex justify-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">CLIENTES REGISTRADOS</h3>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <p className="text-red-500 text-center py-6">{error}</p>
        ) : clientes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2 border-b text-left">ID-Cliente</th>
                  <th className="px-4 py-2 border-b text-left">Nombre</th>
                  <th className="px-4 py-2 border-b text-left">Teléfono</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {clientes.map((cliente) => (
                  <tr
                    key={cliente.identidad_cliente}
                    className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                      clienteSeleccionado?.identidad_cliente === cliente.identidad_cliente 
                        ? 'bg-blue-100 border-l-4 border-blue-500' 
                        : ''
                    }`}
                    onClick={() => handleSeleccionarCliente(cliente)}
                  >
                    <td className="px-4 py-2 border-b">{cliente.id_cliente_pk}</td>
                    <td className="px-4 py-2 border-b font-medium">{cliente.nombre_cliente}</td>
                    <td className="px-4 py-2 border-b font-medium">{cliente.telefono_cliente}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">No hay clientes registrados</p>
        )}
      </section>
    </div>
  );
};

export default Clientes;