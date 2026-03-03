'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/apiClient';
import { X } from 'lucide-react';

interface AddTenantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (tenant: any) => void;
}

export default function AddTenantModal({ isOpen, onClose, onSuccess }: AddTenantModalProps) {
    const [plans, setPlans] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        ownerName: '',
        email: '',
        phone: '',
        password: '',
        planId: '',
        employeeLimit: 5,
        leadLimit: 100,
        planExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successData, setSuccessData] = useState<any>(null);

    // Fetch active plans on mount
    useEffect(() => {
        if (isOpen) {
            fetchPlans();
        }
    }, [isOpen]);

    const fetchPlans = async () => {
        try {
            const res = await api.get('/super-admin/plans');
            if (res.data.success) {
                const activePlans = res.data.data.filter((p: any) => p.isActive);
                setPlans(activePlans);

                // Pre-select first plan if available
                if (activePlans.length > 0 && !formData.planId) {
                    handlePlanSelect(activePlans[0]._id, activePlans);
                }
            }
        } catch (error) {
            console.error('Failed to fetch plans', error);
        }
    };

    const handlePlanSelect = (selectedPlanId: string, availablePlans = plans) => {
        const plan = availablePlans.find((p: any) => p._id === selectedPlanId);
        if (plan) {
            setFormData(prev => ({
                ...prev,
                planId: plan._id,
                employeeLimit: plan.maxEmployees,
                leadLimit: plan.maxLeads,
                // Default to 1 year expiry
                planExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
            }));
        } else {
            setFormData(prev => ({ ...prev, planId: selectedPlanId }));
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = {
                ...formData,
                status: 'active',
                planStatus: 'active'
            };

            const res = await api.post('/super-admin/tenants', payload);

            if (res.data.success) {
                onSuccess(res.data.data);
                if (res.data.credentials) {
                    setSuccessData(res.data.credentials);
                } else {
                    onClose();
                }
            }
        } catch (err: any) {
            console.error("API Error Object:", err.response?.data || err);
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create tenant');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '32px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
                <button
                    onClick={() => {
                        setSuccessData(null);
                        onClose();
                    }}
                    style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                    <X size={20} />
                </button>

                {successData ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ width: '64px', height: '64px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        </div>
                        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a' }}>Tenant Created Successfully</h2>
                        <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px' }}>Please share these temporary credentials securely with the vendor owner.</p>

                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', textAlign: 'left', marginBottom: '24px' }}>
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 600, width: '80px', display: 'inline-block' }}>Email:</span>
                                <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 500 }}>{successData.email}</span>
                            </div>
                            <div>
                                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 600, width: '80px', display: 'inline-block' }}>Password:</span>
                                <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 500 }}>{successData.password}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setSuccessData(null);
                                onClose();
                            }}
                            style={{ padding: '10px 24px', background: '#4f46e5', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', width: '100%' }}
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', color: '#0f172a' }}>Add New Tenant</h2>

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
                                        placeholder="Acme Corp"
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
                                        placeholder="John Doe"
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
                                        placeholder="john@acme.com"
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
                                        placeholder="+1 234 567 8900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Vendor Admin Password</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                                    placeholder="Set initial password for vendor"
                                />
                            </div>

                            <hr style={{ borderTop: '1px solid #e2e8f0', borderBottom: 'none', margin: '8px 0' }} />

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
                                    {loading ? 'Creating...' : 'Create Tenant'}
                                </button>
                            </div>

                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
