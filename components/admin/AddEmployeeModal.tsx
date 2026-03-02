'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useToast } from '@/context/ToastContext';
import { Employee } from '@/lib/employees';
import { useSettingsStore } from '@/store/useSettingsStore';

interface Props {
    open: boolean;
    onClose: () => void;
    empToEdit?: Employee | null;
}

export default function AddEmployeeModal({ open, onClose, empToEdit }: Props) {
    const addEmployee = useEmployeeStore(s => s.addEmployee);
    const updateEmployee = useEmployeeStore(s => s.updateEmployee);
    const toast = useToast();
    const areas = useSettingsStore(s => s.areas);

    const [form, setForm] = useState({
        name: '', phone: '', email: '', password: '', role: 'sales' as Employee['role'],
        assignedAreas: [] as string[], monthlyTarget: 8, status: 'Active' as 'Active' | 'Inactive'
    });

    useEffect(() => {
        if (open) {
            if (empToEdit) setForm({
                name: empToEdit.name, phone: empToEdit.phone || '', email: empToEdit.email || '', password: '',
                role: empToEdit.role, assignedAreas: [...empToEdit.assignedAreas],
                monthlyTarget: empToEdit.monthlyTarget || 0, status: empToEdit.status
            });
            else setForm({
                name: '', phone: '', email: '', password: '', role: 'sales', assignedAreas: [], monthlyTarget: 8, status: 'Active'
            });
        }
    }, [open, empToEdit]);

    async function handleSave() {
        if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
            return toast.error('Name, Email, and Phone are required');
        }

        if (!empToEdit && !form.password.trim()) {
            return toast.error('Password is required for new employees');
        }

        try {
            if (empToEdit) {
                await updateEmployee(empToEdit.id, {
                    name: form.name, phone: form.phone, email: form.email,
                    role: form.role, assignedAreas: form.assignedAreas,
                    monthlyTarget: form.monthlyTarget, status: form.status
                });
                toast.success('Employee updated successfully');
            } else {
                await addEmployee({
                    name: form.name, phone: form.phone, email: form.email, password: form.password,
                    role: form.role, assignedAreas: form.assignedAreas,
                    monthlyTarget: form.monthlyTarget, status: form.status,
                    avatar: form.name.substring(0, 2).toUpperCase(), plan: 'Startup'
                });
                toast.success('Employee created & can log in now!');
            }
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create employee');
        }
    }

    const toggleArea = (area: string) => {
        setForm(p => ({
            ...p,
            assignedAreas: p.assignedAreas.includes(area)
                ? p.assignedAreas.filter(a => a !== area)
                : [...p.assignedAreas, area]
        }));
    };

    const inStyle = { padding: '9px 12px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' as const, color: '#0d1b2e' };
    const labelStyle = { fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.04em' };

    return (
        <Modal open={open} onClose={onClose} title={empToEdit ? "Edit Employee" : "Add Employee"}>
            <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                        <label style={labelStyle}>Full Name *</label>
                        <input style={inStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Rahul Kumar" />
                    </div>
                    <div>
                        <label style={labelStyle}>Phone *</label>
                        <input style={inStyle} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Mobile number" />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                        <label style={labelStyle}>Email Login *</label>
                        <input style={inStyle} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Work email required" required />
                    </div>
                    <div>
                        <label style={labelStyle}>{empToEdit ? 'New Password (Optional)' : 'Set Password *'}</label>
                        <input style={inStyle} type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder={empToEdit ? "Leave blank to keep same" : "Set login password"} required={!empToEdit} />
                    </div>
                    <div>
                        <label style={labelStyle}>Role</label>
                        <select style={inStyle} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as Employee['role'] }))}>
                            <option value="sales">Sales</option>
                            <option value="field_agent">Field Agent</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>

                {form.role === 'sales' && (
                    <div>
                        <label style={labelStyle}>Monthly Booking Target</label>
                        <input style={inStyle} type="number" value={form.monthlyTarget} onChange={e => setForm(p => ({ ...p, monthlyTarget: Number(e.target.value) }))} />
                    </div>
                )}

                <div>
                    <label style={labelStyle}>Assigned Areas</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#f8fafc', padding: 12, borderRadius: 10, border: '1px solid #e8eef4' }}>
                        {areas.map(a => {
                            const active = form.assignedAreas.includes(a);
                            return (
                                <div key={a} onClick={() => toggleArea(a)}
                                    style={{
                                        padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                                        background: active ? '#2563eb' : '#fff', color: active ? '#fff' : '#64748b', border: `1px solid ${active ? '#2563eb' : '#cbd5e1'}`
                                    }}>
                                    {a}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ paddingTop: 6, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button onClick={onClose} style={{ padding: '9px 16px', borderRadius: 9, background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Cancel</button>
                    <button onClick={handleSave} style={{ padding: '9px 24px', borderRadius: 9, background: '#0d1b2e', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                        {empToEdit ? 'Save Changes' : 'Create Employee'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
