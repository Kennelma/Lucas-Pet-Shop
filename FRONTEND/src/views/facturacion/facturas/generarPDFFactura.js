import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generarPDFFactura = (datosFactura) => {

  const { factura, items, empresa, pagos } = datosFactura;


  const alturaBase = 150;
  const alturaPorItem = 5;
  const alturaCalculada = alturaBase + (items.length * alturaPorItem) + (pagos ? pagos.length * 10 : 0);
  const alturaFinal = Math.max(alturaCalculada, 200);

  //SE CREA EL DOCUMENTO PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, alturaFinal]
  });

  const pageWidth = 80;
  const margin = 5;
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
  doc.setFontSize(5);
  doc.setFont(undefined, 'bold');
  doc.text('CLIENTE:', margin, yPos);

  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  const nombreCliente = `${factura.nombre_cliente || ''} ${factura.apellido_cliente || ''}`.trim();
  doc.text(nombreCliente || 'Consumidor General', margin + 15, yPos);

  yPos += 2;


  if (factura.telefono_cliente) {
    yPos +=2;
    doc.text(`Tel: ${factura.telefono_cliente}`, margin, yPos);
  }

  addSeparator();

  //====================ITEMS - FORMATO COMPACTO====================
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  yPos += 1;

  // Encabezado simple
  doc.text('CANT', margin, yPos);
  doc.text('DESCRIPCIÓN', margin + 10, yPos);
  doc.text('P.UNIT', pageWidth - 32, yPos, { align: 'right' });
  doc.text('AJUSTE', pageWidth - 18, yPos, { align: 'right' });
  doc.text('SUBTOTAL', pageWidth - margin, yPos, { align: 'right' });
  yPos += 3;

  // Línea debajo de encabezados
  doc.setLineWidth(0.2);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 4;

  // ITEMS
  doc.setFont(undefined, 'normal');
  doc.setFontSize(6.5);

  items.forEach((item) => {
    const cantidad = item.cantidad_item;
    const nombre = item.nombre_item || 'Item';
    const precio = parseFloat(item.precio_item).toFixed(2);
    const ajuste = parseFloat(item.ajuste_precio || 0).toFixed(2);
    const total = parseFloat(item.total_linea).toFixed(2);

    // Primera línea: Cantidad + Descripción
    const lineasNombre = doc.splitTextToSize(nombre, 38);
    doc.text(`${cantidad}`, margin, yPos);
    doc.text(lineasNombre[0], margin + 10, yPos);

    // Valores alineados a la derecha
    doc.text(`L${precio}`, pageWidth - 32, yPos, { align: 'right' });
    doc.text(`L${ajuste}`, pageWidth - 18, yPos, { align: 'right' });
    doc.text(`L${total}`, pageWidth - margin, yPos, { align: 'right' });

    yPos += 3.5;

    // Si la descripción es larga, agregar líneas adicionales
    for (let i = 1; i < lineasNombre.length; i++) {
      doc.text(lineasNombre[i], margin + 10, yPos);
      yPos += 3;
    }

    yPos += 0.5; // Separación entre items
  });

  addSeparator();

  //====================RESUMEN DE TOTALES====================
  doc.setFontSize(7);
  doc.setFont(undefined, 'normal');

  {/*ddoc.text('Subtotal:', margin, yPos);
  doc.text(`L ${parseFloat(factura.subtotal).toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 3;*/}

  doc.text('Descuento:', margin, yPos);
  doc.text(`L ${parseFloat(factura.descuento).toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 3;

  {/*doc.text('Impuesto (15%):', margin, yPos);
  doc.text(`L ${parseFloat(factura.impuesto).toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 4; */}


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
  doc.setFontSize(6);

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