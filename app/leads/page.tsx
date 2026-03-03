'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLeadStore } from '@/store/useLeadStore';
import { useMyLeads } from '@/hooks/useMyLeads';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Lead, LeadStage } from '@/types/lead';
import TopBar from '@/components/ui/TopBar';
import AddLeadModal from '@/components/leads/AddLeadModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Phone, MessageCircle, Eye, Trash2, Plus, Search, Clock, ChevronDown, LayoutList, KanbanSquare } from 'lucide-react';
import { useEmployeeStore } from '@/store/useEmployeeStore';
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

export default function LeadsPage() {
    const router = useRouter();
    const toast = useToast();
    const { currentUser } = useAuth();

    const myLeads = useMyLeads();
    const moveStage = useLeadStore(s => s.moveStage);
    const deleteLead = useLeadStore(s => s.deleteLead);
    const bulkMoveStage = useLeadStore(s => s.bulkMoveStage);
    const leads = useLeadStore(s => s.leads);
    const filterByStage = useLeadStore(s => s.filterByStage);
    const employees = useEmployeeStore(s => s.employees);

    const salesAgents = employees.filter(e => e.role === 'sales').map(e => e.name);
    const selectedIds = useLeadStore(s => s.selectedIds);
    const selectLead = useLeadStore(s => s.selectLead);
    const deselectLead = useLeadStore(s => s.deselectLead);
    const selectAll = useLeadStore(s => s.selectAll);
    const clearSelection = useLeadStore(s => s.clearSelection);

    const [search, setSearch] = useState('');
    const [stageFilter, setStageFilter] = useState<LeadStage | 'All'>('All');
    const [agentFilter, setAgentFilter] = useState('All Agents');
    const [areaFilter, setAreaFilter] = useState('All');
    const [noActivityFilter, setNoActivityFilter] = useState(false);
    const [overdueFilter, setOverdueFilter] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [bulkStage, setBulkStage] = useState<LeadStage>('Contacted');

    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

    function handleDragStart(e: React.DragEvent, id: string) {
        setDraggedLeadId(id);
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(e: React.DragEvent, newStage: LeadStage) {
        e.preventDefault();
        if (draggedLeadId) {
            const lead = leads.find(l => l.id === draggedLeadId);
            if (lead && lead.stage !== newStage) {
                moveStage(draggedLeadId, newStage);
                toast.success(`Moved to ${newStage}`);
            }
        }
        setDraggedLeadId(null);
    }

    const filtered = useMemo(() => {
        return leads.filter(l => {
            if (search) {
                const q = search.toLowerCase();
                if (!l.name.toLowerCase().includes(q) && !l.phone.includes(q) && !(l.preferredArea?.toLowerCase().includes(q))) return false;
            }
            if (stageFilter !== 'All' && l.stage !== stageFilter) return false;
            if (agentFilter !== 'All Agents' && l.assignedTo !== agentFilter) return false;
            if (areaFilter !== 'All' && l.preferredArea !== areaFilter) return false;
            if (noActivityFilter && hoursAgo(l.lastActivity) <= 24) return false;
            if (overdueFilter && !(l.followUpDue && new Date(l.followUpDue) < new Date())) return false;
            return true;
        });
    }, [leads, search, stageFilter, agentFilter, areaFilter, noActivityFilter, overdueFilter]);

    function toggleSelect(id: string) {
        selectedIds.includes(id) ? deselectLead(id) : selectLead(id);
    }
    function toggleSelectAll() {
        if (selectedIds.length === filtered.length) clearSelection();
        else selectAll(filtered.map(l => l.id));
    }

    function handleBulkMove() {
        if (!selectedIds.length) return;
        bulkMoveStage(selectedIds, bulkStage);
        toast.success(`${selectedIds.length} leads moved to ${bulkStage}`);
        clearSelection();
    }

    function handleDelete(id: string) {
        deleteLead(id);
        setDeleteId(null);
        toast.success('Lead deleted');
    }

    function handleInlineStage(lead: Lead, stage: LeadStage) {
        moveStage(lead.id, stage);
        toast.success(`Stage updated to ${stage}`);
    }

    return (
        <>
            <TopBar />
            <div className="responsive-padding" style={{ flex: 1, padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 14, background: '#f1f5f9', minHeight: 0 }}>

                {/* Page header */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0d1b2e' }}>My Leads</h1>
                        <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#64748b' }}>{leads.length} leads · {currentUser.name} · Areas: {currentUser.assignedAreas.join(', ')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: 10, padding: 4 }}>
                            <button onClick={() => setViewMode('list')} style={{ background: viewMode === 'list' ? '#fff' : 'transparent', color: viewMode === 'list' ? '#0d1b2e' : '#64748b', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <LayoutList size={14} /> List
                            </button>
                            <button onClick={() => setViewMode('board')} style={{ background: viewMode === 'board' ? '#fff' : 'transparent', color: viewMode === 'board' ? '#0d1b2e' : '#64748b', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <KanbanSquare size={14} /> Board
                            </button>
                        </div>
                        <button onClick={() => setShowAddModal(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 10, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 700 }}>
                            <Plus size={16} /> Add Lead
                        </button>
                    </div>
                </div>

                {/* Filters row */}
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8eef4', padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Search */}
                    <div style={{ position: 'relative', flex: '1 1 180px' }}>
                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search name, phone, area…"
                            style={{ width: '100%', padding: '7px 10px 7px 30px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const }} />
                    </div>

                    {/* Stage filter */}
                    <select value={stageFilter} onChange={e => setStageFilter(e.target.value as LeadStage | 'All')}
                        style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0d1b2e' }}>
                        <option value="All">All Stages</option>
                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <div style={{ position: 'relative' }}>
                        <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} style={{ appearance: 'none', padding: '10px 36px 10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', fontSize: 13, outline: 'none', color: '#0d1b2e', minWidth: 160, cursor: 'pointer' }}>
                            <option value="All Agents">All Agents</option>
                            {salesAgents.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                    <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)}
                        style={{ padding: '7px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', color: '#0d1b2e' }}>
                        <option value="All">All Areas</option>
                        {useSettingsStore().areas.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>

                    {/* Toggle filters */}
                    <button onClick={() => setNoActivityFilter(p => !p)}
                        style={{ padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${noActivityFilter ? '#ef4444' : '#e2e8f0'}`, background: noActivityFilter ? '#fef2f2' : '#f8fafc', color: noActivityFilter ? '#ef4444' : '#64748b', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={13} /> No Activity 24h
                    </button>
                    <button onClick={() => setOverdueFilter(p => !p)}
                        style={{ padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${overdueFilter ? '#f97316' : '#e2e8f0'}`, background: overdueFilter ? '#fff7ed' : '#f8fafc', color: overdueFilter ? '#f97316' : '#64748b', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
                        Overdue Follow-up
                    </button>

                    <span style={{ marginLeft: 'auto', fontSize: 12.5, color: '#94a3b8', whiteSpace: 'nowrap' }}>{filtered.length} results</span>
                </div>

                {/* Bulk action bar (only in list view) */}
                {viewMode === 'list' && selectedIds.length > 0 && (
                    <div style={{ background: '#0d1b2e', borderRadius: 10, padding: '10px 16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
                        <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{selectedIds.length} selected</span>
                        <select value={bulkStage} onChange={e => setBulkStage(e.target.value as LeadStage)}
                            style={{ padding: '5px 10px', borderRadius: 7, border: 'none', fontSize: 13, color: '#0d1b2e' }}>
                            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={handleBulkMove}
                            style={{ padding: '6px 16px', borderRadius: 7, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                            Move Stage
                        </button>
                        <button onClick={clearSelection}
                            style={{ padding: '6px 12px', borderRadius: 7, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13 }}>
                            Clear
                        </button>
                    </div>
                )}

                {/* List View / Board View */}
                {viewMode === 'board' ? (
                    <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 10, flex: 1, minHeight: 0 }}>
                        {STAGES.map(stage => {
                            const stageLeads = filtered.filter(l => l.stage === stage);
                            return (
                                <div key={stage}
                                    onDragOver={handleDragOver}
                                    onDrop={e => handleDrop(e, stage)}
                                    style={{ flex: '0 0 300px', display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', padding: 12 }}>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px 8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: stageColor[stage].text }} />
                                            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0d1b2e' }}>{stage}</h3>
                                        </div>
                                        <div style={{ background: '#e2e8f0', color: '#475569', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
                                            {stageLeads.length}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflowY: 'auto' }}>
                                        {stageLeads.map(lead => (
                                            <div key={lead.id}
                                                draggable
                                                onDragStart={e => handleDragStart(e, lead.id)}
                                                onClick={() => router.push(`/leads/${lead.id}`)}
                                                style={{ background: '#fff', padding: 14, borderRadius: 10, border: '1px solid #e8eef4', cursor: 'grab', display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
                                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'}
                                                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'}>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div style={{ fontWeight: 700, color: '#0d1b2e', fontSize: 13.5 }}>{lead.name}</div>
                                                    <span title="Overdue activity">{hoursAgo(lead.lastActivity) > 24 && <Clock size={12} color="#f97316" />}</span>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12, fontFamily: 'monospace' }}>
                                                    <Phone size={12} /> {lead.phone}
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                                    <div style={{ color: '#0d1b2e', fontWeight: 600, fontSize: 11.5, background: '#f1f5f9', padding: '3px 8px', borderRadius: 6 }}>
                                                        {lead.preferredArea || 'Any Area'}
                                                    </div>
                                                    <div style={{ color: '#94a3b8', fontSize: 11 }}>
                                                        {lead.budget ? `₹${(lead.budget / 1000).toFixed(0)}k` : 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
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
                                            <th className="mobile-hidden" style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>Contact</th>
                                            <th className="mobile-hidden" style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>Requirement</th>
                                            <th style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>Stage</th>
                                            <th className="mobile-hidden" style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>Last Activity</th>
                                            <th className="mobile-hidden" style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>Assigned To</th>
                                            <th style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(lead => {
                                            const hrs = hoursAgo(lead.lastActivity);
                                            const isOverdue24 = hrs > 24;
                                            const isOverdue48 = hrs > 48;
                                            const rowBg = isOverdue48 ? '#fff5f5' : isOverdue24 ? '#fffbf0' : 'transparent';
                                            return (
                                                <tr key={lead.id}
                                                    onClick={() => router.push(`/leads/${lead.id}`)}
                                                    style={{ borderBottom: '1px solid #f1f5f9', background: rowBg, cursor: 'pointer', transition: 'background 0.12s' }}
                                                    onMouseEnter={e => { if (!isOverdue48 && !isOverdue24) e.currentTarget.style.background = '#f8fafc'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = rowBg; }}>

                                                    {/* Checkbox */}
                                                    <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                                                        <input type="checkbox" checked={selectedIds.includes(lead.id)} onChange={() => toggleSelect(lead.id)} />
                                                    </td>

                                                    {/* Lead Name */}
                                                    <td style={{ padding: '12px 14px' }} onClick={() => router.push(`/leads/${lead.id}`)}>
                                                        <div style={{ fontWeight: 700, color: '#0d1b2e' }}>{lead.name}</div>
                                                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{lead.source}</div>
                                                    </td>

                                                    {/* Contact */}
                                                    <td className="mobile-hidden" style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 12.5, color: '#475569' }}>
                                                        +91 {lead.phone}
                                                    </td>

                                                    {/* Requirement */}
                                                    <td className="mobile-hidden" style={{ padding: '12px 14px' }}>
                                                        <div style={{ color: '#0d1b2e', fontWeight: 600, fontSize: 12.5 }}>{lead.preferredArea || '—'}</div>
                                                        <div style={{ color: '#64748b', fontSize: 12 }}>{lead.budget ? `₹${lead.budget.toLocaleString('en-IN')}` : 'Budget N/A'}</div>
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

                                                    {/* Last Activity */}
                                                    <td className="mobile-hidden" style={{ padding: '12px 14px' }}>
                                                        <span style={{ fontSize: 12.5, color: isOverdue48 ? '#ef4444' : isOverdue24 ? '#f97316' : '#475569', fontWeight: isOverdue24 ? 700 : 400 }}>
                                                            {isOverdue24 && '⚠ '}{relativeTime(lead.lastActivity)}
                                                        </span>
                                                    </td>

                                                    {/* Assigned */}
                                                    <td className="mobile-hidden" style={{ padding: '12px 14px', color: '#64748b', fontSize: 12.5 }}>{lead.assignedTo}</td>

                                                    {/* Actions */}
                                                    <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                                                        <div style={{ display: 'flex', gap: 4 }}>
                                                            <a href={`tel:${lead.phone}`} title="Call"
                                                                style={{ width: 30, height: 30, borderRadius: 7, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', textDecoration: 'none' }}>
                                                                <Phone size={14} color="#2563eb" />
                                                            </a>
                                                            <a href={`https://wa.me/91${lead.phone}`} target="_blank" rel="noreferrer" title="WhatsApp"
                                                                style={{ width: 30, height: 30, borderRadius: 7, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', textDecoration: 'none' }}>
                                                                <MessageCircle size={13} />
                                                            </a>
                                                            <button onClick={() => router.push(`/leads/${lead.id}`)} title="View"
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
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div >

            <AddLeadModal open={showAddModal} onClose={() => setShowAddModal(false)} />

            <ConfirmModal
                open={!!deleteId}
                title="Delete Lead"
                message={`Are you sure you want to delete ${leads.find(l => l.id === deleteId)?.name}? This cannot be undone.`}
                confirmLabel="Delete"
                danger
                onConfirm={() => deleteId && handleDelete(deleteId)}
                onCancel={() => setDeleteId(null)}
            />
        </>
    );
}
