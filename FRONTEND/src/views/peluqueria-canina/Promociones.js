import React, { useState } from 'react';
import { PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { usePromociones } from "../../components/hooks/usePromociones";
import PromocionCard from '../../components/promociones/PromocionCard';
import PromocionModal from '../../components/promociones/PromocionModal';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import EmptyState from '../../components/ui/EmptyState';


//los procesos 
const Promociones = () => {
  const {
    promociones,
    loading,
    error,
    mensaje,
    crearPromocion,
    actualizarPromocion,
    eliminarPromocion,
    limpiarMensajes
  } = usePromociones();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [promocionEditando, setPromocionEditando] = useState(null);
  const [promocionesVisibles, setPromocionesVisibles] = useState(6);
  //los datos del formulario
  
  const [formData, setFormData] = useState({
    nombre_promocion: '',
    descripcion_promocion: '',
    precio_promocion: '',
    dias_promocion: ''
  });

  const abrirModal = (promocion = null) => {
    if (promocion) {
      setFormData({
        nombre_promocion: promocion.nombre_promocion,
        descripcion_promocion: promocion.descripcion_promocion,
        precio_promocion: promocion.precio_promocion,
        dias_promocion: promocion.dias_promocion
      });
      setPromocionEditando(promocion);
    } else {
      setFormData({
        nombre_promocion: '',
        descripcion_promocion: '',
        precio_promocion: '',
        dias_promocion: ''
      });
      setPromocionEditando(null);
    }
    setModalAbierto(true);
    limpiarMensajes();
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setPromocionEditando(null);
    limpiarMensajes();
  };

  const handleGuardarPromocion = async () => {
    const isEditing = !!promocionEditando;
    const result = isEditing 
      ? await actualizarPromocion(promocionEditando.id_promocion_pk, formData)
      : await crearPromocion(formData);

    if (result.success) {
      setTimeout(cerrarModal, 1500);
    }
  };

  const handleEliminarPromocion = async (promocion) => {
    await eliminarPromocion(promocion);
  };

  const mostrarMas = () => {
    setPromocionesVisibles(prev => prev + 6);
  };

  const LoadingSpinner = () => (
    <div className="text-center py-8">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="mt-2 text-gray-600">Cargando promociones...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 backdrop-blur-sm bg-white/95">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <SparklesIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Promociones</h1>
              </div>
              <p className="text-gray-600">Gestiona las promociones y descuentos de peluquería canina</p>
            </div>
            <Button
              onClick={() => abrirModal()}
              variant="primary"
              size="lg"
              className="shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Nueva Promoción
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
          ) : promociones.length === 0 ? (
            <EmptyState
              icon={SparklesIcon}
              title="No hay promociones"
              description="Comienza creando tu primera promoción para atraer más clientes."
              buttonText="Nueva Promoción"
              onButtonClick={() => abrirModal()}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promociones.slice(0, promocionesVisibles).map((promocion) => (
                  <PromocionCard
                    key={promocion.id_promocion_pk}
                    promocion={promocion}
                    onEdit={abrirModal}
                    onDelete={handleEliminarPromocion}
                  />
                ))}
              </div>
              
              {promociones.length > promocionesVisibles && (
                <div className="text-center mt-8 pt-6 border-t border-gray-200">
                  <Button
                    onClick={mostrarMas}
                    variant="secondary"
                    size="lg"
                    className="shadow-sm hover:shadow-md"
                  >
                    Mostrar más promociones ({promociones.length - promocionesVisibles} restantes)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <PromocionModal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleGuardarPromocion}
        loading={loading}
        error={error}
        mensaje={mensaje}
        isEditing={!!promocionEditando}
      />
    </div>
  );
};

export default Promociones;