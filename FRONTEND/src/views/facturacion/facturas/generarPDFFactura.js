import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generarPDFFactura = (datosFactura) => {

  const { factura, items, empresa, pagos } = datosFactura;

  // Calcular altura dinámica basada en items
  const alturaBase = 150; // Altura mínima
  const alturaPorItem = 5; // Espacio por cada item
  const alturaCalculada = alturaBase + (items.length * alturaPorItem) + (pagos ? pagos.length * 10 : 0);
  const alturaFinal = Math.max(alturaCalculada, 200); // Mínimo 200mm

  //SE CREA EL DOCUMENTO PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, alturaFinal] // 🔥 ALTURA DINÁMICA
  });

  const pageWidth = 80;
  const margin = 10;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = 5;

  // Función auxiliar para agregar texto centrado
  const addCenteredText = (text, fontSize = 10, isBold = false, spacing = 1) => {
    doc.setFontSize(fontSize);
    doc.setFont(undefined, isBold ? 'bold' : 'normal');
    doc.text(text, pageWidth / 2, yPos, { align: 'center', maxWidth: contentWidth });
    yPos += fontSize * 0.5 + spacing;
  };

  // Función auxiliar para agregar línea separadora
  const addSeparator = () => {
    yPos += 3;
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 4;
  };

  const img = 'images/logo.png';
  const width = 30;
  const height = 30; // usa el mismo valor para mantener la proporción aproximada
  doc.addImage(img, 'PNG', pageWidth / 2 - width / 2, yPos + 5, width, height);
  yPos += 40;
  //====================ENCABEZADO - INFORMACIÓN DE LA EMPRESA====================
  addCenteredText(empresa.nombre_empresa || 'MI EMPRESA', 13, true, 2);
  yPos += 1;

  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text(empresa.direccion_empresa || '', pageWidth / 2, yPos, { align: 'center', maxWidth: contentWidth });
  yPos += 10;

  doc.text(`Tel: ${empresa.telefono_empresa || ''}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;

  if (empresa.correo_empresa) {
    doc.text(empresa.correo_empresa, pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
  }

  doc.text(`RTN: ${empresa.rtn_empresa || 'PRUEBA'}`, pageWidth / 2, yPos, { align: 'center' });

 
  yPos += 8;
  //====================TÍTULO FACTURA====================
  addCenteredText('FACTURA DE VENTA', 12, true, 2);

  //====================INFORMACIÓN DE LA FACTURA====================
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');

  doc.text(`No: ${factura.numero_factura}`, margin, yPos);
  yPos += 5;

  const fecha = new Date(factura.fecha_emision).toLocaleDateString('es-HN');
  doc.text(`Fecha: ${fecha}`, margin, yPos);
  yPos += 5;


  if (factura.RTN) {
    doc.text(`RTN Cliente: ${factura.RTN}`, margin, yPos);
    yPos += 5;
  }

  //====================INFORMACIÓN DEL CLIENTE====================
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('CLIENTE:', margin, yPos);

  // 🔹 separa horizontalmente el nombre
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  const nombreCliente = `${factura.nombre_cliente || ''} ${factura.apellido_cliente || ''}`.trim();
  doc.text(nombreCliente || 'Cliente General', margin + 15, yPos); 

  yPos += 2;


  if (factura.telefono_cliente) {
    yPos +=2;
    doc.text(`Tel: ${factura.telefono_cliente}`, margin, yPos);
  }

  addSeparator();

  //====================ITEMS - FORMATO TABLA CON COLUMNAS====================
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  yPos += 1;

  // ENCABEZADOS DE COLUMNAS
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');

  //ANCHOS DE LA COLUMNA DE DETALLES FACTURA
  const colCantidad = margin;
  const colDescripcion = margin + 12;
  const colPrecio = margin + 35;
  const colAjuste = margin + 50;

  // Imprimir encabezados
  doc.text('UNIDS', colCantidad, yPos);
  doc.text('DESCRIPCIÓN', colDescripcion, yPos);
  doc.text('PRECIO', colPrecio, yPos);
  doc.text('AJUSTE', colAjuste, yPos);
  yPos += 3;

  // Línea debajo de encabezados
  doc.setLineWidth(0.2);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 4;

  // ITEMS - UNA FILA POR PRODUCTO (SIN LÍMITE)
  doc.setFont(undefined, 'normal');
  doc.setFontSize(7);

  items.forEach((item) => {
    const cantidad = item.cantidad_item;
    const nombre = item.nombre_item || 'Item'; // 🔥 NOMBRE COMPLETO, SIN RECORTAR
    const precio = parseFloat(item.precio_item).toFixed(2);
    const ajuste = parseFloat(item.ajuste_precio || 0).toFixed(2);

    // Imprimir cada columna en la misma línea
    doc.text(cantidad.toString(), colCantidad, yPos);

    // 🔥 DESCRIPCIÓN COMPLETA (puede ocupar varias líneas si es muy largo)
    const lineasNombre = doc.splitTextToSize(nombre, 20); // Divide el texto si es muy largo
    doc.text(lineasNombre, colDescripcion, yPos);

    doc.text(`L${precio}`, colPrecio, yPos);
    doc.text(`L${ajuste}`, colAjuste, yPos);

    // 🔥 AJUSTAR ESPACIO SI EL NOMBRE OCUPA VARIAS LÍNEAS
    const alturaItem = lineasNombre.length * 3;
    yPos += Math.max(alturaItem, 4); // Mínimo 4mm entre items
  });

  addSeparator();

  //====================RESUMEN DE TOTALES====================
  doc.setFontSize(7);
  doc.setFont(undefined, 'normal');

  doc.text('Subtotal:', margin, yPos);
  doc.text(`L ${parseFloat(factura.subtotal).toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 3;

  doc.text('Descuento:', margin, yPos);
  doc.text(`L ${parseFloat(factura.descuento).toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 3;

  doc.text('Impuesto (15%):', margin, yPos);
  doc.text(`L ${parseFloat(factura.impuesto).toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 4;

  // TOTAL en negrita pero mismo tamaño (7)
  doc.setFont(undefined, 'bold');
  doc.setFontSize(7);
  doc.text('TOTAL A PAGAR:', margin, yPos);
  doc.text(`L ${parseFloat(factura.total).toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos +=1;
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 4;

  doc.setFont(undefined, 'normal');
  

  //====================HISTORIAL DE PAGOS (SI EXISTEN)====================

  if (pagos && pagos.length > 0) {
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  doc.text('METODOS DE PAGOS:', margin, yPos);
  yPos += 4;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(6);  // 🔥 Más pequeño

  pagos.forEach(pago => {
    const fechaPago = new Date(pago.fecha_pago).toLocaleDateString('es-HN', {
      day: '2-digit',
      month: '2-digit'
    }); // Solo día/mes (ej: 03/11)

    doc.text(`${fechaPago}`, margin, yPos);
    doc.text(`${pago.metodo_pago}`, margin + 15, yPos);
    doc.text(`L${parseFloat(pago.monto_pagado).toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 3;
  });

  yPos += 1;
  doc.setLineWidth(0.2);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 3;
}

  //====================PIE DE PÁGINA====================
  yPos += 6;
  doc.setFontSize(8);
  doc.setFont(undefined, 'italic');
  doc.text('Gracias por su compra!', pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.setFont(undefined, 'normal');
  doc.text('Conserve este ticket', pageWidth / 2, yPos, { align: 'center' });

  //====================RETORNAR DOCUMENTO====================
  return doc;
};

//====================DESCARGAR PDF====================
export const descargarPDFFactura = (datosFactura) => {
  const doc = generarPDFFactura(datosFactura);
  doc.save(`Factura-${datosFactura.factura.numero_factura}.pdf`);
};