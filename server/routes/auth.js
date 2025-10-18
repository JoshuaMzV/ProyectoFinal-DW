const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // <-- Asegúrate de tener esta línea
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const createAuthRoutes = (pool) => {

    // --- Endpoint de Registro ---
    router.post('/register', async (req, res) => {
        // (Tu código de registro que ya funciona)
        const { numero_colegiado, nombre_completo, email, dpi, fecha_nacimiento, password } = req.body;
        if (!numero_colegiado || !nombre_completo || !email || !dpi || !fecha_nacimiento || !password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const sql = 'INSERT INTO votantes (numero_colegiado, nombre_completo, email, dpi, fecha_nacimiento, password) VALUES ($1, $2, $3, $4, $5, $6)';
            await pool.query(sql, [numero_colegiado, nombre_completo, email, dpi, fecha_nacimiento, hashedPassword]);
            res.status(201).json({ message: 'Votante registrado exitosamente.' });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'El número de colegiado, DPI o email ya existen.' });
            }
            console.error('Error en el registro:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- Endpoint de Login ---
    router.post('/login', async (req, res) => {
        // (El código nuevo que acabas de pegar)
        const { numero_colegiado, dpi, fecha_nacimiento, password } = req.body;
        if (!numero_colegiado || !dpi || !fecha_nacimiento || !password) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }
        try {
            const sql = 'SELECT * FROM votantes WHERE numero_colegiado = $1';
            const result = await pool.query(sql, [numero_colegiado]);
            const users = result.rows;
            if (users.length === 0) {
                return res.status(401).json({ message: 'Credenciales inválidas.' });
            }
            const user = users[0];
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(401).json({ message: 'Credenciales inválidas.' });
            }
            const dbDate = new Date(user.fecha_nacimiento).toISOString().split('T')[0];
            if (user.dpi !== dpi || dbDate !== fecha_nacimiento) {
                 return res.status(401).json({ message: 'Credenciales inválidas.' });
            }
            const payload = { id: user.id, rol: user.rol };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ token });
        } catch (error) {
            console.error('Error en el login:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- Obtener mi información (protegido) ---
    router.get('/me', protect, async (req, res) => {
        try {
            const sql = 'SELECT id, numero_colegiado, nombre_completo, email, dpi, fecha_nacimiento FROM votantes WHERE id = $1';
            const result = await pool.query(sql, [req.user.id]);
            if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
            res.json({ user: result.rows[0] });
        } catch (error) {
            console.error('Error en /auth/me:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- Listar votantes (solo admins) ---
    router.get('/votantes', protect, async (req, res) => {
        try {
            if (!req.user || req.user.rol !== 'admin') return res.status(403).json({ message: 'No autorizado' });
            const sql = 'SELECT id, numero_colegiado, nombre_completo, email, dpi, fecha_nacimiento FROM votantes';
            const result = await pool.query(sql);
            res.json({ votantes: result.rows });
        } catch (error) {
            console.error('Error listando votantes:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- Obtener votante por id (admin o dueño) ---
    router.get('/votantes/:id', protect, async (req, res) => {
        try {
            const requestedId = parseInt(req.params.id, 10);
            if (isNaN(requestedId)) return res.status(400).json({ message: 'ID inválido' });
            // Si no es admin, sólo puede ver su propia información
            if (!req.user) return res.status(401).json({ message: 'No autorizado' });
            // Coercion segura: req.user.id podría venir como string desde el token
            const tokenUserId = Number(req.user.id);
            if (req.user.rol !== 'admin' && tokenUserId !== requestedId) return res.status(403).json({ message: 'No autorizado' });

            const sql = 'SELECT id, numero_colegiado, nombre_completo, email, dpi, fecha_nacimiento FROM votantes WHERE id = $1';
            const result = await pool.query(sql, [requestedId]);
            if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
            res.json({ votante: result.rows[0] });
        } catch (error) {
            console.error('Error obteniendo votante por id:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    return router;
};

module.exports = createAuthRoutes;