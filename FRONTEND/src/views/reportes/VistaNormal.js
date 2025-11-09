import React from 'react';

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
    </div>
  );
};

export default VistaNormal;