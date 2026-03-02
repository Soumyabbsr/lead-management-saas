import { create } from 'zustand';
import api from '@/lib/apiClient';
import { Lead, LeadStage } from '@/types/lead';
import { Note, ActivityEvent, FollowUp, VisitSchedule, BookingDetails } from '@/types/activity';

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

interface LeadStore {
    leads: Lead[];
    selectedStage: LeadStage | null;
    showOverdueOnly: boolean;
    selectedIds: string[];
    isLoading: boolean;
    error: string | null;

    fetchLeads: () => Promise<void>;
    addLead: (lead: Omit<Lead, 'id' | 'notes' | 'timeline' | 'lastActivity'>) => Promise<void>;
    deleteLead: (leadId: string) => Promise<void>;
    updateLead: (leadId: string, data: Partial<Lead>) => Promise<void>;

    moveStage: (leadId: string, stage: LeadStage) => Promise<void>;
    bulkMoveStage: (ids: string[], stage: LeadStage) => Promise<void>;

    markVisitDone: (leadId: string) => Promise<void>;
    scheduleVisit: (leadId: string, visitSchedule: VisitSchedule) => Promise<void>;
    scheduleFollowUp: (leadId: string, followUp: FollowUp) => Promise<void>;
    markFollowUpDone: (leadId: string) => Promise<void>;

    addNote: (leadId: string, text: string) => Promise<void>;

    setBookingDetails: (leadId: string, details: BookingDetails) => Promise<void>;

    filterByStage: (stage: LeadStage | null) => void;
    filterOverdue: () => void;
    clearFilters: () => void;

    selectLead: (id: string) => void;
    deselectLead: (id: string) => void;
    selectAll: (ids: string[]) => void;
    clearSelection: () => void;

    getLeadById: (id: string) => Lead | undefined;
    getFilteredLeads: () => Lead[];
    getOverdueLeads: () => Lead[];
    getTodayVisits: () => Lead[];
    getConversionRate: () => number;
}

export const useLeadStore = create<LeadStore>((set, get) => ({
    leads: [],
    selectedStage: null,
    showOverdueOnly: false,
    selectedIds: [],
    isLoading: false,
    error: null,

    fetchLeads: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get('/leads');
            const leads = res.data.data.map((l: any) => {
                // assignedTo comes back as a populated object { _id, name, email } from the backend
                const assignedToName = typeof l.assignedTo === 'object' && l.assignedTo !== null
                    ? l.assignedTo.name
                    : l.assignedTo || '';
                return {
                    ...l,
                    id: l._id,
                    assignedTo: assignedToName,
                    // Map MongoDB Activity fields to frontend timeline fields
                    timeline: (l.activities || []).map((a: any) => ({
                        id: a._id,
                        type: a.type.toLowerCase(),
                        text: a.description,
                        timestamp: a.createdAt,
                        by: a.performedBy?.name || 'Unknown'
                    })),
                    // Keep notes separately if needed elsewhere, though timeline covers it
                    notes: (l.activities || []).filter((a: any) => a.type === 'NOTE_ADDED').map((a: any) => ({
                        id: a._id,
                        text: a.description?.replace('Note: ', '') || a.description || '',
                        createdAt: a.createdAt,
                        by: a.performedBy?.name || 'Unknown'
                    }))
                };
            });
            set({ leads, isLoading: false });
        } catch (err: any) {
            set({ error: err.response?.data?.message || 'Failed to fetch leads', isLoading: false });
        }
    },

    addLead: async (leadData) => {
        try {
            await api.post('/leads', leadData);
            await get().fetchLeads(); // Refresh complete list
        } catch (err: any) {
            console.error(err);
            throw err;
        }
    },

    deleteLead: async (leadId) => {
        try {
            await api.delete(`/leads/${leadId}`);
            set(s => ({ leads: s.leads.filter(l => l.id !== leadId) }));
        } catch (err: any) {
            console.error(err);
            throw err;
        }
    },

    updateLead: async (leadId, data) => {
        try {
            // Remap assigning logic
            let payload: any = { ...data };
            if (payload.assignedTo && typeof payload.assignedTo === 'object') {
                payload.assignedTo = payload.assignedTo._id || payload.assignedTo.id;
            }
            if (payload.id) delete payload.id;

            await api.put(`/leads/${leadId}`, payload);
            await get().fetchLeads(); // Refresh to catch new activities & population
        } catch (err: any) {
            console.error(err);
            throw err;
        }
    },

    moveStage: async (leadId, stage) => {
        try {
            // Optimistic Update
            set(s => ({
                leads: s.leads.map(l => l.id === leadId ? { ...l, stage } : l)
            }));

            await api.put(`/leads/${leadId}`, { stage });
            await get().fetchLeads();
        } catch (err: any) {
            console.error(err);
            throw err;
        }
    },

    bulkMoveStage: async (ids, stage) => {
        try {
            await Promise.all(ids.map(id => api.put(`/leads/${id}`, { stage })));
            await get().fetchLeads();
        } catch (err: any) {
            console.error(err);
            throw err;
        }
    },

    markVisitDone: async (leadId) => {
        try {
            await api.put(`/leads/${leadId}`, { visitStatus: 'Done' });
            await get().fetchLeads();
        } catch (err: any) {
            console.error(err);
            throw err;
        }
    },

    scheduleVisit: async (leadId, visitSchedule) => {
        try {
            const iso = new Date(`${visitSchedule.date}T${visitSchedule.time}`).toISOString();
            await api.put(`/leads/${leadId}`, {
                stage: 'Visit',
                visitDate: iso,
                visitStatus: 'Confirmed',
                visitSchedule
            });
            await get().fetchLeads();
        } catch (err: any) {
            console.error(err);
            throw err;
        }
    },

    scheduleFollowUp: async (leadId, followUp) => {
        try {
            const iso = new Date(`${followUp.date}T${followUp.time}`).toISOString();
            await api.put(`/leads/${leadId}`, {
                followUpDue: iso,
                followUp
            });
            await get().fetchLeads();
        } catch (err: any) {
            console.error(err);
            throw err;
        }
    },

    markFollowUpDone: async (leadId) => {
        try {
            const now = new Date().toISOString();
            // Optimistic Update: clear followUpDue, set lastActivity
            set(s => ({
                leads: s.leads.map(l => l.id === leadId ? { ...l, followUpDue: null, lastActivity: now } : l)
            }));

            await api.put(`/leads/${leadId}`, { followUpDue: null, lastActivity: now });
            await get().fetchLeads();
        } catch (err: any) {
            console.error(err);
            throw err;
        }
    },

    addNote: async (leadId, text) => {
        try {
            await api.post(`/leads/${leadId}/notes`, { noteText: text });
            await get().fetchLeads();
        } catch (err: any) {
            console.error(err);
            throw err;
        }
    },

    setBookingDetails: async (leadId, details) => {
        try {
            await api.put(`/leads/${leadId}`, {
                stage: 'Booked',
                bookingDetails: details
            });
            await get().fetchLeads();
        } catch (err: any) {
            console.error(err);
            throw err;
        }
    },

    filterByStage: (stage) => set({ selectedStage: stage, showOverdueOnly: false }),
    filterOverdue: () => set({ showOverdueOnly: true, selectedStage: null }),
    clearFilters: () => set({ selectedStage: null, showOverdueOnly: false }),

    selectLead: (id) => set(s => ({ selectedIds: s.selectedIds.includes(id) ? s.selectedIds : [...s.selectedIds, id] })),
    deselectLead: (id) => set(s => ({ selectedIds: s.selectedIds.filter(x => x !== id) })),
    selectAll: (ids) => set({ selectedIds: ids }),
    clearSelection: () => set({ selectedIds: [] }),

    getLeadById: (id) => get().leads.find(l => l.id === id),

    getFilteredLeads: () => {
        const { leads, selectedStage, showOverdueOnly } = get();
        let res = [...leads];
        if (selectedStage) res = res.filter(l => l.stage === selectedStage);
        if (showOverdueOnly) {
            const now = Date.now();
            res = res.filter(l => l.lastActivity && now - new Date(l.lastActivity).getTime() > TWENTY_FOUR_HOURS);
        }
        return res;
    },

    getOverdueLeads: () => {
        const now = Date.now();
        return get().leads.filter(l => l.lastActivity && now - new Date(l.lastActivity).getTime() > TWENTY_FOUR_HOURS);
    },

    getTodayVisits: () => {
        const today = new Date().toISOString().slice(0, 10);
        return get().leads.filter(l => l.stage === 'Visit' && l.visitDate && l.visitDate.toString().slice(0, 10) === today);
    },

    getConversionRate: () => {
        const { leads } = get();
        const booked = leads.filter(l => l.stage === 'Booked').length;
        return leads.length > 0 ? Math.round((booked / leads.length) * 100) : 0;
    },
}));
