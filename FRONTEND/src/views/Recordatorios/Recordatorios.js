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
import ModalActualizar from './modal-actualizar';

const Recordatorios = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalActualizarVisible, setModalActualizarVisible] = useState(false); // 🔹 Nuevo estado
  const [globalFilter, setGlobalFilter] = useState('');
  
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
  }, []);

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
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar datos',
        text: err.message || 'Ver consola para más detalles'
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Abrir modal de AGREGAR
  const abrirModalAgregar = () => {
    setFormData(INITIAL_FORM_DATA);
    setModalVisible(true);
  };

  // 🔹 Abrir modal de ACTUALIZAR
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

  // 🔹 Manejar cambios del formulario
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'mensaje_recordatorio' ? value.toUpperCase() : value
    }));
  };

  // 🔹 GUARDAR NUEVO RECORDATORIO
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
          title: 'Recordatorio creado',
          text: 'Preparando envío de mensajes...',
          showConfirmButton: false,
          timer: 1800,
        });

        // Enviar mensajes automáticamente
        const { servicios: telefonos } = await verCatalogo("TELEFONO");

        if (!telefonos?.length) {
          Swal.fire('Aviso', 'No hay números registrados en la base de datos.', 'info');
          setLoading(false);
          return;
        }

        const numerosValidos = telefonos
          .map(c => c.telefono_cliente?.toString().trim())
          .map(num => {
            let limpio = num.replace(/\D/g, '');
            if (!limpio.startsWith('504')) limpio = '504' + limpio;
            return limpio;
          })
          .filter(num => /^\d{11,13}$/.test(num));

        if (numerosValidos.length === 0) {
          Swal.fire('Aviso', 'No se encontraron números válidos para enviar.', 'info');
          setLoading(false);
          return;
        }

        const mensaje = encodeURIComponent(formData.mensaje_recordatorio.trim());
        let enviados = 0;

        for (const numero of numerosValidos) {
          try {
            const link = `https://wa.me/${numero}?text=${mensaje}`;
            const ventana = window.open(link, '_blank', 'noopener,noreferrer');
            if (ventana) enviados++;
            await new Promise(r => setTimeout(r, 1200));
          } catch {
            console.warn(`No se pudo procesar el número: ${numero}`);
          }
        }

        Swal.fire({
          icon: 'success',
          title: 'Envío completado',
          text: `Se enviaron recordatorios a ${enviados} clientes válidos.`,
          timer: 2500,
          showConfirmButton: false,
        });

      } else {
        throw new Error(resultado.error || 'Error en la operación');
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

  // 🔹 ACTUALIZAR RECORDATORIO EXISTENTE
  const actualizarRecordatorioHandler = async () => {
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

    setLoading(true);

    const datosEnviar = {
      id_recordatorio: formData.id_recordatorio_pk, // 🔥 KEY CORRECTA para el backend
      mensaje_recordatorio: formData.mensaje_recordatorio.trim(),
      ultimo_envio: null,
      intentos: null,
      ultimo_error: null,
      id_estado_programacion_fk: null,
      id_cliente_fk: null,
      id_tipo_item_fk: parseInt(formData.id_tipo_item_fk),
      id_frecuencia_fk: parseInt(formData.id_frecuencia_fk)
    };

    try {
      console.log("📤 Payload actualización:", datosEnviar);
      
      const resultado = await actualizarRecordatorio(datosEnviar);

      if (resultado.Consulta) {
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'El recordatorio fue actualizado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
        cerrarModalActualizar();
        await cargarTodo();
      } else {
        throw new Error(resultado.error || 'Error en la actualización');
      }

    } catch (error) {
      console.error('❌ Error al actualizar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo actualizar el recordatorio',
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
            onClick={abrirModalAgregar}
            loading={loading}
          />
        </div>

        {/* Tabla modular */}
        <TablaRecordatorios 
          recordatorios={recordatorios}
          loading={loading}
          globalFilter={globalFilter}
          tiposItems={tiposItems}
          frecuencias={frecuencias}
          estadosProgramacion={estadosProgramacion}
          onEdit={abrirModalActualizar} // 🔹 Usar la función correcta
          onDelete={cargarTodo}
        />
      </div>

      {/* Modal AGREGAR */}
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

      {/* Modal ACTUALIZAR */}
      <ModalActualizar 
        visible={modalActualizarVisible}
        onHide={cerrarModalActualizar}
        formData={formData}
        onChange={manejarCambio}
        onSave={actualizarRecordatorioHandler} // 🔹 Función dedicada
        loading={loading}
        tiposItems={tiposItems}
        frecuencias={frecuencias}
      />
    </div>
  );
};

export default Recordatorios;