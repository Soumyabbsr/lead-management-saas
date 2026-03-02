import { VisitStatus } from './lead';

export interface Visit {
    leadId: string;
    leadName: string;
    phone: string;
    time: string; // ISO date string
    area: string | null;
    budget: number | null;
    assignedAgent: string;
    status: VisitStatus;
}
