import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';

const ModalAgregar = ({ isOpen, onClose, onSave }) => {
  const [data, setData] = useState({ nombre: '', categoria: '', cantidad: 1, precio: 1, imagenUrl: '' });
  const [errors, setErrors] = useState({});

  const categorias = [
    { label: 'COLLAR', value: 'COLLAR' },
    { label: 'CORREA', value: 'CORREA' },
    { label: 'JUGUETE', value: 'JUGUETE' },
    { label: 'CAMA', value: 'CAMA' },
    { label: 'COMEDERO', value: 'COMEDERO' },
    { label: 'TRANSPORTADORA', value: 'TRANSPORTADORA' },
    { label: 'HIGIENE', value: 'HIGIENE' },
    { label: 'ROPA', value: 'ROPA' }
  ];
  
  useEffect(() => {
    if (isOpen) {
      setData({ nombre: '', categoria: '', cantidad: 1, precio: 1, imagenUrl: '' });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files?.[0]) {
      const reader = new FileReader();
      reader.onload = () => setData(prev => ({ ...prev, imagenUrl: reader.result }));
      reader.readAsDataURL(files[0]);
    } else {
      const newValue = name === 'nombre' ? value.toUpperCase() : value;
      setData(prev => ({ ...prev, [name]: newValue }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!data.nombre?.trim()) newErrors.nombre = true;
    if (!data.categoria) newErrors.categoria = true;
    if (data.cantidad < 0) newErrors.cantidad = true;
    if (data.precio <= 0) newErrors.precio = true;
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      await onSave(data);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50" style={{marginLeft: 'var(--cui-sidebar-occupy-start, 0px)', marginRight: 'var(--cui-sidebar-occupy-end, 0px)'}}>
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-300">
          <h2 className="font-bold text-lg">AGREGAR ACCESORIO</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>

        <div className="flex">
          <div className="flex-1 p-4 space-y-4">
            <div>
              <h6 className="text-sm font-semibold text-gray-700 mb-1">TIPO DE ACCESORIO</h6>
              <Dropdown
                name="categoria"
                value={data.categoria}
                options={categorias}
                onChange={(e) => setData(prev => ({ ...prev, categoria: e.value }))}
                placeholder="Seleccione un tipo"
                className={classNames('w-full', { 'p-invalid': errors.categoria })}
              />
            </div>

            <div>
              <h6 className="text-sm font-semibold text-gray-700 mb-1">NOMBRE Y DESCRIPCIÓN</h6>
              <InputText
                name="nombre"
                value={data.nombre}
                onChange={handleChange}
                placeholder="Nombre y descripción"
                className={classNames('w-full', { 'p-invalid': errors.nombre })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <h6 className="text-sm font-semibold text-gray-700 mb-1">STOCK</h6>
                <InputNumber
                  name="cantidad"
                  value={data.cantidad}
                  onValueChange={(e) => setData(prev => ({ ...prev, cantidad: e.value }))}
                  min={0}
                  className={classNames('w-full', { 'p-invalid': errors.cantidad })}
                  inputClassName="w-full"
                />
              </div>
              <div>
                <h6 className="text-sm font-semibold text-gray-700 mb-1">PRECIO</h6>
                <InputNumber
                  name="precio"
                  value={data.precio}
                  onValueChange={(e) => setData(prev => ({ ...prev, precio: e.value }))}
                  minFractionDigits={2}
                  maxFractionDigits={2}
                  min={0.01}
                  className={classNames('w-full', { 'p-invalid': errors.precio })}
                  inputClassName="w-full"
                />
              </div>
            </div>

            <Button 
              label="GUARDAR" 
              onClick={handleSubmit} 
              className="w-full p-button-success"
            />
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
                  <span>AGREGAR IMAGEN</span>
                </div>
                <input type="file" accept="image/*" onChange={handleChange} className="hidden" />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregar;