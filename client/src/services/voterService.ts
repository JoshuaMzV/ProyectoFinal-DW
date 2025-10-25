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

export interface Voter {
    id: number;
    numero_colegiado?: string;
    nombre_completo: string;
    email: string;
    username: string;
    role: string;
    created_at?: string;
}

// Obtener todos los votantes (admin)
export const getAllVoters = async (): Promise<Voter[]> => {
    const response = await apiClient.get('/auth/admin/voters/all');
    return response.data;
};

// Eliminar votante (admin)
export const deleteVoter = async (voterId: number) => {
    const response = await apiClient.delete(`/auth/admin/voters/${voterId}`);
    return response.data;
};
