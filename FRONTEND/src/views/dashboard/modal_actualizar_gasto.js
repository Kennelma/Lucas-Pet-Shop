import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import Swal from 'sweetalert2';
import { actualizarRegistro } from '../../AXIOS.SERVICES/empresa-axios';

const ModalActualizarGasto = ({ visible, onHide, gastoSeleccionado, onRefresh }) => {
  const [formData, setFormData] = useState({
    detalle_gasto: '',
    monto_gasto: ''
  });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (visible && gastoSeleccionado) {
      setFormData({
        detalle_gasto: gastoSeleccionado.description ?? '',
        monto_gasto: gastoSeleccionado.amount !== undefined ? String(gastoSeleccionado.amount) : ''
      });
      setErrores({});
    }
  }, [visible, gastoSeleccionado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.detalle_gasto.trim()) {
      nuevosErrores.detalle_gasto = 'El detalle es obligatorio';
    }

    if (!formData.monto_gasto || formData.monto_gasto <= 0) {
      nuevosErrores.monto_gasto = 'El monto debe ser mayor a 0';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleClose = () => {
    setFormData({
      detalle_gasto: '',
      monto_gasto: ''
    });
    setErrores({});
    onHide();
  };

  const actualizarGasto = async () => {
    if (!validarFormulario()) {
      return;
    }

    if (!gastoSeleccionado || !gastoSeleccionado.id) {
      Swal.fire('Error', 'No se detectó el ID del gasto a actualizar.', 'error');
      return;
    }

    setGuardando(true);
    try {
      const res = await actualizarRegistro(gastoSeleccionado.id, 'GASTOS', {
        detalle_gasto: formData.detalle_gasto,
        monto_gasto: parseFloat(formData.monto_gasto)
      });

      if (res.Consulta) {
        Swal.fire('Actualizado', 'El gasto fue actualizado correctamente.', 'success');
        handleClose();
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

  const footer = (
    <div className="flex justify-end gap-3 mt-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={handleClose}
        className="p-button-text p-button-rounded"
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        onClick={actualizarGasto}
        loading={guardando}
        className="p-button-success p-button-rounded"
      />
    </div>
  );

  return (
    <Dialog
      header={<div className="w-full text-center text-lg font-bold">ACTUALIZAR GASTO</div>}
      visible={visible}
      style={{ width: '28rem', borderRadius: '1.5rem' }}
      modal
      closable={false}
      onHide={handleClose}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
    >
      {/* Formulario */}
      <div className="flex flex-col gap-3">
        {/* Detalle del Gasto */}
        <span>
          <label htmlFor="detalle_gasto" className="text-xs font-semibold text-gray-700 mb-1">DETALLE DEL GASTO</label>
          <InputText
            id="detalle_gasto"
            name="detalle_gasto"
            value={formData.detalle_gasto}
            onChange={handleChange}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Ej: Compra de materiales"
          />
          {errores.detalle_gasto && <p className="text-xs text-red-600 mt-1">{errores.detalle_gasto}</p>}
        </span>

        {/* Monto del Gasto */}
        <span>
          <label htmlFor="monto_gasto" className="text-xs font-semibold text-gray-700 mb-1">MONTO (L)</label>
          <InputText
            id="monto_gasto"
            name="monto_gasto"
            value={formData.monto_gasto}
            onChange={handleChange}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="0.00"
            keyfilter="num"
          />
          {errores.monto_gasto && <p className="text-xs text-red-600 mt-1">{errores.monto_gasto}</p>}
        </span>
      </div>
    </Dialog>
  );
};

export default ModalActualizarGasto;