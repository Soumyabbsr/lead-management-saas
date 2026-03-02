'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    width?: number;
}

export default function Modal({ open, onClose, title, children, width = 520 }: ModalProps) {
    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(15,23,42,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px',
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{
                background: '#fff',
                borderRadius: 16,
                width: '100%',
                maxWidth: width,
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
                animation: 'fadeUp 0.22s ease both',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '18px 22px',
                    borderBottom: '1px solid #e8eef4',
                    position: 'sticky', top: 0, background: '#fff', borderRadius: '16px 16px 0 0', zIndex: 1,
                }}>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0d1b2e' }}>{title}</h2>
                    <button onClick={onClose} style={{
                        background: '#f1f5f9', border: 'none', borderRadius: 8,
                        width: 30, height: 30, cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', color: '#64748b',
                    }}>
                        <X size={15} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '20px 22px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
