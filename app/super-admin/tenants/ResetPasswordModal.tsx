'use client';

import React, { useState } from 'react';
import api from '@/lib/apiClient';
import { X, KeyRound, AlertCircle } from 'lucide-react';

interface ResetPasswordModalProps {
    isOpen: boolean;
    tenant: any | null;
    onClose: () => void;
}

export default function ResetPasswordModal({ isOpen, tenant, onClose }: ResetPasswordModalProps) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen || !tenant) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const res = await api.put(`/super-admin/tenants/${tenant._id}/reset-password`, { password });

            if (res.data.success) {
                setSuccess(true);
                setPassword('');
                setConfirmPassword('');
                // Auto close after 2.5s
                setTimeout(() => {
                    if (isOpen) onClose();
                    setSuccess(false);
                }, 2500);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '32px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                {!success && (
                    <button
                        onClick={onClose}
                        style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                        <X size={20} />
                    </button>
                )}

                {success ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ width: '64px', height: '64px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        </div>
                        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a' }}>Password Reset</h2>
                        <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px' }}><strong>{tenant.name}</strong>'s administrator password has been updated securely.</p>

                        <button
                            onClick={onClose}
                            style={{ padding: '10px 24px', background: '#4f46e5', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', width: '100%' }}
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ background: '#e0e7ff', padding: '8px', borderRadius: '8px', color: '#4f46e5' }}>
                                <KeyRound size={20} />
                            </div>
                            <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Reset Password</h2>
                        </div>

                        <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px' }}>
                            Set a new password for the vendor owner: <strong style={{ color: '#0f172a' }}>{tenant.ownerName || tenant.name}</strong>
                        </p>

                        {error && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px' }}>
                                <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                                <div>{error}</div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>New Password</label>
                                <input
                                    required
                                    type="text"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Confirm Password</label>
                                <input
                                    required
                                    type="text"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !password || !confirmPassword}
                                    style={{ padding: '10px 24px', background: '#4f46e5', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: (loading || !password || !confirmPassword) ? 'not-allowed' : 'pointer', opacity: (loading || !password || !confirmPassword) ? 0.7 : 1 }}
                                >
                                    {loading ? 'Resetting...' : 'Submit Change'}
                                </button>
                            </div>

                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
