'use client';

import { LeadStage } from '@/types/lead';
import { useLeadStore } from '@/store/useLeadStore';
import { useMyLeads } from '@/hooks/useMyLeads';
import { useMemo } from 'react';

type PipelineStage = 'New' | 'Contacted' | 'Visit' | 'Negotiation' | 'Booked';

const STAGES: PipelineStage[] = ['New', 'Contacted', 'Visit', 'Negotiation', 'Booked'];

const stageColors: Record<PipelineStage, { bg: string; text: string; active: string; dot: string }> = {
    New: { bg: '#eff6ff', text: '#1d4ed8', active: '#2563eb', dot: '#93c5fd' },
    Contacted: { bg: '#f5f3ff', text: '#6d28d9', active: '#7c3aed', dot: '#c4b5fd' },
    Visit: { bg: '#fffbeb', text: '#b45309', active: '#d97706', dot: '#fcd34d' },
    Negotiation: { bg: '#fff7ed', text: '#c2410c', active: '#ea580c', dot: '#fdba74' },
    Booked: { bg: '#ecfdf5', text: '#047857', active: '#10b981', dot: '#6ee7b7' },
};

export default function PipelineSnapshot() {
    const leads = useMyLeads();
    const selectedStage = useLeadStore(s => s.selectedStage);
    const filterByStage = useLeadStore(s => s.filterByStage);
    const clearFilters = useLeadStore(s => s.clearFilters);

    // Compute counts stably with useMemo
    const counts = useMemo<Record<PipelineStage, number>>(() => ({
        New: leads.filter(l => l.stage === 'New').length,
        Contacted: leads.filter(l => l.stage === 'Contacted').length,
        Visit: leads.filter(l => l.stage === 'Visit').length,
        Negotiation: leads.filter(l => l.stage === 'Negotiation').length,
        Booked: leads.filter(l => l.stage === 'Booked').length,
    }), [leads]);

    const total = useMemo(() => leads.length, [leads]);

    const handleClick = (stage: LeadStage) => {
        if (selectedStage === stage) {
            clearFilters();
        } else {
            filterByStage(stage);
        }
    };

    return (
        <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Pipeline Snapshot
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                        {total} total leads — click stage to filter
                    </p>
                </div>
                {selectedStage && (
                    <button
                        onClick={clearFilters}
                        style={{
                            fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                            background: '#f1f5f9', border: '1px solid var(--border)', cursor: 'pointer',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        Clear Filter ×
                    </button>
                )}
            </div>

            {/* Stage boxes */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {STAGES.map((stage, i) => {
                    const c = stageColors[stage];
                    const isActive = selectedStage === stage;
                    const pct = total > 0 ? Math.round((counts[stage] / total) * 100) : 0;

                    return (
                        <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: '1 1 0', minWidth: 110 }}>
                            <div
                                onClick={() => handleClick(stage)}
                                style={{
                                    flex: 1,
                                    background: isActive ? c.active : c.bg,
                                    border: `1.5px solid ${isActive ? c.active : 'transparent'}`,
                                    borderRadius: 10,
                                    padding: '12px 14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.18s',
                                    boxShadow: isActive ? `0 0 0 3px ${c.dot}44` : 'none',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? '#fff' : c.text, marginBottom: 5, opacity: isActive ? 0.85 : 1 }}>
                                            {stage}
                                        </div>
                                        <div style={{ fontSize: 22, fontWeight: 800, color: isActive ? '#fff' : c.text, lineHeight: 1 }}>
                                            {counts[stage]}
                                        </div>
                                        <div style={{ fontSize: 10.5, color: isActive ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)', marginTop: 3 }}>
                                            {pct}% of total
                                        </div>
                                    </div>
                                    <div style={{
                                        width: 8, height: 8, borderRadius: '50%',
                                        background: isActive ? '#fff' : c.dot,
                                        marginTop: 3,
                                    }} />
                                </div>
                            </div>

                            {/* Arrow between stages */}
                            {i < STAGES.length - 1 && (
                                <div className="mobile-hidden" style={{ color: '#cbd5e1', fontSize: 16, padding: '0 2px', flexShrink: 0 }}>→</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Proportional bar */}
            <div style={{ display: 'flex', gap: 2, marginTop: 12, borderRadius: 6, overflow: 'hidden', height: 5 }}>
                {STAGES.map((stage) => {
                    const pct = total > 0 ? (counts[stage] / total) * 100 : 0;
                    return (
                        <div
                            key={stage}
                            style={{ width: `${pct}%`, background: stageColors[stage].active, transition: 'width 0.4s ease' }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
