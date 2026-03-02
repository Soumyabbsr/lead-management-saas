export type UserRole = 'super_admin' | 'admin' | 'sales' | 'field_agent';

export interface User {
    id: string;
    tenantId: string;
    name: string;
    role: UserRole;
    avatar?: string;
    teamLeads?: number;
    teamBookings?: number;
}
