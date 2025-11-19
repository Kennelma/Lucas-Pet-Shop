import React, { useState, useEffect } from 'react';
import ModalTablaEstilistas from './modal-tabla-estilistas';
import ModalAgregarEstilista from './modal-agregar';
import ModalActualizarEstilista from './modal-actualizar';
import EstadisticasEstilistas from './EstadisticasEstilistas';

import Swal from 'sweetalert2';

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
  const [modalTabla, setModalTabla] = useState(false);
  const [estilistaSeleccionado, setEstilistaSeleccionado] = useState(null);

  useEffect(() => {
    cargarEstilistas();
    document.body.style.fontFamily = 'Poppins';
  }, []);

  const cargarEstilistas = async () => {
    try {
      setLoading(true);
      const data = await verEstilistas();
      setEstilistas(data || []);
    } catch (error) {
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
      title: '¿Eliminar Estilista?',
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

    <div className="min-h-screen p-6 bg-gray-50" style={{ fontFamily: 'Poppins' }}>
    <div className="min-h-screen p-6 bg-gray-50" style={{ fontFamily: 'Poppins' }}>
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
          <div className="rounded-xl p-6 mb-3"
            style={{
              backgroundImage: 'url("/H11.png")',
              backgroundColor: '#fda55d',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right center',
              boxShadow: '0 0 8px #f8e6a440, 0 0 0 1px #f8e6a433'
            }}
          >
            <div className="flex justify-center items-center">
              <h2 className="text-2xl font-black text-center uppercase text-black">
                GESTIÓN DE ESTILISTAS
              </h2>
            </div>
            <p className="text-center text-black italic mt-2">
              Administra los estilistas disponibles en el sistema para su gestión
            </p>
          </div>

          {/* Dashboard Estadístico */}
          <EstadisticasEstilistas
            estilistaSeleccionado={estilistaSeleccionado}
            onClearSelection={() => setEstilistaSeleccionado(null)}
            estilistas={estilistas}
          />


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

      <ModalTablaEstilistas
        visible={modalTabla}
        onHide={() => setModalTabla(false)}
        onRefresh={cargarEstilistas}
        onEdit={abrirModalActualizar}
        onDelete={handleEliminar}
      />
    </div>
    </div>
  );
};

export default Estilistas;