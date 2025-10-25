import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as authService from '../services/authService';

// 1. Definimos la forma de los datos que compartiremos
interface AuthContextType {
    user: { id: number; role: string; nombre_completo?: string } | null;
    isLoading: boolean; // indica si aún verificamos la sesión
    login: (userData: authService.LoginData) => Promise<void>;
    logout: () => void;
}

// 2. Creamos el Context con un valor inicial
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Creamos el "Proveedor", el componente que envolverá nuestra aplicación
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<{ id: number; role: string; nombre_completo?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true); // iniciamos en true hasta verificar el token

    // Este efecto se ejecuta una sola vez cuando la app carga
    useEffect(() => {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                const decoded: any = jwtDecode(token);
                setUser({ 
                    id: decoded.id, 
                    role: decoded.role,
                    nombre_completo: decoded.nombre_completo 
                });
            }
        } catch (error) {
            // Si el token es inválido, lo limpiamos
            localStorage.removeItem('authToken');
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Función de login que actualiza el estado global
    const login = async (userData: authService.LoginData) => {
        await authService.login(userData);
        const token = localStorage.getItem('authToken');
        if (token) {
            const decoded: any = jwtDecode(token);
            setUser({ 
                id: decoded.id, 
                role: decoded.role,
                nombre_completo: decoded.nombre_completo
            });
        }
    };

    // Función de logout que limpia el estado global
    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 4. Creamos un "Hook" personalizado para consumir el contexto fácilmente
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};