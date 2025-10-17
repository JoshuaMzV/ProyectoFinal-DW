import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as authService from '../services/authService';

// 1. Definimos la forma de los datos que compartiremos
interface UserType {
    id?: number;
    rol?: string;
    nombre?: string;
    apellido?: string;
}

interface AuthContextType {
    user: UserType | null;
    isLoading: boolean; // indica si aún verificamos la sesión
    login: (userData: authService.LoginData) => Promise<void>;
    logout: () => void;
}

// 2. Creamos el Context con un valor inicial
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Creamos el "Proveedor", el componente que envolverá nuestra aplicación
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserType | null>(null);
    const [isLoading, setIsLoading] = useState(true); // iniciamos en true hasta verificar el token

    // Este efecto se ejecuta una sola vez cuando la app carga
    useEffect(() => {
        const init = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (token) {
                    // Intentamos obtener datos reales del servidor
                    try {
                        const serverUser = await authService.getCurrentUser();
                        const nombreCompleto = serverUser.nombre_completo || serverUser.nombre_completo || '';
                        const parts = (nombreCompleto || '').trim().split(/\s+/);
                        setUser({
                            id: serverUser.id,
                            rol: serverUser.rol,
                            nombre: parts[0] || '',
                            apellido: parts[1] || '',
                        });
                        return;
                    } catch (err) {
                        // Si falla la petición al servidor, hacemos fallback a decodificar el token
                        const decodedUser: any = jwtDecode(token);
                        const nombreCompleto = decodedUser.nombre_completo || decodedUser.nombre || decodedUser.name || decodedUser.firstName || '';
                        const parts = nombreCompleto.trim().split(/\s+/);
                        setUser({
                            id: decodedUser.id || decodedUser.sub,
                            rol: decodedUser.rol || decodedUser.role,
                            nombre: parts[0] || '',
                            apellido: parts[1] || '',
                        });
                    }
                }
            } catch (error) {
            // Si el token es inválido, lo limpiamos
            localStorage.removeItem('authToken');
            setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    // Función de login que actualiza el estado global
    const login = async (userData: authService.LoginData) => {
        await authService.login(userData);
        const token = localStorage.getItem('authToken');
        if (token) {
            const decodedUser: any = jwtDecode(token);
            const nombreCompleto = decodedUser.nombre_completo || decodedUser.nombre || decodedUser.name || decodedUser.firstName || '';
            const parts = nombreCompleto.trim().split(/\s+/);
            setUser({
                id: decodedUser.id || decodedUser.sub,
                rol: decodedUser.rol || decodedUser.role,
                nombre: parts[0] || '',
                apellido: parts[1] || '',
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