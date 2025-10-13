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
    stock_minimo: 0,
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
        stock_minimo: 0,
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
      if (['nombre', 'categoria'].includes(field)) {
        newErrores[field] = val ? '' : 'Campo obligatorio';
      } else if (['precio', 'cantidad', 'stock_minimo'].includes(field)) {
        newErrores[field] = val >= 0 ? '' : 'No puede ser negativo';
      }
      return newErrores;
    });
  };

  const validarDatos = () => {
    let temp = {};
    if (!data.nombre?.trim()) temp.nombre = 'Campo obligatorio';
    if (!data.categoria) temp.categoria = 'Campo obligatorio';
    if (data.precio <= 0) temp.precio = 'Debe ser mayor a 0';
    if (data.cantidad < 0) temp.cantidad = 'No puede ser negativo';
    if (data.stock_minimo < 0) temp.stock_minimo = 'No puede ser negativo';

    setErrores(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarDatos()) return;

    setLoading(true);
    try {
      const body = {
        nombre_producto: data.nombre,
        precio_producto: data.precio,
        stock: data.cantidad,
        stock_minimo: data.stock_minimo,
        tipo_producto: 'ACCESORIOS',
        tipo_accesorio: data.categoria,
        sku: data.sku,
        activo: 1
      };

      console.log('🔍 ModalAgregar - Enviando datos:', body);

      const res = await insertarProducto(body, null);

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
          stock_minimo: 0,
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
        <label className="text-xs font-semibold">Nombre</label>
        <InputText
          value={data.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          className="w-full rounded-xl h-9 text-sm"
        />
        {errores.nombre && <small className="text-red-500">{errores.nombre}</small>}

        {/* SKU */}
        <label className="text-xs font-semibold">SKU</label>
        <InputText
          value={data.sku}
          readOnly
          className="w-full rounded-xl h-9 text-sm bg-gray-100"
        />

        {/* Categoría */}
        <div>
          <label className="text-xs font-semibold">Categoría</label>
          <Dropdown
            value={data.categoria}
            options={categorias}
            onChange={(e) => handleChange('categoria', e.value)}
            className="w-full rounded-xl text-sm mt-1"
            placeholder="Seleccionar"
          />
          {errores.categoria && <small className="text-red-500">{errores.categoria}</small>}
        </div>

        {/* Precio, Stock y Stock mínimo */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs font-semibold">Precio (L.)</label>
            <InputNumber
              value={data.precio}
              onValueChange={(e) => handleChange('precio', e.value)}
              mode="currency"
              currency="HNL"
              locale="es-HN"
              className="w-full rounded-xl text-sm mt-1"
              inputClassName="h-9 text-sm"
            />
            {errores.precio && <small className="text-red-500">{errores.precio}</small>}
          </div>

          <div>
            <label className="text-xs font-semibold">Stock</label>
            <InputNumber
              value={data.cantidad}
              onValueChange={(e) => handleChange('cantidad', e.value)}
              className="w-full rounded-xl text-sm mt-1"
              inputClassName="h-9 text-sm"
            />
            {errores.cantidad && <small className="text-red-500">{errores.cantidad}</small>}
          </div>

          <div>
            <label className="text-xs font-semibold">Stock mínimo</label>
            <InputNumber
              value={data.stock_minimo}
              onValueChange={(e) => handleChange('stock_minimo', e.value)}
              className="w-full rounded-xl text-sm mt-1"
              inputClassName="h-9 text-sm"
            />
            {errores.stock_minimo && <small className="text-red-500">{errores.stock_minimo}</small>}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ModalAgregar;