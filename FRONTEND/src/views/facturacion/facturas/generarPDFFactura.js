//IMPORTACIONES
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

//FUNCION_PRINCIPAL_PARA_GENERAR_PDF_DE_FACTURA
export const generarPDFFactura = (datosFactura) => {

  const { factura, items, empresa, pagos } = datosFactura;

  //CALCULAR_ALTURA_DINAMICA_DEL_PDF
  const alturaBase = 150;
  const alturaPorItem = 5;
  const alturaCalculada = alturaBase + (items.length * alturaPorItem) + (pagos ? pagos.length * 10 : 0);
  const alturaFinal = Math.max(alturaCalculada, 200);

  //CREAR_DOCUMENTO_PDF_(FORMATO_TICKET_80MM)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, alturaFinal]
  });

  //CONSTANTES_DE_DISEÑO
  const pageWidth = 80;
  const margin = 5;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = 5;

  //FUNCION_AUXILIAR_TEXTO_CENTRADO
  const addCenteredText = (text, fontSize = 10, isBold = false, spacing = 1) => {
    doc.setFontSize(fontSize);
    doc.setFont(undefined, isBold ? 'bold' : 'normal');
    doc.text(text, pageWidth / 2, yPos, { align: 'center', maxWidth: contentWidth });
    yPos += fontSize * 0.5 + spacing;
  };

  //FUNCION_AUXILIAR_LINEA_SEPARADORA
  const addSeparator = () => {
    yPos += 3;
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 4;
  };

  //CARGAR_LOGO_DE_EMPRESA_(CON_MANEJO_DE_ERRORES)
  try {
    const logoPath = '/images_LP/logo.png';
    const width = 30;
    const height = 30;
    doc.addImage(logoPath, 'PNG', pageWidth / 2 - width / 2, yPos + 5, width, height);
    yPos += 40;
  } catch (error) {
    console.warn('No se pudo cargar el logo:', error.message);
    yPos += 5;
  }

  //INFORMACION_DE_LA_EMPRESA
  addCenteredText(empresa.nombre_empresa || 'MI EMPRESA', 13, true, 2);
  yPos += 1;

  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text(factura.direccion_sucursal || factura.nombre_sucursal || '', pageWidth / 2, yPos, { align: 'center', maxWidth: contentWidth });
  yPos += 10;

  doc.text(`Tel: ${empresa.telefono_empresa || ''}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;

  if (empresa.correo_empresa) {
    doc.text(empresa.correo_empresa, pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
  }

  doc.text(`RTN: ${empresa.rtn_empresa || ''}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  doc.text(`CAI: 00000000000000000`, pageWidth / 2, yPos, { align: 'center' });
   yPos += 8;

  //TITULO_FACTURA
  addCenteredText('FACTURA DE VENTA', 12, true, 2);

  //VENDEDOR_Y_SUCURSAL
  doc.setFontSize(6);
  doc.text(`SUCURSAL: ${factura.nombre_sucursal || ''}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 3;
  doc.text(`Vendedor: ${factura.vendedor || ''}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;

  //INFORMACION_DE_FACTURA
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');

  const fecha = new Date(factura.fecha_emision).toLocaleDateString('es-HN');
  doc.text(`No: ${factura.numero_factura}`, margin, yPos);
  doc.text(`Fecha: ${fecha}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 5;

  if (factura.RTN) {
    doc.text(`RTN Cliente: ${factura.RTN}`, margin, yPos);
    yPos += 5;
  }

  //INFORMACION_DEL_CLIENTE
  doc.setFontSize(5);
  doc.setFont(undefined, 'bold');
  doc.text('CLIENTE:', margin, yPos);

  doc.setFont(undefined, 'normal');
  doc.setFontSize(6.5);
  const nombreCliente = `${factura.nombre_cliente || ''} ${factura.apellido_cliente || ''}`.trim();
  doc.text(nombreCliente || 'Consumidor General', margin + 12, yPos);
  yPos += 3;

  doc.setFontSize(8);
  if (factura.identidad_cliente && !factura.RTN) {
    yPos += 1;
    doc.text(`ID: ${factura.identidad_cliente}`, margin, yPos);
    yPos += 3;
  }

  //ESTILISTAS_ASIGNADOS
  if (items && items.length > 0) {
    const estilistasMascotas = new Map();
    items.forEach(item => {
      if (item.estilistas && item.estilistas.length > 0) {
        item.estilistas.forEach(estilista => {
          const nombreCompleto = `${estilista.nombre_estilista} ${estilista.apellido_estilista}`;
          const mascotas = parseInt(estilista.num_mascotas_atendidas) || 0;
          if (estilistasMascotas.has(nombreCompleto)) {
            estilistasMascotas.set(nombreCompleto, estilistasMascotas.get(nombreCompleto) + mascotas);
          } else {
            estilistasMascotas.set(nombreCompleto, mascotas);
          }
        });
      }
    });

    if (estilistasMascotas.size > 0) {
      yPos += 1;
      doc.setFontSize(7);
      doc.setFont(undefined, 'normal');
      const estilistasList = Array.from(estilistasMascotas).map(([nombre, cantidad]) =>
        `${nombre} (${cantidad} mascotas)`
      ).join(', ');
      doc.text(`Pet groomer: ${estilistasList}`, margin, yPos);
      yPos += 4;
      doc.setFont(undefined, 'normal');
    }
  }

  addSeparator();

  //ENCABEZADO_DE_ITEMS
  doc.setFontSize(7);
  doc.setFont(undefined, 'bold');
  yPos += 1;

  doc.text('CANT', margin, yPos);
  doc.text('DESCRIPCIÓN', margin + 10, yPos);
  doc.text('P.UNIT', pageWidth - 33, yPos, { align: 'right' });
  doc.text('AJUSTE', pageWidth - 19, yPos, { align: 'right' });
  doc.text('SUBTOTAL', pageWidth - margin, yPos, { align: 'right' });
  yPos += 3;

  doc.setLineWidth(0.2);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 4;

  //LISTADO_DE_ITEMS
  doc.setFont(undefined, 'normal');
  doc.setFontSize(6.5);

  items.forEach((item) => {
    const cantidad = item.cantidad_item;
    const nombre = item.nombre_item || 'Item';
    const precio = parseFloat(item.precio_item).toFixed(2);
    const ajuste = parseFloat(item.ajuste_precio || 0).toFixed(2);
    const total = parseFloat(item.total_linea).toFixed(2);

    //CALCULAR_ANCHO_DISPONIBLE_PARA_DESCRIPCION
    const anchoDisponible = pageWidth - 33 - (margin + 10) - 2; //RESTAR POSICION DE PRECIO Y MARGEN
    const lineasNombre = doc.splitTextToSize(nombre, anchoDisponible);

    //PRIMERA_LINEA_CON_TODOS_LOS_DATOS
    doc.text(`${cantidad}`, margin, yPos);
    doc.text(lineasNombre[0], margin + 10, yPos);
    doc.text(`L${precio}`, pageWidth - 33, yPos, { align: 'right' });
    doc.text(`L${ajuste}`, pageWidth - 19, yPos, { align: 'right' });
    doc.text(`L${total}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 3.5;

    //LINEAS_ADICIONALES_SI_DESCRIPCION_ES_LARGA
    for (let i = 1; i < lineasNombre.length; i++) {
      doc.text(lineasNombre[i], margin + 10, yPos);
      yPos += 3;
    }

    yPos += 0.5;
  });

  addSeparator();

  //RESUMEN_DE_TOTALES
  doc.setFontSize(7);
  doc.setFont(undefined, 'normal');

  doc.text('Subtotal Exento:', margin, yPos);
  doc.text(`L ${parseFloat(factura.subtotal_exento || 0).toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 3;

  doc.text('Subtotal Gravado:', margin, yPos);
  doc.text(`L ${parseFloat(factura.subtotal_gravado || 0).toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 3;

  doc.text('Impuesto (15%):', margin, yPos);
  doc.text(`L ${parseFloat(factura.impuesto || 0).toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 3;

  doc.text('Descuento:', margin, yPos);
  doc.text(`L ${parseFloat(factura.descuento).toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 3;

  doc.setFont(undefined, 'bold');
  doc.text('TOTAL A PAGAR:', margin, yPos);
  doc.text(`L ${parseFloat(factura.total).toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
  yPos += 1;
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 4;

  doc.setFont(undefined, 'normal');

  //HISTORIAL_DE_PAGOS_(SI_EXISTEN)
  if (pagos && pagos.length > 0) {
    doc.setFontSize(7);
    doc.setFont(undefined, 'bold');
    doc.text('HISTORIAL DE PAGOS:', margin, yPos);
    yPos += 4;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(6);

    pagos.forEach(pago => {
      const fechaPago = new Date(pago.fecha_pago).toLocaleDateString('es-HN', {
        day: '2-digit',
        month: '2-digit'
      });

      doc.text(`${fechaPago}`, margin, yPos);
      doc.text(`${pago.metodo_pago}`, margin + 15, yPos);
      doc.text(`L${parseFloat(pago.monto_pagado).toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 3;
    });

    yPos += 1;
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 3;

    //TOTAL_PAGADO_Y_SALDO_PENDIENTE
    doc.setFont(undefined, 'bold');
    doc.text('Total Pagado:', margin, yPos);
    doc.text(`L${factura.total_pagado}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 3;

    doc.text('Saldo Pendiente:', margin, yPos);
    doc.text(`L${factura.saldo_pendiente}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 2;
  }

  //PIE_DE_PAGINA
  yPos += 6;
  doc.setFontSize(8);
  doc.setFont(undefined, 'italic');
  doc.text('¡Gracias por su compra!', pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.setFont(undefined, 'normal');
  doc.text('Conserve este ticket', pageWidth / 2, yPos, { align: 'center' });

  return doc;
};

//FUNCION_PARA_DESCARGAR_PDF
export const descargarPDFFactura = (datosFactura) => {
  const doc = generarPDFFactura(datosFactura);
  doc.save(`Factura-${datosFactura.factura.numero_factura}.pdf`);
};