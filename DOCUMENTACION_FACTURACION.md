# DOCUMENTACIÓN DEL MÓDULO DE FACTURACIÓN
## Lucas Pet Shop - Sistema de Gestión de Facturación

---

## 1. MÓDULO FACTURACIÓN - ESTRUCTURA GENERAL

### Descripción
El módulo de Facturación permite crear, gestionar e imprimir facturas de productos, servicios y promociones en el sistema Lucas Pet Shop. Incluye validación de CAI, generación de PDF y gestión de pagos.

### Ubicación en el Proyecto
```
FRONTEND/src/views/facturacion/
├── facturas/
│   ├── Facturacion.js (Componente Principal)
│   ├── NuevaFactura.js (Crear nuevas facturas)
│   ├── ListaFacturas.js (Historial y búsqueda)
│   ├── EncabezadoFactura.js (Encabezado de factura)
│   ├── DetallesFactura.js (Detalles y líneas)
│   ├── VerDetallesFactura.js (Preview de facturas)
│   ├── generarPDFFactura.js (Generación de PDF)
└── pagos/
    └── ModalPago.js (Procesamiento de pagos)
```

---

## 2. COMPONENTE PRINCIPAL: FACTURACIÓN

### Nombre del Componente
**Facturacion.js** (Contenedor Principal del Módulo)

### Descripción Funcional
Contenedor principal que gestiona la navegación entre dos pestañas:
1. **Nueva Factura** - Permite crear nuevas facturas
2. **Historial de Facturas** - Muestra el historial y gestiona facturas existentes

### Estados del Componente
```javascript
const [activeTab, setActiveTab] = useState("nueva");
const [facturaParaImprimir, setFacturaParaImprimir] = useState(null);
```

| Estado | Tipo | Descripción |
|--------|------|-------------|
| `activeTab` | string | Pestaña activa: "nueva" o "facturas" |
| `facturaParaImprimir` | object | Factura seleccionada para impresión automática |

### Pestañas Disponibles

#### Pestaña 1: Nueva Factura
- **Icono**: Plus (+)
- **Etiqueta**: "Nueva factura" (versión escritorio), "Nueva" (versión móvil)
- **Componente**: `<NuevaFactura />` 
- **Funcionalidad**: Crear y registrar nuevas facturas

#### Pestaña 2: Historial de Facturas
- **Icono**: FileText
- **Etiqueta**: "Historial de facturas" (versión escritorio), "Historial" (versión móvil)
- **Componente**: `<ListaFacturas />`
- **Funcionalidad**: Ver, buscar, filtrar y gestionar facturas existentes

### Estilos y Responsividad
- **Fondo**: Gradiente azul (`from-blue-50 to-indigo-100`)
- **Tipografía**: Poppins
- **Responsive**: 
  - Mobile: `px-3 py-3 text-sm` (botones compactos)
  - Tablet+: `px-6 py-3 text-base` (botones expandidos)
- **Navegación**: Scroll horizontal en mobile si hay muchas pestañas

---

## 3. COMPONENTE: NUEVA FACTURA

### Nombre del Componente
**NuevaFactura.js**

### Descripción Funcional
Permite crear nuevas facturas seleccionando cliente, items (productos, servicios, promociones), cantidades, precios y validando CAI (Código de Autorización de Impresión).

### Estados Principales

#### Estados del Cliente
```javascript
const [identidad, setIdentidad] = useState("");
const [nombreCliente, setNombreCliente] = useState("");
const [RTN, setRTN] = useState("");
const [id_cliente, setIdCliente] = useState(null);
```

#### Estados del Usuario y Sucursal
```javascript
const [vendedor, setVendedor] = useState("");
const [sucursal, setSucursal] = useState("");
```

#### Estados de Items
```javascript
const [items, setItems] = useState([
  {
    id: Date.now(),
    tipo: "PRODUCTOS",
    item: "",
    cantidad: 1,
    precio: 0.0,
    ajuste: 0,
    estilistas: [],
  }
]);
```

#### Catálogos Disponibles
```javascript
const [disponiblesItems, setDisponiblesItems] = useState({
  PRODUCTOS: [],
  SERVICIOS: [],
  PROMOCIONES: [],
});
const [estilistas, setEstilistas] = useState([]);
```

### Tabla de Estados

| Estado | Tipo | Descripción |
|--------|------|-------------|
| `identidad` | string | Número de identidad del cliente |
| `nombreCliente` | string | Nombre completo del cliente |
| `RTN` | string | Registro Tributario Nacional |
| `id_cliente` | number | ID único del cliente |
| `vendedor` | string | Nombre del usuario vendedor |
| `sucursal` | string | Sucursal donde se realiza la factura |
| `items` | array | Lista de items en la factura |
| `disponiblesItems` | object | Catálogos de PRODUCTOS, SERVICIOS, PROMOCIONES |
| `estilistas` | array | Lista de estilistas disponibles |
| `isLoading` | boolean | Estado de carga de datos |
| `caiActivo` | boolean | Indica si CAI es válido para facturar |

### Funciones Principales

#### Validación de CAI
```
Función: validarCAIParaFacturar()
Descripción: Verifica que el CAI sea válido antes de permitir facturación
Validaciones:
- Verifica si CAI está activo
- Valida fechas de vigencia del CAI
Retorna:
  - {puedeFacturar: true} - CAI válido
  - {puedeFacturar: false, tipoAlerta: 'critico'|'advertencia', mensaje: string}
```

#### Cargar Datos del Usuario
```
Función: cargarDatosUsuario()
Descripción: Obtiene datos del usuario vendedor y sucursal
Retorna: {success: true, data: {usuario, nombre_sucursal}}
```

#### Cargar Estilistas
```
Función: cargarEstilistas()
Descripción: Obtiene lista de estilistas disponibles
Retorna: {success: true, data: [{id, nombre, ...}]}
```

#### Cargar Catálogos
```
Función: cargarCatalogo(tipo: "PRODUCTOS"|"SERVICIOS"|"PROMOCIONES")
Descripción: Carga items disponibles de un tipo específico
Retorna: {success: true, data: [{id, nombre, precio, ...}]}
```

### Flujo de Operación
```
1. Montaje del componente
   ├─ Validar CAI
   ├─ Cargar datos del usuario
   ├─ Cargar estilistas
   └─ Cargar catálogos (PRODUCTOS, SERVICIOS, PROMOCIONES)

2. Búsqueda de cliente
   ├─ Ingresar identidad o nombre
   ├─ Validar formato de identidad
   └─ Cargar datos del cliente

3. Agregar items a la factura
   ├─ Seleccionar tipo (PRODUCTO, SERVICIO, PROMOCIÓN)
   ├─ Seleccionar item específico
   ├─ Definir cantidad
   ├─ Establecer precio
   └─ Asignar estilistas (si aplica)

4. Guardar factura
   ├─ Validar todos los campos
   ├─ Enviar al backend
   ├─ Generar número de factura
   └─ Redirigir a impresión/vista previa
```

---

## 4. COMPONENTE: LISTA DE FACTURAS

### Nombre del Componente
**ListaFacturas.js**

### Descripción Funcional
Permite visualizar, buscar, filtrar y gestionar el historial de todas las facturas registradas. Incluye opciones de pago, visualización de detalles, impresión y descarga en PDF.

### Estados Principales
```javascript
const [searchTerm, setSearchTerm] = useState('');
const [filterEstado, setFilterEstado] = useState('TODAS');
const [filterFecha, setFilterFecha] = useState('');
const [facturas, setFacturas] = useState([]);
const [loading, setLoading] = useState(true);
const [showModalPago, setShowModalPago] = useState(false);
const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
const [first, setFirst] = useState(0);
const [rows, setRows] = useState(5);
const [showPDFPreview, setShowPDFPreview] = useState(false);
const [pdfUrl, setPdfUrl] = useState(null);
const [showDetallesFactura, setShowDetallesFactura] = useState(false);
const [facturaVista, setFacturaVista] = useState(null);
```

### Tabla de Estados

| Estado | Tipo | Descripción |
|--------|------|-------------|
| `searchTerm` | string | Término de búsqueda (cliente, número factura, identidad) |
| `filterEstado` | string | Filtro por estado: TODAS, PAGADA, PARCIAL, PENDIENTE, ANULADA |
| `filterFecha` | string | Filtro por fecha de emisión |
| `facturas` | array | Lista completa de facturas del historial |
| `loading` | boolean | Estado de carga de datos |
| `showModalPago` | boolean | Visibilidad del modal de pago |
| `facturaSeleccionada` | object | Factura seleccionada para pago |
| `first` | number | Primera posición de paginación |
| `rows` | number | Número de filas por página |
| `showPDFPreview` | boolean | Visibilidad de vista previa PDF |
| `pdfUrl` | string | URL del PDF generado |
| `showDetallesFactura` | boolean | Visibilidad de detalles de factura |
| `facturaVista` | object | Factura seleccionada para ver detalles |

### Funciones Principales

#### Cargar Facturas
```
Función: cargarFacturas()
Descripción: Obtiene el historial completo de facturas
Retorna: {success: true, data: [{numero_factura, estado, cliente, ...}]}
```

#### Filtrar Facturas
```javascript
// Criterios de búsqueda
const facturasFiltradas = facturas.filter(factura => {
  const matchSearch =
    factura.numero_factura?.toLowerCase().includes(searchTerm) ||
    factura.nombre_cliente?.toLowerCase().includes(searchTerm) ||
    factura.apellido_cliente?.toLowerCase().includes(searchTerm) ||
    factura.identidad_cliente?.toLowerCase().includes(searchTerm);
  
  const matchEstado = filterEstado === 'TODAS' || 
    factura.nombre_estado?.toUpperCase() === filterEstado;
  
  const matchFecha = !filterFecha || 
    factura.fecha_emision?.split('T')[0] === filterFecha;
  
  return matchSearch && matchEstado && matchFecha;
});
```

#### Formatear Moneda
```
Función: formatCurrency(value)
Parámetro: value (number)
Retorna: string con formato "L XX,XXX.XX"
Ejemplo: formatCurrency(1500) → "L 1,500.00"
```

#### Obtener Badge de Estado
```javascript
const getEstadoBadge = (estado) => {
  PAGADA: 'bg-green-100 text-green-800 border-green-200'
  PARCIAL: 'bg-orange-100 text-orange-800 border-orange-200'
  PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  ANULADA: 'bg-gray-100 text-gray-800 border-gray-200'
}
```

### Columnas de la Tabla de Facturas

| Columna | Tipo Dato | Descripción |
|---------|-----------|-------------|
| # | number | Número secuencial de fila |
| Número Factura | string | ID único de la factura |
| Cliente | string | Nombre completo del cliente |
| Identidad | string | Número de identidad del cliente |
| Fecha Emisión | date | Fecha y hora de creación |
| Total | currency | Monto total de la factura |
| Estado | badge | PAGADA, PARCIAL, PENDIENTE, ANULADA |
| Acciones | buttons | Ver, Imprimir, Descargar PDF, Pagar |

### Acciones Disponibles en la Tabla

#### 1. Ver Detalles
- Abre modal con información completa de la factura
- Muestra: cliente, items, montos, fechas

#### 2. Imprimir
- Genera preview en navegador
- Opción de impresión física

#### 3. Descargar PDF
- Descarga PDF con factura formateada
- Nombre: `factura_[numero].pdf`

#### 4. Procesar Pago
- Abre modal de pago
- Permite registrar pagos parciales o totales
- Actualiza estado de la factura

### Filtros Disponibles

#### Filtro por Estado
```
TODAS (por defecto)
├─ PAGADA (totalmente cancelada)
├─ PARCIAL (pagos realizados pero pendiente saldo)
├─ PENDIENTE (sin pagos registrados)
└─ ANULADA (factura cancelada/anulada)
```

#### Filtro por Fecha
- Selecciona fecha específica de emisión
- Filtra facturas del día seleccionado

#### Búsqueda
- Búsqueda en tiempo real
- Campos: número factura, nombre cliente, apellido, identidad
- No requiere búsqueda exacta (búsqueda parcial)

### Paginación
- Filas por página: 5, 10, 20, 25 (seleccionable)
- Navegación: Primera, Anterior, Página actual, Siguiente, Última
- Tipo: Paginador de PrimeReact

---

## 5. COMPONENTE: ENCABEZADO DE FACTURA

### Nombre del Componente
**EncabezadoFactura.js**

### Descripción Funcional
Muestra los datos del encabezado de la factura: empresa, cliente, datos fiscales, número de factura y CAI.

### Datos Mostrados
- Logo/Nombre empresa
- Dirección y contacto
- Datos del cliente (nombre, identidad, RTN)
- Número de factura
- CAI (Código Autorización Impresión)
- Fecha de emisión
- Usuario vendedor
- Sucursal

---

## 6. COMPONENTE: DETALLES DE FACTURA

### Nombre del Componente
**DetallesFactura.js**

### Descripción Funcional
Muestra las líneas de la factura con items (productos, servicios, promociones), cantidades, precios unitarios, ajustes y subtotales.

### Estructura de Líneas de Factura

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Item | string | Nombre del producto/servicio/promoción |
| Cantidad | number | Cantidad de unidades |
| Precio Unitario | currency | Precio por unidad |
| Subtotal | currency | Cantidad × Precio Unitario |
| Ajuste | currency | Descuentos o recargos |
| Total Línea | currency | Subtotal + Ajuste |

### Cálculos
```
Subtotal = Cantidad × Precio Unitario
Total Línea = Subtotal + Ajuste
Total Factura = SUM(Total Línea para cada item)
```

---

## 7. GENERACIÓN DE PDF

### Nombre del Componente
**generarPDFFactura.js**

### Descripción Funcional
Genera archivos PDF con formato de factura listo para imprimir.

### Funciones Principales

#### Función: generarPDFFactura()
```
Parámetros:
  - facturaData: object (datos de la factura)
  - empresaData: object (datos de la empresa)
  
Retorna: blob PDF
Contenido:
  ├─ Encabezado con logo y datos empresa
  ├─ Datos del cliente
  ├─ Número de factura y CAI
  ├─ Tabla de items
  ├─ Cálculos (subtotal, descuentos, total)
  └─ Firma y sellos si aplica
```

#### Función: descargarPDFFactura()
```
Parámetros:
  - pdfBlob: blob
  - numeroFactura: string
  
Acción: Descarga PDF con nombre: factura_[numeroFactura].pdf
```

---

## 8. MODALES Y DIÁLOGOS

### Modal de Pago

#### Nombre del Componente
**ModalPago.js** (ubicado en `/pagos/`)

#### Descripción
Permite registrar pagos contra facturas pendientes o parcialmente pagadas.

#### Funcionalidades
- Seleccionar método de pago
- Ingresar monto a pagar
- Validar que no exceda saldo pendiente
- Generar comprobante de pago
- Actualizar estado de factura

#### Estados Posibles Después de Pago
```
PENDIENTE → PARCIAL (si pago < total)
PENDIENTE → PAGADA (si pago = total)
PARCIAL → PAGADA (si pago completa saldo)
```

### Modal de Detalles de Factura

#### Nombre del Componente
**VerDetallesFactura.js**

#### Descripción
Muestra vista completa y detallada de una factura existente sin permitir ediciones.

#### Información Mostrada
- Encabezado completo
- Datos del cliente
- Todos los items y detalles
- Resumen de montos
- Histórico de pagos (si aplica)
- Estado actual

---

## 9. SERVICIOS AXIOS (API)

### Ruta de Servicios
`FRONTEND/src/AXIOS.SERVICES/factura-axios.js`

### Funciones Disponibles

#### 1. Obtener Detalles de Factura
```javascript
obtenerDetallesFactura(tipo: "PRODUCTOS"|"SERVICIOS"|"PROMOCIONES")
Retorna: {success: true, data: [{id, nombre, precio, ...}]}
```

#### 2. Obtener Usuario Factura
```javascript
obtenerUsuarioFactura()
Retorna: {success: true, data: {usuario: string, nombre_sucursal: string}}
```

#### 3. Obtener Estilistas
```javascript
obtenerEstilistasFactura()
Retorna: {success: true, data: [{id, nombre, especialidad, ...}]}
```

#### 4. Validar CAI
```javascript
validarCAIParaFacturar()
Retorna: {
  puedeFacturar: boolean,
  tipoAlerta?: 'critico'|'advertencia',
  mensaje?: string
}
```

#### 5. Obtener Historial Facturas
```javascript
obtenerHistorialFacturas()
Retorna: {success: true, data: [{numero_factura, estado, cliente, ...}]}
```

#### 6. Obtener Datos Factura PDF
```javascript
obtenerDatosFacturaPDF(numeroFactura)
Retorna: {success: true, data: {factura: {...}, empresa: {...}}}
```

#### 7. Procesar Pago
```javascript
// En payments-axios.js
procesarPago(payload: {id_factura, monto, metodo_pago, ...})
Retorna: {success: true, data: {comprobante_pago: string}}
```

---

## 10. VALIDACIONES DEL SISTEMA

### Validaciones en Nueva Factura

| Validación | Descripción | Mensaje Error |
|------------|-------------|---------------|
| CAI Activo | El CAI debe estar vigente | "ADVERTENCIA CAI: CAI vencido" |
| Cliente Requerido | Debe seleccionar cliente | "Cliente es requerido" |
| Items Requeridos | Mínimo 1 item | "Debe agregar al menos 1 item" |
| Cantidad Positiva | Cantidad > 0 | "Cantidad debe ser > 0" |
| Precio Válido | Precio >= 0 | "Precio debe ser válido" |
| Estilista (Servicios) | Servicios requieren estilista | "Debe asignar estilista" |

### Validaciones en Pagos

| Validación | Descripción | Mensaje Error |
|------------|-------------|---------------|
| Monto Válido | Monto > 0 | "Monto debe ser mayor a 0" |
| Monto <= Saldo | No puede pagar más que adeuda | "Monto excede saldo pendiente" |
| Método Pago | Debe seleccionar método | "Seleccione método de pago" |

---

## 11. ESTRUCTURA DE DATOS BACKEND

### Tabla: facturas
```sql
id_factura_pk (PK)
numero_factura (UNIQUE)
id_cliente_fk
id_usuario_fk
id_sucursal_fk
id_cai_fk
fecha_emision
id_estado_fk
subtotal
descuento
total
created_at
updated_at
```

### Tabla: detalle_facturas
```sql
id_detalle_factura_pk (PK)
id_factura_fk (FK)
tipo_item (PRODUCTOS|SERVICIOS|PROMOCIONES)
id_item_fk
cantidad
precio_unitario
ajuste
subtotal
id_estilista_fk (nullable, para servicios)
```

### Tabla: pagos_facturas
```sql
id_pago_pk (PK)
id_factura_fk (FK)
monto_pagado
metodo_pago
fecha_pago
comprobante
observaciones
```

### Estados Factura
```
PAGADA - Factura completamente cancelada
PARCIAL - Factura con pagos pero pendiente saldo
PENDIENTE - Factura sin pagos registrados
ANULADA - Factura cancelada/anulada del sistema
```

---

## 12. FLUJOS DE USUARIO

### Flujo 1: Crear Nueva Factura
```
1. Usuario accede a módulo Facturación
2. Selecciona pestaña "Nueva Factura"
3. Sistema valida CAI
4. Usuario busca cliente por identidad/nombre
5. Usuario agrega items (productos, servicios, promociones)
6. Usuario establece cantidades y precios
7. Sistema calcula subtotales
8. Usuario revisa resumen
9. Usuario guarda factura
10. Sistema genera número de factura
11. Sistema muestra preview/impresión
12. Usuario imprime o descarga PDF
```

### Flujo 2: Ver Historial y Procesar Pago
```
1. Usuario accede a módulo Facturación
2. Selecciona pestaña "Historial de Facturas"
3. Sistema carga todas las facturas
4. Usuario aplica filtros (estado, fecha, búsqueda)
5. Usuario selecciona factura de interés
6. Usuario puede:
   a) Ver detalles completos
   b) Imprimir
   c) Descargar PDF
   d) Procesar pago
7. Si elige pago:
   ├─ Se abre modal de pago
   ├─ Usuario ingresa monto
   ├─ Usuario selecciona método
   ├─ Sistema valida montos
   └─ Sistema registra pago y actualiza estado
```

### Flujo 3: Buscar y Filtrar Facturas
```
1. Usuario en "Historial de Facturas"
2. Ingresa término de búsqueda (cliente, número, identidad)
3. Selecciona filtro por estado (PAGADA, PENDIENTE, etc.)
4. Selecciona rango de fechas (opcional)
5. Sistema filtra en tiempo real
6. Muestra resultados paginados
7. Usuario navega entre páginas
```

---

## 13. RESPONSIVIDAD

### Dispositivos Soportados
- **Mobile**: < 640px (sm breakpoint)
- **Tablet**: 640px - 1024px (md breakpoint)  
- **Desktop**: > 1024px (lg breakpoint)

### Adaptaciones por Dispositivo

#### Mobile
- Tabla scroll horizontal
- Botones apilados verticalmente
- Texto comprimido
- Iconos sin etiquetas en algunos lugares

#### Tablet
- Tabla parcialmente adaptada
- Botones en fila con tamaño mediano
- Columnas menos densas

#### Desktop
- Tabla completa y expandida
- Botones en fila con todas las etiquetas
- Todas las columnas visibles
- Máximo ancho contenedor

---

## 14. CONSIDERACIONES DE SEGURIDAD

### Validaciones Requeridas
✓ Verificar CAI vigente antes de facturar
✓ Validar identidad del cliente
✓ Verificar permisos de usuario para facturar
✓ Registrar auditoría de todas las facturas creadas
✓ Proteger números de factura (secuencial y único)

### Datos Sensibles
- RTN del cliente
- Identidad del cliente
- Montos de transacciones
- Datos de pagos

---

## 15. ERRORES COMUNES Y SOLUCIONES

| Error | Causa | Solución |
|-------|-------|----------|
| "CAI no válido" | CAI vencido o inactivo | Renovar CAI en SAR |
| "No se pudo cargar catálogo" | Fallo conexión backend | Verificar API disponible |
| "Cliente no encontrado" | Cliente no existe en sistema | Crear cliente primero |
| "Error al generar PDF" | Datos incompletos | Verificar todos los campos |
| "Monto de pago excede total" | Validación fallida | Ingresar monto correcto |

---

## 16. CARACTERÍSTICAS FUTURAS SUGERIDAS

- [ ] Envío de facturas por email/WhatsApp
- [ ] Recordatorios automáticos de facturas vencidas
- [ ] Reporte de facturas por período
- [ ] Exportar a Excel
- [ ] Anulación de facturas con motivo
- [ ] Notas de crédito
- [ ] Facturas recurrentes
- [ ] Integración con sistemas contables
- [ ] Firma digital
- [ ] Retenciones fiscales

---

**Documento Generado**: Noviembre 24, 2025
**Versión**: 1.0
**Módulo**: Facturación - Lucas Pet Shop
