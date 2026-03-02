'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Users, MapPin, BookOpen, UserCircle, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { useState, useEffect } from 'react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/leads', label: 'My Leads', icon: Users },
    { href: '/visits', label: 'Visit Leads', icon: MapPin },
    { href: '/bookings', label: 'Booking', icon: BookOpen },
    { href: '/profile', label: 'My Profile', icon: UserCircle },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { currentUser, setCurrentUser, logout } = useAuth();
    const { isOpen, setIsOpen } = useSidebar();
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile(); // Check on mount
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!currentUser) return null;

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${isOpen ? 'open' : ''} desktop-hidden`}
                onClick={() => setIsOpen(false)}
            />
            <aside
                className={`sidebar-mobile ${isOpen ? 'open' : ''}`}
                style={{
                    width: 208,
                    minWidth: 208,
                    background: '#0d1b2e',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0 12px 20px',
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    overflowY: 'auto',
                    flexShrink: 0,
                    zIndex: 50,
                }}>
                {/* User header */}
                <div style={{ padding: '20px 6px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 8 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                        Hi, {currentUser.name.split(' ')[0]}
                    </div>
                    <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 500, marginTop: 2 }}>
                        Role: {currentUser.role}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 2, fontWeight: 500 }}>
                        {currentUser.assignedAreas?.slice(0, 2).join(', ')}{currentUser.assignedAreas?.length > 2 ? '…' : ''}
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 4 }}>
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href || pathname.startsWith(href + '/');
                        return (
                            <Link key={href} href={href}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '9px 12px', borderRadius: 8, fontSize: 13.5,
                                    fontWeight: active ? 600 : 500,
                                    color: active ? '#fff' : '#8fa3bc',
                                    background: active ? '#f97316' : 'transparent',
                                    textDecoration: 'none', transition: 'all 0.15s',
                                }}>
                                <Icon size={15} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Admin Panel shortcut */}
                {currentUser.role === 'admin' && (
                    <div style={{ marginBottom: 8 }}>
                        <Link href="/admin/dashboard"
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(249,115,22,0.15))', border: '1px solid rgba(249,115,22,0.3)', color: '#fb923c', textDecoration: 'none', fontSize: 12.5, fontWeight: 700 }}>
                            <ShieldCheck size={13} /> Admin Panel
                        </Link>
                    </div>
                )}

                {/* Logout button */}
                <div style={{ position: 'relative', marginTop: 12 }}>
                    <button
                        onClick={logout}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            padding: '10px', borderRadius: 9, cursor: 'pointer',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                            color: '#ef4444', fontSize: 13, fontWeight: 700,
                        }}
                    >
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}
