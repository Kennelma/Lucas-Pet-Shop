import { jsPDF } from 'jspdf';

export const descargarPDFTabla = (datosTabla, totalIngresos, totalGastos, gananciaTotal, anio, mesFiltrado = null, detallesCompletos = null) => {
  const doc = new jsPDF();

  // ========== ENCABEZADO MODERNO ==========
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 0, 210, 45, 'F');

  // Título principal (GENÉRICO Y SIN ACENTOS para evitar el bug de caracteres raros)
  doc.setFontSize(26);
  // Usamos la fuente 'Helvetica' para evitar problemas de codificación (caracteres raros)
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 37, 41);
  
  let titulo = '';
  let esDiario = false;
  
  if (mesFiltrado) {
    // Determinar si es reporte diario o mensual
    // Se usa la comparacion sin acentos para mayor compatibilidad
    esDiario = mesFiltrado.includes('Diario') || mesFiltrado.includes('DIARIO') || datosTabla.length > 12;
    
    if (esDiario) {
      const nombreMes = mesFiltrado.replace(' - Diario', '').replace(' - DIARIO', '');
      titulo = `Reporte Diario - ${nombreMes} ${anio}`;
    } else {
      titulo = `Reporte Mensual - ${mesFiltrado} ${anio}`;
    }
  } else {
    titulo = `Reporte Anual ${anio}`;
  }
  
  // Usamos un titulo generico y simple para evitar el bug de caracteres especiales
  doc.text(`REPORTE FINANCIERO ${anio}`, 105, 22, { align: 'center' });

  // Subtítulo con fecha
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 90, 100);
  // Se usa toLocaleDateString() para obtener acentos y caracteres especiales, ya que solo es un subtítulo
  const fecha = new Date().toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Generado el ${fecha}`, 105, 32, { align: 'center' });

  // ========== TARJETAS DE RESUMEN ==========
  const cardY = 60;
  const cardHeight = 28;
  const cardWidth = 56;

  // Ingresos (Verde)
  doc.setFillColor(235, 251, 238);
  doc.roundedRect(15, cardY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(15, cardY, cardWidth, cardHeight, 3, 3, 'S');

  doc.setFontSize(9);
  doc.setTextColor(30, 100, 40);
  doc.setFont(undefined, 'bold');
  doc.text('TOTAL INGRESOS', 43, cardY + 8, { align: 'center' });

  doc.setFontSize(15);
  doc.setTextColor(22, 163, 74);
  doc.text(`L ${totalIngresos.toLocaleString('es-HN')}`, 43, cardY + 20, { align: 'center' });

  // Gastos (Rojo)
  doc.setFillColor(255, 240, 240);
  doc.roundedRect(77, cardY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(77, cardY, cardWidth, cardHeight, 3, 3, 'S');

  doc.setFontSize(9);
  doc.setTextColor(190, 50, 50);
  doc.text('TOTAL GASTOS', 105, cardY + 8, { align: 'center' });

  doc.setFontSize(15);
  doc.setTextColor(220, 38, 38);
  doc.text(`L ${totalGastos.toLocaleString('es-HN')}`, 105, cardY + 20, { align: 'center' });

  // Ganancia (Azul si positiva, Naranja si negativa)
  const isPositive = gananciaTotal >= 0;
  if (isPositive) {
    doc.setFillColor(230, 240, 255);
    doc.setDrawColor(180, 210, 255);
  } else {
    doc.setFillColor(255, 245, 230);
    doc.setDrawColor(255, 220, 180);
  }
  doc.roundedRect(139, cardY, cardWidth, cardHeight, 3, 3, 'F');
  doc.roundedRect(139, cardY, cardWidth, cardHeight, 3, 3, 'S');

  doc.setFontSize(9);
  doc.setTextColor(isPositive ? 37 : 234, isPositive ? 99 : 88, isPositive ? 235 : 0);
  doc.text('TOTAL GENERAL', 167, cardY + 8, { align: 'center' });

  doc.setFontSize(15);
  doc.setTextColor(isPositive ? 25 : 220, isPositive ? 50 : 50, isPositive ? 190 : 20);
  doc.text(`L ${gananciaTotal.toLocaleString('es-HN')}`, 167, cardY + 20, { align: 'center' });

  // ========== TABLA DE RESUMEN POR PERIODO ==========
  doc.setFontSize(14);
  doc.setTextColor(33, 37, 41);
  doc.setFont(undefined, 'bold');
  
  let tituloTabla = '';
  if (mesFiltrado) {
    const nombreMes = mesFiltrado.replace(' - Diario', '').replace(' - DIARIO', '');
    tituloTabla = esDiario ? `Resumen por Dias - ${nombreMes}` : `Detalle de ${nombreMes}`; // Sin Ñ o acentos
  } else {
    tituloTabla = 'Detalle Anual';
  }
  
  doc.text(tituloTabla, 105, 105, { align: 'center' });

  const tableY = 115;

  // Encabezado tabla resumen
  doc.setFillColor(235, 235, 245);
  doc.roundedRect(15, tableY, 180, 10, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 70);
  
  const headerTexto = esDiario ? 'Fecha' : 'Periodo'; // Sin acentos
  doc.text(headerTexto, 30, tableY + 7, { align: 'left' });
  doc.text('Ingresos', 85, tableY + 7, { align: 'center' });
  doc.text('Gastos', 130, tableY + 7, { align: 'center' });
  doc.text('Total', 175, tableY + 7, { align: 'center' });

  let y = tableY + 18;
  datosTabla.forEach((fila, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 252);
      doc.roundedRect(15, y - 6, 180, 9, 1, 1, 'F');
    }

    doc.setDrawColor(230, 230, 235);
    doc.line(15, y + 3, 195, y + 3);

    doc.setFontSize(9);
    doc.setTextColor(70, 70, 85);
    
    const textoColumna = fila.fecha || fila.mes || fila.periodo || '';
    doc.text(textoColumna, 30, y, { align: 'left' });

    doc.setTextColor(22, 163, 74);
    doc.text(`L ${fila.ingreso.toLocaleString('es-HN')}`, 85, y, { align: 'center' });

    doc.setTextColor(220, 38, 38);
    doc.text(`L ${fila.gasto.toLocaleString('es-HN')}`, 130, y, { align: 'center' });

    const isProfitable = fila.total >= 0 || fila.ganancia >= 0;
    const totalValue = fila.total || fila.ganancia || 0;
    doc.setTextColor(isProfitable ? 37 : 234, isProfitable ? 99 : 88, isProfitable ? 235 : 0);
    doc.text(`L ${totalValue.toLocaleString('es-HN')}`, 175, y, { align: 'center' });

    y += 9;
    if (y > 270 && index < datosTabla.length - 1) {
      doc.addPage();
      doc.setFillColor(235, 235, 245);
      doc.roundedRect(15, 20, 180, 10, 2, 2, 'F');
      doc.setTextColor(60, 60, 70);
      doc.text(headerTexto, 30, 27, { align: 'left' });
      doc.text('Ingresos', 85, 27, { align: 'center' });
      doc.text('Gastos', 130, 27, { align: 'center' });
      doc.text('Total', 175, 27, { align: 'center' });
      y = 38;
    }
  });

  // ========== SECCIÓN DE DETALLES DE FACTURAS Y GASTOS ==========
  if (detallesCompletos && detallesCompletos.length > 0) {
    // Separar ingresos, gastos y resumen
    const ingresos = detallesCompletos.filter(d => d.tipo_movimiento === 'INGRESO');
    const gastos = detallesCompletos.filter(d => d.tipo_movimiento === 'GASTO');
    // Filtramos solo el resumen. Los datos del resumen deberían venir al final del array.
    const resumen = detallesCompletos.filter(d => d.tipo_movimiento === '--- RESUMEN ---');

    // Verificar si necesitamos nueva página para detalles
    if (y > 260) {
      doc.addPage();
      y = 20;
    } else {
      y += 15;
    }

    // ========== DETALLES DE INGRESOS (FACTURAS) ==========
    if (ingresos.length > 0) {
      doc.setFontSize(13);
      doc.setTextColor(22, 163, 74);
      doc.setFont(undefined, 'bold');
      doc.text('Detalle de Ingresos (Facturas)', 15, y); // Sin acentos
      y += 8;

      // Encabezado de tabla de facturas
      doc.setFillColor(235, 251, 238);
      doc.roundedRect(15, y, 180, 8, 1, 1, 'F');
      doc.setFontSize(8);
      doc.setTextColor(30, 100, 40);
      doc.setFont(undefined, 'bold');
      
      // Posicionamiento Ajustado: Monto movido a 180, Concepto(Cant.) a 80
      doc.text('Fecha', 17, y + 5);
      doc.text('Factura', 40, y + 5);
      doc.text('Concepto (Cant.)', 80, y + 5); // Mas centrado y mas ancho
      doc.text('Monto', 180, y + 5, { align: 'right' }); // Mas a la izquierda
      y += 10;
      
      const maxWidthConcepto = 100; // Ancho para el concepto
      const conceptoStartX = 65; // Inicio de la columna Concepto (ajustado)

      ingresos.forEach((ingreso, idx) => {
        const concepto = ingreso.concepto || '';
        
        // Dividir por comas, limpiar espacios y filtrar vacíos
        const items = concepto.split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);
        
        let allLines = [];
        
        if (items.length > 0) {
          items.forEach(item => {
            // Dividir el texto largo en líneas que quepan en el ancho máximo
            const itemLines = doc.splitTextToSize(item, maxWidthConcepto);
            allLines.push(...itemLines);
          });
        } else {
          allLines.push('N/A');
        }

        // Calcular la altura de la fila basándose en el número de líneas de concepto
        const alturaFila = Math.max(7, allLines.length * 3.5 + 3); // 3.5 es la altura de línea de la fuente 7

        // Verificar si necesitamos nueva página
        if (y + alturaFila > 280) {
          doc.addPage();
          y = 20;
          // Repetir encabezado
          doc.setFillColor(235, 251, 238);
          doc.roundedRect(15, y, 180, 8, 1, 1, 'F');
          doc.setFontSize(8);
          doc.setTextColor(30, 100, 40);
          doc.setFont(undefined, 'bold');
          doc.text('Fecha', 17, y + 5);
          doc.text('Factura', 40, y + 5);
          doc.text('Concepto (Cant.)', 80, y + 5);
          doc.text('Monto', 180, y + 5, { align: 'right' });
          y += 10;
        }

        // Fondo alternado con altura ajustada
        if (idx % 2 === 0) {
          doc.setFillColor(248, 252, 248);
          doc.rect(15, y - 4, 180, alturaFila, 'F');
        }

        doc.setFont(undefined, 'normal');
        doc.setTextColor(70, 70, 85);
        doc.setFontSize(7);
        
        // Calcular la posición Y para centrar el texto verticalmente en la fila
        const centerY = y + (alturaFila / 2) - 1.5;
        
        // Fecha
        const fechaFormateada = ingreso.fecha ? new Date(ingreso.fecha).toLocaleDateString('es-HN') : '';
        doc.text(fechaFormateada, 17, centerY);
        
        // Número de factura
        doc.text(ingreso.documento || '', 40, centerY);
        
        // Concepto (varias líneas)
        doc.text(allLines, conceptoStartX, y); 
        
        // Monto total 
        doc.setTextColor(22, 163, 74);
        doc.setFont(undefined, 'bold');
        doc.text(`L ${Number(ingreso.monto).toLocaleString('es-HN')}`, 190, centerY, { align: 'right' });

        y += alturaFila;
      });

      y += 5;
    }

    // ========== DETALLES DE GASTOS ==========
    if (gastos.length > 0) {
      // Verificar espacio
      if (y + 20 > 280) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(13);
      doc.setTextColor(220, 38, 38);
      doc.setFont(undefined, 'bold');
      doc.text('Detalle de Gastos', 15, y); // Sin acentos
      y += 8;

      // Encabezado de tabla de gastos
      doc.setFillColor(255, 240, 240);
      doc.roundedRect(15, y, 180, 8, 1, 1, 'F');
      doc.setFontSize(8);
      doc.setTextColor(190, 50, 50);
      doc.setFont(undefined, 'bold');
      doc.text('Fecha', 20, y + 5);
      doc.text('Documento', 50, y + 5);
      doc.text('Detalle', 100, y + 5); // Mas centrado
      doc.text('Monto', 175, y + 5, { align: 'right' });
      y += 10;
      
      const maxWidthGastos = 85; // Ancho ajustado para el detalle

      gastos.forEach((gasto, idx) => {
        // Procesar detalle
        const detalle = gasto.concepto || '';
        const detalleLineas = doc.splitTextToSize(detalle, maxWidthGastos);
        const alturaFila = Math.max(7, detalleLineas.length * 3.5 + 3);

        // Verificar si necesitamos nueva página
        if (y + alturaFila > 280) {
          doc.addPage();
          y = 20;
          // Repetir encabezado
          doc.setFillColor(255, 240, 240);
          doc.roundedRect(15, y, 180, 8, 1, 1, 'F');
          doc.setFontSize(8);
          doc.setTextColor(190, 50, 50);
          doc.setFont(undefined, 'bold');
          doc.text('Fecha', 20, y + 5);
          doc.text('Documento', 50, y + 5);
          doc.text('Detalle', 100, y + 5);
          doc.text('Monto', 175, y + 5, { align: 'right' });
          y += 10;
        }

        // Fondo alternado con altura ajustada
        if (idx % 2 === 0) {
          doc.setFillColor(255, 250, 250);
          doc.rect(15, y - 4, 180, alturaFila, 'F');
        }

        doc.setFont(undefined, 'normal');
        doc.setTextColor(70, 70, 85);
        doc.setFontSize(7);
        
        // Calcular la posición Y para centrar el texto verticalmente en la fila
        const centerY = y + (alturaFila / 2) - 1.5;

        // Fecha
        const fechaFormateada = gasto.fecha ? new Date(gasto.fecha).toLocaleDateString('es-HN') : '';
        doc.text(fechaFormateada, 20, centerY);
        
        // Documento
        doc.text(gasto.documento || '', 50, centerY);
        
        // Detalle
        doc.text(detalleLineas, 90, y);
        
        // Monto
        doc.setTextColor(220, 38, 38);
        doc.setFont(undefined, 'bold');
        doc.text(`L ${Number(gasto.monto).toLocaleString('es-HN')}`, 190, centerY, { align: 'right' });

        y += alturaFila;
      });

      y += 5;
    }

    // ========== RESUMEN FINAL DE INGRESOS/GASTOS/BALANCE (TABLA DE TOTALES) ==========
    if (resumen.length > 0) {
      // Espacio de 5mm antes de la tabla, ajustamos si vamos a salir de la página
      const alturaResumen = resumen.length * 8 + 10;
      
      if (y + alturaResumen > 280) {
        doc.addPage();
        y = 20; // Empezar en una nueva página
      }

      doc.setFontSize(12);
      doc.setTextColor(37, 99, 235);
      doc.setFont(undefined, 'bold');
      doc.text('Resumen del Periodo', 15, y); // Sin acentos
      y += 8;

      doc.setFillColor(230, 240, 255);
      // Ajustar la altura del rectángulo según la cantidad de filas del resumen
      doc.roundedRect(15, y, 180, resumen.length * 8 + 4, 2, 2, 'F');
      y += 6;

      resumen.forEach((item) => {
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(60, 60, 70);
        doc.text(item.documento, 20, y);

        // Color según el tipo
        let color = [70, 70, 85];
        // El campo documento contiene el título (ej: "TOTAL INGRESOS")
        if (item.documento.includes('INGRESOS')) color = [22, 163, 74];
        else if (item.documento.includes('GASTOS')) color = [220, 38, 38];
        else if (item.documento.includes('BALANCE')) {
          color = Number(item.monto) >= 0 ? [37, 99, 235] : [234, 88, 12];
        }

        doc.setTextColor(...color);
        doc.text(`L ${Number(item.monto).toLocaleString('es-HN')}`, 185, y, { align: 'right' });
        y += 8;
      });
    }
  }

  // ========== PIE DE PÁGINA ==========
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 220, 230);
    doc.line(15, 285, 195, 285);
    doc.setFontSize(8);
    doc.setTextColor(120, 130, 140);
    doc.text('Sistema de Reportes Financieros', 105, 290, { align: 'center' });
    doc.text(`Pagina ${i} de ${pageCount}`, 195, 290, { align: 'right' }); // Sin acentos
  }

  // ========== GUARDAR ==========
  let nombreArchivo = '';
  
  if (mesFiltrado) {
    const nombreMes = mesFiltrado.replace(' - Diario', '').replace(' - DIARIO', '').replace(/\s+/g, '-');
    nombreArchivo = esDiario 
      ? `Reporte-Diario-${nombreMes}-${anio}.pdf`
      : `Reporte-Mensual-${nombreMes}-${anio}.pdf`;
  } else {
    nombreArchivo = `Reporte-Anual-${anio}.pdf`;
  }
  
  doc.save(nombreArchivo);
};