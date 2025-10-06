import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';

const ModalEditar = ({ isOpen, onClose, onSave, editData }) => {
  const [data, setData] = useState({ nombre: '', categoria: 'Collar', cantidad: 0, precio: 0, imagenBase64: '', imagenUrl: '', activo: true });
  const [errors, setErrors] = useState({});

  const categorias = [
    { label: 'Collar', value: 'Collar' },
    { label: 'Correa', value: 'Correa' },
    { label: 'Juguete', value: 'Juguete' },
    { label: 'Cama', value: 'Cama' },
    { label: 'Comedero', value: 'Comedero' },
    { label: 'Transportadora', value: 'Transportadora' },
    { label: 'Higiene', value: 'Higiene' },
    { label: 'Ropa', value: 'Ropa' }
  ];

  useEffect(() => { 
    if (isOpen && editData) {
      setData({
        ...editData,
        imagenBase64: '',
        imagenUrl: editData.imagenUrl || '',
        activo: editData.activo !== undefined ? editData.activo : true
      });
    }
  }, [isOpen, editData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files?.[0]) {
      const reader = new FileReader();
      reader.onload = () => setData(prev => ({ ...prev, imagenBase64: reader.result }));
      reader.readAsDataURL(files[0]);
    } else setData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!data.nombre?.trim()) newErrors.nombre = true;
    if (data.cantidad < 0) newErrors.cantidad = true;
    if (data.precio <= 0) newErrors.precio = true;
    setErrors(newErrors);
    if (!Object.keys(newErrors).length && await onSave(data) !== false) onClose();
  };

  if (!isOpen) return null;

  const imagenActual = data.imagenBase64 || (data.imagenUrl ? `http://localhost:4000${data.imagenUrl}` : '');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center p-4 z-50" style={{marginLeft: 'var(--cui-sidebar-occupy-start, 0px)', marginRight: 'var(--cui-sidebar-occupy-end, 0px)'}}>
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-300">
          <h2 className="font-bold text-lg">EDITAR ACCESORIO</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>

        <div className="flex">
          <div className="flex-1 p-4 space-y-4">
            <div>
              <h6 className="text-sm font-semibold text-gray-700 mb-1">Tipo de Accesorio</h6>
              {editData ? (
                <InputText
                  value={data.categoria}
                  disabled
                  className="w-full"
                />
              ) : (
                <Dropdown
                  name="categoria"
                  value={data.categoria}
                  options={categorias}
                  onChange={(e) => setData(prev => ({ ...prev, categoria: e.value }))}
                  className="w-full"
                />
              )}
            </div>

            <div>
              <h6 className="text-sm font-semibold text-gray-700 mb-1">Nombre y Descripción</h6>
              <InputText
                name="nombre"
                value={data.nombre}
                onChange={(e) => setData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Nombre y descripción"
                className={classNames('w-full', { 'p-invalid': errors.nombre })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <h6 className="text-sm font-semibold text-gray-700 mb-1">Stock</h6>
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
                <h6 className="text-sm font-semibold text-gray-700 mb-1">Precio</h6>
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

            {/* TOGGLE ACTIVO/INACTIVO */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
              <div>
                <h6 className="text-sm font-semibold text-gray-700 mb-1">Estado del Producto</h6>
                <span className="text-xs text-gray-600">
                  {data.activo ? "Producto visible en el inventario" : "Producto oculto del inventario"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setData(prev => ({ ...prev, activo: !prev.activo }))}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  data.activo ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    data.activo ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <Button 
              label="Guardar" 
              onClick={handleSubmit} 
              className="w-full p-button-success"
            />
          </div>

          <div className="w-48 border-l border-gray-300 p-4">
            {imagenActual ? (
              <div>
                <img src={imagenActual} alt="Producto" className="w-full h-32 object-cover border rounded mb-2" />
                <div className="text-center">
                  <span onClick={() => setData(prev => ({ ...prev, imagenBase64: '', imagenUrl: '' }))} className="cursor-pointer text-lg hover:text-red-500">🗑️</span>
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
        </div>
      </div>
    </div>
  );
};

export default ModalEditar;