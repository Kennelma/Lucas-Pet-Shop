import { useState, useEffect } from "react";
import { verProductos, insertarProducto, actualizarProducto } from "../../../AXIOS.SERVICES/products-axios";

export const useMedicamentos = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [kardexData, setKardexData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarDatos();
  }, []);

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 3000);
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      
      // ====== PASO 1: Obtener datos del backend ======
      const productos = await verProductos('MEDICAMENTOS');
      
      // ====== VERIFICACIÓN DE CADA PRODUCTO ======
      if (Array.isArray(productos)) {
        productos.forEach((item, index) => {
        });
      }
      
      // ====== PASO 2: Normalizar datos SIN FILTROS ======
      const medicamentosNormalizados = (productos || []).map((item, index) => {
        const normalizado = {
          id_producto_pk: item.id_producto_pk,
          nombre_producto: item.nombre_producto,
          precio_producto: parseFloat(item.precio_producto || 0),
          sku: item.sku || `MED-${(item.presentacion_medicamento || 'XXX').substring(0, 3).toUpperCase()}-${String(item.id_producto_pk).padStart(3, '0')}`,
          stock: parseInt(item.stock || 0),
          stock_minimo: parseInt(item.stock_minimo || 5),
          activo: item.activo === 1 || item.activo === "1" || item.activo === true,
          presentacion_medicamento: item.presentacion_medicamento || "Sin presentación",
          tipo_medicamento: item.tipo_medicamento || "Sin tipo",
          cantidad_contenido: parseInt(item.cantidad_contenido || 0),
          unidad_medida: item.unidad_medida || ""
        };
        
        return normalizado;
      });

      // ====== PASO 3: Cargar lotes ======
      const lotesData = await verProductos('LOTES');
      
      const lotesNormalizados = (lotesData || []).map((item) => ({
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
      }));

      // ====== PASO 4: Cargar Kardex ======
      const kardexResponse = await verProductos('KARDEX');

      // ====== PASO 5: Actualizar estado ======
      setMedicamentos(medicamentosNormalizados);
      setLotes(lotesNormalizados);
      setKardexData(kardexResponse || []);
      
    } catch (error) {
      mostrarMensaje("❌ Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const calcularStockTotal = (idProducto) => {
    const lotesDelProducto = lotes.filter(l => l.id_producto_fk === idProducto);
    const total = lotesDelProducto.reduce((sum, l) => sum + parseInt(l.stock_lote || 0), 0);
    return total;
  };

  const guardarMedicamento = async (formData, medicamentoEditando) => {
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
        return true;
      } else {
        mostrarMensaje("❌ Error: " + (resultado.error || "Desconocido"));
        return false;
      }
    } else {
      const datosCompletos = {
        tipo_producto: 'MEDICAMENTOS',
        nombre_producto: formData.nombre_producto.toUpperCase().trim(),
        precio_producto: parseFloat(formData.precio_producto),
        stock: parseInt(formData.stock_lote),
        stock_minimo: parseInt(formData.stock_minimo),
        presentacion_medicamento: formData.presentacion.toUpperCase().trim(),
        tipo_medicamento: formData.tipo.toUpperCase().trim(),
        cantidad_contenido: parseInt(formData.cantidad_contenido) || 0,
        unidad_medida: formData.unidad_medida ? formData.unidad_medida.toUpperCase().trim() : '',
        codigo_lote: formData.codigo_lote.toUpperCase().trim(),
        fecha_vencimiento: formData.fecha_vencimiento,
        stock_lote: parseInt(formData.stock_lote)
      };

      const resultado = await insertarProducto(datosCompletos);
      if (resultado.Consulta) {
        mostrarMensaje("✅ Medicamento y primer lote creados");
        await cargarDatos();
        return true;
      } else {
        mostrarMensaje("❌ Error: " + (resultado.error || "Desconocido"));
        return false;
      }
    }
  };

  const guardarLote = async (formData) => {
    if (!formData.codigo_lote || !formData.fecha_vencimiento || !formData.stock_lote) {
      mostrarMensaje("⚠️ Complete todos los campos del lote");
      return false;
    }

    if (!formData.id_producto_fk) {
      mostrarMensaje("❌ Error: No se identificó el medicamento");
      return false;
    }

    const stockLote = parseInt(formData.stock_lote);
    if (stockLote < 5) {
      mostrarMensaje("⚠️ El stock del lote debe ser mínimo 5 unidades");
      return false;
    }

    const datosLote = {
      tipo_producto: 'LOTES',
      id_producto: formData.id_producto_fk,
      codigo_lote: formData.codigo_lote.toUpperCase().trim(),
      fecha_ingreso: formData.fecha_ingreso,
      fecha_vencimiento: formData.fecha_vencimiento,
      stock_lote: stockLote
    };

    const resultado = await insertarProducto(datosLote);
    if (resultado.Consulta) {
      mostrarMensaje("✅ Lote agregado exitosamente");
      await cargarDatos();
      return true;
    } else {
      mostrarMensaje("❌ Error: " + (resultado.error || "Desconocido"));
      return false;
    }
  };

  const guardarMovimiento = (formData) => {
    if (!formData.cantidad || !formData.id_lote_fk) {
      mostrarMensaje("⚠️ Complete los campos del movimiento");
      return false;
    }

    const lote = lotes.find(l => l.id_lote_medicamentos_pk === formData.id_lote_fk);
    const cantidad = parseInt(formData.cantidad);

    if (formData.tipo_movimiento === "SALIDA" && lote.stock_lote < cantidad) {
      mostrarMensaje("⚠️ Stock insuficiente en el lote");
      return false;
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
    return true;
  };

  return {
    medicamentos,
    lotes,
    kardexData,
    loading,
    mensaje,
    calcularStockTotal,
    guardarMedicamento,
    guardarLote,
    guardarMovimiento
  };
};