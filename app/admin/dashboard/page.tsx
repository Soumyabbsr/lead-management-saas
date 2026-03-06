'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Users, CalendarCheck, BookOpen, AlertTriangle, Percent, ArrowRight } from 'lucide-react';
import api from '@/lib/apiClient';
import { useToast } from '@/context/ToastContext';

function pct(n: number, d: number) {
    return d === 0 ? 0 : Math.round((n / d) * 100);
}

function KpiCard({ label, value, sub, color, icon }: { label: string; value: string | number; sub?: string; color: string; icon: React.ReactNode }) {
    return (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef4', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0d1b2e', lineHeight: 1 }}>{value}</div>
                {sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{sub}</div>}
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const toast = useToast();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get('/dashboard/admin');
                if (res.data.success) {
                    setData(res.data.data);
                }
            } catch (err) {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const pipelineColors: Record<string, string> = {
        New: '#2563eb', Contacted: '#7c3aed', Visit: '#d97706',
        Negotiation: '#ea580c', Booked: '#059669', Lost: '#ef4444',
    };

    if (loading || !data) {
        return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading metrics...</div>;
    }

    const { metrics, leaderboard, pipeline } = data;

    return (
        <>
            <div className="responsive-padding" style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 18, background: '#f1f5f9' }}>
                {/* Page header */}
                <div className="admin-dash-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0d1b2e' }}>Admin Dashboard</h1>
                        <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>System-wide overview · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                {/* KPI row — responsive auto-fill */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                    <KpiCard label="Total Leads" value={metrics.totalLeads} sub="All employees" color="#2563eb" icon={<Users size={20} color="#2563eb" />} />
                    <KpiCard label="New Today" value={metrics.newToday} sub="Activity today" color="#7c3aed" icon={<TrendingUp size={20} color="#7c3aed" />} />
                    <KpiCard label="Visits Today" value={metrics.visitsToday} sub="Scheduled" color="#d97706" icon={<CalendarCheck size={20} color="#d97706" />} />
                    <KpiCard label="Bookings" value={metrics.bookingsThisMonth} sub="This month" color="#059669" icon={<BookOpen size={20} color="#059669" />} />
                    <KpiCard label="Overdue Leads" value={metrics.overdueCount} sub="Due for Follow-up" color="#ef4444" icon={<AlertTriangle size={20} color="#ef4444" />} />
                    <KpiCard label="Conversion" value={`${metrics.convRate}%`} sub="Total → Booked" color="#f97316" icon={<Percent size={20} color="#f97316" />} />
                </div>

                {/* Main grid — 2 col on desktop, 1 col on mobile */}
                <div className="admin-dash-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>

                    {/* Leaderboard */}
                    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef4', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8eef4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0d1b2e' }}>Employee Leaderboard</h3>
                            <button onClick={() => router.push('/admin/performance')}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                Full Report <ArrowRight size={12} />
                            </button>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8eef4' }}>
                                        {['#', 'Employee', 'Bookings', 'Conv %', 'Target'].map(col => (
                                            <th key={col} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 11.5, whiteSpace: 'nowrap' }}>{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.map((row: any, i: number) => {
                                        const targetPct = row.target ? pct(row.bookings, row.target) : 0;
                                        return (
                                            <tr key={row.id}
                                                onClick={() => router.push('/admin/performance')}
                                                style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <td style={{ padding: '12px 14px' }}>
                                                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c3e' : '#e8eef4', color: i < 3 ? '#fff' : '#475569', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{i + 1}</span>
                                                </td>
                                                <td style={{ padding: '12px 14px' }}>
                                                    <div style={{ fontWeight: 700, color: '#0d1b2e', fontSize: 13 }}>{row.name}</div>
                                                </td>
                                                <td style={{ padding: '12px 14px' }}>
                                                    <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>{row.bookings}</span>
                                                </td>
                                                <td style={{ padding: '12px 14px', color: row.convRate >= 30 ? '#059669' : '#f97316', fontWeight: 700 }}>{row.convRate}%</td>
                                                <td style={{ padding: '12px 14px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <div style={{ flex: 1, height: 6, background: '#e8eef4', borderRadius: 99, minWidth: 60, overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', width: `${Math.min(100, targetPct)}%`, background: targetPct >= 100 ? '#059669' : '#3b82f6', borderRadius: 99 }} />
                                                        </div>
                                                        <span style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>{targetPct}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pipeline + Quick Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {/* Pipeline */}
                        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef4', padding: 18 }}>
                            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#0d1b2e' }}>Pipeline Snapshot</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {Object.entries(pipeline).map(([stage, count]: any) => (
                                    <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 72, fontSize: 12, color: '#64748b', fontWeight: 500 }}>{stage}</div>
                                        <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${pct(count, metrics.totalLeads)}%`, background: pipelineColors[stage], borderRadius: 99, transition: 'width 0.5s' }} />
                                        </div>
                                        <div style={{ width: 28, textAlign: 'right', fontWeight: 700, fontSize: 13, color: pipelineColors[stage] }}>{count}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick links */}
                        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef4', padding: 16 }}>
                            <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#0d1b2e' }}>Quick Actions</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { label: 'View All Leads', href: '/admin/leads', color: '#2563eb' },
                                    { label: 'Manage Employees', href: '/admin/employees', color: '#7c3aed' },
                                    { label: 'All Visits', href: '/admin/visits', color: '#d97706' },
                                    { label: 'Activity Log', href: '/admin/activity', color: '#64748b' },
                                ].map(({ label, href, color }) => (
                                    <button key={href} onClick={() => router.push(href)}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 9, background: '#f8fafc', border: '1px solid #e8eef4', cursor: 'pointer', color: '#0d1b2e', fontSize: 13, fontWeight: 600 }}>
                                        <span style={{ color }}>{label}</span>
                                        <ArrowRight size={13} color="#94a3b8" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
