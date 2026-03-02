'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color?: 'primary' | 'urgent' | 'warning' | 'success' | 'purple';
    trend?: number;          // percentage change
    subtext?: string;
    progress?: number;       // 0-100 for progress bar variant
    progressLabel?: string;
    onClick?: () => void;
    delay?: number;
}

const colorMap = {
    primary: { bg: 'var(--primary-light)', icon: 'var(--primary)', ring: '#bfdbfe' },
    urgent: { bg: 'var(--urgent-light)', icon: 'var(--urgent)', ring: '#fecaca' },
    warning: { bg: 'var(--warning-light)', icon: 'var(--warning)', ring: '#fde68a' },
    success: { bg: 'var(--success-light)', icon: 'var(--success)', ring: '#a7f3d0' },
    purple: { bg: 'var(--purple-light)', icon: 'var(--purple)', ring: '#ddd6fe' },
};

export default function StatCard({
    label,
    value,
    icon: Icon,
    color = 'primary',
    trend,
    subtext,
    progress,
    progressLabel,
    onClick,
    delay = 0,
}: StatCardProps) {
    const c = colorMap[color];

    return (
        <div
            className="card hover-lift animate-fade-up"
            onClick={onClick}
            style={{
                padding: '18px 20px',
                cursor: onClick ? 'pointer' : 'default',
                animationDelay: `${delay}ms`,
                userSelect: 'none',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {/* Text */}
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                        {label}
                    </p>
                    <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>
                        {value}
                    </p>

                    {subtext && (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '5px 0 0' }}>{subtext}</p>
                    )}

                    {trend !== undefined && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                            {trend >= 0 ? (
                                <TrendingUp size={13} color="var(--success)" />
                            ) : (
                                <TrendingDown size={13} color="var(--urgent)" />
                            )}
                            <span style={{ fontSize: 12, fontWeight: 600, color: trend >= 0 ? 'var(--success)' : 'var(--urgent)' }}>
                                {trend >= 0 ? '+' : ''}{trend}% this week
                            </span>
                        </div>
                    )}
                </div>

                {/* Icon */}
                <div
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: c.bg,
                        border: `1px solid ${c.ring}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginLeft: 12,
                    }}
                >
                    <Icon size={20} color={c.icon} />
                </div>
            </div>

            {/* Progress bar variant */}
            {progress !== undefined && (
                <div style={{ marginTop: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                            {progressLabel}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: c.icon }}>{progress}%</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%`, background: `linear-gradient(90deg, ${c.icon}, ${c.ring})` }} />
                    </div>
                </div>
            )}
        </div>
    );
}
