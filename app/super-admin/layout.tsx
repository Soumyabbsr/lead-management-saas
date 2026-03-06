'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import SuperAdminProtectedRoute from '@/components/SuperAdminProtectedRoute';
import {
    LayoutDashboard, Users, CreditCard, Settings, LogOut,
    Menu, Shield, X
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
    { name: 'Tenants', href: '/super-admin/tenants', icon: Users },
    { name: 'Plans', href: '/super-admin/plans', icon: CreditCard },
    { name: 'Settings', href: '/super-admin/settings', icon: Settings },
];

function SuperAdminSidebar() {
    const pathname = usePathname();
    const { logout, currentUser } = useAuth();
    const { isOpen, setIsOpen } = useSidebar();

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
                    width: 260, minWidth: 260,
                    background: '#0f172a',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px 16px',
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    overflowY: 'auto',
                    flexShrink: 0,
                    zIndex: 50,
                }}
            >
                {/* Brand */}
                <div style={{ padding: '0 8px 32px 8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Shield size={16} color="#fff" />
                    </div>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px' }}>Platform Admin</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>PG CRM Core</div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '11px 12px',
                                    borderRadius: 8,
                                    color: isActive ? '#fff' : '#94a3b8',
                                    background: isActive ? '#1e293b' : 'transparent',
                                    textDecoration: 'none',
                                    fontWeight: isActive ? 600 : 500,
                                    fontSize: 15,
                                    transition: 'all 0.15s',
                                }}
                            >
                                <Icon size={20} style={{ color: isActive ? '#818cf8' : 'currentColor' }} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User footer */}
                <div style={{ paddingTop: 24, borderTop: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px' }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 'bold', color: '#fff',
                        }}>
                            {currentUser?.name?.charAt(0) || 'S'}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {currentUser?.name}
                            </div>
                            <div style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {currentUser?.email}
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

function SuperAdminTopBar() {
    const { toggleSidebar } = useSidebar();
    const { currentUser } = useAuth();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    if (!isMobile) return null;

    return (
        <div style={{
            background: '#0f172a',
            borderBottom: '1px solid #1e293b',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            position: 'sticky',
            top: 0,
            zIndex: 30,
        }}>
            <button
                onClick={toggleSidebar}
                style={{
                    background: 'none', border: 'none', padding: 8, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#94a3b8',
                }}
            >
                <Menu size={22} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Shield size={13} color="#fff" />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Platform Admin</span>
            </div>
            <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0,
            }}>
                {currentUser?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
        </div>
    );
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Don't render sidebar on login page
    if (pathname === '/super-admin/login') {
        return <>{children}</>;
    }

    return (
        <SuperAdminProtectedRoute>
            <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: '#f8fafc', overflowX: 'hidden' }}>
                <SuperAdminSidebar />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
                    <SuperAdminTopBar />
                    <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }} className="responsive-padding">
                        {children}
                    </div>
                </div>
            </div>
        </SuperAdminProtectedRoute>
    );
}
