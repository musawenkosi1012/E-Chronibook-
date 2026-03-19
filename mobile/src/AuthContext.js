import React, { createContext, useContext, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);

    const login = async (accessToken, userData) => {
        setToken(accessToken);
        setUser(userData);
        await SecureStore.setItemAsync('token', accessToken);
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
    };

    const logout = async () => {
        setToken(null);
        setUser(null);
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
    };

    const restore = async () => {
        try {
            const t = await SecureStore.getItemAsync('token');
            const u = await SecureStore.getItemAsync('user');
            if (t && u) {
                setToken(t);
                setUser(JSON.parse(u));
                return true;
            }
        } catch { }
        return false;
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, restore }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
