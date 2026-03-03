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
    const [plans, setPlans] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        ownerName: '',
        email: '',
        phone: '',
        status: 'active',
        planId: '',
        employeeLimit: 5,
        leadLimit: 100,
        planExpiryDate: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchPlans();
        }
    }, [isOpen]);

    const fetchPlans = async () => {
        try {
            const res = await api.get('/super-admin/plans');
            if (res.data.success) {
                // Fetch active plans, but we should always include the tenant's current plan even if it's inactive now
                const loadedPlans = res.data.data;
                setPlans(loadedPlans);
            }
        } catch (error) {
            console.error('Failed to fetch plans', error);
        }
    };

    useEffect(() => {
        if (tenant) {
            setFormData({
                name: tenant.name || '',
                ownerName: tenant.ownerName || '',
                email: tenant.email || '',
                phone: tenant.phone || '',
                status: tenant.status || 'active',
                planId: tenant.planId ? (typeof tenant.planId === 'object' ? tenant.planId._id : tenant.planId) : '',
                employeeLimit: tenant.employeeLimit || 5,
                leadLimit: tenant.leadLimit || 100,
                planExpiryDate: tenant.planExpiryDate ? new Date(tenant.planExpiryDate).toISOString().split('T')[0] : ''
            });
        }
    }, [tenant]);

    const handlePlanSelect = (selectedPlanId: string) => {
        const plan = plans.find((p: any) => p._id === selectedPlanId);
        if (plan) {
            setFormData(prev => ({
                ...prev,
                planId: plan._id,
                employeeLimit: plan.maxEmployees,
                leadLimit: plan.maxLeads,
                // Default to 1 year expiry from today when selecting a new plan
                planExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
            }));
        } else {
            setFormData(prev => ({ ...prev, planId: selectedPlanId }));
        }
    };

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
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to update tenant');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', padding: '32px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a' }}>Update Tenant Details</h2>
                <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px' }}>Modifying profile for <strong>{tenant.name}</strong></p>

                {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Company/Tenant Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Owner Name</label>
                            <input
                                required
                                type="text"
                                value={formData.ownerName}
                                onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Email</label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Phone</label>
                            <input
                                required
                                type="text"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    <hr style={{ borderTop: '1px solid #e2e8f0', borderBottom: 'none', margin: '8px 0' }} />

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Subscription Plan</label>
                            <select
                                required
                                value={formData.planId}
                                onChange={e => handlePlanSelect(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box', WebkitAppearance: 'auto' }}
                            >
                                <option value="" disabled>Select a plan...</option>
                                {plans.map(p => (
                                    <option key={p._id} value={p._id}>{p.name} (Up to {p.maxEmployees} Emp, {p.maxLeads} Leads)</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Tenant Status</label>
                            <select
                                required
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box', WebkitAppearance: 'auto', backgroundColor: formData.status === 'suspended' ? '#fef2f2' : '#f8fafc', color: formData.status === 'suspended' ? '#ef4444' : '#0f172a' }}
                            >
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Emp. Limit <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Override)</span></label>
                            <input
                                required
                                type="number"
                                min="1"
                                value={formData.employeeLimit}
                                onChange={e => setFormData({ ...formData, employeeLimit: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Lead Limit <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Override)</span></label>
                            <input
                                required
                                type="number"
                                min="1"
                                value={formData.leadLimit}
                                onChange={e => setFormData({ ...formData, leadLimit: e.target.value === '' ? ('' as any) : parseInt(e.target.value) })}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Plan Expiry</label>
                            <input
                                required
                                type="date"
                                value={formData.planExpiryDate}
                                onChange={e => setFormData({ ...formData, planExpiryDate: e.target.value })}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                        </div>
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
                            disabled={loading || !formData.planId}
                            style={{ padding: '10px 24px', background: '#4f46e5', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: (loading || !formData.planId) ? 'not-allowed' : 'pointer', opacity: (loading || !formData.planId) ? 0.7 : 1 }}
                        >
                            {loading ? 'Saving...' : 'Update Tenant'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
