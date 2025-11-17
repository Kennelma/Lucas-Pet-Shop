import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { verServiciosFavoritos } from "../../AXIOS.SERVICES/services-axios";

const ServiciosFavoritos = () => {
  const [serviciosFavoritos, setServiciosFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarComponente, setMostrarComponente] = useState(true);

  // Colores para los servicios
  const colores = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500'];

  useEffect(() => {
    const cargarFavoritos = async () => {
      setLoading(true);
      try {
        const favoritosData = await verServiciosFavoritos();
        
        if (favoritosData && favoritosData.length > 0) {
          // Agrupar los datos por nombre del servicio para sumar las ventas del mismo servicio
          const serviciosAgrupados = {};
          
          favoritosData.forEach(favorito => {
            const nombreServicio = favorito.nombre_item || 'SERVICIO SIN NOMBRE';
            const ventasActuales = parseInt(favorito.total_vendido) || 0;
            
            if (serviciosAgrupados[nombreServicio]) {
              // Si ya existe, sumar las ventas
              serviciosAgrupados[nombreServicio].cantidad_pedidos += ventasActuales;
              serviciosAgrupados[nombreServicio].facturas.push(favorito.numero_factura);
            } else {
              // Si no existe, crear nuevo registro
              serviciosAgrupados[nombreServicio] = {
                nombre: nombreServicio,
                cantidad_pedidos: ventasActuales,
                mes: favorito.mes,
                facturas: [favorito.numero_factura]
              };
            }
          });

          // Convertir a array y ordenar por pedidos
          const serviciosProcesados = Object.values(serviciosAgrupados)
            .sort((a, b) => b.cantidad_pedidos - a.cantidad_pedidos) // Ordenar por pedidos descendente
            .slice(0, 4) // Tomar solo los 4 más solicitados
            .map((servicio, index) => ({
              id: `servicio-${servicio.nombre.replace(/\s+/g, '-').toLowerCase()}`,
              nombre: servicio.nombre,
              cantidad_pedidos: servicio.cantidad_pedidos,
              mes: servicio.mes,
              color: colores[index % colores.length]
            }));

          // Calcular porcentajes
          const totalPedidos = serviciosProcesados.reduce((sum, s) => sum + s.cantidad_pedidos, 0);
          
          const serviciosConPorcentajes = serviciosProcesados.map(servicio => ({
            ...servicio,
            porcentaje: totalPedidos > 0 ? Math.round((servicio.cantidad_pedidos / totalPedidos) * 100) : 0
          }));

          setServiciosFavoritos(serviciosConPorcentajes);
        } else {
          setServiciosFavoritos([]);
        }
      } catch (error) {
        console.error('Error al cargar favoritos:', error);
        setServiciosFavoritos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarFavoritos();
  }, []);


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
    <div className="bg-white rounded-lg p-6 mb-6" style={{boxShadow: '0 0 8px #ed75cd40, 0 0 0 1px #f074d533'}}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <div className="text-xl font-bold text-gray-800 mb-1">FAVORITOS</div>
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