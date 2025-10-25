const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // <-- Asegúrate de tener esta línea
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const createAuthRoutes = (pool) => {

    // --- Endpoint de Registro ---
    router.post('/register', async (req, res) => {
        const { numero_colegiado, nombre_completo, email, dpi, fecha_nacimiento, password, username } = req.body;
        if (!numero_colegiado || !nombre_completo || !email || !dpi || !fecha_nacimiento || !password || !username) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            // Insertar en la tabla `users`
            // username: nombre de usuario auto-generado (Ej: EmilioJAM1)
            // nombre_completo: nombre real del usuario (Ej: Emilio Juanete Aguilar Moza)
            const sql = 'INSERT INTO users (username, numero_colegiado, nombre_completo, email, dpi, fecha_nacimiento, password, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id';
            const result = await pool.query(sql, [username, numero_colegiado, nombre_completo, email, dpi, fecha_nacimiento, hashedPassword, 'votante']);
            res.status(201).json({ message: 'Votante registrado exitosamente.', id: result.rows[0].id });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'El número de colegiado, DPI o email ya existen.' });
            }
            console.error('Error en el registro:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- Endpoint de Login ---
    // Soporta dos flujos:
    // 1) Admin/usuario por username + password
    // 2) Votante (o admin) por numero_colegiado + dpi + fecha_nacimiento + password
    router.post('/login', async (req, res) => {
        const { username, numero_colegiado, dpi, fecha_nacimiento, password } = req.body;

        if (!password) return res.status(400).json({ message: 'Password es requerido.' });

        try {
            let user;

            if (username) {
                // Login por username
                const sql = 'SELECT * FROM users WHERE username = $1';
                const result = await pool.query(sql, [username]);
                if (result.rows.length === 0) return res.status(401).json({ message: 'Credenciales inválidas.' });
                user = result.rows[0];
            } else {
                // Login por numero_colegiado + dpi + fecha_nacimiento
                if (!numero_colegiado || !dpi || !fecha_nacimiento) {
                    return res.status(400).json({ message: 'Faltan credenciales (numero_colegiado, dpi o fecha_nacimiento).' });
                }
                const sql = 'SELECT * FROM users WHERE numero_colegiado = $1';
                const result = await pool.query(sql, [numero_colegiado]);
                if (result.rows.length === 0) return res.status(401).json({ message: 'Credenciales inválidas.' });
                user = result.rows[0];
                // Validamos dpi y fecha
                const dbDate = user.fecha_nacimiento ? new Date(user.fecha_nacimiento).toISOString().split('T')[0] : null;
                if (user.dpi !== dpi || dbDate !== fecha_nacimiento) {
                    return res.status(401).json({ message: 'Credenciales inválidas.' });
                }
            }

            // Validar password
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) return res.status(401).json({ message: 'Credenciales inválidas.' });

            const payload = { 
                id: user.id, 
                role: user.role,
                nombre_completo: user.nombre_completo
            };
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
            const sql = 'SELECT id, numero_colegiado, nombre_completo, email, dpi, fecha_nacimiento FROM users WHERE id = $1';
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
            if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'No autorizado' });
            // Filtrar solo usuarios con role = 'votante'
            const sql = 'SELECT id, numero_colegiado, nombre_completo, email, dpi, fecha_nacimiento FROM users WHERE role = $1';
            const result = await pool.query(sql, ['votante']);
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
            if (req.user.role !== 'admin' && tokenUserId !== requestedId) return res.status(403).json({ message: 'No autorizado' });

            const sql = 'SELECT id, numero_colegiado, nombre_completo, email, dpi, fecha_nacimiento FROM users WHERE id = $1';
            const result = await pool.query(sql, [requestedId]);
            if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
            res.json({ votante: result.rows[0] });
        } catch (error) {
            console.error('Error obteniendo votante por id:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- Crear nuevo admin (solo admins) ---
    router.post('/admin', protect, async (req, res) => {
        try {
            // Verificar que el usuario actual sea admin
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'No autorizado. Solo admins pueden crear otros admins.' });
            }

            const { username, nombre_completo, password } = req.body;

            // Validaciones
            if (!username || !nombre_completo || !password) {
                return res.status(400).json({ message: 'Username, nombre completo y password son requeridos.' });
            }

            if (password.length < 6) {
                return res.status(400).json({ message: 'La password debe tener al menos 6 caracteres.' });
            }

            // Verificar que el username no exista
            const checkSql = 'SELECT id FROM users WHERE username = $1';
            const checkResult = await pool.query(checkSql, [username]);
            if (checkResult.rows.length > 0) {
                return res.status(409).json({ message: 'El username ya existe.' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insertar nuevo admin
            const insertSql = 'INSERT INTO users (username, nombre_completo, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, nombre_completo, role';
            const result = await pool.query(insertSql, [username, nombre_completo, hashedPassword, 'admin']);

            res.status(201).json({
                message: 'Admin creado exitosamente',
                admin: result.rows[0]
            });
        } catch (error) {
            console.error('Error creando admin:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- NUEVO: Endpoint para obtener todos los votantes (solo admin) ---
    router.get('/admin/voters/all', protect, async (req, res) => {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'No tienes permisos para acceder a esto' });
            }

            const sql = `
                SELECT id, numero_colegiado, nombre_completo, email, username, role, created_at
                FROM users
                WHERE role = 'votante'
                ORDER BY nombre_completo
            `;
            const result = await pool.query(sql);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error obteniendo votantes:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- NUEVO: Endpoint para eliminar votante (solo admin) ---
    router.delete('/admin/voters/:id', protect, async (req, res) => {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'No tienes permisos para hacer esto' });
            }

            const { id } = req.params;
            if (!id || isNaN(id)) {
                return res.status(400).json({ message: 'ID de votante inválido' });
            }

            // Verificar que el votante existe
            const voterCheck = await pool.query('SELECT id, nombre_completo FROM users WHERE id = $1 AND role = $2', [id, 'votante']);
            if (voterCheck.rows.length === 0) {
                return res.status(404).json({ message: 'Votante no encontrado' });
            }

            // Eliminar votos del votante (cascada)
            await pool.query('DELETE FROM votes WHERE user_id = $1', [id]);

            // Eliminar votante
            const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, nombre_completo', [id]);

            console.info(`[auth] Votante eliminado: id=${id}, nombre=${result.rows[0].nombre_completo}`);
            res.status(200).json({ message: 'Votante eliminado correctamente', id: result.rows[0].id });
        } catch (error) {
            console.error('Error eliminando votante:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    return router;
};

module.exports = createAuthRoutes;