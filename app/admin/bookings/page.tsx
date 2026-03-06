'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLeadStore } from '@/store/useLeadStore';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useToast } from '@/context/ToastContext';
import { Lead } from '@/types/lead';
import { BookingDetails } from '@/types/activity';
import BookingModal from '@/components/leads/BookingModal';
import { Eye, Phone, MessageCircle, Edit2, XCircle, Search } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import DropdownMenu, { DropdownAction } from '@/components/ui/DropdownMenu';

export default function AdminBookingsPage() {
    const router = useRouter();
    const toast = useToast();

    const leads = useLeadStore(s => s.leads);
    const updateLead = useLeadStore(s => s.updateLead);
    const moveStage = useLeadStore(s => s.moveStage);

    const booked = useMemo(() => leads.filter(l => l.stage === 'Booked'), [leads]);

    const [search, setSearch] = useState('');
    const [agentFilter, setAgentFilter] = useState('All');

    // We can infer team agents from the booked leads
    const agents = useMemo(() => Array.from(new Set(booked.map(l => l.assignedTo))).filter(Boolean), [booked]);

    const filtered = useMemo(() => {
        return booked.filter(l => {
            if (search) {
                const q = search.toLowerCase();
                if (!l.name.toLowerCase().includes(q) && !(l.bookingDetails?.propertyName.toLowerCase().includes(q))) return false;
            }
            if (agentFilter !== 'All' && l.assignedTo !== agentFilter) return false;
            return true;
        }).sort((a, b) => new Date(b.bookingDetails?.bookingDate || 0).getTime() - new Date(a.bookingDetails?.bookingDate || 0).getTime());
    }, [booked, search, agentFilter]);

    const totalRevenue = useMemo(() => filtered.reduce((sum, l) => sum + (l.bookingDetails?.advancePaid || 0), 0), [filtered]);

    // Modals state
    const [editBookingLead, setEditBookingLead] = useState<Lead | null>(null);
    const [cancelBookingLead, setCancelBookingLead] = useState<Lead | null>(null);

    function handleEditSave(details: BookingDetails) {
        if (!editBookingLead) return;
        updateLead(editBookingLead.id, { bookingDetails: details });
        toast.success(`Booking details updated for ${editBookingLead.name}`);
        setEditBookingLead(null);
    }

    function handleCancelBooking(leadId: string) {
        moveStage(leadId, 'Lost'); // Or 'Negotiation' depending on preference. Let's send to Lost for cancellations.
        toast.success('Booking cancelled. Lead moved to Lost.');
        setCancelBookingLead(null);
    }

    return (
        <div className="responsive-padding" style={{ flex: 1, padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 16, background: '#f1f5f9' }}>

            {/* Header */}
            <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0d1b2e' }}>Bookings Directory</h1>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>System-wide confirmed bookings</p>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                    { label: 'Total Confirmed', value: filtered.length, sub: 'Filtered active bookings', color: '#2563eb', bg: '#eff6ff' },
                    { label: 'Total Advance Collected', value: `₹${totalRevenue.toLocaleString('en-IN')}`, sub: 'Sum of advances', color: '#059669', bg: '#ecfdf5' },
                    { label: 'Avg Advance', value: `₹${filtered.length > 0 ? Math.round(totalRevenue / filtered.length).toLocaleString('en-IN') : 0}`, sub: 'Per booking', color: '#f97316', bg: '#fff7ed' },
                ].map(c => (
                    <div key={c.label} style={{ background: '#fff', border: '1px solid #e8eef4', borderRadius: 12, padding: '16px 18px' }}>
                        <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>{c.label}</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: c.color }}>{c.value}</div>
                        <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4 }}>{c.sub}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8eef4', padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 300 }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search lead or property name…"
                        style={{ width: '100%', padding: '7px 10px 7px 30px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)}
                    style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0d1b2e' }}>
                    <option value="All">All Agents</option>
                    {agents.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <span style={{ marginLeft: 'auto', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{filtered.length} matching</span>
            </div>

            {/* Bookings table */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef4', overflow: 'hidden' }}>
                {filtered.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>No bookings match your filters.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8eef4' }}>
                                    {['Lead Name', 'Contact', 'Property', 'Bed', 'Advance', 'Booking Date', 'Assigned To', 'Actions'].map(col => (
                                        <th key={col} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(lead => (
                                    <tr key={lead.id}
                                        onClick={() => router.push(`/admin/leads/${lead.id}`)}
                                        style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.12s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                                        <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                                            <DropdownMenu
                                                actions={[
                                                    { label: 'View Details', icon: <Eye size={14} />, onClick: () => router.push(`/admin/leads/${lead.id}`) },
                                                    { label: 'Edit Booking', icon: <Edit2 size={14} />, onClick: () => setEditBookingLead(lead) },
                                                    { label: 'Cancel Booking', icon: <XCircle size={14} />, danger: true, onClick: () => setCancelBookingLead(lead) }
                                                ]}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {editBookingLead && (
                <BookingModal
                    open={!!editBookingLead}
                    lead={editBookingLead}
                    onClose={() => setEditBookingLead(null)}
                    onConfirm={handleEditSave}
                />
            )}

            <ConfirmModal
                open={!!cancelBookingLead}
                title="Cancel Booking"
                message={`Are you sure you want to cancel the booking for ${cancelBookingLead?.name}? This will move the lead to "Lost" stage. You can re-activate them later if needed.`}
                confirmLabel="Cancel Booking"
                danger
                onConfirm={() => cancelBookingLead && handleCancelBooking(cancelBookingLead.id)}
                onCancel={() => setCancelBookingLead(null)}
            />
        </div>
    );
}
