//====================IMPORTACIONES====================
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Dialog } from 'primereact/dialog';
import {
  verRecordatorios,
  insertarRecordatorio,
  actualizarRecordatorio,
  verCatalogo
} from '../../AXIOS.SERVICES/reminder';
import { cerrarSesionWhatsApp } from '../../AXIOS.SERVICES/whatsapp-axios';
import TablaRecordatorios from './tabla-recordatorios';
import ModalAgregar, { BotonAgregar } from './modal-agregar';
import ConexionWhatsApp from './ConexionWhatsApp';

//====================COMPONENTE_PRINCIPAL====================
const Recordatorios = () => {
//====================ESTADOS====================
const [modalVisible, setModalVisible] = useState(false);
const [modalWhatsApp, setModalWhatsApp] = useState(false);
const [globalFilter, setGlobalFilter] = useState('');
const INITIAL_FORM_DATA = {
  id_recordatorio_pk: null,
  mensaje_recordatorio: '',
  id_tipo_item_fk: '',
  id_frecuencia_fk: ''
};
const [formData, setFormData] = useState(INITIAL_FORM_DATA);
const [editando, setEditando] = useState(false);
const [loading, setLoading] = useState(false);
const [recordatorios, setRecordatorios] = useState([]);
const [tiposItems, setTiposItems] = useState([]);
const [frecuencias, setFrecuencias] = useState([]);
const [estadosProgramacion, setEstadosProgramacion] = useState([]);

//====================EFFECT_INICIAL====================
useEffect(() => {
  cargarTodo();
}, []);

//====================CARGAR_DATOS====================
const cargarTodo = async () => {
  try {
    setLoading(true);
    const recordatoriosData = await verRecordatorios();
    setRecordatorios(recordatoriosData || []);
    const resTipos = await verCatalogo('TIPO_SERVICIO');
    const resFrecuencias = await verCatalogo('FRECUENCIA');
    const resEstados = await verCatalogo('ESTADO');
    const tiposItems = resTipos?.servicios || [];
    const frecuencias = resFrecuencias?.servicios || [];
    const estados = resEstados?.servicios || [];
    setTiposItems(tiposItems);
    setFrecuencias(frecuencias);
    setEstadosProgramacion(estados);
  } catch (err) {
    console.error('Error cargando datos:', err);
    Swal.fire({
      icon: 'error',
      title: 'Error al cargar datos',
      text: err.message || 'Ver consola para más detalles'
    });
  } finally {
    setLoading(false);
  }
};

//====================ABRIR_MODAL====================
const abrirModal = (recordatorio = null) => {
  if (recordatorio) {
    setFormData({
      id_recordatorio_pk: recordatorio.id_recordatorio_pk,
      mensaje_recordatorio: recordatorio.mensaje_recordatorio,
      id_tipo_item_fk: String(recordatorio.id_tipo_item_fk),
      id_frecuencia_fk: String(recordatorio.id_frecuencia_fk)
    });
    setEditando(true);
  } else {
    setFormData(INITIAL_FORM_DATA);
    setEditando(false);
  }
  setModalVisible(true);
};

//====================CERRAR_MODAL====================
const cerrarModal = () => {
  setModalVisible(false);
  setFormData(INITIAL_FORM_DATA);
  setEditando(false);
};

//====================MANEJAR_CAMBIOS_FORMULARIO====================
const manejarCambio = (e) => {
  const { name, value } = e.target;
  let finalValue = value;
  if (name === 'mensaje_recordatorio') {
    finalValue = value.toUpperCase();
  }
  setFormData(prev => ({ ...prev, [name]: finalValue }));
};

//====================GUARDAR_RECORDATORIO====================
const guardarRecordatorio = async () => {
  if (!formData.mensaje_recordatorio?.trim()) {
    alert('El mensaje del recordatorio es requerido');
    return;
  }
  if (!formData.id_tipo_item_fk) {
    alert('Debe seleccionar un tipo de servicio');
    return;
  }
  if (!formData.id_frecuencia_fk) {
    alert('Debe seleccionar una frecuencia');
    return;
  }
  setLoading(true);
  const datosEnviar = {
    mensaje_recordatorio: formData.mensaje_recordatorio.trim(),
    id_tipo_item_fk: parseInt(formData.id_tipo_item_fk),
    id_frecuencia_fk: parseInt(formData.id_frecuencia_fk)
  };
  try {
    let resultado;
    if (editando) {
      datosEnviar.id_recordatorio_pk = formData.id_recordatorio_pk;
      resultado = await actualizarRecordatorio(datosEnviar);
    } else {
      resultado = await insertarRecordatorio(datosEnviar);
    }
    if (resultado.Consulta) {
      cerrarModal();
      await cargarTodo();
      setTimeout(() => {
        Swal.fire({
          icon: 'success',
          title: editando ? 'Recordatorio actualizado' : 'Recordatorio creado',
          text: resultado.message || 'Operación completada exitosamente',
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }, 100);
    } else {
      throw new Error(resultado.error || 'Error en la operación');
    }
  } catch (error) {
    console.error('Error al guardar recordatorio:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'No se pudo guardar el recordatorio'
    });
  } finally {
    setLoading(false);
  }
};

//====================CERRAR_SESION_WHATSAPP====================
const handleCerrarSesionWhatsApp = async () => {
  const result = await Swal.fire({
    title: '¿Cerrar sesión de WhatsApp?',
    text: 'Tendrás que escanear el código QR nuevamente para reconectar',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    const response = await cerrarSesionWhatsApp();

    if (response.success) {
      Swal.fire({
        icon: 'success',
        title: 'Sesión cerrada',
        text: 'WhatsApp desconectado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cerrar la sesión'
      });
    }
  }
};

//====================RENDERIZADO====================
return (
  <div className="min-h-screen p-6 bg-gray-50">
{/*TITULO*/}
<div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm border border-gray-200 mb-3">
  <div className="flex justify-center items-center">
    <h2 className="text-2xl font-black text-center uppercase text-gray-800">
      RECORDATORIOS
    </h2>
  </div>
</div>

{/*BARRA_BUSQUEDA_Y_BOTON_NUEVO*/}
<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
  <div className="flex justify-between items-center mb-6">
    <div className="relative w-80">
      <input
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Buscar recordatorios..."
        className="w-full px-4 py-2 border rounded-full"
        style={{ borderRadius: '9999px' }}
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
    <div className="flex gap-2">
      <button
        onClick={() => setModalWhatsApp(true)}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        Conectar WhatsApp
      </button>
      <BotonAgregar
        onClick={() => abrirModal()}
        loading={loading}
      />
    </div>
  </div>

{/*TABLA_RECORDATORIOS*/}
<TablaRecordatorios
  recordatorios={recordatorios}
  loading={loading}
  globalFilter={globalFilter}
  tiposItems={tiposItems}
  frecuencias={frecuencias}
  estadosProgramacion={estadosProgramacion}
  onEdit={abrirModal}
  onDelete={cargarTodo}
/>
</div>

{/*MODAL_AGREGAR_EDITAR*/}
<ModalAgregar
  visible={modalVisible}
  onHide={cerrarModal}
  formData={formData}
  onChange={manejarCambio}
  onSave={guardarRecordatorio}
  loading={loading}
  editando={editando}
  tiposItems={tiposItems}
  frecuencias={frecuencias}
  onReload={cargarTodo}
/>

{/*MODAL_CONEXION_WHATSAPP*/}
<ConexionWhatsApp 
  isOpen={modalWhatsApp}
  onClose={() => setModalWhatsApp(false)}
  onCerrarSesion={handleCerrarSesionWhatsApp} 
/>
</div>
);
};

//====================EXPORTACION====================
export default Recordatorios;