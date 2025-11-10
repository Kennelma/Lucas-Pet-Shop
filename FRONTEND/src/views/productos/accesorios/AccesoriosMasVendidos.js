import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { verProductosFavoritos } from '../../../AXIOS.SERVICES/products-axios';

const AccesoriosMasVendidos = ({ accesorios = [] }) => {
  const [accesoriosMasVendidos, setAccesoriosMasVendidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarComponente, setMostrarComponente] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  // Función para procesar productos favoritos desde el backend
  const procesarProductosFavoritos = (productosFavoritos) => {
    if (!productosFavoritos || productosFavoritos.length === 0) {
      return [];
    }

    // Procesar los productos favoritos del backend
    const accesoriosConVentas = productosFavoritos
      .filter(producto => producto.activo && producto.tipo_producto === 'ACCESORIO') // Solo accesorios activos
      .map((producto, index) => ({
        id: producto.id_producto_pk || producto.id,
        nombre: producto.nombre_producto || 'ACCESORIO SIN NOMBRE',
        categoria: producto.categoria || 'No especificada',
        precio: producto.precio || 0,
        stock: producto.stock || 0,
        sku: producto.sku_producto || '',
        cantidad_ventas: producto.cantidad_ventas || 0, // Viene del backend
        color: colores[index % colores.length]
      }))
      .sort((a, b) => b.cantidad_ventas - a.cantidad_ventas) // Ordenar por ventas
      .slice(0, 4); // Tomar solo los 4 más vendidos

    // Calcular porcentajes
    const totalVentas = accesoriosConVentas.reduce((sum, a) => sum + a.cantidad_ventas, 0);
    
    return accesoriosConVentas.map(accesorio => ({
      ...accesorio,
      porcentaje: totalVentas > 0 ? Math.round((accesorio.cantidad_ventas / totalVentas) * 100) : 0
    }));
  };

  useEffect(() => {
    const cargarProductosFavoritos = async () => {
      setLoading(true);
      
      try {
        // Llamar al endpoint para obtener productos favoritos de tipo ACCESORIO
        const productosFavoritos = await verProductosFavoritos('ACCESORIO');
        const accesoriosProcesados = procesarProductosFavoritos(productosFavoritos);
        setAccesoriosMasVendidos(accesoriosProcesados);
      } catch (error) {
        console.error('Error al cargar productos favoritos:', error);
        setAccesoriosMasVendidos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarProductosFavoritos();
  }, []); // Ya no depende de props, obtiene datos directamente del backend

  // Efecto para el carrusel de imágenes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000); // Cambia cada 10 segundos

    return () => clearInterval(interval);
  }, [images.length]);

  // Estado de loading
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 mb-6" style={{boxShadow: '0 0 8px #9aeb1040, 0 0 0 1px #9ae91133'}}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <div className="text-xl font-bold text-gray-800 mb-1">MÁS VENDIDOS</div>
            <p className="text-gray-600 text-sm">CARGANDO DATOS...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
          <span className="ml-3 text-gray-500">Obteniendo productos favoritos...</span>
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
              No hay accesorios favoritos para mostrar
            </h3>
            <p className="text-gray-500 text-sm">
              Los productos más vendidos aparecerán aquí cuando haya datos de ventas
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
               El sistema de análisis de ventas está listo para funcionar
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 mb-6" style={{boxShadow: '0 0 8px #9aeb1040, 0 0 0 1px #9ae91133'}}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <div className="text-xl font-bold text-gray-800 mb-1">MÁS VENDIDOS</div>
          <p className="text-gray-600 text-sm">BASADO EN LAS VENTAS DEL MES ACTUAL</p>
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