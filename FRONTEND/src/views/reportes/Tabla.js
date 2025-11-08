import React from 'react';

const Tabla = ({ datosTabla, totalIngresos, totalGastos, gananciaTotal }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-purple-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-slate-700 flex items-center">
          <span className="bg-gradient-to-r from-purple-100 to-blue-100 text-slate-700 rounded-xl px-4 py-2 mr-3 border border-purple-200">
            📋 Detalle Mensual
          </span>
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
              <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Mes</th>
              <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">Ingresos</th>
              <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">Gastos</th>
              <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">Ganancia</th>
            </tr>
          </thead>
          <tbody>
            {datosTabla.map((fila, index) => (
              <tr 
                key={index} 
                className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                }`}
              >
                <td className="px-6 py-4 text-sm font-medium text-slate-700">{fila.mes}</td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-green-700">
                  L {fila.ingreso.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-red-700">
                  L {fila.gasto.toLocaleString()}
                </td>
                <td className={`px-6 py-4 text-sm text-right font-bold ${
                  fila.ganancia >= 0 ? 'text-blue-700' : 'text-orange-700'
                }`}>
                  L {fila.ganancia.toLocaleString()}
                </td>
              </tr>
            ))}
            <tr className="bg-gradient-to-r from-slate-100 to-slate-200 font-bold">
              <td className="px-6 py-4 text-sm text-slate-800">TOTAL</td>
              <td className="px-6 py-4 text-sm text-right text-green-800">
                L {totalIngresos.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-sm text-right text-red-800">
                L {totalGastos.toLocaleString()}
              </td>
              <td className={`px-6 py-4 text-sm text-right ${
                gananciaTotal >= 0 ? 'text-blue-800' : 'text-orange-800'
              }`}>
                L {gananciaTotal.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tabla;