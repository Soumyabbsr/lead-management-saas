'use client';

import { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { Settings2, Bell, Shield, GitMerge, Clock, AlertTriangle, Save, MapPin, X, Navigation, Locate } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

// Defined outside component to prevent remounting on every keystroke (input focus loss bug)
function SectionTitle({ title, icon: Icon, desc }: { title: string; icon: any; desc: string }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0d1b2e', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={18} color="#2563eb" /> {title}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{desc}</p>
        </div>
    );
}

function Card({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef4', padding: 24, marginBottom: 20 }}>
            {children}
        </div>
    );
}

export default function AdminSettingsPage() {
    const toast = useToast();

    // Mock state for demo
    const [stages, setStages] = useState(['New', 'Contacted', 'Visit', 'Negotiation', 'Booked', 'Lost']);
    const [autoAssign, setAutoAssign] = useState(true);
    const [followUpHours, setFollowUpHours] = useState(24);
    const [alertHours, setAlertHours] = useState(24);
    const [notifs, setNotifs] = useState({ email: true, push: false, sms: true });

    const { areas, addArea, removeArea, officeLocation, lateThresholdTime, updateOfficeLocation, fetchSettings } = useSettingsStore();
    const [newArea, setNewArea] = useState('');

    // Office location local state
    const [oLat, setOLat] = useState('');
    const [oLng, setOLng] = useState('');
    const [oRadius, setORadius] = useState('100');
    const [oLateTime, setOLateTime] = useState('10:00');
    const [gettingGps, setGettingGps] = useState(false);

    // Sync from store on load
    useState(() => {
        fetchSettings();
    });
    useState(() => {
        if (officeLocation.latitude) setOLat(String(officeLocation.latitude));
        if (officeLocation.longitude) setOLng(String(officeLocation.longitude));
        if (officeLocation.radiusMeters) setORadius(String(officeLocation.radiusMeters));
        if (lateThresholdTime) setOLateTime(lateThresholdTime);
    });

    function handleAddArea() {
        if (!newArea.trim()) return;
        addArea(newArea.trim());
        setNewArea('');
        toast.success(`Area "${newArea.trim()}" added successfully`);
    }

    function handleSave() {
        toast.success('System settings saved successfully');
    }

    return (
        <div className="responsive-padding" style={{ flex: 1, padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 16, background: '#f1f5f9' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0d1b2e' }}>System Settings</h1>
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>Configure global CRM rules and permissions</p>
                </div>
                <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: '#0d1b2e', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                    <Save size={16} /> Save Changes
                </button>
            </div>

            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

                {/* Left Column */}
                <div>
                    <Card>
                        <SectionTitle title="Lead Stages Workflow" icon={GitMerge} desc="Define the pipeline stages for all leads" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {stages.map((st, i) => (
                                <div key={st} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', width: 24 }}>{i + 1}.</div>
                                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0d1b2e', flex: 1 }}>{st}</div>
                                </div>
                            ))}
                            <button style={{ padding: '8px', borderRadius: 8, border: '1px dashed #cbd5e1', background: 'transparent', color: '#64748b', fontSize: 13, cursor: 'pointer', marginTop: 4 }}>
                                + Add Stage
                            </button>
                        </div>
                    </Card>

                    <Card>
                        <SectionTitle title="Auto-Assignment Rules" icon={Settings2} desc="How incoming leads are routed to agents" />

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid #f1f5f9', marginBottom: 16 }}>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#0d1b2e' }}>Enable Area Auto-Match</div>
                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Automatically assign leads based on employee preferred areas</div>
                            </div>
                            <div onClick={() => setAutoAssign(!autoAssign)} style={{ width: 44, height: 24, borderRadius: 99, background: autoAssign ? '#10b981' : '#cbd5e1', position: 'relative', cursor: 'pointer', transition: '0.2s' }}>
                                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: autoAssign ? 22 : 2, transition: '0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
                            </div>
                        </div>

                        <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                            <strong>Current Logic:</strong> When a new lead is added, the system checks their `preferredArea`. If an active Sales agent has that area in their `assignedAreas`, the lead is instantly assigned to them. If multiple match, it picks the first one. If none match, it stays with the creator.
                        </div>
                    </Card>
                    <Card>
                        <SectionTitle title="Operating Areas (Cities)" icon={MapPin} desc="Locations where your business operates" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input value={newArea} onChange={e => setNewArea(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddArea()} placeholder="e.g. Mumbai, Navi Mumbai" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }} />
                                <button onClick={handleAddArea} style={{ padding: '8px 14px', borderRadius: 8, background: '#0d1b2e', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Add</button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                                {areas.map(area => (
                                    <div key={area} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: '#0d1b2e' }}>
                                        <MapPin size={12} color="#64748b" />
                                        {area}
                                        <button onClick={() => { removeArea(area); toast.success(`Area "${area}" removed`); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', color: '#ef4444' }} title="Remove Area"><X size={12} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <SectionTitle title="Office Location & Geofence" icon={Navigation} desc="Set office GPS coordinates for attendance verification" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <div style={{ flex: '1 1 140px' }}>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>Latitude</label>
                                    <input type="number" step="any" value={oLat} onChange={e => setOLat(e.target.value)} placeholder="e.g. 12.9716" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ flex: '1 1 140px' }}>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>Longitude</label>
                                    <input type="number" step="any" value={oLng} onChange={e => setOLng(e.target.value)} placeholder="e.g. 77.5946" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <div style={{ flex: '1 1 140px' }}>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>Radius (meters)</label>
                                    <input type="number" value={oRadius} onChange={e => setORadius(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ flex: '1 1 140px' }}>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>Late After (HH:mm)</label>
                                    <input type="time" value={oLateTime} onChange={e => setOLateTime(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => {
                                        setGettingGps(true);
                                        navigator.geolocation.getCurrentPosition(
                                            pos => { setOLat(String(pos.coords.latitude)); setOLng(String(pos.coords.longitude)); setGettingGps(false); toast.success('GPS location captured'); },
                                            () => { setGettingGps(false); toast.error('Could not get GPS location'); },
                                            { enableHighAccuracy: true }
                                        );
                                    }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                                >
                                    <Locate size={14} /> {gettingGps ? 'Getting...' : 'Use My Current Location'}
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!oLat || !oLng) { toast.error('Please set latitude and longitude'); return; }
                                        await updateOfficeLocation({
                                            officeLocation: { latitude: parseFloat(oLat), longitude: parseFloat(oLng), radiusMeters: parseInt(oRadius) || 100 },
                                            lateThresholdTime: oLateTime,
                                        });
                                        toast.success('Office location saved successfully');
                                    }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: '#0d1b2e', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                                >
                                    <Save size={14} /> Save Location
                                </button>
                            </div>
                            {officeLocation.latitude !== 0 && (
                                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e8eef4', fontSize: 12, color: '#475569' }}>
                                    <strong>Current:</strong> {officeLocation.latitude.toFixed(6)}, {officeLocation.longitude.toFixed(6)} — {officeLocation.radiusMeters}m radius
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column */}
                <div>
                    <Card>
                        <SectionTitle title="Timeouts & Alerts" icon={Clock} desc="Configure SLAs and follow-up deadlines" />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                    <Clock size={14} /> Default Follow-up Time
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <input type="number" value={followUpHours} onChange={e => setFollowUpHours(Number(e.target.value))} style={{ width: 80, padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' }} />
                                    <span style={{ fontSize: 13, color: '#64748b' }}>hours after lead creation</span>
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                    <AlertTriangle size={14} color="#f97316" /> Inactivity Alert Warning
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <input type="number" value={alertHours} onChange={e => setAlertHours(Number(e.target.value))} style={{ width: 80, padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' }} />
                                    <span style={{ fontSize: 13, color: '#64748b' }}>hours without note or call</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <SectionTitle title="Notifications" icon={Bell} desc="Global communication settings" />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {Object.entries(notifs).map(([key, val]) => (
                                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e8eef4' }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0d1b2e', textTransform: 'capitalize' }}>{key} Notifications</div>
                                    <input type="checkbox" checked={val} onChange={e => setNotifs(p => ({ ...p, [key]: e.target.checked }))} style={{ width: 16, height: 16 }} />
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card>
                        <SectionTitle title="Role Permissions" icon={Shield} desc="What different user roles can access" />

                        <div style={{ border: '1px solid #e8eef4', borderRadius: 8, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8eef4' }}>
                                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: '#64748b' }}>Feature</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>Admin</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>Sales</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>Field</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        ['View All Leads', '✓', '—', '—'],
                                        ['Reassign Leads', '✓', '✓', '—'],
                                        ['Mark Visits Done', '✓', '✓', '✓'],
                                        ['Manage Employees', '✓', '—', '—'],
                                        ['System Settings', '✓', '—', '—'],
                                    ].map((row, i) => (
                                        <tr key={i} style={{ borderBottom: i === 4 ? 'none' : '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '10px 12px', fontWeight: 500, color: '#334155' }}>{row[0]}</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center', color: '#059669', fontWeight: 700 }}>{row[1]}</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center', color: row[2] === '✓' ? '#059669' : '#94a3b8' }}>{row[2]}</td>
                                            <td style={{ padding: '10px 12px', textAlign: 'center', color: row[3] === '✓' ? '#059669' : '#94a3b8' }}>{row[3]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
}
