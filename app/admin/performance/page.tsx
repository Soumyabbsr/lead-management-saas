'use client';

import { useMemo, useState } from 'react';
import { useLeadStore } from '@/store/useLeadStore';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { BarChart2, TrendingUp, Trophy, ArrowUpDown, Search } from 'lucide-react';

function pct(n: number, d: number) {
    return d === 0 ? 0 : Math.round((n / d) * 100);
}

export default function AdminPerformancePage() {
    const leads = useLeadStore(s => s.leads);
    const employees = useEmployeeStore(s => s.employees);

    const [search, setSearch] = useState('');
    const [sortCol, setSortCol] = useState('bookings');
    const [sortAsc, setSortAsc] = useState(false);

    const stats = useMemo(() => {
        const salesEmps = employees.filter(e => e.role === 'sales');
        return salesEmps.map(emp => {
            const myLeads = leads.filter(l => l.assignedTo === emp.name);
            const activeLeads = myLeads.length;
            const calls = myLeads.reduce((sum, l) => sum + l.timeline.filter(e => e.type === 'call' || e.type === 'note').length, 0);
            const visits = myLeads.filter(l => l.stage === 'Visit' || l.stage === 'Negotiation' || l.stage === 'Booked' || l.visitDate).length;
            const negotiation = myLeads.filter(l => l.stage === 'Negotiation' || l.stage === 'Booked').length;
            const bookings = myLeads.filter(l => l.stage === 'Booked').length;
            const convRate = pct(bookings, activeLeads);
            const targetPct = emp.monthlyTarget ? pct(bookings, emp.monthlyTarget) : 0;
            return { id: emp.id, name: emp.name, target: emp.monthlyTarget, activeLeads, calls, visits, negotiation, bookings, convRate, targetPct };
        });
    }, [leads, employees]);

    const filteredAndSorted = useMemo(() => {
        return stats
            .filter(s => search === '' || s.name.toLowerCase().includes(search.toLowerCase()))
            .sort((a, b) => {
                const valA = a[sortCol as keyof typeof a] ?? '';
                const valB = b[sortCol as keyof typeof b] ?? '';
                if (valA < valB) return sortAsc ? -1 : 1;
                if (valA > valB) return sortAsc ? 1 : -1;
                return 0;
            });
    }, [stats, search, sortCol, sortAsc]);

    const handleSort = (col: string) => {
        if (sortCol === col) setSortAsc(!sortAsc);
        else { setSortCol(col); setSortAsc(false); }
    };

    const Th = ({ label, col, align = 'right' }: { label: string; col: string; align?: 'left' | 'right' }) => (
        <th onClick={() => handleSort(col)} style={{ padding: '12px 16px', textAlign: align, fontWeight: 700, color: '#64748b', fontSize: 11.5, textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: align === 'right' ? 'flex-end' : 'flex-start', gap: 6, color: sortCol === col ? '#2563eb' : 'inherit' }}>
                {label} {sortCol === col ? (sortAsc ? '↑' : '↓') : <ArrowUpDown size={11} opacity={0.4} />}
            </div>
        </th>
    );

    return (
        <>
            <div className="perf-page responsive-padding" style={{ flex: 1, padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 16, background: '#f1f5f9' }}>

                {/* Header */}
                <div>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0d1b2e' }}>Performance Leaderboard</h1>
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>Track sales team metrics and target completion</p>
                </div>

                {/* Top Cards — responsive auto-fill */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                    <div style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)', borderRadius: 12, padding: 20, color: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>Top Performer</div>
                                <div style={{ fontSize: 20, fontWeight: 800 }}>{stats.length > 0 ? stats.reduce((a, b) => a.bookings > b.bookings ? a : b).name : 'No data'}</div>
                            </div>
                            <Trophy size={28} opacity={0.5} />
                        </div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #059669, #047857)', borderRadius: 12, padding: 20, color: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>Highest Conversion</div>
                                <div style={{ fontSize: 20, fontWeight: 800 }}>{stats.length > 0 ? stats.reduce((a, b) => a.convRate > b.convRate ? a : b).name : 'No data'}</div>
                            </div>
                            <TrendingUp size={28} opacity={0.5} />
                        </div>
                    </div>
                    <div style={{ background: '#fff', border: '1px solid #e8eef4', borderRadius: 12, padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Total Activity</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: '#0d1b2e' }}>
                                    {stats.reduce((s, a) => s + a.calls + a.visits, 0)} <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>actions</span>
                                </div>
                            </div>
                            <BarChart2 size={28} color="#94a3b8" />
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8eef4', padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 320 }}>
                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search sales agent..."
                            style={{ width: '100%', padding: '7px 10px 7px 30px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{filteredAndSorted.length} agents</span>
                </div>

                {/* Table — scrollable on mobile */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef4', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8eef4' }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 11.5, textTransform: 'uppercase', width: 40 }}>Rank</th>
                                    <Th label="Employee" col="name" align="left" />
                                    <Th label="Active Leads" col="activeLeads" />
                                    <Th label="Calls / Notes" col="calls" />
                                    <Th label="Visits" col="visits" />
                                    <Th label="Negotiating" col="negotiation" />
                                    <Th label="Bookings" col="bookings" />
                                    <Th label="Conv %" col="convRate" />
                                    <Th label="Target Progress" col="targetPct" align="left" />
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSorted.map((row, i) => (
                                    <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '12px 16px', fontWeight: 800, color: i < 3 ? '#1e40af' : '#94a3b8' }}>#{i + 1}</td>
                                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0d1b2e', whiteSpace: 'nowrap' }}>{row.name}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#475569' }}>{row.activeLeads}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>{row.calls}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>{row.visits}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b' }}>{row.negotiation}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                            <span style={{ display: 'inline-block', background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: 99, fontWeight: 800 }}>{row.bookings}</span>
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'right', color: row.convRate >= 20 ? '#059669' : '#f97316', fontWeight: 700 }}>{row.convRate}%</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ flex: 1, height: 6, background: '#e8eef4', borderRadius: 99, minWidth: 80, overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${Math.min(100, row.targetPct)}%`, background: row.targetPct >= 100 ? '#059669' : '#3b82f6', borderRadius: 99 }} />
                                                </div>
                                                <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, width: 34 }}>{row.targetPct}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
