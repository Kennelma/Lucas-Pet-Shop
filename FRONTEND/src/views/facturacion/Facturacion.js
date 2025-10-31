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
  enviarRecordatorioMasivo,
  obtenerQRWhatsApp
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
  const [qrCode, setQrCode] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [serverOnline, setServerOnline] = useState(true); // 🔹 NUEVO ESTADO
  
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

  // 🔹 Función para verificar si el servidor está online
  const verificarServidor = async () => {
    try {
      await axios.get(`${API_URL}/whatsapp/status`, {
        timeout: 5000,
        headers: {
          "Authorization": `Bearer ${sessionStorage.getItem("token")}`
        }
      });
      setServerOnline(true);
    } catch (error) {
      setServerOnline(false);
      console.warn('⚠️ Servidor backend no disponible');
    }
  };

  useEffect(() => {
    verificarServidor();
    cargarTodo();
    verificarWhatsAppStatus();
  }, []);

  // 🔹 Verificar estado de WhatsApp con manejo de errores
  const verificarWhatsAppStatus = async () => {
    if (!serverOnline) return;
    
    try {
      const res = await verificarEstadoWhatsApp();
      setWhatsappConnected(res.connected);
    } catch (err) {
      console.error('Error verificando WhatsApp:', err);
      setWhatsappConnected(false);
    }
  };

  // 🔹 Esperar conexión exitosa
  const esperarConexionWhatsApp = async () => {
    let intentos = 0;
    const maxIntentos = 120; // 2 minutos
    
    const checkConnection = setInterval(async () => {
      try {
        const statusRes = await verificarEstadoWhatsApp();

        if (statusRes.connected) {
          clearInterval(checkConnection);
          setWhatsappConnected(true);
          setShowQRModal(false);
          setQrCode('');
          setCheckingConnection(false);
          
          Swal.fire({
            icon: 'success',
            title: '¡WhatsApp Conectado!',
            text: 'Ya puedes enviar recordatorios masivos',
            timer: 2000,
            showConfirmButton: false
          });
        }

        intentos++;
        if (intentos >= maxIntentos) {
          clearInterval(checkConnection);
          setShowQRModal(false);
          setCheckingConnection(false);
          Swal.fire({
            icon: 'warning',
            title: 'Tiempo agotado',
            text: 'No se detectó el escaneo del QR. Intenta de nuevo.'
          });
        }
      } catch (error) {
        console.error('Error verificando conexión:', error);
      }
    }, 1000);
  };

  // 🔹 Función mejorada para conectar WhatsApp
  const handleConectarWhatsApp = async () => {
    if (!serverOnline) {
      Swal.fire('Servidor offline', 'El servidor backend no está disponible', 'error');
      return;
    }

    try {
      setCheckingConnection(true);
      Swal.fire({
        title: 'Iniciando conexión WhatsApp...',
        text: 'Preparando para generar código QR',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // 1. Iniciar conexión
      await conectarWhatsApp();
      
      // 2. Esperar un momento para que se genere el QR
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 3. Intentar obtener QR inmediatamente
      let qrObtenido = false;
      let intentos = 0;
      const maxIntentos = 20; // 20 segundos máximo
      
      const obtenerQR = async () => {
        try {
          const qrRes = await obtenerQRWhatsApp();
          console.log('📱 Respuesta QR:', qrRes);
          
          if (qrRes.Consulta && qrRes.qrCode) {
            qrObtenido = true;
            setQrCode(qrRes.qrCode);
            setShowQRModal(true);
            Swal.close();
            console.log('✅ QR mostrado en modal');
            
            // 4. Esperar conexión exitosa
            await esperarConexionWhatsApp();
            return;
          }
          
          intentos++;
          if (intentos < maxIntentos && !qrObtenido) {
            setTimeout(obtenerQR, 1000);
          } else if (!qrObtenido) {
            setCheckingConnection(false);
            Swal.fire({
              icon: 'error',
              title: 'No se pudo generar QR',
              text: 'Intenta de nuevo o revisa la consola del servidor'
            });
          }
        } catch (error) {
          console.error('Error obteniendo QR:', error);
          intentos++;
          if (intentos < maxIntentos) {
            setTimeout(obtenerQR, 1000);
          } else {
            setCheckingConnection(false);
            Swal.fire('Error', 'No se pudo obtener el QR: ' + error.message, 'error');
          }
        }
      };
      
      // Iniciar el proceso de obtención de QR
      await obtenerQR();

    } catch (error) {
      setCheckingConnection(false);
      console.error('Error en conexión WhatsApp:', error);
      Swal.fire('Error', 'No se pudo iniciar la conexión: ' + error.message, 'error');
    }
  };

  const cargarTodo = async () => {
    if (!serverOnline) {
      console.warn('Servidor offline, no se pueden cargar datos');
      return;
    }

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
      // No mostrar error si es por servidor offline
      if (!err.message.includes('Network Error')) {
        Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
      }
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

  // 🔹 GUARDAR Y ENVIAR CON BAILEYS - MEJORADO CON PRÓXIMO ENVÍO
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
        await handleConectarWhatsApp();
        if (!whatsappConnected) {
          // Si no conectó, solo guardar sin enviar
          await guardarSoloRecordatorio();
          return;
        }
      } else {
        // Usuario eligió solo guardar
        await guardarSoloRecordatorio();
        return;
      }
    }

    // Si WhatsApp está conectado, guardar y enviar
    await guardarYEnviarRecordatorio();
  };

  // 🔹 FUNCIÓN PARA SOLO GUARDAR (SIN ENVIAR)
  const guardarSoloRecordatorio = async () => {
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
        
        Swal.fire({
          icon: 'success',
          title: 'Recordatorio guardado',
          html: `
            <div class="text-left">
              <p>✅ <strong>Recordatorio programado</strong></p>
              <p class="text-sm text-gray-600 mt-2">
                Se enviará automáticamente según la frecuencia seleccionada.
              </p>
            </div>
          `,
          timer: 3000
        });
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

  // 🔹 FUNCIÓN PARA GUARDAR Y ENVIAR INMEDIATAMENTE
  const guardarYEnviarRecordatorio = async () => {
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

        // 🔹 ENVÍO INMEDIATO CON BAILEYS
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
            id_recordatorio: resultado.id_recordatorio,
            mensaje: formData.mensaje_recordatorio.trim()
          },
          {
            headers: { "Authorization": `Bearer ${token}` }
          }
        );

        const { exitosos, fallidos, total } = envioRes.data.resultados;

        // Recargar para ver estados actualizados
        await cargarTodo();

        Swal.fire({
          icon: fallidos.length === 0 ? 'success' : 'warning',
          title: fallidos.length === 0 ? '¡Éxito Total!' : 'Envío Parcial',
          html: `
            <div class="text-left">
              <p><strong>Envío inmediato completado:</strong></p>
              <p><strong>Total:</strong> ${total} clientes</p>
              <p><strong>✅ Exitosos:</strong> ${exitosos.length}</p>
              <p><strong>❌ Fallidos:</strong> ${fallidos.length}</p>
              <p class="text-sm text-gray-600 mt-2">
                El recordatorio seguirá enviándose automáticamente según la frecuencia seleccionada.
              </p>
            </div>
          `,
          timer: 5000
        });
      }

    } catch (error) {
      console.error('Error al guardar y enviar recordatorio:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo completar la operación',
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Modal mejorado para mostrar QR
  const QRModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showQRModal ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-bold mb-3 text-center">Conectar WhatsApp</h3>
        
        {qrCode ? (
          <>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Escanea este código con WhatsApp:
            </p>
            <div className="flex justify-center mb-4 p-4 bg-white rounded-lg border">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode)}`} 
                alt="QR Code WhatsApp" 
                className="border rounded w-full max-w-xs"
                onError={(e) => {
                  console.error('Error cargando imagen QR');
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mb-3 text-center">
              WhatsApp → Configuración → Dispositivos vinculados → Vincular dispositivo
            </p>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Generando código QR...</p>
          </div>
        )}
        
        <div className="text-center">
          <button
            onClick={() => {
              setShowQRModal(false);
              setCheckingConnection(false);
              setQrCode('');
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {/* 🔹 INDICADOR DE ESTADO DEL SERVIDOR */}
      {!serverOnline && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <span className="h-3 w-3 bg-red-500 rounded-full mr-2"></span>
            <strong>Servidor offline:</strong>
            <span className="ml-2">El backend no está disponible. Algunas funciones pueden no estar operativas.</span>
          </div>
        </div>
      )}

      {/* Título */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm border border-gray-200 mb-3">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-center uppercase text-gray-800">
            RECORDATORIOS
          </h2>
          
          {/* Indicador de WhatsApp */}
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${
              !serverOnline ? 'bg-gray-500' : 
              whatsappConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></span>
            <span className="text-sm font-semibold">
              {!serverOnline ? 'Servidor Offline' : 
               whatsappConnected ? 'WhatsApp Conectado' : 'WhatsApp Desconectado'}
            </span>
            {!serverOnline ? (
              <button
                onClick={verificarServidor}
                className="ml-2 px-3 py-1 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600"
              >
                Reintentar
              </button>
            ) : !whatsappConnected && (
              <button
                onClick={handleConectarWhatsApp}
                disabled={checkingConnection}
                className={`ml-2 px-3 py-1 rounded-lg text-xs ${
                  checkingConnection 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {checkingConnection ? 'Conectando...' : 'Conectar'}
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

      {/* Modal QR */}
      <QRModal />
    </div>
  );
};

export default Recordatorios;