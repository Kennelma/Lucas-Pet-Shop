import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const ModalLotesMedicamento = ({ isOpen, onClose, medicamentoSeleccionado, lotes, onEliminarLote, onEditarLote, onRecargarDatos }) => {
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  if (!isOpen || !medicamentoSeleccionado) return null;

  const lotesDelMedicamento = lotes.filter(l => l.id_producto_fk === medicamentoSeleccionado.id_producto_pk);

  const calcularEstadoLote = (lote) => {
    const hoy = new Date();
    const vencimiento = new Date(lote.fecha_vencimiento);

    if (vencimiento < hoy) {
      return { bgBadge: "bg-gray-600", texto: "CADUCADO" };
    }

    if (lote.estado_lote_nombre && lote.estado_lote_nombre !== "SIN ESTADO") {
      const estadoUpper = lote.estado_lote_nombre.toUpperCase().trim();

      if (estadoUpper === "DISPONIBLE") {
        return { bgBadge: "bg-green-500", texto: "DISPONIBLE" };
      } else if (estadoUpper === "AGOTADO") {
        return { bgBadge: "bg-red-500", texto: "AGOTADO" };
      } else if (estadoUpper === "CADUCADO" || estadoUpper === "VENCIDO") {
        return { bgBadge: "bg-gray-600", texto: "CADUCADO" };
      }
    }

    const stock = parseInt(lote.stock_lote || 0);

    if (stock === 0) {
      return { bgBadge: "bg-red-500", texto: "AGOTADO" };
    }

    return { bgBadge: "bg-green-500", texto: "DISPONIBLE" };
  };

  const lotesFiltrados = lotesDelMedicamento.filter(lote => {
    if (filtroEstado === "TODOS") return true;

    const estado = calcularEstadoLote(lote);

    if (filtroEstado === "DISPONIBLES") { return estado.texto === "DISPONIBLE"; }
    if (filtroEstado === "AGOTADOS") { return estado.texto === "AGOTADO"; }
    if (filtroEstado === "CADUCADOS") { return estado.texto === "CADUCADO"; }
    return true;
  }).sort((a, b) => b.id_lote_medicamentos_pk - a.id_lote_medicamentos_pk); // Ordenar de forma descendente por ID

  const codigoLoteTemplate = (rowData) => {
    return (
      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded-xl text-gray-600 font-bold">
        {rowData.codigo_lote}
      </span>
    );
  };

  const fechaIngresoTemplate = (rowData) => {
    return (
      <span className="text-xs text-gray-600 whitespace-nowrap uppercase">
        {new Date(rowData.fecha_ingreso).toLocaleDateString('es-HN', {
          day: '2-digit',
          month: 'short',
          year: '2-digit'
        })}
      </span>
    );
  };

  const fechaVencimientoTemplate = (rowData) => {
    return (
      <span className="text-xs text-gray-600 whitespace-nowrap uppercase">
        {new Date(rowData.fecha_vencimiento).toLocaleDateString('es-HN', {
          day: '2-digit',
          month: 'short',
          year: '2-digit'
        })}
      </span>
    );
  };

  const stockTemplate = (rowData) => {
    return (
      <span className="text-sm text-gray-600">
        {rowData.stock_lote}
      </span>
    );
  };

  const estadoTemplate = (rowData) => {
    const estilo = calcularEstadoLote(rowData);
    return (
      <span className="text-xs text-gray-600">
        {estilo.texto}
      </span>
    );
  };

  const accionesTemplate = (rowData) => {
    return (
      <div className="flex items-center gap-2 w-full justify-center">
        {/* ✅ BOTÓN EDITAR */}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white p-1.5 rounded"
          onClick={(e) => {
            e.stopPropagation();
            onEditarLote && onEditarLote(rowData);
          }}
          title="Editar"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>

        {/* BOTÓN ELIMINAR */}
        <button
          className="bg-red-500 hover:bg-red-700 text-white p-1.5 rounded"
          onClick={(e) => {
            e.stopPropagation();
            onEliminarLote && onEliminarLote(rowData);
          }}
          title="Eliminar"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>
    );
  };

  const footer = (
    <div className="flex justify-center">
      <Button
        label="Cerrar"
        icon="pi pi-times"
        className="p-button-text p-button-rounded"
        onClick={onClose}
      />
    </div>
  );

  return (
    <Dialog
      header={
        <div className="w-full text-center">
          <div className="text-base text-gray-800 ">LOTES DE {medicamentoSeleccionado?.nombre_producto?.toUpperCase()}</div>
          <div className="text-xs text-gray-600 whitespace-nowrap uppercase font-light">
            TOTAL DE STOCK: <span className="font-bold bg-gray-100 px-2 py-1 rounded-full">{lotesDelMedicamento.reduce((sum, l) => sum + parseInt(l.stock_lote || 0), 0)}</span>
          </div>
        </div>
      }
      visible={isOpen}
      style={{ width: '50rem', borderRadius: '1.5rem' }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
    >
      <div className="flex flex-col gap-3">
        <div className="mb-3">
          <div className="flex gap-1 justify-center">
            <button
              className={`px-1.5 py-1 font-medium rounded transition-all duration-200 ${
                filtroEstado === "TODOS"
                  ? "bg-gray-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={{ fontSize: '0.65rem', minWidth: '50px' }}
              onClick={() => setFiltroEstado("TODOS")}
            >
              TODOS
            </button>
            <button
              className={`px-1.5 py-1 font-medium rounded transition-all duration-200 ${
                filtroEstado === "DISPONIBLES"
                  ? "bg-gray-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={{ fontSize: '0.65rem', minWidth: '70px' }}
              onClick={() => setFiltroEstado("DISPONIBLES")}
            >
              DISPONIBLES
            </button>
            <button
              className={`px-1.5 py-1 font-medium rounded transition-all duration-200 ${
                filtroEstado === "AGOTADOS"
                  ? "bg-gray-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={{ fontSize: '0.65rem', minWidth: '65px' }}
              onClick={() => setFiltroEstado("AGOTADOS")}
            >
              AGOTADOS
            </button>
            <button
              className={`px-1.5 py-1 font-medium rounded transition-all duration-200 ${
                filtroEstado === "CADUCADOS"
                  ? "bg-gray-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={{ fontSize: '0.65rem', minWidth: '70px' }}
              onClick={() => setFiltroEstado("CADUCADOS")}
            >
              CADUCADOS
            </button>
          </div>
        </div>

        {lotesFiltrados.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-1">
              {filtroEstado === "TODOS"
                ? "No hay lotes registrados"
                : `No hay lotes ${filtroEstado.toLowerCase()}`
              }
            </h3>
            <p className="text-xs text-gray-400">
              {filtroEstado === "TODOS"
                ? "No se encontraron lotes para este medicamento"
                : `No se encontraron lotes en estado ${filtroEstado.toLowerCase()}`
              }
            </p>
          </div>
        ) : (
          <div className="border border-gray-200 overflow-hidden">
            <DataTable
              value={lotesFiltrados}
              showGridlines
              className="text-sm"
              size="small"
              selectionMode="single"
              rowClassName={(rowData) => `hover:bg-gray-50 cursor-pointer`}
            >
              <Column
                field="codigo_lote"
                header="CÓDIGO"
                body={codigoLoteTemplate}
                style={{ width: '100px' }}
                className="text-xs"
              />

              <Column
                field="fecha_ingreso"
                header="INGRESO"
                body={fechaIngresoTemplate}
                style={{ width: '75px', minWidth: '75px' }}
                className="text-xs text-center"
              />

              <Column
                field="fecha_vencimiento"
                header="VENCIM."
                body={fechaVencimientoTemplate}
                style={{ width: '75px', minWidth: '75px' }}
                className="text-xs text-center"
              />

              <Column
                field="stock_lote"
                header="STOCK"
                body={stockTemplate}
                style={{ width: '60px' }}
                className="text-xs text-center"
              />

              <Column
                header="ESTADO"
                body={estadoTemplate}
                style={{ width: '80px' }}
                className="text-xs text-center"
              />

              <Column
                header="ACCIONES"
                body={accionesTemplate}
                style={{ width: '110px' }}
                className="text-center"
              />
            </DataTable>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default ModalLotesMedicamento;