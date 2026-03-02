import { ActivityEvent, Note, FollowUp, VisitSchedule, BookingDetails } from './activity';

export type LeadStage = 'New' | 'Contacted' | 'Visit' | 'Negotiation' | 'Booked' | 'Lost';
export type VisitStatus = 'Confirmed' | 'Pending' | 'Done';
export type LeadSource = 'Walk-in' | 'Reference' | 'Facebook' | 'Instagram' | 'Portal' | 'Cold Call' | 'Other';
export type PropertyType = 'PG' | 'Flat' | 'Coliving' | 'Not Decided';
export type GenderRequirement = 'Boys' | 'Girls' | 'Any';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  preferredArea: string | null;
  budget: number | null;
  stage: LeadStage;
  lastActivity: string;       // ISO date string
  assignedTo: string;
  followUpDue: string | null; // ISO date string (legacy, for dashboard compat)
  visitDate: string | null;   // ISO date string (legacy, for dashboard compat)
  visitStatus: VisitStatus;

  // New enriched fields
  source: LeadSource;
  propertyType: PropertyType;
  genderRequirement: GenderRequirement;
  notes: Note[];
  timeline: ActivityEvent[];
  followUp?: FollowUp;
  visitSchedule?: VisitSchedule;
  bookingDetails?: BookingDetails;
}
