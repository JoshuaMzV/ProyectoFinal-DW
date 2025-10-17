const express = require('express');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/authMiddleware');

const createAdminsRoutes = (pool) => {
    const router = express.Router();

    // Login de admin
    router.post('/login', async (req, res) => {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: 'username y password son requeridos' });
        try {
            const sql = 'SELECT * FROM admins WHERE username = $1';
            const result = await pool.query(sql, [username]);
            const admins = result.rows;
            if (admins.length === 0) return res.status(401).json({ message: 'Credenciales inválidas.' });
            const admin = admins[0];
            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) return res.status(401).json({ message: 'Credenciales inválidas.' });
            const payload = { id: admin.id, rol: 'admin', nombre_completo: admin.nombre_completo };
            const token = require('jsonwebtoken').sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
            res.json({ token });
        } catch (err) {
            console.error('Error admin login', err);
            res.status(500).json({ message: 'Error del servidor' });
        }
    });

    // Crear un admin (protegido: solo admins existentes pueden crear nuevos)
    router.post('/', protect, async (req, res) => {
        try {
            if (!req.user || req.user.rol !== 'admin') return res.status(403).json({ message: 'No autorizado' });
            const { username, password, nombre_completo, email } = req.body;
            if (!username || !password) return res.status(400).json({ message: 'username y password son requeridos' });
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);
            const sql = 'INSERT INTO admins (username, password, nombre_completo, email) VALUES ($1, $2, $3, $4) RETURNING id, username, nombre_completo, email';
            const result = await pool.query(sql, [username, hashed, nombre_completo || null, email || null]);
            res.status(201).json({ admin: result.rows[0] });
        } catch (err) {
            console.error('Error creating admin', err);
            res.status(500).json({ message: 'Error del servidor' });
        }
    });

    // Listar admins (protegido)
    router.get('/', protect, async (req, res) => {
        try {
            // Solo permitimos si el token tiene rol 'admin'
            if (!req.user || req.user.rol !== 'admin') return res.status(403).json({ message: 'No autorizado' });
            const sql = 'SELECT id, username, nombre_completo, email FROM admins';
            const result = await pool.query(sql);
            res.json({ admins: result.rows });
        } catch (err) {
            console.error('Error listing admins', err);
            res.status(500).json({ message: 'Error del servidor' });
        }
    });

    return router;
};

module.exports = createAdminsRoutes;
