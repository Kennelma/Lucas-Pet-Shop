import React, { useEffect, useState } from 'react';

const InventarioMedicamentos = () => {
  const [medicamentos, setMedicamentos] = useState([]);
  const [isDark, setIsDark] = useState(false);
  const [busquedaActual, setBusquedaActual] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(null); // ID del medicamento en edición

  // Estado del formulario simplificado
  const [formulario, setFormulario] = useState({
    nombre_producto: '',
    precio_unitario_producto: '',
    presentacion_medica: '',
    tipo_medicamento: '',
    codigo_lote: '',
    fecha_ingreso: '',
    fecha_vencimiento: '',
    cantidad_entrada: '',
    cantidad_disponible: ''
  });

  // Detectar tema oscuro
  useEffect(() => {
    const detectarTema = () => {
      const htmlElement = document.documentElement;
      const esTemaOscuro = htmlElement.getAttribute('data-coreui-theme') === 'dark';
      setIsDark(esTemaOscuro);
    };
    detectarTema();
  }, []);

  // Cargar medicamentos
  useEffect(() => {
    cargarMedicamentos();
  }, []);

  const cargarMedicamentos = async () => {
    setCargando(true);
    try {
      const response = await fetch('http://localhost:4000/api/medicamentos/ver-todos');
      const data = await response.json();
      setMedicamentos(data.datos || []);
    } catch (error) {
      console.error('Error al cargar medicamentos:', error);
      setMedicamentos([]);
    } finally {
      setCargando(false);
    }
  };

  const limpiarBusqueda = () => {
    setBusquedaActual('');
  };

  const limpiarFormulario = () => {
    setFormulario({
      nombre_producto: '',
      precio_unitario_producto: '',
      presentacion_medica: '',
      tipo_medicamento: '',
      codigo_lote: '',
      fecha_ingreso: '',
      fecha_vencimiento: '',
      cantidad_entrada: '',
      cantidad_disponible: ''
    });
    setEditando(null);
  };

  const manejarCambioFormulario = (campo, valor) => {
    setFormulario(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const iniciarEdicion = (medicamento) => {
    setFormulario({
      nombre_producto: medicamento.nombre_producto || '',
      precio_unitario_producto: medicamento.precio_unitario_producto || '',
      presentacion_medica: medicamento.presentacion_medica || '',
      tipo_medicamento: medicamento.tipo_medicamento || '',
      codigo_lote: medicamento.codigo_lote || '',
      fecha_ingreso: medicamento.fecha_ingreso || '',
      fecha_vencimiento: medicamento.fecha_vencimiento || '',
      cantidad_entrada: medicamento.cantidad_entrada || '',
      cantidad_disponible: medicamento.cantidad_disponible || ''
    });
    setEditando(medicamento.id_producto);
    setMostrarFormulario(true);
  };

  const agregarMedicamento = async () => {
    // Validar campos obligatorios
    if (!formulario.nombre_producto || !formulario.precio_unitario_producto || 
        !formulario.presentacion_medica || !formulario.tipo_medicamento) {
      alert('Por favor completa todos los campos obligatorios (*)');
      return;
    }

    setGuardando(true);

    try {
      // Preparar datos con valores fijos y automáticos
      const datosEnvio = {
        nombre_producto: formulario.nombre_producto,
        precio_unitario_producto: parseFloat(formulario.precio_unitario_producto),
        cantidad_en_stock: parseInt(formulario.cantidad_entrada) || 0,
        categoria: 'Medicamentos',
        id_categoria_item_fk: 2,
        presentacion_medica: formulario.presentacion_medica,
        tipo_medicamento: formulario.tipo_medicamento,
        codigo_lote: formulario.codigo_lote || null,
        fecha_ingreso: formulario.fecha_ingreso || null,
        fecha_vencimiento: formulario.fecha_vencimiento || null,
        cantidad_entrada: parseInt(formulario.cantidad_entrada) || null,
        cantidad_disponible: parseInt(formulario.cantidad_disponible) || parseInt(formulario.cantidad_entrada) || null
      };

      console.log('Enviando datos:', datosEnvio);

      const url = editando 
        ? `http://localhost:4000/api/medicamentos/editar/${editando}`
        : 'http://localhost:4000/api/medicamentos/agregar-sp';

      const response = await fetch(url, {
        method: editando ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosEnvio)
      });

      const resultado = await response.json();
      console.log('Respuesta del servidor:', resultado);

      if (response.ok) {
        alert(editando ? 'Medicamento actualizado exitosamente' : 'Medicamento agregado exitosamente');
        limpiarFormulario();
        setMostrarFormulario(false);
        cargarMedicamentos();
      } else {
        alert('Error: ' + (resultado.error || 'Error desconocido'));
        if (resultado.detalle) {
          console.error('Detalle del error:', resultado.detalle);
        }
      }
    } catch (error) {
      console.error('Error al procesar medicamento:', error);
      alert('Error de conexión al procesar medicamento');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarMedicamento = async (medicamento) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${medicamento.nombre_producto}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/medicamentos/eliminar/${medicamento.id_producto}`, {
        method: 'DELETE'
      });

      const resultado = await response.json();

      if (response.ok) {
        alert('Medicamento eliminado exitosamente');
        cargarMedicamentos();
      } else {
        alert('Error al eliminar: ' + (resultado.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error al eliminar medicamento:', error);
      alert('Error de conexión al eliminar medicamento');
    }
  };

  // Filtrar medicamentos
  const medicamentosFiltrados = medicamentos.filter(medicamento => {
    if (!busquedaActual) return true;
    const busquedaLower = busquedaActual.toLowerCase();
    return (
      medicamento.nombre_producto?.toLowerCase().includes(busquedaLower) ||
      medicamento.tipo_medicamento?.toLowerCase().includes(busquedaLower) ||
      medicamento.presentacion_medica?.toLowerCase().includes(busquedaLower)
    );
  });

  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: isDark ? '#111827' : '#ffffff',
      color: isDark ? '#ffffff' : '#000000',
      fontFamily: 'Arial, sans-serif'
    }}>
      
      {/* Header con botones */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          margin: 0,
          color: isDark ? '#ffffff' : '#333333'
        }}>
          INVENTARIO DE MEDICAMENTOS
        </h1>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              if (mostrarFormulario && editando) {
                limpiarFormulario();
              }
              setMostrarFormulario(!mostrarFormulario);
            }}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: mostrarFormulario ? '#dc2626' : '#16a34a',
              color: 'white',
              transition: 'all 0.2s'
            }}
          >
            {mostrarFormulario ? 'Cancelar' : 'Agregar Medicamento'}
          </button>
          
          <button
            onClick={cargarMedicamentos}
            disabled={cargando}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: cargando ? '#94a3b8' : '#2563eb',
              color: 'white',
              transition: 'all 0.2s'
            }}
          >
            {cargando ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <div style={{
          padding: '24px',
          marginBottom: '20px',
          backgroundColor: isDark ? '#374151' : '#f9fafb',
          border: `2px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
          borderRadius: '8px'
        }}>
          <h2 style={{ 
            margin: '0 0 20px 0', 
            fontSize: '20px',
            color: isDark ? '#ffffff' : '#1f2937'
          }}>
            {editando ? 'Editar Medicamento' : 'Agregar Nuevo Medicamento'}
          </h2>
          
          {/* INFORMACIÓN DEL MEDICAMENTO */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '12px',
              color: '#2563eb'
            }}>
              Información del Medicamento
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '16px' 
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '4px',
                  color: isDark ? '#d1d5db' : '#374151'
                }}>
                  Nombre del Medicamento *
                </label>
                <input
                  type="text"
                  value={formulario.nombre_producto}
                  onChange={(e) => manejarCambioFormulario('nombre_producto', e.target.value)}
                  placeholder="Ej: Amoxicilina 500mg"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: isDark ? '#4b5563' : 'white',
                    color: isDark ? 'white' : 'black',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '4px',
                  color: isDark ? '#d1d5db' : '#374151'
                }}>
                  Precio Unitario *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formulario.precio_unitario_producto}
                  onChange={(e) => manejarCambioFormulario('precio_unitario_producto', e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: isDark ? '#4b5563' : 'white',
                    color: isDark ? 'white' : 'black',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '4px',
                  color: isDark ? '#d1d5db' : '#374151'
                }}>
                  Presentación *
                </label>
                <select
                  value={formulario.presentacion_medica}
                  onChange={(e) => manejarCambioFormulario('presentacion_medica', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: isDark ? '#4b5563' : 'white',
                    color: isDark ? 'white' : 'black',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Seleccionar...</option>
                  <option value="bote">Bote</option>
                  <option value="jeringa">Jeringa</option>
                  <option value="pastilla">Pastilla</option>
                  <option value="tableta">Tableta</option>
                  <option value="capsula">Cápsula</option>
                  <option value="jarabe">Jarabe</option>
                  <option value="ampolla">Ampolla</option>
                  <option value="suspension">Suspensión</option>
                </select>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '4px',
                  color: isDark ? '#d1d5db' : '#374151'
                }}>
                  Tipo de Medicamento *
                </label>
                <select
                  value={formulario.tipo_medicamento}
                  onChange={(e) => manejarCambioFormulario('tipo_medicamento', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: isDark ? '#4b5563' : 'white',
                    color: isDark ? 'white' : 'black',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Seleccionar...</option>
                  <option value="antibiotico">Antibiótico</option>
                  <option value="desparasitantes">Desparasitantes</option>
                  <option value="vacunas">Vacunas</option>
                  <option value="analgesico">Analgésico</option>
                  <option value="antiinflamatorio">Antiinflamatorio</option>
                  <option value="antipiretico">Antipirético</option>
                  <option value="vitaminas">Vitaminas</option>
                  <option value="suplemento">Suplemento</option>
                  <option value="etc">Otros</option>
                </select>
              </div>
            </div>
          </div>

          {/* INFORMACIÓN DEL LOTE */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '12px',
              color: '#7c3aed'
            }}>
              Información del Lote
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '16px' 
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '4px',
                  color: isDark ? '#d1d5db' : '#374151'
                }}>
                  Código de Lote
                </label>
                <input
                  type="text"
                  value={formulario.codigo_lote}
                  onChange={(e) => manejarCambioFormulario('codigo_lote', e.target.value)}
                  placeholder="Ej: LOTE-2025-001"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: isDark ? '#4b5563' : 'white',
                    color: isDark ? 'white' : 'black',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '4px',
                  color: isDark ? '#d1d5db' : '#374151'
                }}>
                  Fecha de Ingreso
                </label>
                <input
                  type="date"
                  value={formulario.fecha_ingreso}
                  onChange={(e) => manejarCambioFormulario('fecha_ingreso', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: isDark ? '#4b5563' : 'white',
                    color: isDark ? 'white' : 'black',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '4px',
                  color: isDark ? '#d1d5db' : '#374151'
                }}>
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  value={formulario.fecha_vencimiento}
                  onChange={(e) => manejarCambioFormulario('fecha_vencimiento', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: isDark ? '#4b5563' : 'white',
                    color: isDark ? 'white' : 'black',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '4px',
                  color: isDark ? '#d1d5db' : '#374151'
                }}>
                  Cantidad Recibida
                </label>
                <input
                  type="number"
                  value={formulario.cantidad_entrada}
                  onChange={(e) => {
                    manejarCambioFormulario('cantidad_entrada', e.target.value);
                    if (!editando && (!formulario.cantidad_disponible || formulario.cantidad_disponible === formulario.cantidad_entrada)) {
                      manejarCambioFormulario('cantidad_disponible', e.target.value);
                    }
                  }}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: isDark ? '#4b5563' : 'white',
                    color: isDark ? 'white' : 'black',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '4px',
                  color: isDark ? '#d1d5db' : '#374151'
                }}>
                  Cantidad Disponible
                </label>
                <input
                  type="number"
                  value={formulario.cantidad_disponible}
                  onChange={(e) => manejarCambioFormulario('cantidad_disponible', e.target.value)}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: isDark ? '#4b5563' : 'white',
                    color: isDark ? 'white' : 'black',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* BOTONES */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={agregarMedicamento}
              disabled={guardando}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                cursor: guardando ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: guardando ? '#94a3b8' : '#16a34a',
                color: 'white',
                transition: 'all 0.2s'
              }}
            >
              {guardando ? 'Guardando...' : (editando ? 'Actualizar Medicamento' : 'Guardar Medicamento')}
            </button>
            
            <button
              onClick={limpiarFormulario}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: '#6b7280',
                color: 'white',
                transition: 'all 0.2s'
              }}
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Búsqueda */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={busquedaActual}
          onChange={(e) => setBusquedaActual(e.target.value)}
          placeholder="Buscar medicamento..."
          style={{
            padding: '8px 12px',
            width: '240px',
            marginRight: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: isDark ? '#374151' : 'white',
            color: isDark ? 'white' : 'black'
          }}
        />
        {busquedaActual && (
          <button
            onClick={limpiarBusqueda}
            style={{
              padding: '8px 12px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Lista de medicamentos */}
      {cargando ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h3>Cargando medicamentos...</h3>
        </div>
      ) : medicamentosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💊</div>
          <h3>{busquedaActual ? 'No se encontraron medicamentos' : 'No hay medicamentos'}</h3>
          <p>
            {busquedaActual 
              ? `No hay medicamentos que coincidan con "${busquedaActual}"` 
              : 'No hay medicamentos en la base de datos'
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {medicamentosFiltrados.map((medicamento, index) => {
            const stockBajo = medicamento.cantidad_en_stock < 10;
            const precio = parseFloat(medicamento.precio_unitario_producto || 0);
            
            return (
              <div
                key={index}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: `2px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
                  backgroundColor: isDark ? '#374151' : 'white',
                  transition: 'all 0.3s',
                  position: 'relative'
                }}
              >
                {/* Botones de acción */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  display: 'flex',
                  gap: '4px'
                }}>
                  <button
                    onClick={() => iniciarEdicion(medicamento)}
                    style={{
                      padding: '4px 8px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      backgroundColor: '#f59e0b',
                      color: 'white'
                    }}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => eliminarMedicamento(medicamento)}
                    style={{
                      padding: '4px 8px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      backgroundColor: '#ef4444',
                      color: 'white'
                    }}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>

                <div style={{ fontSize: '32px', marginBottom: '12px' }}>💊</div>
                
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                  marginBottom: '8px',
                  color: isDark ? '#ffffff' : '#1f2937',
                  paddingRight: '60px'
                }}>
                  {medicamento.nombre_producto}
                </div>
                
                <div style={{ fontSize: '12px', marginBottom: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: isDark ? '#1e40af' : '#dbeafe',
                    color: isDark ? '#bfdbfe' : '#1e40af',
                    marginRight: '4px'
                  }}>
                    {medicamento.presentacion_medica}
                  </span>
                  <br style={{ marginBottom: '4px' }} />
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: isDark ? '#166534' : '#dcfce7',
                    color: isDark ? '#bbf7d0' : '#166534'
                  }}>
                    {medicamento.tipo_medicamento}
                  </span>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: stockBajo ? '#ef4444' : (isDark ? '#d1d5db' : '#374151'),
                    marginBottom: '8px'
                  }}>
                    Stock: {medicamento.cantidad_en_stock}
                    {stockBajo && ' ⚠️'}
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: isDark ? '#60a5fa' : '#2563eb'
                  }}>
                    L. {precio.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InventarioMedicamentos;