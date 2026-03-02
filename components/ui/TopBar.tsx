'use client';

import { useEffect, useState } from 'react';
import { CircleDot, LogIn, LogOut, Loader2, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import api from '@/lib/apiClient';
import { useToast } from '@/context/ToastContext';

export default function TopBar() {
    const { currentUser } = useAuth();
    const { toggleSidebar } = useSidebar();
    const toast = useToast();

    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (!currentUser) return;
        api.get('/attendance/today').then(res => {
            const myRecord = res.data.data.find((r: any) =>
                (r.employee._id || r.employee) === currentUser.id
            );
            if (myRecord && myRecord.activeLogins?.length > 0) {
                const lastLogin = myRecord.activeLogins[myRecord.activeLogins.length - 1];
                if (!lastLogin.out) {
                    setIsCheckedIn(true);
                }
            }
        }).catch(err => console.error("Failed to fetch attendance", err))
            .finally(() => setLoading(false));
    }, [currentUser]);

    const handleToggleAttendance = async () => {
        setLoading(true);
        try {
            if (isCheckedIn) {
                await api.post('/attendance/check-out');
                setIsCheckedIn(false);
                toast.success("Checked out successfully. You are now offline.");
            } else {
                await api.post('/attendance/check-in');
                setIsCheckedIn(true);
                toast.success("Checked in successfully. Your time is being logged.");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Attendance update failed");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div style={{
            background: '#fff',
            borderBottom: '1px solid #e8eef4',
            padding: isMobile ? '10px 16px' : '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: isMobile ? 8 : 16,
            position: 'sticky',
            top: 0,
            zIndex: 10,
        }}>
            {/* Hamburger (Mobile Only) */}
            {isMobile && (
                <button
                    onClick={toggleSidebar}
                    style={{
                        background: 'none', border: 'none', padding: 8, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#64748b', marginRight: 'auto'
                    }}>
                    <Menu size={22} />
                </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16, marginLeft: isMobile ? 0 : 'auto' }}>
                {/* Available status */}
                <button
                    onClick={handleToggleAttendance}
                    disabled={loading}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: isCheckedIn ? '#f0fdf4' : '#f1f5f9',
                        border: `1px solid ${isCheckedIn ? '#bbf7d0' : '#cbd5e1'}`,
                        borderRadius: 99, padding: '6px 16px', fontSize: 13, fontWeight: 700,
                        color: isCheckedIn ? '#16a34a' : '#64748b', cursor: loading ? 'wait' : 'pointer',
                        transition: 'all 0.2s', outline: 'none'
                    }}>
                    {loading ? <Loader2 size={14} className="animate-spin" /> :
                        isCheckedIn ? <CircleDot size={14} color="#16a34a" /> :
                            <CircleDot size={14} color="#94a3b8" />}
                    {isCheckedIn ? 'Checked In' : 'Check In'}
                </button>

                {/* User */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0d1b2e' }}>
                        {currentUser?.name || 'Loading...'}
                    </span>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#2563eb,#3b82f6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0,
                        boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                    }}>
                        {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                </div>
            </div>
        </div>
    );
}
