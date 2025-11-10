import { jsPDF } from 'jspdf';

export const descargarPDF = (datosTabla, totalIngresos, totalGastos, gananciaTotal) => {
  const doc = new jsPDF();

  // ========== ENCABEZADO MODERNO (sin degradado fuerte) ==========
  doc.setFillColor(245, 247, 250); // Fondo gris claro suave
  doc.rect(0, 0, 210, 45, 'F');

  // Título principal
  doc.setFontSize(26);
  doc.setTextColor(33, 37, 41); // Negro suave (gris oscuro)
  doc.setFont(undefined, 'bold');
  doc.text('Reporte Financiero Anual', 105, 22, { align: 'center' });

  // Subtítulo con fecha
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(80, 90, 100);
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
  doc.text(`L ${totalIngresos.toLocaleString()}`, 43, cardY + 20, { align: 'center' });

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
  doc.text(`L ${totalGastos.toLocaleString()}`, 105, cardY + 20, { align: 'center' });

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
  doc.text('GANANCIA TOTAL', 167, cardY + 8, { align: 'center' });

  doc.setFontSize(15);
  doc.setTextColor(isPositive ? 25 : 220, isPositive ? 80 : 50, isPositive ? 190 : 20);
  doc.text(`L ${gananciaTotal.toLocaleString()}`, 167, cardY + 20, { align: 'center' });

  // ========== TABLA DE DETALLE ==========
  doc.setFontSize(14);
  doc.setTextColor(33, 37, 41);
  doc.setFont(undefined, 'bold');
  doc.text('Detalle Mensual', 105, 105, { align: 'center' });

  const tableY = 115;

  // Encabezado tabla
  doc.setFillColor(235, 235, 245);
  doc.roundedRect(15, tableY, 180, 10, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 70);
  doc.text('Mes', 30, tableY + 7, { align: 'left' });
  doc.text('Ingresos', 85, tableY + 7, { align: 'center' });
  doc.text('Gastos', 130, tableY + 7, { align: 'center' });
  doc.text('Ganancia', 175, tableY + 7, { align: 'center' });

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
    doc.text(fila.mes, 30, y, { align: 'left' });

    doc.setTextColor(22, 163, 74);
    doc.text(`L ${fila.ingreso.toLocaleString()}`, 85, y, { align: 'center' });

    doc.setTextColor(220, 38, 38);
    doc.text(`L ${fila.gasto.toLocaleString()}`, 130, y, { align: 'center' });

    const isProfitable = fila.ganancia >= 0;
    doc.setTextColor(isProfitable ? 37 : 234, isProfitable ? 99 : 88, isProfitable ? 235 : 0);
    doc.text(`L ${fila.ganancia.toLocaleString()}`, 175, y, { align: 'center' });

    y += 9;
    if (y > 270 && index < datosTabla.length - 1) {
      doc.addPage();
      doc.setFillColor(235, 235, 245);
      doc.roundedRect(15, 20, 180, 10, 2, 2, 'F');
      doc.setTextColor(60, 60, 70);
      doc.text('Mes', 30, 27, { align: 'left' });
      doc.text('Ingresos', 85, 27, { align: 'center' });
      doc.text('Gastos', 130, 27, { align: 'center' });
      doc.text('Ganancia', 175, 27, { align: 'center' });
      y = 38;
    }
  });

  // ========== PIE DE PÁGINA ==========
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 220, 230);
    doc.line(15, 285, 195, 285);
    doc.setFontSize(8);
    doc.setTextColor(120, 130, 140);
    doc.text('Sistema de Reportes Financieros', 105, 290, { align: 'center' });
    doc.text(`Página ${i} de ${pageCount}`, 195, 290, { align: 'right' });
  }

  // ========== GUARDAR ==========
  const nombreArchivo = `Reporte-Financiero-${new Date().getFullYear()}.pdf`;
  doc.save(nombreArchivo);
};
