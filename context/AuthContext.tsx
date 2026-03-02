'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/apiClient';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useLeadStore } from '@/store/useLeadStore';
import { useEmployeeStore } from '@/store/useEmployeeStore';

interface AuthCtx {
    currentUser: any | null;
    setCurrentUser: (emp: any) => void;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    login: (token: string, user: any) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const isAdmin = currentUser?.role === 'admin';
    const isSuperAdmin = currentUser?.role === 'super_admin';

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await api.get('/auth/me');
                if (res.data.success) {
                    const user = res.data.data;
                    setCurrentUser(user);

                    if (user.role !== 'super_admin') {
                        // Fetch global configuration and CRM Data for regular tenants
                        useSettingsStore.getState().fetchSettings();
                        useLeadStore.getState().fetchLeads();
                        useEmployeeStore.getState().fetchEmployees();
                    }
                }
            } catch (err) {
                console.error("Failed to restore session", err);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = (token: string, user: any) => {
        localStorage.setItem('token', token);
        setCurrentUser(user);

        if (user.role !== 'super_admin') {
            useSettingsStore.getState().fetchSettings();
            useLeadStore.getState().fetchLeads();
            useEmployeeStore.getState().fetchEmployees();
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setCurrentUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ currentUser, setCurrentUser, isAdmin, isSuperAdmin, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
