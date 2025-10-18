import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import Swal from 'sweetalert2';
import { insertarProducto } from '../../../AXIOS.SERVICES/products-axios';

const ModalAgregar = ({ isOpen, onClose, onSave }) => {
  const [data, setData] = useState({
    nombre: '',
    categoria: '',
    precio: 0,
    cantidad: 0,
    sku: ''
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

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

  const generarSKU = (nombre) => {
    if (!nombre) return '';
    const partes = nombre.trim().split(' ').map(p => p.substring(0, 3).toUpperCase());
    return partes.join('-');
  };

  useEffect(() => {
    if (isOpen) {
      setData({
        nombre: '',
        categoria: '',
        precio: 0,
        cantidad: 0,
        sku: ''
      });
      setErrores({});
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    const val = ['nombre', 'categoria'].includes(field) ? value.toUpperCase() : value;

    setData(prev => {
      const newData = { ...prev, [field]: val };
      if (field === 'nombre') newData.sku = generarSKU(val);
      return newData;
    });

    // Validación en tiempo real
    setErrores(prev => {
      const newErrores = { ...prev };
      if (field === 'nombre') {
        newErrores[field] = val.trim() ? '' : 'El nombre es obligatorio';
      } else if (field === 'categoria') {
        newErrores[field] = val ? '' : 'Selecciona una categoría';
      } else if (field === 'precio') {
        newErrores[field] = val > 0 ? '' : 'El precio debe ser mayor a 0';
      } else if (field === 'cantidad') {
        newErrores[field] = val > 0 ? '' : 'El stock debe ser mayor a 0';
      }
      return newErrores;
    });
  };

  const validarDatos = () => {
    let temp = {};
    
    if (!data.nombre?.trim()) {
      temp.nombre = 'El nombre es obligatorio';
    }
    
    if (!data.categoria) {
      temp.categoria = 'Selecciona una categoría';
    }
    
    if (data.precio <= 0) {
      temp.precio = 'El precio debe ser mayor a 0';
    }
    
    if (data.cantidad <= 0) {
      temp.cantidad = 'El stock debe ser mayor a 0';
    }

    setErrores(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarDatos()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos requeridos',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    setLoading(true);
    try {
      const body = {
        nombre_producto: data.nombre,
        precio_producto: data.precio,
        stock: data.cantidad,
        tipo_producto: 'ACCESORIOS',
        tipo_accesorio: data.categoria,
        sku: data.sku,
        activo: 1
      };

      console.log('🔍 ModalAgregar - Enviando datos:', body);

      const res = await insertarProducto(body);

      console.log('🔍 ModalAgregar - Respuesta recibida:', res);

      if (res && res.Consulta) {
        Swal.fire({
          icon: 'success',
          title: '¡Agregado!',
          text: `${data.nombre} fue agregado correctamente`,
          timer: 1500,
          showConfirmButton: false
        });
        
        setData({
          nombre: '',
          categoria: '',
          precio: 0,
          cantidad: 0,
          sku: ''
        });
        
        onSave();
        onClose();
      } else {
        const errorMsg = res?.error || 'Error desconocido';
        console.error('❌ Error en respuesta:', res);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `No se pudo agregar el accesorio: ${errorMsg}`
        });
      }
    } catch (err) {
      console.error('❌ Error en handleSubmit:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al agregar el accesorio. Revisa la consola.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Verificar si todos los campos están completos
  const isFormValid = () => {
    return (
      data.nombre.trim() !== '' &&
      data.categoria !== '' &&
      data.precio > 0 &&
      data.cantidad > 0 &&
      Object.keys(errores).every(key => !errores[key])
    );
  };

  const footer = (
    <div className="flex justify-end gap-3 mt-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text p-button-rounded"
        onClick={onClose}
        disabled={loading}
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        className="p-button-success p-button-rounded"
        onClick={handleSubmit}
        loading={loading}
        disabled={!isFormValid()}
      />
    </div>
  );

  return (
    <Dialog
      header="Agregar Nuevo Accesorio"
      visible={isOpen}
      style={{ width: '50rem', borderRadius: '1.5rem' }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
      draggable={false}
      resizable={false}
    >
      <div className="flex flex-col gap-2 mt-1 text-sm">
        {/* Nombre */}
        <label className="text-xs font-semibold">
          Nombre <span className="text-red-500">*</span>
        </label>
        <InputText
          value={data.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          className={`w-full rounded-xl h-9 text-sm ${errores.nombre ? 'p-invalid' : ''}`}
          placeholder="Ingresa el nombre del producto"
        />
        {errores.nombre && <small className="text-red-500">{errores.nombre}</small>}

        {/* SKU */}
        <label className="text-xs font-semibold">SKU (Auto-generado)</label>
        <InputText
          value={data.sku}
          readOnly
          className="w-full rounded-xl h-9 text-sm bg-gray-100"
          placeholder="Se generará automáticamente"
        />

        {/* Categoría */}
        <div>
          <label className="text-xs font-semibold">
            Categoría <span className="text-red-500">*</span>
          </label>
          <Dropdown
            value={data.categoria}
            options={categorias}
            onChange={(e) => handleChange('categoria', e.value)}
            className={`w-full rounded-xl text-sm mt-1 ${errores.categoria ? 'p-invalid' : ''}`}
            placeholder="Seleccionar categoría"
          />
          {errores.categoria && <small className="text-red-500">{errores.categoria}</small>}
        </div>

        {/* Precio y Stock */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold">
              Precio (L.) <span className="text-red-500">*</span>
            </label>
            <InputNumber
              value={data.precio}
              onValueChange={(e) => handleChange('precio', e.value)}
              mode="currency"
              currency="HNL"
              locale="es-HN"
              className={`w-full rounded-xl text-sm mt-1 ${errores.precio ? 'p-invalid' : ''}`}
              inputClassName="h-9 text-sm"
              placeholder="0.00"
              min={0}
            />
            {errores.precio && <small className="text-red-500">{errores.precio}</small>}
          </div>

          <div>
            <label className="text-xs font-semibold">
              Stock <span className="text-red-500">*</span>
            </label>
            <InputNumber
              value={data.cantidad}
              onValueChange={(e) => handleChange('cantidad', e.value)}
              className={`w-full rounded-xl text-sm mt-1 ${errores.cantidad ? 'p-invalid' : ''}`}
              inputClassName="h-9 text-sm"
              placeholder="0"
              min={0}
            />
            {errores.cantidad && <small className="text-red-500">{errores.cantidad}</small>}
          </div>
        </div>

        {/* Nota informativa */}
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <i className="pi pi-info-circle mr-1"></i>
          Los campos marcados con <span className="text-red-500">*</span> son obligatorios
        </div>
      </div>
    </Dialog>
  );
};

export default ModalAgregar;