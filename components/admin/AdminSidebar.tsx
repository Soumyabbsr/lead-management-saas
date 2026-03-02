'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutGrid, Users, UserCog, MapPin, BookOpen, UserCircle,
    BarChart2, Activity, Settings, ArrowLeft, ShieldCheck, Clock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/admin/leads', label: 'All Leads', icon: Users },
    { href: '/admin/employees', label: 'Employees', icon: UserCog },
    { href: '/admin/visits', label: 'Visits', icon: MapPin },
    { href: '/admin/bookings', label: 'Bookings', icon: BookOpen },
    { href: '/admin/performance', label: 'Performance', icon: BarChart2 },
    { href: '/admin/attendance', label: 'Attendance', icon: Clock },
    { href: '/admin/activity', label: 'Activity Log', icon: Activity },
    { href: '/admin/profile', label: 'My Profile', icon: UserCircle },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser && currentUser.role !== 'admin') {
            router.replace('/dashboard');
        }
    }, [currentUser, router]);

    if (!currentUser) return null;

    return (
        <aside style={{
            width: 208, minWidth: 208,
            background: '#0a0f1e',
            display: 'flex', flexDirection: 'column',
            padding: '0 12px 20px',
            position: 'sticky', top: 0, height: '100vh',
            overflowY: 'auto', flexShrink: 0, zIndex: 20,
        }}>
            {/* Brand */}
            <div style={{ padding: '20px 6px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#ef4444,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck size={15} color="#fff" />
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Admin Panel</span>
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                    {currentUser.name} · {currentUser.role}
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
                                padding: '9px 12px', borderRadius: 8, fontSize: 13,
                                fontWeight: active ? 700 : 500,
                                color: active ? '#fff' : '#8fa3bc',
                                background: active ? 'linear-gradient(135deg,#ef4444,#f97316)' : 'transparent',
                                textDecoration: 'none', transition: 'all 0.15s',
                            }}>
                            <Icon size={14} />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Back to employee view */}
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <Link href="/dashboard"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, color: '#64748b', textDecoration: 'none', fontSize: 12.5, fontWeight: 600 }}>
                    <ArrowLeft size={13} /> Employee View
                </Link>
            </div>
        </aside>
    );
}
