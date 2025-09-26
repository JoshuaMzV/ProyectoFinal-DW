require('dotenv').config();
const express = require('express');
const cors = require('cors');
// const mysql = require('mysql2/promise');
const { Pool } = require('pg');
const createAuthRoutes = require('./routes/auth'); // <-- 1. Importamos las rutas
const createCampaignRoutes = require('./routes/campaigns'); // <-- Importa las nuevas rutas

const app = express();
const PORT = process.env.PORT || 5000;

// Usamos la URL de conexión que proporciona Render y habilitamos SSL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

app.use(cors());
app.use(express.json());

// Configuración de CORS: la URL del frontend (por ejemplo Netlify) debe ponerse en FRONTEND_URL
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
};
app.use(cors(corsOptions));

// --- Rutas de la API ---
app.use('/api/auth', createAuthRoutes(pool)); // <-- 2. Usamos las rutas de autenticación
app.use('/api/campaigns', createCampaignRoutes(pool)); // <-- 3. Usa las nuevas rutas

// La ruta de prueba ahora puede ser eliminada o comentada si lo deseas
app.get('/', (req, res) => {
    res.send('¡El servidor de la API de votaciones está funcionando!');
});

const startServer = async () => {
    try {
    await pool.query('SELECT 1');
    console.log('� Conectado exitosamente a la base de datos PostgreSQL.');

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Error fatal al conectar a la base de datos:', err.message);
        process.exit(1);
    }
};

startServer();