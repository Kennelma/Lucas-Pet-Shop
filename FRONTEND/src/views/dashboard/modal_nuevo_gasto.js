import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import Swal from 'sweetalert2';
import { insertar } from '../../AXIOS.SERVICES/empresa-axios';

const ModalAgregarGasto = ({ visible, onHide, onRefresh }) => {
  const [formData, setFormData] = useState({
    detalle_gasto: '',
    monto_gasto: ''
  });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'detalle_gasto') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else if (name === 'monto_gasto') {
      // Solo permitir números y punto decimal
      const regex = /^\d*\.?\d*$/;
      if (regex.test(value) || value === '') {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

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

  const guardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);
    try {
      const res = await insertar('GASTOS', {
        detalle_gasto: formData.detalle_gasto,
        monto_gasto: parseFloat(formData.monto_gasto)
      });

      if (res.Consulta) {
        Swal.fire('Éxito', 'Gasto agregado correctamente.', 'success');
        handleClose();
        onRefresh({ description: formData.detalle_gasto, amount: formData.monto_gasto });
      } else {
        Swal.fire('Error', res.error || 'No se pudo guardar el gasto.', 'error');
      }
    } catch (err) {
      Swal.fire('Error', err.message || 'Error al guardar.', 'error');
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
        onClick={guardar}
        loading={guardando}
        className="p-button-success p-button-rounded"
      />
    </div>
  );

  return (
    <>
      <style>
        {`
          .modal-agregar-gasto-dialog .p-dialog {
            z-index: 10500 !important;
          }
          .modal-agregar-gasto-dialog .p-dialog-mask {
            z-index: 10499 !important;
          }
        `}
      </style>
      <Dialog
        header={<div className="w-full text-center text-lg font-bold">NUEVO GASTO</div>}
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
        className="modal-agregar-gasto-dialog"
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
            placeholder="EJ: COMPRA DE MATERIALES"
          />
          {errores.detalle_gasto && <p className="text-xs text-red-600 mt-1">{errores.detalle_gasto}</p>}
        </span>

        {/* Monto del Gasto */}
        <span>
          <label htmlFor="monto_gasto" className="text-xs font-semibold text-gray-700 mb-1">MONTO</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-600">L.</span>
            <InputText
              id="monto_gasto"
              name="monto_gasto"
              value={formData.monto_gasto}
              onChange={handleChange}
              className="w-full rounded-xl h-9 text-sm"
              style={{ paddingLeft: '2rem' }}
              placeholder="0.00"
            />
          </div>
          {errores.monto_gasto && <p className="text-xs text-red-600 mt-1">{errores.monto_gasto}</p>}
        </span>
      </div>
    </Dialog>
    </>
  );
};

export default ModalAgregarGasto;