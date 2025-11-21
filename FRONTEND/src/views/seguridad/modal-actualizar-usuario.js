import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { verRolesUsuarios, verSucursales, verEstadosUsuarios, actualizarUsuario } from "../../AXIOS.SERVICES/security-axios.js";

export default function ModalActualizarUsuario({ usuarioData, onClose, onUsuarioActualizado }) {
  const [form, setForm] = useState({
    id_usuario_pk: "",
    usuario: "",
    email_usuario: "",
    contrasena_usuario: "", 
    id_rol_fk: "",
    id_sucursal_fk: "",
    cat_estado_fk: ""
  });

  const [roles, setRoles] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [estados, setEstados] = useState([]);
  const [msg, setMsg] = useState("");
  const [errores, setErrores] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      setErrores({});
      try {
        const responseRoles = await verRolesUsuarios();
        const rolesData = responseRoles?.datos || responseRoles?.entidad || responseRoles || [];
        setRoles(Array.isArray(rolesData) ? rolesData : []);

        try {
          const responseSucursales = await verSucursales();
          const sucursalesData = responseSucursales?.datos || responseSucursales?.entidad || responseSucursales || [];
          setSucursales(Array.isArray(sucursalesData) ? sucursalesData : []);
        } catch (errSuc) {
          console.warn("No se pudieron cargar sucursales:", errSuc);
          setSucursales([]);
        }

        try {
          const responseEstados = await verEstadosUsuarios();
          const estadosData = responseEstados?.datos || responseEstados?.entidad || responseEstados || [];
          setEstados(Array.isArray(estadosData) ? estadosData : []);
        } catch (errEst) {
          console.warn("No se pudieron cargar estados:", errEst);
          setEstados([]);
        }
      } catch (err) {
        console.error("Error cargando roles:", err);
        setErrores({ general: err.message || "Error al cargar roles" });
      }
    };
    cargarDatos();
  }, []);

  // Cargar datos del usuario a editar
  useEffect(() => {
    if (usuarioData) {
      setForm({
        id_usuario_pk: usuarioData.id_usuario_pk || "",
        usuario: usuarioData.usuario || "",
        email_usuario: usuarioData.email_usuario || "",
        contrasena_usuario: "", // VACÍO - no se precarga la contraseña
        id_rol_fk: usuarioData.id_rol_fk || "",
        id_sucursal_fk: usuarioData.id_sucursal_fk || "",
        cat_estado_fk: usuarioData.cat_estado_fk || ""
      });
    }
  }, [usuarioData]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: (field === "id_rol_fk" || field === "id_sucursal_fk") ? Number(value) : value
    }));
    // Limpiar error del campo
    if (errores[field]) {
      setErrores((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErrores({});

    // Validaciones
    const newErrors = {};

    if (!form.usuario.trim()) {
      newErrors.usuario = "El nombre de usuario es requerido.";
    }

    if (!form.email_usuario.trim() || !/\S+@\S+\.\S+/.test(form.email_usuario)) {
      newErrors.email_usuario = "Ingrese un email válido.";
    }

    if (!form.id_rol_fk) {
      newErrors.id_rol_fk = "Debe seleccionar un rol.";
    }

    if (!form.id_sucursal_fk) {
      newErrors.id_sucursal_fk = "Debe seleccionar una sucursal.";
    }

    // Solo validar contraseña si se proporciona una nueva
    if (form.contrasena_usuario && form.contrasena_usuario.length < 6) {
      newErrors.contrasena_usuario = "La contraseña debe tener al menos 6 caracteres.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrores(newErrors);
      return;
    }

    try {
      setSubmitting(true);

      const datosUsuario = {
        id_usuario_pk: form.id_usuario_pk,
        usuario: form.usuario.trim(),
        email_usuario: form.email_usuario.trim(),
        id_rol_fk: Number(form.id_rol_fk),
        id_sucursal_fk: Number(form.id_sucursal_fk),
        cat_estado_fk: form.cat_estado_fk || null
      };

      // Solo incluir contraseña si se proporcionó una nueva
      if (form.contrasena_usuario && form.contrasena_usuario.trim() !== '') {
        datosUsuario.contrasena_usuario = form.contrasena_usuario;
      }

      console.log("📤 Enviando datos de actualización:", datosUsuario);

      const response = await actualizarUsuario(datosUsuario);

      console.log("📥 Respuesta del servidor:", response);

      if (response?.Consulta === true) {
        if (onUsuarioActualizado) onUsuarioActualizado();
        if (onClose) onClose();

      } else {
        throw new Error(response?.mensaje || response?.error || "No se pudo actualizar el usuario.");
      }
    } catch (err) {
      console.error("❌ Error actualizando usuario:", err);
      const errorMsg = err.response?.data?.mensaje || err.response?.data?.error || err.message || "Error al actualizar usuario";
      setErrores({ general: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        onClick={onClose}
        className="p-button-text"
        disabled={submitting}
      />
      <Button
        label={submitting ? "Actualizando..." : "Actualizar"}
        icon="pi pi-check"
        onClick={handleSubmit}
        disabled={submitting}
        className="p-button-success"
      />
    </div>
  );

  return (
    <Dialog
      header={<div className="w-full text-center text-lg font-bold" id="modal-title">EDITAR USUARIO</div>}
      visible={true}
      style={{ width: '28rem', borderRadius: '1.5rem' }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
      position="center"
      dismissableMask={true}
      draggable={false}
      resizable={false}
      blockScroll={true}
      focusOnShow={true}
      aria-labelledby="modal-title"
      aria-describedby="modal-content"
      keepInViewport={true}
    >
      <div id="modal-content" className="flex flex-col gap-3" role="form" aria-label="Formulario de edición de usuario">
        {/* Usuario */}
        <div className="form-field">
          <label htmlFor="usuario" className="text-xs font-semibold text-gray-700 mb-1 block">USUARIO *</label>
          <InputText
            id="usuario"
            name="usuario"
            value={form.usuario}
            onChange={(e) => handleChange('usuario', e.target.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Ej: juan.perez"
            aria-required="true"
            aria-invalid={!!errores.usuario}
            aria-describedby={errores.usuario ? "usuario-error" : undefined}
            autoFocus
          />
          {errores.usuario && (
            <p id="usuario-error" className="text-xs text-red-600 mt-1" role="alert" aria-live="polite">
              {errores.usuario}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="form-field">
          <label htmlFor="email_usuario" className="text-xs font-semibold text-gray-700 mb-1 block">EMAIL *</label>
          <InputText
            id="email_usuario"
            name="email_usuario"
            type="email"
            value={form.email_usuario}
            onChange={(e) => handleChange('email_usuario', e.target.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Ej: juan@example.com"
            aria-required="true"
            aria-invalid={!!errores.email_usuario}
            aria-describedby={errores.email_usuario ? "email-error" : undefined}
          />
          {errores.email_usuario && (
            <p id="email-error" className="text-xs text-red-600 mt-1" role="alert" aria-live="polite">
              {errores.email_usuario}
            </p>
          )}
        </div>

        {/* Contraseña - OPCIONAL para actualizar */}
        <div className="form-field">
          <label htmlFor="contrasena_usuario" className="text-xs font-semibold text-gray-700 mb-1 block">
            NUEVA CONTRASEÑA (Opcional)
          </label>
          <InputText
            id="contrasena_usuario"
            name="contrasena_usuario"
            type="password"
            value={form.contrasena_usuario}
            onChange={(e) => handleChange('contrasena_usuario', e.target.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Dejar vacío para mantener la actual"
            aria-invalid={!!errores.contrasena_usuario}
            aria-describedby={errores.contrasena_usuario ? "contrasena-error" : undefined}
          />
          {errores.contrasena_usuario && (
            <p id="contrasena-error" className="text-xs text-red-600 mt-1" role="alert" aria-live="polite">
              {errores.contrasena_usuario}
            </p>
          )}
        </div>

        {/* Rol */}
        <div className="form-field">
          <label htmlFor="id_rol_fk" className="text-xs font-semibold text-gray-700 mb-1 block">ROL *</label>
          <Dropdown
            id="id_rol_fk"
            value={form.id_rol_fk}
            options={roles}
            onChange={(e) => handleChange('id_rol_fk', e.value)}
            optionLabel="tipo_rol"
            optionValue="id_rol_pk"
            placeholder="-- Selecciona un rol --"
            className="w-full text-sm"
            aria-required="true"
            aria-invalid={!!errores.id_rol_fk}
            aria-describedby={errores.id_rol_fk ? "rol-error" : undefined}
          />
          {errores.id_rol_fk && (
            <p id="rol-error" className="text-xs text-red-600 mt-1" role="alert" aria-live="polite">
              {errores.id_rol_fk}
            </p>
          )}
        </div>

        {/* Sucursal */}
        <div className="form-field">
          <label htmlFor="id_sucursal_fk" className="text-xs font-semibold text-gray-700 mb-1 block">SUCURSAL *</label>
          <Dropdown
            id="id_sucursal_fk"
            value={form.id_sucursal_fk}
            options={sucursales}
            onChange={(e) => handleChange('id_sucursal_fk', e.value)}
            optionLabel="nombre_sucursal"
            optionValue="id_sucursal_pk"
            placeholder="-- Selecciona una sucursal --"
            className="w-full text-sm"
            aria-required="true"
            aria-invalid={!!errores.id_sucursal_fk}
            aria-describedby={errores.id_sucursal_fk ? "sucursal-error" : undefined}
          />
          {errores.id_sucursal_fk && (
            <p id="sucursal-error" className="text-xs text-red-600 mt-1" role="alert" aria-live="polite">
              {errores.id_sucursal_fk}
            </p>
          )}
        </div>

        {/* Estado */}
        <div className="form-field">
          <label htmlFor="cat_estado_fk" className="text-xs font-semibold text-gray-700 mb-1 block">ESTADO *</label>
          <Dropdown
            id="cat_estado_fk"
            value={form.cat_estado_fk}
            options={estados}
            onChange={(e) => handleChange('cat_estado_fk', e.value)}
            optionLabel="nombre_estado"
            optionValue="id_estado_pk"
            placeholder="-- Selecciona un estado --"
            className="w-full text-sm"
            aria-required="true"
            aria-invalid={!!errores.cat_estado_fk}
            aria-describedby={errores.cat_estado_fk ? "estado-error" : undefined}
          />
          {errores.cat_estado_fk && (
            <p id="estado-error" className="text-xs text-red-600 mt-1" role="alert" aria-live="polite">
              {errores.cat_estado_fk}
            </p>
          )}
        </div>

        {/* Mensajes */}
        {msg && <p className="text-green-600 font-medium text-sm text-center">{msg}</p>}
        {errores.general && <p className="text-red-600 font-medium text-sm text-center">{errores.general}</p>}
      </div>
    </Dialog>
  );
}
