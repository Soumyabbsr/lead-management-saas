import { Lead } from '@/types/lead';
import { ActivityEvent, Note } from '@/types/activity';

// Today = 2026-03-01 (IST)
const today = new Date('2026-03-01T13:00:00.000Z');

function daysAgo(days: number, extraHours = 0): string {
    const d = new Date(today);
    d.setHours(d.getHours() - days * 24 - extraHours);
    return d.toISOString();
}
function todayAt(hour: number): string {
    const d = new Date(today);
    d.setUTCHours(hour - 5, 30, 0, 0);
    return d.toISOString();
}
function tomorrowAt(hour: number): string {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + 1);
    d.setUTCHours(hour - 5, 30, 0, 0);
    return d.toISOString();
}

function makeTimeline(stage: string, name: string): ActivityEvent[] {
    return [
        { id: `ev-${Math.random()}`, type: 'created', text: `Lead created`, timestamp: daysAgo(7), by: 'System' },
        { id: `ev-${Math.random()}`, type: 'call', text: `Called ${name}, discussed requirements`, timestamp: daysAgo(4), by: 'Riya Sharma' },
        ...(stage !== 'New' ? [{ id: `ev-${Math.random()}`, type: 'stage_change' as const, text: `Stage moved to ${stage}`, timestamp: daysAgo(2), by: 'Riya Sharma' }] : []),
    ];
}

function makeNote(text: string): Note[] {
    return [{ id: `note-${Math.random()}`, text, createdAt: daysAgo(2), by: 'Riya Sharma' }];
}

export const mockLeads: Lead[] = [
    // ── NEW ──────────────────────────────────────────────────────
    {
        id: 'L001', name: 'Aarav Mehta', phone: '9876543210', whatsapp: '9876543210',
        preferredArea: 'Koramangala', budget: 12000, stage: 'New',
        lastActivity: daysAgo(0, 2), assignedTo: 'Riya Sharma',
        followUpDue: tomorrowAt(10), visitDate: null, visitStatus: 'Pending',
        source: 'Facebook', propertyType: 'PG', genderRequirement: 'Boys',
        notes: makeNote('Interested in AC room, sharing okay'),
        timeline: makeTimeline('New', 'Aarav Mehta'),
        followUp: { date: '2026-03-02', time: '10:00', note: 'Check room availability', done: false, scheduledAt: daysAgo(1) },
    },
    {
        id: 'L002', name: 'Sneha Kapoor', phone: '9123456780',
        preferredArea: 'Indiranagar', budget: 9500, stage: 'New',
        lastActivity: daysAgo(2), assignedTo: 'Amit Joshi',
        followUpDue: todayAt(14), visitDate: null, visitStatus: 'Pending',
        source: 'Instagram', propertyType: 'PG', genderRequirement: 'Girls',
        notes: [], timeline: makeTimeline('New', 'Sneha Kapoor'),
    },
    {
        id: 'L003', name: 'Rohit Verma', phone: '9988776655',
        preferredArea: null, budget: null, stage: 'New',
        lastActivity: daysAgo(1, 6), assignedTo: 'Riya Sharma',
        followUpDue: todayAt(16), visitDate: null, visitStatus: 'Pending',
        source: 'Cold Call', propertyType: 'Not Decided', genderRequirement: 'Boys',
        notes: [], timeline: makeTimeline('New', 'Rohit Verma'),
    },
    {
        id: 'L004', name: 'Priya Nair', phone: '9812345678',
        preferredArea: 'HSR Layout', budget: 11000, stage: 'New',
        lastActivity: daysAgo(3), assignedTo: 'Karan Singh',
        followUpDue: tomorrowAt(11), visitDate: null, visitStatus: 'Pending',
        source: 'Reference', propertyType: 'Coliving', genderRequirement: 'Girls',
        notes: makeNote('Referred by existing tenant'), timeline: makeTimeline('New', 'Priya Nair'),
    },
    {
        id: 'L005', name: 'Arjun Das', phone: '9654321098',
        preferredArea: 'Whitefield', budget: 8000, stage: 'New',
        lastActivity: daysAgo(0, 1), assignedTo: 'Amit Joshi',
        followUpDue: tomorrowAt(9), visitDate: null, visitStatus: 'Pending',
        source: 'Portal', propertyType: 'PG', genderRequirement: 'Boys',
        notes: [], timeline: makeTimeline('New', 'Arjun Das'),
    },
    {
        id: 'L006', name: 'Kavya Iyer', phone: '9741236540',
        preferredArea: 'Marathahalli', budget: 10000, stage: 'New',
        lastActivity: daysAgo(5), assignedTo: 'Karan Singh',
        followUpDue: todayAt(15), visitDate: null, visitStatus: 'Pending',
        source: 'Walk-in', propertyType: 'PG', genderRequirement: 'Girls',
        notes: [], timeline: makeTimeline('New', 'Kavya Iyer'),
    },

    // ── CONTACTED ────────────────────────────────────────────────
    {
        id: 'L007', name: 'Rahul Gupta', phone: '9870123456',
        preferredArea: 'Koramangala', budget: 13000, stage: 'Contacted',
        lastActivity: daysAgo(1, 3), assignedTo: 'Riya Sharma',
        followUpDue: todayAt(17), visitDate: null, visitStatus: 'Pending',
        source: 'Facebook', propertyType: 'PG', genderRequirement: 'Boys',
        notes: [], timeline: makeTimeline('Contacted', 'Rahul Gupta'),
    },
    {
        id: 'L008', name: 'Divya Pillai', phone: '9560012345',
        preferredArea: 'BTM Layout', budget: 9000, stage: 'Contacted',
        lastActivity: daysAgo(2, 5), assignedTo: 'Amit Joshi',
        followUpDue: tomorrowAt(10), visitDate: null, visitStatus: 'Pending',
        source: 'Instagram', propertyType: 'Flat', genderRequirement: 'Girls',
        notes: [], timeline: makeTimeline('Contacted', 'Divya Pillai'),
    },
    {
        id: 'L009', name: 'Nikhil Rao', phone: '9432101234',
        preferredArea: null, budget: 8500, stage: 'Contacted',
        lastActivity: daysAgo(0, 30), assignedTo: 'Karan Singh',
        followUpDue: todayAt(13), visitDate: null, visitStatus: 'Pending',
        source: 'Cold Call', propertyType: 'PG', genderRequirement: 'Boys',
        notes: [], timeline: makeTimeline('Contacted', 'Nikhil Rao'),
    },
    {
        id: 'L010', name: 'Ananya Choudhary', phone: '9314560987',
        preferredArea: 'Electronic City', budget: 7500, stage: 'Contacted',
        lastActivity: daysAgo(4), assignedTo: 'Riya Sharma',
        followUpDue: todayAt(18), visitDate: null, visitStatus: 'Pending',
        source: 'Reference', propertyType: 'PG', genderRequirement: 'Girls',
        notes: [], timeline: makeTimeline('Contacted', 'Ananya Choudhary'),
    },
    {
        id: 'L011', name: 'Vikram Bose', phone: '9265478901',
        preferredArea: 'Jayanagar', budget: 11500, stage: 'Contacted',
        lastActivity: daysAgo(1), assignedTo: 'Amit Joshi',
        followUpDue: tomorrowAt(14), visitDate: null, visitStatus: 'Pending',
        source: 'Portal', propertyType: 'Coliving', genderRequirement: 'Boys',
        notes: [], timeline: makeTimeline('Contacted', 'Vikram Bose'),
    },
    {
        id: 'L012', name: 'Meera Krishnan', phone: '9187654321',
        preferredArea: 'Sarjapur', budget: 10500, stage: 'Contacted',
        lastActivity: daysAgo(3, 10), assignedTo: 'Karan Singh',
        followUpDue: todayAt(12), visitDate: null, visitStatus: 'Pending',
        source: 'Walk-in', propertyType: 'PG', genderRequirement: 'Girls',
        notes: [], timeline: makeTimeline('Contacted', 'Meera Krishnan'),
    },

    // ── VISIT ────────────────────────────────────────────────────
    {
        id: 'L013', name: 'Sameer Khan', phone: '9098765432',
        preferredArea: 'Koramangala', budget: 14000, stage: 'Visit',
        lastActivity: daysAgo(0, 3), assignedTo: 'Riya Sharma',
        followUpDue: null, visitDate: todayAt(10), visitStatus: 'Confirmed',
        source: 'Facebook', propertyType: 'PG', genderRequirement: 'Boys',
        notes: [], timeline: makeTimeline('Visit', 'Sameer Khan'),
        visitSchedule: { date: '2026-03-01', time: '10:00', fieldAgent: 'Rakesh Dada', status: 'Confirmed' },
    },
    {
        id: 'L014', name: 'Pooja Shetty', phone: '8976543210',
        preferredArea: 'Indiranagar', budget: 12500, stage: 'Visit',
        lastActivity: daysAgo(0, 4), assignedTo: 'Amit Joshi',
        followUpDue: null, visitDate: todayAt(13), visitStatus: 'Confirmed',
        source: 'Instagram', propertyType: 'PG', genderRequirement: 'Girls',
        notes: [], timeline: makeTimeline('Visit', 'Pooja Shetty'),
        visitSchedule: { date: '2026-03-01', time: '13:00', fieldAgent: 'Rakesh Dada', status: 'Confirmed' },
    },
    {
        id: 'L015', name: 'Deepak Jain', phone: '8765432109',
        preferredArea: 'HSR Layout', budget: null, stage: 'Visit',
        lastActivity: daysAgo(0, 6), assignedTo: 'Karan Singh',
        followUpDue: null, visitDate: todayAt(11), visitStatus: 'Pending',
        source: 'Reference', propertyType: 'PG', genderRequirement: 'Boys',
        notes: [], timeline: makeTimeline('Visit', 'Deepak Jain'),
        visitSchedule: { date: '2026-03-01', time: '11:00', fieldAgent: 'Suresh Kumar', status: 'Pending' },
    },
    {
        id: 'L016', name: 'Tanya Malhotra', phone: '8654321098',
        preferredArea: 'Whitefield', budget: 9000, stage: 'Visit',
        lastActivity: daysAgo(0, 8), assignedTo: 'Riya Sharma',
        followUpDue: null, visitDate: todayAt(15), visitStatus: 'Pending',
        source: 'Portal', propertyType: 'Flat', genderRequirement: 'Girls',
        notes: [], timeline: makeTimeline('Visit', 'Tanya Malhotra'),
        visitSchedule: { date: '2026-03-01', time: '15:00', fieldAgent: 'Rakesh Dada', status: 'Pending' },
    },
    {
        id: 'L017', name: 'Harish Patel', phone: '8543210987',
        preferredArea: 'Marathahalli', budget: 10000, stage: 'Visit',
        lastActivity: daysAgo(2), assignedTo: 'Amit Joshi',
        followUpDue: null, visitDate: tomorrowAt(11), visitStatus: 'Confirmed',
        source: 'Cold Call', propertyType: 'PG', genderRequirement: 'Boys',
        notes: [], timeline: makeTimeline('Visit', 'Harish Patel'),
        visitSchedule: { date: '2026-03-02', time: '11:00', fieldAgent: 'Suresh Kumar', status: 'Confirmed' },
    },
    {
        id: 'L018', name: 'Ishaan Dubey', phone: '8432109876',
        preferredArea: null, budget: 8000, stage: 'Visit',
        lastActivity: daysAgo(3), assignedTo: 'Karan Singh',
        followUpDue: null, visitDate: tomorrowAt(14), visitStatus: 'Pending',
        source: 'Facebook', propertyType: 'PG', genderRequirement: 'Boys',
        notes: [], timeline: makeTimeline('Visit', 'Ishaan Dubey'),
    },
    {
        id: 'L019', name: 'Nisha Reddy', phone: '8321098765',
        preferredArea: 'BTM Layout', budget: 11000, stage: 'Visit',
        lastActivity: daysAgo(1), assignedTo: 'Riya Sharma',
        followUpDue: null, visitDate: todayAt(9), visitStatus: 'Done',
        source: 'Walk-in', propertyType: 'PG', genderRequirement: 'Girls',
        notes: [], timeline: makeTimeline('Visit', 'Nisha Reddy'),
    },

    // ── NEGOTIATION ───────────────────────────────────────────────
    {
        id: 'L020', name: 'Aditya Kulkarni', phone: '8210987654',
        preferredArea: 'Koramangala', budget: 15000, stage: 'Negotiation',
        lastActivity: daysAgo(0, 5), assignedTo: 'Riya Sharma',
        followUpDue: todayAt(16), visitDate: null, visitStatus: 'Done',
        source: 'Reference', propertyType: 'PG', genderRequirement: 'Boys',
        notes: makeNote('Wants 10% discount on 3-month advance'), timeline: makeTimeline('Negotiation', 'Aditya Kulkarni'),
    },
    {
        id: 'L021', name: 'Ritika Saxena', phone: '8109876543',
        preferredArea: 'Indiranagar', budget: 13500, stage: 'Negotiation',
        lastActivity: daysAgo(2), assignedTo: 'Amit Joshi',
        followUpDue: tomorrowAt(11), visitDate: null, visitStatus: 'Done',
        source: 'Instagram', propertyType: 'Coliving', genderRequirement: 'Girls',
        notes: [], timeline: makeTimeline('Negotiation', 'Ritika Saxena'),
    },
    {
        id: 'L022', name: 'Suresh Babu', phone: '7998765432',
        preferredArea: 'Electronic City', budget: 8000, stage: 'Negotiation',
        lastActivity: daysAgo(4, 6), assignedTo: 'Karan Singh',
        followUpDue: todayAt(14), visitDate: null, visitStatus: 'Done',
        source: 'Portal', propertyType: 'PG', genderRequirement: 'Boys',
        notes: [], timeline: makeTimeline('Negotiation', 'Suresh Babu'),
    },
    {
        id: 'L023', name: 'Pallavi Sharma', phone: '7887654321',
        preferredArea: 'Sarjapur', budget: 12000, stage: 'Negotiation',
        lastActivity: daysAgo(1, 10), assignedTo: 'Riya Sharma',
        followUpDue: todayAt(17), visitDate: null, visitStatus: 'Done',
        source: 'Facebook', propertyType: 'PG', genderRequirement: 'Girls',
        notes: [], timeline: makeTimeline('Negotiation', 'Pallavi Sharma'),
    },
    {
        id: 'L024', name: 'Gaurav Tiwari', phone: '7776543210',
        preferredArea: null, budget: 9500, stage: 'Negotiation',
        lastActivity: daysAgo(0, 20), assignedTo: 'Amit Joshi',
        followUpDue: tomorrowAt(10), visitDate: null, visitStatus: 'Done',
        source: 'Cold Call', propertyType: 'Flat', genderRequirement: 'Boys',
        notes: [], timeline: makeTimeline('Negotiation', 'Gaurav Tiwari'),
    },
    {
        id: 'L025', name: 'Swati Agarwal', phone: '7665432109',
        preferredArea: 'HSR Layout', budget: 14500, stage: 'Negotiation',
        lastActivity: daysAgo(6), assignedTo: 'Karan Singh',
        followUpDue: todayAt(15), visitDate: null, visitStatus: 'Done',
        source: 'Reference', propertyType: 'PG', genderRequirement: 'Girls',
        notes: [], timeline: makeTimeline('Negotiation', 'Swati Agarwal'),
    },

    // ── BOOKED ────────────────────────────────────────────────────
    {
        id: 'L026', name: 'Neha Joshi', phone: '7554321098',
        preferredArea: 'Koramangala', budget: 16000, stage: 'Booked',
        lastActivity: daysAgo(1), assignedTo: 'Riya Sharma',
        followUpDue: null, visitDate: null, visitStatus: 'Done',
        source: 'Walk-in', propertyType: 'PG', genderRequirement: 'Girls',
        notes: [], timeline: makeTimeline('Booked', 'Neha Joshi'),
        bookingDetails: { propertyName: 'Sharma PG', bedAssigned: 'Room 3 - Bed A', advancePaid: 5000, bookingDate: '2026-02-28' },
    },
    {
        id: 'L027', name: 'Manish Yadav', phone: '7443210987',
        preferredArea: 'Indiranagar', budget: 11000, stage: 'Booked',
        lastActivity: daysAgo(2), assignedTo: 'Amit Joshi',
        followUpDue: null, visitDate: null, visitStatus: 'Done',
        source: 'Facebook', propertyType: 'PG', genderRequirement: 'Boys',
        notes: [], timeline: makeTimeline('Booked', 'Manish Yadav'),
        bookingDetails: { propertyName: 'Sharma PG', bedAssigned: 'Room 1 - Bed B', advancePaid: 3000, bookingDate: '2026-02-27' },
    },
    {
        id: 'L028', name: 'Lakshmi Menon', phone: '7332109876',
        preferredArea: 'Whitefield', budget: 13000, stage: 'Booked',
        lastActivity: daysAgo(3), assignedTo: 'Karan Singh',
        followUpDue: null, visitDate: null, visitStatus: 'Done',
        source: 'Portal', propertyType: 'PG', genderRequirement: 'Girls',
        notes: [], timeline: makeTimeline('Booked', 'Lakshmi Menon'),
        bookingDetails: { propertyName: 'Green Valley PG', bedAssigned: 'Room 5 - Bed C', advancePaid: 4000, bookingDate: '2026-02-26' },
    },
    {
        id: 'L029', name: 'Farhan Sheikh', phone: '7221098765',
        preferredArea: 'BTM Layout', budget: 9500, stage: 'Booked',
        lastActivity: daysAgo(0, 12), assignedTo: 'Riya Sharma',
        followUpDue: null, visitDate: null, visitStatus: 'Done',
        source: 'Reference', propertyType: 'PG', genderRequirement: 'Boys',
        notes: [], timeline: makeTimeline('Booked', 'Farhan Sheikh'),
        bookingDetails: { propertyName: 'Sharma PG', bedAssigned: 'Room 2 - Bed A', advancePaid: 2500, bookingDate: '2026-02-25' },
    },
    {
        id: 'L030', name: 'Charitha Reddy', phone: '7110987654',
        preferredArea: 'Sarjapur', budget: 12500, stage: 'Booked',
        lastActivity: daysAgo(4), assignedTo: 'Amit Joshi',
        followUpDue: null, visitDate: null, visitStatus: 'Done',
        source: 'Instagram', propertyType: 'Coliving', genderRequirement: 'Girls',
        notes: [], timeline: makeTimeline('Booked', 'Charitha Reddy'),
        bookingDetails: { propertyName: 'Green Valley PG', bedAssigned: 'Room 7 - Bed B', advancePaid: 6000, bookingDate: '2026-02-24' },
    },
];

export const BOOKING_TARGET = 8;
export const TEAM_RANK = 2;
export const TOTAL_TEAMS = 5;
export const AGENTS = ['Riya Sharma', 'Amit Joshi', 'Karan Singh', 'Rakesh Dada', 'Suresh Kumar'];
export const AREAS = ['Koramangala', 'Indiranagar', 'HSR Layout', 'BTM Layout', 'Whitefield', 'Marathahalli', 'Electronic City', 'Sarjapur', 'Jayanagar'];
