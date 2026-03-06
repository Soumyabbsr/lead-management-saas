'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import api from '@/lib/apiClient';

export default function SuperAdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loadingLocal, setLoadingLocal] = useState(false);

    const router = useRouter();
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('Please enter both email and password.');
            return;
        }

        setLoadingLocal(true);

        try {
            const res = await api.post('/api/auth/login', { email: email.trim().toLowerCase(), password });

            if (res.data.success) {
                const user = res.data.data.user;
                if (user.role !== 'super_admin') {
                    setError('Access denied. This portal is for platform administrators only.');
                    setLoadingLocal(false);
                    return;
                }
                login(res.data.data.token, user);
                router.push('/super-admin/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoadingLocal(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            padding: '20px',
        }}>
            {/* Decorative background */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(59,130,246,0.1) 0%, transparent 50%)',
                pointerEvents: 'none',
            }} />

            <div style={{
                width: '100%',
                maxWidth: 440,
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(20px)',
                borderRadius: 20,
                padding: '40px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.08)',
                position: 'relative',
                zIndex: 1,
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 56, height: 56,
                        background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                        borderRadius: 14,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 16,
                        boxShadow: '0 8px 20px rgba(99,102,241,0.3)',
                    }}>
                        <Shield size={28} color="#fff" />
                    </div>
                    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.5px' }}>
                        Platform Admin
                    </h1>
                    <p style={{ margin: '8px 0 0 0', color: '#94a3b8', fontSize: 14 }}>
                        Sign in to manage tenants & subscriptions
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.15)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#fca5a5',
                        padding: '12px 16px',
                        borderRadius: 10,
                        fontSize: 13,
                        marginBottom: 24,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: 10,
                                border: '1px solid #334155', outline: 'none', fontSize: 15,
                                boxSizing: 'border-box', background: '#0f172a', color: '#f1f5f9',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                            onBlur={(e) => e.target.style.borderColor = '#334155'}
                            placeholder="admin@platform.com"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginBottom: 8 }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                style={{
                                    width: '100%', padding: '12px 48px 12px 16px', borderRadius: 10,
                                    border: '1px solid #334155', outline: 'none', fontSize: 15,
                                    boxSizing: 'border-box', background: '#0f172a', color: '#f1f5f9',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                                onBlur={(e) => e.target.style.borderColor = '#334155'}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: '#64748b',
                                    padding: 4, display: 'flex', alignItems: 'center',
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loadingLocal}
                        style={{
                            width: '100%',
                            padding: 14,
                            background: loadingLocal ? '#4338ca' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 10,
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: loadingLocal ? 'not-allowed' : 'pointer',
                            marginTop: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                        }}
                    >
                        {loadingLocal ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Authenticating...
                            </>
                        ) : (
                            'Access Platform'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div style={{ borderTop: '1px solid #1e293b', marginTop: 32, paddingTop: 24, textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                        🔒 Secured portal. Unauthorized attempts are logged.
                    </p>
                </div>
            </div>
        </div>
    );
}
