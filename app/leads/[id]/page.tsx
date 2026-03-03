'use client';

import { useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useLeadStore } from '@/store/useLeadStore';
import { useToast } from '@/context/ToastContext';
import { LeadStage } from '@/types/lead';
import { FollowUp, VisitSchedule, BookingDetails } from '@/types/activity';
import TopBar from '@/components/ui/TopBar';
import PostVisitModal from '@/components/leads/PostVisitModal';
import BookingModal from '@/components/leads/BookingModal';
import { ArrowLeft, Phone, MessageCircle, Clock, MapPin, CalendarCheck, FileText, User, ChevronRight, UserCheck } from 'lucide-react';
import { useEmployeeStore } from '@/store/useEmployeeStore';

const ALL_STAGES: LeadStage[] = ['New', 'Contacted', 'Visit', 'Negotiation', 'Booked', 'Lost'];
const stageColor: Record<LeadStage, string> = {
    New: '#2563eb', Contacted: '#7c3aed', Visit: '#d97706',
    Negotiation: '#ea580c', Booked: '#059669', Lost: '#ef4444',
};
const timelineColors: Record<string, string> = {
    call: '#16a34a', note: '#2563eb', stage_change: '#7c3aed',
    follow_up: '#d97706', visit: '#ea580c', booking: '#059669', created: '#64748b',
};

const inStyle: React.CSSProperties = {
    padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e2e8f0',
    fontSize: 13.5, outline: 'none', background: '#fff',
    color: '#0d1b2e', width: '100%', boxSizing: 'border-box' as const, display: 'block',
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef4', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9' }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0d1b2e' }}>{title}</h3>
            </div>
            <div style={{ padding: '16px 18px' }}>{children}</div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0d1b2e' }}>{value}</div>
        </div>
    );
}

function typeIcon(type: string) {
    const map: Record<string, React.ReactNode> = {
        call: <Phone size={11} />, note: <FileText size={11} />,
        stage_change: <ChevronRight size={11} />, follow_up: <Clock size={11} />,
        visit: <MapPin size={11} />, booking: <CalendarCheck size={11} />, created: <User size={11} />,
    };
    return map[type] ?? <FileText size={11} />;
}

export default function LeadDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const pathname = usePathname();
    const toast = useToast();

    // Check if we are viewing this from the Admin panel
    const basePath = pathname?.startsWith('/admin') ? '/admin/leads' : '/leads';

    const lead = useLeadStore(s => s.leads.find(l => l.id === id));
    const moveStage = useLeadStore(s => s.moveStage);
    const updateLead = useLeadStore(s => s.updateLead);
    const addNote = useLeadStore(s => s.addNote);
    const scheduleFollowUp = useLeadStore(s => s.scheduleFollowUp);
    const scheduleVisit = useLeadStore(s => s.scheduleVisit);
    const setBookingDetails = useLeadStore(s => s.setBookingDetails);
    const markVisitDone = useLeadStore(s => s.markVisitDone);

    const employees = useEmployeeStore(s => s.employees);
    const salesAgents = employees.filter(e => e.role === 'sales').map(e => e.name);

    const [noteText, setNoteText] = useState('');
    const [followUpForm, setFollowUpForm] = useState({ date: '', time: '', note: '' });
    const [visitForm, setVisitForm] = useState({ date: '', time: '', fieldAgent: salesAgents[0] || 'Unassigned', propertyName: '', roomNo: '' });
    const [reassignTo, setReassignTo] = useState('');
    const [showPostVisit, setShowPostVisit] = useState(false);
    const [showBooking, setShowBooking] = useState(false);

    if (!lead) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
                <p style={{ color: '#94a3b8', fontSize: 15 }}>Lead not found.</p>
                <button onClick={() => router.push(basePath)} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>← Back to Leads</button>
            </div>
        );
    }

    const stageIdx = ALL_STAGES.indexOf(lead.stage);

    function handleAddNote() {
        if (!lead) return;
        if (!noteText.trim()) return;
        addNote(lead.id, noteText.trim());
        setNoteText('');
        toast.success('Note added');
    }

    function handleScheduleFollowUp() {
        if (!lead) return;
        if (!followUpForm.date || !followUpForm.time) { toast.error('Date and time required'); return; }
        scheduleFollowUp(lead.id, { ...followUpForm, done: false, scheduledAt: new Date().toISOString() } as FollowUp);
        toast.success('Follow-up scheduled!');
        setFollowUpForm({ date: '', time: '', note: '' });
    }

    function handleScheduleVisit() {
        if (!lead) return;
        if (!visitForm.date || !visitForm.time) { toast.error('Date and time required'); return; }
        scheduleVisit(lead.id, { ...visitForm, status: 'Confirmed' } as VisitSchedule);
        toast.success('Visit scheduled!');
        setVisitForm({ date: '', time: '', fieldAgent: salesAgents[0] || 'Unassigned', propertyName: '', roomNo: '' });
    }

    function handleStageChange(stage: LeadStage) {
        if (!lead) return;
        if (stage === 'Booked') { setShowBooking(true); return; }
        moveStage(lead.id, stage);
        toast.success(`Stage moved to ${stage}`);
    }

    return (
        <>
            <TopBar />
            <div className="responsive-padding" style={{ flex: 1, padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 16, background: '#f1f5f9' }}>

                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <button onClick={() => router.push(basePath)} style={{ background: '#fff', border: '1px solid #e8eef4', borderRadius: 9, padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#475569' }}>
                        <ArrowLeft size={15} />
                    </button>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0d1b2e' }}>{lead.name}</h1>
                        <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>Lead ID: {lead.id} · {lead.source}</p>
                    </div>
                    {lead.stage === 'Visit' && (
                        <button onClick={() => setShowPostVisit(true)} style={{ padding: '8px 16px', borderRadius: 9, background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                            Mark Visit Done
                        </button>
                    )}
                    <a href={`tel:${lead.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, background: '#ecfdf5', color: '#16a34a', textDecoration: 'none', fontWeight: 600, fontSize: 13, border: '1px solid #a7f3d0' }}>
                        <Phone size={14} /> Call
                    </a>
                    <a href={`https://wa.me/91${lead.phone}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, background: '#f0fdf4', color: '#16a34a', textDecoration: 'none', fontWeight: 600, fontSize: 13, border: '1px solid #bbf7d0' }}>
                        <MessageCircle size={14} /> WhatsApp
                    </a>
                </div>

                {/* 2-col grid */}
                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>

                    {/* LEFT */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                        {/* A. Basic Info */}
                        <Card title="Basic Info">
                            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <InfoRow label="Full Name" value={lead.name} />
                                <InfoRow label="Mobile" value={lead.phone} />
                                <InfoRow label="WhatsApp" value={lead.whatsapp || '—'} />
                                <InfoRow label="Lead Source" value={lead.source} />
                            </div>
                        </Card>

                        {/* B. Requirement Details */}
                        <Card title="Requirement Details">
                            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <InfoRow label="Preferred Area" value={lead.preferredArea || '—'} />
                                <InfoRow label="Budget" value={lead.budget ? `₹${lead.budget.toLocaleString('en-IN')}/mo` : '—'} />
                                <InfoRow label="Property Type" value={lead.propertyType} />
                                <InfoRow label="Gender Requirement" value={lead.genderRequirement} />
                                <InfoRow label="Assigned To" value={lead.assignedTo} />
                            </div>
                        </Card>

                        {/* E. Notes */}
                        <Card title="Notes">
                            <div style={{ display: 'flex', gap: 8, marginBottom: lead.notes.length > 0 ? 14 : 0 }}>
                                <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note…" rows={2}
                                    style={{ ...inStyle, resize: 'none', flex: 1 } as React.CSSProperties} />
                                <button onClick={handleAddNote}
                                    style={{ padding: '0 18px', borderRadius: 9, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                                    Add
                                </button>
                            </div>
                            {lead.notes.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>No notes yet</p>}
                            {[...lead.notes].reverse().map(n => (
                                <div key={n.id} style={{ background: '#f8fafc', borderRadius: 9, padding: '10px 12px', marginBottom: 8, border: '1px solid #f1f5f9' }}>
                                    <p style={{ margin: '0 0 4px', fontSize: 13.5, color: '#0d1b2e' }}>{n.text}</p>
                                    <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>
                                        {n.by} · {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            ))}
                        </Card>

                        {/* Booking details if booked */}
                        {lead.stage === 'Booked' && lead.bookingDetails && (
                            <Card title="Booking Details">
                                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <InfoRow label="Property" value={lead.bookingDetails.propertyName} />
                                    <InfoRow label="Bed Assigned" value={lead.bookingDetails.bedAssigned} />
                                    <InfoRow label="Advance Paid" value={`₹${lead.bookingDetails.advancePaid.toLocaleString('en-IN')}`} />
                                    <InfoRow label="Booking Date" value={new Date(lead.bookingDetails.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* RIGHT */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                        {/* C. Stage Management */}
                        <Card title="Stage Management">
                            <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                                {ALL_STAGES.map((s, i) => (
                                    <div key={s} style={{ flex: 1, height: 5, borderRadius: 99, background: i <= stageIdx ? stageColor[s] : '#e2e8f0', transition: 'background 0.3s' }} />
                                ))}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {ALL_STAGES.map(s => (
                                    <button key={s} onClick={() => handleStageChange(s)}
                                        style={{
                                            padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                                            cursor: 'pointer', border: `1.5px solid ${stageColor[s]}`,
                                            background: lead.stage === s ? stageColor[s] : 'transparent',
                                            color: lead.stage === s ? '#fff' : stageColor[s], transition: 'all 0.15s',
                                        }}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* D. Activity Timeline */}
                        <Card title="Activity Timeline">
                            <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                                {lead.timeline.length === 0 && <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>No activity yet</p>}
                                {[...lead.timeline].reverse().map((ev, i) => (
                                    <div key={ev.id} style={{ display: 'flex', gap: 10, paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${timelineColors[ev.type] ?? '#64748b'}18`, color: timelineColors[ev.type] ?? '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {typeIcon(ev.type)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: '0 0 2px', fontSize: 12.5, color: '#0d1b2e', lineHeight: 1.4 }}>{ev.text}</p>
                                            <p style={{ margin: 0, fontSize: 10.5, color: '#94a3b8' }}>{ev.by} · {new Date(ev.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* F. Follow-up Scheduler */}
                        <Card title="Schedule Follow-up">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Date</label>
                                        <input type="date" style={inStyle} value={followUpForm.date} onChange={e => setFollowUpForm(p => ({ ...p, date: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Time</label>
                                        <input type="time" style={inStyle} value={followUpForm.time} onChange={e => setFollowUpForm(p => ({ ...p, time: e.target.value }))} />
                                    </div>
                                </div>
                                <input style={inStyle} value={followUpForm.note} onChange={e => setFollowUpForm(p => ({ ...p, note: e.target.value }))} placeholder="Note (optional)" />
                                <button onClick={handleScheduleFollowUp}
                                    style={{ padding: '9px', borderRadius: 9, background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                                    Schedule Follow-up
                                </button>
                            </div>
                        </Card>

                        {/* G. Visit Scheduler */}
                        <Card title="Schedule Visit">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Visit Date</label>
                                        <input type="date" style={inStyle} value={visitForm.date} onChange={e => setVisitForm(p => ({ ...p, date: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Time</label>
                                        <input type="time" style={inStyle} value={visitForm.time} onChange={e => setVisitForm(p => ({ ...p, time: e.target.value }))} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Field Agent</label>
                                    <select style={inStyle as any} value={visitForm.fieldAgent} onChange={e => setVisitForm(p => ({ ...p, fieldAgent: e.target.value }))}>
                                        {salesAgents.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>PG / Property Name</label>
                                        <input type="text" style={inStyle} placeholder="e.g. Skyline PG" value={visitForm.propertyName} onChange={e => setVisitForm(p => ({ ...p, propertyName: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Room No (Optional)</label>
                                        <input type="text" style={inStyle} placeholder="e.g. 201" value={visitForm.roomNo} onChange={e => setVisitForm(p => ({ ...p, roomNo: e.target.value }))} />
                                    </div>
                                </div>
                                <button onClick={handleScheduleVisit}
                                    style={{ padding: '9px', borderRadius: 9, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                                    Schedule Visit
                                </button>
                            </div>
                        </Card>
                        {/* H. Reassign Lead */}
                        <Card title="Reassign Lead">
                            <p style={{ margin: '0 0 10px', fontSize: 12.5, color: '#64748b' }}>
                                Currently assigned to <strong style={{ color: '#0d1b2e' }}>{lead.assignedTo}</strong>. Reassigning moves this lead to another employee's dashboard.
                            </p>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <select
                                    value={reassignTo}
                                    onChange={e => setReassignTo(e.target.value)}
                                    style={{ ...inStyle, flex: 1 } as React.CSSProperties}
                                >
                                    <option value="">Select employee…</option>
                                    {employees.filter((e: any) => e.name !== lead.assignedTo && e.role === 'sales').map((e: any) => (
                                        <option key={e._id || e.id} value={e._id || e.id}>{e.name} ({e.assignedAreas?.[0]}…)</option>
                                    ))}
                                </select>
                                <button
                                    disabled={!reassignTo}
                                    onClick={() => {
                                        if (!reassignTo) return;
                                        const selectedEmp = employees.find((e: any) => (e._id || e.id) === reassignTo);
                                        const empName = selectedEmp ? selectedEmp.name : 'another employee';

                                        updateLead(lead.id, { assignedTo: reassignTo });
                                        toast.success(`Lead reassigned to ${empName}`);
                                        router.push('/leads');
                                    }}
                                    style={{ padding: '9px 14px', borderRadius: 9, background: reassignTo ? '#0d1b2e' : '#e2e8f0', color: reassignTo ? '#fff' : '#94a3b8', border: 'none', cursor: reassignTo ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
                                >
                                    <UserCheck size={14} /> Reassign
                                </button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Flow modals */}
            <PostVisitModal open={showPostVisit} onClose={() => setShowPostVisit(false)} lead={lead}
                onAction={(action: string) => {
                    setShowPostVisit(false);
                    if (action === 'negotiation') { moveStage(lead.id, 'Negotiation'); toast.success('Moved to Negotiation'); }
                    else if (action === 'booked') { setShowBooking(true); }
                    else if (action === 'lost') { moveStage(lead.id, 'Lost'); toast.success('Marked as Lost'); }
                    else if (action === 'reschedule') { toast.info('Open the Visit Scheduler below to reschedule'); }
                }}
            />
            <BookingModal open={showBooking} onClose={() => setShowBooking(false)} lead={lead}
                onConfirm={(details: BookingDetails) => {
                    setBookingDetails(lead.id, details);
                    setShowBooking(false);
                    toast.success('Booking confirmed! 🎉');
                    router.push('/bookings');
                }}
            />
        </>
    );
}
