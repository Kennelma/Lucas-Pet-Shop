import React, { useState, useEffect, useRef } from 'react';
import { Download, BarChart3, Table2, Wallet } from 'lucide-react';
import VistaNormal from './VistaNormal.js';
import Grafica from './Grafica.js';
import Tabla from './Tabla.js';
import { descargarPDF } from './pdf.js';

const Reportes = () => {
  const [ingresos, setIngresos] = useState([]);
  const [gastos, setGastos] = useState([]);
  
  const vistaNormalRef = useRef(null);
  const graficaRef = useRef(null);
  const tablaRef = useRef(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    // REEMPLAZA ESTO CON TU LÓGICA DE API
  };

  const scrollToSection = (ref) => {
    const element = ref.current;
    if (element) {
      const offset = 120; // Espacio para el header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
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
        
        {/* Botones de navegación flotantes SIN fondo blanco */}
        <div className="sticky top-4 z-50 p-4 mb-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => scrollToSection(vistaNormalRef)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl"
            >
              <Wallet className="w-5 h-5" />
              Vista Normal
            </button>
            <button
              onClick={() => scrollToSection(graficaRef)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl"
            >
              <BarChart3 className="w-5 h-5" />
              Gráfica
            </button>
            <button
              onClick={() => scrollToSection(tablaRef)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl"
            >
              <Table2 className="w-5 h-5" />
              Tabla
            </button>
            <button
              onClick={() => descargarPDF(datosTabla, totalIngresos, totalGastos, gananciaTotal)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
            >
              <Download className="w-5 h-5" />
              Descargar PDF
            </button>
          </div>
        </div>

        {/* Todas las vistas visibles en scroll */}
        <div ref={vistaNormalRef}>
          <VistaNormal 
            totalIngresos={totalIngresos}
            totalGastos={totalGastos}
            gananciaTotal={gananciaTotal}
          />
        </div>

        <div ref={graficaRef}>
          <Grafica 
            ingresos={ingresos}
            gastos={gastos}
            meses={meses}
          />
        </div>

        <div ref={tablaRef}>
          <Tabla 
            datosTabla={datosTabla}
            totalIngresos={totalIngresos}
            totalGastos={totalGastos}
            gananciaTotal={gananciaTotal}
          />
        </div>
      </div>
    </div>
  );
};

export default Reportes;