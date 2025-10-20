import React, { useState, useEffect } from "react";
import { verProductos, insertarProducto, actualizarProducto, eliminarProducto } from "../../../AXIOS.SERVICES/products-axios";
import MedicamentosBajoStock from "./MedicamentosBajoStock";

const ModalMedicamento = ({ isOpen, onClose, onSave, medicamentoEditando }) => {
  const [paso, setPaso] = useState(1);
  const [formData, setFormData] = useState({
    nombre_producto: "",
    precio_producto: "",
    stock_minimo: 5,
    presentacion: "",
    tipo: "",
    cantidad_contenido: "",
    unidad_medida: "",
    activo: true,
    codigo_lote: "",
    fecha_vencimiento: "",
    stock_lote: ""
  });

  useEffect(() => {
    if (isOpen) {
      if (medicamentoEditando) {
        setFormData({
          nombre_producto: medicamentoEditando.nombre_producto,
          precio_producto: medicamentoEditando.precio_producto,
          stock_minimo: medicamentoEditando.stock_minimo || 5,
          presentacion: medicamentoEditando.presentacion_medicamento,
          tipo: medicamentoEditando.tipo_medicamento,
          cantidad_contenido: medicamentoEditando.cantidad_contenido,
          unidad_medida: medicamentoEditando.unidad_medida,
          activo: medicamentoEditando.activo,
          codigo_lote: "",
          fecha_vencimiento: "",
          stock_lote: ""
        });
        setPaso(1);
      } else {
        setFormData({
          nombre_producto: "",
          precio_producto: "",
          stock_minimo: 5,
          presentacion: "",
          tipo: "",
          cantidad_contenido: "",
          unidad_medida: "",
          activo: true,
          codigo_lote: "",
          fecha_vencimiento: "",
          stock_lote: ""
        });
        setPaso(1);
      }
    }
  }, [isOpen, medicamentoEditando]);

  if (!isOpen) return null;

  const validarPaso1 = () => {
    if (!formData.nombre_producto.trim()) return "⚠️ Ingrese el nombre del producto";
    if (!formData.precio_producto || parseFloat(formData.precio_producto) <= 0) return "⚠️ Ingrese un precio válido";
    if (!formData.presentacion.trim()) return "⚠️ Ingrese la presentación";
    if (!formData.tipo.trim()) return "⚠️ Ingrese el tipo de medicamento";
    if (parseInt(formData.stock_minimo) < 5) return "⚠️ El stock mínimo debe ser al menos 5";
    return null;
  };

  const validarPaso2 = () => {
    if (!formData.codigo_lote.trim()) return "⚠️ Ingrese el código de lote";
    if (!formData.fecha_vencimiento) return "⚠️ Ingrese la fecha de vencimiento";
    if (!formData.stock_lote || parseInt(formData.stock_lote) <= 0) return "⚠️ Ingrese una cantidad válida";
    return null;
  };

  const handleSiguiente = () => {
    const error = validarPaso1();
    if (error) {
      alert(error);
      return;
    }
    setPaso(2);
  };

  const handleGuardar = () => {
    if (medicamentoEditando) {
      const error = validarPaso1();
      if (error) {
        alert(error);
        return;
      }
    } else {
      const error = validarPaso2();
      if (error) {
        alert(error);
        return;
      }
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {medicamentoEditando ? "Editar Medicamento" : "Nuevo Medicamento"}
          </h2>
          {!medicamentoEditando && (
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                paso === 1 ? 'bg-purple-600 text-white' : 'bg-green-500 text-white'
              }`}>
                1
              </div>
              <div className="w-8 h-1 bg-gray-300"></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                paso === 2 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
            </div>
          )}
        </div>

        {paso === 1 && (
          <div className="space-y-3">
            <div className="bg-purple-50 p-3 rounded text-sm mb-3 border border-purple-200">
              <div className="font-bold text-purple-700 mb-1">📋 Paso 1: Información del Medicamento</div>
              <div className="text-xs text-purple-600">Complete los datos básicos del producto</div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Nombre del Producto *</label>
              <input
                value={formData.nombre_producto}
                onChange={(e) => setFormData({...formData, nombre_producto: e.target.value})}
                placeholder="Ej: ANTIPULGAS CANINO"
                className="w-full px-3 py-2 border rounded focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-semibold mb-1">Precio (L.) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_producto}
                  onChange={(e) => setFormData({...formData, precio_producto: e.target.value})}
                  placeholder="250.50"
                  className="w-full px-3 py-2 border rounded focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Stock Mínimo *</label>
                <input
                  type="number"
                  min="5"
                  value={formData.stock_minimo}
                  onChange={(e) => {
                    const valor = e.target.value;
                    setFormData({...formData, stock_minimo: valor});
                  }}
                  placeholder="5"
                  className="w-full px-3 py-2 border rounded focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
            <span className="text-xs text-gray-500">* Stock mínimo: 5 unidades</span>

            <div>
              <label className="block text-sm font-semibold mb-1">Presentación *</label>
              <input
                value={formData.presentacion}
                onChange={(e) => setFormData({...formData, presentacion: e.target.value})}
                placeholder="Ej: TABLETAS, JARABE, INYECTABLE"
                className="w-full px-3 py-2 border rounded focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Tipo *</label>
              <input
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                placeholder="Ej: ANTIPARASITARIO, ANTIBIÓTICO"
                className="w-full px-3 py-2 border rounded focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-semibold mb-1">Cantidad</label>
                <input
                  type="number"
                  value={formData.cantidad_contenido}
                  onChange={(e) => setFormData({...formData, cantidad_contenido: e.target.value})}
                  placeholder="10"
                  className="w-full px-3 py-2 border rounded focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Unidad</label>
                <input
                  value={formData.unidad_medida}
                  onChange={(e) => setFormData({...formData, unidad_medida: e.target.value})}
                  placeholder="mg, ml, g"
                  className="w-full px-3 py-2 border rounded focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                id="activo"
                className="w-4 h-4"
              />
              <label htmlFor="activo" className="text-sm font-semibold">Producto Activo</label>
            </div>
          </div>
        )}

        {paso === 2 && !medicamentoEditando && (
          <div className="space-y-3">
            <div className="bg-green-50 p-3 rounded text-sm mb-3 border border-green-200">
              <div className="font-bold text-green-700 mb-2">✅ Medicamento configurado</div>
              <div className="text-xs bg-white p-2 rounded border border-green-100">
                <strong>{formData.nombre_producto}</strong> - {formData.presentacion}
              </div>
              <div className="text-xs text-green-600 mt-2">📦 Paso 2: Ingrese el primer lote</div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Código de Lote *</label>
              <input
                value={formData.codigo_lote}
                onChange={(e) => setFormData({...formData, codigo_lote: e.target.value})}
                placeholder="LOT-2024-001"
                className="w-full px-3 py-2 border rounded focus:border-purple-500 focus:outline-none"
                autoFocus
              />
              <span className="text-xs text-gray-500">Formato sugerido: LOT-AÑO-NÚMERO</span>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Fecha Vencimiento *</label>
              <input
                type="date"
                value={formData.fecha_vencimiento}
                onChange={(e) => setFormData({...formData, fecha_vencimiento: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border rounded focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Cantidad Inicial del Lote *</label>
              <input
                type="number"
                min="1"
                value={formData.stock_lote}
                onChange={(e) => setFormData({...formData, stock_lote: e.target.value})}
                placeholder="100"
                className="w-full px-3 py-2 border rounded focus:border-purple-500 focus:outline-none"
              />
              <span className="text-xs text-gray-500">Cantidad de unidades en este lote</span>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-6">
          {paso === 2 && !medicamentoEditando && (
            <button
              onClick={() => setPaso(1)}
              className="px-4 py-2 bg-gray-300 rounded font-semibold hover:bg-gray-400 transition"
            >
              ← Anterior
            </button>
          )}
          
          {paso === 1 && !medicamentoEditando ? (
            <button
              onClick={handleSiguiente}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700 transition"
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={handleGuardar}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700 transition"
            >
              💾 Guardar
            </button>
          )}
          
          <button
            onClick={() => {
              onClose();
              setPaso(1);
            }}
            className="px-4 py-2 bg-gray-400 text-white rounded font-semibold hover:bg-gray-500 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

const ModalLote = ({ isOpen, onClose, onSave, medicamentoSeleccionado }) => {
  const [formData, setFormData] = useState({
    codigo_lote: "",
    fecha_ingreso: new Date().toISOString().split('T')[0],
    fecha_vencimiento: "",
    stock_lote: "",
    id_producto_fk: null
  });

  useEffect(() => {
    if (medicamentoSeleccionado && isOpen) {
      console.log("🔍 Medicamento seleccionado para nuevo lote:", {
        id_producto_pk: medicamentoSeleccionado.id_producto_pk,
        nombre: medicamentoSeleccionado.nombre_producto
      });
      
      setFormData(prev => ({
        ...prev,
        codigo_lote: "",
        fecha_vencimiento: "",
        stock_lote: "",
        id_producto_fk: medicamentoSeleccionado.id_producto_pk
      }));
    }
  }, [medicamentoSeleccionado, isOpen]);

  const handleGuardar = () => {
    if (!formData.codigo_lote.trim()) {
      alert("⚠️ Ingrese el código de lote");
      return;
    }
    if (!formData.fecha_vencimiento) {
      alert("⚠️ Ingrese la fecha de vencimiento");
      return;
    }
    if (!formData.stock_lote || parseInt(formData.stock_lote) <= 0) {
      alert("⚠️ Ingrese una cantidad válida");
      return;
    }
    
    console.log("✅ Datos del lote a guardar:", formData);
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">📦 Nuevo Lote</h2>
        {medicamentoSeleccionado && (
          <div className="bg-blue-50 p-3 rounded mb-4 border border-blue-200">
            <div className="font-bold text-blue-800">{medicamentoSeleccionado.nombre_producto}</div>
            <div className="text-xs text-blue-600">{medicamentoSeleccionado.presentacion_medicamento}</div>
            <div className="text-xs text-gray-500 mt-1">ID Producto: {medicamentoSeleccionado.id_producto_pk}</div>
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Código de Lote *</label>
            <input
              value={formData.codigo_lote}
              onChange={(e) => setFormData({...formData, codigo_lote: e.target.value})}
              placeholder="LOT-2024-002"
              className="w-full px-3 py-2 border rounded focus:border-purple-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Fecha Ingreso</label>
            <input
              type="date"
              value={formData.fecha_ingreso}
              onChange={(e) => setFormData({...formData, fecha_ingreso: e.target.value})}
              className="w-full px-3 py-2 border rounded focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Fecha Vencimiento *</label>
            <input
              type="date"
              value={formData.fecha_vencimiento}
              onChange={(e) => setFormData({...formData, fecha_vencimiento: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border rounded focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Cantidad Inicial *</label>
            <input
              type="number"
              min="1"
              value={formData.stock_lote}
              onChange={(e) => setFormData({...formData, stock_lote: e.target.value})}
              placeholder="100"
              className="w-full px-3 py-2 border rounded focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleGuardar}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700 transition"
          >
            💾 Guardar Lote
          </button>
          <button
            onClick={() => {
              onClose();
              setFormData({
                codigo_lote: "",
                fecha_ingreso: new Date().toISOString().split('T')[0],
                fecha_vencimiento: "",
                stock_lote: "",
                id_producto_fk: null
              });
            }}
            className="flex-1 px-4 py-2 bg-gray-300 rounded font-semibold hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

const ModalMovimiento = ({ isOpen, onClose, onSave, loteSeleccionado }) => {
  const [formData, setFormData] = useState({
    tipo_movimiento: "ENTRADA",
    cantidad: "",
    motivo: "",
    id_lote_fk: null
  });

  useEffect(() => {
    if (loteSeleccionado) {
      setFormData(prev => ({
        ...prev,
        id_lote_fk: loteSeleccionado
      }));
    }
  }, [loteSeleccionado]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Registrar Movimiento</h2>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Tipo de Movimiento</label>
            <select
              value={formData.tipo_movimiento}
              onChange={(e) => setFormData({...formData, tipo_movimiento: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
              <option value="AJUSTE">Ajuste</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Cantidad *</label>
            <input
              type="number"
              value={formData.cantidad}
              onChange={(e) => setFormData({...formData, cantidad: e.target.value})}
              placeholder="10"
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Motivo</label>
            <textarea
              value={formData.motivo}
              onChange={(e) => setFormData({...formData, motivo: e.target.value})}
              placeholder="Venta, donación, ajuste de inventario..."
              className="w-full px-3 py-2 border rounded"
              rows="3"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => onSave(formData)}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700"
          >
            Guardar
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 rounded font-semibold hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

const ModalLotesMedicamento = ({ isOpen, onClose, medicamentoSeleccionado, lotes }) => {
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  if (!isOpen || !medicamentoSeleccionado) return null;

  const lotesDelMedicamento = lotes.filter(l => l.id_producto_fk === medicamentoSeleccionado.id_producto_pk);

  const calcularEstadoLote = (lote) => {
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
    const hoy = new Date();
    const vencimiento = new Date(lote.fecha_vencimiento);
    
    if (stock === 0) {
      return { bgBadge: "bg-red-500", texto: "AGOTADO" };
    }
    
    if (vencimiento < hoy) {
      return { bgBadge: "bg-gray-600", texto: "CADUCADO" };
    }
    
    return { bgBadge: "bg-green-500", texto: "DISPONIBLE" };
  };

  const lotesFiltrados = lotesDelMedicamento.filter(lote => {
    if (filtroEstado === "TODOS") return true;
    
    const estado = calcularEstadoLote(lote);
    
    if (filtroEstado === "VIGENTES") {
      return estado.texto === "DISPONIBLE";
    }
    if (filtroEstado === "VENCIDOS") {
      return estado.texto === "CADUCADO" || estado.texto === "AGOTADO";
    }
    return true;
  });

  const contarEstados = (tipo) => {
    return lotesDelMedicamento.filter(l => {
      const estado = calcularEstadoLote(l);
      if (tipo === "DISPONIBLES") return estado.texto === "DISPONIBLE";
      if (tipo === "VENCIDOS") return estado.texto === "CADUCADO" || estado.texto === "AGOTADO";
      return false;
    }).length;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[90vw] max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-purple-700">
              📦 LOTES DE {medicamentoSeleccionado.nombre_producto}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{medicamentoSeleccionado.presentacion_medicamento}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-3xl hover:text-red-600 transition-colors font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFiltroEstado("TODOS")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filtroEstado === "TODOS"
                ? "bg-purple-600 text-white shadow-lg scale-105"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📋 TODOS ({lotesDelMedicamento.length})
          </button>
          <button
            onClick={() => setFiltroEstado("VIGENTES")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filtroEstado === "VIGENTES"
                ? "bg-green-600 text-white shadow-lg scale-105"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            ✅ DISPONIBLES ({contarEstados("DISPONIBLES")})
          </button>
          <button
            onClick={() => setFiltroEstado("VENCIDOS")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filtroEstado === "VENCIDOS"
                ? "bg-red-600 text-white shadow-lg scale-105"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            ⚠️ AGOTADOS/CADUCADOS ({contarEstados("VENCIDOS")})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="p-3 text-left">Código Lote</th>
                <th className="p-3 text-left">Fecha Ingreso</th>
                <th className="p-3 text-left">Fecha Vencimiento</th>
                <th className="p-3 text-right">Stock</th>
                <th className="p-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {lotesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    {filtroEstado === "TODOS" 
                      ? "📦 No hay lotes registrados para este medicamento"
                      : `📦 No hay lotes ${filtroEstado.toLowerCase()}`
                    }
                  </td>
                </tr>
              ) : (
                lotesFiltrados.map((lote, idx) => {
                  const estilo = calcularEstadoLote(lote);
                  return (
                    <tr key={lote.id_lote_medicamentos_pk} className={`border-b hover:bg-purple-50 transition-colors ${idx % 2 === 0 ? 'bg-gray-50' : ''}`}>
                      <td className="p-3">
                        <div className="font-mono font-bold text-purple-700">
                          {lote.codigo_lote}
                        </div>
                      </td>
                      <td className="p-3">{new Date(lote.fecha_ingreso).toLocaleDateString('es-HN')}</td>
                      <td className="p-3 font-semibold">{new Date(lote.fecha_vencimiento).toLocaleDateString('es-HN')}</td>
                      <td className="p-3 text-right">
                        <span className="font-bold text-lg text-purple-700">{lote.stock_lote}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${estilo.bgBadge}`}>
                            {estilo.texto}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {lotesFiltrados.length > 0 && (
              <tfoot className="bg-purple-100 font-bold">
                <tr>
                  <td colSpan="3" className="p-3 text-right text-purple-700">
                    TOTAL STOCK {filtroEstado !== "TODOS" ? `(${filtroEstado})` : ""}:
                  </td>
                  <td className="p-3 text-right bg-purple-200">
                    <span className="text-xl text-purple-800">
                      {lotesFiltrados.reduce((sum, l) => sum + parseInt(l.stock_lote || 0), 0)}
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-gray-400 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

const Medicamentos = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [kardexData, setKardexData] = useState([]);
  const [vistaActual, setVistaActual] = useState("medicamentos");
  const [busqueda, setBusqueda] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoteVisible, setModalLoteVisible] = useState(false);
  const [modalMovVisible, setModalMovVisible] = useState(false);
  const [modalLotesVisible, setModalLotesVisible] = useState(false);
  const [medicamentoEditando, setMedicamentoEditando] = useState(null);
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState(null);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      console.log("🔄 INICIANDO CARGA DE DATOS...");
      
      const productos = await verProductos('MEDICAMENTOS');
      console.log("📦 Productos recibidos:", productos);
      
      const medicamentosNormalizados = (productos || []).map((item) => {
        const sku = item.sku || `MED-${(item.presentacion_medicamento || 'XXX').substring(0, 3).toUpperCase()}-${String(item.id_producto_pk).padStart(3, '0')}`;
        
        return {
          id_producto_pk: item.id_producto_pk,
          nombre_producto: item.nombre_producto,
          precio_producto: parseFloat(item.precio_producto || 0),
          sku: sku,
          stock: parseInt(item.stock || 0),
          stock_minimo: parseInt(item.stock_minimo || 5),
          activo: item.activo === 1 || item.activo === "1" || item.activo === true,
          presentacion_medicamento: item.presentacion_medicamento || "Sin presentación",
          tipo_medicamento: item.tipo_medicamento || "Sin tipo",
          cantidad_contenido: parseInt(item.cantidad_contenido || 0),
          unidad_medida: item.unidad_medida || ""
        };
      });

      setMedicamentos(medicamentosNormalizados);
      console.log("✅ Medicamentos normalizados:", medicamentosNormalizados);

      const lotesData = await verProductos('LOTES');
      console.log("📦 Lotes recibidos del backend:", lotesData);
      
      const lotesNormalizados = (lotesData || []).map((item) => {
        console.log("🔍 Procesando lote:", {
          id_lote: item.id_lote_medicamentos_pk,
          codigo: item.codigo_lote,
          id_producto_fk_original: item.id_producto_fk,
          stock: item.stock_lote
        });
        
        return {
          id_lote_medicamentos_pk: item.id_lote_medicamentos_pk,
          codigo_lote: item.codigo_lote || "",
          fecha_ingreso: item.fecha_ingreso,
          fecha_vencimiento: item.fecha_vencimiento,
          stock_lote: parseInt(item.stock_lote || 0),
          estado_lote_fk: item.estado_lote_fk,
          estado_lote_nombre: item.estado_lote_nombre,
          id_medicamento_fk: item.id_medicamento_pk,
          id_producto_fk: item.id_producto_fk,
          nombre_medicamento: item.nombre_producto
        };
      });

      setLotes(lotesNormalizados);
      console.log("✅ Lotes normalizados:", lotesNormalizados);

      const kardexResponse = await verProductos('KARDEX');
      console.log("📊 Kardex recibido del backend:", kardexResponse);
      setKardexData(kardexResponse || []);
      
      mostrarMensaje(`✅ Cargados: ${medicamentosNormalizados.length} medicamentos, ${lotesNormalizados.length} lotes`);
      
    } catch (error) {
      console.error("❌ ERROR:", error);
      mostrarMensaje("❌ Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 3000);
  };

  const calcularEstadoLote = (fechaVencimiento) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diferenciaDias = Math.floor((vencimiento - hoy) / (1000 * 60 * 60 * 24));

    if (diferenciaDias < 0) return { estado: "VENCIDO", clase: "text-red-600", dias: diferenciaDias };
    if (diferenciaDias <= 30) return { estado: "POR VENCER", clase: "text-orange-600", dias: diferenciaDias };
    if (diferenciaDias <= 90) return { estado: "PRÓXIMO A VENCER", clase: "text-yellow-600", dias: diferenciaDias };
    return { estado: "VIGENTE", clase: "text-green-600", dias: diferenciaDias };
  };

  const medicamentosFiltrados = medicamentos.filter((m) =>
    m.nombre_producto.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.presentacion_medicamento.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.tipo_medicamento.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.sku.toLowerCase().includes(busqueda.toLowerCase())
  );

  const kardexFiltrado = kardexData.filter(mov => {
    return mov.nombre_producto.toLowerCase().includes(busqueda.toLowerCase()) ||
           (mov.codigo_lote && mov.codigo_lote.toLowerCase().includes(busqueda.toLowerCase())) ||
           mov.tipo_movimiento.toLowerCase().includes(busqueda.toLowerCase()) ||
           mov.origen_movimiento.toLowerCase().includes(busqueda.toLowerCase());
  });

  const calcularStockTotal = (idProducto) => {
    console.log(`\n🔢 ═══════════════════════════════════════════════`);
    console.log(`📊 CALCULANDO STOCK PARA PRODUCTO ID: ${idProducto}`);
    console.log(`═══════════════════════════════════════════════`);
    console.log(`📦 Total de lotes en memoria: ${lotes.length}`);
    
    const lotesDelProducto = lotes.filter(l => {
      const coincide = l.id_producto_fk === idProducto;
      if (coincide) {
        console.log(`   ✅ Lote encontrado:`, {
          codigo: l.codigo_lote,
          id_lote: l.id_lote_medicamentos_pk,
          id_producto_fk: l.id_producto_fk,
          stock_lote: l.stock_lote
        });
      }
      return coincide;
    });
    
    console.log(`\n📊 Resumen:`);
    console.log(`   • Lotes encontrados: ${lotesDelProducto.length}`);
    
    const stockTotal = lotesDelProducto.reduce((sum, l) => {
      const stock = parseInt(l.stock_lote) || 0;
      console.log(`   • Sumando lote ${l.codigo_lote}: ${stock}`);
      return sum + stock;
    }, 0);
    
    console.log(`   • STOCK TOTAL: ${stockTotal}`);
    console.log(`═══════════════════════════════════════════════\n`);
    
    return stockTotal;
  };

  const guardarMedicamento = async (formData) => {
    console.log("\n🎯 ═══════════════════════════════════════════════");
    console.log("📝 GUARDANDO MEDICAMENTO");
    console.log("═══════════════════════════════════════════════");
    console.log("📋 Datos del formulario:", JSON.stringify(formData, null, 2));
    console.log("═══════════════════════════════════════════════\n");
    
    if (medicamentoEditando) {
      const datosActualizar = {
        id_producto: medicamentoEditando.id_producto_pk,
        tipo_producto: 'MEDICAMENTOS',
        nombre_producto: formData.nombre_producto.toUpperCase(),
        precio_producto: parseFloat(formData.precio_producto),
        stock_minimo: parseInt(formData.stock_minimo),
        presentacion_medicamento: formData.presentacion.toUpperCase(),
        tipo_medicamento: formData.tipo.toUpperCase(),
        cantidad_contenido: parseInt(formData.cantidad_contenido) || 0,
        unidad_medida: formData.unidad_medida.toUpperCase(),
        activo: formData.activo ? 1 : 0
      };

      const resultado = await actualizarProducto(datosActualizar);
      
      if (resultado.Consulta) {
        mostrarMensaje("✅ Medicamento actualizado");
        await cargarDatos();
        setModalVisible(false);
        setMedicamentoEditando(null);
      } else {
        mostrarMensaje("❌ Error: " + (resultado.error || "Desconocido"));
      }
      
    } else {
      const stockLoteNumerico = parseInt(formData.stock_lote);
      
      console.log("🔍 Validación de stock_lote:");
      console.log(`   • formData.stock_lote (original): "${formData.stock_lote}"`);
      console.log(`   • parseInt(formData.stock_lote): ${stockLoteNumerico}`);
      
      const datosCompletos = {
        tipo_producto: 'MEDICAMENTOS',
        nombre_producto: formData.nombre_producto.toUpperCase().trim(),
        precio_producto: parseFloat(formData.precio_producto),
        stock: stockLoteNumerico,
        stock_minimo: parseInt(formData.stock_minimo),
        presentacion_medicamento: formData.presentacion.toUpperCase().trim(),
        tipo_medicamento: formData.tipo.toUpperCase().trim(),
        cantidad_contenido: parseInt(formData.cantidad_contenido) || 0,
        unidad_medida: formData.unidad_medida ? formData.unidad_medida.toUpperCase().trim() : '',
        codigo_lote: formData.codigo_lote.toUpperCase().trim(),
        fecha_vencimiento: formData.fecha_vencimiento,
        stock_lote: stockLoteNumerico
      };

      console.log("\n📤 ═══════════════════════════════════════════════");
      console.log("📤 DATOS ENVIADOS AL BACKEND:");
      console.log("═══════════════════════════════════════════════");
      console.log(JSON.stringify(datosCompletos, null, 2));
      console.log("═══════════════════════════════════════════════\n");
      
      const resultado = await insertarProducto(datosCompletos);
      
      console.log("📥 ═══════════════════════════════════════════════");
      console.log("📥 RESPUESTA DEL BACKEND:");
      console.log("═══════════════════════════════════════════════");
      console.log(JSON.stringify(resultado, null, 2));
      console.log("═══════════════════════════════════════════════\n");
      
      if (resultado.Consulta) {
        mostrarMensaje("✅ Medicamento y primer lote creados");
        setModalVisible(false);
        await cargarDatos();
      } else {
        mostrarMensaje("❌ Error: " + (resultado.error || "Desconocido"));
      }
    }
  };

  const guardarLote = async (formData) => {
    console.log("\n🎯 ═══════════════════════════════════════════════");
    console.log("📦 GUARDANDO NUEVO LOTE");
    console.log("═══════════════════════════════════════════════");
    console.log("📋 Datos del formulario:", JSON.stringify(formData, null, 2));
    
    if (!formData.codigo_lote || !formData.fecha_vencimiento || !formData.stock_lote) {
      mostrarMensaje("⚠️ Complete todos los campos del lote");
      return;
    }

    if (!formData.id_producto_fk) {
      console.error("❌ ERROR: No hay id_producto_fk en formData");
      mostrarMensaje("❌ Error: No se identificó el medicamento");
      return;
    }

    try {
      const stockLote = parseInt(formData.stock_lote);
      if (stockLote <= 0) {
        mostrarMensaje("⚠️ El stock debe ser mayor a 0");
        return;
      }

      const datosLote = {
        tipo_producto: 'LOTES',
        id_producto: formData.id_producto_fk,
        codigo_lote: formData.codigo_lote.toUpperCase().trim(),
        fecha_ingreso: formData.fecha_ingreso,
        fecha_vencimiento: formData.fecha_vencimiento,
        stock_lote: stockLote
      };

      console.log("📤 Datos enviados al backend:", JSON.stringify(datosLote, null, 2));

      const resultado = await insertarProducto(datosLote);
      
      console.log("📥 Respuesta del backend:", JSON.stringify(resultado, null, 2));

      if (resultado.Consulta) {
        mostrarMensaje("✅ Lote agregado exitosamente");
        
        setModalLoteVisible(false);
        setMedicamentoSeleccionado(null);
        
        await cargarDatos();
        
        console.log("✅ Lote guardado y datos recargados");
      } else {
        mostrarMensaje("❌ Error: " + (resultado.error || "Desconocido"));
        console.error("❌ Error del backend:", resultado.error);
      }

    } catch (error) {
      console.error("❌ Error al procesar el lote:", error);
      mostrarMensaje("❌ Error al procesar el lote: " + error.message);
    }
    
    console.log("═══════════════════════════════════════════════\n");
  };

  const guardarMovimiento = (formData) => {
    if (!formData.cantidad || !formData.id_lote_fk) {
      mostrarMensaje("⚠️ Complete los campos del movimiento");
      return;
    }

    const lote = lotes.find(l => l.id_lote_medicamentos_pk === formData.id_lote_fk);
    const cantidad = parseInt(formData.cantidad);

    if (formData.tipo_movimiento === "SALIDA" && lote.stock_lote < cantidad) {
      mostrarMensaje("⚠️ Stock insuficiente en el lote");
      return;
    }

    setLotes(prev => prev.map(l => 
      l.id_lote_medicamentos_pk === formData.id_lote_fk
        ? { 
            ...l, 
            stock_lote: formData.tipo_movimiento === "ENTRADA" 
              ? l.stock_lote + cantidad 
              : l.stock_lote - cantidad 
          }
        : l
    ));

    const movimiento = {
      id_movimiento_pk: Date.now(),
      tipo_fk: formData.tipo_movimiento === "ENTRADA" ? 1 : 2,
      fecha: new Date().toISOString().split('T')[0],
      tipo_movimiento: formData.tipo_movimiento,
      usuario: "admin",
      id_medicamento_fk: lote.id_medicamento_fk,
      id_lote_fk: formData.id_lote_fk,
      cantidad: cantidad,
      motivo: formData.motivo
    };

    setMovimientos(prev => [...prev, movimiento]);
    mostrarMensaje(`✅ Movimiento registrado`);
    setModalMovVisible(false);
    setLoteSeleccionado(null);
  };

  const calcularKardex = (idProducto) => {
    const movsMed = movimientos
      .filter(m => m.id_medicamento_fk === idProducto)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    let saldo = 0;
    return movsMed.map(mov => {
      const entrada = mov.tipo_movimiento === "ENTRADA" ? mov.cantidad : 0;
      const salida = mov.tipo_movimiento === "SALIDA" ? mov.cantidad : 0;
      saldo += entrada - salida;

      const lote = lotes.find(l => l.id_lote_medicamentos_pk === mov.id_lote_fk);

      return {
        ...mov,
        entrada,
        salida,
        saldo,
        lote_codigo: lote?.codigo_lote || "N/A"
      };
    });
  };

  const renderKardex = () => {
    if (loading) {
      return (
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Cargando kardex...</p>
        </div>
      );
    }

    if (kardexFiltrado.length === 0) {
      return (
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          <p className="text-gray-600">📊 No se encontraron movimientos en el kardex</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="p-3 text-left">ID Movimiento</th>
              <th className="p-3 text-left">Medicamento</th>
              <th className="p-3 text-left">Código Lote</th>
              <th className="p-3 text-right">Cantidad</th>
              <th className="p-3 text-right">Costo Unitario</th>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Origen</th>
              <th className="p-3 text-left">Usuario</th>
            </tr>
          </thead>
          <tbody>
            {kardexFiltrado.map((mov, idx) => (
              <tr key={mov.id_movimiento_pk} className="border-b hover:bg-gray-50">
                <td className="p-3 font-mono text-xs">{mov.id_movimiento_pk}</td>
                <td className="p-3">
                  <div className="font-semibold text-sm">{mov.nombre_producto}</div>
                </td>
                <td className="p-3 font-mono text-xs">{mov.codigo_lote || "N/A"}</td>
                <td className="p-3 text-right font-bold">{mov.cantidad}</td>
                <td className="p-3 text-right">L. {parseFloat(mov.costo_unitario || 0).toFixed(2)}</td>
                <td className="p-3">{new Date(mov.fecha_movimiento).toLocaleString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    mov.tipo_movimiento === 'ENTRADA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {mov.tipo_movimiento}
                  </span>
                </td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                    {mov.origen_movimiento}
                  </span>
                </td>
                <td className="p-3 text-xs">{mov.usuario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMedicamentos = () => {
    if (loading) {
      return (
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Cargando medicamentos...</p>
        </div>
      );
    }

    if (medicamentosFiltrados.length === 0) {
      return (
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          <p className="text-gray-600 text-lg">📦 No se encontraron medicamentos</p>
          <p className="text-sm text-gray-500 mt-2">Haz clic en "+ NUEVO MEDICAMENTO" para agregar uno</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {medicamentosFiltrados.map((med) => {
          const stockTotal = calcularStockTotal(med.id_producto_pk);
          const lotesDelMed = lotes.filter(l => l.id_producto_fk === med.id_producto_pk);
          
          return (
            <div 
              key={med.id_producto_pk} 
              className={`rounded-lg shadow-md p-4 pb-12 relative min-h-[150px] ${
                med.activo 
                  ? 'bg-white border-2 border-purple-200' 
                  : 'bg-gray-100 opacity-70 border-2 border-gray-300'
              }`}
            >
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  med.activo 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {med.activo ? '✓ ACTIVO' : '✗ INACTIVO'}
                </span>
              </div>

              <div className="text-center mb-4 mt-6">
                <div className="font-bold text-base mb-2 text-gray-800">
                  {med.nombre_producto}
                </div>
                
                <div className="text-xs font-mono text-purple-600 mb-2 bg-purple-50 py-1 px-2 rounded">
                  {med.sku}
                </div>

                <div className="text-xs text-gray-600 mb-1">
                  📋 {med.presentacion_medicamento}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  🏷️ {med.tipo_medicamento}
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  📦 {med.cantidad_contenido} {med.unidad_medida}
                </div>

                <div className="text-lg font-bold text-purple-700 mb-2">
                  L. {med.precio_producto.toFixed(2)}
                </div>

                <div className={`text-xl font-bold mb-1 ${
                  stockTotal < med.stock_minimo 
                    ? 'text-red-600' 
                    : stockTotal < med.stock_minimo * 2 
                      ? 'text-orange-600' 
                      : 'text-green-600'
                }`}>
                  Stock: {stockTotal}
                </div>
                
                <div className="text-xs text-gray-500">
                  Mínimo: {med.stock_minimo}
                </div>

                <div className="text-xs text-blue-600 mt-2 bg-blue-50 py-1 px-2 rounded inline-block">
                  {lotesDelMed.length} lote(s) disponible(s)
                </div>

                {stockTotal < med.stock_minimo && (
                  <div className="mt-2 text-xs text-red-600 font-bold bg-red-50 py-1 px-2 rounded">
                    ⚠️ STOCK BAJO
                  </div>
                )}
              </div>

              <div className="absolute bottom-2 left-2 flex gap-1">
                <button
                  onClick={() => {
                    setMedicamentoEditando(med);
                    setModalVisible(true);
                  }}
                  className="p-1 hover:scale-110 transition-transform"
                  title="Editar"
                >
                  ⚙️
                </button>
                <button
                  onClick={() => {
                    setMedicamentoSeleccionado(med);
                    setModalLoteVisible(true);
                  }}
                  className="p-1 hover:scale-110 transition-transform"
                  title="Agregar Lote"
                >
                  ➕
                </button>
                <button
                  onClick={() => {
                    setMedicamentoSeleccionado(med);
                    setModalLotesVisible(true);
                  }}
                  className="p-1 hover:scale-110 transition-transform"
                  title="Ver Lotes"
                >
                  📦
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-6 shadow-sm border border-gray-200 mb-3">
        <div className="flex justify-center items-center">
          <h2 className="text-2xl font-black text-center uppercase text-gray-800">
            GESTIÓN DE MEDICAMENTOS
          </h2>
        </div>
      </div>

      <MedicamentosBajoStock medicamentos={medicamentos} />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="🔍 Buscar medicamentos, lotes..."
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-3 top-2 text-xl hover:text-red-600 transition-colors"
            >
              ×
            </button>
          )}
        </div>
        
        <button
          onClick={() => setModalVisible(true)}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-sm whitespace-nowrap"
        >
          + NUEVO MEDICAMENTO
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setVistaActual("medicamentos")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            vistaActual === "medicamentos" 
              ? "bg-purple-600 text-white shadow-sm" 
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          💊 Medicamentos
        </button>
        <button
          onClick={() => setVistaActual("kardex")}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            vistaActual === "kardex" 
              ? "bg-purple-600 text-white shadow-sm" 
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          📊 Kardex
        </button>
      </div>

      {vistaActual === "kardex" && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 font-semibold">
            📊 Vista de Kardex - Historial completo de movimientos de inventario
          </p>
        </div>
      )}

      {vistaActual === "medicamentos" && renderMedicamentos()}
      {vistaActual === "kardex" && renderKardex()}

      <ModalMedicamento 
        isOpen={modalVisible} 
        onClose={() => {
          setModalVisible(false);
          setMedicamentoEditando(null);
        }}
        onSave={guardarMedicamento}
        medicamentoEditando={medicamentoEditando}
      />
      
      <ModalLote 
        isOpen={modalLoteVisible}
        onClose={() => {
          setModalLoteVisible(false);
          setMedicamentoSeleccionado(null);
        }}
        onSave={guardarLote}
        medicamentoSeleccionado={medicamentoSeleccionado}
      />
      
      <ModalMovimiento 
        isOpen={modalMovVisible}
        onClose={() => {
          setModalMovVisible(false);
          setLoteSeleccionado(null);
        }}
        onSave={guardarMovimiento}
        loteSeleccionado={loteSeleccionado}
      />
      
      <ModalLotesMedicamento
        isOpen={modalLotesVisible}
        onClose={() => {
          setModalLotesVisible(false);
          setMedicamentoSeleccionado(null);
        }}
        medicamentoSeleccionado={medicamentoSeleccionado}
        lotes={lotes}
      />

      {mensaje && (
        <div className="fixed bottom-5 right-5 px-4 py-2 bg-purple-600 text-white rounded font-bold shadow-lg animate-pulse z-50">
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default Medicamentos;