'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Lead } from '@/types/lead';
import { BookingDetails } from '@/types/activity';

interface Props {
    open: boolean;
    onClose: () => void;
    lead: Lead;
    onConfirm: (details: BookingDetails) => void;
}

const inputStyle: React.CSSProperties = {
    padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e2e8f0',
    fontSize: 13.5, outline: 'none', background: '#fff', color: '#0d1b2e',
    width: '100%', boxSizing: 'border-box' as const, display: 'block',
};

export default function BookingModal({ open, onClose, lead, onConfirm }: Props) {
    const [form, setForm] = useState({ propertyName: '', bedAssigned: '', advancePaid: '', bookingDate: '' });

    useEffect(() => {
        if (open) {
            if (lead?.bookingDetails) {
                setForm({
                    propertyName: lead.bookingDetails.propertyName,
                    bedAssigned: lead.bookingDetails.bedAssigned,
                    advancePaid: lead.bookingDetails.advancePaid.toString(),
                    bookingDate: lead.bookingDetails.bookingDate,
                });
            } else {
                setForm({ propertyName: '', bedAssigned: '', advancePaid: '', bookingDate: '' });
            }
        }
    }, [open, lead]);

    function handleConfirm() {
        if (!form.propertyName || !form.bedAssigned || !form.bookingDate) return;
        onConfirm({
            propertyName: form.propertyName,
            bedAssigned: form.bedAssigned,
            advancePaid: parseInt(form.advancePaid) || 0,
            bookingDate: form.bookingDate,
        });
        setForm({ propertyName: '', bedAssigned: '', advancePaid: '', bookingDate: '' });
    }

    return (
        <Modal open={open} onClose={onClose} title={lead?.bookingDetails ? `Edit Booking — ${lead.name}` : `Booking — ${lead.name}`} width={480}>
            {!lead?.bookingDetails && (
                <div style={{ marginBottom: 16, padding: 14, borderRadius: 10, background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                    <p style={{ margin: 0, fontSize: 13, color: '#065f46', fontWeight: 600 }}>🎉 Confirm Booking Details</p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#047857' }}>This will move {lead.name} to Booked status and add them to the Bookings page.</p>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5 }}>Property Name *</label>
                    <input style={inputStyle} value={form.propertyName} onChange={e => setForm(p => ({ ...p, propertyName: e.target.value }))} placeholder="e.g. Skyline PG" />
                </div>
                <div>
                    <label style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5 }}>Bed Assigned *</label>
                    <input style={inputStyle} value={form.bedAssigned} onChange={e => setForm(p => ({ ...p, bedAssigned: e.target.value }))} placeholder="e.g. Room 3 - Bed A" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                        <label style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5 }}>Advance Paid (₹)</label>
                        <input type="number" style={inputStyle} value={form.advancePaid} onChange={e => setForm(p => ({ ...p, advancePaid: e.target.value }))} placeholder="e.g. 5000" />
                    </div>
                    <div>
                        <label style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 5 }}>Booking Date *</label>
                        <input type="date" style={inputStyle} value={form.bookingDate} onChange={e => setForm(p => ({ ...p, bookingDate: e.target.value }))} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 18, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 9, background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#475569' }}>
                    Cancel
                </button>
                <button onClick={handleConfirm} disabled={!form.propertyName || !form.bedAssigned || !form.bookingDate}
                    style={{ flex: 2, padding: '10px', borderRadius: 9, background: '#059669', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: '#fff', opacity: (!form.propertyName || !form.bedAssigned || !form.bookingDate) ? 0.6 : 1 }}>
                    {lead?.bookingDetails ? 'Save Changes' : '✓ Confirm Booking'}
                </button>
            </div>
        </Modal>
    );
}
