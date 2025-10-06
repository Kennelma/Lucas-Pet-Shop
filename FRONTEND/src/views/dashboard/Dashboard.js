
import axios from "axios";


const Dashboard = () => {

  const API_URL = "http://localhost:4000/api"; // <- tu backend en el nuevo puerto
      return (
      <div className="p-6 bg-gray-100 min-h-screen">
        {/* Alerta Inventario */}
        <div className="mb-6 flex justify-between items-center">
          <div className="bg-white shadow-md rounded-xl border-l-4 border-red-500 p-4 flex items-center w-full">
            <div className="flex-1">
              <p className="text-sm text-gray-600 font-semibold">⚠️ Alerta Inventario</p>
              <p className="text-gray-800">Medicamento Simparica LOTE1 está por vencerse.</p>
            </div>
            <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
              INVENTARIO
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Accesos Directos */}
          <div className="col-span-2">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Accesos Directos</h2>
            <div className="grid grid-cols-3 gap-4">
              <button className="bg-white shadow-md p-6 rounded-xl flex flex-col items-center justify-center hover:bg-blue-50">
                <span className="text-3xl">🧾</span>
                <p className="mt-2 text-gray-700 font-medium">Facturación</p>
              </button>
              <button className="bg-white shadow-md p-6 rounded-xl flex flex-col items-center justify-center hover:bg-blue-50">
                <span className="text-3xl">📊</span>
                <p className="mt-2 text-gray-700 font-medium">Reportes</p>
              </button>
              <button className="bg-white shadow-md p-6 rounded-xl flex flex-col items-center justify-center hover:bg-blue-50">
                <span className="text-3xl">👥</span>
                <p className="mt-2 text-gray-700 font-medium">Clientes</p>
              </button>
            </div>
          </div>

          {/* Mini tabla de gastos */}
          <div className="bg-yellow-50 shadow-md rounded-xl p-4">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Registrar Gastos</h2>
            <table className="w-full text-sm text-left text-gray-600">
              <thead>
                <tr>
                  <th className="pb-2 font-semibold">Descripción</th>
                  <th className="pb-2 font-semibold text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Compra alimento</td>
                  <td className="py-2 text-right">L. 1,500</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Pago servicios</td>
                  <td className="py-2 text-right">L. 800</td>
                </tr>
                <tr>
                  <td className="py-2">Mantenimiento</td>
                  <td className="py-2 text-right">L. 1,200</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
}

export default Dashboard
