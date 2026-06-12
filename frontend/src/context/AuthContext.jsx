import { createContext, useContext, useState, useEffect } from 'react';

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
            setUser(parseToken(savedToken));
        }
    }, []);

    // Log in — save token to state and localStorage
    const login = (newToken) => {
        localStorage.setItem('culturpass_token', newToken);
        setToken(newToken);
        setUser(parseToken(newToken));
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

// Parse the JWT token to extract user info
const parseToken = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            email: payload.sub,
            role: payload.role,
        };
    } catch {
        return null;
    }
};

// Custom hook to use auth anywhere in the app
export const useAuth = () => useContext(AuthContext);

export default AuthContext;