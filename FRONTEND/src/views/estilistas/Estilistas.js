import React, { useState, useEffect } from 'react';
import { FilterMatchMode } from 'primereact/api';
import TablaEstilistas from './tabla-estilistas';
import ModalAgregarEstilista from './modal-agregar';
import ModalActualizarEstilista from './modal-actualizar';
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
        title: 'Error',
        text: 'No se pudieron cargar los estilistas',
        confirmButtonColor: '#ef4444'
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
    console.log('ID a eliminar:', id); // Debug
    
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        console.log('Eliminando estilista con ID:', id); // Debug
        const response = await eliminarEstilista(id);
        console.log('Respuesta del servidor:', response); // Debug
        
        if (response && response.Consulta) {
          Swal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: 'El estilista ha sido eliminado correctamente',
            timer: 2000,
            showConfirmButton: false
          });
          cargarEstilistas();
        } else {
          throw new Error(response?.error || 'Error desconocido');
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo eliminar el estilista',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {loading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <span className="ml-3 text-gray-600">Cargando estilistas...</span>
        </div>
      ) : (
        <>
          {/* Título */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 mb-3" style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
            <div className="flex justify-center items-center">
              <h2 className="text-2xl font-black text-center uppercase text-gray-800">
                GESTIÓN DE ESTILISTAS
              </h2>
            </div>
            <p className="text-center text-gray-600 italic">Administra el personal de peluquería y sus bonificaciones</p>
          </div>

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
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors flex items-center gap-2"
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
            />
          </div>
        </>
      )}

      <ModalAgregarEstilista
        isOpen={modalAgregar}
        onClose={() => setModalAgregar(false)}
        onSave={cargarEstilistas}
      />

      <ModalActualizarEstilista
        isOpen={modalActualizar}
        onClose={() => setModalActualizar(false)}
        estilista={estilistaSeleccionado}
        onSave={cargarEstilistas}
      />
    </div>
  );
};

export default Estilistas;