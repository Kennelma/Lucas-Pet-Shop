import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const TablaDetalleMensual = ({ datosTabla, totalIngresos, totalGastos, gananciaTotal }) => {

  const bodyMes = (rowData) => (
    <span className="text-slate-700 font-medium">{rowData.mes}</span>
  );

  const bodyIngresos = (rowData) => (
    <span className="text-green-700 font-semibold">L {rowData.ingreso.toLocaleString()}</span>
  );

  const bodyGastos = (rowData) => (
    <span className="text-red-700 font-semibold">L {rowData.gasto.toLocaleString()}</span>
  );

  const bodyGanancia = (rowData) => (
    <span className={`font-bold ${rowData.ganancia >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
      L {rowData.ganancia.toLocaleString()}
    </span>
  );

  // Footer para totales
  const footerMes = () => <strong className="text-slate-800">TOTAL</strong>;
  const footerIngresos = () => (
    <span className="text-green-800 font-bold">L {totalIngresos.toLocaleString()}</span>
  );
  const footerGastos = () => (
    <span className="text-red-800 font-bold">L {totalGastos.toLocaleString()}</span>
  );
  const footerGanancia = () => (
    <span className={`font-bold ${gananciaTotal >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
      L {gananciaTotal.toLocaleString()}
    </span>
  );

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-purple-100">
      <h2 className="text-2xl font-bold text-slate-700 mb-4">
        <span className="bg-gradient-to-r from-purple-100 to-blue-100 text-slate-700 rounded-xl px-4 py-2 border border-purple-200">
          📋 Detalle Mensual
        </span>
      </h2>

      <DataTable
        value={datosTabla}
        className="font-poppins"
        showGridlines
        responsiveLayout="scroll"
        emptyMessage="No hay datos disponibles"
        rowClassName={(rowData, index) => index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
      >
        <Column header="Mes" body={bodyMes} footer={footerMes} className="text-sm font-medium" />
        <Column header="Ingresos" body={bodyIngresos} footer={footerIngresos} className="text-sm text-right" />
        <Column header="Gastos" body={bodyGastos} footer={footerGastos} className="text-sm text-right" />
        <Column header="Ganancia" body={bodyGanancia} footer={footerGanancia} className="text-sm text-right" />
      </DataTable>
    </div>
  );
};

export default TablaDetalleMensual;