import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";

const AlimentosMasVendidos = ({ alimentos = [] }) => {
  const [alimentosMasVendidos, setAlimentosMasVendidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarComponente, setMostrarComponente] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  // Función para procesar alimentos 
  const procesarAlimentos = (alimentosReales) => {
    if (!alimentosReales || alimentosReales.length === 0) {
      return [];
    }

    const alimentosConVentas = alimentosReales
      .filter(alimento => alimento.activo) // Solo alimentos activos
      .map((alimento, index) => {
        // Simular cantidad de ventas basado en precio y stock (precio medio y stock alto = más ventas)
        const factorPrecio = Math.max(5, 30 - (alimento.precio || 0) * 0.5);
        const factorStock = Math.min(20, (alimento.stock || 0) * 0.3);
        const cantidadVentas = Math.floor(factorPrecio + factorStock + Math.random() * 15);
        
        return {
          id: alimento.id_producto || alimento.id,
          nombre: alimento.nombre || 'ALIMENTO SIN NOMBRE',
          cantidad_ventas: cantidadVentas,
          color: colores[index % colores.length]
        };
      })
      .sort((a, b) => b.cantidad_ventas - a.cantidad_ventas) // Ordenar por ventas
      .slice(0, 4); // Tomar solo los 4 más vendidos

    // Calcular porcentajes
    const totalVentas = alimentosConVentas.reduce((sum, a) => sum + a.cantidad_ventas, 0);
    
    return alimentosConVentas.map(alimento => ({
      ...alimento,
      porcentaje: totalVentas > 0 ? Math.round((alimento.cantidad_ventas / totalVentas) * 100) : 0
    }));
  };

  useEffect(() => {
    setLoading(true);
    
    // Simular delay de carga
    setTimeout(() => {
      const alimentosProcesados = procesarAlimentos(alimentos);
      setAlimentosMasVendidos(alimentosProcesados);
      setLoading(false);
    }, 500);
  }, [alimentos]);

  // Efecto para el carrusel de imágenes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000); // Cambia cada 10 segundos

    return () => clearInterval(interval);
  }, [images.length]);

  // Si no hay alimentos más vendidos
  if (alimentosMasVendidos.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No hay alimentos para mostrar estadísticas de ventas
            </h3>
            <p className="text-gray-500 text-sm">
              Agrega alimentos primero para ver cuáles son los más vendidos
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
    <div className="bg-white rounded-lg p-6 mb-6" style={{boxShadow: '0 0 8px #FF9A9840, 0 0 0 1px #FF9A9833'}}>
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