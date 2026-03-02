import { LeadStage } from '@/types/lead';

interface BadgeProps {
    stage: LeadStage;
}

export function StageBadge({ stage }: BadgeProps) {
    const classMap: Record<LeadStage, string> = {
        New: 'stage-new',
        Contacted: 'stage-contacted',
        Visit: 'stage-visit',
        Negotiation: 'stage-negotiation',
        Booked: 'stage-booked',
        Lost: 'stage-lost',
    };
    return (
        <span className={`badge ${classMap[stage]}`}>{stage}</span>
    );
}

interface StatusBadgeProps {
    status: 'Confirmed' | 'Pending' | 'Done';
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const styleMap = {
        Confirmed: { background: '#eff6ff', color: '#1d4ed8' },
        Pending: { background: '#fffbeb', color: '#b45309' },
        Done: { background: '#ecfdf5', color: '#047857' },
    };
    return (
        <span className="badge" style={styleMap[status]}>
            {status}
        </span>
    );
}
