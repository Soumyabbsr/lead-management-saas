/**
 * API Layer — lib/api.ts
 *
 * All components MUST call these functions instead of importing mock data directly.
 * To connect a real backend, replace the mock data imports with fetch() calls to:
 *   GET    /api/leads
 *   POST   /api/leads
 *   PATCH  /api/leads/:id
 *   GET    /api/dashboard/metrics
 *   GET    /api/visits/today
 *   GET    /api/leads/overdue
 */

import { Lead, LeadStage } from '@/types/lead';
import { mockLeads, BOOKING_TARGET, TEAM_RANK, TOTAL_TEAMS } from '@/lib/mockData';

// Simulate async API delay (remove in production)
const delay = <T>(data: T): Promise<T> => Promise.resolve(data);

// ────────────────────────────────────────────────────────────
// LEADS
// ────────────────────────────────────────────────────────────

export async function getLeads(): Promise<Lead[]> {
    // Future: return fetch('/api/leads').then(r => r.json())
    return delay([...mockLeads]);
}

export async function createLead(lead: Omit<Lead, 'id'>): Promise<Lead> {
    const newLead: Lead = { ...lead, id: `L${Date.now()}` };
    // Future: return fetch('/api/leads', { method:'POST', body: JSON.stringify(lead) }).then(r=>r.json())
    return delay(newLead);
}

export async function updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
    const lead = mockLeads.find(l => l.id === id);
    if (!lead) throw new Error(`Lead ${id} not found`);
    const updated = { ...lead, ...data };
    // Future: return fetch(`/api/leads/${id}`, { method:'PATCH', body: JSON.stringify(data) }).then(r=>r.json())
    return delay(updated);
}

// ────────────────────────────────────────────────────────────
// DASHBOARD METRICS
// ────────────────────────────────────────────────────────────

export interface DashboardMetrics {
    hotLeads: number;
    newLeads: number;
    todayFollowUps: number;
    visitStage: number;
    negotiationStage: number;
    bookingClosed: number;
    bookingsThisMonth: number;
    bookingTarget: number;
    conversionRate: number;
    teamRank: number;
    totalTeams: number;
    totalLeads: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const hotLeads = mockLeads.filter(l =>
        l.stage === 'Negotiation' || l.stage === 'Visit'
    ).length;

    const newLeads = mockLeads.filter(l => l.stage === 'New').length;

    const todayFollowUps = mockLeads.filter(l => {
        if (!l.followUpDue) return false;
        return l.followUpDue.slice(0, 10) === todayStr;
    }).length;

    const visitStage = mockLeads.filter(l => l.stage === 'Visit').length;
    const negotiationStage = mockLeads.filter(l => l.stage === 'Negotiation').length;
    const bookingClosed = mockLeads.filter(l => l.stage === 'Booked').length;

    const totalLeads = mockLeads.length;
    const conversionRate = Math.round((bookingClosed / totalLeads) * 100);

    return delay({
        hotLeads,
        newLeads,
        todayFollowUps,
        visitStage,
        negotiationStage,
        bookingClosed,
        bookingsThisMonth: bookingClosed,
        bookingTarget: BOOKING_TARGET,
        conversionRate,
        teamRank: TEAM_RANK,
        totalTeams: TOTAL_TEAMS,
        totalLeads,
    });
}

// ────────────────────────────────────────────────────────────
// TODAY'S VISITS
// ────────────────────────────────────────────────────────────

export async function getTodayVisits(): Promise<Lead[]> {
    const todayStr = new Date().toISOString().slice(0, 10);
    const visits = mockLeads.filter(l => {
        return l.stage === 'Visit' && l.visitDate && l.visitDate.slice(0, 10) === todayStr;
    });
    // Future: return fetch('/api/visits/today').then(r => r.json())
    return delay(visits);
}

// ────────────────────────────────────────────────────────────
// OVERDUE LEADS (no activity > 24 hours)
// ────────────────────────────────────────────────────────────

export async function getOverdueLeads(): Promise<Lead[]> {
    const now = Date.now();
    const twentyFourHrs = 24 * 60 * 60 * 1000;
    const overdue = mockLeads.filter(l => {
        const lastAct = new Date(l.lastActivity).getTime();
        return now - lastAct > twentyFourHrs;
    });
    // Future: return fetch('/api/leads/overdue').then(r => r.json())
    return delay(overdue);
}

// ────────────────────────────────────────────────────────────
// PIPELINE STAGE FILTER
// ────────────────────────────────────────────────────────────

export async function getLeadsByStage(stage: LeadStage): Promise<Lead[]> {
    return delay(mockLeads.filter(l => l.stage === stage));
}

// ────────────────────────────────────────────────────────────
// CONVERSION FUNNEL
// ────────────────────────────────────────────────────────────

export interface FunnelData {
    totalLeads: number;
    visits: number;
    negotiation: number;
    confirmed: number;
    visitRate: number;
    negotiationRate: number;
    confirmationRate: number;
}

export async function getConversionFunnel(): Promise<FunnelData> {
    const total = mockLeads.length;
    const visits = mockLeads.filter(l =>
        ['Visit', 'Negotiation', 'Booked'].includes(l.stage)
    ).length;
    const negotiation = mockLeads.filter(l =>
        ['Negotiation', 'Booked'].includes(l.stage)
    ).length;
    const confirmed = mockLeads.filter(l => l.stage === 'Booked').length;

    return delay({
        totalLeads: total,
        visits,
        negotiation,
        confirmed,
        visitRate: Math.round((visits / total) * 100),
        negotiationRate: Math.round((negotiation / visits) * 100),
        confirmationRate: Math.round((confirmed / negotiation) * 100),
    });
}
