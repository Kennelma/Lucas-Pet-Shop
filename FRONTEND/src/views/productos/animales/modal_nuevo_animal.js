// IMPORTACIÓN DE REACT Y COMPONENTES DE PRIME REACT
import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { insertarProducto } from '../../../AXIOS.SERVICES/products-axios';
import { obtenerProductos } from '../../../AXIOS.SERVICES/products-axios'; // 🔹 AÑADIDO para traer productos existentes

const ModalNuevoAnimal = ({ isOpen, onClose, onSave ,accesoriosExistentes = []}) => {

  const [data, setData] = useState({
    nombre: '',
    especie: '',
    sexo: '',
    precio: 0,
    cantidad: 0,
    tasaImpuesto: 15
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [aplicaImpuesto, setAplicaImpuesto] = useState(false);
  const [tasaImpuesto, setTasaImpuesto] = useState(15);
  const [precioBase, setPrecioBase] = useState(0);
  

  // 🔹 NUEVO ESTADO: Lista de productos existentes para verificar nombres duplicados
  const [productosExistentes, setProductosExistentes] = useState([]);


  
  // 🔹 Al abrir el modal, cargar los productos existentes (solo animales)
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await obtenerProductos();
        if (Array.isArray(res)) {
          const animales = res.filter(p => p.tipo_producto === 'ANIMALES');
          setProductosExistentes(animales);
        }
      } catch (error) {
        console.error("Error al obtener productos existentes:", error);
      }
    };
    if (isOpen) fetchProductos();
  }, [isOpen]);

  const hayErrores = Object.keys(errores).some(key => errores[key]);

  const especies = [
    { label: 'PERRO', value: 'PERRO' },
    { label: 'GATO', value: 'GATO' },
    { label: 'AVE', value: 'AVE' },
    { label: 'PEZ', value: 'PEZ' },
    { label: 'REPTIL', value: 'REPTIL' },
    { label: 'ANFIBIO', value: 'ANFIBIO' }
  ];

  const sexos = [
    { label: 'HEMBRA', value: 'HEMBRA' },
    { label: 'MACHO', value: 'MACHO' }
  ];

  const recalcularPrecio = (base, tasa, aplicar) => {
    const pBase = parseFloat(base) || 0;
    const pTasa = parseFloat(tasa) || 0;
    if (aplicar) {
      return (pBase * (1 + pTasa / 100)).toFixed(2);
    } else {
      return pBase.toFixed(2);
    }
  };

  const handleChange = (field, value) => {
    const val = ['nombre', 'especie', 'sexo'].includes(field) ? value.toUpperCase() : value;

    setData(prev => {
      const newData = { ...prev, [field]: val };

      if (field === 'precio') {
        const precioActual = parseFloat(val) || 0;
        const tasa = parseFloat(tasaImpuesto) || 0;
        let nuevaBase;

        if (aplicaImpuesto && tasa > 0) {
          nuevaBase = (precioActual / (1 + tasa / 100));
        } else {
          nuevaBase = precioActual;
        }
        setPrecioBase(nuevaBase.toFixed(2));
      }
      return newData;
    });

    if (errores[field]) {
      setErrores(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTasaChange = (e) => {
    const nuevaTasa = parseFloat(e.target.value) || 0;
    setTasaImpuesto(nuevaTasa);
    if (aplicaImpuesto) {
      const nuevoPrecio = recalcularPrecio(precioBase, nuevaTasa, true);
      setData(prev => ({ ...prev, precio: nuevoPrecio }));
    }
  };

  const handleImpuestoChange = (value) => {
    setAplicaImpuesto(value);
    const nuevoPrecio = recalcularPrecio(precioBase, tasaImpuesto, value);
    setData(prev => ({ ...prev, precio: nuevoPrecio }));
  };

  const calcularPrecioFinalConISV = () => {
    const pBase = parseFloat(precioBase) || 0;
    const pTasa = parseFloat(tasaImpuesto) || 0;
    return (pBase * (1 + pTasa / 100)).toFixed(2);
  };

  const validarDatos = () => {
    let temp = {};
     if (!data.nombre?.trim()) {
      temp.nombre = 'El nombre del accesorio es obligatorio';
    } else {
      // ✅ VALIDACIÓN DE NOMBRE DUPLICADO EN EL SUBMIT
      const nombreExiste = animalesExistentes.some(acc => 
        acc.nombre.toLowerCase() === data.nombre.trim().toLowerCase() &&
        acc.id_producto !== editData.id_producto
      );
      
      if (nombreExiste) {
        temp.nombre = 'Ya existe un accesorio con este nombre';
      }
    if (!data.especie) temp.especie = 'Debe seleccionar una especie';
    if (!data.sexo) temp.sexo = 'Debe seleccionar el sexo del animal';
    if (!data.precio || parseFloat(data.precio) <= 0) temp.precio = 'El precio debe ser mayor a 0';
    if (!data.cantidad || data.cantidad <= 0) temp.cantidad = 'El stock debe ser mayor a 0';

    // 🔹 VALIDACIÓN NUEVA: nombre duplicado
    const existe = productosExistentes.some(
      (p) => p.nombre_producto?.toUpperCase() === data.nombre.toUpperCase()
    );
    if (existe) temp.nombre = 'Ya existe un animal con este nombre';

    setErrores(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarDatos()) return;

    setLoading(true);
    try {
      const precioVentaFinal = parseFloat(data.precio);
      const body = {
        nombre_producto: data.nombre,
        precio_producto: precioVentaFinal,
        stock: data.cantidad,
        stock_minimo: 0,
        tipo_producto: 'ANIMALES',
        especie: data.especie,
        sexo: data.sexo,
        tiene_impuesto: aplicaImpuesto ? 1 : 0,
      };

      const res = await insertarProducto(body);

      if (res.Consulta) {
        const nuevoAnimal = {
          id_producto: res.id_producto_pk,
          nombre: data.nombre,
          precio: precioVentaFinal,
          stock: data.cantidad,
          stock_minimo: 0,
          activo: true,
          tipo_producto: 'ANIMALES',
          especie: data.especie,
          sexo: data.sexo,
          tiene_impuesto: aplicaImpuesto ? 1 : 0,
        };

        onSave(nuevoAnimal);
        onClose();
      } else {
        alert(`Error al guardar: ${res.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al guardar el animal.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3 mt-1">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text p-button-rounded text-sm"
        style={{ padding: '0.375rem 0.75rem' }}
        onClick={onClose}
        disabled={loading}
      />
      <Button
        label="Guardar"
        icon="pi pi-check"
        className="p-button-success p-button-rounded text-sm"
        style={{ padding: '0.375rem 0.75rem' }}
        onClick={handleSubmit}
        loading={loading}
      />
    </div>
  );

  const precioLabel = aplicaImpuesto ? 'PRECIO CON ISV (L)' : 'PRECIO BASE (L)';

  return (
    <Dialog
      header={<div className="w-full text-center text-lg font-bold">NUEVO ANIMAL</div>}
      visible={isOpen}
      style={{ width: '30rem', height: '85vh', borderRadius: '1.5rem' }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
      contentStyle={{ 
        overflowY: 'auto', 
        padding: '1rem',
        height: 'calc(85vh - 120px)'
      }}
    >
      <div className="flex flex-col gap-2.5">

        {/* CAMPO NOMBRE DEL ANIMAL */}
        <span>
          <label htmlFor="nombre" className="text-xs font-semibold text-gray-700 mb-1">NOMBRE DEL ANIMAL</label>
          <InputText
            id="nombre"
            name="nombre"
            value={data.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            className={`w-full rounded-xl h-9 text-sm ${errores.nombre ? 'border-red-500' : ''}`}
            placeholder="Ej: Firulais"
          />
          {errores.nombre && <p className="text-xs text-red-600 mt-1">{errores.nombre}</p>}
        </span>

        {/* ... resto del código igual ... */}

      </div>
    </Dialog>
  );
};

export default ModalNuevoAnimal;
