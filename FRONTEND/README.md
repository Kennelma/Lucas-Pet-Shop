# Lucas Pet Shop - Frontend

Aplicación web frontend para el sistema de gestión de Lucas Pet Shop, construida con React y Vite.

## Requisitos Previos

- Node.js (v16 o superior)
- npm o yarn

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
   - Copiar `.env.example` a `.env`
   - Configurar la URL del API backend

## Configuración de Variables de Entorno

```
VITE_API_URL=http://localhost:4000/api
```

Cambia la URL según donde esté corriendo tu backend.

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo (Vite)
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza el build de producción
- `npm start` - Sirve la aplicación buildada con Express

## Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (puerto por defecto de Vite).

## Producción

1. Construir la aplicación:
```bash
npm run build
```

2. Los archivos estarán en la carpeta `/build`

3. Para servir la aplicación:
```bash
npm start
```

## Tecnologías Principales
- React 19
- Vite
- React Router
- Axios
- CoreUI
- PrimeReact
- Tailwind CSS
