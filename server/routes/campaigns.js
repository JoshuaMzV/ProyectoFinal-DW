const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const createCampaignRoutes = (pool) => {
    // --- Endpoints de Admin para crear campaña y añadir candidatos (ya los teníamos) ---
    router.post('/', protect, async (req, res) => { /* ...código existente... */ });
    router.post('/:id/candidates', protect, async (req, res) => { /* ...código existente... */ });

    // --- Endpoint para OBTENER todas las campañas ---
    router.get('/', async (req, res) => {
        try {
            // Obtenemos todas las campañas
            const [campaigns] = await pool.query('SELECT * FROM campanas');

            // Para cada campaña obtenemos sus candidatos y el conteo de votos
            const campaignsWithDetails = await Promise.all(campaigns.map(async (campaign) => {
                const [candidates] = await pool.query('SELECT id, nombre FROM candidatos WHERE id_campana = ?', [campaign.id]);
                const [votes] = await pool.query('SELECT id_candidato, COUNT(id) as voteCount FROM votos WHERE id_campana = ? GROUP BY id_candidato', [campaign.id]);

                const candidatesWithVotes = candidates.map(candidate => {
                    const voteInfo = votes.find(v => v.id_candidato === candidate.id);
                    return {
                        ...candidate,
                        voteCount: voteInfo ? voteInfo.voteCount : 0
                    };
                });

                // Añadimos los candidatos al objeto de la campaña
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
            const [campaigns] = await pool.query('SELECT * FROM campanas WHERE id = ?', [id_campana]);
            if (campaigns.length === 0) {
                return res.status(404).json({ message: 'La campaña no existe.' });
            }
            const campaign = campaigns[0];
            const now = new Date();
            if (campaign.estado !== 'habilitada' || now < new Date(campaign.fecha_inicio) || now > new Date(campaign.fecha_fin)) {
                return res.status(403).json({ message: 'Esta campaña no está activa para votación.' });
            }
            
            // 2. Insertar el voto (la base de datos se encargará de evitar duplicados)
            const sql = 'INSERT INTO votos (id_votante, id_campana, id_candidato) VALUES (?, ?, ?)';
            await pool.query(sql, [id_votante, id_campana, candidatoId]);

            res.status(201).json({ message: 'Voto registrado exitosamente.' });
        } catch (error) {
            // Si el error es por la restricción UNIQUE, significa que ya votó
            if (error.code === 'ER_DUP_ENTRY') {
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
            const campaignSql = 'SELECT * FROM campanas WHERE id = ?';
            const [campaigns] = await pool.query(campaignSql, [id_campana]);

            if (campaigns.length === 0) {
                return res.status(404).json({ message: 'Campaña no encontrada.' });
            }

            // Obtenemos los candidatos
            const candidatesSql = 'SELECT id, nombre FROM candidatos WHERE id_campana = ?';
            const [candidates] = await pool.query(candidatesSql, [id_campana]);
            
            // NUEVO: Hacemos un conteo de votos
            const votesSql = 'SELECT id_candidato, COUNT(id) as voteCount FROM votos WHERE id_campana = ? GROUP BY id_candidato';
            const [votes] = await pool.query(votesSql, [id_campana]);
            
            // Mapeamos los votos a cada candidato
            const candidatesWithVotes = candidates.map(candidate => {
                const voteInfo = votes.find(v => v.id_candidato === candidate.id);
                return {
                    ...candidate,
                    voteCount: voteInfo ? voteInfo.voteCount : 0
                };
            });

            const campaignData = campaigns[0];
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