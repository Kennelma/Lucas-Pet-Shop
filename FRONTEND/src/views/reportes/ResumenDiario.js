import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-3"></div>
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
    <div className="h-full bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Resumen Financiero
        </h3>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <p className="capitalize text-xs">{obtenerFechaHoy()}</p>
        </div>
      </div>

      {/* Grid de métricas */}
      <div className="space-y-5">
        
        {/* Ingresos */}
        <div className="group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <ArrowUpRight className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Ingresos
            </span>
          </div>
          <div className="ml-11">
            <p className="text-3xl font-bold text-green-600">
              {formatearMoneda(datos?.total_ingresos_netos || 0)}
            </p>
          </div>
        </div>

        {/* Gastos */}
        <div className="group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
              <ArrowDownRight className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Gastos
            </span>
          </div>
          <div className="ml-11">
            <p className="text-3xl font-bold text-red-600">
              {formatearMoneda(datos?.total_gastos || 0)}
            </p>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t-2 border-dashed border-gray-200 my-4"></div>

        {/* Saldo Neto */}
        <div className="group">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 ${saldoPositivo ? 'bg-blue-100' : 'bg-orange-100'} rounded-lg ${saldoPositivo ? 'group-hover:bg-blue-200' : 'group-hover:bg-orange-200'} transition-colors`}>
              <Wallet className={`w-5 h-5 ${saldoPositivo ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Saldo Neto
            </span>
          </div>
          <div className="ml-11">
            <p className={`text-4xl font-bold ${saldoPositivo ? 'text-blue-600' : 'text-orange-600'}`}>
              {formatearMoneda(datos?.saldo_neto_dia || 0)}
            </p>
          </div>
        </div>

        {/* Badge de estado */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold ${
            saldoPositivo 
              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
              : 'bg-orange-50 text-orange-700 border border-orange-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${saldoPositivo ? 'bg-blue-500' : 'bg-orange-500'} animate-pulse`}></div>
            <span>
              {saldoPositivo ? 'Balance positivo' : 'Balance negativo'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenDiario;