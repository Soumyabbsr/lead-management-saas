'use client';

import { useSidebar } from '@/context/SidebarContext';
import { Menu, User } from 'lucide-react';

export default function AdminTopBar() {
    const { toggleSidebar } = useSidebar();

    return (
        <div
            style={{
                display: 'none',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '56px',
                background: '#1e293b',
                zIndex: 999,
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
            className="admin-top-bar"
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                    onClick={toggleSidebar}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        padding: '4px',
                    }}
                >
                    <Menu size={24} />
                </button>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>
                    Admin Panel
                </span>
            </div>

            <div
                style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <User size={16} color="#fff" />
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    .admin-top-bar {
                        display: flex !important;
                    }
                }
            `}</style>
        </div>
    );
}
