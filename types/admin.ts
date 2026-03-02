export type AdminEventType =
    | 'lead_created'
    | 'stage_changed'
    | 'lead_reassigned'
    | 'follow_up_added'
    | 'visit_scheduled'
    | 'booking_created'
    | 'lead_deleted'
    | 'employee_created'
    | 'employee_updated'
    | 'employee_deleted'
    | 'note_added';

export interface AdminEvent {
    id: string;
    type: AdminEventType;
    description: string;
    by: string;
    leadId?: string;
    leadName?: string;
    employeeId?: string;
    employeeName?: string;
    timestamp: string;
}
