require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const PORT = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

mongoose.set('strictQuery', true); 
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB conectado correctamente'))
  .catch(err => {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    process.exit(1);
  });

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Importación de rutas y middleware
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const userRoutes = require('./routes/userRoutes');

// Rutas
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/api', (req, res) => {
  res.send('API funcionando');
});

app.get('/api/protected', authMiddleware, (req, res) => {
  res.send('Esta es una ruta protegida');
});

// Ruta para la página de inicio de sesión
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Ruta para la página de registro
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Ruta para la página de bienvenida
app.get('/welcome', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
});

// Manejo de rutas no encontradas
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('¡Algo salió mal!');
});

// Iniciar servidor solo si MongoDB está conectado
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
