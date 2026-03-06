'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/apiClient';
import {
    Server, Users, AlertTriangle, CreditCard,
    Clock, IndianRupee, TrendingUp, Loader2
} from 'lucide-react';

const kpiCardColors: Record<string, { bg: string; iconBg: string; color: string }> = {
    total: { bg: '#eff6ff', iconBg: '#dbeafe', color: '#3b82f6' },
    active: { bg: '#ecfdf5', iconBg: '#d1fae5', color: '#10b981' },
    suspended: { bg: '#fffbeb', iconBg: '#fef3c7', color: '#f59e0b' },
    plans: { bg: '#f5f3ff', iconBg: '#ede9fe', color: '#8b5cf6' },
    expiring: { bg: '#fef2f2', iconBg: '#fee2e2', color: '#ef4444' },
    revenue: { bg: '#ecfdf5', iconBg: '#d1fae5', color: '#059669' },
};

const planBadgeColors: Record<string, string> = {
    'Free': '#94a3b8',
    'Basic': '#3b82f6',
    'Pro': '#8b5cf6',
    'Unknown': '#64748b',
};

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/super-admin/stats');
                if (res.data.success) {
                    setStats(res.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch stats', error);
                // Fallback: try the old way
                try {
                    const res = await api.get('/super-admin/tenants');
                    if (res.data.success) {
                        const tenants = res.data.data || [];
                        setStats({
                            totalTenants: tenants.length,
                            activeTenants: tenants.filter((t: any) => t.status === 'active').length,
                            suspendedTenants: tenants.filter((t: any) => t.status === 'suspended').length,
                            totalPlans: 0,
                            expiringSoon: 0,
                            monthlyRevenue: 0,
                            planDistribution: {},
                            recentTenants: tenants.slice(0, 5),
                        });
                    }
                } catch (e) {
                    console.error('Fallback also failed', e);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12 }}>
                <Loader2 size={24} className="animate-spin" color="#6366f1" />
                <span style={{ color: '#64748b', fontSize: 15, fontWeight: 500 }}>Loading platform metrics...</span>
            </div>
        );
    }

    if (!stats) {
        return (
            <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
                Failed to load stats. Please refresh.
            </div>
        );
    }

    const kpiCards = [
        { key: 'total', label: 'Total Tenants', value: stats.totalTenants, icon: Server, theme: kpiCardColors.total },
        { key: 'active', label: 'Active Tenants', value: stats.activeTenants, icon: Users, theme: kpiCardColors.active },
        { key: 'suspended', label: 'Suspended', value: stats.suspendedTenants, icon: AlertTriangle, theme: kpiCardColors.suspended },
        { key: 'plans', label: 'Total Plans', value: stats.totalPlans, icon: CreditCard, theme: kpiCardColors.plans },
        { key: 'expiring', label: 'Expiring Soon', value: stats.expiringSoon, icon: Clock, theme: kpiCardColors.expiring, subtitle: 'Within 30 days' },
        { key: 'revenue', label: 'Monthly Revenue', value: `₹${(stats.monthlyRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, theme: kpiCardColors.revenue, subtitle: 'Active plans' },
    ];

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>
                    Platform Overview
                </h1>
                <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: 14 }}>
                    Monitor your SaaS tenants, subscriptions, and system health.
                </p>
            </div>

            {/* KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                {kpiCards.map(({ key, label, value, icon: Icon, theme, subtitle }) => (
                    <div key={key} style={{
                        background: '#fff',
                        padding: '20px 22px',
                        borderRadius: 14,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        border: '1px solid #f1f5f9',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                    }} className="hover-lift">
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: theme.iconBg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Icon size={20} color={theme.color} />
                            </div>
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
                            {value}
                        </div>
                        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginTop: 4 }}>
                            {label}
                        </div>
                        {subtitle && (
                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{subtitle}</div>
                        )}
                    </div>
                ))}
            </div>

            {/* Two-column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="responsive-grid">

                {/* Recent Tenants */}
                <div style={{
                    background: '#fff', borderRadius: 14, overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
                }}>
                    <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a' }}>Recent Tenants</h3>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>Last 5</span>
                    </div>
                    <div>
                        {(!stats.recentTenants || stats.recentTenants.length === 0) ? (
                            <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                                No tenants yet
                            </div>
                        ) : (
                            stats.recentTenants.map((t: any, i: number) => (
                                <div key={t._id || i} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '12px 22px',
                                    borderBottom: i < stats.recentTenants.length - 1 ? '1px solid #f8fafc' : 'none',
                                }}>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{t.name}</div>
                                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{t.email}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{
                                            fontSize: 11, fontWeight: 600,
                                            padding: '2px 8px', borderRadius: 99,
                                            background: t.status === 'active' ? '#ecfdf5' : '#fffbeb',
                                            color: t.status === 'active' ? '#10b981' : '#f59e0b',
                                        }}>
                                            {t.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Plan Distribution */}
                <div style={{
                    background: '#fff', borderRadius: 14, overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
                }}>
                    <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9' }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a' }}>Plan Distribution</h3>
                    </div>
                    <div style={{ padding: '16px 22px' }}>
                        {(!stats.planDistribution || Object.keys(stats.planDistribution).length === 0) ? (
                            <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                                No data available
                            </div>
                        ) : (
                            Object.entries(stats.planDistribution).map(([planName, count]: [string, any]) => {
                                const total = stats.totalTenants || 1;
                                const pct = Math.round((count / total) * 100);
                                const barColor = planBadgeColors[planName] || '#64748b';
                                return (
                                    <div key={planName} style={{ marginBottom: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                            <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>{planName}</span>
                                            <span style={{ fontSize: 13, color: '#64748b' }}>{count} tenant{count !== 1 ? 's' : ''} · {pct}%</span>
                                        </div>
                                        <div style={{ height: 8, borderRadius: 99, background: '#f1f5f9', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%', borderRadius: 99,
                                                background: barColor,
                                                width: `${pct}%`,
                                                transition: 'width 0.6s ease',
                                            }} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{
                marginTop: 24,
                background: '#fff', borderRadius: 14, padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
                textAlign: 'center',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#64748b', fontSize: 14 }}>
                    <TrendingUp size={16} />
                    Navigate to <strong>Tenants</strong> to manage subscriptions, or <strong>Plans</strong> to adjust pricing.
                </div>
            </div>
        </div>
    );
}
