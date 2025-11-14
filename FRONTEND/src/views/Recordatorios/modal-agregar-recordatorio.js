import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { insertarRecordatorio } from "../../AXIOS.SERVICES/reminders-axios";

const ModalRecordatorio = ({ isOpen, onClose, onGuardar, tipoServicio = [], frecuencias = [] }) => {
  const [tipoItem, setTipoItem] = useState('');
  const [frecuencia, setFrecuencia] = useState('');
  const [fechaProgramacion, setFechaProgramacion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Estados para errores individuales por campo
  const [errores, setErrores] = useState({
    tipoItem: false,
    frecuencia: false,
    fechaProgramacion: false,
    mensaje: false
  });

  // Al abrir el modal, por defecto usar la fecha/hora del sistema + 1 hora
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      now.setHours(now.getHours() + 1); // Agregar 1 hora para que sea fecha futura
      const pad = (n) => String(n).padStart(2, '0');
      const localDatetime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setFechaProgramacion(localDatetime);
    }
  }, [isOpen]);

  const limpiar = () => {
    setTipoItem('');
    setFrecuencia('');
    setFechaProgramacion('');
    setMensaje('');
    setErrorMsg('');
    setErrores({
      tipoItem: false,
      frecuencia: false,
      fechaProgramacion: false,
      mensaje: false
    });
  };

  // Intenta inferir el objeto recordatorio que devuelve tu backend
  const pickRecordatorio = (res) => {
    // Ajusta estas llaves a tu respuesta real si fuera necesario
    return (
      res?.recordatorio ??
      res?.Recordatorio ??
      res?.data ??
      res
    );
  };

  // Función para validar todos los campos
  const validarFormulario = () => {
    const nuevosErrores = {
      tipoItem: !tipoItem,
      frecuencia: !frecuencia,
      fechaProgramacion: !fechaProgramacion,
      mensaje: !mensaje.trim()
    };

    // Validación adicional para fecha (debe ser futura)
    if (fechaProgramacion) {
      const fechaSeleccionada = new Date(fechaProgramacion);
      const ahora = new Date();
      if (fechaSeleccionada <= ahora) {
        nuevosErrores.fechaProgramacion = true;
      }
    }

    setErrores(nuevosErrores);
    return !Object.values(nuevosErrores).some(error => error === true);
  };

  // Funciones para manejar cambios y limpiar errores
  const handleTipoItemChange = (value) => {
    setTipoItem(value);
    if (value) {
      setErrores(prev => ({ ...prev, tipoItem: false }));
    }
  };

  const handleFrecuenciaChange = (value) => {
    setFrecuencia(value);
    if (value) {
      setErrores(prev => ({ ...prev, frecuencia: false }));
    }
  };

  const handleFechaChange = (value) => {
    setFechaProgramacion(value);
    if (value) {
      const fechaSeleccionada = new Date(value);
      const ahora = new Date();
      if (fechaSeleccionada > ahora) {
        setErrores(prev => ({ ...prev, fechaProgramacion: false }));
      }
    }
  };

  const handleMensajeChange = (value) => {
    setMensaje(value);
    if (value.trim()) {
      setErrores(prev => ({ ...prev, mensaje: false }));
    }
  };

  const handleGuardar = async () => {
    setErrorMsg('');

    // Validar todos los campos
    if (!validarFormulario()) {
      return;
    }

     // CONVERTIR FORMATO DE FECHA
      const fechaFormateada = fechaProgramacion.replace('T', ' ') + ':00';

      const datosRegistro = {
        tipo_item: Number(tipoItem),
        frecuencia: Number(frecuencia),
        programada_para: fechaFormateada, // <-- Formato correcto
        mensaje: mensaje.trim(),
      };

    try {
      setSaving(true);
      const resultado = await insertarRecordatorio(datosRegistro);

      if (resultado?.error) {
        setErrorMsg(resultado.error);
        return;
      }

      const creado = pickRecordatorio(resultado) || datosRegistro;

      // Devuelve al padre el objeto creado
      onGuardar?.(creado);

      // Limpia y cierra
      limpiar();
      onClose?.();
    } catch (err) {
      console.error('Error al insertar recordatorio:', err);
      setErrorMsg(err?.message || 'Ocurrió un error inesperado al guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      header="Nuevo Recordatorio"
      visible={isOpen}
      style={{ width: '30rem' }}
      onHide={() => { limpiar(); onClose?.(); }}
      modal
    >
      <div className="flex flex-col gap-4">
        {errorMsg && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Recordatorio para clientes que han comprado: <span className="text-red-500">*</span>
          </label>
          <select
            className={`w-full border rounded px-3 py-2 text-sm ${errores.tipoItem ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            value={tipoItem}
            onChange={e => handleTipoItemChange(e.target.value)}
          >
            <option value="">Seleccionar tipo</option>
            {tipoServicio.map(t => (
              <option key={t.id_tipo_item_pk} value={t.id_tipo_item_pk}>
                {t.nombre_tipo_item}
              </option>
            ))}
          </select>
          {errores.tipoItem && <p className="text-xs text-red-600 mt-1">Este campo es obligatorio</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Frecuencia de envío del recordatorio: <span className="text-red-500">*</span>
          </label>
          <select
            className={`w-full border rounded px-3 py-2 text-sm ${errores.frecuencia ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            value={frecuencia}
            onChange={e => handleFrecuenciaChange(e.target.value)}
            disabled={frecuencias.length === 0}
          >
            <option value="">Seleccionar frecuencia</option>
            {frecuencias.map(f => (
              <option key={f.id_frecuencia_record_pk} value={f.id_frecuencia_record_pk}>
                {f.frecuencia_recordatorio}
              </option>
            ))}
          </select>
          {errores.frecuencia && <p className="text-xs text-red-600 mt-1">Este campo es obligatorio</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Fecha y hora para enviar recordatorio: <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            className={`w-full border rounded px-3 py-2 text-sm ${errores.fechaProgramacion ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            value={fechaProgramacion}
            onChange={e => handleFechaChange(e.target.value)}
            min={(() => {
              const now = new Date();
              const pad = (n) => String(n).padStart(2, '0');
              return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
            })()}
          />
          {errores.fechaProgramacion && <p className="text-xs text-red-600 mt-1">Selecciona una fecha y hora futura</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Mensaje <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`w-full border rounded px-3 py-2 text-sm ${errores.mensaje ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            value={mensaje}
            onChange={e => handleMensajeChange(e.target.value)}
            rows={3}
            placeholder="Escribe el mensaje que se enviará como recordatorio..."
          />
          {errores.mensaje && <p className="text-xs text-red-600 mt-1">El mensaje es obligatorio</p>}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button
            label="Cancelar"
            className="p-button-text"
            onClick={() => { limpiar(); onClose?.(); }}
            disabled={saving}
          />
          <Button
            label={saving ? "Guardando..." : "Guardar"}
            className="bg-green-800 hover:bg-green-900 text-white"
            onClick={handleGuardar}
            disabled={saving}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ModalRecordatorio;
