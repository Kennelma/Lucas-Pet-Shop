
const conexion = require('../config/conexion');
const express = require('express');
const router = express.Router();

const recordatoriosController = require('../controllers/recordatoriosController');
const whatsappController = require('../controllers/whatsappController');

const auth = require('../controllers/auth.controller');
const clientes = require('../controllers/clientes.controller');
const productos = require('../controllers/productos.controller');
const servicios = require('../controllers/peluqueria.controller');
const empresa = require('../controllers/empresa.controller');

//========== RUTAS DE AUTENTICACIÓN ==========
router.post('/login', auth.login);

//========== RUTAS DE SERVICIOS PELUQUERIA Y PROMOCIONES ==========
router.post('/servicios-peluqueria/insertar', servicios.crear);
router.put('/servicios-peluqueria/actualizar', servicios.actualizar);
router.get('/servicios-peluqueria/ver', servicios.visualizar);
router.delete('/servicios-peluqueria/eliminar', servicios.eliminar);

//========== RUTAS DE MÓDULO DE PRODUCTOS ==========
router.post('/productos/insertar', productos.crear);
router.put('/productos/actualizar', productos.actualizar);
router.delete ('/productos/eliminar', productos.eliminar);
router.get ('/productos/ver', productos.ver)

//========== RUTAS DE MÓDULO DE CLIENTES ==========
router.get ('/clientes/ver', clientes.ver)
router.post('/clientes/insertar', clientes.crear);
router.delete ('/clientes/eliminar', clientes.eliminar);
router.put('/clientes/actualizar', clientes.actualizar);


//========== RUTAS DE MÓDULO DE EMPRESA (EMPRESA, SUCURSALES, USUARIOS) ==========
router.post('/empresa/insertar', empresa.crear);
//router.get ('/empresa/ver', empresa.ver);
//router.put('/empresa/actualizar', empresa.actualizar);
//router.delete ('/empresa/eliminar', empresa.eliminar);


//========== RUTAS DE FACTURACIÓN ==========


//========== RUTAS DE RECORDATORIOS ==========
router.get('/recordatorios/ver', recordatoriosController.ver);
router.post('/recordatorios/crear', recordatoriosController.crear);
router.post('/recordatorios/actualizar', recordatoriosController.actualizar);
router.post('/recordatorios/eliminar', recordatoriosController.eliminar);
router.get('/recordatorios/tipos-item', recordatoriosController.verTiposItem);
router.get('/recordatorios/frecuencias', recordatoriosController.verFrecuencias);

//========== RUTAS PARA WHATSAPP ==========
router.post('/whatsapp/enviar', whatsappController.enviarRecordatorios);






module.exports = router;