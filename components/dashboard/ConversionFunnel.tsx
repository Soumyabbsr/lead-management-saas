'use client';

import { useMemo } from 'react';
import { useMyLeads } from '@/hooks/useMyLeads';

export default function ConversionFunnel() {
    const leads = useMyLeads();

    const { total, siteVisits, bookingRequests, confirmed, rate } = useMemo(() => {
        const total = leads.length;
        const siteVisits = leads.filter(l => ['Visit', 'Negotiation', 'Booked'].includes(l.stage)).length;
        const bookingRequests = leads.filter(l => ['Negotiation', 'Booked'].includes(l.stage)).length;
        const confirmed = leads.filter(l => l.stage === 'Booked').length;
        const rate = total > 0 ? Math.round((confirmed / total) * 100) : 0;
        return { total, siteVisits, bookingRequests, confirmed, rate };
    }, [leads]);

    // Trapezoid widths as % of container, widest at top
    const levels = [
        { label: 'Total Leads', count: total, color: '#153a6c', dot: '#2563eb' },
        { label: 'Site Visits', count: siteVisits, color: '#1e4f9c', dot: '#3b82f6' },
        { label: 'Booking Requests', count: bookingRequests, color: '#2563eb', dot: '#d946ef' },
        { label: 'Confirmed', count: confirmed, color: '#3b82f6', dot: '#ef4444' },
    ];

    return (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef4', padding: '16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0d1b2e' }}>Conversion Funnel</h3>
                <div style={{
                    background: '#2563eb', color: '#fff',
                    fontSize: 11, fontWeight: 700,
                    padding: '4px 12px', borderRadius: 99,
                }}>
                    {rate}% Rate
                </div>
            </div>

            {/* Triangle funnel using CSS clip-path trapezoids */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginBottom: 16, padding: '0 8px' }}>
                {levels.map((lvl, i) => {
                    const widthPct = 100 - i * 18; // 100%, 82%, 64%, 46%
                    const isLast = i === levels.length - 1;
                    return (
                        <div key={lvl.label} style={{ width: `${widthPct}%`, position: 'relative' }}>
                            <div style={{
                                height: 34,
                                background: lvl.color,
                                borderRadius: isLast ? '0 0 8px 8px' : i === 0 ? '8px 8px 0 0' : 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{lvl.count}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {levels.map(lvl => (
                    <div key={lvl.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: lvl.dot, flexShrink: 0 }} />
                        <span style={{ color: '#475569', fontWeight: 500 }}>{lvl.label}</span>
                        <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#0d1b2e' }}>{lvl.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
