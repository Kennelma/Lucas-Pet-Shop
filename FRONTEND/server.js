import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

//Servir archivos estáticos desde la carpeta 'build'
app.use(express.static(path.join(__dirname, 'build')));

//Manejar todas las rutas y redirigirlas a index.html
//Esto permite que React Router maneje las rutas del lado del cliente
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor frontend ejecutándose en puerto ${PORT}`);
});
