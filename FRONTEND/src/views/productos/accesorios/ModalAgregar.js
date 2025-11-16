import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch'; 
import Swal from 'sweetalert2';
import { insertarProducto } from '../../../AXIOS.SERVICES/products-axios';

// ✅ AGREGAR accesoriosExistentes COMO PROP
const ModalAgregar = ({ isOpen, onClose, onSave, accesoriosExistentes = [] }) => {
  const [data, setData] = useState({
    nombre: '',
    categoria: '',
    precio: '',
    cantidad: 5,
    sku: ''
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  const [aplicaImpuesto, setAplicaImpuesto] = useState(false);
  const [tasaImpuesto, setTasaImpuesto] = useState(15);
  const [precioBase, setPrecioBase] = useState(0);

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

  const recalcularPrecio = (base, tasa, aplicar) => {
    const pBase = parseFloat(base) || 0;
    const pTasa = parseFloat(tasa) || 0;
    if (aplicar && pTasa > 0) {
      return (pBase * (1 + pTasa / 100));
    } else {
      return pBase;
    }
  }

  const calcularPrecioFinalConISV = () => {
    const pBase = parseFloat(precioBase) || 0;
    const pTasa = parseFloat(tasaImpuesto) || 0;
    return (pBase * (1 + pTasa / 100)).toFixed(2);
  };

  useEffect(() => {
    if (isOpen) {
      setData({
        nombre: '',
        categoria: '',
        precio: '0.00',
        cantidad: 5,
        sku: '',
        tasaImpuesto: 15
      });
      setErrores({});
      setAplicaImpuesto(false);
      setTasaImpuesto(15);
      setPrecioBase(0);
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    const val = ['nombre', 'categoria'].includes(field) ? value.toUpperCase() : value;
    
    setData(prev => {
      const newData = { ...prev, [field]: val };

      if (field === 'nombre') newData.sku = generarSKU(val);

      if (field === 'precio') {
        const precioActual = parseFloat(val) || 0;
        const tasa = parseFloat(tasaImpuesto) || 0;
        let nuevaBase;

        if (aplicaImpuesto && tasa > 0) {
          nuevaBase = (precioActual / (1 + tasa / 100));
        } else {
          nuevaBase = precioActual;
        }
        setPrecioBase(Number(nuevaBase.toFixed(2)));
      }
      return newData;
    });

    // ✅ VALIDACIÓN MEJORADA
    setErrores(prev => {
      const newErrores = { ...prev };
      
      if (field === 'nombre') {
        if (!val.trim()) {
          newErrores[field] = 'El nombre del accesorio es obligatorio';
        } else {
          const nombreExiste = accesoriosExistentes.some(acc => 
            acc.nombre.toLowerCase() === val.trim().toLowerCase()
          );
          
          if (nombreExiste) {
            newErrores[field] = 'Ya existe un accesorio con este nombre';
          } else {
            newErrores[field] = '';
          }
        }
      } else if (field === 'categoria') {
        newErrores[field] = val ? '' : 'Debe seleccionar una categoría';
      } else if (field === 'precio') {
        newErrores[field] = (parseFloat(val) || 0) > 0 ? '' : 'El precio debe ser mayor a 0';
      } else if (field === 'cantidad') {
        const cantidad = parseInt(val) || 0;
        if (cantidad < 5) {
          newErrores[field] = 'El stock debe ser mínimo 5 unidades';
        } else {
          newErrores[field] = '';
        }
      }
      
      return newErrores;
    });
  };

  const handleTasaChange = (e) => {
    const nuevaTasa = parseFloat(e.target.value) || 0;
    setTasaImpuesto(nuevaTasa);

    if (aplicaImpuesto) {
      const nuevoPrecio = recalcularPrecio(precioBase, nuevaTasa, true);
      setData(prev => ({ ...prev, precio: Number(nuevoPrecio.toFixed(2)) }));
    }
  };

  const handleImpuestoChange = (value) => {
    setAplicaImpuesto(value);
    const nuevoPrecio = recalcularPrecio(precioBase, tasaImpuesto, value);
    setData(prev => ({ ...prev, precio: Number(nuevoPrecio.toFixed(2)) }));
  };

  const validarDatos = () => {
    let temp = {};

    if (!data.nombre?.trim()) {
      temp.nombre = 'El nombre del accesorio es obligatorio';
    } else {
      const nombreExiste = accesoriosExistentes.some(acc => 
        acc.nombre.toLowerCase() === data.nombre.trim().toLowerCase()
      );
      
      if (nombreExiste) {
        temp.nombre = 'Ya existe un accesorio con este nombre';
      }
    }

    if (!data.categoria) {
      temp.categoria = 'Debe seleccionar una categoría';
    }

    if (parseFloat(data.precio) <= 0) {
      temp.precio = 'El precio debe ser mayor a 0';
    }

    if (parseInt(data.cantidad) < 5) {
      temp.cantidad = 'El stock debe ser mínimo 5 unidades';
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
      const precioVentaFinal = parseFloat(data.precio);

      const body = {
        nombre_producto: data.nombre,
        precio_producto: precioVentaFinal,
        stock: data.cantidad,
        tipo_producto: 'ACCESORIOS',
        tipo_accesorio: data.categoria,
        sku: data.sku,
        activo: 1,
        tiene_impuesto: aplicaImpuesto ? 1 : 0
      };

      console.log('🔍 ModalAgregarAccesorio - Enviando datos:', body);

      const res = await insertarProducto(body);

      console.log('🔍 ModalAgregarAccesorio - Respuesta recibida:', res);

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
          precio: '0.00',
          cantidad: 5,
          sku: ''
        });
        setPrecioBase(0);

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

  const precioLabel = aplicaImpuesto ? 'PRECIO CON ISV (L)' : 'PRECIO BASE (L)';

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
        maxHeight: '85vh',
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}
      modal
      closable={false}
      onHide={onClose}
      footer={footer}
      position="center"
      dismissableMask={false}
      draggable={false}
      resizable={false}
      contentStyle={{ overflowY: 'auto', maxHeight: 'calc(85vh - 120px)' }}
    >
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
          <label htmlFor="precio" className="text-xs font-semibold text-gray-700 mb-1">
            {aplicaImpuesto ? 'PRECIO CON ISV' : 'PRECIO BASE'}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-600 font-semibold z-10">L</span>
            <InputText
              id="precio"
              name="precio"
              type="text"
              value={data.precio}
              onChange={(e) => handleChange('precio', e.target.value)}
              onFocus={(e) => {
                const valor = e.target.value;
                if (valor === '0' || valor === '0.00' || valor === '' || parseFloat(valor) === 0) {
                  setData(prev => ({ ...prev, precio: '' }));
                }
              }}
              onBlur={(e) => {
                const valor = e.target.value.trim();
                if (!valor || valor === '') {
                  setData(prev => ({ ...prev, precio: '0.00' }));
                } else {
                  const num = parseFloat(valor);
                  if (!isNaN(num)) {
                    setData(prev => ({ ...prev, precio: num.toFixed(2) }));
                  }
                }
              }}
              className="w-full rounded-xl h-9 text-sm"
              style={{ paddingLeft: '2rem' }}
              placeholder="0.00"
            />
          </div>
          {errores.precio && data.precio !== '' && data.precio !== '0.00' && parseFloat(data.precio) !== 0 && (
            <p className="text-xs text-red-600 mt-1">{errores.precio}</p>
          )}
        </span>

        {/* SECCIÓN DE IMPUESTO CON INPUTSWITCH */}
        <div className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-gray-50">
          <label className="text-sm font-semibold text-gray-700">¿APLICA ISV?</label>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${!aplicaImpuesto ? 'text-red-600' : 'text-gray-500'}`}>NO</span>
            <InputSwitch
              checked={aplicaImpuesto}
              onChange={e => handleImpuestoChange(e.value)}
            />
            <span className={`text-sm font-medium ${aplicaImpuesto ? 'text-green-600' : 'text-gray-500'}`}>SÍ</span>
          </div>
        </div>

        {/* SI SE APLICA IMPUESTO, MUESTRA INPUT DE TASA Y PRECIO BASE */}
        {aplicaImpuesto && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">TASA DE IMPUESTO (%)</label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={tasaImpuesto}
                onChange={handleTasaChange}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
                max="100"
              />
              <span className="text-sm text-gray-600">
                PRECIO BASE: L {parseFloat(precioBase).toFixed(2)} (SIN IMPUESTO)
              </span>
            </div>
          </div>
        )}

        {/* MENSAJE DE ADVERTENCIA SI NO SE APLICA IMPUESTO */}
        {!aplicaImpuesto && data.precio > 0 && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-md p-2">
            <p className="text-xs text-yellow-800">
              El precio base es L {parseFloat(data.precio).toFixed(2)}. Si se aplica ISV ({tasaImpuesto}%), el precio con ISV sería L <strong>{(parseFloat(data.precio) * (1 + parseFloat(tasaImpuesto) / 100)).toFixed(2)}</strong>.
            </p>
          </div>
        )}

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
            placeholder="Mínimo 5 unidades"
            min={0}
          />
          {errores.cantidad && <p className="text-xs text-red-600 mt-1">{errores.cantidad}</p>}
        </span>
      </div>
    </Dialog>
  );
};

export default ModalAgregar;