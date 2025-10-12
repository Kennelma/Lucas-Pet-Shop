import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as freeSolidSvgIcons from '@fortawesome/free-solid-svg-icons';

export default function InformacionEmpresa() {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [empresas, setEmpresas] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [formEmpresa, setFormEmpresa] = useState({
    nombre_empresa: '',
    direccion_empresa: '',
    telefono_empresa: '',
    correo_empresa: ''
  });

  useEffect(() => {
    cargarEmpresas();
  }, []);

  const cargarEmpresas = () => {
    // Datos de ejemplo
    const empresasEjemplo = [
      { 
        id_empresa_pk: 1, 
        nombre_empresa: 'Lucas Pet Shop',
        direccion_empresa: 'Av. Principal 123, Ciudad Teg',
        telefono_empresa: '2222-3333',
        correo_empresa: 'lucaspetshop@gmail.com'
      },
      
    ];
    setEmpresas(empresasEjemplo);

    //aquí se haría una llamada a la API para obtener las empresas
  };

  const handleChangeEmpresa = (e) => {
    setFormEmpresa({ ...formEmpresa, [e.target.name]: e.target.value });
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
  };

  const limpiarFormulario = () => {
    setFormEmpresa({
      nombre_empresa: '',
      direccion_empresa: '',
      telefono_empresa: '',
      correo_empresa: ''
    });
    setModoEdicion(false);
    setEmpresaEditando(null);
  };

  const handleNuevaEmpresa = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const handleEditarEmpresa = (empresa) => {
    setFormEmpresa({
      nombre_empresa: empresa.nombre_empresa,
      direccion_empresa: empresa.direccion_empresa,
      telefono_empresa: empresa.telefono_empresa,
      correo_empresa: empresa.correo_empresa
    });
    setEmpresaEditando(empresa);
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  const handleEliminarEmpresa = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta empresa?')) return;

    try {
      console.log('Eliminando empresa ID:', id);
        // Aquí se haría una llamada a la API para eliminar la empresa

      setEmpresas(empresas.filter(emp => emp.id_empresa_pk !== id));
      mostrarMensaje('success', 'Empresa eliminada exitosamente');
    } catch (error) {
      mostrarMensaje('error', 'Error al eliminar la empresa');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const datosEnviar = { 
        entidad: 'EMPRESA',
        ...formEmpresa,
        ...(modoEdicion && { id_empresa_pk: empresaEditando.id_empresa_pk })
      };

      console.log(`📤 ${modoEdicion ? 'Editando' : 'Creando'} EMPRESA:`, datosEnviar);

      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (modoEdicion) {
        // Actualizar empresa existente
        setEmpresas(empresas.map(emp => 
          emp.id_empresa_pk === empresaEditando.id_empresa_pk 
            ? { ...emp, ...formEmpresa }
            : emp
        ));
        mostrarMensaje('success', 'Empresa actualizada exitosamente');
      } else {
        // Crear nueva empresa
        const nuevaEmpresa = {
          id_empresa_pk: Date.now(), // ID temporal
          ...formEmpresa
        };
        setEmpresas([...empresas, nuevaEmpresa]);
        mostrarMensaje('success', 'Empresa creada exitosamente');
      }

      // Aquí se haría una llamada a la API para crear/editar la empresa

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

      {/* Botón para agregar nueva empresa */}
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Gestión de Empresas</h3>
        <button
          onClick={handleNuevaEmpresa}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FontAwesomeIcon icon={freeSolidSvgIcons.faPlus} className="w-4 h-4" />
          Nueva Empresa
        </button>
      </div>

      {/* Lista de empresas existentes */}
      <div className="space-y-4 mb-6">
        {empresas.map((empresa) => (
          <div key={empresa.id_empresa_pk} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">{empresa.nombre_empresa}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={freeSolidSvgIcons.faMapMarkerAlt} className="w-3 h-3" />
                    {empresa.direccion_empresa}
                  </div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={freeSolidSvgIcons.faPhone} className="w-3 h-3" />
                    {empresa.telefono_empresa}
                  </div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={freeSolidSvgIcons.faEnvelope} className="w-3 h-3" />
                    {empresa.correo_empresa}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEditarEmpresa(empresa)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-colors"
                >
                  <FontAwesomeIcon icon={freeSolidSvgIcons.faEdit} className="w-3 h-3" />
                  Editar
                </button>
                <button
                  onClick={() => handleEliminarEmpresa(empresa.id_empresa_pk)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-colors"
                >
                  <FontAwesomeIcon icon={freeSolidSvgIcons.faTrash} className="w-3 h-3" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {empresas.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FontAwesomeIcon icon={freeSolidSvgIcons.faBuilding} className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No hay empresas registradas</p>
            <p className="text-sm">Haz clic en "Nueva Empresa" para agregar una</p>
          </div>
        )}
      </div>

      {/* Formulario modal/overlay */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {modoEdicion ? 'Editar Empresa' : 'Nueva Empresa'}
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
                  Nombre de la Empresa
                </label>
                <input
                  type="text"
                  name="nombre_empresa"
                  value={formEmpresa.nombre_empresa}
                  onChange={handleChangeEmpresa}
                  placeholder="Ej: Tech Solutions SA"
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
                  name="direccion_empresa"
                  value={formEmpresa.direccion_empresa}
                  onChange={handleChangeEmpresa}
                  placeholder="Ej: Av. Principal 123"
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
                  name="telefono_empresa"
                  value={formEmpresa.telefono_empresa}
                  onChange={handleChangeEmpresa}
                  placeholder="Ej: 2222-3333"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={freeSolidSvgIcons.faEnvelope} className="w-4 h-4" />
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="correo_empresa"
                  value={formEmpresa.correo_empresa}
                  onChange={handleChangeEmpresa}
                  placeholder="Ej: contacto@empresa.com"
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