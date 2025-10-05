
const conexion = require('../config/conexion');
const express = require('express');
const router = express.Router();


const auth = require('../controllers/auth.controller');
//const clientes = require('../controllers/clientes.controller');
const productos = require('../controllers/productos.controller');


//========== RUTAS DE AUTENTICACIÓN ==========
router.post('/login', auth.login);



//========== RUTAS DE SERVICIOS PELUQUERIA ==========



//========== RUTAS DE PROMOCIONES ==========



//========== RUTAS DE MÓDULO DE PRODUCTOS ==========
router.post('/productos/insertar', productos.crear);
router.put('/productos/actualizar', productos.actualizar);
router.delete ('/productos/eliminar', productos.eliminar);
router.get ('/productos/ver', productos.ver)

//========== RUTAS DE MÓDULO DE CLIENTES ==========



//========== RUTAS DE FACTURACIÓN ==========


module.exports = router;