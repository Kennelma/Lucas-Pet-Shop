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
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="bg-gradient from-purple-50 rounded-xl p-6 mb-3" style={{boxShadow: '0 0 8px #9333ea40, 0 0 0 1px #9333ea33'}}>
        <h2 className="text-2xl font-black text-center uppercase text-gray-800">
          GESTIÓN DE RECORDATORIOS
        </h2>
        <p className="text-center text-gray-600 italic">Administración de recordatorios del negocio</p>
      </div>

      <TablaRecordatorios
        tipoServicio={tipoServicio}
        frecuencias={frecuencias}
        loading={loading}
      />
    </div>
  );
};

export default Recordatorios;