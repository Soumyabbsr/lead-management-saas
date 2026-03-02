'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import SuperAdminProtectedRoute from '@/components/SuperAdminProtectedRoute';
import { LayoutDashboard, Users, CreditCard, Settings, LogOut } from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout, currentUser } = useAuth();

    // Don't render sidebar on login page
    if (pathname === '/super-admin/login') {
        return <>{children}</>;
    }

    const navigation = [
        { name: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
        { name: 'Tenants', href: '/super-admin/tenants', icon: Users },
        { name: 'Plans', href: '/super-admin/plans', icon: CreditCard },
        { name: 'Settings', href: '/super-admin/settings', icon: Settings },
    ];

    return (
        <SuperAdminProtectedRoute>
            <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', background: '#f8fafc' }}>
                {/* Sidebar */}
                <div style={{
                    width: '260px',
                    background: '#0f172a',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px 16px'
                }}>
                    <div style={{ padding: '0 8px 32px 8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            SA
                        </div>
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px' }}>Platform Admin</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>PG CRM Core</div>
                        </div>
                    </div>

                    <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        color: isActive ? '#fff' : '#94a3b8',
                                        background: isActive ? '#1e293b' : 'transparent',
                                        textDecoration: 'none',
                                        fontWeight: isActive ? 600 : 500,
                                        fontSize: '15px'
                                    }}
                                >
                                    <Icon size={20} style={{ color: isActive ? '#3b82f6' : 'currentColor' }} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div style={{ paddingTop: '24px', borderTop: '1px solid #1e293b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                                {currentUser?.name?.charAt(0) || 'S'}
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{currentUser?.name}</div>
                                <div style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{currentUser?.email}</div>
                            </div>
                            <button
                                onClick={logout}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                    {children}
                </div>
            </div>
        </SuperAdminProtectedRoute>
    );
}
