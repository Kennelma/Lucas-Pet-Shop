import React, { useState, useEffect } from 'react';
import { TrendingUp, Package } from 'lucide-react';
import { obtenerVentasDiarias } from '../../AXIOS.SERVICES/reports-axios';

const VentasDiarias = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

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
  
  const cx = 200;
  const cy = 150;
  const radio = 100;
  let currentAngle = 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-blue-100 p-1.5 rounded-lg">
          <TrendingUp className="w-4 h-4 text-blue-600" />
        </div>
        <h2 className="text-sm font-bold text-gray-800">Lo Más Vendido del Día</h2>
      </div>

      <div className="flex items-start gap-4" style={{ marginTop: '-10px' }}>
        <div className="flex items-center justify-center relative" style={{ flex: '0 0 320px' }}>
          <svg width="320" height="320" viewBox="0 0 400 400">
            {ventas.map((item, index) => {
              const porcentaje = (Number(item.total_vendido) / totalUnidades) * 100;
              const angle = (porcentaje / 100) * 360;
              const path = generarPathPastel(200, 200, 110, currentAngle, currentAngle + angle);
              const angleActual = currentAngle;
              currentAngle += angle;
              
              return (
                <g key={index}>
                  <path
                    d={path}
                    fill={COLORS[index % COLORS.length]}
                    stroke="white"
                    strokeWidth="2"
                    style={{ 
                      cursor: 'pointer',
                      opacity: hoveredItem === index ? 0.8 : 1,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={() => setHoveredItem(index)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <title>{item.nombre_item} - {item.total_vendido} unidades ({porcentaje.toFixed(1)}%)</title>
                  </path>
                </g>
              );
            })}
          </svg>

          {hoveredItem !== null && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-2 rounded-lg shadow-xl border-2 border-gray-200 pointer-events-none z-10">
              <p className="font-bold text-gray-800 text-xs whitespace-nowrap">{ventas[hoveredItem].nombre_item}</p>
              <p className="text-xs text-gray-600">{ventas[hoveredItem].total_vendido} unidades</p>
              <p className="text-xs text-blue-600 font-semibold">
                {((Number(ventas[hoveredItem].total_vendido) / totalUnidades) * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 gap-1.5 overflow-y-auto pr-2" style={{ maxHeight: '320px' }}>
          {ventas.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm flex-shrink-0" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-gray-700" style={{ wordBreak: 'break-word', lineHeight: '1.3' }}>
                {item.nombre_item} ({item.total_vendido})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VentasDiarias;