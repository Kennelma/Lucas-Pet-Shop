import React, { useMemo } from 'react';
import { Chart } from 'primereact/chart';

const Grafica = ({ ingresos = [], gastos = [], meses = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
] }) => {

  // calcula los últimos 6 índices de mes terminando en el mes actual
  const indicesUltimos6 = useMemo(() => {
    const now = new Date();
    const mesActual = now.getMonth(); // 0..11
    const arr = [];
    for (let i = 5; i >= 0; i--) {
      arr.push((mesActual - i + 12) % 12);
    }
    return arr;
  }, []);

  // construir etiquetas y datos tomando los índices calculados
  const labels = indicesUltimos6.map(idx => meses[idx] || `Mes ${idx+1}`);
  const datosIngresos = indicesUltimos6.map(idx => {
    const valObj = ingresos[idx];
    if (valObj == null) return 0;
    if (typeof valObj === 'number') return valObj;
    if (typeof valObj === 'object' && ('monto' in valObj || 'amount' in valObj)) {
      return Number(valObj.monto ?? valObj.amount ?? 0) || 0;
    }
    return 0;
  });
  const datosGastos = indicesUltimos6.map(idx => {
    const valObj = gastos[idx];
    if (valObj == null) return 0;
    if (typeof valObj === 'number') return valObj;
    if (typeof valObj === 'object' && ('monto' in valObj || 'amount' in valObj)) {
      return Number(valObj.monto ?? valObj.amount ?? 0) || 0;
    }
    return 0;
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Ingresos',
        data: datosIngresos,
        backgroundColor: 'rgba(16, 185, 129, 0.7)', // Verde esmeralda semi-transparente
        borderColor: '#059669', // Verde más oscuro
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Gastos',
        data: datosGastos,
        backgroundColor: 'rgba(220, 38, 38, 0.75)', // Rojo carmesí semi-transparente
        borderColor: '#B91C1C', // Rojo más oscuro
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 14, weight: '600' },
          padding: 12
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const val = context.parsed.y ?? context.raw ?? 0;
            return `${context.dataset.label}: L ${Number(val).toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        ticks: {
          stepSize: 10000, // Incrementos de 10,000: 0, 10000, 20000, 30000, etc.
          callback: function(value) {
            return 'L ' + value.toLocaleString();
          },
          font: {
            size: 5
          },
          padding: 30   
        },
        grid: {
          color: 'rgba(0,0,0,0.1)',
          lineWidth: 1
        }
      },
    },
    layout: { padding: { top: 8, bottom: 8, left: 8, right: 8 } }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-purple-100">
      <h2 className="text-2xl font-bold text-slate-700 mb-6 flex items-center">
        <span className="bg-gradient-to-r from-green-100 to-red-100 text-slate-700 rounded-xl px-4 py-2 mr-3 border border-slate-200">
          💰 Comparativa: Ingresos vs Gastos (últimos 6 meses)
        </span>
      </h2>

      <div style={{ height: '420px' }}>
        <Chart type="bar" data={data} options={options} />
      </div>
      <p className="text-sm text-slate-500 mt-3">
        * Muestra los últimos 6 meses contando desde el mes actual del dispositivo.
      </p>
    </div>
  );
};

export default Grafica;
