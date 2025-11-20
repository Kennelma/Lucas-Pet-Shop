import { CONFIG, TIPO_MOVIMIENTO, INDICADORES_DIARIO, UMBRAL_DIAS_VS_MESES, limpiarNombreMes, formatearFecha, Logger } from './pdfTema';

// 🟠 REGLAS DE NEGOCIO ENCAPSULADAS
function esReporteDiario(mesFiltrado, datosTabla) {
  if (!mesFiltrado) return false;
  
  // Validar por indicadores en el nombre
  const tieneIndicadorDiario = INDICADORES_DIARIO.some(ind => mesFiltrado.includes(ind));
  if (tieneIndicadorDiario) return true;
  
  // Validar por cantidad de filas (más de 12 = diario)
  return datosTabla.length > UMBRAL_DIAS_VS_MESES;
}

function determinarTipoReporte(mesFiltrado, datosTabla) {
  if (!mesFiltrado) return CONFIG.reportTypes.ANUAL;
  return esReporteDiario(mesFiltrado, datosTabla) 
    ? CONFIG.reportTypes.DIARIO 
    : CONFIG.reportTypes.MENSUAL;
}

function esIngreso(detalle) {
  return detalle.tipo_movimiento === TIPO_MOVIMIENTO.INGRESO;
}

function esGasto(detalle) {
  return detalle.tipo_movimiento === TIPO_MOVIMIENTO.GASTO;
}

function esResumen(detalle) {
  return detalle.tipo_movimiento === TIPO_MOVIMIENTO.RESUMEN;
}

// Función para procesar movimiento con validación de monto
function procesarMovimiento(item, tipo) {
  const monto = Number(item.monto);
  if (isNaN(monto)) {
    Logger.warn(`Monto inválido en ${tipo}`, { item });
    return { ...item, fechaFormateada: formatearFecha(item.fecha), monto: 0 };
  }
  return {
    ...item,
    fechaFormateada: formatearFecha(item.fecha),
    monto
  };
}

// Función para procesar y preparar todos los datos del PDF
export const procesarDatosPDF = (datosTabla, totalIngresos, totalGastos, gananciaTotal, anio, mesFiltrado = null, detallesCompletos = null) => {
  // 🔴 VALIDACIÓN DE DATOS
  if (!datosTabla || !Array.isArray(datosTabla)) {
    throw new Error('datosTabla debe ser un array válido');
  }
  if (typeof totalIngresos !== 'number' || typeof totalGastos !== 'number' || typeof gananciaTotal !== 'number') {
    throw new Error('Los totales deben ser números válidos');
  }
  if (detallesCompletos && !Array.isArray(detallesCompletos)) {
    throw new Error('detallesCompletos debe ser un array o null');
  }

  const esDiario = esReporteDiario(mesFiltrado, datosTabla);
  const tipoReporte = determinarTipoReporte(mesFiltrado, datosTabla);

  // Preparar datos del encabezado
  const datosEncabezado = {
    esDiario,
    anio,
    mesFiltrado,
    fechaGeneracion: new Date().toLocaleDateString(CONFIG.locale, CONFIG.dateFormat)
  };

  // Preparar datos de tarjetas de resumen
  const datosTarjetas = {
    totalIngresos,
    totalGastos,
    gananciaTotal,
    isPositive: gananciaTotal >= 0
  };

  // Preparar datos de la tabla
  const nombreMesLimpio = mesFiltrado ? limpiarNombreMes(mesFiltrado) : '';
  const datosTablaResumen = {
    datosTabla,
    esDiario,
    mesFiltrado,
    tituloTabla: mesFiltrado 
      ? (esDiario ? `DETALLE POR DÍAS - ${nombreMesLimpio}` : `DETALLE DE ${mesFiltrado}`)
      : 'DETALLE ANUAL',
    headerTexto: esDiario ? 'Fecha' : 'Periodo'
  };

  // Procesar detalles completos
  let datosDetalles = null;
  if (detallesCompletos && detallesCompletos.length > 0) {
    const ingresos = detallesCompletos.filter(esIngreso);
    const gastos = detallesCompletos.filter(esGasto);
    const resumen = detallesCompletos.filter(esResumen);

    datosDetalles = {
      ingresos: ingresos.map(item => procesarMovimiento(item, 'ingreso')),
      gastos: gastos.map(item => procesarMovimiento(item, 'gasto')),
      resumen: resumen.map(item => {
        const monto = Number(item.monto);
        if (isNaN(monto)) {
          Logger.warn('Monto inválido en resumen', { item });
          return { ...item, monto: 0 };
        }
        return { ...item, monto };
      })
    };
  }

  // Preparar nombre del archivo con validación
  let nombreArchivo;
  try {
    const pattern = !mesFiltrado ? CONFIG.fileNamePatterns.anual
      : esDiario ? CONFIG.fileNamePatterns.diario 
      : CONFIG.fileNamePatterns.mensual;
    
    nombreArchivo = mesFiltrado
      ? pattern.replace('{mes}', limpiarNombreMes(mesFiltrado).replace(/\s+/g, '-')).replace('{anio}', anio)
      : pattern.replace('{anio}', anio);
  } catch (error) {
    Logger.warn('Error al generar nombre de archivo', error);
    nombreArchivo = `Reporte-${anio}-${Date.now()}.pdf`;
  }

  return {
    datosEncabezado,
    datosTarjetas,
    datosTablaResumen,
    datosDetalles,
    nombreArchivo
  };
};
