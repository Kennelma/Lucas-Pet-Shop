import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const VistaNormal = ({ totalIngresos, totalGastos, gananciaTotal }) => {
  return (
    <div>
      <div className="bg-white rounded-2xl shadow-md p-8 mb-6 border border-purple-100">
        <h1 className="text-4xl font-bold text-slate-700 mb-2">
          📊 Reportes Financieros
        </h1>
        <p className="text-slate-500 text-lg">
          Análisis mensual de ingresos, gastos y ganancias
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl shadow-md p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-medium mb-1">Total Ingresos</p>
              <p className="text-3xl font-bold text-green-800">
                L {totalIngresos.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-full p-3 shadow-sm">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl shadow-md p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 text-sm font-medium mb-1">Total Gastos</p>
              <p className="text-3xl font-bold text-red-800">
                L {totalGastos.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-full p-3 shadow-sm">
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className={`bg-gradient-to-br ${gananciaTotal >= 0 ? 'from-blue-100 to-cyan-100' : 'from-orange-100 to-amber-100'} rounded-2xl shadow-md p-6 border ${gananciaTotal >= 0 ? 'border-blue-200' : 'border-orange-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${gananciaTotal >= 0 ? 'text-blue-700' : 'text-orange-700'} text-sm font-medium mb-1`}>Ganancia Total</p>
              <p className={`text-3xl font-bold ${gananciaTotal >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                L {gananciaTotal.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-full p-3 shadow-sm">
              <Wallet className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-r-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-amber-900 mb-3">
          ⚠️ INSTRUCCIONES IMPORTANTES
        </h3>
        <ul className="text-sm text-amber-800 space-y-2">
          <li>• 1. Importa tus módulos al inicio del archivo</li>
          <li>• 2. Modifica la función cargarDatos() para cargar datos reales</li>
          <li>• 3. Estructura requerida: Array de 12 objetos con {`{ mes: 'Enero', monto: número }`}</li>
          <li>• 4. Ingresos: Totales de la tabla de facturas por cada mes</li>
          <li>• 5. Gastos: Totales de la tabla de gastos por cada mes</li>
          <li>• 6. El gráfico muestra ingresos y gastos juntos para comparar fácilmente</li>
          <li>• 7. La tabla muestra el detalle mensual con las ganancias calculadas</li>
          <li>• 8. Usa el botón "Descargar PDF" para exportar el reporte completo</li>
        </ul>
      </div>
    </div>
  );
};

export default VistaNormal;