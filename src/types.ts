export type Role = 'nurse' | 'bhw' | 'admin' | 'doctor' | 'patient';

export interface Profile {
  name: string;
  role: string;
  facility: string;
  contact: string;
  reminderSettings?: {
    inApp: boolean;
    sms: boolean;
    interval: string;
  };
}

export interface QueueItem {
  id: string;
  name: string;
  age: string;
  sex: string;
  concern: string;
  priority: 'regular' | 'urgent';
  philhealth: string;
  status: 'Waiting' | 'Called' | 'In Consult' | 'Done';
  av: string;
  initials: string;
  date: string; // YYYY-MM-DD
  addedAt: number;
  addedBy: string;
  doneAt?: string;
  notes?: string;
  medications?: string;
  labOrders?: string;
  approvedBy?: string;
  hpi?: string;
  objective?: string;
  diagnosis?: string;
  plan?: string;
  vitals?: {
    weight?: string;
    height?: string;
    bmi?: string;
    bp?: string;
    spo2?: string;
    rr?: string;
    hr?: string;
    temp?: string;
    cbg?: string;
  };
}

export interface Patient {
  id: string;
  name: string;
  age: string;
  sex: string;
  dob: string;
  address: string;
  philhealth: string;
  condition: string;
  contact: string;
  lastVisit: string;
  av: string;
  initials: string;
  registeredAt: string;
  registeredBy: string;
  followUp?: boolean;
  type?: 'regular' | 'vaccination';
  // Comprehensive fields
  civilStatus?: string;
  birthPlace?: string;
  occupation?: string;
  religion?: string;
  nationality?: string;
  bloodType?: string;
  education?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
}

export interface Appointment {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  time: string;
  type: string;
  facility: string;
  status: 'Scheduled' | 'Confirmed' | 'Waiting' | 'In Progress' | 'Done' | 'No-show' | 'Cancelled';
  bookedAt: string;
  bookedBy: string;
  dob?: string;
  sex?: string;
  philhealth?: string;
  address?: string;
  notes?: string;
}

export interface Dependent {
  id: string;
  head: string;
  dependent: string;
  relationship: string;
  age: string;
  conditions: string;
  lastVisit: string;
  addedBy: string;
}

export interface TransportTicket {
  id: string;
  patient: string;
  from: string;
  to: string;
  urgency: string;
  notes: string;
  status: 'Requested' | 'En Route' | 'Arrived' | 'Cancelled';
  requestedAt: string;
  requestedBy: string;
  updatedAt?: string;
}
