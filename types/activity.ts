export interface ActivityEvent {
    id: string;
    type: 'call' | 'note' | 'stage_change' | 'follow_up' | 'visit' | 'booking' | 'created';
    text: string;
    timestamp: string; // ISO
    by: string;
}

export interface Note {
    id: string;
    text: string;
    createdAt: string; // ISO
    by: string;
}

export interface FollowUp {
    date: string;       // YYYY-MM-DD
    time: string;       // HH:MM
    note: string;
    done: boolean;
    scheduledAt: string; // ISO
}

export interface VisitSchedule {
    date: string;       // YYYY-MM-DD
    time: string;       // HH:MM
    fieldAgent: string;
    propertyName?: string;
    roomNo?: string;
    status: 'Pending' | 'Confirmed' | 'Done' | 'Rescheduled' | 'Lost';
}

export interface BookingDetails {
    propertyName: string;
    bedAssigned: string;
    advancePaid: number;
    bookingDate: string; // YYYY-MM-DD
}
