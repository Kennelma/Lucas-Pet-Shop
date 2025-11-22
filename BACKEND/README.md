# Lucas Pet Shop - Backend

API RESTful para el sistema de gestión de Lucas Pet Shop.

## Requisitos Previos

- Node.js (v16 o superior)
- MySQL (v8 o superior)
- npm o yarn

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
   - Copiar `.env.example` a `.env`
   - Configurar las variables según tu entorno

3. Crear la base de datos MySQL según el nombre configurado en `.env`

## Configuración de Variables de Entorno

Ver archivo `.env.example` para todas las variables requeridas.

### Email (Gmail)
Para usar Gmail, debes generar una contraseña de aplicación:
1. Ve a tu cuenta de Google
2. Seguridad > Verificación en dos pasos
3. Contraseñas de aplicaciones
4. Genera una nueva contraseña
5. Usa esa contraseña en `EMAIL_PASSWORD`

## Scripts Disponibles

- `npm start` - Inicia el servidor en modo producción
- `npm run dev` - Inicia el servidor en modo desarrollo

## Estructura del Proyecto

- `/config` - Configuraciones (DB, Email, WhatsApp)
- `/controllers` - Lógica de negocio
- `/routes` - Definición de rutas
- `/middleware` - Middlewares de autenticación y permisos
- `/jobs` - Tareas programadas (cron jobs)

## Puerto

El servidor corre por defecto en el puerto `4000`. Puedes cambiarlo en el archivo `.env`.
