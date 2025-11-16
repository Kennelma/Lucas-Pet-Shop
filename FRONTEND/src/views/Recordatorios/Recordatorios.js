import { useState, useEffect } from "react";
import TablaRecordatorios from './tabla-recordatorios.js';
import { verCatalogo } from '../../AXIOS.SERVICES/reminders-axios.js';

const Recordatorios = () => {
  const [tipoServicio, setTipoServicio] = useState([]);
  const [frecuencias, setFrecuencias] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarCatalogos = async () => {
      setLoading(true);
      try {
        const [tipoServicioRes, frecuenciasRes] = await Promise.all([
          verCatalogo('TIPO_SERVICIO'),
          verCatalogo('FRECUENCIA')
        ]);

        setTipoServicio(tipoServicioRes?.servicios || []);
        setFrecuencias(frecuenciasRes?.servicios || []);
      } catch (err) {
        console.error('Error cargando catálogos:', err);
      } finally {
        setLoading(false);
      }
    };
    cargarCatalogos();
  }, []);

  return (
    <div style={{ fontFamily: 'Poppins' }}>
      <div className="w-full px-6">
        {/* Título */}
        <div
          className="rounded-xl p-6 mb-3"
          style={{
            backgroundImage: 'url("/H10.jpg")',
            backgroundColor: '#A57ECF',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'left center',
            boxShadow: '0 0 8px #C4D3AB40, 0 0 0 1px #C4D3AB33'
          }}
        >
          <div className="flex justify-center items-center">
            <h2 className="text-2xl font-black text-center uppercase text-black">
              GESTIÓN DE RECORDATORIOS
            </h2>
          </div>
          <p className="text-center text-black italic mt-2">
            Administra los recordatorios de servicios para tus clientes
          </p>
        </div>

        <TablaRecordatorios
          tipoServicio={tipoServicio}
          frecuencias={frecuencias}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Recordatorios;