import axiosInstance from './axiosConfig';

export interface UserProfile {
    id: number;
    nombre_completo: string;
    numero_colegiado: string;
    email: string;
    dpi: string;
    fecha_nacimiento: string;
    role: string;
    created_at: string;
    licenciatura: string;
    carrera: string;
    edad?: number;
    telefono: string;
    direccion: string;
    ciudad: string;
    info_adicional: Record<string, any>;
    profile_created_at?: string;
    profile_updated_at?: string;
    profile_image_path?: string;
}

export interface ProfileUpdateData {
    licenciatura?: string;
    carrera?: string;
    edad?: number;
    telefono?: string;
    direccion?: string;
    ciudad?: string;
    info_adicional?: Record<string, any>;
}

// Obtener perfil del usuario actual (con token automático)
export const getMyProfile = async (): Promise<UserProfile> => {
    const response = await axiosInstance.get('/profiles/me');
    return response.data.profile;
};

// Obtener perfil completo del usuario actual (con token automático)
export const getMyCompleteProfile = async (): Promise<UserProfile> => {
    const response = await axiosInstance.get('/profiles/complete/me');
    return response.data.profile;
};

// Actualizar perfil del usuario actual (con token automático)
export const updateMyProfile = async (profileData: ProfileUpdateData): Promise<UserProfile> => {
    const response = await axiosInstance.put('/profiles/me', profileData);
    return response.data.profile;
};

// Subir imagen de perfil
export const uploadProfileImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axiosInstance.post('/profiles/me/avatar', formData);

    return response.data.imageUrl;
};

// Eliminar imagen de perfil
export const deleteProfileImage = async (): Promise<void> => {
    await axiosInstance.delete('/profiles/me/avatar');
};
