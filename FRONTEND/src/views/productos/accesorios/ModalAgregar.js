import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';

const ModalAgregar = ({ isOpen, onClose, onSave }) => {
  const [data, setData] = useState({ 
    nombre: '', 
    categoria: 'COLLAR', 
    cantidad: 1, 
    precio: 1, 
    imagenUrl: '',  // Se almacena como base64
    activo: true
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

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
      setData({ 
        nombre: '', 
        categoria: 'COLLAR', 
        cantidad: 1, 
        precio: 1, 
        imagenUrl: '', 
        activo: true 
      });
      setErrors({});
    }
  }, [isOpen]);

  // ⚡ Convierte archivo a Base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setData(prev => ({ ...prev, imagenUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'nombre' ? value.toUpperCase() : value;
    setData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleDropdownChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!data.nombre?.trim()) newErrors.nombre = true;
    if (!data.categoria) newErrors.categoria = true;
    if (data.cantidad == null || data.cantidad < 0) newErrors.cantidad = true;
    if (data.precio == null || data.precio <= 0) newErrors.precio = true;
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      const resultado = await onSave(data);
      setLoading(false);
      if (resultado !== false) onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50"
      style={{marginLeft: 'var(--cui-sidebar-occupy-start, 0px)', marginRight: 'var(--cui-sidebar-occupy-end, 0px)'}}
    >
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-300">
          <h2 className="font-bold text-lg">AGREGAR ACCESORIO</h2>
          <button onClick={onClose} className="text-2xl" disabled={loading}>&times;</button>
        </div>

        <div className="flex">
          <div className="flex-1 p-4 space-y-4">
            <div>
              <h6 className="text-sm font-semibold text-gray-700 mb-1">TIPO DE ACCESORIO</h6>
              <Dropdown
                value={data.categoria}
                options={categorias}
                onChange={(e) => handleDropdownChange('categoria', e.value)}
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
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <h6 className="text-sm font-semibold text-gray-700 mb-1">STOCK</h6>
                <InputNumber
                  value={data.cantidad}
                  onValueChange={(e) => setData(prev => ({ ...prev, cantidad: e.value }))}
                  min={0}
                  className={classNames('w-full', { 'p-invalid': errors.cantidad })}
                  inputClassName="w-full"
                  disabled={loading}
                />
              </div>
              <div>
                <h6 className="text-sm font-semibold text-gray-700 mb-1">PRECIO</h6>
                <InputNumber
                  value={data.precio}
                  onValueChange={(e) => setData(prev => ({ ...prev, precio: e.value }))}
                  minFractionDigits={2}
                  maxFractionDigits={2}
                  min={0.01}
                  className={classNames('w-full', { 'p-invalid': errors.precio })}
                  inputClassName="w-full"
                  disabled={loading}
                />
              </div>
            </div>

            <Button 
              label={loading ? "GUARDANDO..." : "GUARDAR"} 
              onClick={handleSubmit} 
              className="w-full p-button-success"
              loading={loading}
              disabled={loading}
            />
          </div>

          {/* Panel de imagen */}
          <div className="w-48 border-l border-gray-300 p-4">
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-all cursor-pointer h-32"
              onClick={() => !loading && fileInputRef.current?.click()}
            >
              {data.imagenUrl ? (
                <img 
                  src={data.imagenUrl} 
                  alt="preview" 
                  className="h-full w-full object-contain rounded-lg" 
                />
              ) : (
                <>
                  <i className="pi pi-image text-3xl text-gray-400 mb-2"></i>
                  <p className="text-gray-500 text-xs text-center">
                    Subir imagen
                  </p>
                </>
              )}
            </div>

            {data.imagenUrl && (
              <div className="text-center mt-2">
                <span 
                  onClick={() => !loading && setData(prev => ({ ...prev, imagenUrl: '' }))} 
                  className="cursor-pointer text-lg hover:text-red-500"
                  title="Eliminar imagen"
                >
                  🗑️
                </span>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAgregar;
