import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

const VistaNormal = ({ totalIngresos, totalGastos, gananciaTotal, anioSeleccionado }) => {
  return (
    <div className="mt-6">
      <div className="bg-white rounded-2xl shadow-md p-8 mb-6 border border-purple-100">
        <h1 className="text-4xl font-bold text-slate-700 mb-2">
          📊 Reportes Financieros
        </h1>
        <p className="text-slate-500 text-lg">
          Análisis de ingresos, gastos y ganancias del año {anioSeleccionado}
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
    </div>
  );
};

export default VistaNormal;
