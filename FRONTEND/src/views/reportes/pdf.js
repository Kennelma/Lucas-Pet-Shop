import { jsPDF } from 'jspdf';
import { procesarDatosPDF } from './pdf-components/pdfProcesador';
import { 
  generarEncabezado, 
  generarTarjetasResumen,
  generarTablaResumen,
  generarDetalleIngresos,
  generarDetalleGastos,
  generarResumenFinal,
  generarPiePagina
} from './pdf-components/pdfComponentes';
import { 
  verificarEspacio, 
  theme, 
  CONFIG, 
  Logger, 
  PDFCache, 
  ProgressTracker, 
  PDFValidationError,
  PDFGenerationError,
  PDFValidator,
  moneda
} from './pdf-components/pdfTema';

export const descargarPDFTabla = (datosTabla, totalIngresos, totalGastos, gananciaTotal, anio, mesFiltrado = null, detallesCompletos = null) => {
  Logger.info('📄 Iniciando generación de PDF');
  ProgressTracker.start('Validación', 7);

  // ✅ VALIDACIÓN DE ENTRADA MEJORADA
  try {
    if (!Array.isArray(datosTabla) || datosTabla.length === 0) {
      throw new PDFValidationError('Los datos de la tabla son requeridos y deben ser un array no vacío', 'datosTabla');
    }
    ProgressTracker.update(1);

    if (datosTabla.length > CONFIG.validations.maxTableRows) {
      throw new PDFValidationError(`La tabla excede el máximo de ${CONFIG.validations.maxTableRows} filas`, 'datosTabla');
    }
    ProgressTracker.update(2);

    if (typeof totalIngresos !== 'number' || isNaN(totalIngresos)) {
      throw new PDFValidationError('Total de ingresos debe ser un número válido', 'totalIngresos');
    }
    ProgressTracker.update(3);

    if (typeof totalGastos !== 'number' || isNaN(totalGastos)) {
      throw new PDFValidationError('Total de gastos debe ser un número válido', 'totalGastos');
    }
    ProgressTracker.update(4);

    if (typeof gananciaTotal !== 'number' || isNaN(gananciaTotal)) {
      throw new PDFValidationError('Ganancia total debe ser un número válido', 'gananciaTotal');
    }
    ProgressTracker.update(5);

    const anioNum = Number(anio);
    if (!anio || isNaN(anioNum)) {
      throw new PDFValidationError('El año es requerido y debe ser válido', 'anio');
    }
    ProgressTracker.update(6);

    if (anioNum < CONFIG.validations.minYear || anioNum > CONFIG.validations.maxYear) {
      throw new PDFValidationError(`El año debe estar entre ${CONFIG.validations.minYear} y ${CONFIG.validations.maxYear}`, 'anio');
    }
    ProgressTracker.complete();
    Logger.info('✅ Validación exitosa');
  } catch (error) {
    Logger.error('Validación fallida', { error: error.message, field: error.field });
    alert(`Error de validación: ${error.message}`);
    return;
  }

  // ========== FASE 1: PROCESAMIENTO DE DATOS ==========
  ProgressTracker.start('Procesamiento', 1);
  
  // ✅ Verificar caché si está habilitado
  const cacheKey = CONFIG.performance.enableCache 
    ? `pdf_${anio}_${mesFiltrado}_${datosTabla.length}`
    : null;
  
  let datosProcesados = cacheKey ? PDFCache.get(cacheKey) : null;
  
  if (!datosProcesados) {
    try {
      datosProcesados = procesarDatosPDF(
        datosTabla, 
        totalIngresos, 
        totalGastos, 
        gananciaTotal, 
        anio, 
        mesFiltrado, 
        detallesCompletos
      );
      
      if (cacheKey) {
        PDFCache.set(cacheKey, datosProcesados);
      }
      
      ProgressTracker.complete();
      Logger.info('Datos procesados exitosamente');
    } catch (error) {
      Logger.error('Error al procesar datos', error);
      throw new PDFGenerationError('Error al procesar los datos del reporte', 'procesamiento');
    }
  } else {
    ProgressTracker.complete();
    Logger.info('Datos recuperados de caché');
  }

  // ========== FASE 2: GENERACIÓN DEL PDF (DIBUJO) ==========
  ProgressTracker.start('Generación', 5);
  
  let doc;
  try {
    doc = new jsPDF();
    ProgressTracker.update(1);

    // Generar encabezado y tarjetas
    generarEncabezado(doc, datosProcesados.datosEncabezado);
    ProgressTracker.update(2);
    
    generarTarjetasResumen(doc, datosProcesados.datosTarjetas);
    ProgressTracker.update(3);
    
    Logger.info('Encabezado y tarjetas generados');
  } catch (error) {
    Logger.error('Error al generar encabezado', error);
    throw new PDFGenerationError('Error al crear el documento PDF', 'encabezado');
  }

  // Generar tabla de resumen
  let y;
  try {
    y = generarTablaResumen(doc, datosProcesados.datosTablaResumen);
    ProgressTracker.update(4);
    Logger.info('Tabla resumen generada');
  } catch (error) {
    Logger.error('Error al generar tabla', error);
    throw new PDFGenerationError('Error al generar la tabla de resumen', 'tabla');
  }

  // Generar detalles (ingresos, gastos, resumen)
  try {
    if (datosProcesados.datosDetalles) {
    y += theme.spacing.sectionGap;
    y = verificarEspacio(doc, y, 50);

    // Detalles de ingresos
    if (datosProcesados.datosDetalles.ingresos.length > 0) {
      y = generarDetalleIngresos(doc, datosProcesados.datosDetalles.ingresos, y);
    }

    // Detalles de gastos
    if (datosProcesados.datosDetalles.gastos.length > 0) {
      y = verificarEspacio(doc, y, 50);
      y += 8;
      y = generarDetalleGastos(doc, datosProcesados.datosDetalles.gastos, y);
    }

    // Resumen final
    if (datosProcesados.datosDetalles.resumen.length > 0) {
      const alturaResumen = datosProcesados.datosDetalles.resumen.length * 7 + 10;
      y = verificarEspacio(doc, y, alturaResumen);
      y = generarResumenFinal(doc, datosProcesados.datosDetalles.resumen, y);
    }
  }
    Logger.info('Detalles generados');
  } catch (error) {
    Logger.error('Error al generar detalles', error);
    throw new PDFGenerationError('Error al generar los detalles del reporte', 'detalles');
  }

  // Generar pie de página
  try {
    generarPiePagina(doc);
    ProgressTracker.update(5);
    Logger.info('Pie de página generado');
  } catch (error) {
    Logger.warn('Error al generar pie de página (no crítico)', error);
  }
  
  ProgressTracker.complete();

  // ========== VALIDACIÓN DE SALIDA ==========
  ProgressTracker.start('Validación final', 1);
  const validation = PDFValidator.validateOutput(doc);
  
  if (!validation.valid) {
    const errors = validation.issues.filter(i => i.level === 'error');
    Logger.error('PDF inválido', errors);
    alert(`Error en el PDF generado: ${errors.map(e => e.message).join(', ')}`);
    return;
  }
  
  if (validation.issues.length > 0) {
    validation.issues.forEach(issue => {
      Logger.warn(`Advertencia en PDF: ${issue.message}`);
    });
  }
  
  ProgressTracker.complete();

  // ========== GUARDAR PDF ==========
  ProgressTracker.start('Guardando', 1);
  try {
    doc.save(datosProcesados.nombreArchivo);
    ProgressTracker.complete();
    
    Logger.info('✅ PDF generado exitosamente', {
      archivo: datosProcesados.nombreArchivo,
      paginas: doc.internal.getNumberOfPages(),
      cacheStats: PDFCache.getStats()
    });
    
  } catch (error) {
    Logger.error('Error al guardar PDF', error);
    throw new PDFGenerationError('Error al descargar el archivo PDF', 'guardado');
  }
};

// ✅ UTILIDADES EXPORTADAS
export { Logger, PDFCache, ProgressTracker, CONFIG, moneda };
