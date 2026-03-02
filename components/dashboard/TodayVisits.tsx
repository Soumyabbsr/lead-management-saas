'use client';

import { useMemo } from 'react';
import { useLeadStore } from '@/store/useLeadStore';
import { useMyLeads } from '@/hooks/useMyLeads';
import { Lead } from '@/types/lead';
import { Phone, CheckCircle2 } from 'lucide-react';

const TODAY_STR = new Date().toISOString().slice(0, 10);

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
}

function isPast(iso: string) {
    return new Date(iso).getTime() < Date.now();
}

interface Props {
    onMarkDone?: (lead: Lead) => void;
}

export default function TodayVisitsSidebar({ onMarkDone }: Props) {
    const leads = useMyLeads();
    const markVisitDone = useLeadStore(s => s.markVisitDone);

    const todayVisits = useMemo(() =>
        leads.filter(l => l.stage === 'Visit' && l.visitDate && l.visitDate.slice(0, 10) === TODAY_STR),
        [leads]
    );

    function handleDone(lead: Lead) {
        if (onMarkDone) {
            onMarkDone(lead);
        } else {
            markVisitDone(lead.id);
        }
    }

    return (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef4', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #e8eef4', display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0d1b2e', flex: 1 }}>Today Visits</h3>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                    {todayVisits.length}
                </div>
            </div>

            {/* Cards */}
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {todayVisits.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>📅 No visits today</div>
                ) : (
                    todayVisits.map((lead, idx) => {
                        const over = lead.visitDate ? isPast(lead.visitDate) && lead.visitStatus !== 'Done' : false;
                        const done = lead.visitStatus === 'Done';
                        return (
                            <div key={lead.id} style={{
                                padding: '12px 14px',
                                borderBottom: idx < todayVisits.length - 1 ? '1px solid #f1f5f9' : 'none',
                                borderLeft: `3px solid ${over ? '#ef4444' : done ? '#10b981' : 'transparent'}`,
                                background: over ? '#fff5f5' : 'transparent',
                            }}>
                                {/* Row 1: name + time badge */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{ fontWeight: 700, fontSize: 13.5, color: '#0d1b2e' }}>{lead.name}</span>
                                    {lead.visitDate && (
                                        <span style={{ background: over ? '#ef4444' : '#f97316', color: '#fff', fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                                            {formatTime(lead.visitDate)}
                                        </span>
                                    )}
                                </div>

                                {/* Row 2: PG + budget */}
                                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                                    {lead.visitSchedule?.propertyName || 'PG'} {lead.visitSchedule?.roomNo ? `(${lead.visitSchedule.roomNo})` : ''} {lead.budget && <> • <span style={{ color: '#0d1b2e', fontWeight: 600 }}>₹{lead.budget.toLocaleString('en-IN')}</span></>}
                                </div>

                                {/* Row 3: agent */}
                                <div style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 8 }}>
                                    Assigned Field agent : <span style={{ color: '#475569', fontWeight: 600 }}>{lead.visitSchedule?.fieldAgent ?? lead.assignedTo}</span>
                                </div>

                                {!done ? (
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <a href={`tel:${lead.phone}`}
                                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '5px 0', borderRadius: 7, fontSize: 11.5, fontWeight: 600, background: '#ecfdf5', color: '#059669', textDecoration: 'none', border: '1px solid #a7f3d0' }}>
                                            <Phone size={11} /> Call
                                        </a>
                                        <button onClick={() => handleDone(lead)}
                                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '5px 0', borderRadius: 7, fontSize: 11.5, fontWeight: 600, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', cursor: 'pointer' }}>
                                            <CheckCircle2 size={11} /> Mark Done
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>✓ Completed</div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
