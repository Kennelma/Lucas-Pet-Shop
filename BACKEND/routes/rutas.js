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
const facturas = require('../controllers/facturacion.controller')

//========== RUTAS DE AUTENTICACIÓN Y SEGURIDAD ==========
router.post('/login', auth.login);
router.post('/solicitar-reset', auth.solicitarCodigoReset);
router.post('/resetear-contrasena', auth.resetearConCodigo);

//========== RUTAS DE MÓDULO DE PRODUCTOS ==========
router.post('/productos/insertar', verificarToken, productos.crear);
router.put('/productos/actualizar', verificarToken, productos.actualizar);
router.delete('/productos/eliminar', verificarToken, productos.eliminar);
router.get('/productos/ver', verificarToken, productos.ver);
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
router.get ('/facturacion/detallesFactura', verificarToken, facturas.detallesFactura);
router.get ('/facturacion/buscarCliente', verificarToken,facturas.buscarClientesPorIdentidad);
router.get ('/facturacion/usuarioFacturacion', verificarToken, facturas.usuarioFactura);
router.get ('/facturacion/estilistasFacturacion', verificarToken, facturas.buscarEstilistas);
router.post ('/facturacion/crearFactura', verificarToken, facturas.crearFactura)



//========== RUTAS DE REPORTES ==========

//========== RUTAS DE NOTIFICACIONES ==========

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
router.get('/recordatorios/catalogo', verificarToken, recordatorios.verCatalogo);

// ========== RUTAS DE WHATSAPP ==========
router.get('/whatsapp/qr', whatsappController.obtenerQR);
router.get('/whatsapp/estado', whatsappController.verificarEstado);



module.exports = router;