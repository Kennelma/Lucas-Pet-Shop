import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as freeSolidSvgIcons from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { insertar, ver, actualizarRegistro } from '../../../AXIOS.SERVICES/empresa-axios';
import ModalAgregarEmpresa, { BotonAgregarEmpresa } from './modal-agregar-empresa';
import { BotonEditarEmpresa } from './modal-editar-empresa';
import { BotonEliminarEmpresa } from './modal-eliminar-empresa';

export default function InformacionEmpresa() {
  const [loading, setLoading] = useState(false);
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos de empresas'
      });
    }
  };

  const handleChangeEmpresa = (e) => {
    const copia = { ...formEmpresa };
    const { name, value } = e.target;

    // Convertir a mayúsculas excepto el campo de correo electrónico
    if (name === 'correo_empresa') {
      copia[name] = value.toLowerCase(); // Correo en minúsculas
    } else {
      copia[name] = value.toUpperCase(); // Otros campos en mayúsculas
    }

    setFormEmpresa(copia);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formEmpresa.nombre_empresa.trim()) {
      nuevosErrores.nombre_empresa = 'El nombre de la empresa es obligatorio';
    } else {
      // Verificar si ya existe una empresa con el mismo nombre
      const nombreExiste = empresas.some(empresa => {
        // En modo edición, excluir la empresa actual de la validación
        if (modoEdicion && empresa.id_empresa_pk === empresaEditando.id_empresa_pk) {
          return false;
        }
        return empresa.nombre_empresa.toLowerCase() === formEmpresa.nombre_empresa.toLowerCase();
      });

      if (nombreExiste) {
        nuevosErrores.nombre_empresa = 'Ya existe una empresa con este nombre';
      }
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

    // Verificar si ya existe una empresa con el mismo correo (solo si el campo no está vacío)
    if (formEmpresa.correo_empresa.trim()) {
      const correoExiste = empresas.some(empresa => {
        // En modo edición, excluir la empresa actual de la validación
        if (modoEdicion && empresa.id_empresa_pk === empresaEditando.id_empresa_pk) {
          return false;
        }
        return empresa.correo_empresa.toLowerCase() === formEmpresa.correo_empresa.toLowerCase();
      });

      if (correoExiste && !nuevosErrores.correo_empresa) {
        nuevosErrores.correo_empresa = 'Ya existe una empresa con este correo electrónico';
      }
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
          Swal.fire({
            icon: 'success',
            title: 'Actualizada',
            text: 'La empresa ha sido actualizada exitosamente',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: resultado?.error || 'Error al actualizar la empresa'
          });
          return;
        }
      } else {
        // Crear nueva empresa
        const resultado = await insertar('EMPRESA', formEmpresa);

        if (resultado?.Consulta) {
          await traerListaEmpresas(); // Recargar la lista desde el servidor
          Swal.fire({
            icon: 'success',
            title: 'Creada',
            text: 'La empresa ha sido creada exitosamente',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: resultado?.error || 'Error al crear la empresa'
          });
          return;
        }
      }

      handleClose();

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error al guardar los datos'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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

          <BotonAgregarEmpresa
            onClick={handleNuevaEmpresa}
            loading={loading}
          />
        </div>

        {/* Lista de empresas existentes */}
        <div className="space-y-4 mb-6">
          {empresas.filter(empresa =>
            empresa.nombre_empresa.toLowerCase().includes(globalFilter.toLowerCase()) ||
            empresa.direccion_empresa.toLowerCase().includes(globalFilter.toLowerCase()) ||
            empresa.telefono_empresa.toLowerCase().includes(globalFilter.toLowerCase()) ||
            empresa.correo_empresa.toLowerCase().includes(globalFilter.toLowerCase())
          ).map((empresa) => (
          <div key={empresa.id_empresa_pk} className="bg-blue-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">{empresa.nombre_empresa}</h4>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2 col-span-4">
                    <FontAwesomeIcon icon={freeSolidSvgIcons.faMapMarkerAlt} className="w-3 h-3 flex-shrink-0" />
                    <span className="break-words">{empresa.direccion_empresa}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-3">
                    <FontAwesomeIcon icon={freeSolidSvgIcons.faPhone} className="w-3 h-3 flex-shrink-0" />
                    <span>{empresa.telefono_empresa}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-4">
                    <FontAwesomeIcon icon={freeSolidSvgIcons.faEnvelope} className="w-3 h-3 flex-shrink-0" />
                    <span className="break-words">{empresa.correo_empresa}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end col-span-1">
                    <BotonEditarEmpresa
                      empresa={empresa}
                      onEdit={handleEditarEmpresa}
                    />
                    <BotonEliminarEmpresa
                      empresa={empresa}
                      onReload={traerListaEmpresas}
                    />
                  </div>
                </div>
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
              <BotonAgregarEmpresa
                onClick={handleNuevaEmpresa}
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal Modular */}
      <ModalAgregarEmpresa
        visible={mostrarFormulario}
        onHide={handleClose}
        formData={formEmpresa}
        onChange={handleChangeEmpresa}
        onSave={guardarEmpresa}
        loading={loading}
        editando={modoEdicion}
        errores={errores}
      />
    </div>
  );
}