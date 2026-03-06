'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export interface DropdownAction {
    label: string | React.ReactNode;
    icon?: React.ReactNode;
    onClick?: () => void;
    href?: string;
    danger?: boolean;
}

export interface DropdownMenuProps {
    actions: DropdownAction[];
}

export default function DropdownMenu({ actions }: DropdownMenuProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                }}
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                }}
            >
                <MoreVertical size={18} />
            </button>

            {open && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 4,
                    background: '#fff',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    minWidth: 140,
                    zIndex: 50,
                    padding: 4,
                }}>
                    {actions.map((action, i) => {
                        const content = (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                                {action.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{action.icon}</span>}
                                {action.label}
                            </div>
                        );

                        if (action.href) {
                            return (
                                <a
                                    key={i}
                                    href={action.href}
                                    style={{
                                        display: 'block',
                                        padding: '8px 12px',
                                        color: action.danger ? '#ef4444' : '#334155',
                                        fontSize: 13,
                                        fontWeight: 500,
                                        textDecoration: 'none',
                                        borderRadius: 6,
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = action.danger ? '#fef2f2' : '#f8fafc')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    {content}
                                </a>
                            );
                        }

                        return (
                            <button
                                key={i}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen(false);
                                    if (action.onClick) action.onClick();
                                }}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    textAlign: 'left',
                                    background: 'transparent',
                                    border: 'none',
                                    padding: '8px 12px',
                                    color: action.danger ? '#ef4444' : '#334155',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    borderRadius: 6,
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = action.danger ? '#fef2f2' : '#f8fafc')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                                {content}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
