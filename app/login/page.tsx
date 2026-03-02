'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/apiClient';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { login } = useAuth();
    const toast = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post('/auth/login', { email, password });

            if (res.data.success) {
                const { token, user } = res.data.data;
                login(token, user);
                toast.success(`Welcome back, ${user.name}`);

                // Redirect based on role
                if (user.role === 'admin') {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/dashboard');
                }
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
            <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>PG CRM Login</h1>
                    <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#64748b' }}>Enter your credentials to access your dashboard</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@pgcrm.com"
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
                            onFocus={e => e.target.style.borderColor = '#3b82f6'}
                            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
                            onFocus={e => e.target.style.borderColor = '#3b82f6'}
                            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '10px',
                            background: loading ? '#94a3b8' : '#3b82f6',
                            color: '#fff',
                            padding: '14px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '15px',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: '0.2s'
                        }}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                    Demo Credentials:<br />
                    Admin: admin@pgcrm.com / password123<br />
                    Sales: rahul@pgcrm.com / password123
                </div>
            </div>
        </div>
    );
}
