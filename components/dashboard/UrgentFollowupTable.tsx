'use client';

import { useMemo } from 'react';
import { useLeadStore } from '@/store/useLeadStore';
import { useMyLeads } from '@/hooks/useMyLeads';
import { LeadStage } from '@/types/lead';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const STAGES: LeadStage[] = ['New', 'Contacted', 'Visit', 'Negotiation', 'Booked'];

const stageBadgeColor: Partial<Record<LeadStage, { bg: string; color: string }>> = {
    New: { bg: '#fff7ed', color: '#f97316' },
    Contacted: { bg: '#f5f3ff', color: '#7c3aed' },
    Visit: { bg: '#fffbeb', color: '#d97706' },
    Negotiation: { bg: '#fff7ed', color: '#ea580c' },
    Booked: { bg: '#ecfdf5', color: '#059669' },
    Lost: { bg: '#fef2f2', color: '#ef4444' },
};
const DEFAULT_BADGE = { bg: '#f1f5f9', color: '#64748b' };

const TODAY_STR = new Date().toISOString().slice(0, 10);

function hoursDiff(dateStr: string) {
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60));
}

export default function UrgentFollowupTable() {
    const leads = useMyLeads();
    const moveStage = useLeadStore(s => s.moveStage);
    const markFollowUpDone = useLeadStore(s => s.markFollowUpDone);
    const router = useRouter();

    const urgent = useMemo(() => leads.filter(l => {
        if (l.stage === 'Booked' || l.stage === 'Lost') return false;

        const isOverdue = Date.now() - new Date(l.lastActivity).getTime() > 24 * 60 * 60 * 1000;
        const isFollowUpDueToday = l.followUpDue && l.followUpDue.slice(0, 10) === TODAY_STR;

        return isOverdue || isFollowUpDueToday;
    }), [leads]);

    return (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef4', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e8eef4' }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0d1b2e' }}>Urgent Follow Up</h3>
                <button style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>
                    All Leads <ArrowRight size={13} />
                </button>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, borderBottom: '1px solid #e8eef4', whiteSpace: 'nowrap' }}>Lead Name</th>
                            <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, borderBottom: '1px solid #e8eef4', whiteSpace: 'nowrap' }}>Contact</th>
                            <th className="mobile-hidden" style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, borderBottom: '1px solid #e8eef4', whiteSpace: 'nowrap' }}>Location</th>
                            <th className="mobile-hidden" style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, borderBottom: '1px solid #e8eef4', whiteSpace: 'nowrap' }}>Budget</th>
                            <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, borderBottom: '1px solid #e8eef4', whiteSpace: 'nowrap' }}>Overdue</th>
                            <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, borderBottom: '1px solid #e8eef4', whiteSpace: 'nowrap' }}>Stage</th>
                            <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, borderBottom: '1px solid #e8eef4', whiteSpace: 'nowrap' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {urgent.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ padding: 28, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>✅ No urgent follow-ups</td>
                            </tr>
                        )}
                        {urgent.map(lead => {
                            const hrs = hoursDiff(lead.lastActivity);
                            const isOverdue24 = hrs > 24;
                            return (
                                <tr key={lead.id}
                                    onClick={() => router.push(`/leads/${lead.id}`)}
                                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.12s', cursor: 'pointer' }}
                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>

                                    {/* Lead Name */}
                                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0d1b2e' }}>{lead.name}</td>

                                    {/* Contact */}
                                    <td style={{ padding: '12px 16px', color: '#475569', fontFamily: 'monospace', fontSize: 12.5 }}>
                                        +91 {lead.phone}
                                    </td>

                                    {/* Location */}
                                    <td className="mobile-hidden" style={{ padding: '12px 16px', color: '#475569' }}>
                                        {lead.preferredArea || '—'}
                                    </td>

                                    {/* Budget */}
                                    <td className="mobile-hidden" style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>
                                        {lead.budget ? `₹${lead.budget.toLocaleString('en-IN')}` : '—'}
                                    </td>

                                    {/* Overdue */}
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            fontSize: 12, fontWeight: 600,
                                            color: isOverdue24 ? '#ef4444' : '#f97316',
                                        }}>
                                            {isOverdue24 ? `${hrs} hours ago` : 'Due today'}
                                        </span>
                                    </td>

                                    {/* Stage */}
                                    <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                                        <select
                                            value={lead.stage}
                                            onChange={e => moveStage(lead.id, e.target.value as LeadStage)}
                                            style={{
                                                appearance: 'none',
                                                WebkitAppearance: 'none',
                                                padding: '4px 24px 4px 10px',
                                                borderRadius: 99,
                                                border: `1.5px solid ${(stageBadgeColor[lead.stage] ?? DEFAULT_BADGE).color}55`,
                                                color: (stageBadgeColor[lead.stage] ?? DEFAULT_BADGE).color,
                                                fontSize: 12,
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23f97316' stroke-width='3'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 6px center',
                                                backgroundColor: (stageBadgeColor[lead.stage] ?? DEFAULT_BADGE).bg, // Explicit fallback
                                                outline: 'none',
                                            }}
                                        >
                                            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>

                                    {/* Action */}
                                    <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => markFollowUpDone(lead.id)}
                                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, border: '1px solid #bfdbfe', background: '#eff6ff', color: '#2563eb', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
                                        >
                                            <CheckCircle2 size={13} />
                                            Done
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
