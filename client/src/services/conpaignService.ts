import axios from 'axios';

// Creamos una instancia de axios que usará la URL base de la API
const DEFAULT_API = 'https://proyectofinal-dw.onrender.com/api';
const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || DEFAULT_API,
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

// Response interceptor: si recibimos 401/403, limpiamos el token local
apiClient.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            localStorage.removeItem('authToken');
            // Nota: no hacemos navigate aquí (no tenemos acceso a router),
            // el AuthProvider detectará la ausencia del token en el siguiente render.
        }
        return Promise.reject(err);
    }
);

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
    // Fechas en formato ISO (string) según backend
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