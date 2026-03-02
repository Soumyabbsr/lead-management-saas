'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMyLeads } from '@/hooks/useMyLeads';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import TopBar from '@/components/ui/TopBar';
import { Eye, Phone, MessageCircle } from 'lucide-react';

export default function BookingsPage() {
    const router = useRouter();
    const toast = useToast();
    const { currentUser } = useAuth();
    const leads = useMyLeads();

    const booked = useMemo(() => leads.filter(l => l.stage === 'Booked'), [leads]);
    const totalRevenue = useMemo(() => booked.reduce((sum, l) => sum + (l.budget || 0), 0), [booked]);
    const convRate = leads.length > 0 ? Math.round((booked.length / leads.length) * 100) : 0;

    const target = currentUser?.monthlyTarget || 15;
    const teamRank = 2; // Demo static value until leaderboard endpoint is consumed
    const totalTeams = 12;

    return (
        <>
            <TopBar />
            <div className="responsive-padding" style={{ flex: 1, padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 16, background: '#f1f5f9' }}>

                {/* Header */}
                <div>
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0d1b2e' }}>Bookings</h1>
                    <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>{booked.length} confirmed · {currentUser.name}</p>
                </div>

                {/* Summary cards */}
                <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {[
                        { label: 'Monthly Target', value: `${booked.length} / ${target}`, sub: `${Math.round((booked.length / target) * 100)}% achieved`, color: '#2563eb', bg: '#eff6ff' },
                        { label: 'Conversion Rate', value: `${convRate}%`, sub: 'Total leads → Booked', color: '#059669', bg: '#ecfdf5' },
                        { label: 'Team Rank', value: `#${teamRank}`, sub: `Out of ${totalTeams} teams`, color: '#f97316', bg: '#fff7ed' },
                        { label: 'Est. Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, sub: 'Combined monthly budget', color: '#7c3aed', bg: '#f5f3ff' },
                    ].map(c => (
                        <div key={c.label} style={{ background: '#fff', border: '1px solid #e8eef4', borderRadius: 12, padding: '16px 18px' }}>
                            <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>{c.label}</div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: c.color }}>{c.value}</div>
                            <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4 }}>{c.sub}</div>
                        </div>
                    ))}
                </div>

                {/* Progress bar */}
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8eef4', padding: '14px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
                        <span>Monthly Target Progress</span>
                        <span style={{ color: '#2563eb' }}>{booked.length} / {target}</span>
                    </div>
                    <div style={{ height: 10, background: '#e8eef4', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, Math.round((booked.length / target) * 100))}%`, background: 'linear-gradient(90deg,#2563eb,#3b82f6)', borderRadius: 99, transition: 'width 0.6s ease' }} />
                    </div>
                </div>

                {/* Bookings table */}
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef4', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid #e8eef4' }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0d1b2e' }}>Confirmed Bookings</h3>
                    </div>
                    {booked.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                            <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>No bookings yet
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8eef4' }}>
                                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>Lead Name</th>
                                    <th className="mobile-hidden" style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>Contact</th>
                                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>Property</th>
                                    <th className="mobile-hidden" style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>Bed</th>
                                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>Advance Paid</th>
                                    <th className="mobile-hidden" style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>Booking Date</th>
                                    <th className="mobile-hidden" style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>Assigned To</th>
                                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {booked.map(lead => (
                                    <tr key={lead.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0d1b2e' }}>{lead.name}</td>
                                        <td className="mobile-hidden" style={{ padding: '12px 14px', color: '#475569', fontSize: 12.5, fontFamily: 'monospace' }}>+91 {lead.phone}</td>
                                        <td style={{ padding: '12px 14px', color: '#0d1b2e', fontWeight: 600 }}>{lead.bookingDetails?.propertyName ?? '—'}</td>
                                        <td className="mobile-hidden" style={{ padding: '12px 14px', color: '#64748b' }}>{lead.bookingDetails?.bedAssigned ?? '—'}</td>
                                        <td style={{ padding: '12px 14px', color: '#059669', fontWeight: 700 }}>
                                            {lead.bookingDetails ? `₹${lead.bookingDetails.advancePaid.toLocaleString('en-IN')}` : '—'}
                                        </td>
                                        <td className="mobile-hidden" style={{ padding: '12px 14px', color: '#64748b' }}>
                                            {lead.bookingDetails ? new Date(lead.bookingDetails.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                        <td className="mobile-hidden" style={{ padding: '12px 14px', color: '#64748b', fontSize: 12.5 }}>{lead.assignedTo}</td>
                                        <td style={{ padding: '12px 14px' }}>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button onClick={() => router.push(`/leads/${lead.id}`)}
                                                    style={{ width: 28, height: 28, borderRadius: 7, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', cursor: 'pointer' }}>
                                                    <Eye size={12} />
                                                </button>
                                                <a href={`tel:${lead.phone}`}
                                                    style={{ width: 28, height: 28, borderRadius: 7, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', textDecoration: 'none' }}>
                                                    <Phone size={12} />
                                                </a>
                                                <a href={`https://wa.me/91${lead.phone}`} target="_blank" rel="noreferrer"
                                                    style={{ width: 28, height: 28, borderRadius: 7, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', textDecoration: 'none' }}>
                                                    <MessageCircle size={12} />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
}
