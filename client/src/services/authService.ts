import axios from 'axios';

const DEFAULT_API = 'https://proyectofinal-dw.onrender.com/api';
const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || DEFAULT_API,
});

export interface RegisterData {
    // ... (código existente)
}

// Definimos un tipo para los datos del formulario de login
export interface LoginData {
    numero_colegiado: string;
    dpi: string;
    fecha_nacimiento: string;
    password: string;
}

// Función de registro (ya la tenías)
export const register = async (userData: RegisterData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
};

// --- NUEVO: Función para iniciar sesión ---
export const login = async (userData: LoginData) => {
    const response = await apiClient.post('/auth/login', userData);

    // Si la respuesta contiene un token, lo guardamos en el localStorage del navegador
    if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
    }

    return response.data;
};

// --- NUEVO: Función para cerrar sesión ---
export const logout = () => {
    // Simplemente removemos el token del localStorage
    localStorage.removeItem('authToken');
};

// Obtiene el usuario actual usando el token en Authorization header
export const getCurrentUser = async () => {
    const response = await apiClient.get('/auth/me');
    return response.data.user;
};