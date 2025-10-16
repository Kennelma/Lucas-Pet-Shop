import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Dialog } from 'primereact/dialog';
import dayjs from 'dayjs';

import ModalNuevoUsuario from './modal-agregar-usuarios';
import { ver } from "../../../AXIOS.SERVICES/empresa-axios";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [openNuevoUsuario, setOpenNuevoUsuario] = useState(false);

  // Función para cargar usuarios
  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const data = await ver('USUARIOS');

      const normalizados = (data || []).map(u => ({
        id: u.id_usuario_pk,
        usuario: u.usuario || '',
        email: u.email_usuario || '',
        fechaCreacion: u.fecha_creacion,
        intentosFallidos: u.intentos_fallidos ?? 0,
        bloqueadoHasta: u.bloqueado_hasta,
        idSucursal: u.id_sucursal_fk,
        nombreSucursal: u.nombre_sucursal || '',
        estado: u.nombre_estado,
      }));

      setUsuarios(normalizados);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios al inicio
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const filtroUsuarios = usuarios.filter(u => {
    const q = filtro.toLowerCase();
    return (
      u.usuario.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.nombreSucursal.toLowerCase().includes(q)
    );
  });

  const bloqueadoBody = row => row.bloqueadoHasta ? dayjs(row.bloqueadoHasta).format('YYYY-MM-DD HH:mm') : '—';
  const estadoBody = row => (row.estado === 1 ? 'Activo' : 'Inactivo');

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        {/* Barra de búsqueda */}
        <div className="flex items-center gap-3">
          <InputText
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar por usuario, email o sucursal..."
            className="w-80 text-sm"
          />
        </div>

        {/* Botón agregar usuario */}
        <button
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors flex items-center gap-2"
          onClick={() => setOpenNuevoUsuario(true)}
        >
          <FontAwesomeIcon icon={faPlus} />
          Nuevo usuario
        </button>
      </div>

      <DataTable
        value={filtroUsuarios}
        loading={loading}
        showGridlines
        paginator
        rows={10}
        rowsPerPageOptions={[10, 20, 25]}
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        tableStyle={{ minWidth: '50rem' }}
        className="mt-4"
        size="small"
        rowClassName={() => 'hover:bg-gray-50 cursor-pointer'}
        loadingIcon={() => (
          <div className="flex items-center justify-center space-x-2 py-8 text-gray-500">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
            <span>Cargando datos...</span>
          </div>
        )}
      >
        <Column field="usuario" header="Usuario" sortable className="text-sm" />
        <Column
          field="email"
          header="Email"
          sortable
          className="text-sm"
          body={(row) => (
            <span className="block max-w-[220px] truncate" title={row.email}>
              {row.email}
            </span>
          )}
        />
        <Column
          field="nombreSucursal"
          header="Sucursal"
          sortable
          className="text-sm"
          body={(row) => (
            <span className="block max-w-[220px] truncate" title={row.nombreSucursal}>
              {row.nombreSucursal}
            </span>
          )}
        />
        <Column
          field="intentosFallidos"
          header="Intentos"
          sortable
          className="text-sm"
          style={{ width: '100px' }}
        />
        <Column
          header="Bloqueado hasta"
          body={bloqueadoBody}
          sortable
          className="text-sm"
          style={{ width: '180px' }}
        />
        <Column
          header="Estado"
          body={estadoBody}
          sortable
          className="text-sm"
          style={{ width: '110px' }}
        />
        <Column
          header="Acciones"
          body={(rowData) => (
            <div className="flex items-center space-x-2 w-full">
              <button
                className="text-blue-500 hover:text-blue-700 p-2 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Editar usuario:", rowData);
                }}
              >
                <FontAwesomeIcon icon={faPenToSquare} size="lg" />
              </button>

              <button
                className="text-red-500 hover:text-red-700 p-2 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Eliminar usuario:", rowData);
                }}
              >
                <FontAwesomeIcon icon={faTrash} size="lg" />
              </button>
            </div>
          )}
          className="py-2 pr-9 pl-1 border-b text-sm"
          style={{ width: '120px' }}
        />
      </DataTable>

      {/* Modal: Registrar Usuario */}
      <Dialog
        header="Registrar Usuario"
        visible={openNuevoUsuario}
        style={{ width: '34rem', maxWidth: '95vw' }}
        modal
        draggable={false}
        onHide={() => setOpenNuevoUsuario(false)}
      >
        <ModalNuevoUsuario
          onClose={() => setOpenNuevoUsuario(false)}
          onUsuarioAgregado={async () => {
            await cargarUsuarios();
          }}
        />
      </Dialog>
    </div>
  );
}
