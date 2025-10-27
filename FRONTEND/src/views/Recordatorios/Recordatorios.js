import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { 
  verRecordatorios, 
  insertarRecordatorio,
  actualizarRecordatorio, 
  verCatalogo,
  verificarEstadoWhatsApp,
  conectarWhatsApp,
  enviarRecordatorioMasivo
} from '../../AXIOS.SERVICES/reminder';
import TablaRecordatorios from './tabla-recordatorios';
import ModalAgregar, { BotonAgregar } from './modal-agregar';
import ModalActualizar from './modal-actualizar';

const API_URL = "http://localhost:4000/api";

const Recordatorios = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalActualizarVisible, setModalActualizarVisible] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  
  const INITIAL_FORM_DATA = {
    id_recordatorio_pk: null, 
    mensaje_recordatorio: '',
    id_tipo_item_fk: '',
    id_frecuencia_fk: ''
  };

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [recordatorios, setRecordatorios] = useState([]);
  const [tiposItems, setTiposItems] = useState([]);
  const [frecuencias, setFrecuencias] = useState([]);
  const [estadosProgramacion, setEstadosProgramacion] = useState([]);

  useEffect(() => {
    cargarTodo();
    verificarWhatsAppStatus();
  }, []);

  // 🔹 Verificar estado de WhatsApp
 const verificarWhatsAppStatus = async () => {
  try {
    const res = await verificarEstadoWhatsApp();
    setWhatsappConnected(res.connected);
  } catch (err) {
    console.error('Error verificando WhatsApp:', err);
  }
};
  // 🔹 Conectar WhatsApp
  const conectarWhatsApp = async () => {
  try {
    Swal.fire({
      title: 'Conectando WhatsApp...',
      html: 'Escanea el código QR en la terminal del servidor',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    await conectarWhatsApp();

    // Esperar conexión
    let intentos = 0;
    const maxIntentos = 60;

    const checkConnection = setInterval(async () => {
      const statusRes = await verificarEstadoWhatsApp();

      if (statusRes.connected) {
        clearInterval(checkConnection);
        setWhatsappConnected(true);
        Swal.fire({
          icon: 'success',
          title: '¡WhatsApp Conectado!',
          text: 'Ya puedes enviar recordatorios masivos',
          timer: 2000
        });
      }

      intentos++;
      if (intentos >= maxIntentos) {
        clearInterval(checkConnection);
        Swal.fire({
          icon: 'warning',
          title: 'Tiempo agotado',
          text: 'No se detectó el escaneo del QR. Intenta de nuevo.'
        });
      }
    }, 1000);

  } catch (error) {
    Swal.fire('Error', 'No se pudo conectar WhatsApp', 'error');
  }
};

  const cargarTodo = async () => {
    try {
      setLoading(true);
      const recordatoriosData = await verRecordatorios(); 
      setRecordatorios(recordatoriosData || []);

      const resTipos = await verCatalogo('TIPO_SERVICIO');
      const resFrecuencias = await verCatalogo('FRECUENCIA');
      const resEstados = await verCatalogo('ESTADO');

      setTiposItems(resTipos?.servicios || []);
      setFrecuencias(resFrecuencias?.servicios || []);
      setEstadosProgramacion(resEstados?.servicios || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalAgregar = () => {
    setFormData(INITIAL_FORM_DATA);
    setModalVisible(true);
  };

  const abrirModalActualizar = (recordatorio) => {
    setFormData({
      id_recordatorio_pk: recordatorio.id_recordatorio_pk,
      mensaje_recordatorio: recordatorio.mensaje_recordatorio,
      id_tipo_item_fk: String(recordatorio.id_tipo_item_fk),
      id_frecuencia_fk: String(recordatorio.id_frecuencia_fk)
    });
    setModalActualizarVisible(true);
  };

  const cerrarModalAgregar = () => {
    setModalVisible(false);
    setFormData(INITIAL_FORM_DATA);
  };

  const cerrarModalActualizar = () => {
    setModalActualizarVisible(false);
    setFormData(INITIAL_FORM_DATA);
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'mensaje_recordatorio' ? value.toUpperCase() : value
    }));
  };

  // 🔹 GUARDAR Y ENVIAR CON BAILEYS
  const guardarRecordatorio = async () => {
    if (!formData.mensaje_recordatorio?.trim()) {
      Swal.fire('Campo requerido', 'El mensaje del recordatorio es obligatorio', 'warning');
      return;
    }
    if (!formData.id_tipo_item_fk) {
      Swal.fire('Campo requerido', 'Debe seleccionar un tipo de servicio', 'warning');
      return;
    }
    if (!formData.id_frecuencia_fk) {
      Swal.fire('Campo requerido', 'Debe seleccionar una frecuencia', 'warning');
      return;
    }

    // Verificar si WhatsApp está conectado
    if (!whatsappConnected) {
      const result = await Swal.fire({
        icon: 'warning',
        title: 'WhatsApp no conectado',
        text: '¿Deseas conectar WhatsApp ahora para enviar automáticamente?',
        showCancelButton: true,
        confirmButtonText: 'Sí, conectar',
        cancelButtonText: 'Solo guardar'
      });

      if (result.isConfirmed) {
        await conectarWhatsApp();
        if (!whatsappConnected) return; // Si no conectó, cancelar
      }
    }

    setLoading(true);

    const datosEnviar = {
      mensaje_recordatorio: formData.mensaje_recordatorio.trim(),
      id_tipo_item_fk: parseInt(formData.id_tipo_item_fk),
      id_frecuencia_fk: parseInt(formData.id_frecuencia_fk),
    };

    try {
      const resultado = await insertarRecordatorio(datosEnviar);

      if (resultado.Consulta) {
        cerrarModalAgregar();
        await cargarTodo();

        // 🔹 ENVÍO AUTOMÁTICO CON BAILEYS
        if (whatsappConnected) {
          Swal.fire({
            title: 'Enviando mensajes...',
            html: 'Por favor espera mientras se envían los recordatorios',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          const token = sessionStorage.getItem("token");
          const envioRes = await axios.post(
            `${API_URL}/whatsapp/enviar-masivo`,
            {
              id_recordatorio: resultado.id_recordatorio || null,
              mensaje: formData.mensaje_recordatorio.trim()
            },
            {
              headers: { "Authorization": `Bearer ${token}` }
            }
          );

          const { exitosos, fallidos, total } = envioRes.data.resultados;

          Swal.fire({
            icon: 'success',
            title: 'Envío completado',
            html: `
              <p><strong>Total:</strong> ${total}</p>
              <p><strong>Exitosos:</strong> ${exitosos.length}</p>
              <p><strong>Fallidos:</strong> ${fallidos.length}</p>
            `,
            timer: 3000
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Recordatorio guardado',
            text: 'No se enviaron mensajes porque WhatsApp no está conectado',
            timer: 2000
          });
        }
      }

    } catch (error) {
      console.error('Error al guardar recordatorio:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo guardar el recordatorio',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* Título */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm border border-gray-200 mb-3">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-center uppercase text-gray-800">
            RECORDATORIOS
          </h2>
          
          {/* Indicador de WhatsApp */}
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${whatsappConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm font-semibold">
              {whatsappConnected ? 'WhatsApp Conectado' : 'WhatsApp Desconectado'}
            </span>
            {!whatsappConnected && (
              <button
                onClick={conectarWhatsApp}
                className="ml-2 px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600"
              >
                Conectar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Barra de búsqueda + botón Nuevo */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-80">
            <input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar recordatorios..."
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

          <BotonAgregar 
            onClick={abrirModalAgregar}
            loading={loading}
          />
        </div>

        <TablaRecordatorios 
          recordatorios={recordatorios}
          loading={loading}
          globalFilter={globalFilter}
          tiposItems={tiposItems}
          frecuencias={frecuencias}
          estadosProgramacion={estadosProgramacion}
          onEdit={abrirModalActualizar}
          onDelete={cargarTodo}
        />
      </div>

      <ModalAgregar 
        visible={modalVisible}
        onHide={cerrarModalAgregar}
        formData={formData}
        onChange={manejarCambio}
        onSave={guardarRecordatorio}
        loading={loading}
        editando={false}
        tiposItems={tiposItems}
        frecuencias={frecuencias}
      />

      <ModalActualizar 
        visible={modalActualizarVisible}
        onHide={cerrarModalActualizar}
        recordatorioSeleccionado={formData}
        tiposItems={tiposItems}
        frecuencias={frecuencias}
        onReload={cargarTodo}
      />
    </div>
  );
};

export default Recordatorios;