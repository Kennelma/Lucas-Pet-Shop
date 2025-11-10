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
      <div className="h-full flex items-center justify-center bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Cargando resumen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const saldoPositivo = datos?.saldo_neto_dia >= 0;

  return (
    <div className="h-full bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
      {/* Header */}
      <div className="mb-8 pb-6 border-b-2 border-slate-100">
        <h3 className="text-3xl font-bold text-slate-800 mb-2">
          Resumen Financiero
        </h3>
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar className="w-4 h-4" />
          <p className="capitalize text-sm">{obtenerFechaHoy()}</p>
        </div>
      </div>

      {/* Grid de métricas */}
      <div className="space-y-6">
        
        {/* Ingresos */}
        <div className="group">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <ArrowUpRight className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Ingresos
            </span>
          </div>
          <div className="ml-11">
            <p className="text-4xl font-bold text-green-600">
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
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Gastos
            </span>
          </div>
          <div className="ml-11">
            <p className="text-4xl font-bold text-red-600">
              {formatearMoneda(datos?.total_gastos || 0)}
            </p>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t-2 border-dashed border-slate-200 my-6"></div>

        {/* Saldo Neto */}
        <div className="group">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 ${saldoPositivo ? 'bg-blue-100' : 'bg-orange-100'} rounded-lg ${saldoPositivo ? 'group-hover:bg-blue-200' : 'group-hover:bg-orange-200'} transition-colors`}>
              <Wallet className={`w-5 h-5 ${saldoPositivo ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Saldo Neto
            </span>
          </div>
          <div className="ml-11">
            <p className={`text-5xl font-bold ${saldoPositivo ? 'text-blue-600' : 'text-orange-600'}`}>
              {formatearMoneda(datos?.saldo_neto_dia || 0)}
            </p>
          </div>
        </div>

        {/* Badge de estado */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            saldoPositivo 
              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
              : 'bg-orange-50 text-orange-700 border border-orange-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${saldoPositivo ? 'bg-blue-500' : 'bg-orange-500'} animate-pulse`}></div>
            <span className="text-sm font-semibold">
              {saldoPositivo ? 'Balance positivo' : 'Balance negativo'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenDiario;