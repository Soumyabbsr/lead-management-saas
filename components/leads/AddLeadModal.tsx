'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import { useLeadStore } from '@/store/useLeadStore';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { Lead, LeadStage, LeadSource, PropertyType, GenderRequirement } from '@/types/lead';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Phone } from 'lucide-react';

interface Props {
    open: boolean;
    onClose: () => void;
}

type FormData = {
    name: string;
    phone: string;
    whatsapp: string;
    source: LeadSource;
    propertyType: PropertyType;
    genderRequirement: GenderRequirement;
    preferredAreas: string[];
    budget: string;
    assignedTo: string;
    stage: LeadStage;
};

const SOURCES: LeadSource[] = ['Walk-in', 'Reference', 'Facebook', 'Instagram', 'Portal', 'Cold Call', 'Other'];
const PROPERTY_TYPES: PropertyType[] = ['PG', 'Flat', 'Coliving', 'Not Decided'];
const GENDERS: GenderRequirement[] = ['Boys', 'Girls', 'Any'];
const STAGES: LeadStage[] = ['New', 'Contacted', 'Visit', 'Negotiation', 'Booked'];

const PillBtn = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        style={{
            padding: '6px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            border: active ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
            background: active ? '#eff6ff' : '#f8fafc',
            color: active ? '#2563eb' : '#64748b',
            transition: 'all 0.15s',
        }}
    >
        {label}
    </button>
);

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
            {children}
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e2e8f0',
    fontSize: 13.5, outline: 'none', background: '#fff', color: '#0d1b2e',
    width: '100%', boxSizing: 'border-box' as const,
};

export default function AddLeadModal({ open, onClose }: Props) {
    const router = useRouter();
    const addLead = useLeadStore(s => s.addLead);
    const employees = useEmployeeStore(s => s.employees);
    const toast = useToast();
    const { currentUser } = useAuth();
    const areas = useSettingsStore(s => s.areas);

    const [form, setForm] = useState<FormData>({
        name: '', phone: '', whatsapp: '', source: 'Facebook',
        propertyType: 'PG', genderRequirement: 'Any',
        preferredAreas: [], budget: '', assignedTo: currentUser?.name || '', stage: 'New',
    });
    const [saving, setSaving] = useState(false);

    const set = (key: keyof FormData, value: unknown) =>
        setForm(p => ({ ...p, [key]: value }));

    const toggleArea = (area: string) => {
        const newAreas = form.preferredAreas.includes(area)
            ? form.preferredAreas.filter(a => a !== area)
            : [...form.preferredAreas, area];

        // Auto-assign employee based on area (from DB state)
        let autoEmpName: string | null = null;
        for (const a of newAreas) {
            const emp = employees.find(
                e => e.role === 'sales' && e.status === 'Active' && e.assignedAreas.some(areaAssigned => areaAssigned.toLowerCase() === a.toLowerCase())
            );
            if (emp) {
                autoEmpName = emp.name;
                break;
            }
        }

        setForm(p => ({ ...p, preferredAreas: newAreas, assignedTo: autoEmpName ?? (currentUser?.name || '') }));
    };

    function buildLead(): Omit<Lead, 'id' | 'notes' | 'timeline' | 'lastActivity'> {
        return {
            name: form.name.trim(),
            phone: form.phone.trim(),
            whatsapp: form.whatsapp.trim() || undefined,
            preferredArea: form.preferredAreas.join(', ') || null,
            budget: form.budget ? parseInt(form.budget) : null,
            stage: form.stage,
            assignedTo: form.assignedTo,
            followUpDue: null,
            visitDate: null,
            visitStatus: 'Pending',
            source: form.source,
            propertyType: form.propertyType,
            genderRequirement: form.genderRequirement,
        };
    }

    async function handleSave(andCall = false) {
        if (!form.name.trim() || !form.phone.trim()) {
            toast.error('Name and mobile number are required');
            return;
        }
        setSaving(true);
        try {
            await addLead(buildLead());
            toast.success(`Lead "${form.name}" created! Assigned to ${form.assignedTo || 'team'}`);
            onClose();
            resetForm();
            if (andCall) {
                window.location.href = `tel:${form.phone}`;
            }
        } finally {
            setSaving(false);
        }
    }

    function resetForm() {
        setForm({ name: '', phone: '', whatsapp: '', source: 'Facebook', propertyType: 'PG', genderRequirement: 'Any', preferredAreas: [], budget: '', assignedTo: currentUser?.name || '', stage: 'New' });
    }

    return (
        <Modal open={open} onClose={() => { onClose(); resetForm(); }} title="Add New Lead" width={560}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Row: Name + Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Full Name" required>
                        <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Rahul Gupta" />
                    </Field>
                    <Field label="Mobile Number" required>
                        <input style={inputStyle} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210" />
                    </Field>
                </div>

                {/* Row: WhatsApp + Source */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="WhatsApp (Optional)">
                        <input style={inputStyle} type="tel" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="Same as mobile or different" />
                    </Field>
                    <Field label="Lead Source">
                        <select style={inputStyle} value={form.source} onChange={e => set('source', e.target.value as LeadSource)}>
                            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </Field>
                </div>

                {/* Property Type pills */}
                <Field label="Property Type">
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {PROPERTY_TYPES.map(pt => (
                            <PillBtn key={pt} label={pt} active={form.propertyType === pt} onClick={() => set('propertyType', pt)} />
                        ))}
                    </div>
                </Field>

                {/* Gender Requirement pills */}
                <Field label="Gender Requirement">
                    <div style={{ display: 'flex', gap: 8 }}>
                        {GENDERS.map(g => (
                            <PillBtn key={g} label={g} active={form.genderRequirement === g} onClick={() => set('genderRequirement', g)} />
                        ))}
                    </div>
                </Field>

                {/* Preferred Areas multi-select */}
                <Field label="Preferred Area (multi-select)">
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {areas.map(area => (
                            <PillBtn key={area} label={area} active={form.preferredAreas.includes(area)} onClick={() => toggleArea(area)} />
                        ))}
                    </div>
                </Field>

                {/* Budget + Assigned To + Stage */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <Field label="Budget (₹/mo)">
                        <input style={inputStyle} type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="e.g. 10000" />
                    </Field>
                    <Field label="Assigned To">
                        <select style={inputStyle} value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)}>
                            {/* Option for current session user just in case */}
                            {currentUser && <option value={currentUser.name}>{currentUser.name}</option>}

                            {/* Real DB Employees filtered for Sales */}
                            {employees.filter(e => e.role === 'sales' && e.status === 'Active' && e.name !== currentUser?.name).map(a => (
                                <option key={a.id} value={a.name}>{a.name}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Stage">
                        <select style={inputStyle} value={form.stage} onChange={e => set('stage', e.target.value as LeadStage)}>
                            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </Field>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10, paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
                    <button
                        onClick={() => { onClose(); resetForm(); }}
                        style={{ padding: '10px 20px', borderRadius: 9, fontSize: 13.5, fontWeight: 600, background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#475569' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        style={{ flex: 1, padding: '10px 20px', borderRadius: 9, fontSize: 13.5, fontWeight: 700, background: '#2563eb', border: 'none', cursor: 'pointer', color: '#fff', opacity: saving ? 0.7 : 1 }}
                    >
                        {saving ? 'Saving…' : 'Save Lead'}
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        disabled={saving}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 20px', borderRadius: 9, fontSize: 13.5, fontWeight: 700, background: '#16a34a', border: 'none', cursor: 'pointer', color: '#fff', opacity: saving ? 0.7 : 1 }}
                    >
                        <Phone size={14} /> Save & Call
                    </button>
                </div>
            </div>
        </Modal>
    );
}
