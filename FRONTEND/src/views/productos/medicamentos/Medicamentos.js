import React, { useState, useEffect } from "react";

// MODAL MEDICAMENTO - Componente separado
const ModalMedicamento = ({ isOpen, onClose, onSave, medicamentoEditando }) => {
  const [formData, setFormData] = useState({
    presentacion: "",
    tipo: "",
    cantidad_contenido: "",
    unidad_medida: "",
    activo: true
  });

  useEffect(() => {
    if (medicamentoEditando) {
      setFormData({
        presentacion: medicamentoEditando.presentacion_medicamento,
        tipo: medicamentoEditando.tipo_medicamento,
        cantidad_contenido: medicamentoEditando.cantidad_contenido,
        unidad_medida: medicamentoEditando.unidad_medida,
        activo: medicamentoEditando.activo
      });
    } else {
      setFormData({
        presentacion: "",
        tipo: "",
        cantidad_contenido: "",
        unidad_medida: "",
        activo: true
      });
    }
  }, [medicamentoEditando]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {medicamentoEditando ? "Editar Medicamento" : "Nuevo Medicamento"}
        </h2>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Presentación *</label>
            <input
              value={formData.presentacion}
              onChange={(e) => setFormData({...formData, presentacion: e.target.value})}
              placeholder="Ej: PARACETAMOL 500MG"
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Tipo *</label>
            <input
              value={formData.tipo}
              onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              placeholder="Ej: ANALGÉSICO"
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-semibold mb-1">Cantidad</label>
              <input
                type="number"
                value={formData.cantidad_contenido}
                onChange={(e) => setFormData({...formData, cantidad_contenido: e.target.value})}
                placeholder="20"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Unidad</label>
              <input
                value={formData.unidad_medida}
                onChange={(e) => setFormData({...formData, unidad_medida: e.target.value})}
                placeholder="TABLETAS"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.activo}
              onChange={(e) => setFormData({...formData, activo: e.target.checked})}
              id="activo"
            />
            <label htmlFor="activo" className="text-sm">Activo</label>
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

// MODAL LOTE - Componente separado
const ModalLote = ({ isOpen, onClose, onSave, medicamentoSeleccionado }) => {
  const [formData, setFormData] = useState({
    codigo_lote: "",
    fecha_ingreso: new Date().toISOString().split('T')[0],
    fecha_vencimiento: "",
    stock_lote: "",
    id_medicamento_fk: null
  });

  useEffect(() => {
    if (medicamentoSeleccionado) {
      setFormData(prev => ({
        ...prev,
        id_medicamento_fk: medicamentoSeleccionado.id_medicamento_pk
      }));
    }
  }, [medicamentoSeleccionado]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Nuevo Lote</h2>
        {medicamentoSeleccionado && (
          <div className="bg-blue-50 p-2 rounded mb-4 text-sm">
            <strong>Medicamento:</strong> {medicamentoSeleccionado.presentacion_medicamento}
          </div>
        )}
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1">Código de Lote *</label>
            <input
              value={formData.codigo_lote}
              onChange={(e) => setFormData({...formData, codigo_lote: e.target.value})}
              placeholder="LOT-2024-001"
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Fecha Ingreso</label>
            <input
              type="date"
              value={formData.fecha_ingreso}
              onChange={(e) => setFormData({...formData, fecha_ingreso: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Fecha Vencimiento *</label>
            <input
              type="date"
              value={formData.fecha_vencimiento}
              onChange={(e) => setFormData({...formData, fecha_vencimiento: e.target.value})}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Cantidad Inicial *</label>
            <input
              type="number"
              value={formData.stock_lote}
              onChange={(e) => setFormData({...formData, stock_lote: e.target.value})}
              placeholder="100"
              className="w-full px-3 py-2 border rounded"
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

// MODAL MOVIMIENTO - Componente separado
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

const Medicamentos = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [vistaActual, setVistaActual] = useState("medicamentos");
  const [busqueda, setBusqueda] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoteVisible, setModalLoteVisible] = useState(false);
  const [modalMovVisible, setModalMovVisible] = useState(false);
  const [modalKardexVisible, setModalKardexVisible] = useState(false);
  const [medicamentoEditando, setMedicamentoEditando] = useState(null);
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState(null);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Simular carga inicial
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    // Datos de ejemplo
    const medicamentosEjemplo = [
      {
        id_medicamento_pk: 1,
        presentacion_medicamento: "PARACETAMOL 500MG",
        tipo_medicamento: "ANALGÉSICO",
        cantidad_contenido: 20,
        unidad_medida: "TABLETAS",
        id_producto_fk: 101,
        activo: true
      },
      {
        id_medicamento_pk: 2,
        presentacion_medicamento: "AMOXICILINA 500MG",
        tipo_medicamento: "ANTIBIÓTICO",
        cantidad_contenido: 10,
        unidad_medida: "CÁPSULAS",
        id_producto_fk: 102,
        activo: true
      },
      {
        id_medicamento_pk: 3,
        presentacion_medicamento: "IBUPROFENO 400MG",
        tipo_medicamento: "ANTIINFLAMATORIO",
        cantidad_contenido: 30,
        unidad_medida: "TABLETAS",
        id_producto_fk: 103,
        activo: true
      }
    ];

    const lotesEjemplo = [
      {
        id_lote_medicamentos_pk: 1,
        codigo_lote: "LOT-2024-001",
        fecha_ingreso: "2024-01-15",
        fecha_vencimiento: "2025-12-31",
        stock_lote: 150,
        estado_lote_fk: 1,
        id_medicamento_fk: 1
      },
      {
        id_lote_medicamentos_pk: 2,
        codigo_lote: "LOT-2024-002",
        fecha_ingreso: "2024-02-20",
        fecha_vencimiento: "2025-10-15",
        stock_lote: 80,
        estado_lote_fk: 1,
        id_medicamento_fk: 2
      },
      {
        id_lote_medicamentos_pk: 3,
        codigo_lote: "LOT-2023-045",
        fecha_ingreso: "2023-11-10",
        fecha_vencimiento: "2025-11-30",
        stock_lote: 200,
        estado_lote_fk: 1,
        id_medicamento_fk: 3
      },
      {
        id_lote_medicamentos_pk: 4,
        codigo_lote: "LOT-2024-088",
        fecha_ingreso: "2024-10-01",
        fecha_vencimiento: "2026-06-30",
        stock_lote: 100,
        estado_lote_fk: 1,
        id_medicamento_fk: 1
      }
    ];

    const movimientosEjemplo = [
      {
        id_movimiento_pk: 1,
        tipo_fk: 1,
        costo_unitario: 2.50,
        fecha: "2024-10-01",
        tipo_movimiento: "ENTRADA",
        origen_fk: 1,
        id_origen_fk: 100,
        usuario: "admin",
        id_medicamento_fk: 1,
        id_lote_fk: 1,
        cantidad: 50
      },
      {
        id_movimiento_pk: 2,
        tipo_fk: 2,
        costo_unitario: 2.50,
        fecha: "2024-10-05",
        tipo_movimiento: "SALIDA",
        origen_fk: 2,
        id_origen_fk: 200,
        usuario: "admin",
        id_medicamento_fk: 1,
        id_lote_fk: 1,
        cantidad: 20
      }
    ];

    setMedicamentos(medicamentosEjemplo);
    setLotes(lotesEjemplo);
    setMovimientos(movimientosEjemplo);
  };

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 3000);
  };

  // Calcular estado del lote
  const calcularEstadoLote = (fechaVencimiento) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diferenciaDias = Math.floor((vencimiento - hoy) / (1000 * 60 * 60 * 24));

    if (diferenciaDias < 0) return { estado: "VENCIDO", clase: "text-red-600", dias: diferenciaDias };
    if (diferenciaDias <= 30) return { estado: "POR VENCER", clase: "text-orange-600", dias: diferenciaDias };
    if (diferenciaDias <= 90) return { estado: "PRÓXIMO A VENCER", clase: "text-yellow-600", dias: diferenciaDias };
    return { estado: "VIGENTE", clase: "text-green-600", dias: diferenciaDias };
  };

  // Filtrar medicamentos
  const medicamentosFiltrados = medicamentos.filter((m) =>
    m.presentacion_medicamento.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.tipo_medicamento.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Filtrar lotes según estado
  const lotesFiltrados = lotes.filter(lote => {
    const estado = calcularEstadoLote(lote.fecha_vencimiento);
    
    if (filtroEstado === "todos") return true;
    if (filtroEstado === "activos") return estado.estado === "VIGENTE";
    if (filtroEstado === "vencidos") return estado.estado === "VENCIDO";
    if (filtroEstado === "por-vencer") return estado.estado === "POR VENCER" || estado.estado === "PRÓXIMO A VENCER";
    
    return true;
  }).filter(lote => {
    const medicamento = medicamentos.find(m => m.id_medicamento_pk === lote.id_medicamento_fk);
    if (!medicamento) return false;
    
    return medicamento.presentacion_medicamento.toLowerCase().includes(busqueda.toLowerCase()) ||
           lote.codigo_lote.toLowerCase().includes(busqueda.toLowerCase());
  });

  // Calcular stock total por medicamento
  const calcularStockTotal = (idMedicamento) => {
    return lotes
      .filter(l => l.id_medicamento_fk === idMedicamento)
      .reduce((sum, l) => sum + l.stock_lote, 0);
  };

  // Guardar medicamento
  const guardarMedicamento = (formData) => {
    if (!formData.presentacion || !formData.tipo) {
      mostrarMensaje("Complete los campos requeridos");
      return;
    }

    if (medicamentoEditando) {
      setMedicamentos(prev => prev.map(item => 
        item.id_medicamento_pk === medicamentoEditando.id_medicamento_pk 
          ? { 
              ...item, 
              presentacion_medicamento: formData.presentacion.toUpperCase(),
              tipo_medicamento: formData.tipo.toUpperCase(),
              cantidad_contenido: parseInt(formData.cantidad_contenido) || 0,
              unidad_medida: formData.unidad_medida.toUpperCase(),
              activo: formData.activo
            } 
          : item
      ));
      mostrarMensaje("Medicamento actualizado");
    } else {
      const nuevoMedicamento = {
        id_medicamento_pk: Date.now(),
        presentacion_medicamento: formData.presentacion.toUpperCase(),
        tipo_medicamento: formData.tipo.toUpperCase(),
        cantidad_contenido: parseInt(formData.cantidad_contenido) || 0,
        unidad_medida: formData.unidad_medida.toUpperCase(),
        id_producto_fk: Date.now() + 1000,
        activo: formData.activo
      };
      setMedicamentos(prev => [...prev, nuevoMedicamento]);
      mostrarMensaje("Medicamento agregado");
    }

    setModalVisible(false);
    setMedicamentoEditando(null);
  };

  // Guardar lote
  const guardarLote = (formData) => {
    if (!formData.codigo_lote || !formData.fecha_vencimiento || !formData.stock_lote) {
      mostrarMensaje("Complete todos los campos del lote");
      return;
    }

    const nuevoLote = {
      id_lote_medicamentos_pk: Date.now(),
      codigo_lote: formData.codigo_lote.toUpperCase(),
      fecha_ingreso: formData.fecha_ingreso,
      fecha_vencimiento: formData.fecha_vencimiento,
      stock_lote: parseInt(formData.stock_lote),
      estado_lote_fk: 1,
      id_medicamento_fk: formData.id_medicamento_fk
    };

    setLotes(prev => [...prev, nuevoLote]);
    
    // Registrar movimiento de entrada
    const movimiento = {
      id_movimiento_pk: Date.now(),
      tipo_fk: 1,
      costo_unitario: 0,
      fecha: formData.fecha_ingreso,
      tipo_movimiento: "ENTRADA",
      origen_fk: 1,
      id_origen_fk: 0,
      usuario: "admin",
      id_medicamento_fk: nuevoLote.id_medicamento_fk,
      id_lote_fk: nuevoLote.id_lote_medicamentos_pk,
      cantidad: parseInt(formData.stock_lote)
    };
    setMovimientos(prev => [...prev, movimiento]);

    mostrarMensaje("Lote agregado correctamente");
    setModalLoteVisible(false);
    setMedicamentoSeleccionado(null);
  };

  // Guardar movimiento
  const guardarMovimiento = (formData) => {
    if (!formData.cantidad || !formData.id_lote_fk) {
      mostrarMensaje("Complete los campos del movimiento");
      return;
    }

    const lote = lotes.find(l => l.id_lote_medicamentos_pk === formData.id_lote_fk);
    const cantidad = parseInt(formData.cantidad);

    if (formData.tipo_movimiento === "SALIDA" && lote.stock_lote < cantidad) {
      mostrarMensaje("Stock insuficiente en el lote");
      return;
    }

    // Actualizar stock del lote
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

    // Registrar movimiento
    const movimiento = {
      id_movimiento_pk: Date.now(),
      tipo_fk: formData.tipo_movimiento === "ENTRADA" ? 1 : 2,
      costo_unitario: 0,
      fecha: new Date().toISOString().split('T')[0],
      tipo_movimiento: formData.tipo_movimiento,
      origen_fk: 1,
      id_origen_fk: 0,
      usuario: "admin",
      id_medicamento_fk: lote.id_medicamento_fk,
      id_lote_fk: formData.id_lote_fk,
      cantidad: cantidad,
      motivo: formData.motivo
    };

    setMovimientos(prev => [...prev, movimiento]);
    mostrarMensaje(`Movimiento de ${formData.tipo_movimiento.toLowerCase()} registrado`);
    setModalMovVisible(false);
    setLoteSeleccionado(null);
  };

  // Calcular kardex para un medicamento
  const calcularKardex = (idMedicamento) => {
    const movsMed = movimientos
      .filter(m => m.id_medicamento_fk === idMedicamento)
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

  // VISTA DE MEDICAMENTOS
  const renderMedicamentos = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {medicamentosFiltrados.map((med) => {
          const stockTotal = calcularStockTotal(med.id_medicamento_pk);
          const lotesDelMed = lotes.filter(l => l.id_medicamento_fk === med.id_medicamento_pk);
          
          return (
            <div key={med.id_medicamento_pk} className={`rounded-lg p-4 relative ${med.activo ? 'bg-blue-50' : 'bg-gray-200 opacity-60'}`}>
              <div className="bg-white rounded-lg p-4 mb-3 h-24 flex items-center justify-center">
                <span className="text-5xl">💊</span>
              </div>
              
              <div className="text-center mb-8">
                <div className="font-bold text-sm mb-1">{med.presentacion_medicamento}</div>
                <div className="text-xs text-gray-600 mb-2">{med.tipo_medicamento}</div>
                <div className="text-xs text-gray-500 mb-2">
                  {med.cantidad_contenido} {med.unidad_medida}
                </div>
                <div className={`text-lg font-bold ${stockTotal < 50 ? 'text-red-600' : 'text-green-600'}`}>
                  Stock Total: {stockTotal}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {lotesDelMed.length} lote(s) activo(s)
                </div>
                <div className={`text-sm mt-1 ${med.activo ? 'text-green-600' : 'text-gray-400'}`}>
                  ● {med.activo ? 'Activo' : 'Inactivo'}
                </div>
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
                  📦
                </button>
                <button
                  onClick={() => {
                    setMedicamentoSeleccionado(med);
                    setModalKardexVisible(true);
                  }}
                  className="p-1 hover:scale-110 transition-transform"
                  title="Ver Kardex"
                >
                  📊
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // VISTA DE LOTES
  const renderLotes = () => (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFiltroEstado("todos")}
          className={`px-3 py-1 rounded ${filtroEstado === "todos" ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltroEstado("activos")}
          className={`px-3 py-1 rounded ${filtroEstado === "activos" ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
        >
          Vigentes
        </button>
        <button
          onClick={() => setFiltroEstado("por-vencer")}
          className={`px-3 py-1 rounded ${filtroEstado === "por-vencer" ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}
        >
          Por Vencer
        </button>
        <button
          onClick={() => setFiltroEstado("vencidos")}
          className={`px-3 py-1 rounded ${filtroEstado === "vencidos" ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
        >
          Vencidos
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="p-3 text-left">Código Lote</th>
              <th className="p-3 text-left">Medicamento</th>
              <th className="p-3 text-left">Fecha Ingreso</th>
              <th className="p-3 text-left">Vencimiento</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lotesFiltrados.map(lote => {
              const medicamento = medicamentos.find(m => m.id_medicamento_pk === lote.id_medicamento_fk);
              const estado = calcularEstadoLote(lote.fecha_vencimiento);
              
              return (
                <tr key={lote.id_lote_medicamentos_pk} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-sm">{lote.codigo_lote}</td>
                  <td className="p-3">{medicamento?.presentacion_medicamento || "N/A"}</td>
                  <td className="p-3">{new Date(lote.fecha_ingreso).toLocaleDateString()}</td>
                  <td className="p-3">{new Date(lote.fecha_vencimiento).toLocaleDateString()}</td>
                  <td className="p-3 font-bold">{lote.stock_lote}</td>
                  <td className={`p-3 font-semibold ${estado.clase}`}>
                    {estado.estado}
                    {estado.dias >= 0 && ` (${estado.dias}d)`}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => {
                        setLoteSeleccionado(lote.id_lote_medicamentos_pk);
                        setModalMovVisible(true);
                      }}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Movimiento
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // MODAL KARDEX
  const ModalKardex = () => {
    if (!medicamentoSeleccionado) return null;
    
    const kardex = calcularKardex(medicamentoSeleccionado.id_medicamento_pk);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-[90vw] max-w-5xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">Kardex de Inventario</h2>
              <p className="text-sm text-gray-600">{medicamentoSeleccionado.presentacion_medicamento}</p>
            </div>
            <button
              onClick={() => {
                setModalKardexVisible(false);
                setMedicamentoSeleccionado(null);
              }}
              className="text-2xl hover:text-red-600"
            >
              ×
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-purple-600 text-white">
                <tr>
                  <th className="p-2 text-left">Fecha</th>
                  <th className="p-2 text-left">Lote</th>
                  <th className="p-2 text-left">Tipo</th>
                  <th className="p-2 text-left">Motivo</th>
                  <th className="p-2 text-right">Entrada</th>
                  <th className="p-2 text-right">Salida</th>
                  <th className="p-2 text-right bg-purple-700">Saldo</th>
                  <th className="p-2 text-left">Usuario</th>
                </tr>
              </thead>
              <tbody>
                {kardex.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-4 text-center text-gray-500">
                      No hay movimientos registrados
                    </td>
                  </tr>
                ) : (
                  kardex.map((mov, idx) => (
                    <tr key={mov.id_movimiento_pk} className={`border-b ${idx % 2 === 0 ? 'bg-gray-50' : ''}`}>
                      <td className="p-2">{new Date(mov.fecha).toLocaleDateString()}</td>
                      <td className="p-2 font-mono text-xs">{mov.lote_codigo}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          mov.tipo_movimiento === 'ENTRADA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {mov.tipo_movimiento}
                        </span>
                      </td>
                      <td className="p-2 text-xs">{mov.motivo || '-'}</td>
                      <td className="p-2 text-right text-green-600 font-semibold">
                        {mov.entrada > 0 ? mov.entrada : '-'}
                      </td>
                      <td className="p-2 text-right text-red-600 font-semibold">
                        {mov.salida > 0 ? mov.salida : '-'}
                      </td>
                      <td className="p-2 text-right font-bold bg-purple-50">
                        {mov.saldo}
                      </td>
                      <td className="p-2 text-xs">{mov.usuario}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {kardex.length > 0 && (
                <tfoot className="bg-purple-100 font-bold">
                  <tr>
                    <td colSpan="4" className="p-2 text-right">TOTALES:</td>
                    <td className="p-2 text-right text-green-700">
                      {kardex.reduce((sum, m) => sum + m.entrada, 0)}
                    </td>
                    <td className="p-2 text-right text-red-700">
                      {kardex.reduce((sum, m) => sum + m.salida, 0)}
                    </td>
                    <td className="p-2 text-right bg-purple-200">
                      {kardex[kardex.length - 1]?.saldo || 0}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setModalKardexVisible(false);
                setMedicamentoSeleccionado(null);
              }}
              className="px-4 py-2 bg-gray-300 rounded font-semibold hover:bg-gray-400"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-5 bg-gray-50">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-bold text-gray-800">GESTIÓN DE MEDICAMENTOS</h2>
        <button
          onClick={() => setModalVisible(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700"
        >
          + NUEVO MEDICAMENTO
        </button>
      </div>

      {/* NAVEGACIÓN */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setVistaActual("medicamentos")}
          className={`px-4 py-2 rounded font-semibold ${
            vistaActual === "medicamentos" 
              ? "bg-purple-600 text-white" 
              : "bg-white text-gray-700 border"
          }`}
        >
          💊 Medicamentos
        </button>
        <button
          onClick={() => setVistaActual("lotes")}
          className={`px-4 py-2 rounded font-semibold ${
            vistaActual === "lotes" 
              ? "bg-purple-600 text-white" 
              : "bg-white text-gray-700 border"
          }`}
        >
          📦 Lotes
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="mb-6 relative w-96">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar..."
          className="w-full px-4 py-2 border rounded-full"
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda("")}
            className="absolute right-3 top-2 text-xl hover:text-red-600"
          >
            ×
          </button>
        )}
      </div>

      {/* CONTENIDO */}
      {vistaActual === "medicamentos" && renderMedicamentos()}
      {vistaActual === "lotes" && renderLotes()}

      {/* MODALES */}
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
      
      {modalKardexVisible && <ModalKardex />}

      {/* MENSAJE */}
      {mensaje && (
        <div className="fixed bottom-5 right-5 px-4 py-2 bg-purple-600 text-white rounded font-bold shadow-lg animate-pulse">
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default Medicamentos;