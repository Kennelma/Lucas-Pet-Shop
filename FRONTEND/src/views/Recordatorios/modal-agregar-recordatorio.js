import React, { useState } from 'react';

import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

const ModalRecordatorio = ({ isOpen, onClose, onGuardar, tipoServicio = [], frecuencias = [] }) => {


  const [tipoItem, setTipoItem] = useState('');
  const [frecuencia, setFrecuencia] = useState('');
  const [fechaProgramacion, setFechaProgramacion] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleGuardar = () => {
    onGuardar({ tipoItem, frecuencia, fechaProgramacion, mensaje });
    onClose();
  };

  return (
    <Dialog header="Nuevo Recordatorio" visible={isOpen} style={{ width: '30rem' }} onHide={onClose} modal>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Recordatorio para clientes que han comprado: </label>
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={tipoItem}
            onChange={e => setTipoItem(e.target.value)}
          >
            <option value="">Seleccionar tipo</option>
            {tipoServicio.map(t => (
              <option key={t.id_tipo_item_pk} value={t.id_tipo_item_pk}>{t.nombre_tipo_item}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Frecuencia de envio del recordatorio: </label>
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={frecuencia}
            onChange={e => setFrecuencia(e.target.value)}
            disabled={frecuencias.length === 0}
          >
            <option value="">Seleccionar frecuencia</option>
            {frecuencias.map(f => (
              <option key={f.id_frecuencia_record_pk} value={f.id_frecuencia_record_pk}>{f.frecuencia_recordatorio}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Fecha Programación para enviar recordatorio: </label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2 text-sm"
            value={fechaProgramacion}
            onChange={e => setFechaProgramacion(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Mensaje</label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm"
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            rows={3}
          />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button label="Cancelar" className="p-button-text" onClick={onClose} />
          <Button label="Guardar" className="bg-green-800 hover:bg-green-900 text-white" onClick={handleGuardar} />
        </div>
      </div>
    </Dialog>
  );
};

export default ModalRecordatorio;

