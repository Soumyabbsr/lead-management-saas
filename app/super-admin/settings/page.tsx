'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/apiClient';
import {
    Shield, KeyRound, User, Mail, Lock,
    Eye, EyeOff, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
    const { currentUser } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const res = await api.put('/super-admin/change-password', {
                currentPassword,
                newPassword,
            });

            if (res.data.success) {
                setSuccess('Password changed successfully!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => setSuccess(''), 4000);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%', padding: '11px 16px', borderRadius: 10,
        border: '1px solid #e2e8f0', outline: 'none', fontSize: 14,
        boxSizing: 'border-box' as const, background: '#f8fafc',
        color: '#0f172a', transition: 'border-color 0.2s',
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Platform Settings</h1>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 14 }}>
                    Manage your account and platform configuration.
                </p>
            </div>

            {/* Platform Info */}
            <div style={{
                background: '#fff', borderRadius: 14, padding: 28,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
                marginBottom: 24,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: '#eff6ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Shield size={18} color="#3b82f6" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Platform Information</h3>
                        <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>Your admin account details</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="responsive-grid">
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Admin Name
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                            <User size={14} color="#94a3b8" />
                            <span style={{ fontSize: 14, color: '#334155', fontWeight: 500 }}>{currentUser?.name || '—'}</span>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Email Address
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                            <Mail size={14} color="#94a3b8" />
                            <span style={{ fontSize: 14, color: '#334155', fontWeight: 500 }}>{currentUser?.email || '—'}</span>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Role
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                            <Shield size={14} color="#94a3b8" />
                            <span style={{
                                fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 99,
                                background: '#e0e7ff', color: '#4f46e5',
                            }}>Super Admin</span>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Platform
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                            <span style={{ fontSize: 14, color: '#334155', fontWeight: 500 }}>PG CRM Core</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password */}
            <div style={{
                background: '#fff', borderRadius: 14, padding: 28,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
                marginBottom: 24,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: '#fefce8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <KeyRound size={18} color="#ca8a04" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Change Password</h3>
                        <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>Update your administrator password</p>
                    </div>
                </div>

                {success && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: '#ecfdf5', border: '1px solid #d1fae5',
                        color: '#059669', padding: '12px 16px', borderRadius: 10,
                        fontSize: 13, fontWeight: 500, marginBottom: 20,
                    }}>
                        <CheckCircle size={16} />
                        {success}
                    </div>
                )}

                {error && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: '#fef2f2', border: '1px solid #fee2e2',
                        color: '#dc2626', padding: '12px 16px', borderRadius: 10,
                        fontSize: 13, fontWeight: 500, marginBottom: 20,
                    }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                            Current Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showCurrent ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                required
                                style={{ ...inputStyle, paddingRight: 48 }}
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4,
                                    display: 'flex', alignItems: 'center',
                                }}
                            >
                                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="responsive-grid">
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                                New Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    style={{ ...inputStyle, paddingRight: 48 }}
                                    placeholder="Min 6 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    style={{
                                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4,
                                        display: 'flex', alignItems: 'center',
                                    }}
                                >
                                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                                Confirm New Password
                            </label>
                            <input
                                type={showNew ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                style={inputStyle}
                                placeholder="Re-enter new password"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                        <button
                            type="submit"
                            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                            style={{
                                padding: '10px 24px',
                                background: '#4f46e5',
                                border: 'none', borderRadius: 8,
                                color: '#fff', fontSize: 14, fontWeight: 600,
                                cursor: (loading || !currentPassword || !newPassword || !confirmPassword) ? 'not-allowed' : 'pointer',
                                opacity: (loading || !currentPassword || !newPassword || !confirmPassword) ? 0.6 : 1,
                                display: 'flex', alignItems: 'center', gap: 8,
                                transition: 'all 0.2s',
                            }}
                        >
                            {loading ? <><Loader2 size={14} className="animate-spin" /> Updating...</> : <><Lock size={14} /> Update Password</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* Danger Zone */}
            <div style={{
                background: '#fff', borderRadius: 14, padding: 28,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: '1px solid #fee2e2',
            }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 600, color: '#dc2626' }}>Danger Zone</h3>
                <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: 13 }}>
                    Destructive actions that cannot be undone easily.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button
                        disabled
                        style={{
                            padding: '8px 16px', border: '1px solid #fecaca', borderRadius: 8,
                            background: '#fff', color: '#94a3b8', fontSize: 13, fontWeight: 500,
                            cursor: 'not-allowed', opacity: 0.6,
                        }}
                    >
                        Export All Data (Coming Soon)
                    </button>
                    <button
                        disabled
                        style={{
                            padding: '8px 16px', border: '1px solid #fecaca', borderRadius: 8,
                            background: '#fff', color: '#94a3b8', fontSize: 13, fontWeight: 500,
                            cursor: 'not-allowed', opacity: 0.6,
                        }}
                    >
                        Purge System Logs (Coming Soon)
                    </button>
                </div>
            </div>
        </div>
    );
}
