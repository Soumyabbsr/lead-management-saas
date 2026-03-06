'use client';

import { useEffect, useState } from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';

export default function AdminTopBar() {
    const { currentUser } = useAuth();
    const { toggleSidebar } = useSidebar();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!isMobile) return null;

    return (
        <div style={{
            background: '#0a0f1e',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            position: 'sticky',
            top: 0,
            zIndex: 30,
        }}>
            {/* Hamburger */}
            <button
                onClick={toggleSidebar}
                style={{
                    background: 'none', border: 'none', padding: 8, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#94a3b8',
                }}>
                <Menu size={22} />
            </button>

            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: 'linear-gradient(135deg,#ef4444,#f97316)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <ShieldCheck size={13} color="#fff" />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                    Admin Panel
                </span>
            </div>

            {/* User avatar */}
            <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg,#ef4444,#f97316)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0,
            }}>
                {currentUser?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
        </div>
    );
}
