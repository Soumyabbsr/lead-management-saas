'use client';

import { useState, useMemo } from 'react';
import { useLeadStore } from '@/store/useLeadStore';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { Lead } from '@/types/lead';
import TopBar from '@/components/ui/TopBar';
import AddLeadModal from '@/components/leads/AddLeadModal';
import PostVisitModal from '@/components/leads/PostVisitModal';
import BookingModal from '@/components/leads/BookingModal';
import KpiGrid from '@/components/dashboard/KpiGrid';
import PipelineSnapshot from '@/components/dashboard/PipelineSnapshot';
import UrgentFollowupTable from '@/components/dashboard/UrgentFollowupTable';
import TodayVisitsSidebar from '@/components/dashboard/TodayVisits';
import ConversionFunnel from '@/components/dashboard/ConversionFunnel';
import { Plus, UserCircle2, Timer } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TODAY_STR = new Date().toISOString().slice(0, 10);

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
}

export default function DashboardPage() {
    const router = useRouter();
    const toast = useToast();
    const { currentUser } = useAuth();
    const leads = useLeadStore(s => s.leads);
    const moveStage = useLeadStore(s => s.moveStage);
    const markVisitDone = useLeadStore(s => s.markVisitDone);
    const setBookingDetails = useLeadStore(s => s.setBookingDetails);

    const [showAddModal, setShowAddModal] = useState(false);
    const [postVisitLead, setPostVisitLead] = useState<Lead | null>(null);
    const [bookingLead, setBookingLead] = useState<Lead | null>(null);

    const stats = useMemo(() => {
        const newLeads = leads.filter(l => l.stage === 'New').length;
        const followUps = leads.filter(l => l.followUpDue && l.followUpDue.slice(0, 10) === TODAY_STR).length;
        const todayVisits = leads.filter(l => l.stage === 'Visit' && l.visitDate && l.visitDate.slice(0, 10) === TODAY_STR).length;
        return { newLeads, followUps, todayVisits };
    }, [leads]);

    return (
        <>
            <TopBar />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f1f5f9', minHeight: 0 }}>

                {/* Greeting bar */}
                <div style={{ background: '#fff', borderBottom: '1px solid #e8eef4', padding: '14px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ flex: '1 1 300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                            <UserCircle2 size={20} color="#f97316" />
                            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0d1b2e' }}>{getGreeting()}, {currentUser?.name?.split(' ')[0] || 'there'}</h2>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16, fontSize: 12.5, color: '#64748b' }}>
                            <span>🟢 <strong style={{ color: '#0d1b2e' }}>{stats.newLeads}</strong> new leads.</span>
                            <span>⏰ <strong style={{ color: '#0d1b2e' }}>{stats.followUps}</strong> Follow up Due.</span>
                            <span>📅 <strong style={{ color: '#0d1b2e' }}>{stats.todayVisits}</strong> Today Visit.</span>
                        </div>
                    </div>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#ef4444,#f97316)', border: 'none', borderRadius: 12, padding: '10px 18px 10px 14px', cursor: 'pointer', color: '#fff' }}>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1 }}>Check In</div>
                            <div style={{ fontSize: 10.5, opacity: 0.85, marginTop: 2 }}>21:11 PM</div>
                        </div>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Timer size={14} color="#fff" />
                        </div>
                    </button>
                </div>

                {/* Main scrollable content */}
                <main className="responsive-padding" style={{ flex: 1, padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>

                    {/* KPI 6-card grid */}
                    <KpiGrid />

                    {/* Pipeline Snapshot */}
                    <PipelineSnapshot />

                    {/* 2-column layout */}
                    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
                        <UrgentFollowupTable />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <TodayVisitsSidebar onMarkDone={(lead) => setPostVisitLead(lead)} />
                            <ConversionFunnel />
                        </div>
                    </div>
                </main>
            </div>

            {/* FAB — Add Lead */}
            <button
                onClick={() => setShowAddModal(true)}
                title="Add New Lead"
                style={{
                    position: 'fixed', bottom: 28, right: 28, zIndex: 100,
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#2563eb,#3b82f6)',
                    color: '#fff', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 6px 20px rgba(37,99,235,0.45)',
                    transition: 'transform 0.18s, box-shadow 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.45)'; }}
            >
                <Plus size={22} />
            </button>

            {/* Modals */}
            <AddLeadModal open={showAddModal} onClose={() => setShowAddModal(false)} />

            {postVisitLead && (
                <PostVisitModal
                    open={!!postVisitLead}
                    onClose={() => setPostVisitLead(null)}
                    lead={postVisitLead}
                    onAction={(action) => {
                        if (action === 'negotiation') { moveStage(postVisitLead.id, 'Negotiation'); toast.success('Moved to Negotiation'); }
                        else if (action === 'booked') { setBookingLead(postVisitLead); }
                        else if (action === 'lost') { moveStage(postVisitLead.id, 'Lost'); toast.success('Marked as Lost'); }
                        else if (action === 'reschedule') { toast.info('Use the Visit Scheduler on Lead Detail page'); }
                        if (action !== 'booked') setPostVisitLead(null);
                    }}
                />
            )}

            {bookingLead && (
                <BookingModal
                    open={!!bookingLead}
                    onClose={() => { setBookingLead(null); setPostVisitLead(null); }}
                    lead={bookingLead}
                    onConfirm={(details) => {
                        setBookingDetails(bookingLead.id, details);
                        setBookingLead(null);
                        setPostVisitLead(null);
                        toast.success('Booking confirmed! 🎉');
                        router.push('/bookings');
                    }}
                />
            )}
        </>
    );
}
