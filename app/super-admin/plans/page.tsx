'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/apiClient';
import { Plus, CheckCircle2, ShieldAlert, Edit2, Package } from 'lucide-react';
import AddPlanModal from './AddPlanModal';

export default function PlansPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editPlan, setEditPlan] = useState<any | null>(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const res = await api.get('/super-admin/plans');
            if (res.data.success) {
                setPlans(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch plans', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePlanStatus = async (id: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        if (!confirm(`Are you sure you want to mark this plan as ${newStatus ? 'Active' : 'Inactive'}?`)) return;

        try {
            const res = await api.put(`/super-admin/plans/${id}`, { isActive: newStatus });
            if (res.data.success) {
                setPlans(plans.map(p => p._id === id ? { ...p, isActive: newStatus } : p));
            }
        } catch (error) {
            alert('Failed to update plan status');
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Subscription Plans</h1>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Manage pricing and limits available to tenants.</p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    style={{
                        background: '#4f46e5',
                        color: 'white',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={18} /> Add Plan
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {loading ? (
                    <div style={{ color: '#64748b' }}>Loading plans...</div>
                ) : plans.length === 0 ? (
                    <div style={{ color: '#64748b', gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>No plans found. Create one to get started.</div>
                ) : (
                    plans.map((plan) => (
                        <div key={plan._id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ background: '#e0e7ff', padding: '8px', borderRadius: '8px', color: '#4f46e5' }}>
                                        <Package size={20} />
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{plan.name}</h3>
                                </div>
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    background: plan.isActive ? '#ecfdf5' : '#fffbeb',
                                    color: plan.isActive ? '#10b981' : '#f59e0b',
                                    padding: '4px 10px', borderRadius: 'full', fontSize: '12px', fontWeight: 600
                                }}>
                                    {plan.isActive ? <><CheckCircle2 size={12} /> Active</> : <><ShieldAlert size={12} /> Inactive</>}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>Monthly</div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>₹{plan.priceMonthly}</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>Yearly</div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>₹{plan.priceYearly}</div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                    <span style={{ color: '#64748b' }}>Max Employees</span>
                                    <span style={{ fontWeight: 600, color: '#334155' }}>{plan.maxEmployees}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span style={{ color: '#64748b' }}>Max Leads</span>
                                    <span style={{ fontWeight: 600, color: '#334155' }}>{plan.maxLeads}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => togglePlanStatus(plan._id, plan.isActive)}
                                    title={plan.isActive ? 'Mark Inactive' : 'Mark Active'}
                                    style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', color: '#64748b', fontSize: '13px', fontWeight: 500 }}
                                >
                                    Toggle Status
                                </button>
                                <button
                                    onClick={() => setEditPlan(plan)}
                                    style={{ background: '#1e293b', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', color: 'white', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <Edit2 size={14} /> Edit
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AddPlanModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSuccess={(newPlan: any) => {
                    setPlans([newPlan, ...plans])
                    setIsAddOpen(false);
                }}
            />

            <AddPlanModal
                isOpen={!!editPlan}
                onClose={() => setEditPlan(null)}
                planToEdit={editPlan}
                onSuccess={(updatedPlan: any) => {
                    setPlans(plans.map(p => p._id === updatedPlan._id ? updatedPlan : p));
                    setEditPlan(null);
                }}
            />
        </div>
    );
}
