import React, { useState, useEffect } from 'react';

const ModalAgregar = ({ isOpen, onClose, onSave }) => {
  const [data, setData] = useState({nombre: '', categoria: 'Collar', cantidad: 0, precio: 0, imagenUrl: ''});
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (isOpen) {
      setData({nombre: '', categoria: 'Collar', cantidad: 0, precio: 0, imagenUrl: ''});
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
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
    if (data.cantidad < 0) newErrors.cantidad = 'Cantidad inválida';
    if (data.precio < 0) newErrors.precio = 'Precio inválido';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      const success = await onSave(data);
      if (success !== false) onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, marginLeft: 'var(--cui-sidebar-occupy-start, 0px)', marginRight: 'var(--cui-sidebar-occupy-end, 0px)'}}>
      <div style={{background: 'white', borderRadius: 8, width: '100%', maxWidth: 800, display: 'flex', flexDirection: 'column'}}>
        <div style={{padding: 16, borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between'}}>
          <h2>Agregar Accesorio</h2>
          <button onClick={onClose} style={{background: 'none', border: 'none', fontSize: 20}}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{display: 'flex'}}>
          <div style={{flex: 1, padding: 20}}>
            <div style={{marginBottom: 16}}>
              <label>Categoría:</label>
              <select name="categoria" value={data.categoria} onChange={handleChange} style={{width: '100%', padding: 8, border: '1px solid #ddd'}}>
                {['Collar', 'Correa', 'Juguete', 'Cama', 'Comedero', 'Transportadora', 'Higiene', 'Ropa'].map(cat => 
                  <option key={cat} value={cat}>{cat}</option>
                )}
              </select>
            </div>

            <div style={{marginBottom: 16}}>
              <label>Nombre:</label>
              <input name="nombre" value={data.nombre} onChange={handleChange} style={{width: '100%', padding: 8, border: errors.nombre ? '1px solid red' : '1px solid #ddd'}} />
              {errors.nombre && <div style={{color: 'red', fontSize: 12}}>{errors.nombre}</div>}
            </div>

            <div style={{display: 'flex', gap: 16, marginBottom: 16}}>
              <div style={{flex: 1}}>
                <label>Stock:</label>
                <input type="number" name="cantidad" value={data.cantidad} onChange={handleChange} min="0" style={{width: '100%', padding: 8, border: errors.cantidad ? '1px solid red' : '1px solid #ddd'}} />
                {errors.cantidad && <div style={{color: 'red', fontSize: 12}}>{errors.cantidad}</div>}
              </div>
              <div style={{flex: 1}}>
                <label>Precio:</label>
                <input type="number" name="precio" value={data.precio} onChange={handleChange} step="0.01" min="0" style={{width: '100%', padding: 8, border: errors.precio ? '1px solid red' : '1px solid #ddd'}} />
                {errors.precio && <div style={{color: 'red', fontSize: 12}}>{errors.precio}</div>}
              </div>
            </div>

            <button type="submit" style={{background: '#10b981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 4}}>Guardar</button>
          </div>

          <div style={{width: 250, borderLeft: '1px solid #ddd', padding: 20}}>
            {data.imagenUrl ? (
              <img src={data.imagenUrl} alt="Producto" style={{width: '100%', height: 150, objectFit: 'cover', border: '1px solid #ddd'}} />
            ) : (
              <div style={{width: '100%', height: 150, border: '2px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                Sin imagen
              </div>
            )}
            <div style={{display: 'flex', gap: 10, marginTop: 10}}>
              <label style={{cursor: 'pointer', fontSize: 20}}>
                📁
                <input type="file" accept="image/*" onChange={handleChange} style={{display: 'none'}} />
              </label>
              <span onClick={() => setData(prev => ({...prev, imagenUrl: ''}))} style={{cursor: 'pointer', fontSize: 20}}>🗑️</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAgregar;