'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/ui/TopBar';
import { useLeadStore } from '@/store/useLeadStore';
import { useMyLeads } from '@/hooks/useMyLeads';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import PostVisitModal from '@/components/leads/PostVisitModal';
import BookingModal from '@/components/leads/BookingModal';
import { Lead, LeadStage } from '@/types/lead';
import { BookingDetails } from '@/types/activity';
import { Phone, CheckCircle2, CalendarCheck, Eye, Home } from 'lucide-react';

const TODAY_STR = new Date().toISOString().slice(0, 10);

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true,
    });
}

function isPast(iso: string) {
    return new Date(iso).getTime() < Date.now();
}

type TabFilter = 'Visits' | 'Bookings';

export default function VisitsPage() {
    const router = useRouter();
    const toast = useToast();
    const { currentUser } = useAuth();
    const myLeads = useMyLeads();
    const markVisitDone = useLeadStore(s => s.markVisitDone);
    const moveStage = useLeadStore(s => s.moveStage);
    const setBookingDetails = useLeadStore(s => s.setBookingDetails);

    const [tab, setTab] = useState<TabFilter>('Visits');
    const [visitFilter, setVisitFilter] = useState<'All' | 'Today' | 'Upcoming' | 'Done'>('All');
    const [postVisitLead, setPostVisitLead] = useState<Lead | null>(null);
    const [bookingLead, setBookingLead] = useState<Lead | null>(null);

    // Visit-stage leads (for this employee)
    const visitLeads = useMemo(() =>
        myLeads.filter(l => l.stage === 'Visit' && l.visitDate),
        [myLeads]
    );

    // Booked-stage leads (for this employee)
    const bookedLeads = useMemo(() =>
        myLeads.filter(l => l.stage === 'Booked'),
        [myLeads]
    );

    const filteredVisits = useMemo(() => {
        if (visitFilter === 'All') return visitLeads;
        const today = TODAY_STR;
        if (visitFilter === 'Today') return visitLeads.filter(l => l.visitDate!.slice(0, 10) === today);
        if (visitFilter === 'Done') return visitLeads.filter(l => l.visitStatus === 'Done');
        if (visitFilter === 'Upcoming') return visitLeads.filter(l => l.visitDate!.slice(0, 10) > today && l.visitStatus !== 'Done');
        return visitLeads;
    }, [visitLeads, visitFilter]);

    // Summary counts
    const todayCount = visitLeads.filter(l => l.visitDate?.slice(0, 10) === TODAY_STR).length;
    const upcomingCount = visitLeads.filter(l => l.visitDate!.slice(0, 10) > TODAY_STR).length;
    const doneCount = visitLeads.filter(l => l.visitStatus === 'Done').length;

    function handleMarkDone(lead: Lead) {
        setPostVisitLead(lead);
    }

    return (
        <>
            <TopBar />
            <main className="responsive-padding" style={{ flex: 1, padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 16, background: '#f1f5f9' }}>

                {/* Page header */}
                <div>
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0d1b2e' }}>Visit Leads</h1>
                    <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>
                        {currentUser.name} — {visitLeads.length} visits · {bookedLeads.length} booked
                    </p>
                </div>

                {/* Summary stat cards */}
                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {[
                        { label: 'Total Visits', count: visitLeads.length, color: '#2563eb', bg: '#eff6ff' },
                        { label: 'Today', count: todayCount, color: '#d97706', bg: '#fffbeb' },
                        { label: 'Upcoming', count: upcomingCount, color: '#7c3aed', bg: '#f5f3ff' },
                        { label: 'My Bookings', count: bookedLeads.length, color: '#059669', bg: '#ecfdf5' },
                    ].map(s => (
                        <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8eef4', padding: '14px 16px', textAlign: 'center' }}>
                            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.count}</div>
                            <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tab switcher */}
                <div style={{ display: 'flex', gap: 0, background: '#fff', borderRadius: 10, border: '1px solid #e8eef4', padding: 4, alignSelf: 'flex-start' }}>
                    {(['Visits', 'Bookings'] as TabFilter[]).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            style={{
                                padding: '7px 20px', borderRadius: 7, fontSize: 13, fontWeight: 700,
                                cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                                background: tab === t ? '#2563eb' : 'transparent',
                                color: tab === t ? '#fff' : '#64748b',
                            }}>
                            {t === 'Visits' ? `🗓 Visits (${visitLeads.length})` : `✅ Booked (${bookedLeads.length})`}
                        </button>
                    ))}
                </div>

                {/* ═══ VISITS TAB ═══ */}
                {tab === 'Visits' && (
                    <>
                        {/* Visit sub-filters */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {(['All', 'Today', 'Upcoming', 'Done'] as const).map(f => (
                                <button key={f} onClick={() => setVisitFilter(f)}
                                    style={{
                                        padding: '6px 15px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                                        border: `1.5px solid ${visitFilter === f ? '#2563eb' : '#e2e8f0'}`,
                                        background: visitFilter === f ? '#eff6ff' : '#fff',
                                        color: visitFilter === f ? '#2563eb' : '#64748b',
                                        cursor: 'pointer',
                                    }}>
                                    {f}
                                </button>
                            ))}
                        </div>

                        {filteredVisits.length === 0 ? (
                            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef4', padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                                <CalendarCheck size={36} style={{ margin: '0 auto 12px', opacity: 0.35, display: 'block' }} />
                                <p style={{ margin: 0, fontSize: 14 }}>No visits in this filter</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                                {filteredVisits.map(lead => {
                                    const past = lead.visitDate ? isPast(lead.visitDate) && lead.visitStatus !== 'Done' : false;
                                    const done = lead.visitStatus === 'Done';
                                    const isToday = lead.visitDate?.slice(0, 10) === TODAY_STR;

                                    return (
                                        <div key={lead.id} style={{
                                            background: '#fff', borderRadius: 14,
                                            border: `1.5px solid ${past ? '#fca5a5' : done ? '#a7f3d0' : '#e8eef4'}`,
                                            padding: 18, opacity: done ? 0.85 : 1,
                                            cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s',
                                        }}
                                            onClick={() => router.push(`/leads/${lead.id}`)}
                                            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                                        >
                                            {/* Card header */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 15, color: '#0d1b2e' }}>{lead.name}</div>
                                                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, fontFamily: 'monospace' }}>+91 {lead.phone}</div>
                                                </div>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                                                    background: done ? '#ecfdf5' : past ? '#fef2f2' : isToday ? '#fffbeb' : '#eff6ff',
                                                    color: done ? '#059669' : past ? '#ef4444' : isToday ? '#d97706' : '#2563eb',
                                                }}>
                                                    {done ? '✓ Done' : past ? 'Overdue' : isToday ? 'Today' : 'Upcoming'}
                                                </span>
                                            </div>

                                            {/* Visit details */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, marginBottom: 14 }}>
                                                {[
                                                    { label: 'Visit Time', value: lead.visitDate ? formatDateTime(lead.visitDate) : '—', urgent: past },
                                                    { label: 'Area', value: lead.preferredArea || '—' },
                                                    { label: 'Budget', value: lead.budget ? `₹${lead.budget.toLocaleString('en-IN')}/mo` : '—' },
                                                    { label: 'Field Agent', value: lead.visitSchedule?.fieldAgent ?? lead.assignedTo },
                                                ].map(({ label, value, urgent }) => (
                                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                                        <span style={{ color: '#94a3b8', fontWeight: 500 }}>{label}</span>
                                                        <span style={{ fontWeight: 600, color: urgent ? '#ef4444' : '#0d1b2e', textAlign: 'right' }}>{value}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Actions */}
                                            {!done ? (
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <a href={`tel:${lead.phone}`}
                                                        onClick={e => e.stopPropagation()}
                                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '7px 0', borderRadius: 8, fontSize: 12.5, fontWeight: 600, background: '#ecfdf5', color: '#059669', textDecoration: 'none', border: '1px solid #a7f3d0' }}>
                                                        <Phone size={13} /> Call
                                                    </a>
                                                    <button onClick={e => { e.stopPropagation(); handleMarkDone(lead); }}
                                                        style={{ flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '7px 0', borderRadius: 8, fontSize: 12.5, fontWeight: 600, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', cursor: 'pointer' }}>
                                                        <CheckCircle2 size={13} /> Mark Visit Done
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ textAlign: 'center', fontSize: 12, color: '#059669', fontWeight: 600 }}>✓ Visit completed</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* ═══ BOOKINGS TAB ═══ */}
                {tab === 'Bookings' && (
                    <>
                        {bookedLeads.length === 0 ? (
                            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef4', padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                                <Home size={36} style={{ margin: '0 auto 12px', opacity: 0.35, display: 'block' }} />
                                <p style={{ margin: 0, fontSize: 14 }}>No bookings yet — keep pushing! 💪</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                                {bookedLeads.map(lead => (
                                    <div key={lead.id} style={{
                                        background: '#fff', borderRadius: 14,
                                        border: '1.5px solid #a7f3d0',
                                        padding: 18,
                                        cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s',
                                    }}
                                        onClick={() => router.push(`/leads/${lead.id}`)}
                                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                                    >
                                        {/* Header */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: 15, color: '#0d1b2e' }}>{lead.name}</div>
                                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, fontFamily: 'monospace' }}>+91 {lead.phone}</div>
                                            </div>
                                            <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#ecfdf5', color: '#059669' }}>
                                                🏠 Booked
                                            </span>
                                        </div>

                                        {/* Booking details */}
                                        {lead.bookingDetails ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, marginBottom: 14 }}>
                                                {[
                                                    { label: 'Property', value: lead.bookingDetails.propertyName },
                                                    { label: 'Bed', value: lead.bookingDetails.bedAssigned },
                                                    { label: 'Advance Paid', value: `₹${lead.bookingDetails.advancePaid.toLocaleString('en-IN')}` },
                                                    { label: 'Booking Date', value: new Date(lead.bookingDetails.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                                                    { label: 'Monthly Budget', value: lead.budget ? `₹${lead.budget.toLocaleString('en-IN')}/mo` : '—' },
                                                ].map(({ label, value }) => (
                                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                                        <span style={{ color: '#94a3b8', fontWeight: 500 }}>{label}</span>
                                                        <span style={{ fontWeight: 600, color: label === 'Advance Paid' ? '#059669' : '#0d1b2e', textAlign: 'right' }}>{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 14px' }}>No booking details recorded</p>
                                        )}

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <a href={`tel:${lead.phone}`}
                                                onClick={e => e.stopPropagation()}
                                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '7px 0', borderRadius: 8, fontSize: 12.5, fontWeight: 600, background: '#ecfdf5', color: '#059669', textDecoration: 'none', border: '1px solid #a7f3d0' }}>
                                                <Phone size={13} /> Call
                                            </a>
                                            <button onClick={e => { e.stopPropagation(); router.push(`/leads/${lead.id}`); }}
                                                style={{ flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '7px 0', borderRadius: 8, fontSize: 12.5, fontWeight: 600, background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0', cursor: 'pointer' }}>
                                                <Eye size={13} /> View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* PostVisitModal */}
            {postVisitLead && (
                <PostVisitModal
                    open={!!postVisitLead}
                    onClose={() => setPostVisitLead(null)}
                    lead={postVisitLead}
                    onAction={(action: string) => {
                        if (action === 'negotiation') { moveStage(postVisitLead.id, 'Negotiation'); toast.success('Moved to Negotiation'); setPostVisitLead(null); }
                        else if (action === 'booked') { setBookingLead(postVisitLead); setPostVisitLead(null); }
                        else if (action === 'lost') { moveStage(postVisitLead.id, 'Lost'); toast.success('Marked as Lost'); setPostVisitLead(null); }
                        else if (action === 'reschedule') { router.push(`/leads/${postVisitLead.id}`); setPostVisitLead(null); }
                    }}
                />
            )}

            {/* BookingModal */}
            {bookingLead && (
                <BookingModal
                    open={!!bookingLead}
                    onClose={() => setBookingLead(null)}
                    lead={bookingLead}
                    onConfirm={(details: BookingDetails) => {
                        setBookingDetails(bookingLead.id, details);
                        setBookingLead(null);
                        toast.success('Booking confirmed! 🎉');
                        setTab('Bookings');
                    }}
                />
            )}
        </>
    );
}
