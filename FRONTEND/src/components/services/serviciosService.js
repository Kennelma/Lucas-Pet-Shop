import React, { useState } from 'react';
import { PlusIcon, ScissorsIcon } from '@heroicons/react/24/outline';
import { useServicios } from '../../hooks/useServicios';
import ServicioCard from '../../components/servicios/ServicioCard';
import ServicioModal from '../../components/servicios/ServicioModal';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import EmptyState from '../../components/ui/EmptyState';

const ServiciosPeluqueria = () => {
  const {
    servicios,
    loading,
    error,
    mensaje,
    crearServicio,
    actualizarServicio,
    eliminarServicio,
    limpiarMensajes
  } = useServicios();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioEditando, setServicioEditando] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre_servicio_peluqueria: '',
    descripcion_servicio: ''
  });

  const abrirModal = (servicio = null) => {
    if (servicio) {
      setFormData({
        nombre_servicio_peluqueria: servicio.nombre_servicio_peluqueria,
        descripcion_servicio: servicio.descripcion_servicio
      });
      setServicioEditando(servicio);
    } else {
      setFormData({
        nombre_servicio_peluqueria: '',
        descripcion_servicio: ''
      });
      setServicioEditando(null);
    }
    setModalAbierto(true);
    limpiarMensajes();
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setServicioEditando(null);
    limpiarMensajes();
  };

  const handleGuardarServicio = async () => {
    const isEditing = !!servicioEditando;
    const result = isEditing 
      ? await actualizarServicio(servicioEditando.id_servicio_peluqueria_pk, formData)
      : await crearServicio(formData);

    if (result.success) {
      setTimeout(cerrarModal, 1500);
    }
  };

  const handleEliminarServicio = async (servicio) => {
    await eliminarServicio(servicio);
  };

  const LoadingSpinner = () => (
    <div className="text-center py-8">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      <p className="mt-2 text-gray-600">Cargando servicios...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 backdrop-blur-sm bg-white/95">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ScissorsIcon className="w-6 h-6 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Servicios de Peluquería</h1>
              </div>
              <p className="text-gray-600">Gestiona los servicios de peluquería canina disponibles</p>
            </div>
            <Button
              onClick={() => abrirModal()}
              variant="success"
              size="lg"
              className="shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Nuevo Servicio
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert 
            type="error" 
            message={error} 
            className="mb-4 animate-fade-in" 
            onClose={limpiarMensajes}
          />
        )}
        {mensaje && (
          <Alert 
            type="success" 
            message={mensaje} 
            className="mb-4 animate-fade-in" 
            onClose={limpiarMensajes}
          />
        )}

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 backdrop-blur-sm bg-white/95">
          {loading ? (
            <LoadingSpinner />
          ) : servicios.length === 0 ? (
            <EmptyState
              icon={ScissorsIcon}
              title="No hay servicios registrados"
              description="Comienza creando tu primer servicio de peluquería canina."
              buttonText="Nuevo Servicio"
              onButtonClick={() => abrirModal()}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicios.map((servicio) => (
                <ServicioCard
                  key={servicio.id_servicio_peluqueria_pk}
                  servicio={servicio}
                  onEdit={abrirModal}
                  onDelete={handleEliminarServicio}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <ServicioModal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleGuardarServicio}
        loading={loading}
        error={error}
        mensaje={mensaje}
        isEditing={!!servicioEditando}
      />
    </div>
  );
};

export default ServiciosPeluqueria;