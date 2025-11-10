# Lucas Pet Shop - Guía de Desarrollo con IA

## Visión General de la Arquitectura
Este es un **sistema de gestión veterinaria/tienda de mascotas** con estructura monorepo:
- **BACKEND/**: API Express.js con MySQL, autenticación JWT, integración WhatsApp y trabajos automatizados
- **FRONTEND/**: SPA React usando CoreUI, PrimeReact, TailwindCSS y Axios

## Estructura del Proyecto y Patrones Clave

### Convenciones del Backend
- **Controladores**: Seguir patrón de transacciones - siempre usar `await conn.beginTransaction()`, `await conn.commit()`, y `conn.release()` en bloques try/catch/finally
- **Protección de Rutas**: Usar middleware `verificarToken` para endpoints autenticados
- **Base de Datos**: MySQL con pool de conexiones via `config/conexion.js`
- **Jobs**: Tareas en segundo plano en `/jobs` usando `node-cron` para monitoreo de stock y notificaciones

### Convenciones del Frontend  
- **Enrutamiento**: Componentes lazy-loaded en `routes.js`, rutas protegidas usan wrapper `<ProtectedRoute>`
- **Llamadas API**: Centralizadas en `AXIOS.SERVICES/` con inyección automática de tokens via interceptors
- **Estado**: Store Redux para estado global, sessionStorage para tokens de auth
- **Estilos**: Componentes TailwindCSS + CoreUI, tema verde personalizado (`#A5CC8B`)

### Puntos de Integración Clave
- **WhatsApp**: Integración Baileys con auth QR en `config/WhatsApp.js`
- **Flujo de Auth**: Tokens JWT almacenados en sessionStorage, respuestas 401 activan logout automático
- **Notificaciones**: Sistema basado en base de datos con automatización de cron jobs

## Comandos de Desarrollo
```bash
npm run dev          # Iniciar frontend (puerto 3000) y backend (puerto 4000)
npm run dev:backend  # Solo backend
npm run dev:frontend # Solo frontend
npm run build        # Build de producción
```

## Patrones de Código

### Patrón de Controlador Backend
```javascript
exports.crear = async (req, res) => {
    const conn = await mysqlConnection.getConnection();
    await conn.beginTransaction();
    try {
        // Operaciones de base de datos
        await conn.commit();
        res.status(200).json({ Consulta: true, mensaje: 'Éxito' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ Consulta: false, error: err.message });
    } finally {
        conn.release();
    }
};
```

### Estructura de Componentes Frontend
- Componentes de vista están en `views/[modulo]/` (Clientes.js, Dashboard.js, etc.)
- Componentes de tabla nombrados `tabla-[entidad].js` 
- Modales nombrados `modal-[accion].js`
- Usar componentes CoreUI con estilos TailwindCSS

### Configuración de Environment
- Archivo `.env` en raíz (no en BACKEND/) para variables de frontend y backend
- Backend carga env con `path.resolve(process.cwd(), '..', '.env')`

## Patrones de Esquema de Base de Datos
- Tablas: `tbl_[entidad]` (tbl_clientes, tbl_productos)  
- Catálogos: `cat_[entidad]` (cat_tipo_notificacion)
- Llaves primarias: `id_[entidad]_pk`
- Llaves foráneas: `[entidad]_fk`

## Integración WhatsApp
- Usa librería Baileys con estado de auth multi-archivo
- Generación de código QR para emparejamiento  
- Envío automatizado de recordatorios via cron jobs

## Dependencias Clave
- **Backend**: express, mysql2, jsonwebtoken, @whiskeysockets/baileys, node-cron
- **Frontend**: react, @coreui/react, primereact, tailwindcss, axios, sweetalert2