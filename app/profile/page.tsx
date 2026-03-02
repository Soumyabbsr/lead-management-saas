'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import apiClient from '@/lib/apiClient';
import { ShieldCheck, UserCircle, Key } from 'lucide-react';

export default function ProfilePage() {
    const { currentUser } = useAuth();
    const toast = useToast();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    if (!currentUser) return null;

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return toast.error('New passwords do not match');
        }

        if (newPassword.length < 6) {
            return toast.error('New password must be at least 6 characters');
        }

        setLoading(true);
        try {
            await apiClient.put('/auth/updatepassword', { currentPassword, newPassword });
            toast.success('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const inStyle = { padding: '10px 14px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 13.5, outline: 'none', width: '100%', boxSizing: 'border-box' as const };
    const labelStyle = { fontSize: 11.5, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.04em' };

    return (
        <div style={{ flex: 1, padding: '24px 32px', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            <div style={{ width: '100%', maxWidth: 640, marginTop: 20 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0d1b2e', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <UserCircle size={28} color="#2563eb" /> My Profile
                </h1>

                {/* Profile Card */}
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800 }}>
                        {currentUser.avatar || currentUser.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#0d1b2e' }}>{currentUser.name}</div>
                        <div style={{ fontSize: 14, color: '#64748b', marginTop: 2 }}>{currentUser.email}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                        <span style={{ padding: '4px 12px', borderRadius: 99, background: '#eff6ff', color: '#2563eb', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ShieldCheck size={14} /> {currentUser.role}
                        </span>
                        {currentUser.status === 'Active' && <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>● Active Account</span>}
                    </div>
                </div>

                {/* Change Password Card */}
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0d1b2e', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Key size={18} color="#64748b" /> Change Password
                    </h2>

                    <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={labelStyle}>Current Password *</label>
                            <input type="password" style={inStyle} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required placeholder="Enter current password" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label style={labelStyle}>New Password *</label>
                                <input type="password" style={inStyle} value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" />
                            </div>
                            <div>
                                <label style={labelStyle}>Confirm New Password *</label>
                                <input type="password" style={inStyle} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Repeat new password" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                            <button type="submit" disabled={loading} style={{
                                padding: '10px 24px', borderRadius: 9, background: '#0d1b2e', color: '#fff',
                                fontWeight: 700, fontSize: 13.5, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
                            }}>
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
