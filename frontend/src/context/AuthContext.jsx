import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const BASE_URL = import.meta.env.MODE === 'production'
        ? 'https://tienda-backend-fn64.onrender.com'
        : 'http://127.0.0.1:8000';

    // Al recargar la página, revisamos si el usuario ya estaba logueado y si su tiempo no ha expirado
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const savedEmail = localStorage.getItem('user_email'); 
        
        if (token && savedEmail) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                
                // NUEVO: Verificamos si el token ya expiró según el reloj
                const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
                
                if (payload.exp < currentTime) {
                    console.log("La sesión expiró por inactividad.");
                    logout(); // Expulsamos al usuario silenciosamente
                } else {
                    setUser({ id: payload.user_id, email: savedEmail });
                }
            } catch (error) {
                console.error("Token inválido", error);
                logout();
            }
        } else {
            logout(); 
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${BASE_URL}/api/token/`, {
                username: email, 
                password: password
            });

            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            localStorage.setItem('user_email', email);

            const payload = JSON.parse(atob(response.data.access.split('.')[1]));
            setUser({ id: payload.user_id, email: email });
            return { success: true };
            
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            return { success: false, error: "Correo o contraseña incorrectos." };
        }
    };

    const register = async (nombre, email, password) => {
        try {
            const response = await axios.post(`${BASE_URL}/api/register/`, {
                nombre, email, password
            });
            if (response.status === 201) {
                return await login(email, password);
            }
        } catch (error) {
            return { success: false, error: error.response?.data?.error || "Hubo un problema al registrarte." };
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_email'); 
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};