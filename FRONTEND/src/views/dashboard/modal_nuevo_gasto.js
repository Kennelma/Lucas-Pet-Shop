import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import Swal from 'sweetalert2';
import { insertar } from '../../AXIOS.SERVICES/empresa-axios';

const ModalAgregarGasto = ({ visible, onHide, onRefresh }) => {
  const [detalle, setDetalle] = useState('');
  const [monto, setMonto] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    if (!detalle || monto === null) {
      Swal.fire('Atención', 'Complete todos los campos.', 'warning');
      return;
    }

    setGuardando(true);
    try {
      const res = await insertar('GASTOS', {
        detalle_gasto: detalle,
        monto_gasto: monto
      });

      if (res.Consulta) {
        Swal.fire('Éxito', 'Gasto agregado correctamente.', 'success');
        setDetalle('');
        setMonto(null);
        onHide();
        onRefresh({ description: detalle, amount: monto });
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
    <div className="flex justify-end gap-2">
      <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={onHide} />
      <Button label="Guardar" icon="pi pi-check" onClick={guardar} loading={guardando} />
    </div>
  );

  return (
    <Dialog 
      header="Agregar nuevo gasto" 
      visible={visible} 
      style={{ width: '30vw', zIndex: 2000 }} 
      modal 
      onHide={onHide} 
      footer={footer}
      appendTo={document.body}
      baseZIndex={2000}
    >
      <div className="flex flex-col gap-3 mt-3">
        <div>
          <label className="font-semibold">Detalle del gasto</label>
          <InputText
            value={detalle}
            onChange={(e) => setDetalle(e.target.value)}
            placeholder="Ej: Compra de materiales"
            className="w-full mt-1"
          />
        </div>
        <div>
          <label className="font-semibold">Monto del gasto</label>
          <InputNumber
            value={monto}
            onValueChange={(e) => setMonto(e.value)}
            placeholder="Ingrese el monto"
            mode="currency"
            currency="USD"
            className="w-full mt-1"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ModalAgregarGasto;