'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastCtx {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
    warning: (msg: string) => void;
}

const ToastContext = createContext<ToastCtx | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

const styles: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: { bg: '#f0fdf4', border: '#86efac', icon: '#16a34a' },
    error: { bg: '#fef2f2', border: '#fca5a5', icon: '#dc2626' },
    info: { bg: '#eff6ff', border: '#93c5fd', icon: '#2563eb' },
    warning: { bg: '#fffbeb', border: '#fcd34d', icon: '#d97706' },
};

const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={15} />,
    error: <XCircle size={15} />,
    info: <Info size={15} />,
    warning: <Info size={15} />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const add = useCallback((type: ToastType, message: string) => {
        const id = Math.random().toString(36).slice(2);
        setToasts(p => [...p, { id, type, message }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
    }, []);

    const ctx: ToastCtx = {
        success: (m) => add('success', m),
        error: (m) => add('error', m),
        info: (m) => add('info', m),
        warning: (m) => add('warning', m),
    };

    return (
        <ToastContext.Provider value={ctx}>
            {children}
            {/* Toast stack */}
            <div style={{
                position: 'fixed', bottom: 24, right: 24,
                display: 'flex', flexDirection: 'column', gap: 10, zIndex: 9999,
                pointerEvents: 'none',
            }}>
                {toasts.map(t => {
                    const s = styles[t.type];
                    return (
                        <div key={t.id} style={{
                            background: s.bg,
                            border: `1px solid ${s.border}`,
                            borderRadius: 10,
                            padding: '12px 16px',
                            display: 'flex', alignItems: 'center', gap: 10,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            minWidth: 260, maxWidth: 360,
                            pointerEvents: 'auto',
                            animation: 'fadeUp 0.25s ease both',
                            color: s.icon,
                        }}>
                            {icons[t.type]}
                            <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{t.message}</span>
                            <button
                                onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: 0 }}
                            >
                                <X size={13} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}
