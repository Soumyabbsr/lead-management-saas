'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/apiClient';
import { X } from 'lucide-react';

interface EditTenantModalProps {
    isOpen: boolean;
    tenant: any | null;
    onClose: () => void;
    onSuccess: (updatedTenant: any) => void;
}

export default function EditTenantModal({ isOpen, tenant, onClose, onSuccess }: EditTenantModalProps) {
    const [formData, setFormData] = useState({
        employeeLimit: 5,
        leadLimit: 100,
        planExpiryDate: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (tenant) {
            setFormData({
                employeeLimit: tenant.employeeLimit || 5,
                leadLimit: tenant.leadLimit || 100,
                planExpiryDate: tenant.planExpiryDate ? new Date(tenant.planExpiryDate).toISOString().split('T')[0] : ''
            });
        }
    }, [tenant]);

    if (!isOpen || !tenant) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.put(`/super-admin/tenants/${tenant._id}`, formData);

            if (res.data.success) {
                onSuccess(res.data.data);
                onClose();
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update tenant');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '32px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a' }}>Update Constraints</h2>
                <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px' }}>Modifying limits for <strong>{tenant.name}</strong></p>

                {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Employee Limit</label>
                        <input
                            required
                            type="number"
                            min="1"
                            value={formData.employeeLimit}
                            onChange={e => setFormData({ ...formData, employeeLimit: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Current Usage: {tenant.currentEmployeeCount || 0}</div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Lead Limit</label>
                        <input
                            required
                            type="number"
                            min="1"
                            value={formData.leadLimit}
                            onChange={e => setFormData({ ...formData, leadLimit: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                        />
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Current Usage: {tenant.currentLeadCount || 0}</div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Plan Expiry Date</label>
                        <input
                            required
                            type="date"
                            value={formData.planExpiryDate}
                            onChange={e => setFormData({ ...formData, planExpiryDate: e.target.value })}
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
                            disabled={loading}
                            style={{ padding: '10px 24px', background: '#4f46e5', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? 'Saving...' : 'Update Tenant'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
