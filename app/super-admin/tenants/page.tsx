'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/apiClient';
import { Plus, Search, Edit2, ShieldAlert, CheckCircle2, LogIn, KeyRound } from 'lucide-react';
import AddTenantModal from './AddTenantModal';
import EditTenantModal from './EditTenantModal';
import ResetPasswordModal from './ResetPasswordModal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function TenantsPage() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editTenant, setEditTenant] = useState<any | null>(null);
    const [resetTenant, setResetTenant] = useState<any | null>(null);

    const { login } = useAuth();
    const router = useRouter();

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            setLoading(true);
            const res = await api.get('/super-admin/tenants');
            if (res.data.success) {
                setTenants(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch tenants', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleTenantStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        if (!confirm(`Are you sure you want to mark this tenant as ${newStatus}?`)) return;

        try {
            const res = await api.put(`/super-admin/tenants/${id}`, { status: newStatus });
            if (res.data.success) {
                setTenants(tenants.map(t => t._id === id ? { ...t, status: newStatus } : t));
            }
        } catch (error) {
            alert('Failed to update tenant status');
        }
    };

    const filteredTenants = tenants.filter(t =>
        t.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Tenants</h1>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Manage SaaS vendors and subscriptions.</p>
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
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <Plus size={18} /> Add Tenant
                </button>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {/* Toolbar */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search tenants by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none' }}
                        />
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead style={{ background: '#f8fafc', color: '#64748b' }}>
                            <tr>
                                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Tenant Info</th>
                                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Plan Details</th>
                                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Usage Constraints</th>
                                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Loading tenants...</td></tr>
                            ) : filteredTenants.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No tenants found.</td></tr>
                            ) : (
                                filteredTenants.map((t) => (
                                    <tr key={t._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.name}</div>
                                            <div style={{ color: '#64748b', fontSize: '13px' }}>{t.email}</div>
                                            <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Owner: {t.ownerName || '-'}</div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ display: 'inline-block', background: '#e0e7ff', color: '#4f46e5', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                                                {t.planId?.name || 'Custom'}
                                            </div>
                                            <div style={{ color: '#64748b', fontSize: '13px' }}>
                                                Expires: {t.planExpiryDate ? new Date(t.planExpiryDate).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ fontSize: '13px', color: '#334155', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: 600 }}>Leads:</span> {t.currentLeadCount || 0} / {t.leadLimit}
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#334155' }}>
                                                <span style={{ fontWeight: 600 }}>Employees:</span> {t.currentEmployeeCount || 0} / {t.employeeLimit}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            {t.status === 'active' ? (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', color: '#10b981', padding: '4px 10px', borderRadius: 'full', fontSize: '12px', fontWeight: 600 }}>
                                                    <CheckCircle2 size={14} /> Active
                                                </span>
                                            ) : (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fffbeb', color: '#f59e0b', padding: '4px 10px', borderRadius: 'full', fontSize: '12px', fontWeight: 600 }}>
                                                    <ShieldAlert size={14} /> Suspended
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => toggleTenantStatus(t._id, t.status)}
                                                    title={t.status === 'active' ? 'Suspend Tenant' : 'Activate Tenant'}
                                                    style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    {t.status === 'active' ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
                                                </button>
                                                <button
                                                    onClick={() => setEditTenant(t)}
                                                    title="Edit Details"
                                                    style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setResetTenant(t)}
                                                    title="Reset Admin Password"
                                                    style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <KeyRound size={16} />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            alert(`In a real app, this generates a short-lived impersonation token for ${t.name} and redirects you to /admin/dashboard.`);
                                                        } catch (e) { }
                                                    }}
                                                    title="Login As Vendor"
                                                    style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <LogIn size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddTenantModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSuccess={(newTenant) => {
                    fetchTenants(); // re-fetch to get populated dependencies like plan name
                }}
            />

            <EditTenantModal
                isOpen={!!editTenant}
                tenant={editTenant}
                onClose={() => setEditTenant(null)}
                // We re-fetch here too since the plan might be updated or nested objects morphed. 
                // Or we could intelligently mutate the nested `planId` object. Fetch is safer for CRM.
                onSuccess={() => fetchTenants()}
            />

            <ResetPasswordModal
                isOpen={!!resetTenant}
                tenant={resetTenant}
                onClose={() => setResetTenant(null)}
            />
        </div>
    );
}
