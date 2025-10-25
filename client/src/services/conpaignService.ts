import axios from 'axios';

// Creamos una instancia de axios que usará la URL base de la API
// REACT_APP_API_URL ya incluye /api, así que no lo agregamos de nuevo
const apiBase = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const apiClient = axios.create({
    baseURL: apiBase,
});

// Esto es muy importante: un "interceptor" que se ejecuta ANTES de cada petición.
// Su trabajo es tomar el token del localStorage y añadirlo a los headers.
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Definimos la estructura de una Campaña con TypeScript
// Definimos la estructura de un Candidato
export interface Candidate {
    id: number;
    nombre: string;
    voteCount: number;
}

// Actualizamos la estructura de una Campaña para que pueda incluir candidatos
export interface Campaign {
    id: number;
    titulo: string;
    descripcion: string;
    estado: 'habilitada' | 'deshabilitada' | 'finalizada';
    fecha_inicio?: string;
    fecha_fin?: string;
    candidates?: Candidate[];
}

// Función para obtener todas las campañas
export const getAllCampaigns = async (): Promise<Campaign[]> => {
    const response = await apiClient.get('/campaigns');
    return response.data;
};

// --- NUEVO: Función para obtener una campaña por su ID ---
export const getCampaignById = async (id: string): Promise<Campaign> => {
    const response = await apiClient.get(`/campaigns/${id}`);
    return response.data;
};

// --- NUEVO: Función para emitir un voto ---
export const voteForCandidate = async (campaignId: string, candidateId: number) => {
    // En el backend esperamos { candidatoId: number }
    const response = await apiClient.post(`/campaigns/${campaignId}/vote`, { candidatoId: candidateId });
    return response.data;
};

// --- NUEVO: Función para eliminar una campaña ---
export const deleteCampaign = async (campaignId: number) => {
    const response = await apiClient.delete(`/campaigns/${campaignId}`);
    return response.data;
};
