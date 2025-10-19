import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  verRecordatorios, 
  insertarRecordatorio,
  actualizarRecordatorio, 
  verCatalogo 
} from '../../AXIOS.SERVICES/reminder';
import TablaRecordatorios from './tabla-recordatorios';
import ModalAgregar, { BotonAgregar } from './modal-agregar'; 

const Recordatorios = () => {
  const [modalVisible, setModalVisible] = useState(false);
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

  useEffect(() => {
    cargarTodo();
  }, []);

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

  const cerrarModal = () => {
    setModalVisible(false);
    setFormData(INITIAL_FORM_DATA); 
    setEditando(false);
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    
    // Convertir a mayúsculas el mensaje del recordatorio
    if (name === 'mensaje_recordatorio') {
      finalValue = value.toUpperCase();
    }
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const guardarRecordatorio = async () => {
    // Validación de campos obligatorios
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
        // Cerrar modal primero
        cerrarModal();
        await cargarTodo();
        
        // Mostrar alert después con un pequeño delay
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


  return (
    <div className="min-h-screen p-6 bg-gray-50">
       {/* Título */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm border border-gray-200 mb-3">
        <div className="flex justify-center items-center">
          <h2 className="text-2xl font-black text-center uppercase text-gray-800">
            RECORDATORIOS
          </h2>
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

          <BotonAgregar 
            onClick={() => abrirModal()}
            loading={loading}
          />
        </div>

        {/* Componente de tabla modular */}
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

      {/* Componente de modal modular */}
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
      </div>
  );
};

export default Recordatorios;