import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { verProductosFavoritos } from "../../../AXIOS.SERVICES/products-axios";

const AccesoriosMasVendidos = () => {
  const [accesoriosMasVendidos, setAccesoriosMasVendidos] = useState([]);
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

  // Colores para los accesorios
  const colores = ['bg-cyan-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-blue-500'];
  
  // Imágenes para el carrusel
  const images = [
    "/accesorios1.jpg",
    "/accesorios2.jpg", 
    "/accesorios3.jpg",
    "/accesorios4.jpg",
    "/accesorios5.jpg"
  ];

  // Función para obtener accesorios favoritos desde el endpoint
  const obtenerAccesoriosFavoritos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Llamar al endpoint para obtener los productos favoritos de tipo ACCESORIOS
      const favoritosFromAPI = await verProductosFavoritos('ACCESORIOS');
      
      if (!favoritosFromAPI || favoritosFromAPI.length === 0) {
        setAccesoriosMasVendidos([]);
        return;
      }

      // Agrupar los datos por nombre del producto para sumar las ventas del mismo accesorio
      const accesoriosAgrupados = {};
      
      favoritosFromAPI.forEach(favorito => {
        const nombreProducto = favorito.nombre_item || 'ACCESORIO SIN NOMBRE';
        const ventasActuales = parseInt(favorito.total_vendido) || 0;
        
        if (accesoriosAgrupados[nombreProducto]) {
          // Si ya existe, sumar las ventas
          accesoriosAgrupados[nombreProducto].cantidad_ventas += ventasActuales;
          accesoriosAgrupados[nombreProducto].facturas.push(favorito.numero_factura);
        } else {
          // Si no existe, crear nuevo registro
          accesoriosAgrupados[nombreProducto] = {
            nombre: nombreProducto,
            cantidad_ventas: ventasActuales,
            mes: favorito.mes,
            facturas: [favorito.numero_factura]
          };
        }
      });

      // Convertir a array y ordenar por ventas
      const accesoriosProcesados = Object.values(accesoriosAgrupados)
        .sort((a, b) => b.cantidad_ventas - a.cantidad_ventas) // Ordenar por ventas descendente
        .slice(0, 4) // Tomar solo los 4 más vendidos
        .map((accesorio, index) => ({
          id: `accesorio-${accesorio.nombre.replace(/\s+/g, '-').toLowerCase()}`,
          nombre: accesorio.nombre,
          cantidad_ventas: accesorio.cantidad_ventas,
          mes: accesorio.mes,
          color: colores[index % colores.length]
        }));

      // Calcular porcentajes
      const totalVentas = accesoriosProcesados.reduce((sum, a) => sum + a.cantidad_ventas, 0);
      
      const accesoriosConPorcentajes = accesoriosProcesados.map(accesorio => ({
        ...accesorio,
        porcentaje: totalVentas > 0 ? Math.round((accesorio.cantidad_ventas / totalVentas) * 100) : 0
      }));

      setAccesoriosMasVendidos(accesoriosConPorcentajes);
      
    } catch (err) {
      setError('Error al cargar los productos más vendidos');
      setAccesoriosMasVendidos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Obtener los accesorios favoritos del mes actual desde el endpoint
    obtenerAccesoriosFavoritos();
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
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
              onClick={obtenerAccesoriosFavoritos}
              className="mt-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay accesorios más vendidos
  if (accesoriosMasVendidos.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No hay datos de ventas de accesorios este mes
            </h3>
            <p className="text-gray-500 text-sm">
              Aún no se han registrado ventas de accesorios en el mes actual
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
// Renderizar el componente con los accesorios más vendidos
  return (
    <div className="bg-white rounded-lg p-6 mb-6" style={{boxShadow: '0 0 8px #9aeb1040, 0 0 0 1px #9ae91133'}}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <div className="text-xl font-bold text-gray-800 mb-1">MÁS VENDIDOS</div>
          <p className="text-gray-600 text-sm">BASADO EN LAS VENTAS DEL MES DE {obtenerMesActual()}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={obtenerAccesoriosFavoritos}
            className="w-8 h-8 bg-cyan-100 hover:bg-cyan-200 text-cyan-600 rounded-full transition-colors flex items-center justify-center"
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
      {/* Renderizar los accesorios más vendidos */}
      {mostrarComponente && (
        <div className="flex items-start gap-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 flex-1 items-stretch">
            {accesoriosMasVendidos.map((accesorio, index) => (
              <div key={accesorio.id} className="bg-white/80 backdrop-blur-sm rounded-md p-2 border border-white/50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col h-52">
                <div className="flex-grow flex items-center justify-center">
                  <h className="font-semibold text-gray-800 text-[18px] leading-tight text-center mb-2">{accesorio.nombre}</h>
                </div>
                <div className="mt-auto space-y-0.5">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`${accesorio.color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${accesorio.porcentaje}%` }}></div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold ${accesorio.color.replace('bg-', 'text-')}`}>{accesorio.porcentaje}%</span>
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    <span className="font-bold text-gray-800">{accesorio.cantidad_ventas}</span> ventas
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden lg:flex items-center justify-center relative">
            <img 
              src={images[currentImageIndex]} 
              alt="Accesorios para mascotas" 
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

export default AccesoriosMasVendidos;