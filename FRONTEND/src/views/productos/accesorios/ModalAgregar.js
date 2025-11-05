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

  // Verificar si hay errores para mostrar scroll
  const hayErrores = Object.keys(errores).some(key => errores[key]);

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
        newErrores[field] = val.trim() ? '' : 'El nombre del accesorio es obligatorio';
      } else if (field === 'categoria') {
        newErrores[field] = val ? '' : 'Debe seleccionar una categoría';
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
      temp.nombre = 'El nombre del accesorio es obligatorio';
    }
    
    if (!data.categoria) {
      temp.categoria = 'Debe seleccionar una categoría';
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
      header={<div className="w-full text-center text-lg font-bold">NUEVO ACCESORIO</div>}
      visible={isOpen}
      style={{ 
        width: '28rem', 
        borderRadius: '1.5rem',
        ...(hayErrores ? { maxHeight: '85vh' } : {})
      }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
      contentStyle={hayErrores ? { overflowY: 'auto', maxHeight: 'calc(85vh - 120px)' } : { overflow: 'visible' }}
    >
      {/* Formulario */}
      <div className="flex flex-col gap-3 overflow-visible">
        {/* Nombre del Accesorio */}
        <span>
          <label htmlFor="nombre" className="text-xs font-semibold text-gray-700 mb-1">NOMBRE DEL ACCESORIO</label>
          <InputText
            id="nombre"
            name="nombre"
            value={data.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Ej: Collar de cuero"
          />
          {errores.nombre && <p className="text-xs text-red-600 mt-1">{errores.nombre}</p>}
        </span>


        {/* Categoría */}
        <span>
          <label htmlFor="categoria" className="text-xs font-semibold text-gray-700 mb-1">CATEGORÍA</label>
          <Dropdown
            id="categoria"
            name="categoria"
            value={data.categoria}
            options={categorias}
            onChange={(e) => handleChange('categoria', e.value)}
            className="w-full rounded-xl h-9 text-sm"
            placeholder="Seleccionar categoría"
          />
          {errores.categoria && <p className="text-xs text-red-600 mt-1">{errores.categoria}</p>}
        </span>

        {/* Precio */}
        <span>
          <label htmlFor="precio" className="text-xs font-semibold text-gray-700 mb-1">PRECIO (L)</label>
          <InputNumber
            id="precio"
            name="precio"
            value={data.precio}
            onValueChange={(e) => handleChange('precio', e.value)}
            mode="currency"
            currency="HNL"
            locale="es-HN"
            className="w-full rounded-xl h-9 text-sm"
            inputClassName="h-9 text-sm"
            placeholder="0.00"
            min={0}
          />
          {errores.precio && <p className="text-xs text-red-600 mt-1">{errores.precio}</p>}
        </span>

        {/* Stock */}
        <span>
          <label htmlFor="stock" className="text-xs font-semibold text-gray-700 mb-1">STOCK DISPONIBLE</label>
          <InputNumber
            id="stock"
            name="stock"
            value={data.cantidad}
            onValueChange={(e) => handleChange('cantidad', e.value)}
            className="w-full rounded-xl h-9 text-sm"
            inputClassName="h-9 text-sm"
            placeholder="Cantidad disponible"
            min={0}
          />
          {errores.cantidad && <p className="text-xs text-red-600 mt-1">{errores.cantidad}</p>}
        </span>
      </div>
    </Dialog>
  );
};

export default ModalAgregar;