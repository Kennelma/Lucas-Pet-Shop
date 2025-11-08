import { jsPDF } from 'jspdf';

export const descargarPDF = (datosTabla, totalIngresos, totalGastos, gananciaTotal) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setTextColor(71, 85, 105);
  doc.text('Reportes Financieros', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  const fecha = new Date().toLocaleDateString('es-HN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Generado: ${fecha}`, 105, 28, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(34, 197, 94);
  doc.text(`Total Ingresos: L ${totalIngresos.toLocaleString()}`, 20, 45);
  
  doc.setTextColor(239, 68, 68);
  doc.text(`Total Gastos: L ${totalGastos.toLocaleString()}`, 20, 53);
  
  doc.setTextColor(gananciaTotal >= 0 ? 59 : 249, gananciaTotal >= 0 ? 130 : 115, gananciaTotal >= 0 ? 246 : 22);
  doc.text(`Ganancia Total: L ${gananciaTotal.toLocaleString()}`, 20, 61);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  doc.setFillColor(243, 244, 246);
  doc.rect(20, 75, 170, 10, 'F');
  doc.setFont(undefined, 'bold');
  doc.text('Mes', 25, 82);
  doc.text('Ingresos', 70, 82);
  doc.text('Gastos', 110, 82);
  doc.text('Ganancia', 150, 82);
  
  doc.setFont(undefined, 'normal');
  let y = 92;
  
  datosTabla.forEach((fila, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(20, y - 5, 170, 8, 'F');
    }
    
    doc.setTextColor(71, 85, 105);
    doc.text(fila.mes, 25, y);
    
    doc.setTextColor(34, 197, 94);
    doc.text(`L ${fila.ingreso.toLocaleString()}`, 70, y);
    
    doc.setTextColor(239, 68, 68);
    doc.text(`L ${fila.gasto.toLocaleString()}`, 110, y);
    
    doc.setTextColor(fila.ganancia >= 0 ? 59 : 249, fila.ganancia >= 0 ? 130 : 115, fila.ganancia >= 0 ? 246 : 22);
    doc.text(`L ${fila.ganancia.toLocaleString()}`, 150, y);
    
    y += 8;
    
    if (y > 270 && index < datosTabla.length - 1) {
      doc.addPage();
      y = 20;
    }
  });
  
  doc.save('reportes-financieros.pdf');
};