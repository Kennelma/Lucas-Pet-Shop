import React from 'react';
import { Chart } from 'primereact/chart';

const Grafica = ({ ingresos, gastos, meses }) => {
  // Dividir en dos semestres
  const primerSemestre = meses.slice(0, 6);
  const segundoSemestre = meses.slice(6, 12);
  
  // Datos del primer semestre (Enero - Junio)
  const dataPrimerSemestre = {
    labels: primerSemestre,
    datasets: [
      {
        label: 'Ingresos',
        data: ingresos.slice(0, 6).map(item => item.monto || 0),
        backgroundColor: 'rgba(167, 243, 208, 0.8)',
        borderColor: 'rgba(52, 211, 153, 1)',
        borderWidth: 2
      },
      {
        label: 'Gastos',
        data: gastos.slice(0, 6).map(item => item.monto || 0),
        backgroundColor: 'rgba(254, 202, 202, 0.8)',
        borderColor: 'rgba(248, 113, 113, 1)',
        borderWidth: 2
      }
    ]
  };

  // Datos del segundo semestre (Julio - Diciembre)
  const dataSegundoSemestre = {
    labels: segundoSemestre,
    datasets: [
      {
        label: 'Ingresos',
        data: ingresos.slice(6, 12).map(item => item.monto || 0),
        backgroundColor: 'rgba(167, 243, 208, 0.8)',
        borderColor: 'rgba(52, 211, 153, 1)',
        borderWidth: 2
      },
      {
        label: 'Gastos',
        data: gastos.slice(6, 12).map(item => item.monto || 0),
        backgroundColor: 'rgba(254, 202, 202, 0.8)',
        borderColor: 'rgba(248, 113, 113, 1)',
        borderWidth: 2
      }
    ]
  };

  // Opciones para las gráficas CON MÁS VALORES EN EL EJE Y
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
        min: 5000,
        max: 100000,
        ticks: {
          stepSize: 1000, // Esto genera: 0, 10000, 20000, 30000... 100000
          callback: function(value) {
            return 'L ' + value.toLocaleString();
          },
          font: {
            size: 13
          },
          padding: 10
        },
        grid: {
          color: 'rgba(0,0,0,0.1)',
          lineWidth: 1
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      }
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-purple-100">
      <h2 className="text-2xl font-bold text-slate-700 mb-6 flex items-center">
        <span className="bg-gradient-to-r from-green-100 to-red-100 text-slate-700 rounded-xl px-4 py-2 mr-3 border border-slate-200">
          💰 Comparativa: Ingresos vs Gastos
        </span>
      </h2>
      
      {/* Primer Semestre */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-slate-600 mb-3">Enero - Junio</h3>
        <div style={{ height: '350px' }}>
          <Chart type="bar" data={dataPrimerSemestre} options={options} />
        </div>
      </div>

      {/* Segundo Semestre */}
      <div>
        <h3 className="text-xl font-semibold text-slate-600 mb-3">Julio - Diciembre</h3>
        <div style={{ height: '350px' }}>
          <Chart type="bar" data={dataSegundoSemestre} options={options} />
        </div>
      </div>
    </div>
  );
};

export default Grafica;