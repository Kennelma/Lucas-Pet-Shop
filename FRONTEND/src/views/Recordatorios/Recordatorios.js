//====================IMPORTACIONES====================
import { useState, useEffect } from 'react';
import TablaRecordatorios from './tabla-recordatorios';
import ModalAgregar from './modal-agregar';
import ConexionWhatsApp from './ConexionWhatsApp';


//====================COMPONENTE_PRINCIPAL====================
const Recordatorios = () => {
  //====================ESTADOS====================
  const [recordatorios, setRecordatorios] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalWhatsApp, setModalWhatsApp] = useState(false);

  //====================EFFECT_INICIAL====================
  useEffect(() => {
    // cargarTodo();
  }, []);

  //====================RENDERIZADO====================
  return (
    <div>
      {/* Título */}
      <h2>Recordatorios</h2>

      {/* Tabla de recordatorios */}
      <TablaRecordatorios recordatorios={recordatorios} />

      {/* Modal para agregar/editar */}
      <ModalAgregar visible={modalVisible} />

      {/* Modal para conexión WhatsApp */}
      <ConexionWhatsApp isOpen={modalWhatsApp} />
    </div>
  );
};

//====================EXPORTACION====================
export default Recordatorios;
