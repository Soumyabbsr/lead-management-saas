'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/apiClient';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { Clock, User, Calendar, Search, RefreshCw, CheckCircle2, XCircle, MapPin, AlertTriangle, Camera, ChevronDown, Image } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AdminAttendancePage() {
    const employees = useEmployeeStore(s => s.employees);
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
    const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [filterEmployee, setFilterEmployee] = useState('');
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
    const toast = useToast();

    const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            let url = '/attendance/tenant-report?';
            if (viewMode === 'daily') {
                url += `date=${filterDate}`;
            } else {
                url += `month=${filterMonth}&year=${filterYear}`;
            }
            if (filterEmployee) url += `&employeeId=${filterEmployee}`;

            const res = await api.get(url);
            if (res.data.success) {
                setAttendanceData(res.data.data);
                setSummary(res.data.summary || {});
            }
        } catch {
            toast.error('Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [filterDate, filterMonth, filterYear, filterEmployee, viewMode]);

    const formatDuration = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    };

    const formatTime = (dateStr: string | null) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Present': return { color: '#16a34a', bg: '#f0fdf4', icon: <CheckCircle2 size={13} /> };
            case 'Late': return { color: '#f59e0b', bg: '#fffbeb', icon: <AlertTriangle size={13} /> };
            case 'Absent': return { color: '#ef4444', bg: '#fef2f2', icon: <XCircle size={13} /> };
            default: return { color: '#64748b', bg: '#f1f5f9', icon: <Clock size={13} /> };
        }
    };

    // For monthly view — build per-employee summary
    const monthlySummary = (() => {
        if (viewMode !== 'monthly') return [];
        const empMap: Record<string, { name: string; role: string; present: number; late: number; absent: number; totalMinutes: number }> = {};

        attendanceData.forEach(r => {
            const empId = r.employee?._id || r.employee;
            const empName = r.employee?.name || 'Unknown';
            const empRole = r.employee?.role || '';
            if (!empMap[empId]) {
                empMap[empId] = { name: empName, role: empRole, present: 0, late: 0, absent: 0, totalMinutes: 0 };
            }
            if (r.status === 'Present') empMap[empId].present++;
            else if (r.status === 'Late') empMap[empId].late++;
            else empMap[empId].absent++;
            empMap[empId].totalMinutes += r.totalDurationMinutes || 0;
        });

        return Object.entries(empMap)
            .filter(([, v]) => !search || v.name.toLowerCase().includes(search.toLowerCase()))
            .map(([id, v]) => ({ id, ...v }));
    })();

    const filteredRecords = viewMode === 'daily'
        ? attendanceData.filter(r => {
            const name = r.employee?.name || '';
            return name.toLowerCase().includes(search.toLowerCase());
        })
        : [];

    return (
        <>
            <div className="att-page responsive-padding" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, background: '#f8fafc' }}>
                {/* Header */}
                <div className="att-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0d1b2e' }}>Employee Attendance</h1>
                        <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>Monitor attendance with location & selfie verification</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* View toggle */}
                        <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <button onClick={() => setViewMode('daily')} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', background: viewMode === 'daily' ? '#0d1b2e' : '#fff', color: viewMode === 'daily' ? '#fff' : '#475569' }}>Daily</button>
                            <button onClick={() => setViewMode('monthly')} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', background: viewMode === 'monthly' ? '#0d1b2e' : '#fff', color: viewMode === 'monthly' ? '#fff' : '#475569' }}>Monthly</button>
                        </div>

                        {viewMode === 'daily' ? (
                            <div style={{ position: 'relative' }}>
                                <Calendar size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ padding: '8px 12px 8px 36px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', color: '#0d1b2e' }} />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0d1b2e' }}>
                                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                </select>
                                <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0d1b2e' }}>
                                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        )}

                        {/* Employee filter */}
                        <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0d1b2e' }}>
                            <option value="">All Employees</option>
                            {employees.filter(e => e.role !== 'admin').map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>

                        <button onClick={fetchAttendance} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#475569' }}>
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="att-stats" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {[
                        { label: 'Total Records', value: summary.totalRecords || 0, icon: <User color="#2563eb" />, bg: '#eff6ff' },
                        { label: 'Present', value: summary.presentCount || 0, icon: <CheckCircle2 color="#16a34a" />, bg: '#f0fdf4' },
                        { label: 'Late', value: summary.lateCount || 0, icon: <AlertTriangle color="#f59e0b" />, bg: '#fffbeb' },
                        { label: 'Absent', value: summary.absentCount || 0, icon: <XCircle color="#ef4444" />, bg: '#fef2f2' },
                    ].map((s, i) => (
                        <div key={i} style={{ flex: '1 1 140px', background: '#fff', padding: '16px 20px', borderRadius: 12, border: '1px solid #e8eef4', display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
                            <div>
                                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{s.label}</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: '#0d1b2e' }}>{s.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Bar */}
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8eef4', padding: '12px 16px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input placeholder="Search employee name..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                </div>

                {/* ── Daily Table ───────────────────────────────── */}
                {viewMode === 'daily' && (
                    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef4', overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8eef4' }}>
                                        {['Employee', 'Status', 'Check-in', 'Check-out', 'Location', 'Selfie', 'Total Time'].map(h => (
                                            <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((record: any) => {
                                        const stat = getStatusBadge(record.status);
                                        return (
                                            <tr key={record._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <div style={{ fontWeight: 700, color: '#0d1b2e', fontSize: 14 }}>{record.employee?.name || '—'}</div>
                                                    <div style={{ fontSize: 12, color: '#64748b' }}>{record.employee?.role}</div>
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: stat.bg, color: stat.color, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                                                        {stat.icon} {record.status}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>
                                                    {formatTime(record.checkIn)}
                                                </td>
                                                <td style={{ padding: '14px 16px', color: '#475569', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>
                                                    {formatTime(record.checkOut)}
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    {record.locationVerified ? (
                                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: '#f0fdf4', color: '#16a34a', fontSize: 11, fontWeight: 700 }}>
                                                            <MapPin size={12} /> Verified
                                                        </div>
                                                    ) : record.latitude ? (
                                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: '#fef2f2', color: '#ef4444', fontSize: 11, fontWeight: 700 }}>
                                                            <MapPin size={12} /> Outside
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    {record.selfieUrl ? (
                                                        <button
                                                            onClick={() => setSelfiePreview(`${apiBase}${record.selfieUrl}`)}
                                                            style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', border: '2px solid #e2e8f0', cursor: 'pointer', padding: 0, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >
                                                            <Image size={16} color="#64748b" />
                                                        </button>
                                                    ) : (
                                                        <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 3, maxWidth: 80 }}>
                                                            <div style={{ height: '100%', background: '#2563eb', borderRadius: 3, width: `${Math.min((record.totalDurationMinutes || 0) / 480 * 100, 100)}%` }} />
                                                        </div>
                                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0d1b2e', whiteSpace: 'nowrap' }}>
                                                            {formatDuration(record.totalDurationMinutes || 0)}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {filteredRecords.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                {loading ? 'Loading...' : 'No attendance records found for this date.'}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Monthly Summary Table ────────────────────── */}
                {viewMode === 'monthly' && (
                    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef4', overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8eef4' }}>
                                        {['Employee', 'Present Days', 'Late Days', 'Absent Days', 'Total Hours'].map(h => (
                                            <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlySummary.map(emp => (
                                        <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ fontWeight: 700, color: '#0d1b2e', fontSize: 14 }}>{emp.name}</div>
                                                <div style={{ fontSize: 12, color: '#64748b' }}>{emp.role}</div>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, background: '#f0fdf4', color: '#16a34a', fontSize: 13, fontWeight: 700 }}>
                                                    <CheckCircle2 size={14} /> {emp.present}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, background: '#fffbeb', color: '#f59e0b', fontSize: 13, fontWeight: 700 }}>
                                                    <AlertTriangle size={14} /> {emp.late}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, background: '#fef2f2', color: '#ef4444', fontSize: 13, fontWeight: 700 }}>
                                                    <XCircle size={14} /> {emp.absent}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: 14, color: '#0d1b2e' }}>
                                                {formatDuration(emp.totalMinutes)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {monthlySummary.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                {loading ? 'Loading...' : `No attendance records found for ${MONTHS[filterMonth - 1]} ${filterYear}.`}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Selfie Preview Modal */}
            {selfiePreview && (
                <div onClick={() => setSelfiePreview(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 12, maxWidth: 400, width: '90%' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: '#0d1b2e' }}><Camera size={16} /> Check-in Selfie</div>
                            <button onClick={() => setSelfiePreview(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 18 }}>✕</button>
                        </div>
                        <img src={selfiePreview} alt="Check-in selfie" style={{ width: '100%', borderRadius: 12 }} />
                    </div>
                </div>
            )}
        </>
    );
}
