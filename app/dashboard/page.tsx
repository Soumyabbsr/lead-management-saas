'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useLeadStore } from '@/store/useLeadStore';
import { useAttendanceStore } from '@/store/useAttendanceStore';
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
import { Plus, UserCircle2, Timer, Camera, MapPin, CheckCircle2, XCircle, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TODAY_STR = new Date().toISOString().slice(0, 10);

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
}

function formatTime(dateStr: string | null) {
    if (!dateStr) return '--:--';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Attendance Widget ────────────────────────────────────
function AttendanceWidget() {
    const toast = useToast();
    const { todayRecord, isLoading, fetchTodayStatus, checkIn, checkOut } = useAttendanceStore();
    const [showCamera, setShowCamera] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [gpsStatus, setGpsStatus] = useState<'idle' | 'fetching' | 'done' | 'error'>('idle');
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        fetchTodayStatus();
    }, []);

    const isCheckedIn = !!todayRecord?.checkIn;
    const isCheckedOut = !!todayRecord?.checkOut;

    // Live timer
    const [elapsed, setElapsed] = useState('');
    useEffect(() => {
        if (!isCheckedIn || isCheckedOut) return;
        const interval = setInterval(() => {
            const diff = Date.now() - new Date(todayRecord!.checkIn!).getTime();
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setElapsed(`${h}h ${m}m ${s}s`);
        }, 1000);
        return () => clearInterval(interval);
    }, [isCheckedIn, isCheckedOut, todayRecord]);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    }, []);

    const startCheckIn = async () => {
        // Step 1: Get GPS
        setGpsStatus('fetching');
        setCapturedImage(null);
        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000 })
            );
            setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setGpsStatus('done');
        } catch {
            setGpsStatus('error');
            toast.error('Could not get GPS location. Please enable location services.');
            return;
        }

        // Step 2: Open camera
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 480, height: 480 } });
            streamRef.current = stream;
            setShowCamera(true);
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            }, 100);
        } catch {
            toast.error('Could not access camera. Please allow camera permissions.');
            setGpsStatus('idle');
        }
    };

    const captureSelfie = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        stopCamera();
    };

    const submitCheckIn = async () => {
        if (!coords || !capturedImage) return;
        setSubmitting(true);
        try {
            // Convert base64 to blob
            const byteString = atob(capturedImage.split(',')[1]);
            const mimeString = capturedImage.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
            const blob = new Blob([ab], { type: mimeString });

            const formData = new FormData();
            formData.append('latitude', coords.lat.toString());
            formData.append('longitude', coords.lng.toString());
            formData.append('selfie', blob, 'selfie.jpg');

            const result = await checkIn(formData);
            if (result.success) {
                toast.success('Checked in successfully! ✅');
            } else {
                toast.error(result.message || 'Check-in failed');
            }
        } catch {
            toast.error('Check-in failed. Please try again.');
        } finally {
            setSubmitting(false);
            setShowCamera(false);
            setCapturedImage(null);
            setGpsStatus('idle');
        }
    };

    const handleCheckOut = async () => {
        const result = await checkOut();
        if (result.success) {
            toast.success('Checked out successfully! 👋');
        } else {
            toast.error(result.message || 'Check-out failed');
        }
    };

    const cancelCamera = () => {
        stopCamera();
        setShowCamera(false);
        setCapturedImage(null);
        setGpsStatus('idle');
    };

    // Status display
    const getStatusBadge = () => {
        if (!isCheckedIn) return { label: 'Not Checked In', color: '#64748b', bg: '#f1f5f9' };
        if (todayRecord?.status === 'Late') return { label: 'Late', color: '#f59e0b', bg: '#fffbeb' };
        if (isCheckedOut) return { label: 'Checked Out', color: '#6366f1', bg: '#eef2ff' };
        return { label: 'Active', color: '#16a34a', bg: '#f0fdf4' };
    };
    const badge = getStatusBadge();

    return (
        <>
            {/* Check-in / Check-out Button */}
            {!isCheckedIn ? (
                <button
                    onClick={startCheckIn}
                    disabled={isLoading || gpsStatus === 'fetching'}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'linear-gradient(135deg,#ef4444,#f97316)',
                        border: 'none', borderRadius: 12, padding: '10px 18px 10px 14px',
                        cursor: 'pointer', color: '#fff', opacity: isLoading ? 0.6 : 1,
                    }}
                >
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1 }}>
                            {gpsStatus === 'fetching' ? 'Getting Location...' : 'Check In'}
                        </div>
                        <div style={{ fontSize: 10.5, opacity: 0.85, marginTop: 2 }}>
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {gpsStatus === 'fetching' ? <Loader2 size={14} color="#fff" className="animate-spin" /> : <Timer size={14} color="#fff" />}
                    </div>
                </button>
            ) : !isCheckedOut ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, background: badge.bg, color: badge.color, fontSize: 10, fontWeight: 700 }}>{badge.label}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{elapsed}</div>
                        {todayRecord?.locationVerified && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#16a34a', marginTop: 1 }}>
                                <MapPin size={10} /> Verified
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleCheckOut}
                        disabled={isLoading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                            border: 'none', borderRadius: 12, padding: '10px 18px 10px 14px',
                            cursor: 'pointer', color: '#fff', opacity: isLoading ? 0.6 : 1,
                        }}
                    >
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1 }}>Check Out</div>
                            <div style={{ fontSize: 10.5, opacity: 0.85, marginTop: 2 }}>In at {formatTime(todayRecord?.checkIn || null)}</div>
                        </div>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Timer size={14} color="#fff" />
                        </div>
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#f0fdf4', borderRadius: 10 }}>
                    <CheckCircle2 size={16} color="#16a34a" />
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>Day Complete</div>
                        <div style={{ fontSize: 10.5, color: '#64748b' }}>{formatTime(todayRecord?.checkIn || null)} → {formatTime(todayRecord?.checkOut || null)}</div>
                    </div>
                </div>
            )}

            {/* Camera Modal */}
            {(showCamera || capturedImage) && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 420, width: '90%', position: 'relative' }}>
                        <button onClick={cancelCamera} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={20} color="#64748b" />
                        </button>

                        <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: '#0d1b2e' }}>
                            <Camera size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                            Selfie Verification
                        </h3>
                        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
                            Capture your selfie to confirm identity
                        </p>

                        {coords && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: '#f0fdf4', borderRadius: 8, marginBottom: 12, fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                                <MapPin size={14} /> GPS Location Captured ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
                            </div>
                        )}

                        {!capturedImage ? (
                            <>
                                <div style={{ borderRadius: 14, overflow: 'hidden', background: '#000', marginBottom: 12, aspectRatio: '1/1' }}>
                                    <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                                </div>
                                <button onClick={captureSelfie} style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg,#2563eb,#3b82f6)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <Camera size={18} /> Capture Selfie
                                </button>
                            </>
                        ) : (
                            <>
                                <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
                                    <img src={capturedImage} alt="Selfie" style={{ width: '100%', borderRadius: 14 }} />
                                </div>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button
                                        onClick={() => { setCapturedImage(null); startCheckIn(); }}
                                        style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Retake
                                    </button>
                                    <button
                                        onClick={submitCheckIn}
                                        disabled={submitting}
                                        style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                    >
                                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                        {submitting ? 'Submitting...' : 'Confirm Check-In'}
                                    </button>
                                </div>
                            </>
                        )}

                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>
                </div>
            )}
        </>
    );
}

// ── Main Dashboard ───────────────────────────────────────
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
                    <AttendanceWidget />
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
