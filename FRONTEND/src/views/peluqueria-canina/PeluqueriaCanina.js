import React, { useState, useEffect } from 'react';
import PromocionesSeccion from './PromocionesSeccion';
import ServiciosSeccion from './ServiciosSeccion';
import ModalPromocion from './modal_promocion';
import ModalServicio from './modal_servicio';
import { verRegistro, insertarRegistro, actualizarRegistro, borrarRegistro } from '../../services/apiService';
import './peluqueria-canina.css';

const PeluqueriaCanina = () => {
  const [promociones, setPromociones] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalPromocionAbierto, setModalPromocionAbierto] = useState(false);
  const [modalServicioAbierto, setModalServicioAbierto] = useState(false);
  const [promocionEditando, setPromocionEditando] = useState(null);
  const [servicioEditando, setServicioEditando] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [promocionesData, serviciosData] = await Promise.all([
        verRegistro('tbl_promociones'),
        verRegistro('tbl_servicios_peluqueria_canina'),
      ]);
      setPromociones(promocionesData || []);
      setServicios(serviciosData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardarPromocion = async (data) => {
    if (promocionEditando) {
      await actualizarRegistro('tbl_promociones', promocionEditando.id_promocion_pk, data);
    } else {
      await insertarRegistro('tbl_promociones', data);
    }
    setModalPromocionAbierto(false);
    setPromocionEditando(null);
    cargarDatos();
  };

  const guardarServicio = async (data) => {
    if (servicioEditando) {
      await actualizarRegistro('tbl_servicios_peluqueria_canina', servicioEditando.id_servicio_peluqueria_pk, data);
    } else {
      await insertarRegistro('tbl_servicios_peluqueria_canina', data);
    }
    setModalServicioAbierto(false);
    setServicioEditando(null);
    cargarDatos();
  };

  return (
    <div className="peluqueria-container">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="peluqueria-header">
          <h1 className="peluqueria-title">Peluquería Canina</h1>
          <p className="peluqueria-subtitle">Gestiona promociones y servicios de peluquería para mascotas</p>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <>
            <PromocionesSeccion
              promociones={promociones}
              abrirModalPromocion={(promocion) => {
                setPromocionEditando(promocion);
                setModalPromocionAbierto(true);
              }}
              eliminarPromocion={async (id) => {
                await borrarRegistro('tbl_promociones', id);
                cargarDatos();
              }}
            />
            <ServiciosSeccion
              servicios={servicios}
              abrirModalServicio={(servicio) => {
                setServicioEditando(servicio);
                setModalServicioAbierto(true);
              }}
              eliminarServicio={async (id) => {
                await borrarRegistro('tbl_servicios_peluqueria_canina', id);
                cargarDatos();
              }}
            />
          </>
        )}
      </div>

      <ModalPromocion
        isOpen={modalPromocionAbierto}
        onClose={() => setModalPromocionAbierto(false)}
        onSubmit={guardarPromocion}
        promocion={promocionEditando}
      />

      <ModalServicio
        isOpen={modalServicioAbierto}
        onClose={() => setModalServicioAbierto(false)}
        onSubmit={guardarServicio}
        servicio={servicioEditando}
      />
    </div>
  );
};

export default PeluqueriaCanina;