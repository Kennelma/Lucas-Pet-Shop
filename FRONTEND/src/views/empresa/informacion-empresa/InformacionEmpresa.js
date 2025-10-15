import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as freeSolidSvgIcons from '@fortawesome/free-solid-svg-icons';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import Swal from 'sweetalert2';
import { insertar, ver, eliminarRegistro, actualizarRegistro } from '../../../AXIOS.SERVICES/empresa-axios';

export default function InformacionEmpresa() {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [empresas, setEmpresas] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [errores, setErrores] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const [formEmpresa, setFormEmpresa] = useState({
    nombre_empresa: '',
    direccion_empresa: '',
    telefono_empresa: '',
    correo_empresa: ''
  });

  useEffect(() => {
    traerListaEmpresas();
  }, []);

  const traerListaEmpresas = async () => {
    try {
      const datos = await ver('EMPRESA');
      setEmpresas(datos || []);
    } catch (error) {
      console.error('Error al cargar empresas:', error);
      mostrarMensaje('error', 'Error al cargar las empresas');
    }
  };

  const handleChangeEmpresa = (e) => {
    const copia = { ...formEmpresa };
    copia[e.target.name] = e.target.value;
    setFormEmpresa(copia);
  };

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formEmpresa.nombre_empresa.trim()) {
      nuevosErrores.nombre_empresa = 'El nombre de la empresa es obligatorio';
    }

    if (!formEmpresa.direccion_empresa.trim()) {
      nuevosErrores.direccion_empresa = 'La dirección es obligatoria';
    }

    if (!formEmpresa.telefono_empresa.trim()) {
      nuevosErrores.telefono_empresa = 'El teléfono es obligatorio';
    }

    if (!formEmpresa.correo_empresa.trim()) {
      nuevosErrores.correo_empresa = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formEmpresa.correo_empresa)) {
      nuevosErrores.correo_empresa = 'El formato del correo electrónico no es válido';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const resetearForm = () => {
    setFormEmpresa({
      nombre_empresa: '',
      direccion_empresa: '',
      telefono_empresa: '',
      correo_empresa: ''
    });
    setErrores({});
    setModoEdicion(false);
    setEmpresaEditando(null);
  };

  const handleClose = () => {
    resetearForm();
    setMostrarFormulario(false);
  };

  const handleNuevaEmpresa = () => {
    resetearForm();
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

  const handleEliminarEmpresa = async (empresa) => {
    const result = await Swal.fire({
      title: '¿Eliminar empresa?',
      html: `
        <div class="text-left my-2 p-2.5 bg-gray-50 rounded-md text-xs">
          <p class="mb-1 text-sm"><span class="font-bold">Nombre:</span> ${empresa.nombre_empresa}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Dirección:</span> ${empresa.direccion_empresa}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Teléfono:</span> ${empresa.telefono_empresa}</p>
          <p class="mb-1 text-sm"><span class="font-bold">Email:</span> ${empresa.correo_empresa}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      width: 380,
      padding: '16px'
    });

    if (result.isConfirmed) {
      try {
        const response = await eliminarRegistro(empresa.id_empresa_pk, 'EMPRESA');
        
        if (response.Consulta) {
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'La empresa ha sido eliminada exitosamente',
            timer: 2000,
            showConfirmButton: false
          });
          traerListaEmpresas(); // Recargar datos
        } else {
          throw new Error(response.error || 'Error al eliminar');
        }
      } catch (error) {
        console.error('Error al eliminar empresa:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la empresa'
        });
      }
    }
  };

  const guardarEmpresa = async () => {
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const datosEnviar = { 
        entidad: 'EMPRESA',
        ...formEmpresa,
        ...(modoEdicion && { id_empresa_pk: empresaEditando.id_empresa_pk })
      };

      if (modoEdicion) {
        // Actualizar empresa existente
        const resultado = await actualizarRegistro(empresaEditando.id_empresa_pk, 'EMPRESA', formEmpresa);
        
        if (resultado?.Consulta) {
          setEmpresas(empresas.map(emp => 
            emp.id_empresa_pk === empresaEditando.id_empresa_pk 
              ? { ...emp, ...formEmpresa }
              : emp
          ));
          mostrarMensaje('success', 'Empresa actualizada exitosamente');
        } else {
          mostrarMensaje('error', resultado?.error || 'Error al actualizar la empresa');
          return;
        }
      } else {
        // Crear nueva empresa
        const resultado = await insertar('EMPRESA', formEmpresa);
        
        if (resultado?.Consulta) {
          await traerListaEmpresas(); // Recargar la lista desde el servidor
          mostrarMensaje('success', 'Empresa creada exitosamente');
        } else {
          mostrarMensaje('error', resultado?.error || 'Error al crear la empresa');
          return;
        }
      }

      handleClose();

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
          (() => {
            if (mensaje.tipo === 'success') {
              return 'bg-green-50 border border-green-200';
            } else {
              return 'bg-red-50 border border-red-200';
            }
          })()
        }`}>
          {(() => {
            if (mensaje.tipo === 'success') {
              return <FontAwesomeIcon icon={freeSolidSvgIcons.faCheckCircle} className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />;
            } else {
              return <FontAwesomeIcon icon={freeSolidSvgIcons.faExclamationCircle} className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />;
            }
          })()}
          <div>
            <p className={`text-sm font-medium ${
              (() => {
                if (mensaje.tipo === 'success') {
                  return 'text-green-800';
                } else {
                  return 'text-red-800';
                }
              })()
            }`}>
              {(() => {
                if (mensaje.tipo === 'success') {
                  return 'Éxito';
                } else {
                  return 'Error';
                }
              })()}
            </p>
            <p className={`text-sm mt-1 ${
              (() => {
                if (mensaje.tipo === 'success') {
                  return 'text-green-700';
                } else {
                  return 'text-red-700';
                }
              })()
            }`}>
              {mensaje.texto}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">

        {/* Barra de búsqueda + botón Nuevo */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-80">
            <input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar empresas..."
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

          <button
            onClick={handleNuevaEmpresa}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <FontAwesomeIcon icon={freeSolidSvgIcons.faPlus} />
            Nueva Empresa
          </button>
        </div>

        {/* Lista de empresas existentes */}
        <div className="space-y-4 mb-6">
          {empresas.filter(empresa => 
            empresa.nombre_empresa.toLowerCase().includes(globalFilter.toLowerCase()) ||
            empresa.direccion_empresa.toLowerCase().includes(globalFilter.toLowerCase()) ||
            empresa.telefono_empresa.toLowerCase().includes(globalFilter.toLowerCase()) ||
            empresa.correo_empresa.toLowerCase().includes(globalFilter.toLowerCase())
          ).map((empresa) => (
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
                  onClick={() => handleEliminarEmpresa(empresa)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1.5 transition-colors"
                >
                  <FontAwesomeIcon icon={freeSolidSvgIcons.faTrash} className="w-3 h-3" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
          ))}
        
          {empresas.filter(empresa => 
            empresa.nombre_empresa.toLowerCase().includes(globalFilter.toLowerCase()) ||
            empresa.direccion_empresa.toLowerCase().includes(globalFilter.toLowerCase()) ||
            empresa.telefono_empresa.toLowerCase().includes(globalFilter.toLowerCase()) ||
            empresa.correo_empresa.toLowerCase().includes(globalFilter.toLowerCase())
          ).length === 0 && empresas.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              <FontAwesomeIcon icon={freeSolidSvgIcons.faSearch} className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No se encontraron empresas</p>
              <p className="text-sm">Intenta con otros términos de búsqueda</p>
            </div>
          )}
        
          {empresas.length === 0 && (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={freeSolidSvgIcons.faBuilding} className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay empresas registradas</h3>
              <p className="text-gray-500 mb-6">Crea tu primera empresa para comenzar.</p>
              <button 
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors inline-flex items-center gap-2"
                onClick={handleNuevaEmpresa}
              >
                <FontAwesomeIcon icon={freeSolidSvgIcons.faPlus} />
                Nueva Empresa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal PrimeReact */}
      <Dialog
        header={
          <div className="w-full text-center text-lg font-bold">
            {modoEdicion ? 'EDITAR EMPRESA' : 'NUEVA EMPRESA'}
          </div>
        }
        visible={mostrarFormulario}
        style={{ width: '28rem', borderRadius: '1.5rem' }}
        modal
        closable={false}
        onHide={handleClose}
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              onClick={handleClose}
              className="p-button-text p-button-secondary"
              disabled={loading}
            />
            <Button
              label={loading ? (modoEdicion ? 'Actualizando...' : 'Guardando...') : (modoEdicion ? 'Actualizar' : 'Guardar')}
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
              onClick={guardarEmpresa}
              className="p-button-success"
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
          {/* Formulario */}
          <div className="flex flex-col gap-3">
            {/* Nombre de la Empresa */}
            <span>
              <label htmlFor="nombre_empresa" className="text-xs font-semibold text-gray-700 mb-1">NOMBRE DE LA EMPRESA</label>
              <InputText
                id="nombre_empresa"
                name="nombre_empresa"
                value={formEmpresa.nombre_empresa}
                onChange={handleChangeEmpresa}
                className="w-full rounded-xl h-9 text-sm uppercase"
                placeholder="Ej: Tech Solutions SA"
              />
              {errores.nombre_empresa && <p className="text-xs text-red-600 mt-1">{errores.nombre_empresa}</p>}
            </span>

            {/* Dirección */}
            <span>
              <label htmlFor="direccion_empresa" className="text-xs font-semibold text-gray-700 mb-1">DIRECCIÓN</label>
              <InputText
                id="direccion_empresa"
                name="direccion_empresa"
                value={formEmpresa.direccion_empresa}
                onChange={handleChangeEmpresa}
                className="w-full rounded-xl h-9 text-sm uppercase"
                placeholder="Ej: Av. Principal 123"
              />
              {errores.direccion_empresa && <p className="text-xs text-red-600 mt-1">{errores.direccion_empresa}</p>}
            </span>

            {/* Teléfono */}
            <span>
              <label htmlFor="telefono_empresa" className="text-xs font-semibold text-gray-700 mb-1">TELÉFONO</label>
              <InputText
                id="telefono_empresa"
                name="telefono_empresa"
                value={formEmpresa.telefono_empresa}
                onChange={handleChangeEmpresa}
                className="w-full rounded-xl h-9 text-sm uppercase"
                placeholder="Ej: 2222-3333"
              />
              {errores.telefono_empresa && <p className="text-xs text-red-600 mt-1">{errores.telefono_empresa}</p>}
            </span>

            {/* Correo Electrónico */}
            <span>
              <label htmlFor="correo_empresa" className="text-xs font-semibold text-gray-700 mb-1">CORREO ELECTRÓNICO</label>
              <InputText
                id="correo_empresa"
                name="correo_empresa"
                value={formEmpresa.correo_empresa}
                onChange={handleChangeEmpresa}
                className="w-full rounded-xl h-9 text-sm lowercase"
                placeholder="Ej: contacto@empresa.com"
                type="email"
              />
              {errores.correo_empresa && <p className="text-xs text-red-600 mt-1">{errores.correo_empresa}</p>}
            </span>
          </div>
        </div>
      </Dialog>
    </div>
  );
}