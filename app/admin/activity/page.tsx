'use client';

import { useMemo, useState } from 'react';
import { useLeadStore } from '@/store/useLeadStore';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useAuth } from '@/context/AuthContext';
import { AdminEvent } from '@/types/admin';
import { Clock, UserCircle, Activity as ActivityIcon, Link, Search } from 'lucide-react';

function hoursAgo(iso: string) {
    return Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
}

function formatTime(iso: string) {
    const d = new Date(iso);
    const h = hoursAgo(iso);
    if (h < 24 && new Date().getDate() === d.getDate()) return `Today, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    if (h < 48 && new Date().getDate() !== d.getDate()) return `Yesterday, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function AdminActivityPage() {
    const leads = useLeadStore(s => s.leads);
    const employees = useEmployeeStore(s => s.employees);
    const employeeLog = useEmployeeStore(s => s.activityLog);
    const { currentUser } = useAuth();

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');

    // Munge all timeline events from all leads into a common structure
    const allEvents = useMemo(() => {
        const leadEvents: AdminEvent[] = leads.flatMap(l =>
            l.timeline.map(evt => ({
                id: evt.id,
                type: evt.type as any,
                description: evt.text,
                by: evt.by,
                leadId: l.id,
                leadName: l.name,
                timestamp: evt.timestamp
            }))
        );
        return [...leadEvents, ...employeeLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [leads, employeeLog]);

    const eventTypes = useMemo(() => Array.from(new Set(allEvents.map(e => e.type))), [allEvents]);

    const filtered = useMemo(() => {
        return allEvents.filter(e => {
            if (e.by !== currentUser?.name) return false; // ONLY SHOW ADMIN ACTIONS

            if (search) {
                const q = search.toLowerCase();
                if (!e.description.toLowerCase().includes(q) && !(e.leadName?.toLowerCase().includes(q)) && !(e.employeeName?.toLowerCase().includes(q))) return false;
            }
            if (typeFilter !== 'All' && e.type !== typeFilter) return false;
            return true;
        });
    }, [allEvents, search, typeFilter, currentUser]);

    // Simple color mapping
    const typeStyles: Record<string, { bg: string, color: string }> = {
        'employee_created': { bg: '#ecfdf5', color: '#059669' },
        'employee_updated': { bg: '#eff6ff', color: '#2563eb' },
        'employee_deleted': { bg: '#fef2f2', color: '#ef4444' },
        'stage_change': { bg: '#f5f3ff', color: '#7c3aed' },
        'created': { bg: '#eff6ff', color: '#2563eb' },
        'call': { bg: '#fef3c7', color: '#d97706' },
        'note': { bg: '#f1f5f9', color: '#475569' },
        'visit': { bg: '#e0e7ff', color: '#4338ca' },
        'booking': { bg: '#ecfdf5', color: '#059669' },
    };

    return (
        <div className="responsive-padding" style={{ flex: 1, padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 16, background: '#f1f5f9' }}>

            {/* Header */}
            <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0d1b2e' }}>Admin Activity Log</h1>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>Events and actions performed by you</p>
            </div>

            {/* Filters */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8eef4', padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 350 }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search event descriptions or names…"
                        style={{ width: '100%', padding: '7px 10px 7px 30px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                    style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0d1b2e', textTransform: 'capitalize' }}>
                    <option value="All">All Action Types</option>
                    {eventTypes.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
                <span style={{ marginLeft: 'auto', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{filtered.length} events found</span>
            </div>

            {/* Event List */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef4', padding: '10px 0', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                {filtered.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                        <ActivityIcon size={36} color="#cbd5e1" style={{ marginBottom: 10 }} />
                        <div>No events match your criteria.</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {filtered.map((evt, i) => {
                            const style = typeStyles[evt.type] || { bg: '#f1f5f9', color: '#475569' };
                            return (
                                <div key={evt.id} style={{ padding: '12px 20px', display: 'flex', gap: 16, borderBottom: i === filtered.length - 1 ? 'none' : '1px solid #f1f5f9', transition: 'background 0.1s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                                    {/* Action Type Icon/Pill */}
                                    <div style={{ width: 100, flexShrink: 0 }}>
                                        <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: 99, background: style.bg, color: style.color, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
                                            {evt.type.replace('_', ' ')}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13.5, color: '#0d1b2e', fontWeight: 500, lineHeight: 1.5 }}>
                                            {evt.description}
                                        </div>

                                        {/* Reference (Lead/Employee) */}
                                        {(evt.leadName || evt.employeeName) && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b', marginTop: 4 }}>
                                                <Link size={12} opacity={0.6} />
                                                On {evt.leadName ? `Lead: ${evt.leadName}` : `Employee: ${evt.employeeName}`}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actor + Time */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, width: 140, flexShrink: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#334155' }}>
                                            <UserCircle size={14} /> {evt.by}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#94a3b8' }}>
                                            <Clock size={11} /> {formatTime(evt.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
