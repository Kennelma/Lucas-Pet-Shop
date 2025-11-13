import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign
} from 'lucide-react';

const ResumenDiario = ({ verResumenDiario }) => {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarResumen();
  }, []);

  const cargarResumen = async () => {
    setCargando(true);
    setError(null);
    
    try {
      const response = await verResumenDiario();
      
      if (!response.ok) {
        throw new Error('No se pudo cargar el resumen diario');
      }

      setDatos(response.resumen_financiero_hoy);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar el resumen del día');
    } finally {
      setCargando(false);
    }
  };

  const formatearMoneda = (valor) => {
    return `L ${valor.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const obtenerFechaHoy = () => {
    const hoy = new Date();
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return hoy.toLocaleDateString('es-HN', opciones);
  };

  if (cargando) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-xl shadow-sm p-8 border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600 font-medium">Cargando resumen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-xl shadow-sm p-8 border border-gray-200">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const saldoPositivo = datos?.saldo_neto_dia >= 0;

  return (
    <div className="h-full bg-white rounded-xl shadow-lg p-8 border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Resumen Financiero del Día
        </h3>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <p className="capitalize text-xs">{obtenerFechaHoy()}</p>
        </div>
      </div>

      {/* Métricas en línea horizontal */}
      <div className="flex-1 flex items-center justify-around">
        
        {/* Gastos */}
        <div className="flex flex-col items-center text-center">
          <div className="p-4 bg-red-50 rounded-xl mb-3">
            <ArrowDownRight className="w-8 h-8 text-red-600" />
          </div>
          <span className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">
            Gastos
          </span>
          <p className="text-3xl font-bold text-red-700">
            {formatearMoneda(datos?.total_gastos || 0)}
          </p>
        </div>

        {/* Separador vertical */}
        <div className="h-32 w-px bg-gray-300"></div>

        {/* Ingresos */}
        <div className="flex flex-col items-center text-center">
          <div className="p-4 bg-blue-50 rounded-xl mb-3">
            <ArrowUpRight className="w-8 h-8 text-blue-600" />
          </div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
            Ingresos
          </span>
          <p className="text-3xl font-bold text-blue-700">
            {formatearMoneda(datos?.total_ingresos_netos || 0)}
          </p>
        </div>

        {/* Separador vertical */}
        <div className="h-32 w-px bg-gray-300"></div>

        {/* Saldo Neto */}
        <div className="flex flex-col items-center text-center">
          <div className={`p-4 rounded-xl mb-3 ${saldoPositivo ? 'bg-green-50' : 'bg-orange-50'}`}>
            <Wallet className={`w-8 h-8 ${saldoPositivo ? 'text-green-600' : 'text-orange-600'}`} />
          </div>
          <span className={`text-xs font-semibold uppercase tracking-wide mb-2 ${saldoPositivo ? 'text-green-600' : 'text-orange-600'}`}>
            Saldo Neto
          </span>
          <p className={`text-3xl font-bold ${saldoPositivo ? 'text-green-700' : 'text-orange-700'}`}>
            {formatearMoneda(datos?.saldo_neto_dia || 0)}
          </p>
        </div>

      </div>

      {/* Badge de estado en el footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold ${
          saldoPositivo 
            ? 'bg-green-50 text-green-700 border-2 border-green-200' 
            : 'bg-orange-50 text-orange-700 border-2 border-orange-200'
        }`}>
          <div className={`w-2 h-2 rounded-full ${saldoPositivo ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`}></div>
          <span>
            {saldoPositivo ? 'Balance positivo' : 'Balance negativo'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResumenDiario;