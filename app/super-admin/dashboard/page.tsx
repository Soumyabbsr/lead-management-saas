'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/apiClient';
import { Users, Server, CreditCard, AlertTriangle } from 'lucide-react';

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState({
        totalTenants: 0,
        activeTenants: 0,
        suspendedTenants: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // For now, we fetch all tenants and compute stats client-side.
                // In a massive production app, we'd have a specific /api/super-admin/stats endpoint
                const res = await api.get('/super-admin/tenants');
                if (res.data.success) {
                    const tenants = res.data.data || [];
                    setStats({
                        totalTenants: tenants.length,
                        activeTenants: tenants.filter((t: any) => t.status === 'active').length,
                        suspendedTenants: tenants.filter((t: any) => t.status === 'suspended').length,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div>Loading platform metrics...</div>;
    }

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ margin: 0, fontSize: '28px', color: '#0f172a' }}>Platform Overview</h1>
                <p style={{ margin: '8px 0 0 0', color: '#64748b' }}>Monitor your SaaS tenants and system health.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>

                {/* Stat Cards */}
                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Total Tenants</p>
                            <h2 style={{ margin: '8px 0 0 0', fontSize: '32px', color: '#0f172a' }}>{stats.totalTenants}</h2>
                        </div>
                        <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Server size={24} color="#3b82f6" />
                        </div>
                    </div>
                </div>

                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Active Tenants</p>
                            <h2 style={{ margin: '8px 0 0 0', fontSize: '32px', color: '#10b981' }}>{stats.activeTenants}</h2>
                        </div>
                        <div style={{ width: '48px', height: '48px', background: '#ecfdf5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircleIcon color="#10b981" />
                        </div>
                    </div>
                </div>

                <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px', fontWeight: 600 }}>Suspended</p>
                            <h2 style={{ margin: '8px 0 0 0', fontSize: '32px', color: '#f59e0b' }}>{stats.suspendedTenants}</h2>
                        </div>
                        <div style={{ width: '48px', height: '48px', background: '#fffbeb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertTriangle size={24} color="#f59e0b" />
                        </div>
                    </div>
                </div>

            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '32px', textAlign: 'center', color: '#64748b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                Navigate to the <strong>Tenants</strong> tab on the left to manage subscriptions, adjust limits, or suspend accounts.
            </div>
        </div>
    );
}

function CheckCircleIcon({ color }: { color: string }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}
