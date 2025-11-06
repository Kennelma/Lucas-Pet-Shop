import React from 'react';
import { Chart } from 'primereact/chart';

const Grafica = ({ ingresos, gastos, meses }) => {
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

  return (
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
  );
};

export default Grafica;