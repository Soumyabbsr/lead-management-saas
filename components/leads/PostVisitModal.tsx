'use client';

import Modal from '@/components/ui/Modal';
import { Lead } from '@/types/lead';
import { CheckCircle, TrendingUp, CalendarClock, XCircle } from 'lucide-react';

type VisitAction = 'negotiation' | 'booked' | 'reschedule' | 'lost';

interface Props {
    open: boolean;
    onClose: () => void;
    lead: Lead;
    onAction: (action: VisitAction) => void;
}

const options: { action: VisitAction; label: string; sub: string; icon: React.ReactNode; bg: string; color: string }[] = [
    { action: 'negotiation', label: 'Move to Negotiation', sub: 'Lead is interested, discussing terms', icon: <TrendingUp size={20} />, bg: '#fff7ed', color: '#f97316' },
    { action: 'booked', label: 'Move to Booked', sub: 'Lead confirmed booking', icon: <CheckCircle size={20} />, bg: '#ecfdf5', color: '#059669' },
    { action: 'reschedule', label: 'Reschedule Visit', sub: 'Pick a new date and time', icon: <CalendarClock size={20} />, bg: '#eff6ff', color: '#2563eb' },
    { action: 'lost', label: 'Mark as Lost', sub: 'Lead not interested anymore', icon: <XCircle size={20} />, bg: '#fef2f2', color: '#ef4444' },
];

export default function PostVisitModal({ open, onClose, lead, onAction }: Props) {
    return (
        <Modal open={open} onClose={onClose} title={`Visit Done — ${lead.name}`} width={460}>
            <p style={{ margin: '0 0 16px', fontSize: 13.5, color: '#64748b' }}>
                What happened after the visit? Choose next action:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {options.map(opt => (
                    <button
                        key={opt.action}
                        onClick={() => onAction(opt.action)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            padding: '14px 16px', borderRadius: 12,
                            border: `1.5px solid ${opt.color}33`,
                            background: opt.bg, cursor: 'pointer',
                            textAlign: 'left', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = opt.color)}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = `${opt.color}33`)}
                    >
                        <div style={{ color: opt.color, flexShrink: 0 }}>{opt.icon}</div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0d1b2e' }}>{opt.label}</div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{opt.sub}</div>
                        </div>
                    </button>
                ))}
            </div>
        </Modal>
    );
}
