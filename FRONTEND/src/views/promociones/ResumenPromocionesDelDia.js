import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { verServicios } from '../../AXIOS.SERVICES/services-axios.js';

const ResumenPromocionesDelDia = () => {
  const [promociones, setPromociones] = useState([]);
  const [fechaActual, setFechaActual] = useState(new Date());
  const [promocionesDelDia, setPromocionesDelDia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarComponente, setMostrarComponente] = useState(true);

  // Actualizar fecha cada minuto
  useEffect(() => {
  let minutoAnterior = new Date().getMinutes();

  const interval = setInterval(() => {
    const ahora = new Date();
    const minutoActual = ahora.getMinutes();

    if (minutoActual !== minutoAnterior) {
      minutoAnterior = minutoActual;
      setFechaActual(ahora); // Actualiza solo si cambia el minuto
    }
  }, 1000); // Verifica cada segundo

  return () => clearInterval(interval);
}, []);

  // Cargar promociones inicialmente y cada 30 segundos para actualizaciones en tiempo real
  useEffect(() => {
    cargarPromociones();
    
    const interval = setInterval(() => {
      cargarPromociones();
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Filtrar promociones del día actual cuando cambien los datos o la fecha
  useEffect(() => {
    filtrarPromocionesDelDia();
  }, [promociones, fechaActual]);

  const cargarPromociones = async (silencioso = false) => {
    if (!silencioso) setLoading(true);
    
    try {
      const data = await verServicios("PROMOCIONES");
      const promocionesNormalizadas = (data || []).map(promocion => {
        // Normalizar días de promoción - puede venir como string o array
        let diasNormalizados = [];
        if (promocion.dias_promocion) {
          if (typeof promocion.dias_promocion === 'string') {
            try {
              // Si es un JSON string, parsearlo
              diasNormalizados = JSON.parse(promocion.dias_promocion);
            } catch {
              // Si no es JSON, tratarlo como string separado por comas
              diasNormalizados = promocion.dias_promocion.split(',').map(d => d.trim());
            }
          } else if (Array.isArray(promocion.dias_promocion)) {
            diasNormalizados = promocion.dias_promocion;
          }
        }
        
        return {
          ...promocion,
          precio_promocion: parseFloat(promocion.precio_promocion || 0),
          activo: Boolean(promocion.activo === 1 || promocion.activo === '1' || promocion.activo === true),
          dias_promocion: diasNormalizados
        };
      });
      
      setPromociones(promocionesNormalizadas);
    } catch (error) {
      console.error("Error al cargar promociones:", error);
      if (!silencioso) {
        setPromociones([]);
      }
    } finally {
      if (!silencioso) setLoading(false);
    }
  };

  const filtrarPromocionesDelDia = () => {
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaActual = diasSemana[fechaActual.getDay()];

    console.log('Filtrando promociones para:', diaActual);
    console.log('Total promociones:', promociones.length);

    const promocionesVigentes = promociones.filter(promocion => {
      // Solo promociones activas
      if (!promocion.activo) {
        console.log(`Promoción "${promocion.nombre_promocion}" excluida - no activa`);
        return false;
      }
      
      // Si tiene días específicos definidos y no está vacío
      if (promocion.dias_promocion && promocion.dias_promocion.length > 0) {
        const incluyeDiaActual = promocion.dias_promocion.some(dia => {
          // Comparar de manera flexible (puede venir con diferentes formatos)
          const diaNormalizado = dia.toLowerCase().trim();
          const diaActualNormalizado = diaActual.toLowerCase().trim();
          return diaNormalizado === diaActualNormalizado || 
                 diaNormalizado.includes(diaActualNormalizado.slice(0, 3)); // Comparar por las primeras 3 letras
        });
        
        console.log(`Promoción "${promocion.nombre_promocion}" - Días: [${promocion.dias_promocion.join(', ')}] - Incluye ${diaActual}: ${incluyeDiaActual}`);
        return incluyeDiaActual;
      }
      
      // Si no tiene días específicos o el array está vacío, se considera disponible todos los días
      console.log(`Promoción "${promocion.nombre_promocion}" disponible todos los días`);
      return true;
    });

    console.log('Promociones vigentes para hoy:', promocionesVigentes.length);
    setPromocionesDelDia(promocionesVigentes);
  };

  const obtenerNombreDia = () => {
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return diasSemana[fechaActual.getDay()];
  };

  const obtenerFechaFormateada = () => {
    const opciones = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return fechaActual.toLocaleDateString('es-HN', opciones);
  };

  const obtenerHoraActual = () => {
    return fechaActual.toLocaleTimeString('es-HN', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Colores simples para las promociones
  const colores = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500'];

  // Función para actualizar promociones cuando se modifiquen desde otros componentes
  const actualizarPromocionesEnTiempoReal = () => {
    cargarPromociones(true); // Cargar sin mostrar loading
  };

  // Exponer función para que otros componentes puedan llamarla
  useEffect(() => {
    // Crear evento global para escuchar cambios en promociones
    const handlePromocionesUpdate = () => {
      actualizarPromocionesEnTiempoReal();
    };

    window.addEventListener('promocionesUpdated', handlePromocionesUpdate);
    
    return () => {
      window.removeEventListener('promocionesUpdated', handlePromocionesUpdate);
    };
  }, []);

  // Si no hay promociones del día
  if (promocionesDelDia.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 mb-6" style={{boxShadow: '0 0 8px #365DA040, 0 0 0 1px #365DA033'}}>
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No hay promociones para {obtenerNombreDia()}
            </h3>
            <p className="text-gray-500 text-sm">
              {promociones.length > 0 
                ? `Hay ${promociones.length} promociones en total, pero ninguna programada para ${obtenerNombreDia()}`
                : 'No hay promociones registradas en el sistema'
              }
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
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 mb-6" style={{boxShadow: '0 0 8px #365DA040, 0 0 0 1px #365DA033'}}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <div className="text-xl font-bold text-gray-800 mb-1">PROMOCIONES DE HOY</div>
          <p className="text-gray-600 text-sm">{obtenerNombreDia().toUpperCase()} - {obtenerHoraActual()}</p>
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
            {promocionesDelDia.map((promocion, index) => (
              <div key={promocion.id_promocion_pk || index} className="bg-white/80 backdrop-blur-sm rounded-md p-2 border border-white/50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col h-52">
                <div className="flex-grow flex items-center justify-center">
                  <h3 className="font-semibold text-gray-800 text-[18px] leading-tight text-center mb-2">{promocion.nombre_promocion}</h3>
                </div>
                <div className="mt-auto space-y-0.5">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`${colores[index % colores.length]} h-1.5 rounded-full transition-all duration-500`} style={{ width: '100%' }}></div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold ${colores[index % colores.length].replace('bg-', 'text-')}`}>ACTIVA</span>
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    <span className="font-bold text-gray-800">L. {promocion.precio_promocion.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <img src="/uwu2.jpg" alt="Promociones del día" className="w-45 h-53 object-cover rounded-xl shadow-md" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumenPromocionesDelDia;