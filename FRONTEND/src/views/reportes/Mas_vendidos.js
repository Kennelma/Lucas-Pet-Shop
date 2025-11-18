import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Package } from 'lucide-react';
import { obtenerVentasDiarias } from '../../AXIOS.SERVICES/reports-axios';

const VentasDiarias = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredFromChart, setHoveredFromChart] = useState(false);

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#ef4444', '#f97316', '#6366f1', '#84cc16'];

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    try {
      setLoading(true);
      const response = await obtenerVentasDiarias();

      if (response.Consulta && response.ventas) {
        setVentas(response.ventas);
        setError(null);
      } else {
        setError('No se pudieron cargar las ventas');
      }
    } catch (err) {
      setError('Error al cargar las ventas diarias');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalUnidades = useMemo(() => {
    if (!ventas || ventas.length === 0) return 0;
    return ventas.reduce((acc, item) => acc + Number(item.total_vendido || 0), 0);
  }, [ventas]);

  const ventasConAngulos = useMemo(() => {
    if (!ventas || ventas.length === 0 || totalUnidades === 0) return [];
    
    return ventas.map((item, index) => {
      const porcentaje = (Number(item.total_vendido) / totalUnidades) * 100;
      const angle = (porcentaje / 100) * 360;
      
      const startAngle = ventas.slice(0, index).reduce((acc, prevItem) => {
        const prevPorcentaje = (Number(prevItem.total_vendido) / totalUnidades) * 100;
        return acc + ((prevPorcentaje / 100) * 360);
      }, 0);
      
      return {
        ...item,
        porcentaje,
        angle,
        startAngle,
        endAngle: startAngle + angle
      };
    });
  }, [ventas, totalUnidades]);

  const generarPathPastel = (cx, cy, radio, startAngle, endAngle) => {
    if (endAngle - startAngle >= 359.9) {
      const midAngle = startAngle + 180;
      const start = polarToCartesian(cx, cy, radio, startAngle);
      const mid = polarToCartesian(cx, cy, radio, midAngle);
      return [
        "M", cx, cy,
        "L", start.x, start.y,
        "A", radio, radio, 0, 0, 1, mid.x, mid.y,
        "A", radio, radio, 0, 0, 1, start.x, start.y,
        "Z"
      ].join(" ");
    }
    
    const start = polarToCartesian(cx, cy, radio, endAngle);
    const end = polarToCartesian(cx, cy, radio, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", cx, cy,
      "L", start.x, start.y,
      "A", radio, radio, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (cx, cy, radio, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: cx + (radio * Math.cos(angleInRadians)),
      y: cy + (radio * Math.sin(angleInRadians))
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col items-center justify-center">
        <Package className="w-16 h-16 mb-4 text-red-500" />
        <p className="text-lg font-semibold text-red-500">{error}</p>
        <button 
          onClick={cargarVentas}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!ventas || ventas.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col items-center justify-center">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
        <p className="text-xl font-bold text-gray-700 mb-2">Sin ventas por el momento</p>
        <p className="text-sm text-gray-500 text-center">
          Aún no se han registrado ventas el día de hoy
        </p>
      </div>
    );
  }

  const cx = 140;
  const cy = 140;
  const radio = 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-blue-100 p-1.5 rounded-lg">
          <TrendingUp className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-base md:text-xl font-semibold text-gray-800">LO MÁS VENDIDO DEL DÍA</div>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
        {/* Gráfico de pastel */}
        <div className="flex-shrink-0 w-full md:w-auto flex justify-center">
          <div className="relative">
            <svg className="w-64 h-64 md:w-[280px] md:h-[280px]" viewBox="0 0 280 280">
              {ventasConAngulos.map((item, index) => {
                const path = generarPathPastel(cx, cy, radio, item.startAngle, item.endAngle);
                
                return (
                  <g key={index}>
                    <path
                      d={path}
                      fill={COLORS[index % COLORS.length]}
                      stroke="white"
                      strokeWidth="0"
                      style={{ 
                        cursor: 'pointer',
                        opacity: hoveredItem === index ? 0.8 : 1,
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={() => {
                        setHoveredItem(index);
                        setHoveredFromChart(true);
                      }}
                      onMouseLeave={() => {
                        setHoveredItem(null);
                        setHoveredFromChart(false);
                      }}
                    >
                      <title>{item.nombre_item} - {item.total_vendido} unidades ({item.porcentaje.toFixed(1)}%)</title>
                    </path>
                  </g>
                );
              })}
            </svg>

            {hoveredItem !== null && hoveredFromChart && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-2 rounded-lg shadow-xl border-2 border-gray-200 pointer-events-none z-10 max-w-[200px]">
                <p className="font-bold text-gray-800 text-xs truncate">{ventas[hoveredItem].nombre_item}</p>
                <p className="text-xs text-gray-600 mt-0.5">{ventas[hoveredItem].total_vendido} unidades</p>
                <p className="text-xs text-blue-600 font-semibold">
                  {((Number(ventas[hoveredItem].total_vendido) / totalUnidades) * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Lista de productos */}
        <div className="flex-1 w-full overflow-y-auto pr-1 custom-scrollbar max-h-60 md:max-h-[280px]">
          <div className="grid grid-cols-1 gap-1.5">
            {ventas.map((item, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-2 p-1.5 rounded-md transition-all cursor-pointer ${
                  hoveredItem === index ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div 
                  className="w-3 h-3 rounded-sm flex-shrink-0" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate leading-tight">
                    {item.nombre_item}
                  </p>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    {item.total_vendido} unid. • {((Number(item.total_vendido) / totalUnidades) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default VentasDiarias;