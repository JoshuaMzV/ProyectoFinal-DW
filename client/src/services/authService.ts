import axios from 'axios';

// Usar variable de entorno o localhost:5000/api
const apiBase = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const apiClient = axios.create({
    baseURL: apiBase,
});

export interface RegisterData {
    numero_colegiado: string;
    nombre_completo: string;
    email: string;
    dpi: string;
    fecha_nacimiento: string;
    password: string;
    username?: string; // Username generado automáticamente
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