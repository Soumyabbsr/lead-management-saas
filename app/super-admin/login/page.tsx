'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Shield } from 'lucide-react';
import api from '@/lib/apiClient';

export default function SuperAdminLogin() {
    const [email, setEmail] = useState('admin@pgcrm.com');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [loadingLocal, setLoadingLocal] = useState(false);

    const router = useRouter();
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoadingLocal(true);

        try {
            const res = await api.post('/api/auth/login', { email, password });

            if (res.data.success) {
                const user = res.data.data.user;
                if (user.role !== 'super_admin') {
                    setError('Not authorized. Use the vendor login page.');
                    setLoadingLocal(false);
                    return;
                }
                login(res.data.data.token, user);
                router.push('/super-admin/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid credentials');
        } finally {
            setLoadingLocal(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
            <div style={{ width: '100%', maxWidth: '440px', background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '56px', height: '56px', background: '#e0e7ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <Shield size={28} color="#4f46e5" />
                    </div>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>Platform Admin</h1>
                    <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '15px' }}>Sign in to manage tenants & subscriptions</p>
                </div>

                {error && (
                    <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Admin Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }}
                            placeholder="admin@platform.com"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loadingLocal}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 600,
                            cursor: loadingLocal ? 'not-allowed' : 'pointer',
                            marginTop: '8px',
                            opacity: loadingLocal ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {loadingLocal ? 'Authenticating...' : (
                            <>
                                Access Platform <CheckCircle size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '32px', paddingTop: '24px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                        Secured access. Unauthorized attempts are logged.
                    </p>
                </div>
            </div>
        </div>
    );
}
