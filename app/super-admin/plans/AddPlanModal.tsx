'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/apiClient';
import { X } from 'lucide-react';

interface AddPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (plan: any) => void;
    planToEdit?: any;
}

export default function AddPlanModal({ isOpen, onClose, onSuccess, planToEdit }: AddPlanModalProps) {
    const [formData, setFormData] = useState({
        name: 'Basic',
        priceMonthly: 0,
        priceYearly: 0,
        maxEmployees: 5,
        maxLeads: 100,
        isActive: true
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (planToEdit) {
            setFormData({
                name: planToEdit.name || 'Basic',
                priceMonthly: planToEdit.priceMonthly || 0,
                priceYearly: planToEdit.priceYearly || 0,
                maxEmployees: planToEdit.maxEmployees || 5,
                maxLeads: planToEdit.maxLeads || 100,
                isActive: planToEdit.isActive !== undefined ? planToEdit.isActive : true
            });
        }
    }, [planToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let res;
            if (planToEdit) {
                res = await api.put(`/super-admin/plans/${planToEdit._id}`, formData);
            } else {
                res = await api.post('/super-admin/plans', formData);
            }

            if (res.data.success) {
                onSuccess(res.data.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.error || `Failed to ${planToEdit ? 'update' : 'create'} plan`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '32px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', color: '#0f172a' }}>{planToEdit ? 'Edit Plan' : 'Add New Plan'}</h2>

                {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Plan Tier</label>
                        <select
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box', WebkitAppearance: 'auto' as any }}
                        >
                            <option value="Free">Free</option>
                            <option value="Basic">Basic</option>
                            <option value="Pro">Pro</option>
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Monthly Price (₹)</label>
                            <input
                                required
                                type="number"
                                min="0"
                                value={formData.priceMonthly}
                                onChange={e => setFormData({ ...formData, priceMonthly: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                                style={{ width: '100%', padding: '10px 12px 10px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Yearly Price (₹)</label>
                            <input
                                required
                                type="number"
                                min="0"
                                value={formData.priceYearly}
                                onChange={e => setFormData({ ...formData, priceYearly: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                                style={{ width: '100%', padding: '10px 12px 10px 32px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Max Employees</label>
                            <input
                                required
                                type="number"
                                min="1"
                                value={formData.maxEmployees}
                                onChange={e => setFormData({ ...formData, maxEmployees: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Max Leads</label>
                            <input
                                required
                                type="number"
                                min="1"
                                value={formData.maxLeads}
                                onChange={e => setFormData({ ...formData, maxLeads: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
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
                            disabled={loading}
                            style={{ padding: '10px 24px', background: '#4f46e5', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? 'Saving...' : 'Save Plan'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
