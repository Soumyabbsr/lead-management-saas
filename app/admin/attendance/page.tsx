'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/apiClient';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { Clock, User, Calendar, Search, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function AdminAttendancePage() {
    const employees = useEmployeeStore(s => s.employees);
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
    const toast = useToast();

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/attendance?date=${filterDate}`);
            if (res.data.success) {
                setAttendanceData(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch attendance", error);
            toast.error("Failed to load attendance data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [filterDate]);

    const filteredEmployees = employees.filter(emp =>
        emp.role !== 'admin' &&
        emp.name.toLowerCase().includes(search.toLowerCase())
    );

    const getStatus = (empId: string) => {
        const record = attendanceData.find(r => (r.employee._id || r.employee) === empId);
        if (!record) return { label: 'Not Started', color: '#64748b', bg: '#f1f5f9', icon: <XCircle size={14} /> };

        const lastLogin = record.activeLogins?.[record.activeLogins.length - 1];
        if (lastLogin && !lastLogin.out) {
            return { label: 'Online', color: '#16a34a', bg: '#f0fdf4', icon: <CheckCircle2 size={14} /> };
        }
        return { label: 'Offline', color: '#ef4444', bg: '#fef2f2', icon: <Clock size={14} /> };
    };

    const formatDuration = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    };

    return (
        <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, background: '#f8fafc' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0d1b2e' }}>Employee Attendance</h1>
                    <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>Monitor real-time login status and working hours</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                        <Calendar size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            style={{ padding: '8px 12px 8px 36px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', color: '#0d1b2e' }}
                        />
                    </div>
                    <button
                        onClick={fetchAttendance}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#475569' }}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'flex', gap: 16 }}>
                {[
                    { label: 'Total Employees', value: filteredEmployees.length, icon: <User color="#2563eb" /> },
                    {
                        label: 'Currently Live', value: attendanceData.filter(r => {
                            const last = r.activeLogins?.[r.activeLogins.length - 1];
                            return last && !last.out;
                        }).length, icon: <CheckCircle2 color="#16a34a" />
                    },
                ].map((s, i) => (
                    <div key={i} style={{ flex: 1, background: '#fff', padding: '16px 20px', borderRadius: 12, border: '1px solid #e8eef4', display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{s.label}</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: '#0d1b2e' }}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8eef4', padding: '12px 16px' }}>
                <div style={{ position: 'relative', maxWidth: 400 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        placeholder="Search employee name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' }}
                    />
                </div>
            </div>

            {/* Table */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef4', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8eef4' }}>
                            {['Employee', 'Status', 'First Check-in', 'Last Check-out', 'Total Time Today'].map(h => (
                                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map(emp => {
                            const record = attendanceData.find(r => (r.employee._id || r.employee) === emp.id);
                            const status = getStatus(emp.id);
                            return (
                                <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ fontWeight: 700, color: '#0d1b2e', fontSize: 14 }}>{emp.name}</div>
                                        <div style={{ fontSize: 12, color: '#64748b' }}>{emp.role}</div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: status.bg, color: status.color, fontSize: 12, fontWeight: 700 }}>
                                            {status.icon} {status.label}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px', color: '#475569', fontSize: 14, fontWeight: 500 }}>
                                        {record?.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                    </td>
                                    <td style={{ padding: '16px 20px', color: '#475569', fontSize: 14, fontWeight: 500 }}>
                                        {record?.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, maxWidth: 100 }}>
                                                <div style={{
                                                    height: '100%',
                                                    background: '#2563eb',
                                                    borderRadius: 3,
                                                    width: `${Math.min((record?.totalDurationMinutes || 0) / 480 * 100, 100)}%`
                                                }} />
                                            </div>
                                            <span style={{ fontSize: 14, fontWeight: 700, color: '#0d1b2e' }}>
                                                {formatDuration(record?.totalDurationMinutes || 0)}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredEmployees.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                        No employees found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
}
