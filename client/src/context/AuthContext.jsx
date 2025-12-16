import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        if (token && username) {
            setUser({ username, token });
        }
        setLoading(false);
    }, []);

    const login = async (name, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { name, password });
            const { token, username } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);
            setUser({ username, token });
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Login failed' };
        }
    };

    const signup = async (username, password) => {
        try {
            await axios.post('http://localhost:5000/api/auth/signup', { username, password });
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Signup failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
