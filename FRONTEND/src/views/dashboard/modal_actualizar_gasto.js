import React, { useState, useEffect } from 'react';
import { CModal, CModalHeader, CModalBody, CModalFooter, CButton, CFormInput, CModalTitle } from '@coreui/react';
import Swal from 'sweetalert2';
import { actualizarRegistro } from '../../AXIOS.SERVICES/empresa-axios';

const ModalActualizarGasto = ({ visible, onHide, gastoSeleccionado, onRefresh }) => {
  const [detalle, setDetalle] = useState('');
  const [monto, setMonto] = useState(''); // mantén string para el input, convertiremos antes de enviar
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (gastoSeleccionado) {
      setDetalle(gastoSeleccionado.description ?? '');
      // Si amount proviene como number, conviértelo a string para el input
      setMonto(gastoSeleccionado.amount !== undefined ? String(gastoSeleccionado.amount) : '');
    } else {
      setDetalle('');
      setMonto('');
    }
  }, [gastoSeleccionado]);

  const actualizarGasto = async () => {
    // validaciones básicas
    if (!detalle || monto === '') {
      Swal.fire('Atención', 'Por favor completa todos los campos.', 'warning');
      return;
    }

    // convertir monto a número (entero o float según tu DB)
    const montoNum = Number(monto);
    if (Number.isNaN(montoNum)) {
      Swal.fire('Atención', 'El monto debe ser un número válido.', 'warning');
      return;
    }

    if (!gastoSeleccionado || !gastoSeleccionado.id) {
      Swal.fire('Error', 'No se detectó el ID del gasto a actualizar.', 'error');
      return;
    }

    setGuardando(true);
    try {
      // LLAMADA CORRECTA: id, entidad, data
      const res = await actualizarRegistro(gastoSeleccionado.id, 'GASTOS', {
        detalle_gasto: detalle,
        monto_gasto: montoNum,
      });

      if (res.Consulta) {
        Swal.fire('Actualizado', 'El gasto fue actualizado correctamente.', 'success');
        onHide();
        if (typeof onRefresh === 'function') onRefresh();
      } else {
        Swal.fire('Error', res.error || 'No se pudo actualizar el gasto.', 'error');
      }
    } catch (err) {
      console.error('Error al actualizar gasto:', err);
      Swal.fire('Error', err.message || 'Error al actualizar gasto.', 'error');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <CModal visible={visible} onClose={onHide} alignment="center">
      <CModalHeader>
        <CModalTitle>Actualizar Gasto</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <div className="space-y-3">
          <CFormInput
            type="text"
            label="Detalle del gasto"
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
          />
          <CFormInput
            type="number"
            label="Monto (Lempiras)"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
          {/* Si tienes fecha u otros campos puedes agregarlos aquí */}
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onHide} disabled={guardando}>
          Cancelar
        </CButton>
        <CButton color="primary" onClick={actualizarGasto} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ModalActualizarGasto;
