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

            if (!req.user || req.user.rol !== 'admin') {
                console.info(`[campaigns] usuario no autorizado id=${req.user ? req.user.id : 'anon'}`);
                return res.status(403).json({ message: 'No autorizado' });
            }

            const { titulo, descripcion, fecha_inicio, fecha_fin, cantidad_votos } = req.body;
            if (!titulo) return res.status(400).json({ message: 'El título es requerido' });

            const estado = req.body.estado || 'deshabilitada';
            const sql = `INSERT INTO campanas (titulo, descripcion, estado, fecha_inicio, fecha_fin, cantidad_votos) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
            const result = await pool.query(sql, [titulo, descripcion || null, estado, fecha_inicio || null, fecha_fin || null, cantidad_votos || null]);

            const duration = Date.now() - start;
            console.info(`[campaigns] POST / - finalizado OK - duration=${duration}ms, insertedId=${result.rows[0].id}`);
            res.status(201).json(result.rows[0]);
        } catch (err) {
            const duration = Date.now() - start;
            console.error('[campaigns] Error creating campaign', err, `duration=${duration}ms`);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // Añadir candidato a una campaña (solo admin)
    router.post('/:id/candidates', protect, async (req, res) => {
        try {
            if (!req.user || req.user.rol !== 'admin') return res.status(403).json({ message: 'No autorizado' });
            const { id } = req.params;
            const { nombre } = req.body;
            if (!nombre) return res.status(400).json({ message: 'El nombre del candidato es requerido' });

            // Verificar campaña existe
            const camp = await pool.query('SELECT id FROM campanas WHERE id = $1', [id]);
            if (camp.rows.length === 0) return res.status(404).json({ message: 'Campaña no encontrada' });

            const insertSql = 'INSERT INTO candidatos (id_campana, nombre) VALUES ($1, $2) RETURNING id, nombre';
            const result = await pool.query(insertSql, [id, nombre]);
            res.status(201).json({ candidato: result.rows[0] });
        } catch (err) {
            console.error('Error creating candidate', err);
            res.status(500).json({ message: 'Error en el servidor.' });
        }
    });

    // --- Endpoint para OBTENER todas las campañas ---
    router.get('/', async (req, res) => {
        try {
            // Obtenemos todas las campañas
            const result = await pool.query('SELECT * FROM campanas');
            const campaigns = result.rows;

            // Para cada campaña obtenemos sus candidatos y el conteo de votos
            const campaignsWithDetails = await Promise.all(campaigns.map(async (campaign) => {
                const candRes = await pool.query('SELECT id, nombre FROM candidatos WHERE id_campana = $1', [campaign.id]);
                const voteRes = await pool.query('SELECT id_candidato, COUNT(id) as votecount FROM votos WHERE id_campana = $1 GROUP BY id_candidato', [campaign.id]);

                const candidates = candRes.rows;
                const votes = voteRes.rows;

                const candidatesWithVotes = candidates.map(candidate => {
                    const voteInfo = votes.find(v => Number(v.id_candidato) === Number(candidate.id));
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

    // --- NUEVO: Endpoint para EMITIR un voto ---
    // POST /api/campaigns/:id/vote
    router.post('/:id/vote', protect, async (req, res) => {
        const { id: id_campana } = req.params;
        const { id: id_votante } = req.user; // Obtenemos el ID del votante del token
        const { candidatoId } = req.body;

        if (!candidatoId) {
            return res.status(400).json({ message: 'Se debe proporcionar un ID de candidato.' });
        }

        try {
            // 1. Verificar que la campaña exista y esté activa
            const campaignRes = await pool.query('SELECT * FROM campanas WHERE id = $1', [id_campana]);
            if (campaignRes.rows.length === 0) {
                return res.status(404).json({ message: 'La campaña no existe.' });
            }
            const campaign = campaignRes.rows[0];
            const now = new Date();
            if (campaign.estado !== 'habilitada' || now < new Date(campaign.fecha_inicio) || now > new Date(campaign.fecha_fin)) {
                return res.status(403).json({ message: 'Esta campaña no está activa para votación.' });
            }
            
            // 2. Insertar el voto (la base de datos se encargará de evitar duplicados)
            const sql = 'INSERT INTO votos (id_votante, id_campana, id_candidato) VALUES ($1, $2, $3)';
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
    router.get('/:id', async (req, res) => {
        try {
            const { id: id_campana } = req.params;
            const campaignRes = await pool.query('SELECT * FROM campanas WHERE id = $1', [id_campana]);

            if (campaignRes.rows.length === 0) {
                return res.status(404).json({ message: 'Campaña no encontrada.' });
            }

            // Obtenemos los candidatos
            const candidatesSql = 'SELECT id, nombre FROM candidatos WHERE id_campana = $1';
            const candidatesRes = await pool.query(candidatesSql, [id_campana]);
            
            // NUEVO: Hacemos un conteo de votos
            const votesSql = 'SELECT id_candidato, COUNT(id) as votecount FROM votos WHERE id_campana = $1 GROUP BY id_candidato';
            const votesRes = await pool.query(votesSql, [id_campana]);
            
            const candidates = candidatesRes.rows;
            const votes = votesRes.rows;

            // Mapeamos los votos a cada candidato
            const candidatesWithVotes = candidates.map(candidate => {
                const voteInfo = votes.find(v => Number(v.id_candidato) === Number(candidate.id));
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
    
    return router;
};

module.exports = createCampaignRoutes;