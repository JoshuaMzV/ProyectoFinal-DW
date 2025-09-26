const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // <-- Asegúrate de tener esta línea

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
            const sql = 'INSERT INTO votantes (numero_colegiado, nombre_completo, email, dpi, fecha_nacimiento, password) VALUES (?, ?, ?, ?, ?, ?)';
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
            const sql = 'SELECT * FROM votantes WHERE numero_colegiado = ?';
            const [users] = await pool.query(sql, [numero_colegiado]);
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

    return router;
};

module.exports = createAuthRoutes;