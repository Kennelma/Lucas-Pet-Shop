import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faPlus, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';

import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import Swal from 'sweetalert2';
import { 
  verRecordatorios, 
  insertarRecordatorio,
  actualizarRecordatorio, 
  verCatalogo 
} from '../../AXIOS.SERVICES/reminder'; 

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

  const eliminarRecordatorio = async (recordatorio) => {
    const result = await Swal.fire({
      title: '¿Eliminar recordatorio?',
      html: `
        <div class="text-left my-2 p-2.5 bg-gray-50 rounded-md text-xs">
          <p class="mb-1 text-sm"><span class="font-bold">Mensaje:</span> ${recordatorio.mensaje_recordatorio}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      confirmButtonColor: '#ef4444',
      width: 380,
      padding: '16px'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        // TODO: Implementar eliminación de recordatorio
        
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El recordatorio ha sido eliminado exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
        
        await cargarTodo();
      } catch (error) {
        console.error('Error al eliminar recordatorio:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el recordatorio'
        });
      } finally {
        setLoading(false);
      }
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const guardarRecordatorio = async () => {
    if (!formData.mensaje_recordatorio || !formData.id_tipo_item_fk || !formData.id_frecuencia_fk) {
      alert('Por favor completa todos los campos obligatorios (*)');
      return;
    }
    
    setLoading(true);

    const datosEnviar = {
      mensaje_recordatorio: formData.mensaje_recordatorio,       
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
        alert(resultado.mensaje || 'Operación exitosa ✅');
        await cargarTodo();
        cerrarModal();
      } else {
        alert('❌ Error: ' + (resultado.error || 'No se pudo guardar/actualizar'));
      }

    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error al guardar: ' + (error.message || 'Ver consola para detalles.')); 
    } finally {
      setLoading(false);
    }
  };

  // Plantillas para las columnas de la tabla
  const estadoTemplate = (rowData) => {
    const estado = estadosProgramacion.find(e => e.id_estado_pk === rowData.id_estado_programacion_fk)?.nombre_estado || 'Pendiente';
    const isActivo = rowData.id_estado_programacion_fk === 1;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isActivo ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {estado}
      </span>
    );
  };

  const mensajeTemplate = (rowData) => (
    <div className="max-w-xs">
      <p className="text-sm text-gray-900 line-clamp-2">
        {rowData.mensaje_recordatorio}
      </p>
    </div>
  );

  const tipoTemplate = (rowData) => {
    if (tiposItems.length === 0) {
      return <span className="text-xs text-gray-400">Cargando...</span>;
    }
    
    const tipoItem = tiposItems.find(t => t.id_tipo_item_pk === rowData.id_tipo_item_fk);
    return <span className="text-sm text-gray-700">{tipoItem?.nombre_tipo_item || '—'}</span>;
  };

  const frecuenciaTemplate = (rowData) => {
    if (frecuencias.length === 0) {
      return <span className="text-xs text-gray-400">Cargando...</span>;
    }
    
    const frecuencia = frecuencias.find(f => f.id_frecuencia_record_pk === rowData.id_frecuencia_fk);
    return <span className="text-sm text-gray-700">{frecuencia?.frecuencia_recordatorio || '—'}</span>;
  };

  const fechaTemplate = (rowData) => (
    <span className="text-sm text-gray-700">
      {rowData.programada_para 
        ? new Date(rowData.programada_para).toLocaleDateString('es-ES') 
        : '—'
      }
    </span>
  );

  const accionesTemplate = (rowData) => (
    <div className="flex items-center space-x-2">
      <button 
        className="text-blue-500 hover:text-blue-700 p-2 rounded transition-colors"
        onClick={(e) => {
          e.stopPropagation(); 
          abrirModal(rowData);
        }}
        title="Editar"
      >
        <FontAwesomeIcon icon={faPenToSquare} size="lg" />
      </button>
      <button 
        className="text-red-500 hover:text-red-700 p-2 rounded transition-colors"
        onClick={(e) => {
          e.stopPropagation(); 
          eliminarRecordatorio(rowData);
        }}
        title="Eliminar"
      >
        <FontAwesomeIcon icon={faTrash} size="lg" />
      </button>
    </div>
  );



  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
      <div className="flex justify-center items-center mb-5 relative">
        <h2 className="text-2xl font-bold uppercase text-center text-gray-800">
          Recordatorios
        </h2>
      </div>

      {/* Barra de búsqueda + botón Nuevo */}
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

        <button
          className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors flex items-center gap-2"
          style={{ borderRadius: '12px' }}
          onClick={() => abrirModal()}
        >
          <FontAwesomeIcon icon={faPlus} />
          Nuevo Recordatorio
        </button>
      </div>

      {/* Tabla de recordatorios */}
      {loading ? (
        <div className="flex items-center justify-center space-x-2 py-8 text-gray-500">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span>Cargando recordatorios...</span>
        </div>
      ) : recordatorios.length === 0 ? (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faBell} className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay recordatorios</h3>
          <p className="text-gray-500 mb-6">Crea tu primer recordatorio para mantener a tus clientes informados.</p>
          <button 
            className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors inline-flex items-center gap-2"
            style={{ borderRadius: '12px' }}
            onClick={() => abrirModal()}
          >
            <FontAwesomeIcon icon={faPlus} />
            Nuevo Recordatorio
          </button>
        </div>
      ) : (
        <DataTable
          key={`table-${tiposItems.length}-${frecuencias.length}`} // Fuerza re-render cuando se cargan los datos
          value={recordatorios}
          loading={loading}
          loadingIcon={() => (
            <div className="flex items-center justify-center space-x-2 py-8 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span>Cargando recordatorios...</span>
            </div>
          )}
          globalFilter={globalFilter}
          globalFilterFields={['mensaje_recordatorio']}
          showGridlines
          paginator
          rows={10}
          rowsPerPageOptions={[10, 20, 25]}
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          tableStyle={{ minWidth: '50rem' }}
          className="mt-4"
          size="small"
          selectionMode="single"
          rowClassName={() => 'hover:bg-gray-50 cursor-pointer'}
          emptyMessage="No se encontraron recordatorios"
        >
          <Column field="estado" header="Estado" body={estadoTemplate} style={{ width: '12%' }} />
          <Column field="mensaje_recordatorio" header="Mensaje" body={mensajeTemplate} style={{ width: '35%' }} />
          <Column field="tipo" header="Tipo Servicio" body={tipoTemplate} style={{ width: '18%' }} />
          <Column field="frecuencia" header="Frecuencia" body={frecuenciaTemplate} style={{ width: '15%' }} />
          <Column field="fecha" header="Programada Para" body={fechaTemplate} style={{ width: '12%' }} />
          <Column field="acciones" header="Acciones" body={accionesTemplate} style={{ width: '8%' }} />
        </DataTable>
      )}

      {/* Modal PrimeReact */}
      <Dialog
        header={
          <div className="w-full text-center text-lg font-bold">
            {editando ? 'EDITAR RECORDATORIO' : 'NUEVO RECORDATORIO'}
          </div>
        }
        visible={modalVisible}
        style={{ width: '32rem', borderRadius: '1.5rem' }}
        modal
        closable={false}
        onHide={cerrarModal}
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              onClick={cerrarModal}
              className="p-button-text p-button-secondary"
              disabled={loading}
            />
            <Button
              label={loading ? (editando ? 'Actualizando...' : 'Guardando...') : (editando ? 'Actualizar' : 'Guardar')}
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
              onClick={guardarRecordatorio}
              className="p-button-primary"
              loading={loading}
              disabled={loading}
            />
          </div>
        }
        position="center"
        dismissableMask={false}
        draggable={false}
        resizable={false}
      >
        <div className="mt-2">
          <div className="flex flex-col gap-3">
            {/* Tipo de servicio */}
            <span>
              <label htmlFor="id_tipo_item_fk" className="text-xs font-semibold text-gray-700 mb-1">
                DESTINADO A CLIENTES QUE COMPRARON <span className="text-red-600">*</span>
              </label>
              {loading ? (
                <div className="w-full h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Cargando servicios...</span>
                </div>
              ) : (
                <select
                  id="id_tipo_item_fk"
                  name="id_tipo_item_fk"
                  value={formData.id_tipo_item_fk || ''}
                  onChange={manejarCambio}
                  className="w-full rounded-xl h-9 px-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={tiposItems.length === 0}
                >
                  <option value="">-- Seleccionar servicio --</option>
                  {tiposItems.map(t => (
                    <option key={t.id_tipo_item_pk} value={t.id_tipo_item_pk}>
                      {t.nombre_tipo_item}
                    </option>
                  ))}
                </select>
              )}

            </span>

            {/* Frecuencia */}
            <span>
              <label htmlFor="id_frecuencia_fk" className="text-xs font-semibold text-gray-700 mb-1">
                FRECUENCIA <span className="text-red-600">*</span>
              </label>
              {loading ? (
                <div className="w-full h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Cargando frecuencias...</span>
                </div>
              ) : (
                <select
                  id="id_frecuencia_fk"
                  name="id_frecuencia_fk"
                  value={formData.id_frecuencia_fk || ''}
                  onChange={manejarCambio}
                  className="w-full rounded-xl h-9 px-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={frecuencias.length === 0}
                >
                  <option value="">-- Seleccionar frecuencia --</option>
                  {frecuencias.map(f => (
                    <option key={f.id_frecuencia_record_pk} value={f.id_frecuencia_record_pk}>
                      {f.frecuencia_recordatorio}
                    </option>
                  ))}
                </select>
              )}

            </span>

            {/* Mensaje */}
            <span>
              <label htmlFor="mensaje_recordatorio" className="text-xs font-semibold text-gray-700 mb-1">
                MENSAJE DEL RECORDATORIO <span className="text-red-600">*</span>
              </label>
              <InputTextarea
                id="mensaje_recordatorio"
                name="mensaje_recordatorio"
                value={formData.mensaje_recordatorio}
                onChange={manejarCambio}
                placeholder="Escribe el mensaje que llegará a tus clientes..."
                rows={4}
                className="w-full rounded-xl text-sm"
                style={{ textTransform: 'uppercase' }}
              />
            </span>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Recordatorios;