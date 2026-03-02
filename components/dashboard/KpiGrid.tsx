'use client';

import { useMemo } from 'react';
import { useMyLeads } from '@/hooks/useMyLeads';
import { BarChart2, Users, Clock, Calendar, UserCheck, Handshake } from 'lucide-react';
import { Lead } from '@/types/lead';

const TODAY_STR = new Date().toISOString().slice(0, 10);

interface KpiCardProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    iconBg: string;
}

function KpiCard({ label, value, icon, iconBg }: KpiCardProps) {
    return (
        <div style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e8eef4',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flex: '1 1 0',
            minWidth: 0,
        }}>
            <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0d1b2e', lineHeight: 1 }}>{value}</div>
            </div>
        </div>
    );
}

export default function KpiGrid() {
    const leads = useMyLeads();

    const metrics = useMemo(() => ({
        hotLeads: leads.filter(l => l.stage === 'Negotiation' || l.stage === 'Visit').length,
        newLeads: leads.filter(l => l.stage === 'New').length,
        todayFollowUps: leads.filter(l => l.followUpDue && l.followUpDue.slice(0, 10) === TODAY_STR).length,
        visitScheduled: leads.filter(l => l.stage === 'Visit').length,
        negotiation: leads.filter(l => l.stage === 'Negotiation').length,
        bookingClosed: leads.filter(l => l.stage === 'Booked').length,
    }), [leads]);

    const cards: KpiCardProps[] = [
        {
            label: 'Hot Leads',
            value: metrics.hotLeads,
            icon: <BarChart2 size={20} color="#f97316" />,
            iconBg: '#fff7ed',
        },
        {
            label: 'New Leads',
            value: metrics.newLeads,
            icon: <Users size={20} color="#2563eb" />,
            iconBg: '#eff6ff',
        },
        {
            label: "Today's Follow-up",
            value: metrics.todayFollowUps,
            icon: <Clock size={20} color="#f97316" />,
            iconBg: '#fff7ed',
        },
        {
            label: 'Visit Scheduled',
            value: metrics.visitScheduled,
            icon: <Calendar size={20} color="#10b981" />,
            iconBg: '#ecfdf5',
        },
        {
            label: 'Negotiation Stage',
            value: metrics.negotiation,
            icon: <UserCheck size={20} color="#f97316" />,
            iconBg: '#fff7ed',
        },
        {
            label: 'Booking Closed',
            value: metrics.bookingClosed,
            icon: <Handshake size={20} color="#2563eb" />,
            iconBg: '#eff6ff',
        },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            {cards.map(c => <KpiCard key={c.label} {...c} />)}
        </div>
    );
}
