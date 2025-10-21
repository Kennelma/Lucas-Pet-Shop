import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";

const MedicamentosBajoStock = ({ medicamentos = [] }) => {
  const [medicamentosBajoStock, setMedicamentosBajoStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarComponente, setMostrarComponente] = useState(true);

  // Colores para los medicamentos
  const colores = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-amber-500', 'bg-rose-500', 'bg-pink-500'];

  // Función para procesar medicamentos con bajo stock
  const procesarMedicamentos = (medicamentosReales) => {
    if (!medicamentosReales || medicamentosReales.length === 0) {
      return [];
    }

    const medicamentosConBajoStock = medicamentosReales
      .filter(medicamento => medicamento.activo) // Solo medicamentos activos
      .map((medicamento, index) => {
        // Calcular el total de stock de todos los lotes
        const stockTotal = medicamento.lotes ? 
          medicamento.lotes.reduce((total, lote) => total + (parseInt(lote.stock_lote) || 0), 0) : 
          parseInt(medicamento.stock) || 0;
        
        const stockMinimo = parseInt(medicamento.stock_minimo) || 5;
        
        // Calcular el porcentaje de stock disponible
        const porcentajeStock = stockMinimo > 0 ? Math.round((stockTotal / stockMinimo) * 100) : 100;
        
        // Determinar nivel de criticidad
        let nivelCriticidad = 'normal';
        let urgencia = 0;
        
        if (stockTotal === 0 || stockTotal <= stockMinimo * 0.5) {
          nivelCriticidad = 'critico';
          urgencia = 3;
        } else if (stockTotal <= stockMinimo * 0.75) {
          nivelCriticidad = 'alerta';
          urgencia = 2;
        } else if (stockTotal <= stockMinimo) {
          nivelCriticidad = 'bajo';
          urgencia = 1;
        }
        
        return {
          id: medicamento.id_producto_pk || medicamento.id,
          nombre: medicamento.nombre_producto || 'MEDICAMENTO SIN NOMBRE',
          presentacion: medicamento.presentacion_medicamento,
          tipo: medicamento.tipo_medicamento,
          stock_total: stockTotal,
          stock_minimo: stockMinimo,
          porcentaje_stock: porcentajeStock,
          nivel_criticidad: nivelCriticidad,
          urgencia: urgencia,
          color: colores[index % colores.length]
        };
      })
      .filter(medicamento => medicamento.stock_total <= medicamento.stock_minimo) // Solo medicamentos con bajo stock
      .sort((a, b) => a.urgencia - b.urgencia) // Ordenar por urgencia (más críticos primero)
      .slice(0, 4); // Tomar solo los 4 más críticos

    return medicamentosConBajoStock;
  };

  useEffect(() => {
    setLoading(true);
    
    // Simular delay de carga
    setTimeout(() => {
      const medicamentosProcesados = procesarMedicamentos(medicamentos);
      setMedicamentosBajoStock(medicamentosProcesados);
      setLoading(false);
    }, 500);
  }, [medicamentos]);

  // Función para obtener el color según el nivel de criticidad
  const obtenerColorCriticidad = (nivel) => {
    switch (nivel) {
      case 'critico':
        return 'bg-red-500';
      case 'alerta':
        return 'bg-orange-500';
      case 'bajo':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Función para obtener el texto del nivel
  const obtenerTextoNivel = (nivel) => {
    switch (nivel) {
      case 'critico':
        return 'CRÍTICO';
      case 'alerta':
        return 'ALERTA';
      case 'bajo':
        return 'BAJO';
      default:
        return 'NORMAL';
    }
  };

  // Si no hay medicamentos con bajo stock
  if (medicamentosBajoStock.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 mb-6" style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <h3 className="text-lg font-semibold text-green-600 mb-2">
              ✅ Todos los medicamentos tienen stock suficiente
            </h3>
            <p className="text-gray-500 text-sm">
              No hay medicamentos con bajo stock en este momento
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
              📊 El monitoreo de stock está funcionando correctamente
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 mb-6" style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <h3 className="text-xl font-bold text-red-600 mb-1">⚠️ MEDICAMENTOS CON BAJO STOCK</h3>
          <p className="text-gray-600 text-sm">REQUIEREN ATENCIÓN INMEDIATA PARA REABASTECIMIENTO</p>
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
            {medicamentosBajoStock.map((medicamento, index) => (
              <div key={medicamento.id} className="bg-white/80 backdrop-blur-sm rounded-md p-2 border border-white/50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col h-52">
                <div className="flex-grow flex items-center justify-center">
                  <h4 className="font-semibold text-gray-800 text-[18px] leading-tight text-center mb-2">
                    {medicamento.nombre}
                  </h4>
                </div>
                <div className="mt-auto space-y-0.5">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`${obtenerColorCriticidad(medicamento.nivel_criticidad)} h-1.5 rounded-full transition-all duration-500`} 
                      style={{ width: `${Math.min(medicamento.porcentaje_stock, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold ${obtenerColorCriticidad(medicamento.nivel_criticidad).replace('bg-', 'text-')}`}>
                      {medicamento.porcentaje_stock}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    <span className="font-bold text-gray-800">{medicamento.stock_total}</span> / 
                    <span className="font-bold text-gray-800"> {medicamento.stock_minimo}</span> unidades
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <img src="/medicamentos-alerta.jpg" alt="Medicamentos con bajo stock" className="w-45 h-53 object-cover rounded-xl shadow-md" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicamentosBajoStock;