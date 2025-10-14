import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as freeSolidSvgIcons from '@fortawesome/free-solid-svg-icons';

export default function Sucursales() {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [empresas, setEmpresas] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [sucursalEditando, setSucursalEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  const [formSucursal, setFormSucursal] = useState({
    nombre_sucursal: '',
    direccion_sucursal: '',
    telefono_sucursal: '',
    id_empresa_fk: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    // Datos de ejemplo para empresas
    const empresasEjemplo = [
      { id_empresa_pk: 1, nombre_empresa: 'Tech Solutions SA' },
      { id_empresa_pk: 2, nombre_empresa: 'Global Corp' }
    ];
    setEmpresas(empresasEjemplo);

    // Datos de ejemplo para sucursales
    const sucursalesEjemplo = [
      { 
        id_sucursal_pk: 1, 
        nombre_sucursal: 'Sucursal Central',
        direccion_sucursal: 'Comercial Plaza, Local 101',
        telefono_sucursal: '9999-8888',
        id_empresa_fk: 1,
        nombre_empresa: 'Lucas Pet Shop'
      },
     
    ];
    setSucursales(sucursalesEjemplo);

    // En producción, aquí se haría la llamada a la API para obtener datos reales
  };

  const handleChangeSucursal = (e) => {
    setFormSucursal({ ...formSucursal, [e.target.name]: e.target.value });
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
  };

  const limpiarFormulario = () => {
    setFormSucursal({
      nombre_sucursal: '',
      direccion_sucursal: '',
      telefono_sucursal: '',
      id_empresa_fk: ''
    });
    setModoEdicion(false);
    setSucursalEditando(null);
  };

  const handleNuevaSucursal = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const handleEditarSucursal = (sucursal) => {
    setFormSucursal({
      nombre_sucursal: sucursal.nombre_sucursal,
      direccion_sucursal: sucursal.direccion_sucursal,
      telefono_sucursal: sucursal.telefono_sucursal,
      id_empresa_fk: sucursal.id_empresa_fk
    });
    setSucursalEditando(sucursal);
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  const handleEliminarSucursal = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta sucursal?')) return;

    try {
      console.log('🗑️ Eliminando sucursal ID:', id);
      
        // Simular llamada a API

      setSucursales(sucursales.filter(suc => suc.id_sucursal_pk !== id));
      mostrarMensaje('success', 'Sucursal eliminada exitosamente');
    } catch (error) {
      mostrarMensaje('error', 'Error al eliminar la sucursal');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const datosEnviar = { 
        entidad: 'SUCURSALES',
        ...formSucursal,
        ...(modoEdicion && { id_sucursal_pk: sucursalEditando.id_sucursal_pk })
      };

      console.log(`📤 ${modoEdicion ? 'Editando' : 'Creando'} SUCURSAL:`, datosEnviar);

      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Buscar el nombre de la empresa para mostrar
      const empresaSeleccionada = empresas.find(emp => emp.id_empresa_pk === parseInt(formSucursal.id_empresa_fk));

      if (modoEdicion) {
        // Actualizar sucursal existente
        setSucursales(sucursales.map(suc => 
          suc.id_sucursal_pk === sucursalEditando.id_sucursal_pk 
            ? { 
                ...suc, 
                ...formSucursal,
                nombre_empresa: empresaSeleccionada?.nombre_empresa || ''
              }
            : suc
        ));
        mostrarMensaje('success', 'Sucursal actualizada exitosamente');
      } else {
        // Crear nueva sucursal
        const nuevaSucursal = {
          id_sucursal_pk: Date.now(), // ID temporal
          ...formSucursal,
          nombre_empresa: empresaSeleccionada?.nombre_empresa || ''
        };
        setSucursales([...sucursales, nuevaSucursal]);
        mostrarMensaje('success', 'Sucursal creada exitosamente');
      }

      // Simular llamada a API
      const url = modoEdicion 
        ? `/api/sucursales/${sucursalEditando.id_sucursal_pk}`
        : '/api/sucursales';
      
      const response = await fetch(url, {
        method: modoEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosEnviar)
      });

      const data = await response.json();
      
      if (!data.Consulta) {
        throw new Error(data.error || 'Error al guardar');
      }

      // Recargar lista después de crear/editar
      cargarDatos();
      

      limpiarFormulario();
      setMostrarFormulario(false);

    } catch (error) {
      mostrarMensaje('error', error.message || 'Error al guardar los datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {mensaje.texto && (
        <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
          mensaje.tipo === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {mensaje.tipo === 'success' ? (
            <FontAwesomeIcon icon={freeSolidSvgIcons.faCheckCircle} className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <FontAwesomeIcon icon={freeSolidSvgIcons.faExclamationCircle} className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`text-sm font-medium ${mensaje.tipo === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {mensaje.tipo === 'success' ? 'Éxito' : 'Error'}
            </p>
            <p className={`text-sm mt-1 ${mensaje.tipo === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {mensaje.texto}
            </p>
          </div>
        </div>
      )}

      {/* Botón para agregar nueva sucursal */}
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Gestión de Sucursales</h3>
        <button
          onClick={handleNuevaSucursal}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FontAwesomeIcon icon={freeSolidSvgIcons.faPlus} className="w-4 h-4" />
          Nueva Sucursal
        </button>
      </div>

      {/* Lista de sucursales existentes */}
      <div className="space-y-4 mb-6">
        {sucursales.map((sucursal) => (
          <div key={sucursal.id_sucursal_pk} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-gray-900">{sucursal.nombre_sucursal}</h4>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {sucursal.nombre_empresa}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={freeSolidSvgIcons.faMapMarkerAlt} className="w-3 h-3" />
                    {sucursal.direccion_sucursal}
                  </div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={freeSolidSvgIcons.faPhone} className="w-3 h-3" />
                    {sucursal.telefono_sucursal}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEditarSucursal(sucursal)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-colors"
                >
                  <FontAwesomeIcon icon={freeSolidSvgIcons.faEdit} className="w-3 h-3" />
                  Editar
                </button>
                <button
                  onClick={() => handleEliminarSucursal(sucursal.id_sucursal_pk)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-colors"
                >
                  <FontAwesomeIcon icon={freeSolidSvgIcons.faTrash} className="w-3 h-3" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {sucursales.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FontAwesomeIcon icon={freeSolidSvgIcons.faBuilding} className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay sucursales registradas</p>
            <p className="text-sm">Haz clic en "Nueva Sucursal" para agregar una</p>
          </div>
        )}
      </div>

      {/* Formulario modal/overlay */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {modoEdicion ? 'Editar Sucursal' : 'Nueva Sucursal'}
              </h3>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={freeSolidSvgIcons.faTimes} className="w-5 h-5" />
              </button>
            </div>

        

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={freeSolidSvgIcons.faBuilding} className="w-4 h-4" />
                  Empresa *
                </label>
                <select
                  name="id_empresa_fk"
                  value={formSucursal.id_empresa_fk}
                  onChange={handleChangeSucursal}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white cursor-pointer"
                  required
                >
                  <option value="">Seleccionar empresa...</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id_empresa_pk} value={empresa.id_empresa_pk}>
                      {empresa.nombre_empresa}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={freeSolidSvgIcons.faMapMarkerAlt} className="w-4 h-4" />
                  Nombre de la Sucursal
                </label>
                <input
                  type="text"
                  name="nombre_sucursal"
                  value={formSucursal.nombre_sucursal}
                  onChange={handleChangeSucursal}
                  placeholder="Ej: Sucursal Norte"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={freeSolidSvgIcons.faMapMarkerAlt} className="w-4 h-4" />
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion_sucursal"
                  value={formSucursal.direccion_sucursal}
                  onChange={handleChangeSucursal}
                  placeholder="Ej: Barrio El Carmen"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={freeSolidSvgIcons.faPhone} className="w-4 h-4" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono_sucursal"
                  value={formSucursal.telefono_sucursal}
                  onChange={handleChangeSucursal}
                  placeholder="Ej: 9999-8888"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {modoEdicion ? 'Actualizando...' : 'Guardando...'}
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={freeSolidSvgIcons.faSave} className="w-5 h-5" />
                      {modoEdicion ? 'Actualizar' : 'Guardar'}
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}