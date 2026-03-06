'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLeadStore } from '@/store/useLeadStore';
import { useEmployeeStore } from '@/store/useEmployeeStore';
import { useToast } from '@/context/ToastContext';
import { Lead, LeadStage } from '@/types/lead';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Phone, MessageCircle, Eye, Trash2, Search } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

const STAGES: LeadStage[] = ['New', 'Contacted', 'Visit', 'Negotiation', 'Booked', 'Lost'];
const stageColor: Record<LeadStage, { bg: string; text: string }> = {
    New: { bg: '#eff6ff', text: '#2563eb' },
    Contacted: { bg: '#f5f3ff', text: '#7c3aed' },
    Visit: { bg: '#fffbeb', text: '#d97706' },
    Negotiation: { bg: '#fff7ed', text: '#ea580c' },
    Booked: { bg: '#ecfdf5', text: '#059669' },
    Lost: { bg: '#fef2f2', text: '#ef4444' },
};

function hoursAgo(iso: string) {
    return Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
}
function relativeTime(iso: string) {
    const h = hoursAgo(iso);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

export default function AdminLeadsPage() {
    const router = useRouter();
    const toast = useToast();

    const leads = useLeadStore(s => s.leads);
    const moveStage = useLeadStore(s => s.moveStage);
    const updateLead = useLeadStore(s => s.updateLead);
    const deleteLead = useLeadStore(s => s.deleteLead);
    const bulkMoveStage = useLeadStore(s => s.bulkMoveStage);

    const employees = useEmployeeStore(s => s.employees);
    const salesEmps = useMemo(() => employees.filter(e => e.role === 'sales'), [employees]);

    // We'll manage local selection for bulk actions here, since the global one might mix with employee view
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [search, setSearch] = useState('');
    const [stageFilter, setStageFilter] = useState<LeadStage | 'All'>('All');
    const [assignedFilter, setAssignedFilter] = useState('All');
    const [areaFilter, setAreaFilter] = useState('All');
    const [sourceFilter, setSourceFilter] = useState('All');

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [bulkStage, setBulkStage] = useState<LeadStage>('Contacted');
    const [bulkAssign, setBulkAssign] = useState<string>('');

    const sources = useMemo(() => Array.from(new Set(leads.map(l => l.source))), [leads]);

    const filtered = useMemo(() => {
        return leads.filter(l => {
            if (search) {
                const q = search.toLowerCase();
                if (!l.name.toLowerCase().includes(q) && !l.phone.includes(q)) return false;
            }
            if (stageFilter !== 'All' && l.stage !== stageFilter) return false;
            if (assignedFilter !== 'All' && l.assignedTo !== assignedFilter) return false;
            if (areaFilter !== 'All' && l.preferredArea !== areaFilter) return false;
            if (sourceFilter !== 'All' && l.source !== sourceFilter) return false;
            return true;
        });
    }, [leads, search, stageFilter, assignedFilter, areaFilter, sourceFilter]);

    function toggleSelect(id: string) {
        setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    }
    function toggleSelectAll() {
        if (selectedIds.length === filtered.length) setSelectedIds([]);
        else setSelectedIds(filtered.map(l => l.id));
    }

    function handleBulkMove() {
        if (!selectedIds.length) return;
        bulkMoveStage(selectedIds, bulkStage);
        toast.success(`${selectedIds.length} leads moved to ${bulkStage}`);
        setSelectedIds([]);
    }

    function handleBulkReassign() {
        if (!selectedIds.length || !bulkAssign) return;
        selectedIds.forEach(id => updateLead(id, { assignedTo: bulkAssign }));
        toast.success(`${selectedIds.length} leads reassigned to ${bulkAssign}`);
        setSelectedIds([]);
        setBulkAssign('');
    }

    function handleDelete(id: string) {
        deleteLead(id);
        setDeleteId(null);
        setSelectedIds(p => p.filter(x => x !== id));
        toast.success('Lead deleted');
    }

    function handleInlineStage(lead: Lead, stage: LeadStage) {
        moveStage(lead.id, stage);
        toast.success(`Stage updated to ${stage}`);
    }

    function handleInlineAssign(lead: Lead, agent: string) {
        updateLead(lead.id, { assignedTo: agent });
        toast.success(`Reassigned to ${agent}`);
    }

    return (
        <div className="responsive-padding" style={{ flex: 1, padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 14, background: '#f1f5f9' }}>

            {/* Page header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0d1b2e' }}>All Leads Directory</h1>
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>System-wide lead management</p>
                </div>
            </div>

            {/* Filters row */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8eef4', padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: '1 1 180px' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search name, phone…"
                        style={{ width: '100%', padding: '7px 10px 7px 30px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }} />
                </div>

                <select value={stageFilter} onChange={e => setStageFilter(e.target.value as LeadStage | 'All')}
                    style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0d1b2e' }}>
                    <option value="All">All Stages</option>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select value={assignedFilter} onChange={e => setAssignedFilter(e.target.value)}
                    style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0d1b2e' }}>
                    <option value="All">All Agents</option>
                    {salesEmps.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                </select>

                <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)}
                    style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0d1b2e' }}>
                    <option value="All">All Areas</option>
                    {useSettingsStore().areas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>

                <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
                    style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0d1b2e' }}>
                    <option value="All">All Sources</option>
                    {sources.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <span style={{ marginLeft: 'auto', fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{filtered.length} matching leads</span>
            </div>

            {/* Bulk action bar */}
            {selectedIds.length > 0 && (
                <div style={{ background: '#0d1b2e', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{selectedIds.length} selected</span>

                    <div style={{ height: 24, width: 1, background: 'rgba(255,255,255,0.2)' }} />

                    <select value={bulkStage} onChange={e => setBulkStage(e.target.value as LeadStage)}
                        style={{ padding: '5px 10px', borderRadius: 7, border: 'none', fontSize: 13, color: '#0d1b2e' }}>
                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={handleBulkMove}
                        style={{ padding: '6px 14px', borderRadius: 7, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                        Set Stage
                    </button>

                    <div style={{ height: 24, width: 1, background: 'rgba(255,255,255,0.2)' }} />

                    <select value={bulkAssign} onChange={e => setBulkAssign(e.target.value)}
                        style={{ padding: '5px 10px', borderRadius: 7, border: 'none', fontSize: 13, color: '#0d1b2e' }}>
                        <option value="">Reassign to...</option>
                        {salesEmps.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                    </select>
                    <button onClick={handleBulkReassign} disabled={!bulkAssign}
                        style={{ padding: '6px 14px', borderRadius: 7, background: bulkAssign ? '#059669' : 'rgba(255,255,255,0.1)', color: bulkAssign ? '#fff' : 'rgba(255,255,255,0.4)', border: 'none', cursor: bulkAssign ? 'pointer' : 'default', fontSize: 13, fontWeight: 700 }}>
                        Reassign
                    </button>

                    <button onClick={() => setSelectedIds([])}
                        style={{ marginLeft: 'auto', padding: '6px 12px', borderRadius: 7, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13 }}>
                        Clear Selection
                    </button>
                </div>
            )}

            {/* Table */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8eef4', overflow: 'hidden' }}>
                {filtered.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
                        No leads match your filters.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8eef4' }}>
                                    <th style={{ padding: '11px 14px', width: 36 }}>
                                        <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
                                    </th>
                                    {['Lead', 'Area/Budget', 'Stage', 'Assigned To', 'Source', 'Activity', 'Actions'].map(col => (
                                        <th key={col} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(lead => (
                                    <tr key={lead.id}
                                        onClick={() => router.push(`/admin/leads/${lead.id}`)}
                                        style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.12s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                                        {/* Checkbox */}
                                        <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                                            <input type="checkbox" checked={selectedIds.includes(lead.id)} onChange={() => toggleSelect(lead.id)} />
                                        </td>

                                        {/* Lead */}
                                        <td style={{ padding: '12px 14px' }}>
                                            <div style={{ fontWeight: 700, color: '#0d1b2e', fontSize: 13.5 }}>{lead.name}</div>
                                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, fontFamily: 'monospace' }}>+91 {lead.phone}</div>
                                        </td>

                                        {/* Area/Budget */}
                                        <td style={{ padding: '12px 14px' }}>
                                            <div style={{ color: '#0d1b2e', fontWeight: 600, fontSize: 13 }}>{lead.preferredArea || '—'}</div>
                                            <div style={{ color: '#64748b', fontSize: 12 }}>{lead.budget ? `₹${lead.budget.toLocaleString('en-IN')}` : '—'}</div>
                                        </td>

                                        {/* Stage */}
                                        <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                                            <select value={lead.stage} onChange={e => handleInlineStage(lead, e.target.value as LeadStage)}
                                                style={{
                                                    appearance: 'none', border: `1.5px solid ${stageColor[lead.stage].text}44`,
                                                    background: stageColor[lead.stage].bg, color: stageColor[lead.stage].text,
                                                    borderRadius: 99, padding: '4px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', outline: 'none',
                                                }}>
                                                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>

                                        {/* Assigned To */}
                                        <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                                            <select value={lead.assignedTo} onChange={e => handleInlineAssign(lead, e.target.value)}
                                                style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #e8eef4', fontSize: 12, outline: 'none', color: '#0d1b2e', fontWeight: 600, cursor: 'pointer' }}>
                                                {salesEmps.map(emp => <option key={emp.id} value={emp.name}>{emp.name}</option>)}
                                            </select>
                                        </td>

                                        {/* Source */}
                                        <td style={{ padding: '12px 14px' }}>
                                            <div style={{ fontSize: 12, color: '#64748b', background: '#f8fafc', padding: '3px 8px', borderRadius: 6, display: 'inline-block', border: '1px solid #e8eef4' }}>
                                                {lead.source}
                                            </div>
                                        </td>

                                        {/* Activity */}
                                        <td style={{ padding: '12px 14px' }}>
                                            <span style={{ fontSize: 12, color: '#475569' }}>
                                                {relativeTime(lead.lastActivity)}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <a href={`tel:${lead.phone}`} title="Call"
                                                    style={{ width: 30, height: 30, borderRadius: 7, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', textDecoration: 'none' }}>
                                                    <Phone size={13} />
                                                </a>
                                                <a href={`https://wa.me/91${lead.phone}`} target="_blank" rel="noreferrer" title="WhatsApp"
                                                    style={{ width: 30, height: 30, borderRadius: 7, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', textDecoration: 'none' }}>
                                                    <MessageCircle size={13} />
                                                </a>
                                                <button onClick={() => router.push(`/admin/leads/${lead.id}`)} title="View"
                                                    style={{ width: 30, height: 30, borderRadius: 7, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', cursor: 'pointer' }}>
                                                    <Eye size={13} />
                                                </button>
                                                <button onClick={() => setDeleteId(lead.id)} title="Delete"
                                                    style={{ width: 30, height: 30, borderRadius: 7, background: '#fef2f2', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', cursor: 'pointer' }}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmModal
                open={!!deleteId}
                title="Delete Lead"
                message={`Are you sure you want to delete ${leads.find(l => l.id === deleteId)?.name}? This cannot be undone.`}
                confirmLabel="Delete"
                danger
                onConfirm={() => deleteId && handleDelete(deleteId)}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
}
