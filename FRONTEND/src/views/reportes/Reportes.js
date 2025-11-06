import React, { useState, useEffect } from 'react';
import { Download, BarChart3, Table2, Wallet } from 'lucide-react';
import VistaNormal from './VistaNormal.js';
import Grafica from './Grafica.js';
import Tabla from './Tabla.js';
import { descargarPDF } from './pdf.js';

const Reportes = () => {
  const [ingresos, setIngresos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [vistaActual, setVistaActual] = useState('normal');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    // REEMPLAZA ESTO CON TU LÓGICA DE API
  };

  const totalIngresos = ingresos.reduce((sum, item) => sum + (item.monto || 0), 0);
  const totalGastos = gastos.reduce((sum, item) => sum + (item.monto || 0), 0);
  const gananciaTotal = totalIngresos - totalGastos;

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const datosTabla = meses.map((mes, index) => {
    const ingreso = ingresos[index]?.monto || 0;
    const gasto = gastos[index]?.monto || 0;
    const ganancia = ingreso - gasto;
    return { mes, ingreso, gasto, ganancia };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6 border border-purple-100">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setVistaActual('normal')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                vistaActual === 'normal'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Wallet className="w-5 h-5" />
              Vista Normal
            </button>
            <button
              onClick={() => setVistaActual('grafica')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                vistaActual === 'grafica'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Gráfica
            </button>
            <button
              onClick={() => setVistaActual('tabla')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                vistaActual === 'tabla'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Table2 className="w-5 h-5" />
              Tabla
            </button>
            <button
              onClick={() => descargarPDF(datosTabla, totalIngresos, totalGastos, gananciaTotal)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              Descargar PDF
            </button>
          </div>
        </div>

        {vistaActual === 'normal' && (
          <VistaNormal 
            totalIngresos={totalIngresos}
            totalGastos={totalGastos}
            gananciaTotal={gananciaTotal}
          />
        )}

        {vistaActual === 'grafica' && (
          <Grafica 
            ingresos={ingresos}
            gastos={gastos}
            meses={meses}
          />
        )}

        {vistaActual === 'tabla' && (
          <Tabla 
            datosTabla={datosTabla}
            totalIngresos={totalIngresos}
            totalGastos={totalGastos}
            gananciaTotal={gananciaTotal}
          />
        )}
      </div>
    </div>
  );
};

export default Reportes;