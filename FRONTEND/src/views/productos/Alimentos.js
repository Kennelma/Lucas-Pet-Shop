import React, { useState, useEffect } from 'react';

const InventarioAlimentos = () => {
  const [inventario, setInventario] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [busquedaActual, setBusquedaActual] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
  const [isDark, setIsDark] = useState(false);
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    categoria: 'Alimento',
    cantidad: 0,
    precio: 0,
    fechaVencimiento: '',
    marca: ''
  });

  const iconosCategoria = {
    'Alimento': '🥘'
  };

  const prefijosCodigo = {
    'Alimento': 'A'
  };

  // Detectar tema oscuro de Core UI
  useEffect(() => {
    const detectarTemaCoreUI = () => {
      // Core UI usa data-coreui-theme="dark" en el HTML
      const htmlElement = document.documentElement;
      const esTemaOscuro = htmlElement.getAttribute('data-coreui-theme') === 'dark';
      setIsDark(esTemaOscuro);
    };

    // Detectar tema inicial
    detectarTemaCoreUI();

    // Observador para detectar cambios en el atributo data-coreui-theme
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'data-coreui-theme' || mutation.attributeName === 'class')) {
          detectarTemaCoreUI();
        }
      });
    });
    
    // Observar cambios en el HTML
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-coreui-theme', 'class']
    });

    // También observar cambios en el body por si acaso
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-coreui-theme', 'class']
    });

    // Limpiar observador al desmontar
    return () => observer.disconnect();
  }, []);

  // Cargar inventario desde localStorage al iniciar
  useEffect(() => {
    const inventarioGuardado = JSON.parse(localStorage.getItem('inventario-alimentos')) || [];
    migrarInventario(inventarioGuardado);
  }, []);

  // Migrar inventario existente sin códigos
  const migrarInventario = (inventarioData) => {
    let necesitaMigracion = false;
    const inventarioMigrado = inventarioData.map(producto => {
      if (!producto.codigo) {
        producto.codigo = generarCodigo(producto.categoria, inventarioData);
        necesitaMigracion = true;
      }
      // Asegurar que todos los productos sean de categoría Alimento
      producto.categoria = 'Alimento';
      return producto;
    });
    
    if (necesitaMigracion) {
      localStorage.setItem('inventario-alimentos', JSON.stringify(inventarioMigrado));
    }
    setInventario(inventarioMigrado);
  };

  const generarCodigo = (categoria, inventarioData = inventario) => {
    const prefijo = prefijosCodigo[categoria] || 'A';
    const existentes = inventarioData.filter(p => p.categoria === categoria).length;
    const numero = String(existentes + 1).padStart(3, '0');
    return `${prefijo}-${numero}`;
  };

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };

  const abrirModal = () => {
    setModalVisible(true);
    setEditIndex(-1);
    setFormData({
      codigo: generarCodigo('Alimento'),
      nombre: '',
      categoria: 'Alimento',
      cantidad: 0,
      precio: 0,
      fechaVencimiento: '',
      marca: ''
    });
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setFormData({
      codigo: '',
      nombre: '',
      categoria: 'Alimento',
      cantidad: 0,
      precio: 0,
      fechaVencimiento: '',
      marca: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const registrarInventario = () => {
    const { codigo, nombre, categoria, cantidad, precio, fechaVencimiento, marca } = formData;
    
    if (!nombre.trim()) {
      mostrarMensaje('Por favor ingresa el nombre del alimento.', 'error');
      return;
    }
    
    if (!codigo.trim()) {
      mostrarMensaje('Error generando el código del alimento.', 'error');
      return;
    }
    
    if (cantidad < 0 || precio < 0) {
      mostrarMensaje('La cantidad y el precio deben ser valores positivos.', 'error');
      return;
    }

    if (!marca.trim()) {
      mostrarMensaje('Por favor ingresa la marca del alimento.', 'error');
      return;
    }

    // Verificar código único (solo para productos nuevos)
    if (editIndex === -1 && inventario.some(p => p.codigo === codigo)) {
      mostrarMensaje('Ya existe un alimento con este código.', 'error');
      return;
    }

    let nuevoInventario;
    if (editIndex >= 0) {
      nuevoInventario = [...inventario];
      nuevoInventario[editIndex] = {
        ...nuevoInventario[editIndex],
        nombre,
        categoria: 'Alimento',
        cantidad: parseInt(cantidad),
        precio: parseFloat(precio),
        fechaVencimiento,
        marca
      };
      mostrarMensaje(`${nombre} (${codigo}) actualizado correctamente.`);
    } else {
      nuevoInventario = [...inventario, {
        codigo,
        nombre,
        categoria: 'Alimento',
        cantidad: parseInt(cantidad),
        precio: parseFloat(precio),
        fechaVencimiento,
        marca
      }];
      mostrarMensaje(`${nombre} (${codigo}) agregado al inventario.`);
    }

    setInventario(nuevoInventario);
    localStorage.setItem('inventario-alimentos', JSON.stringify(nuevoInventario));
    cerrarModal();
  };

  const editarInventario = (index) => {
    const producto = inventario[index];
    setFormData({
      codigo: producto.codigo,
      nombre: producto.nombre,
      categoria: 'Alimento',
      cantidad: producto.cantidad,
      precio: producto.precio,
      fechaVencimiento: producto.fechaVencimiento || '',
      marca: producto.marca || ''
    });
    setEditIndex(index);
    setModalVisible(true);
  };

  const borrarInventario = (index) => {
    const producto = inventario[index];
    if (window.confirm(`¿Deseas eliminar "${producto.nombre}" (${producto.codigo}) del inventario?`)) {
      const nuevoInventario = inventario.filter((_, i) => i !== index);
      setInventario(nuevoInventario);
      localStorage.setItem('inventario-alimentos', JSON.stringify(nuevoInventario));
      mostrarMensaje('Alimento eliminado correctamente.');
    }
  };

  const limpiarBusqueda = () => {
    setBusquedaActual('');
  };

  // Verificar si un producto está próximo a vencer (30 días)
  const estaProximoAVencer = (fechaVencimiento) => {
    if (!fechaVencimiento) return false;
    const hoy = new Date();
    const fechaVenc = new Date(fechaVencimiento);
    const diferenciaDias = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
    return diferenciaDias <= 30 && diferenciaDias > 0;
  };

  // Verificar si un producto está vencido
  const estaVencido = (fechaVencimiento) => {
    if (!fechaVencimiento) return false;
    const hoy = new Date();
    const fechaVenc = new Date(fechaVencimiento);
    return fechaVenc < hoy;
  };

  // Filtrar productos por búsqueda
  const productosFiltrados = inventario.filter(producto => {
    const cumpleBusqueda = !busquedaActual || 
      producto.nombre.toLowerCase().includes(busquedaActual.toLowerCase()) ||
      producto.codigo.toLowerCase().includes(busquedaActual.toLowerCase()) ||
      (producto.marca && producto.marca.toLowerCase().includes(busquedaActual.toLowerCase()));
    
    return cumpleBusqueda;
  });

  return (
    <div>
      <div>ESPACIO DE ALIMENTOS</div>
    </div>
  );
};

export default InventarioAlimentos;