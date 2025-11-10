import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { verProductosFavoritos } from "../../../AXIOS.SERVICES/products-axios";

const AlimentosMasVendidos = () => {
  const [alimentosMasVendidos, setAlimentosMasVendidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarComponente, setMostrarComponente] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState(null);

  // Función para obtener el mes actual en español
  const obtenerMesActual = () => {
    const meses = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    const fechaActual = new Date();
    return meses[fechaActual.getMonth()];
  };

  // Colores para los alimentos
  const colores = ['bg-amber-500', 'bg-green-500', 'bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-red-500'];
  
  // Imágenes para el carrusel
  const images = [
    "/alimentos1.jpg",
    "/alimentos2.jpg", 
    "/alimentos3.jpg",
    "/alimentos4.jpg",
    "/alimentos5.jpg"
  ];

  // Función para obtener alimentos favoritos desde el endpoint
  const obtenerAlimentosFavoritos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Llamar al endpoint para obtener los productos favoritos de tipo ALIMENTOS
      const favoritosFromAPI = await verProductosFavoritos('ALIMENTOS');
      
      if (!favoritosFromAPI || favoritosFromAPI.length === 0) {
        setAlimentosMasVendidos([]);
        return;
      }

      // Agrupar los datos por nombre del producto para sumar las ventas del mismo alimento
      const alimentosAgrupados = {};
      
      favoritosFromAPI.forEach(favorito => {
        const nombreProducto = favorito.nombre_item || 'ALIMENTO SIN NOMBRE';
        const ventasActuales = parseInt(favorito.total_vendido) || 0;
        
        if (alimentosAgrupados[nombreProducto]) {
          // Si ya existe, sumar las ventas
          alimentosAgrupados[nombreProducto].cantidad_ventas += ventasActuales;
          alimentosAgrupados[nombreProducto].facturas.push(favorito.numero_factura);
        } else {
          // Si no existe, crear nuevo registro
          alimentosAgrupados[nombreProducto] = {
            nombre: nombreProducto,
            cantidad_ventas: ventasActuales,
            mes: favorito.mes,
            facturas: [favorito.numero_factura]
          };
        }
      });

      // Convertir a array y ordenar por ventas
      const alimentosProcesados = Object.values(alimentosAgrupados)
        .sort((a, b) => b.cantidad_ventas - a.cantidad_ventas) // Ordenar por ventas descendente
        .slice(0, 4) // Tomar solo los 4 más vendidos
        .map((alimento, index) => ({
          id: `alimento-${alimento.nombre.replace(/\s+/g, '-').toLowerCase()}`,
          nombre: alimento.nombre,
          cantidad_ventas: alimento.cantidad_ventas,
          mes: alimento.mes,
          color: colores[index % colores.length]
        }));

      // Calcular porcentajes
      const totalVentas = alimentosProcesados.reduce((sum, a) => sum + a.cantidad_ventas, 0);
      
      const alimentosConPorcentajes = alimentosProcesados.map(alimento => ({
        ...alimento,
        porcentaje: totalVentas > 0 ? Math.round((alimento.cantidad_ventas / totalVentas) * 100) : 0
      }));

      setAlimentosMasVendidos(alimentosConPorcentajes);
      
    } catch (err) {
      console.error('Error al obtener alimentos favoritos:', err);
      setError('Error al cargar los productos más vendidos');
      setAlimentosMasVendidos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Obtener los alimentos favoritos del mes actual desde el endpoint
    obtenerAlimentosFavoritos();
  }, []); // Se ejecuta solo al montar el componente

  // Efecto para el carrusel de imágenes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000); // Cambia cada 10 segundos

    return () => clearInterval(interval);
  }, [images.length]);

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Cargando productos más vendidos...
            </h3>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si ocurrió
  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              {error}
            </h3>
            <button 
              onClick={obtenerAlimentosFavoritos}
              className="mt-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay alimentos más vendidos
  if (alimentosMasVendidos.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No hay datos de ventas de alimentos este mes
            </h3>
            <p className="text-gray-500 text-sm">
              Aún no se han registrado ventas de alimentos en el mes actual
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
              El sistema mostrará los datos cuando haya ventas registradas
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 mb-6" style={{boxShadow: '0 0 8px #FF9A9840, 0 0 0 1px #FF9A9833'}}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <div className="text-xl font-bold text-gray-800 mb-1">MÁS VENDIDOS</div>
          <p className="text-gray-600 text-sm">BASADO EN LAS VENTAS DEL MES DE {obtenerMesActual()}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={obtenerAlimentosFavoritos}
            className="w-8 h-8 bg-amber-100 hover:bg-amber-200 text-amber-600 rounded-full transition-colors flex items-center justify-center"
            title="Actualizar datos"
            disabled={loading}
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={() => setMostrarComponente(!mostrarComponente)}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors flex items-center justify-center"
            title={mostrarComponente ? 'Ocultar' : 'Mostrar'}
          >
            <FontAwesomeIcon icon={mostrarComponente ? faChevronUp : faChevronDown} size="sm" />
          </button>
        </div>
      </div>
      
      {mostrarComponente && (
        <div className="flex items-start gap-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 flex-1 items-stretch">
            {alimentosMasVendidos.map((alimento, index) => (
              <div key={alimento.id} className="bg-white/80 backdrop-blur-sm rounded-md p-2 border border-white/50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col h-52">
                <div className="flex-grow flex items-center justify-center">
                  <h className="font-semibold text-gray-800 text-[18px] leading-tight text-center mb-2">{alimento.nombre}</h>
                </div>
                <div className="mt-auto space-y-0.5">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`${alimento.color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${alimento.porcentaje}%` }}></div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold ${alimento.color.replace('bg-', 'text-')}`}>{alimento.porcentaje}%</span>
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    <span className="font-bold text-gray-800">{alimento.cantidad_ventas}</span> ventas
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden lg:flex items-center justify-center relative">
            <img 
              src={images[currentImageIndex]} 
              alt="Alimentos para mascotas" 
              className="w-45 h-53 object-cover rounded-xl shadow-md transition-opacity duration-1000" 
            />
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlimentosMasVendidos;