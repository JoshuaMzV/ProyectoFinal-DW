const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const createCampaignRoutes = (pool) => {
    // --- Endpoints de Admin para crear campaña y añadir candidatos ---
    // Crear una campaña (solo admin)
    router.post('/', protect, async (req, res) => {
        const start = Date.now();
        console.info(`[campaigns] POST / - llegada de petición - time=${new Date().toISOString()}`);
        try {
            // Log mínimo para diagnóstico: quién, headers y body resumido
            console.info(`[campaigns] headers AuthorizationPresent=${!!req.headers.authorization}, content-type=${req.headers['content-type']}`);
            console.info(`[campaigns] body keys=${Object.keys(req.body).join(',')}`);

            if (!req.user || req.user.role !== 'admin') {
                console.info(`[campaigns] usuario no autorizado id=${req.user ? req.user.id : 'anon'}`);
                return res.status(403).json({ message: 'No tienes permisos suficientes para esto', code: -3 });
            }

            const { titulo, descripcion, fecha_inicio, fecha_fin, cantidad_votos, id: incomingId } = req.body;
            if (incomingId) console.warn('[campaigns] Ignorando id proporcionado por el cliente al crear campaña', incomingId);
            if (!titulo) return res.status(400).json({ message: 'El título es requerido' });

            // Normalizar/validar estado para cumplir la restricción CHECK en la tabla
            const allowed = ['habilitada', 'deshabilitada', 'finalizada'];
            let estadoRaw = (req.body.estado || 'deshabilitada').toString().trim().toLowerCase();
            if (estadoRaw === 'habilitado') estadoRaw = 'habilitada'; // aceptar variante
            const estado = allowed.includes(estadoRaw) ? estadoRaw : 'deshabilitada';
            const sql = `INSERT INTO campaigns (titulo, descripcion, estado, fecha_inicio, fecha_fin, cantidad_votos) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
            const result = await pool.query(sql, [titulo, descripcion || null, estado, fecha_inicio || null, fecha_fin || null, cantidad_votos || null]);

            const duration = Date.now() - start;
            console.info(`[campaigns] POST / - finalizado OK - duration=${duration}ms, insertedId=${result.rows[0].id}`);
            res.status(201).json(result.rows[0]);
        } catch (err) {
            const duration = Date.now() - start;
            console.error('[campaigns] Error creating campaign', { message: err.message, code: err.code, stack: err.stack, duration: `${duration}ms` });
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // Añadir candidato a una campaña (solo admin)
    router.post('/:id/candidates', protect, async (req, res) => {
        try {
            if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'No autorizado' });
            const { id } = req.params;
            const { nombre, userId } = req.body;
            
            if (!nombre && !userId) return res.status(400).json({ message: 'Se requiere nombre o userId para crear candidato' });

            // Verificar campaña existe
            const camp = await pool.query('SELECT id FROM campaigns WHERE id = $1', [id]);
            if (camp.rows.length === 0) return res.status(404).json({ message: 'Campaña no encontrada' });

            let candidateName = nombre;
            let userRef = null;

            // Si se provee userId, obtener datos del votante y copiar su nombre
            if (userId) {
                const u = await pool.query('SELECT id, nombre_completo FROM users WHERE id = $1', [userId]);
                if (u.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado por userId' });
                
                userRef = u.rows[0].id;
                // Si no se proporciona nombre, usar el del votante
                candidateName = nombre || u.rows[0].nombre_completo;
            }

            if (!candidateName) {
                return res.status(400).json({ message: 'El nombre del candidato es requerido' });
            }

            const insertSql = 'INSERT INTO candidates (campaign_id, nombre, user_id) VALUES ($1, $2, $3) RETURNING id, nombre, user_id';
            const result = await pool.query(insertSql, [id, candidateName, userRef]);
            
            console.info(`[campaigns] Candidato creado: id=${result.rows[0].id}, nombre=${candidateName}`);
            res.status(201).json({ candidato: result.rows[0] });
        } catch (err) {
            console.error('Error creating candidate', err);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- Endpoint para OBTENER todas las campañas ---
    // PROTEGIDO: Solo usuarios autenticados pueden ver campañas
    router.get('/', protect, async (req, res) => {
        try {
            // Obtenemos todas las campañas
            const result = await pool.query('SELECT * FROM campaigns');
            const campaigns = result.rows;

            // Para cada campaña obtenemos sus candidatos y el conteo de votos
            const campaignsWithDetails = await Promise.all(campaigns.map(async (campaign) => {
                const candRes = await pool.query('SELECT id, nombre FROM candidates WHERE campaign_id = $1', [campaign.id]);
                const voteRes = await pool.query('SELECT candidate_id, COUNT(id) as votecount FROM votes WHERE campaign_id = $1 GROUP BY candidate_id', [campaign.id]);

                const candidates = candRes.rows;
                const votes = voteRes.rows;

                const candidatesWithVotes = candidates.map(candidate => {
                    const voteInfo = votes.find(v => Number(v.candidate_id) === Number(candidate.id));
                    return {
                        ...candidate,
                        voteCount: voteInfo ? Number(voteInfo.votecount) : 0
                    };
                });

                const c = { ...campaign };
                c.candidates = candidatesWithVotes;
                return c;
            }));

            res.status(200).json(campaignsWithDetails);
        } catch (error) {
            console.error('Error al obtener campañas:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- NUEVO: Endpoint para obtener TODOS los candidatos (solo admin) ---
    router.get('/admin/candidates/all', protect, async (req, res) => {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'No tienes permisos para acceder a esto' });
            }

            const sql = `
                SELECT c.id, c.nombre, c.campaign_id, c.user_id, camp.titulo as campaign_titulo,
                       COUNT(v.id) as voteCount
                FROM candidates c
                LEFT JOIN campaigns camp ON c.campaign_id = camp.id
                LEFT JOIN votes v ON c.id = v.candidate_id
                GROUP BY c.id, c.nombre, c.campaign_id, c.user_id, camp.titulo
                ORDER BY camp.titulo, c.nombre
            `;
            const result = await pool.query(sql);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error obteniendo candidatos:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- NUEVO: Endpoint para crear candidato (solo admin) ---
    router.post('/admin/candidates/create', protect, async (req, res) => {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'No tienes permisos para hacer esto' });
            }

            const { nombre, campaign_id, user_id } = req.body;
            
            if (!nombre || !campaign_id) {
                return res.status(400).json({ message: 'El nombre y campaign_id son requeridos' });
            }

            // Verificar que la campaña existe
            const campaignCheck = await pool.query('SELECT id FROM campaigns WHERE id = $1', [campaign_id]);
            if (campaignCheck.rows.length === 0) {
                return res.status(404).json({ message: 'Campaña no encontrada' });
            }

            const sql = 'INSERT INTO candidates (nombre, campaign_id, user_id) VALUES ($1, $2, $3) RETURNING *';
            const result = await pool.query(sql, [nombre, campaign_id, user_id || null]);

            console.info(`[campaigns] Candidato creado: id=${result.rows[0].id}`);
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creando candidato:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- Endpoint para EMITIR un voto ---
    // POST /api/campaigns/:id/vote
    router.post('/:id/vote', protect, async (req, res) => {
        const { id: id_campana } = req.params;
        const { id: id_votante } = req.user; // Obtenemos el ID del votante del token
        // Aceptamos varias formas para identificar candidato en body
        const candidatoId = req.body.candidatoId || req.body.candidateId || req.body.id || req.body.candidato || req.body.candidate;

        if (!candidatoId) {
            return res.status(400).json({ message: 'Se debe proporcionar un ID de candidato. Usa { "candidatoId": 1 } en el body.' });
        }

        try {
            // 1. Verificar que la campaña exista y esté activa
            const campaignRes = await pool.query('SELECT * FROM campaigns WHERE id = $1', [id_campana]);
            if (campaignRes.rows.length === 0) {
                return res.status(404).json({ message: 'La campaña no existe.' });
            }
            const campaign = campaignRes.rows[0];
            const now = new Date();
            if (campaign.estado !== 'habilitada' || now < new Date(campaign.fecha_inicio) || now > new Date(campaign.fecha_fin)) {
                return res.status(403).json({ message: 'Esta campaña no está activa para votación.' });
            }
            
            // 2. Verificar candidato y evitar self-vote
            const candRes = await pool.query('SELECT id, user_id, campaign_id FROM candidates WHERE id = $1', [candidatoId]);
            if (candRes.rows.length === 0) {
                return res.status(404).json({ message: 'Candidato no encontrado.' });
            }
            const candidate = candRes.rows[0];
            // Asegurar que el candidato pertenece a la campaña indicada
            if (Number(candidate.campaign_id) !== Number(id_campana)) {
                return res.status(400).json({ message: 'El candidato no pertenece a esta campaña.' });
            }
            // Evitar que un usuario vote por sí mismo (si el candidato está ligado a un user_id)
            if (candidate.user_id && Number(candidate.user_id) === Number(id_votante)) {
                return res.status(403).json({ message: 'No puedes votar por ti mismo.' });
            }

            // 3. Insertar el voto (la base de datos se encargará de evitar duplicados)
            const sql = 'INSERT INTO votes (user_id, campaign_id, candidate_id) VALUES ($1, $2, $3)';
            await pool.query(sql, [id_votante, id_campana, candidatoId]);

            res.status(201).json({ message: 'Voto registrado exitosamente.' });
        } catch (error) {
            // Si el error es por la restricción UNIQUE, significa que ya votó
            // En Postgres el código de error por violación de unique es 23505
            if (error.code === '23505') {
                return res.status(409).json({ message: 'Ya has votado en esta campaña.' });
            }
            console.error('Error al emitir el voto:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- ACTUALIZADO: Endpoint para OBTENER detalles de campaña con resultados ---
    // PROTEGIDO: Solo usuarios autenticados
    router.get('/:id', protect, async (req, res) => {
        try {
            const { id: id_campana } = req.params;
            const campaignRes = await pool.query('SELECT * FROM campaigns WHERE id = $1', [id_campana]);

            if (campaignRes.rows.length === 0) {
                return res.status(404).json({ message: 'Campaña no encontrada.' });
            }

            // Obtenemos los candidatos
            const candidatesSql = 'SELECT id, nombre FROM candidates WHERE campaign_id = $1';
            const candidatesRes = await pool.query(candidatesSql, [id_campana]);
            
            // NUEVO: Hacemos un conteo de votos
            const votesSql = 'SELECT candidate_id, COUNT(id) as votecount FROM votes WHERE campaign_id = $1 GROUP BY candidate_id';
            const votesRes = await pool.query(votesSql, [id_campana]);
            
            const candidates = candidatesRes.rows;
            const votes = votesRes.rows;

            // Mapeamos los votos a cada candidato
            const candidatesWithVotes = candidates.map(candidate => {
                const voteInfo = votes.find(v => Number(v.candidate_id) === Number(candidate.id));
                return {
                    ...candidate,
                    voteCount: voteInfo ? Number(voteInfo.votecount) : 0
                };
            });

            const campaignData = campaignRes.rows[0];
            campaignData.candidates = candidatesWithVotes;

            res.status(200).json(campaignData);
        } catch (error) {
            console.error('Error al obtener detalles de la campaña:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- NUEVO: Endpoint para EDITAR campaña (solo admin) ---
    router.patch('/:id', protect, async (req, res) => {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'No autorizado' });
            }
            const { id } = req.params;
            const { titulo, descripcion, estado } = req.body;

            // Construir query dinámicamente según qué campos se envíen
            const updates = [];
            const values = [];
            let paramCount = 1;

            if (titulo !== undefined) {
                updates.push(`titulo = $${paramCount++}`);
                values.push(titulo);
            }
            if (descripcion !== undefined) {
                updates.push(`descripcion = $${paramCount++}`);
                values.push(descripcion);
            }
            if (estado !== undefined) {
                const allowed = ['habilitada', 'deshabilitada', 'finalizada'];
                if (!allowed.includes(estado.toLowerCase())) {
                    return res.status(400).json({ message: 'Estado inválido' });
                }
                updates.push(`estado = $${paramCount++}`);
                values.push(estado.toLowerCase());
            }

            if (updates.length === 0) {
                return res.status(400).json({ message: 'No hay campos para actualizar' });
            }

            values.push(id);
            const sql = `UPDATE campaigns SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
            const result = await pool.query(sql, values);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Campaña no encontrada' });
            }

            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Error actualizando campaña:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- NUEVO: Endpoint para ELIMINAR candidato (solo si no tiene votos) ---
    // DEBE IR ANTES DE DELETE /:id para evitar shadowing
    router.delete('/candidates/:candidateId', protect, async (req, res) => {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'No autorizado' });
            }
            const { candidateId } = req.params;

            // Verificar si el candidato tiene votos
            const voteRes = await pool.query('SELECT COUNT(*) as vote_count FROM votes WHERE candidate_id = $1', [candidateId]);
            const voteCount = parseInt(voteRes.rows[0].vote_count, 10);
            if (voteCount > 0) {
                return res.status(403).json({ message: 'No puedes eliminar un candidato que ya tiene votos' });
            }

            // Eliminar candidato
            const result = await pool.query('DELETE FROM candidates WHERE id = $1 RETURNING id', [candidateId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Candidato no encontrado' });
            }

            res.status(200).json({ message: 'Candidato eliminado exitosamente' });
        } catch (error) {
            console.error('Error eliminando candidato:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- NUEVO: Endpoint para ELIMINAR campaña (solo admin) ---
    // Esta ruta DELETE /:id DEBE IR DESPUÉS de DELETE /candidates/:candidateId
    router.delete('/:id', protect, async (req, res) => {
        const client = await pool.connect();
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ message: 'No tienes permisos para eliminar campañas' });
            }

            const { id } = req.params;
            if (!id || isNaN(id)) {
                return res.status(400).json({ message: 'ID de campaña inválido' });
            }

            // Iniciar transacción
            await client.query('BEGIN');

            // Verificar que la campaña existe
            const campaignCheck = await client.query('SELECT id FROM campaigns WHERE id = $1', [id]);
            if (campaignCheck.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Campaña no encontrada' });
            }

            // 1. Obtener todos los candidatos de la campaña
            const candidatesRes = await client.query('SELECT id FROM candidates WHERE campaign_id = $1', [id]);
            const candidateIds = candidatesRes.rows.map(c => c.id);

            // 2. Eliminar los votos de esos candidatos
            if (candidateIds.length > 0) {
                await client.query('DELETE FROM votes WHERE candidate_id = ANY($1)', [candidateIds]);
                console.info(`[campaigns] Votos eliminados para campaña ${id}`);
            }

            // 3. Eliminar los candidatos
            await client.query('DELETE FROM candidates WHERE campaign_id = $1', [id]);
            console.info(`[campaigns] Candidatos eliminados para campaña ${id}`);

            // 4. Eliminar la campaña
            const result = await client.query('DELETE FROM campaigns WHERE id = $1 RETURNING id', [id]);

            // Confirmar transacción
            await client.query('COMMIT');

            console.info(`[campaigns] Campaña eliminada: id=${id}`);
            res.status(200).json({ message: 'Campaña eliminada correctamente', id: result.rows[0].id });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error eliminando campaña:', error);
            res.status(500).json({ message: 'Error en el servidor.' });
        } finally {
            client.release();
        }
    });
    
    return router;
};

module.exports = createCampaignRoutes;