import { jsPDF } from 'jspdf';

export const descargarPDF = (datosTabla, totalIngresos, totalGastos, gananciaTotal) => {
  const doc = new jsPDF();
  
  // ========== ENCABEZADO CON GRADIENTE SIMULADO ==========
  doc.setFillColor(139, 92, 246); // Morado
  doc.rect(0, 0, 210, 50, 'F');
  
  doc.setFillColor(168, 85, 247); // Morado claro
  doc.rect(0, 0, 210, 45, 'F');
  
  doc.setFillColor(192, 132, 252); // Morado más claro
  doc.rect(0, 0, 210, 40, 'F');
  
  // Título principal
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text(' Reportes Financieros', 105, 22, { align: 'center' });
  
  // Subtítulo
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  const fecha = new Date().toLocaleDateString('es-HN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Generado el ${fecha}`, 105, 32, { align: 'center' });
  
  // ========== TARJETAS DE RESUMEN ==========
  const cardY = 60;
  const cardHeight = 28;
  const cardWidth = 56;
  
  // Tarjeta Ingresos (Verde)
  doc.setFillColor(220, 252, 231); // Verde claro
  doc.roundedRect(15, cardY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setDrawColor(134, 239, 172); // Borde verde
  doc.setLineWidth(0.5);
  doc.roundedRect(15, cardY, cardWidth, cardHeight, 3, 3, 'S');
  
  doc.setFontSize(9);
  doc.setTextColor(22, 163, 74);
  doc.setFont(undefined, 'bold');
  doc.text('TOTAL INGRESOS', 43, cardY + 8, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(21, 128, 61);
  doc.setFont(undefined, 'bold');
  doc.text(`L ${totalIngresos.toLocaleString()}`, 43, cardY + 20, { align: 'center' });
  
  // Tarjeta Gastos (Rojo)
  doc.setFillColor(254, 226, 226); // Rojo claro
  doc.roundedRect(77, cardY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setDrawColor(252, 165, 165); // Borde rojo
  doc.roundedRect(77, cardY, cardWidth, cardHeight, 3, 3, 'S');
  
  doc.setFontSize(9);
  doc.setTextColor(220, 38, 38);
  doc.setFont(undefined, 'bold');
  doc.text('TOTAL GASTOS', 105, cardY + 8, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(185, 28, 28);
  doc.setFont(undefined, 'bold');
  doc.text(`L ${totalGastos.toLocaleString()}`, 105, cardY + 20, { align: 'center' });
  
  // Tarjeta Ganancia (Azul o Naranja)
  const isPositive = gananciaTotal >= 0;
  doc.setFillColor(isPositive ? 224 : 255, isPositive ? 242 : 237, isPositive ? 254 : 213); // Azul/Naranja claro
  doc.roundedRect(139, cardY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setDrawColor(isPositive ? 147 : 251, isPositive ? 197 : 191, isPositive ? 253 : 36); // Borde
  doc.roundedRect(139, cardY, cardWidth, cardHeight, 3, 3, 'S');
  
  doc.setFontSize(9);
  doc.setTextColor(isPositive ? 37 : 234, isPositive ? 99 : 88, isPositive ? 235 : 0);
  doc.setFont(undefined, 'bold');
  doc.text('GANANCIA TOTAL', 167, cardY + 8, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(isPositive ? 29 : 194, isPositive ? 78 : 65, isPositive ? 216 : 12);
  doc.setFont(undefined, 'bold');
  doc.text(`L ${gananciaTotal.toLocaleString()}`, 167, cardY + 20, { align: 'center' });
  
  // ========== TÍTULO DE TABLA ==========
  doc.setFontSize(14);
  doc.setTextColor(51, 65, 85);
  doc.setFont(undefined, 'bold');
  doc.text('Detalle Mensual', 105, 105, { align: 'center' });
  
  // ========== ENCABEZADO DE TABLA ==========
  const tableY = 115;
  
  // Fondo degradado del encabezado
  doc.setFillColor(139, 92, 246); // Morado
  doc.roundedRect(15, tableY, 180, 10, 2, 2, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text('Mes', 30, tableY + 7, { align: 'left' });
  doc.text('Ingresos', 85, tableY + 7, { align: 'center' });
  doc.text('Gastos', 130, tableY + 7, { align: 'center' });
  doc.text('Ganancia', 175, tableY + 7, { align: 'center' });
  
  // ========== FILAS DE LA TABLA ==========
  doc.setFont(undefined, 'normal');
  let y = tableY + 18;
  
  datosTabla.forEach((fila, index) => {
    // Fondo alternado con bordes redondeados
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252); // Gris muy claro
      doc.roundedRect(15, y - 6, 180, 9, 1, 1, 'F');
    }
    
    // Línea divisoria sutil
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.1);
    doc.line(15, y + 3, 195, y + 3);
    
    // Mes
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.setFont(undefined, 'bold');
    doc.text(fila.mes, 30, y, { align: 'left' });
    
    // Ingresos
    doc.setTextColor(22, 163, 74);
    doc.setFont(undefined, 'normal');
    doc.text(`L ${fila.ingreso.toLocaleString()}`, 85, y, { align: 'center' });
    
    // Gastos
    doc.setTextColor(220, 38, 38);
    doc.text(`L ${fila.gasto.toLocaleString()}`, 130, y, { align: 'center' });
    
    // Ganancia
    const isProfitable = fila.ganancia >= 0;
    doc.setTextColor(isProfitable ? 37 : 234, isProfitable ? 99 : 88, isProfitable ? 235 : 0);
    doc.setFont(undefined, 'bold');
    doc.text(`L ${fila.ganancia.toLocaleString()}`, 175, y, { align: 'center' });
    
    y += 9;
    
    // Nueva página si es necesario
    if (y > 270 && index < datosTabla.length - 1) {
      doc.addPage();
      
      // Repetir encabezado en nueva página
      doc.setFillColor(139, 92, 246);
      doc.roundedRect(15, 20, 180, 10, 2, 2, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, 'bold');
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
    
    // Línea decorativa
    doc.setDrawColor(192, 132, 252);
    doc.setLineWidth(0.5);
    doc.line(15, 285, 195, 285);
    
    // Texto del pie
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont(undefined, 'normal');
    doc.text('Generado por Sistema de Reportes Financieros', 105, 290, { align: 'center' });
    doc.text(`Página ${i} de ${pageCount}`, 195, 290, { align: 'right' });
  }
  
  // ========== GUARDAR PDF ==========
  const nombreArchivo = `Reporte-Financiero-${new Date().getFullYear()}.pdf`;
  doc.save(nombreArchivo);
};