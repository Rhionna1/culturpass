import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

// AuthContext — stores the logged-in user globally across the entire app
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check if a token exists in localStorage on app load
        const savedToken = localStorage.getItem('culturpass_token');
        if (savedToken) {
            setToken(savedToken);
            fetchUserInfo(savedToken);
        }
    }, []);

    // Fetch the full user info including ID from the backend
    const fetchUserInfo = (currentToken) => {
        api.get('/auth/me', {
            headers: { Authorization: `Bearer ${currentToken}` }
        })
            .then(res => setUser(res.data))
            .catch(() => {
                // Token is invalid — clear everything
                localStorage.removeItem('culturpass_token');
                setToken(null);
                setUser(null);
            });
    };

    // Log in — save token and fetch user info
    const login = (newToken) => {
        localStorage.setItem('culturpass_token', newToken);
        setToken(newToken);
        fetchUserInfo(newToken);
    };

    // Log out — clear everything
    const logout = () => {
        localStorage.removeItem('culturpass_token');
        setToken(null);
        setUser(null);
    };

    // Check if user is logged in
    const isLoggedIn = () => !!token;

    // Check if user is an admin
    const isAdmin = () => user?.role === 'ADMIN';

    return (
        <AuthContext.Provider value={{ token, user, login, logout, isLoggedIn, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth anywhere in the app
export const useAuth = () => useContext(AuthContext);

export default AuthContext;