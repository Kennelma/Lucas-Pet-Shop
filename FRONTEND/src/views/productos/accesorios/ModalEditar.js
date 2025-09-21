import React, { useState, useEffect } from 'react';

const ModalEditar = ({ isOpen, onClose, onSave, editData }) => {
  const [data, setData] = useState({ nombre: '', categoria: 'Collar', cantidad: 0, precio: 0, imagenUrl: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => { if (isOpen && editData) setData(editData); }, [isOpen, editData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files?.[0]) {
      const reader = new FileReader();
      reader.onload = () => setData(prev => ({ ...prev, imagenUrl: reader.result }));
      reader.readAsDataURL(files[0]);
    } else setData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!data.nombre?.trim()) newErrors.nombre = true;
    if (data.cantidad < 0) newErrors.cantidad = true;
    if (data.precio < 0) newErrors.precio = true;
    setErrors(newErrors);
    if (!Object.keys(newErrors).length && await onSave(data) !== false) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50" style={{marginLeft: 'var(--cui-sidebar-occupy-start, 0px)', marginRight: 'var(--cui-sidebar-occupy-end, 0px)'}}>
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-300">
          <h2 className="font-bold text-lg">EDITAR ACCESORIO</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="flex">
          <div className="flex-1 p-4 space-y-4">
            <div>
              <h6 className="text-sm font-semibold text-gray-700 mb-1">Tipo de Accesorio</h6>
              <select name="categoria" value={data.categoria} onChange={handleChange} disabled={!!editData} className={`w-full p-2 border rounded ${!!editData ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}>
                {['Collar','Correa','Juguete','Cama','Comedero','Transportadora','Higiene','Ropa'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <h6 className="text-sm font-semibold text-gray-700 mb-1">Nombre y Descripción</h6>
              <input name="nombre" value={data.nombre} onChange={handleChange} placeholder="Nombre y descripción" className={`w-full p-2 border rounded ${errors.nombre ? 'border-red-500' : ''}`} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <h6 className="text-sm font-semibold text-gray-700 mb-1">Stock</h6>
                <input type="number" name="cantidad" value={data.cantidad} onChange={handleChange} min="0" className={`w-full p-2 border rounded ${errors.cantidad ? 'border-red-500' : ''}`} />
              </div>
              <div>
                <h6 className="text-sm font-semibold text-gray-700 mb-1">Precio</h6>
                <input type="number" name="precio" value={data.precio} onChange={handleChange} step="0.01" min="0" className={`w-full p-2 border rounded ${errors.precio ? 'border-red-500' : ''}`} />
              </div>
            </div>

            <button type="submit" className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">Guardar</button>
          </div>

          <div className="w-48 border-l border-gray-300 p-4">
            {data.imagenUrl ? (
              <div>
                <img src={data.imagenUrl} alt="Producto" className="w-full h-32 object-cover border rounded mb-2" />
                <div className="text-center">
                  <span onClick={() => setData(prev => ({ ...prev, imagenUrl: '' }))} className="cursor-pointer text-lg hover:text-red-500">🗑️</span>
                </div>
              </div>
            ) : (
              <label className="w-full h-32 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer rounded bg-gray-50 text-sm text-gray-600 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center h-full w-full">
                  <span className="text-2xl mb-1">📷</span>
                  <span>Agregar imagen</span>
                </div>
                <input type="file" accept="image/*" onChange={handleChange} className="hidden" />
              </label>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditar;