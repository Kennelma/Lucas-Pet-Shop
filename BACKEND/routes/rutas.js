const conexion = require('../config/conexion');
const express = require('express');
const router = express.Router();

const { verificarToken } = require('../middleware/auth');


const auth = require('../controllers/auth.controller');
const clientes = require('../controllers/clientes.controller');
const productos = require('../controllers/productos.controller');
const servicios = require('../controllers/peluqueria.controller');
const empresa = require('../controllers/empresa.controller');
const recordatorios = require('../controllers/recordatorios.controller');
const estilistas = require('../controllers/empleados.controller');
const facturas = require('../controllers/facturacion.controller');
const pagos = require('../controllers/pagos.controller');
const whatsapp = require('../controllers/whatsapp.controller');
const notificaciones = require('../controllers/notificaciones.controller');

//========== RUTAS DE AUTENTICACIÓN Y SEGURIDAD ==========
router.post('/login', auth.login);
router.post('/solicitar-reset', auth.solicitarCodigoReset);
router.post('/resetear-contrasena', auth.resetearConCodigo);

//========== RUTAS DE MÓDULO DE PRODUCTOS ==========
router.post('/productos/insertar', verificarToken, productos.crear);
router.put('/productos/actualizar', productos.actualizar);
router.delete('/productos/eliminar', productos.eliminar);
router.get('/productos/ver',productos.ver);
router.get('/productos/verCatalogo', verificarToken, productos.verCatalogo);

//========== RUTAS DE SERVICIOS PELUQUERIA Y PROMOCIONES ==========
router.post('/servicios-peluqueria/insertar', verificarToken, servicios.crear);
router.put('/servicios-peluqueria/actualizar',verificarToken, servicios.actualizar);
router.get('/servicios-peluqueria/ver', verificarToken, servicios.visualizar);
router.delete('/servicios-peluqueria/eliminar', verificarToken, servicios.eliminar);

//========== RUTAS DE MÓDULO DE CLIENTES ==========
router.get ('/clientes/ver', verificarToken, clientes.ver);
router.post('/clientes/insertar',verificarToken, clientes.crear);
router.delete ('/clientes/eliminar', verificarToken, clientes.eliminar);
router.put('/clientes/actualizar', verificarToken, clientes.actualizar);

//========== RUTAS DE MÓDULO DE EMPRESA (EMPRESA, SUCURSALES, USUARIOS) ==========
router.post('/empresa/insertar', verificarToken, empresa.crear);
router.get ('/empresa/ver', verificarToken, empresa.ver);
router.delete ('/empresa/eliminar', verificarToken, empresa.eliminar);
router.put('/empresa/actualizar', verificarToken, empresa.actualizar);


//========== RUTAS DE FACTURACIÓN ==========
router.get ('/facturacion/catalogoItems', verificarToken, facturas.catalogoItems);
router.get ('/facturacion/buscarCliente', verificarToken,facturas.buscarClientesPorIdentidad);
router.get ('/facturacion/usuarioFacturacion', verificarToken, facturas.usuarioFactura);
router.get ('/facturacion/estilistasFacturacion', verificarToken, facturas.buscarEstilistas);
router.post ('/facturacion/crearFactura', verificarToken, facturas.crearFactura)
router.get  ('/facturacion/verFacturas', facturas.historialFacturas);
router.get  ('/facturacion/imprimirFactura', facturas.ImpresionFactura);

//========== RUTAS DE PAGOS ==========
router.post('/pagos/procesarPago', verificarToken, pagos.procesarPago);+
router.get ('/pagos/tipoPago', verificarToken, pagos.obtenerTipoPago);
router.get ('/pagos/metodosPago', verificarToken, pagos.obtenerMetodosPago);



//========== RUTAS DE REPORTES ==========

//========== RUTAS DE NOTIFICACIONES ==========
router.get('/notificaciones/ver', notificaciones.verNotificaciones);
router.put('/notificaciones/marcarLeida', notificaciones.marcarNotificacionLeida);


//========== RUTAS DE ESTILISTAS ==========
router.post('/estilistas/insertar', verificarToken, estilistas.crear);
router.get ('/estilistas/ver', verificarToken, estilistas.ver);
router.put('/estilistas/actualizar', verificarToken, estilistas.actualizar);
router.delete ('/estilistas/eliminar', verificarToken, estilistas.eliminar);

//========== RUTAS DE RECORDATORIOS ==========
router.post('/recordatorios/crear', verificarToken, recordatorios.crear);
router.get('/recordatorios/ver', verificarToken, recordatorios.ver);
router.put('/recordatorios/actualizar', verificarToken, recordatorios.actualizar);
router.delete('/recordatorios/eliminar', verificarToken, recordatorios.eliminar);
router.get('/recordatorios/catalogo', recordatorios.verCatalogo);

// ========== RUTAS DE WHATSAPP ==========
router.get('/whatsapp/qr', whatsapp.obtenerQR);
router.get('/whatsapp/estado', whatsapp.verificarEstado);
router.post('/whatsapp/pairing', whatsapp.solicitarCodigoEmparejamiento);
router.post('/whatsapp/logout', whatsapp.cerrarSesion);



module.exports = router;