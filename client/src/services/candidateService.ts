import axios from 'axios';

const apiBase = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const apiClient = axios.create({
    baseURL: apiBase,
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface Candidate {
    id: number;
    nombre: string;
    campaign_id: number;
    campaign_titulo?: string;
    user_id?: number;
    voteCount: number;
}

// Obtener todos los candidatos (admin)
export const getAllCandidates = async (): Promise<Candidate[]> => {
    const response = await apiClient.get('/campaigns/admin/candidates/all');
    return response.data;
};

// Crear nuevo candidato (admin)
export const createCandidate = async (nombre: string, campaign_id: number, user_id?: number) => {
    const response = await apiClient.post('/campaigns/admin/candidates/create', {
        nombre,
        campaign_id,
        user_id: user_id || null
    });
    return response.data;
};

// Eliminar candidato (admin)
export const deleteCandidate = async (candidateId: number) => {
    const response = await apiClient.delete(`/campaigns/candidates/${candidateId}`);
    return response.data;
};
