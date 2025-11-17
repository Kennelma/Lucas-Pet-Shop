import React, { useState, useEffect } from 'react';
import { TrendingUp, Package } from 'lucide-react';
import { obtenerVentasDiarias } from '../../AXIOS.SERVICES/reports-axios';

const VentasDiarias = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredFromChart, setHoveredFromChart] = useState(false);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

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

  const calcularTotal = () => {
    if (!ventas || ventas.length === 0) return 0;
    return ventas.reduce((acc, item) => acc + Number(item.total_vendido || 0), 0);
  };

  const generarPathPastel = (cx, cy, radio, startAngle, endAngle) => {
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
        <Package className="w-16 h-16 mb-4 text-gray-400" />
        <p className="text-lg font-semibold text-gray-500">No hay ventas registradas hoy</p>
      </div>
    );
  }

  const totalProductos = ventas.length;
  const totalUnidades = calcularTotal();
  
  const cx = 140;
  const cy = 140;
  const radio = 100;
  let currentAngle = 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full max-h-[500px]">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-blue-100 p-1.5 rounded-lg">
          <TrendingUp className="w-4 h-4 text-blue-600" />
        </div>
        <h2 className="text-sm font-bold text-gray-800">LO MÁS VENDIDO DEL DÍA</h2>
      </div>

      <div className="flex items-start gap-4">
        {/* Gráfico de pastel */}
        <div className="flex-shrink-0">
          <div className="relative">
            <svg width="280" height="280" viewBox="0 0 280 280">
              {ventas.map((item, index) => {
                const porcentaje = (Number(item.total_vendido) / totalUnidades) * 100;
                const angle = (porcentaje / 100) * 360;
                const path = generarPathPastel(cx, cy, radio, currentAngle, currentAngle + angle);
                const angleActual = currentAngle;
                currentAngle += angle;
                
                return (
                  <g key={index}>
                    <path
                      d={path}
                      fill={COLORS[index % COLORS.length]}
                      stroke="white"
                      strokeWidth="2.5"
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
                      <title>{item.nombre_item} - {item.total_vendido} unidades ({porcentaje.toFixed(1)}%)</title>
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
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar" style={{ maxHeight: '280px' }}>
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

      <style jsx>{`
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