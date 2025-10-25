const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Configurar multer para guardar imágenes de perfil
const uploadsDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generar nombre: user_ID_timestamp.ext
        const ext = path.extname(file.originalname);
        const filename = `user_${req.user.id}_${Date.now()}${ext}`;
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    // Permitir solo imágenes
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const createProfileRoutes = (pool) => {
    // --- Obtener perfil del usuario actual (protegido) ---
    router.get('/me', protect, async (req, res) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: 'No autorizado' });
            }

            // Solo votantes pueden ver su perfil
            if (req.user.role !== 'votante') {
                return res.status(403).json({ message: 'Solo los votantes pueden acceder a su perfil.' });
            }

            const sql = `
                SELECT 
                    u.id, u.nombre_completo, u.numero_colegiado, u.email, u.dpi, u.fecha_nacimiento, u.role,
                    COALESCE(up.licenciatura, '') as licenciatura,
                    COALESCE(up.carrera, '') as carrera,
                    COALESCE(up.edad, NULL) as edad,
                    COALESCE(up.telefono, '') as telefono,
                    COALESCE(up.direccion, '') as direccion,
                    COALESCE(up.ciudad, '') as ciudad,
                    COALESCE(up.profile_image_path, NULL) as profile_image_path,
                    COALESCE(up.info_adicional, '{}'::jsonb) as info_adicional,
                    up.created_at, up.updated_at
                FROM public.users u
                LEFT JOIN public.user_profiles up ON u.id = up.user_id
                WHERE u.id = $1
            `;

            const result = await pool.query(sql, [req.user.id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Si no hay perfil, devolver datos del usuario de todas formas
            res.json({ profile: result.rows[0] });
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- Actualizar o crear perfil del usuario (protegido) ---
    router.put('/me', protect, async (req, res) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: 'No autorizado' });
            }

            // Solo votantes pueden actualizar su perfil
            if (req.user.role !== 'votante') {
                return res.status(403).json({ message: 'Solo los votantes pueden actualizar su perfil.' });
            }

            const { licenciatura, carrera, edad, telefono, direccion, ciudad, info_adicional } = req.body;
            const userId = req.user.id;

            // Verificar si el perfil ya existe
            const checkSql = 'SELECT id FROM public.user_profiles WHERE user_id = $1';
            const checkResult = await pool.query(checkSql, [userId]);

            let result;
            if (checkResult.rows.length === 0) {
                // Crear nuevo perfil
                const insertSql = `
                    INSERT INTO public.user_profiles 
                    (user_id, licenciatura, carrera, edad, telefono, direccion, ciudad, info_adicional)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    RETURNING *
                `;
                result = await pool.query(insertSql, [
                    userId,
                    licenciatura || null,
                    carrera || null,
                    edad || null,
                    telefono || null,
                    direccion || null,
                    ciudad || null,
                    info_adicional ? JSON.stringify(info_adicional) : '{}'
                ]);
            } else {
                // Actualizar perfil existente
                const updateSql = `
                    UPDATE public.user_profiles
                    SET 
                        licenciatura = $2,
                        carrera = $3,
                        edad = $4,
                        telefono = $5,
                        direccion = $6,
                        ciudad = $7,
                        info_adicional = $8,
                        updated_at = now()
                    WHERE user_id = $1
                    RETURNING *
                `;
                result = await pool.query(updateSql, [
                    userId,
                    licenciatura || null,
                    carrera || null,
                    edad || null,
                    telefono || null,
                    direccion || null,
                    ciudad || null,
                    info_adicional ? JSON.stringify(info_adicional) : '{}'
                ]);
            }

            res.json({ 
                message: checkResult.rows.length === 0 ? 'Perfil creado exitosamente' : 'Perfil actualizado exitosamente',
                profile: result.rows[0] 
            });
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- Obtener perfil completo del usuario actual (con datos de users) ---
    router.get('/complete/me', protect, async (req, res) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: 'No autorizado' });
            }

            // Solo votantes pueden ver su perfil completo
            if (req.user.role !== 'votante') {
                return res.status(403).json({ message: 'Solo los votantes pueden acceder a su perfil.' });
            }

            const sql = `
                SELECT 
                    u.id, u.nombre_completo, u.numero_colegiado, u.email, u.dpi, u.fecha_nacimiento, u.role, u.created_at,
                    COALESCE(up.licenciatura, '') as licenciatura,
                    COALESCE(up.carrera, '') as carrera,
                    COALESCE(up.edad, NULL) as edad,
                    COALESCE(up.telefono, '') as telefono,
                    COALESCE(up.direccion, '') as direccion,
                    COALESCE(up.ciudad, '') as ciudad,
                    COALESCE(up.profile_image_path, NULL) as profile_image_path,
                    COALESCE(up.info_adicional, '{}'::jsonb) as info_adicional,
                    up.created_at as profile_created_at, up.updated_at as profile_updated_at
                FROM public.users u
                LEFT JOIN public.user_profiles up ON u.id = up.user_id
                WHERE u.id = $1
            `;

            const result = await pool.query(sql, [req.user.id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            res.json({ profile: result.rows[0] });
        } catch (error) {
            console.error('Error obteniendo perfil completo:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- Subir imagen de perfil ---
    router.post('/me/avatar', protect, upload.single('avatar'), async (req, res) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: 'No autorizado' });
            }

            if (req.user.role !== 'votante') {
                return res.status(403).json({ message: 'Solo los votantes pueden subir imagen de perfil.' });
            }

            if (!req.file) {
                return res.status(400).json({ message: 'No se envió archivo' });
            }

            const imageUrl = `/uploads/profiles/${req.file.filename}`;

            // Actualizar la ruta en la BD
            const sql = `
                UPDATE public.user_profiles
                SET profile_image_path = $1, updated_at = now()
                WHERE user_id = $2
                RETURNING *
            `;

            const result = await pool.query(sql, [imageUrl, req.user.id]);
            if (result.rows.length === 0) {
                // Si no existe perfil, crear uno
                const insertSql = `
                    INSERT INTO public.user_profiles (user_id, profile_image_path)
                    VALUES ($1, $2)
                    RETURNING *
                `;
                await pool.query(insertSql, [req.user.id, imageUrl]);
            }

            res.json({ 
                message: 'Imagen de perfil subida exitosamente',
                imageUrl 
            });
        } catch (error) {
            console.error('Error subiendo imagen:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- Eliminar imagen de perfil ---
    router.delete('/me/avatar', protect, async (req, res) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: 'No autorizado' });
            }

            if (req.user.role !== 'votante') {
                return res.status(403).json({ message: 'Solo los votantes pueden eliminar su imagen.' });
            }

            // Obtener ruta actual de imagen
            const getSql = 'SELECT profile_image_path FROM public.user_profiles WHERE user_id = $1';
            const getResult = await pool.query(getSql, [req.user.id]);

            if (getResult.rows.length > 0 && getResult.rows[0].profile_image_path) {
                const imagePath = path.join(__dirname, '../uploads/profiles', 
                    path.basename(getResult.rows[0].profile_image_path));
                
                // Eliminar archivo del filesystem
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            // Eliminar ruta de la BD
            const deleteSql = `
                UPDATE public.user_profiles
                SET profile_image_path = NULL, updated_at = now()
                WHERE user_id = $1
                RETURNING *
            `;
            await pool.query(deleteSql, [req.user.id]);

            res.json({ message: 'Imagen de perfil eliminada exitosamente' });
        } catch (error) {
            console.error('Error eliminando imagen:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    return router;
};

module.exports = createProfileRoutes;
