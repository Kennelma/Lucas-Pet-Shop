import React, { useState, useEffect } from 'react';
import { FilterMatchMode } from 'primereact/api';
import TablaEstilistas from './tabla-estilistas';
import ModalAgregarEstilista from './modal-agregar';
import ModalActualizarEstilista from './modal-actualizar';
import EstadisticasEstilistas from './EstadisticasEstilistas';

import Swal from 'sweetalert2';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import {
  verEstilistas,
  eliminarEstilista
} from '../../AXIOS.SERVICES/employees-axios';

const Estilistas = () => {
  const [estilistas, setEstilistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  
  // Estados para modales
  const [modalAgregar, setModalAgregar] = useState(false);
  const [modalActualizar, setModalActualizar] = useState(false);
  const [estilistaSeleccionado, setEstilistaSeleccionado] = useState(null);

  useEffect(() => {
    cargarEstilistas();
  }, []);

  const cargarEstilistas = async () => {
    try {
      setLoading(true);
      const data = await verEstilistas();
      setEstilistas(data || []);
    } catch (error) {
      console.error('Error al cargar estilistas:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de Conexión',
        text: 'No se pudieron cargar los estilistas. Verifica tu conexión a internet.',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Reintentar'
      }).then((result) => {
        if (result.isConfirmed) {
          cargarEstilistas();
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const abrirModalAgregar = () => {
    setModalAgregar(true);
  };

  const abrirModalActualizar = (estilista) => {
    setEstilistaSeleccionado(estilista);
    setModalActualizar(true);
  };

  const handleEliminar = async (id) => {
    console.log('ID a eliminar:', id);
    
    // Buscar información del estilista para mostrar en la confirmación
    const estilista = estilistas.find(e => e.id_estilista_pk === id);
    
    if (!estilista) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontró el estilista seleccionado',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    const result = await Swal.fire({
      title: '⚠️ ¿Eliminar Estilista?',
      html: `
        <div class="text-left">
          <p class="mb-3 text-gray-700">Estás a punto de eliminar a:</p>
          <div class="bg-red-50 p-4 rounded-lg border border-red-200">
            <p class="font-bold text-red-700">${estilista.nombre_estilista} ${estilista.apellido_estilista}</p>
            <p class="text-sm text-gray-600">Identidad: ${estilista.identidad_estilista}</p>
          </div>
          <p class="mt-3 text-red-600 font-semibold">⚠️ Esta acción no se puede deshacer</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true
    });

    if (result.isConfirmed) {
      // Mostrar loading
      Swal.fire({
        title: 'Eliminando...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await eliminarEstilista(id);

        if (response && response.Consulta) {
          await Swal.fire({
            icon: 'success',
            title: '¡Eliminado Exitosamente!',
            html: `
              <p class="text-gray-700">
                <strong>${estilista.nombre_estilista} ${estilista.apellido_estilista}</strong>
              </p>
              <p class="text-sm text-gray-600 mt-2">
                Ha sido eliminado del sistema
              </p>
            `,
            timer: 2000,
            showConfirmButton: false
          });
          
          // Limpiar selección si el estilista eliminado estaba seleccionado
          if (estilistaSeleccionado?.id_estilista_pk === id) {
            setEstilistaSeleccionado(null);
          }
          
          cargarEstilistas();
        } else {
          throw new Error(response?.error || 'Error desconocido');
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
        
        // Mensaje de error más descriptivo
        let mensajeError = 'No se pudo eliminar el estilista';
        
        if (error.message.includes('foreign key') || 
            error.message.includes('constraint') ||
            error.message.includes('referencia')) {
          mensajeError = 'No se puede eliminar este estilista porque tiene registros asociados (servicios, citas, etc.)';
        } else if (error.message.includes('network') || 
                   error.message.includes('connection')) {
          mensajeError = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
        }
        
        await Swal.fire({
          icon: 'error',
          title: 'Error al Eliminar',
          text: mensajeError,
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'Entendido'
        });
      }
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Estilos inline para z-index de modales */}
      <style>{`
        .p-dialog-mask {
          z-index: 9998 !important;
        }
        .p-dialog {
          z-index: 9999 !important;
        }
        .p-dialog-content {
          z-index: 10000 !important;
        }
        .swal2-container {
          z-index: 10001 !important;
        }
        .p-component-overlay {
          z-index: 9998 !important;
          background-color: rgba(0, 0, 0, 0.4) !important;
        }
      `}</style>

      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <span className="ml-3 text-gray-600">Cargando estilistas...</span>
        </div>
      ) : (
        <>
          {/* Título */}
          <div className="bg-gradient-to-r from-purple-50 rounded-xl p-6 mb-3" style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
            <div className="flex justify-center items-center">
              <h2 className="text-2xl font-black text-center uppercase text-gray-800">
                GESTIÓN DE ESTILISTAS
              </h2>
            </div>
            <p className="text-center text-gray-600 italic">Administra el personal de peluquería y sus bonificaciones</p>
          </div>

          {/* Dashboard Estadístico */}
          <EstadisticasEstilistas 
            estilistaSeleccionado={estilistaSeleccionado} 
            onClearSelection={() => setEstilistaSeleccionado(null)}
            estilistas={estilistas}
          />

          {/* Header con búsqueda, botón y tabla */}
          <div className="bg-white rounded-lg p-6 mb-6" style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
            {/* Barra de búsqueda + botón Nuevo */}
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-80">
                <input
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Buscar estilistas..."
                  className="w-full px-4 py-2 border rounded-full"
                />
                {globalFilter && (
                  <button
                    onClick={() => setGlobalFilter('')}
                    className="absolute right-3 top-2 text-gray-500"
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                className="bg-purple-500 hover:bg-purple-700 text-white px-6 py-2 rounded transition-colors flex items-center gap-2"
                onClick={abrirModalAgregar}
              >
                <FontAwesomeIcon icon={faPlus} />
                Nuevo Estilista
              </button>
            </div>
            
            {/* Tabla de Estilistas */}
            <TablaEstilistas
              estilistas={estilistas}
              loading={loading}
              globalFilter={globalFilter}
              onEdit={abrirModalActualizar}
              onDelete={handleEliminar}
              onSelectionChange={setEstilistaSeleccionado}
              estilistaSeleccionado={estilistaSeleccionado}
            />
          </div>
        </>
      )}

      {/* IMPORTANTE: Pasar el array de estilistas a los modales para validación */}
      <ModalAgregarEstilista
        isOpen={modalAgregar}
        onClose={() => setModalAgregar(false)}
        onSave={cargarEstilistas}
        estilistas={estilistas}
      />

      <ModalActualizarEstilista
        isOpen={modalActualizar}
        onClose={() => setModalActualizar(false)}
        estilista={estilistaSeleccionado}
        onSave={cargarEstilistas}
        estilistas={estilistas}
      />
    </div>
  );
};

export default Estilistas;