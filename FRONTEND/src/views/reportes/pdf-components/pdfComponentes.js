import { theme, setFont, setColor, setFontSize, setFillColor, calcularAlturaFila, necesitaNuevaPagina, limpiarNombreMes, moneda } from './pdfTema';

// ============ ENCABEZADO Y TARJETAS ============

const obtenerTituloReporte = (esDiario, mesFiltrado, anio) => {
  if (!mesFiltrado) return `REPORTE ANUAL -  ${anio}`;
  if (esDiario) return `REPORTE DIARIO  - ${limpiarNombreMes(mesFiltrado)} ${anio}`;
  return `REPORTE MENSUAL - ${mesFiltrado} ${anio}`;
};

export const generarEncabezado = (doc, datosEncabezado) => {
  const { esDiario, anio, mesFiltrado, fechaGeneracion } = datosEncabezado;

  setFillColor(doc, 'bg.header');
  doc.rect(0, 0, theme.dimensions.pageWidth, 35, 'F');

  setFontSize(doc, 'title');
  setFont(doc, 'bold');
  setColor(doc, 'text.primary');
  
  const titulo = obtenerTituloReporte(esDiario, mesFiltrado, anio);
  doc.text(titulo, 105, 15, { align: 'center' });

  setFontSize(doc, 'body');
  setFont(doc, 'regular');
  doc.text(`Generado: ${fechaGeneracion}`, 105, 25, { align: 'center' });
};

export const generarTarjetasResumen = (doc, datosTarjetas) => {
  const { totalIngresos, totalGastos, gananciaTotal, esPositivo } = datosTarjetas;
  const cardY = 45;

  // Ingresos
  setFillColor(doc, 'bg.cardIngresos');
  doc.roundedRect(theme.padding.base, cardY, theme.padding.card, theme.padding.cardHeight, 2, 2, 'F');

  setFontSize(doc, 'small');
  setColor(doc, 'successDark');
  setFont(doc, 'bold');
  doc.text('Ingresos', 43, cardY + 7, { align: 'center' });

  setFontSize(doc, 'amount');
  setColor(doc, 'success');
  doc.text(moneda(totalIngresos), 43, cardY + 16, { align: 'center' });

  // Gastos
  setFillColor(doc, 'bg.cardGastos');
  doc.roundedRect(77, cardY, theme.padding.card, theme.padding.cardHeight, 2, 2, 'F');

  setFontSize(doc, 'small');
  setColor(doc, 'dangerDark');
  doc.text('Gastos', 105, cardY + 7, { align: 'center' });

  setFontSize(doc, 'amount');
  setColor(doc, 'danger');
  doc.text(moneda(totalGastos), 105, cardY + 16, { align: 'center' });

  // Balance
  const bgBalance = esPositivo ? theme.colors.bg.cardBalance : theme.colors.bg.cardBalanceNegative;
  doc.setFillColor(...bgBalance);
  doc.roundedRect(139, cardY, theme.padding.card, theme.padding.cardHeight, 2, 2, 'F');

  setFontSize(doc, 'small');
  setColor(doc, esPositivo ? 'primary' : 'warning');
  doc.text('Balance', 167, cardY + 7, { align: 'center' });

  setFontSize(doc, 'amount');
  setColor(doc, esPositivo ? 'primary' : 'warning');
  doc.text(moneda(gananciaTotal), 167, cardY + 16, { align: 'center' });
};

// ============ TABLA RESUMEN ============

export const generarTablaResumen = (doc, datosTablaResumen) => {
  const { datosTabla, tituloTabla, headerTexto } = datosTablaResumen;

  setFontSize(doc, 'subtitle');
  setColor(doc, 'text.dark');
  setFont(doc, 'bold');
  doc.text(tituloTabla, theme.padding.base, 78);

  const tableY = 84;

  // Encabezado tabla
  setFillColor(doc, 'bg.tableHeader');
  doc.rect(theme.padding.base, tableY, theme.dimensions.tableWidth, 8, 'F');
  setFontSize(doc, 'small');
  setColor(doc, 'text.primary');
  setFont(doc, 'bold');
  doc.text(headerTexto, 20, tableY + 5.5);
  doc.text('Ingresos', 80, tableY + 5.5, { align: 'right' });
  doc.text('Gastos', 130, tableY + 5.5, { align: 'right' });
  doc.text('Balance', 180, tableY + 5.5, { align: 'right' });

  let y = tableY + 14;
  
  datosTabla.forEach((fila, index) => {
    if (index % 2 === 0) {
      setFillColor(doc, 'bg.tableRow');
      doc.rect(theme.padding.base, y - 3, theme.dimensions.tableWidth, theme.spacing.rowHeight, 'F');
    }

    setFontSize(doc, 'small');
    setFont(doc, 'regular');
    setColor(doc, 'text.primary');
    
    const textoColumna = fila.fecha || fila.mes || fila.periodo || '';
    doc.text(textoColumna, 20, y);

    setColor(doc, 'successLight');
    doc.text(moneda(fila.ingreso), 80, y, { align: 'right' });

    setColor(doc, 'dangerDark');
    doc.text(moneda(fila.gasto), 130, y, { align: 'right' });

    const valorTotal = fila.total ?? fila.ganancia ?? 0;
    const esRentable = valorTotal >= 0;
    setFont(doc, 'bold');
    setColor(doc, esRentable ? 'primary' : 'warning');
    doc.text(moneda(valorTotal), 180, y, { align: 'right' });

    y += theme.spacing.rowHeight;
    
    if (index < datosTabla.length - 1 && necesitaNuevaPagina(doc, y, theme.spacing.rowHeight)) {
      doc.addPage();
      setFillColor(doc, 'bg.tableHeader');
      doc.rect(theme.padding.base, theme.padding.large, theme.dimensions.tableWidth, 8, 'F');
      setFontSize(doc, 'small');
      setColor(doc, 'text.primary');
      setFont(doc, 'bold');
      doc.text(headerTexto, 20, 25.5);
      doc.text('Ingresos', 80, 25.5, { align: 'right' });
      doc.text('Gastos', 130, 25.5, { align: 'right' });
      doc.text('Balance', 180, 25.5, { align: 'right' });
      y = theme.padding.large + 14;
    }
  });

  return y;
};

// ============ DETALLES DE INGRESOS ============

const generarEncabezadoIngresos = (doc, y) => {
  setFillColor(doc, 'bg.ingresosHeader');
  doc.rect(theme.padding.base, y, theme.dimensions.tableWidth, theme.spacing.rowHeight, 'F');
  setFontSize(doc, 'tiny');
  setColor(doc, 'successDark');
  setFont(doc, 'bold');
  doc.text('Fecha', 18, y + 4.5);
  doc.text('Factura', 42, y + 4.5);
  doc.text('Concepto', 75, y + 4.5);
  doc.text('Monto', 185, y + 4.5, { align: 'right' });
  return y + 9;
};

export const generarDetalleIngresos = (doc, ingresos, yInicial) => {
  let y = yInicial;

  setFontSize(doc, 'subtitle');
  setColor(doc, 'successLight');
  setFont(doc, 'bold');
  doc.text('DETALLE DE INGRESOS', theme.padding.base, y);
  y += theme.spacing.lineHeight;

  y = generarEncabezadoIngresos(doc, y);
  
  const conceptoStartX = 70;

  ingresos.forEach((ingreso, indice) => {
    const concepto = ingreso.concepto || 'N/A';
    const todasLineas = doc.splitTextToSize(concepto, theme.dimensions.conceptColumnWidth);

    const alturaFila = Math.max(8, calcularAlturaFila(doc, concepto, theme.dimensions.conceptColumnWidth));

    if (necesitaNuevaPagina(doc, y, alturaFila)) {
      doc.addPage();
      y = generarEncabezadoIngresos(doc, theme.padding.large);
    }

    if (indice % 2 === 0) {
      setFillColor(doc, 'bg.ingresosRow');
      doc.rect(theme.padding.base, y - 2.5, theme.dimensions.tableWidth, alturaFila, 'F');
    }

    setFont(doc, 'regular');
    setColor(doc, 'text.primary');
    setFontSize(doc, 'tiny');
    
    const centroY = y + (alturaFila / 2) - 0.5;
    doc.text(ingreso.fechaFormateada, 18, centroY);
    doc.text(ingreso.documento || '', 42, centroY);
    doc.text(todasLineas, conceptoStartX, y + 1.5);
    
    setColor(doc, 'successLight');
    setFont(doc, 'bold');
    doc.text(moneda(ingreso.monto), 185, centroY, { align: 'right' });

    y += alturaFila;
  });

  y += 5;
  return y;
};

// ============ DETALLES DE GASTOS ============

const generarEncabezadoGastos = (doc, y) => {
  setFillColor(doc, 'bg.gastosHeader');
  doc.roundedRect(theme.padding.base, y, theme.dimensions.tableWidth, 8, 1, 1, 'F');
  setFontSize(doc, 'small');
  setColor(doc, 'dangerMedium');
  setFont(doc, 'bold');
  doc.text('Fecha', 20, y + 5);
  doc.text('Documento', 50, y + 5);
  doc.text('Detalle', 100, y + 5);
  doc.text('Monto', 175, y + 5, { align: 'right' });
  return y + theme.spacing.headerGap;
};

export const generarDetalleGastos = (doc, gastos, yInicial) => {
  let y = yInicial;

  setFontSize(doc, 'subtitle');
  setColor(doc, 'dangerDark');
  setFont(doc, 'bold');
  doc.text('DETALLE DE GASTOS', theme.padding.base, y);
  y += 4;

  y = generarEncabezadoGastos(doc, y);

  gastos.forEach((gasto, indice) => {
    const detalle = gasto.concepto || '';
    const alturaFila = Math.max(8, calcularAlturaFila(doc, detalle, theme.dimensions.gastosColumnWidth));

    if (necesitaNuevaPagina(doc, y, alturaFila)) {
      doc.addPage();
      y = generarEncabezadoGastos(doc, theme.padding.large);
    }

    if (indice % 2 === 0) {
      setFillColor(doc, 'bg.gastosRow');
      doc.rect(theme.padding.base, y - 4, theme.dimensions.tableWidth, alturaFila, 'F');
    }

    setFont(doc, 'regular');
    setColor(doc, 'text.medium');
    setFontSize(doc, 'tiny');
    
    const centroY = y + (alturaFila / 2) - 1.5;

    doc.text(gasto.fechaFormateada, 20, centroY);
    doc.text(gasto.documento || '', 50, centroY);
    doc.text(doc.splitTextToSize(detalle, theme.dimensions.gastosColumnWidth), 90, y);
    
    setColor(doc, 'danger');
    setFont(doc, 'bold');
    doc.text(moneda(gasto.monto), 190, centroY, { align: 'right' });

    y += alturaFila;
  });

  y += theme.spacing.sectionGap - 3;
  return y;
};

// ============ RESUMEN FINAL ============

const obtenerColorItem = (documento, monto) => {
  const docUpper = documento.toUpperCase();
  if (docUpper.includes('INGRESO')) return theme.colors.success;
  if (docUpper.includes('GASTO')) return theme.colors.danger;
  if (docUpper.includes('BALANCE')) return monto >= 0 ? theme.colors.primary : theme.colors.warning;
  return theme.colors.text.primary;
};

export const generarResumenFinal = (doc, resumen, yInicial) => {
  let y = yInicial;

  setFontSize(doc, 'subtitle');
  setColor(doc, 'primary');
  setFont(doc, 'bold');
  doc.text('Resumen del Periodo', theme.padding.base, y);
  y += theme.spacing.rowHeight;

  setFillColor(doc, 'bg.resumen');
  doc.roundedRect(theme.padding.base, y, theme.dimensions.tableWidth, resumen.length * theme.spacing.rowHeight + 4, 2, 2, 'F');
  y += theme.padding.small;

  resumen.forEach((item) => {
    setFontSize(doc, 'body');
    setFont(doc, 'bold');
    setColor(doc, 'text.light');
    doc.text(item.documento, 20, y);

    const color = obtenerColorItem(item.documento, item.monto);
    doc.setTextColor(...color);
    doc.text(moneda(item.monto), 185, y, { align: 'right' });
    y += 8;
  });

  return y;
};

// ============ PIE DE PÁGINA ============

export const generarPiePagina = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(229, 231, 235);
    doc.line(theme.padding.base, 285, 195, 285);
    setFontSize(doc, 'tiny');
    setFont(doc, 'regular');
    setColor(doc, 'text.secondary');
    doc.text('Sistema de Reportes Financieros', 105, 290, { align: 'center' });
    doc.text(`Pagina ${i} de ${pageCount}`, 195, 290, { align: 'right' });
  }
};
