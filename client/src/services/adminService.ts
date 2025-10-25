import axiosInstance from './axiosConfig';

export const createAdmin = async (
    username: string,
    nombre_completo: string,
    password: string
) => {
    const response = await axiosInstance.post('/auth/admin', {
        username,
        nombre_completo,
        password
    });
    return response.data;
};
