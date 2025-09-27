import React, { useState, useEffect } from 'react';

const ModalNuevoAlimento = ({ isOpen, onClose, onSave }) => {
  const [data, setData] = useState({nombre: '', destino: 'PERROS', cantidad: 1, precio: 1, peso: 0.1, imagenUrl: ''});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setData({nombre: '', destino: 'PERROS', cantidad: 1, precio: 1, peso: 0.1, imagenUrl: ''});
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => setData(prev => ({ ...prev, imagenUrl: reader.result }));
      reader.readAsDataURL(files[0]);
    } else {
      setData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!data.nombre.trim()) newErrors.nombre = 'Nombre requerido';
    if (data.cantidad <= 0) newErrors.cantidad = 'Stock inválido';
    if (data.precio <= 0) newErrors.precio = 'Precio inválido';
    if (data.peso <= 0) newErrors.peso = 'Peso inválido';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      const success = await onSave(data);
      if (success !== false) onClose();
    }
  };

  if (!isOpen) return null;

  const destinos = ['PERROS', 'GATOS', 'TORTUGAS', 'CANARIOS', 'CONEJOS'];

  return (
    <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16}}>
      <div style={{background: 'white', borderRadius: 8, width: '100%', maxWidth: 800, display: 'flex', flexDirection: 'column'}}>
        <div style={{padding: 16, borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2 style={{margin: 0, flex: 1, textAlign: 'center'}}>AGREGAR ALIMENTO</h2>
          <button onClick={onClose} style={{background: 'none', border: 'none', fontSize: 20, cursor: 'pointer'}}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{display: 'flex'}}>
          <div style={{flex: 1, padding: 20}}>
            <div style={{marginBottom: 16}}>
              <label>Nombre:</label>
              <input name="nombre" value={data.nombre} onChange={handleChange} style={{width: '100%', padding: 8, border: errors.nombre ? '1px solid red' : '1px solid #ddd'}}/>
              {errors.nombre && <div style={{color: 'red', fontSize: 12}}>{errors.nombre}</div>}
            </div>

            <div style={{marginBottom: 16}}>
              <label>Alimento destinado:</label>
              <select name="destino" value={data.destino} onChange={handleChange} style={{width: '100%', padding: 8, border: '1px solid #ddd'}}>
                {destinos.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div style={{display: 'flex', gap: 16, marginBottom: 16}}>
              <div style={{flex: 1}}>
                <label>Stock:</label>
                <input type="number" name="cantidad" value={data.cantidad} onChange={handleChange} style={{width: '100%', padding: 8, border: errors.cantidad ? '1px solid red' : '1px solid #ddd'}}/>
                {errors.cantidad && <div style={{color: 'red', fontSize: 12}}>{errors.cantidad}</div>}
              </div>
              <div style={{flex: 1}}>
                <label>Precio:</label>
                <input type="number" name="precio" value={data.precio} onChange={handleChange} step="0.01" style={{width: '100%', padding: 8, border: errors.precio ? '1px solid red' : '1px solid #ddd'}}/>
                {errors.precio && <div style={{color: 'red', fontSize: 12}}>{errors.precio}</div>}
              </div>
            </div>

            <div style={{marginBottom: 16}}>
              <label>Peso (kg):</label>
              <input type="number" name="peso" value={data.peso} onChange={handleChange} step="0.01" style={{width: '100%', padding: 8, border: errors.peso ? '1px solid red' : '1px solid #ddd'}}/>
              {errors.peso && <div style={{color: 'red', fontSize: 12}}>{errors.peso}</div>}
            </div>

            <div style={{textAlign: 'center'}}>
              <button type="submit" style={{background: '#4bc099ff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 4, cursor: 'pointer'}}>Guardar</button>
            </div>
          </div>

          <div style={{width: 250, borderLeft: '1px solid #ddd', padding: 20}}>
            {data.imagenUrl ? (
              <>
                <img src={data.imagenUrl} alt="Alimento" style={{width: '100%', height: 150, objectFit: 'cover', border: '1px solid #ddd'}}/>
                <div style={{display: 'flex', justifyContent: 'center', marginTop: 10}}>
                  <span onClick={() => setData(prev => ({...prev, imagenUrl: ''}))} style={{cursor: 'pointer', fontSize: 20}}>🗑️</span>
                </div>
              </>
            ) : (
              <label style={{width: '100%', height: 150, border: '2px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: 4, backgroundColor: '#f9f9f9', fontSize: 14, color: '#666'}}>
                Agregar imagen
                <input type="file" accept="image/*" onChange={handleChange} style={{display: 'none'}}/>
              </label>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNuevoAlimento;
