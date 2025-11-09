import React, { useState, useEffect } from "react";
import { ver, insertar } from "../../../AXIOS.SERVICES/empresa-axios.js";

export default function ModalNuevoUsuario({ onClose, onUsuarioAgregado }) {
  const [form, setForm] = useState({
    usuario: "",
    email_usuario: "",
    contrasena_usuario: "",
    id_sucursal_fk: "",
  });

  const [sucursales, setSucursales] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Cargar sucursales
  useEffect(() => {
    const cargarSucursales = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await ver("SUCURSALES");
        
        if (Array.isArray(data)) {
          setSucursales(data);
        } else if (data?.entidad && Array.isArray(data.entidad)) {
          setSucursales(data.entidad);
        } else {
          setSucursales([]);
          setError("No se pudieron cargar las sucursales.");
        }
      } catch (err) {
        console.error("Error cargando sucursales:", err);
        setError(err.message || "Error al cargar sucursales");
      } finally {
        setLoading(false);
      }
    };
    cargarSucursales();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "id_sucursal_fk" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!form.id_sucursal_fk) {
      setError("Debe seleccionar una sucursal.");
      return;
    }

    if (form.contrasena_usuario.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await insertar("USUARIOS", form);
      
      if (response?.Consulta || response?.success) {
        setMsg(response?.mensaje || "Usuario creado con éxito ✅");
        setForm({
          usuario: "",
          email_usuario: "",
          contrasena_usuario: "",
          id_sucursal_fk: "",
        });
        
        onUsuarioAgregado(); //GUARDA LOS USUARIOS 
        onClose(); 

      } else {
        throw new Error(response?.error || "No se pudo crear el usuario.");
      }
    } catch (err) {
      console.error("Error creando usuario:", err);
      setError(err.message || "Error al crear usuario");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Usuario */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de usuario
        </label>
        <input
          type="text"
          name="usuario"
          value={form.usuario}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Ej: juan.perez"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="email_usuario"
          value={form.email_usuario}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Ej: juan@example.com"
          required
        />
      </div>

      {/* Contraseña */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <input
          type="password"
          name="contrasena_usuario"
          value={form.contrasena_usuario}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Mínimo 6 caracteres"
          required
          minLength={6}
        />
      </div>

      {/* Sucursal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sucursal
        </label>
        {loading ? (
          <p className="text-gray-500 text-sm mt-2">Cargando sucursales...</p>
        ) : error && sucursales.length === 0 ? (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        ) : (
          <select
            name="id_sucursal_fk"
            value={form.id_sucursal_fk}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          >
            <option value="">-- Selecciona una sucursal --</option>
            {sucursales.map((s) => (
              <option key={s.id_sucursal_pk} value={s.id_sucursal_pk}>
                {s.nombre_sucursal} {s.nombre_empresa && `(${s.nombre_empresa})`}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Mensajes */}
      {msg && <p className="text-green-600 font-medium text-sm">{msg}</p>}
      {error && !loading && <p className="text-red-600 font-medium text-sm">{error}</p>}

      {/* Botón */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || loading}
        className="w-full bg-blue-600 disabled:opacity-60 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      >
        {submitting ? "Guardando..." : "Guardar usuario"}
      </button>
    </div>
  );
}