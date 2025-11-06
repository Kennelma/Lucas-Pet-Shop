import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import { TrendingUp, TrendingDown, Wallet, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

// ============================================
// IMPORTA TUS MÓDULOS AQUÍ
// ============================================
// import { obtenerTotalesFacturas } from './ruta/a/tu/modulo/facturas';
// import { obtenerGastosMensuales } from './ruta/a/tu/modulo/gastos';

// ============================================
// COMPONENTE PRINCIPAL - MÓDULO DE REPORTES
// ============================================
const Reportes = () => {
  const [ingresos, setIngresos] = useState([]);
  const [gastos, setGastos] = useState([]);

  // ============================================
  // CARGAR DATOS AL MONTAR EL COMPONENTE
  // ============================================
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    // ============================================
    // REEMPLAZA ESTO CON TU LÓGICA DE API
    // ============================================
    
    // EJEMPLO PARA INGRESOS (TOTALES DE FACTURAS):
    // ----------------------------------------------
    // const datosFacturas = await obtenerTotalesFacturas();
    // const ingresosPorMes = [
    //   { mes: 'Enero', monto: datosFacturas.enero || 0 },
    //   { mes: 'Febrero', monto: datosFacturas.febrero || 0 },
    //   { mes: 'Marzo', monto: datosFacturas.marzo || 0 },
    //   { mes: 'Abril', monto: datosFacturas.abril || 0 },
    //   { mes: 'Mayo', monto: datosFacturas.mayo || 0 },
    //   { mes: 'Junio', monto: datosFacturas.junio || 0 },
    //   { mes: 'Julio', monto: datosFacturas.julio || 0 },
    //   { mes: 'Agosto', monto: datosFacturas.agosto || 0 },
    //   { mes: 'Septiembre', monto: datosFacturas.septiembre || 0 },
    //   { mes: 'Octubre', monto: datosFacturas.octubre || 0 },
    //   { mes: 'Noviembre', monto: datosFacturas.noviembre || 0 },
    //   { mes: 'Diciembre', monto: datosFacturas.diciembre || 0 }
    // ];
    // setIngresos(ingresosPorMes);

    // EJEMPLO PARA GASTOS:
    // ----------------------------------------------
    // const datosGastos = await obtenerGastosMensuales();
    // const gastosPorMes = [
    //   { mes: 'Enero', monto: datosGastos.enero || 0 },
    //   { mes: 'Febrero', monto: datosGastos.febrero || 0 },
    //   { mes: 'Marzo', monto: datosGastos.marzo || 0 },
    //   { mes: 'Abril', monto: datosGastos.abril || 0 },
    //   { mes: 'Mayo', monto: datosGastos.mayo || 0 },
    //   { mes: 'Junio', monto: datosGastos.junio || 0 },
    //   { mes: 'Julio', monto: datosGastos.julio || 0 },
    //   { mes: 'Agosto', monto: datosGastos.agosto || 0 },
    //   { mes: 'Septiembre', monto: datosGastos.septiembre || 0 },
    //   { mes: 'Octubre', monto: datosGastos.octubre || 0 },
    //   { mes: 'Noviembre', monto: datosGastos.noviembre || 0 },
    //   { mes: 'Diciembre', monto: datosGastos.diciembre || 0 }
    // ];
    // setGastos(gastosPorMes);

    // ============================================
    // ESTRUCTURA DE DATOS ESPERADA:
    // ============================================
    // Cada array debe tener 12 objetos (uno por mes) con esta estructura:
    // [
    //   { mes: 'Enero', monto: número },
    //   { mes: 'Febrero', monto: número },
    //   ... hasta Diciembre
    // ]
  };

  // ============================================
  // CALCULAR TOTALES Y GANANCIA
  // ============================================
  const totalIngresos = ingresos.reduce((sum, item) => sum + (item.monto || 0), 0);
  const totalGastos = gastos.reduce((sum, item) => sum + (item.monto || 0), 0);
  const gananciaTotal = totalIngresos - totalGastos;

  // ============================================
  // PREPARAR DATOS DE LA TABLA
  // ============================================
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const datosTabla = meses.map((mes, index) => {
    const ingreso = ingresos[index]?.monto || 0;
    const gasto = gastos[index]?.monto || 0;
    const ganancia = ingreso - gasto;
    return { mes, ingreso, gasto, ganancia };
  });

  // ============================================
  // FUNCIÓN PARA DESCARGAR PDF
  // ============================================
  const descargarPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.setTextColor(71, 85, 105);
    doc.text('Reportes Financieros', 105, 20, { align: 'center' });
    
    // Fecha
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    const fecha = new Date().toLocaleDateString('es-HN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(`Generado: ${fecha}`, 105, 28, { align: 'center' });
    
    // Resumen
    doc.setFontSize(12);
    doc.setTextColor(34, 197, 94);
    doc.text(`Total Ingresos: L ${totalIngresos.toLocaleString()}`, 20, 45);
    
    doc.setTextColor(239, 68, 68);
    doc.text(`Total Gastos: L ${totalGastos.toLocaleString()}`, 20, 53);
    
    doc.setTextColor(gananciaTotal >= 0 ? 59 : 249, gananciaTotal >= 0 ? 130 : 115, gananciaTotal >= 0 ? 246 : 22);
    doc.text(`Ganancia Total: L ${gananciaTotal.toLocaleString()}`, 20, 61);
    
    // Tabla
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // Encabezados de tabla
    doc.setFillColor(243, 244, 246);
    doc.rect(20, 75, 170, 10, 'F');
    doc.setFont(undefined, 'bold');
    doc.text('Mes', 25, 82);
    doc.text('Ingresos', 70, 82);
    doc.text('Gastos', 110, 82);
    doc.text('Ganancia', 150, 82);
    
    // Datos de la tabla
    doc.setFont(undefined, 'normal');
    let y = 92;
    
    datosTabla.forEach((fila, index) => {
      // Alternar color de fondo
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(20, y - 5, 170, 8, 'F');
      }
      
      doc.setTextColor(71, 85, 105);
      doc.text(fila.mes, 25, y);
      
      doc.setTextColor(34, 197, 94);
      doc.text(`L ${fila.ingreso.toLocaleString()}`, 70, y);
      
      doc.setTextColor(239, 68, 68);
      doc.text(`L ${fila.gasto.toLocaleString()}`, 110, y);
      
      doc.setTextColor(fila.ganancia >= 0 ? 59 : 249, fila.ganancia >= 0 ? 130 : 115, fila.ganancia >= 0 ? 246 : 22);
      doc.text(`L ${fila.ganancia.toLocaleString()}`, 150, y);
      
      y += 8;
      
      // Nueva página si es necesario
      if (y > 270 && index < datosTabla.length - 1) {
        doc.addPage();
        y = 20;
      }
    });
    
    // Guardar PDF
    doc.save('reportes-financieros.pdf');
  };

  // ============================================
  // CONFIGURACIÓN GRÁFICO COMBINADO: INGRESOS Y GASTOS
  // ============================================
  const dataComparado = {
    labels: meses,
    datasets: [
      {
        label: 'Ingresos',
        data: ingresos.length > 0 ? ingresos.map(item => item.monto) : Array(12).fill(0),
        backgroundColor: 'rgba(167, 243, 208, 0.8)',
        borderColor: 'rgba(52, 211, 153, 1)',
        borderWidth: 2
      },
      {
        label: 'Gastos',
        data: gastos.length > 0 ? gastos.map(item => item.monto) : Array(12).fill(0),
        backgroundColor: 'rgba(254, 202, 202, 0.8)',
        borderColor: 'rgba(248, 113, 113, 1)',
        borderWidth: 2
      }
    ]
  };

  // ============================================
  // OPCIONES DE LOS GRÁFICOS (BARRAS) - AUTO ESCALA
  // ============================================
  const valores = [
    ...ingresos.map(i => i.monto || 0),
    ...gastos.map(g => g.monto || 0)
  ];
  const maxValor = Math.max(...valores, 0);
  const paso = Math.ceil(maxValor / 8 / 1000) * 1000;
  const limiteSuperior = paso * 8 || 10000;
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': L ' + context.parsed.y.toLocaleString();
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: limiteSuperior,
        ticks: {
          stepSize: paso,
          callback: function(value) {
            return 'L ' + value.toLocaleString();
          }
        },
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // ============================================
  // RENDERIZADO DEL COMPONENTE (JSX)
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ENCABEZADO */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-6 border border-purple-100">
          <h1 className="text-4xl font-bold text-slate-700 mb-2">
            📊 Reportes Financieros
          </h1>
          <p className="text-slate-500 text-lg">
            Análisis mensual de ingresos, gastos y ganancias
          </p>
        </div>

        {/* TARJETAS DE RESUMEN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Total Ingresos */}
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

          {/* Total Gastos */}
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

          {/* Ganancia Total */}
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

        {/* GRÁFICO COMBINADO: INGRESOS Y GASTOS */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-purple-100">
          <h2 className="text-2xl font-bold text-slate-700 mb-4 flex items-center">
            <span className="bg-gradient-to-r from-green-100 to-red-100 text-slate-700 rounded-xl px-4 py-2 mr-3 border border-slate-200">
              💰 Comparativa: Ingresos vs Gastos
            </span>
          </h2>
          <div style={{ height: '500px' }}>
            <Chart type="bar" data={dataComparado} options={options} />
          </div>
        </div>

        {/* TABLA DE DATOS */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-700 flex items-center">
              <span className="bg-gradient-to-r from-purple-100 to-blue-100 text-slate-700 rounded-xl px-4 py-2 mr-3 border border-purple-200">
                📋 Detalle Mensual
              </span>
            </h2>
            <button
              onClick={descargarPDF}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              Descargar PDF
            </button>
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

        {/* INSTRUCCIONES */}
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
    </div>
  );
};

export default Reportes;