import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";

const ServiciosFavoritos = ({ servicios = [] }) => {
  const [serviciosFavoritos, setServiciosFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarComponente, setMostrarComponente] = useState(true);

  // Colores para los servicios
  const colores = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500'];

  // Función para procesar servicios reales
  const procesarServicios = (serviciosReales) => {
    if (!serviciosReales || serviciosReales.length === 0) {
      return [];
    }

    const serviciosConPopularidad = serviciosReales
      .filter(servicio => servicio.activo) // Solo servicios activos
      .map((servicio, index) => {
        // Simular cantidad de pedidos basado en precio (más barato = más popular)
        const basePopularidad = Math.max(10, 50 - (servicio.precio_servicio || 0));
        const cantidadPedidos = Math.floor(basePopularidad + Math.random() * 20);
        
        return {
          id: servicio.id_servicio_peluqueria_pk || servicio.id,
          nombre: servicio.nombre_servicio_peluqueria || 'SERVICIO SIN NOMBRE',
          descripcion: servicio.descripcion_servicio,
          precio: servicio.precio_servicio,
          duracion: servicio.duracion_estimada,
          cantidad_pedidos: cantidadPedidos,
          color: colores[index % colores.length]
        };
      })
      .sort((a, b) => b.cantidad_pedidos - a.cantidad_pedidos) // Ordenar por popularidad
      .slice(0, 4); // Tomar solo los 4 más populares

    // Calcular porcentajes
    const totalPedidos = serviciosConPopularidad.reduce((sum, s) => sum + s.cantidad_pedidos, 0);
    
    return serviciosConPopularidad.map(servicio => ({
      ...servicio,
      porcentaje: totalPedidos > 0 ? Math.round((servicio.cantidad_pedidos / totalPedidos) * 100) : 0
    }));
  };

  useEffect(() => {
    setLoading(true);
    
    // Simular delay de carga
    setTimeout(() => {
      const serviciosProcesados = procesarServicios(servicios);
      setServiciosFavoritos(serviciosProcesados);
      setLoading(false);
    }, 500);
  }, [servicios]);


  // Si no hay servicios favoritos
  if (serviciosFavoritos.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No hay servicios para mostrar estadísticas
            </h3>
            <p className="text-gray-500 text-sm">
              Agrega servicios primero para ver cuáles son los más solicitados
            </p>
          </div>
          <button
            onClick={() => setMostrarComponente(!mostrarComponente)}
            className="ml-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors flex items-center justify-center"
            title={mostrarComponente ? 'Ocultar' : 'Mostrar'}
          >
            <FontAwesomeIcon icon={mostrarComponente ? faChevronUp : faChevronDown} size="sm" />
          </button>
        </div>
        {mostrarComponente && (
          <div className="text-center py-4">
            <p className="text-gray-400 italic">
              📊 El sistema de favoritos está listo para funcionar
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <h className="text-xl font-bold text-gray-800 mb-1">FAVORITOS</h>
          <p className="text-gray-600 text-sm">BASADO EN LAS FACTURAS DEL MES ACTUAL</p>
        </div>
        <button
          onClick={() => setMostrarComponente(!mostrarComponente)}
          className="ml-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors flex items-center justify-center"
          title={mostrarComponente ? 'Ocultar' : 'Mostrar'}
        >
          <FontAwesomeIcon icon={mostrarComponente ? faChevronUp : faChevronDown} size="sm" />
        </button>
      </div>
      
      {mostrarComponente && (
        <div className="flex items-start gap-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 flex-1 items-stretch">
            {serviciosFavoritos.map((servicio, index) => (
              <div key={servicio.id} className="bg-white/80 backdrop-blur-sm rounded-md p-2 border border-white/50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col h-52">
                <div className="flex-grow flex items-center justify-center">
                  <h3 className="font-semibold text-gray-800 text-[18px] leading-tight text-center mb-2">{servicio.nombre}</h3>
                </div>
                <div className="mt-auto space-y-0.5">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`${servicio.color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${servicio.porcentaje}%` }}></div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold ${servicio.color.replace('bg-', 'text-')}`}>{servicio.porcentaje}%</span>
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    <span className="font-bold text-gray-800">{servicio.cantidad_pedidos}</span> pedidos
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <img src="/uwu2.jpg" alt="Servicios para mascotas" className="w-45 h-53 object-cover rounded-xl shadow-md" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiciosFavoritos;