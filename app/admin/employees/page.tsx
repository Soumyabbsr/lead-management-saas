'use client';

import { useState, useEffect } from 'react';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useLeadStore } from '@/store/useLeadStore';
import { Employee } from '@/lib/employees';
import AddEmployeeModal from '@/components/admin/AddEmployeeModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Plus, Edit2, ShieldCheck, UserCheck, MapPin, Power, Trash2 } from 'lucide-react';

export default function AdminEmployeesPage() {
    const employees = useEmployeeStore(s => s.employees);
    const fetchEmployees = useEmployeeStore(s => s.fetchEmployees);
    const deleteEmployee = useEmployeeStore(s => s.deleteEmployee);
    const toggleStatus = useEmployeeStore(s => s.toggleStatus);

    const leads = useLeadStore(s => s.leads);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const [showAdd, setShowAdd] = useState(false);
    const [empToEdit, setEmpToEdit] = useState<Employee | null>(null);
    const [empToDelete, setEmpToDelete] = useState<Employee | null>(null);

    function getBookingsCount(empName: string) {
        return leads.filter(l => l.assignedTo === empName && l.stage === 'Booked').length;
    }

    function getAssignedLeadsCount(empName: string) {
        return leads.filter(l => l.assignedTo === empName).length;
    }

    return (
        <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18, background: '#f1f5f9' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0d1b2e' }}>Employee Management</h1>
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>Manage roles, areas, and system access</p>
                </div>
                <button onClick={() => { setEmpToEdit(null); setShowAdd(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                    <Plus size={16} /> Add Employee
                </button>
            </div>

            {/* Grid of employees */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {employees.map(emp => {
                    const isMe = emp.role === 'admin' && emp.name === 'Soumya Admin'; // Safety hardcode for demo

                    return (
                        <div key={emp.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef4', padding: 20, display: 'flex', flexDirection: 'column', opacity: emp.status === 'Inactive' ? 0.6 : 1 }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 12, background: emp.role === 'admin' ? 'linear-gradient(135deg,#ef4444,#f97316)' : '#eff6ff', color: emp.role === 'admin' ? '#fff' : '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>
                                        {emp.avatar}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#0d1b2e', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {emp.name}
                                            {emp.status === 'Inactive' && <span style={{ fontSize: 10, background: '#fef2f2', color: '#ef4444', padding: '2px 6px', borderRadius: 4 }}>INACTIVE</span>}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                            {emp.role === 'admin' ? <ShieldCheck size={12} /> : <UserCheck size={12} />}
                                            {emp.role}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button onClick={() => { setEmpToEdit(emp); setShowAdd(true); }}
                                        style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Edit2 size={13} />
                                    </button>
                                    <button onClick={() => toggleStatus(emp.id)} disabled={isMe}
                                        style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${emp.status === 'Active' ? '#fca5a5' : '#a7f3d0'}`, background: emp.status === 'Active' ? '#fef2f2' : '#ecfdf5', color: emp.status === 'Active' ? '#ef4444' : '#059669', cursor: isMe ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isMe ? 0.3 : 1 }}>
                                        <Power size={13} />
                                    </button>
                                    {!isMe && (
                                        <button onClick={() => setEmpToDelete(emp)}
                                            style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #fca5a5', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Trash2 size={13} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Contact info */}
                            <div style={{ fontSize: 12.5, color: '#475569', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'monospace' }}>
                                <div>📞 +91 {emp.phone || '—'}</div>
                                <div>✉️ {emp.email || '—'}</div>
                            </div>

                            {/* Areas */}
                            <div style={{ marginBottom: 14 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>Assigned Areas</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                    {emp.assignedAreas.length > 0 ? emp.assignedAreas.map(a => (
                                        <span key={a} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: 6, fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <MapPin size={10} /> {a}
                                        </span>
                                    )) : (
                                        <span style={{ fontSize: 12, color: '#94a3b8' }}>All Areas / Internal</span>
                                    )}
                                </div>
                            </div>

                            {/* Stats inline */}
                            {emp.role === 'sales' && (
                                <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: 14, display: 'flex', gap: 12 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Target</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0d1b2e' }}>{getBookingsCount(emp.name)} <span style={{ color: '#94a3b8', fontSize: 12 }}>/ {emp.monthlyTarget}</span></div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Active Leads</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#2563eb' }}>{getAssignedLeadsCount(emp.name)}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <AddEmployeeModal open={showAdd} onClose={() => setShowAdd(false)} empToEdit={empToEdit} />

            <ConfirmModal
                open={!!empToDelete}
                title="Delete Employee"
                message={`Remove ${empToDelete?.name} from the system? Their leads will be unassigned and need manual reassignment.`}
                confirmLabel="Delete"
                danger
                onConfirm={() => {
                    if (empToDelete) deleteEmployee(empToDelete.id);
                    setEmpToDelete(null);
                }}
                onCancel={() => setEmpToDelete(null)}
            />
        </div>
    );
}
