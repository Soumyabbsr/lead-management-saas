'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLeadStore } from '@/store/useLeadStore';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useToast } from '@/context/ToastContext';
import { Lead } from '@/types/lead';
import PostVisitModal from '@/components/leads/PostVisitModal';
import { Search, MapPin, Eye, Phone, MessageCircle, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

const TODAY = new Date().toISOString().slice(0, 10);

export default function AdminVisitsPage() {
    const router = useRouter();
    const toast = useToast();

    const leads = useLeadStore(s => s.leads);
    const updateLead = useLeadStore(s => s.updateLead);
    const employees = useEmployeeStore(s => s.employees);
    const salesEmps = useMemo(() => employees.filter(e => e.role === 'sales' || e.role === 'field_agent'), [employees]);

    // Only consider leads that actually have a visitDate
    const allVisits = useMemo(() => leads.filter(l => Boolean(l.visitDate)), [leads]);

    const [search, setSearch] = useState('');
    const [empFilter, setEmpFilter] = useState('All');
    const [areaFilter, setAreaFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState<'All' | 'Today' | 'Upcoming' | 'Past'>('All');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Confirmed' | 'Pending' | 'Done'>('All');

    const [postVisitLead, setPostVisitLead] = useState<Lead | null>(null);

    const filtered = useMemo(() => {
        return allVisits.filter(l => {
            if (search) {
                const q = search.toLowerCase();
                if (!l.name.toLowerCase().includes(q) && !l.phone.includes(q)) return false;
            }
            if (empFilter !== 'All' && l.assignedTo !== empFilter) return false;
            if (areaFilter !== 'All' && l.preferredArea !== areaFilter) return false;
            if (statusFilter !== 'All' && l.visitStatus !== statusFilter) return false;

            if (dateFilter !== 'All' && l.visitDate) {
                const vDate = l.visitDate.slice(0, 10);
                if (dateFilter === 'Today' && vDate !== TODAY) return false;
                if (dateFilter === 'Upcoming' && vDate <= TODAY) return false;
                if (dateFilter === 'Past' && vDate >= TODAY) return false;
            }
            return true;
        }).sort((a, b) => new Date(a.visitDate!).getTime() - new Date(b.visitDate!).getTime());
    }, [allVisits, search, empFilter, areaFilter, dateFilter, statusFilter]);

    function handleReassign(leadId: string, agent: string) {
        updateLead(leadId, { assignedTo: agent });
        toast.success(`Visit reassigned to ${agent}`);
    }

    function handleMarkDone(lead: Lead) {
        setPostVisitLead(lead);
    }

    return (
        <div className="responsive-padding" style={{ flex: 1, padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 14, background: '#f1f5f9' }}>

            {/* Page header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0d1b2e' }}>Visit Management</h1>
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>System-wide upcoming and past visits</p>
                </div>
            </div>

            {/* Filters row */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8eef4', padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 180px' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search name, phone…"
                        style={{ width: '100%', padding: '7px 10px 7px 30px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }} />
                </div>

                <select value={dateFilter} onChange={e => setDateFilter(e.target.value as any)}
                    style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0d1b2e' }}>
                    <option value="All">All Dates</option>
                    <option value="Today">Today</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Past">Past</option>
                </select>

                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
                    style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0d1b2e' }}>
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Done">Done</option>
                </select>

                <select value={empFilter} onChange={e => setEmpFilter(e.target.value)}
                    style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0d1b2e' }}>
                    <option value="All">All Agents</option>
                    {salesEmps.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                </select>

                <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)}
                    style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0d1b2e' }}>
                    <option value="All">All Areas</option>
                    {useSettingsStore().areas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>

                <span style={{ marginLeft: 'auto', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{filtered.length} visits</span>
            </div>

            {/* Table grid instead of classic table for better visit readability */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
                {filtered.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14, background: '#fff', borderRadius: 14, border: '1px solid #e8eef4' }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
                        No visits match your filters.
                    </div>
                ) : filtered.map(lead => {
                    const vDate = new Date(lead.visitDate!);
                    const isToday = lead.visitDate!.slice(0, 10) === TODAY;
                    const isPast = lead.visitDate!.slice(0, 10) < TODAY;

                    return (
                        <div key={lead.id}
                            onClick={() => router.push(`/admin/leads/${lead.id}`)}
                            style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8eef4', padding: 18, position: 'relative', cursor: 'pointer', transition: 'transform 0.1s, box-shadow 0.1s' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.05)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>

                            {/* Date Badge */}
                            <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', background: isToday ? '#fffbeb' : isPast ? '#f1f5f9' : '#eff6ff', border: `1px solid ${isToday ? '#fde68a' : isPast ? '#e2e8f0' : '#bfdbfe'}`, borderRadius: 8, padding: '4px 10px', minWidth: 50 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: isToday ? '#d97706' : isPast ? '#64748b' : '#2563eb', textTransform: 'uppercase' }}>
                                    {isToday ? 'Today' : vDate.toLocaleDateString('en-US', { month: 'short' })}
                                </span>
                                <span style={{ fontSize: 18, fontWeight: 800, color: isToday ? '#b45309' : isPast ? '#475569' : '#1e40af', lineHeight: 1 }}>
                                    {vDate.getDate()}
                                </span>
                            </div>

                            {/* Status Pill */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: lead.visitStatus === 'Done' ? '#ecfdf5' : lead.visitStatus === 'Confirmed' ? '#e0f2fe' : '#fef2f2', color: lead.visitStatus === 'Done' ? '#059669' : lead.visitStatus === 'Confirmed' ? '#0284c7' : '#ef4444', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, marginBottom: 12 }}>
                                {lead.visitStatus === 'Done' ? <CheckCircle2 size={12} /> : lead.visitStatus === 'Confirmed' ? <CalendarCheck size={12} /> : <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentcolor' }} />}
                                {lead.visitStatus}
                            </div>

                            <div style={{ fontSize: 15, fontWeight: 700, color: '#0d1b2e' }}>{lead.name}</div>
                            <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2, fontFamily: 'monospace' }}>+91 {lead.phone}</div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, color: '#475569', fontSize: 12.5 }}>
                                <MapPin size={13} /> {lead.preferredArea || 'Area not specified'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, color: '#475569', fontSize: 12.5 }}>
                                <CalendarCheck size={13} /> Time: {lead.visitSchedule?.time || new Date(lead.visitDate!).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>

                            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={e => e.stopPropagation()}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Assigned Agent</span>
                                    <select value={lead.assignedTo} onChange={e => handleReassign(lead.id, e.target.value)}
                                        style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #e8eef4', fontSize: 12, outline: 'none', color: '#0d1b2e', fontWeight: 600, cursor: 'pointer', background: '#f8fafc' }}>
                                        {salesEmps.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
                                    </select>
                                </div>

                                {lead.visitStatus !== 'Done' && (
                                    <button onClick={() => handleMarkDone(lead)}
                                        style={{ padding: '6px 14px', borderRadius: 8, background: '#0d1b2e', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                                        Mark Done
                                    </button>
                                )}
                            </div>

                        </div>
                    );
                })}
            </div>

            {postVisitLead && (
                <PostVisitModal
                    open={!!postVisitLead}
                    lead={postVisitLead}
                    onClose={() => setPostVisitLead(null)}
                    onAction={() => setPostVisitLead(null)}
                />
            )}
        </div>
    );
}
