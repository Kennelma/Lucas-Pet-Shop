import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import Swal from "sweetalert2";
import { actualizarRecordatorio } from "../../AXIOS.SERVICES/reminder";

const ModalActualizar = ({
  visible,
  onHide,
  recordatorioSeleccionado, // ✅ Puede ser null o undefined
  tiposItems,
  frecuencias,
  onReload
}) => {
  const [formData, setFormData] = useState({
    id_recordatorio_pk: "",
    mensaje_recordatorio: "",
    id_tipo_item_fk: "",
    id_frecuencia_fk: ""
  });

  const [loading, setLoading] = useState(false);

  // 🔹 Cargar datos SOLO si recordatorioSeleccionado existe
  useEffect(() => {
    if (recordatorioSeleccionado && visible) {
      console.log("📥 Recordatorio seleccionado:", recordatorioSeleccionado);
      setFormData({
        id_recordatorio_pk: recordatorioSeleccionado.id_recordatorio_pk || "",
        mensaje_recordatorio: recordatorioSeleccionado.mensaje_recordatorio || "",
        id_tipo_item_fk: recordatorioSeleccionado.id_tipo_item_fk || "",
        id_frecuencia_fk: recordatorioSeleccionado.id_frecuencia_fk || ""
      });
    }
  }, [recordatorioSeleccionado, visible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'mensaje_recordatorio' ? value.toUpperCase() : value
    }));
  };

  const validarCampos = () => {
    if (!formData.mensaje_recordatorio?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Mensaje requerido",
        text: "El campo mensaje no puede estar vacío."
      });
      return false;
    }

    if (!formData.id_tipo_item_fk) {
      Swal.fire({
        icon: "warning",
        title: "Tipo de servicio requerido",
        text: "Debe seleccionar un tipo de servicio."
      });
      return false;
    }

    if (!formData.id_frecuencia_fk) {
      Swal.fire({
        icon: "warning",
        title: "Frecuencia requerida",
        text: "Debe seleccionar una frecuencia."
      });
      return false;
    }

    return true;
  };

  const handleActualizar = async () => {
    if (!validarCampos()) return;

    setLoading(true);
const datosEnviar = {
  id_recordatorio_pk: formData.id_recordatorio_pk, // 👈 mismo nombre que en la DB
  mensaje_recordatorio: formData.mensaje_recordatorio.trim(),
  ultimo_envio: null,
  proximo_envio: null, // 👈 también existe en la tabla
  intentos: 0, // 👈 default 0
  id_estado_programacion_fk: null,
  id_tipo_item_fk: parseInt(formData.id_tipo_item_fk),
  id_frecuencia_fk: parseInt(formData.id_frecuencia_fk)
};


    console.log("📤 Payload enviado:", datosEnviar);

    try {
      const response = await actualizarRecordatorio(datosEnviar);

      console.log("✅ Respuesta del servidor:", response);

      if (response?.Consulta) {
        Swal.fire({
          icon: "success",
          title: "¡Actualizado!",
          text: "El recordatorio fue actualizado correctamente",
          timer: 2000,
          showConfirmButton: false
        });
        
        onHide();
        
        if (onReload) {
          setTimeout(() => {
            onReload();
          }, 500);
        }
      } else {
        throw new Error(response?.error || "Error desconocido al actualizar");
      }

    } catch (error) {
      console.error("❌ Error completo:", error);
      
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        html: `
          <p>${error.message || 'Error desconocido'}</p>
          <p class="text-sm text-gray-500 mt-2">Revisa la consola para más detalles</p>
        `
      });
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3 mt-2">
      <Button 
        label="Cancelar" 
        icon="pi pi-times" 
        className="p-button-text p-button-rounded" 
        onClick={onHide} 
        disabled={loading}
      />
      <Button 
        label={loading ? 'Actualizando...' : 'Actualizar'} 
        icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"} 
        className="p-button-success p-button-rounded" 
        onClick={handleActualizar}
        loading={loading}
        disabled={loading}
      />
    </div>
  );

  // ✅ No renderizar si no hay recordatorio seleccionado
  if (!recordatorioSeleccionado) {
    return null;
  }

  return (
    <Dialog
      header={
        <div className="w-full text-center text-lg font-bold">
          EDITAR RECORDATORIO #{formData.id_recordatorio_pk}
        </div>
      }
      visible={visible}
      style={{ width: '32rem', borderRadius: '1.5rem' }}
      modal
      closable={false}
      footer={footer}
      onHide={onHide}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
    >
      <div className="mt-2">
        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="id_tipo_item_fk" className="text-xs font-semibold text-gray-700 mb-1 block">
              DESTINADO A CLIENTES QUE COMPRARON <span className="text-red-600">*</span>
            </label>
            <select
              id="id_tipo_item_fk"
              name="id_tipo_item_fk"
              value={formData.id_tipo_item_fk || ''}
              onChange={handleChange}
              className="w-full rounded-xl h-9 px-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || tiposItems.length === 0}
            >
              <option value="">-- Seleccionar servicio --</option>
              {tiposItems.map(t => (
                <option key={t.id_tipo_item_pk} value={t.id_tipo_item_pk}>
                  {t.nombre_tipo_item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="id_frecuencia_fk" className="text-xs font-semibold text-gray-700 mb-1 block">
              FRECUENCIA <span className="text-red-600">*</span>
            </label>
            <select
              id="id_frecuencia_fk"
              name="id_frecuencia_fk"
              value={formData.id_frecuencia_fk || ''}
              onChange={handleChange}
              className="w-full rounded-xl h-9 px-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || frecuencias.length === 0}
            >
              <option value="">-- Seleccionar frecuencia --</option>
              {frecuencias.map(f => (
                <option key={f.id_frecuencia_record_pk} value={f.id_frecuencia_record_pk}>
                  {f.frecuencia_recordatorio}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mensaje_recordatorio" className="text-xs font-semibold text-gray-700 mb-1 block">
              MENSAJE DEL RECORDATORIO <span className="text-red-600">*</span>
            </label>
            <InputTextarea
              id="mensaje_recordatorio"
              name="mensaje_recordatorio"
              value={formData.mensaje_recordatorio}
              onChange={handleChange}
              placeholder="Escribe el mensaje que llegará a tus clientes..."
              rows={4}
              className="w-full rounded-xl text-sm"
              style={{ textTransform: 'uppercase' }}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ModalActualizar;