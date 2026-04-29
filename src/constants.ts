import { Role } from './types';

export const ROLES: Record<Role, { pages: string[]; permissions: string[] }> = {
  nurse: {
    pages: ['dashboard', 'appointments', 'patients', 'dependents', 'transport', 'facilities', 'outreach', 'doh_programs', 'fhsis', 'brainsnack', 'research', 'profile'],
    permissions: ['view_all', 'edit_all', 'consult', 'ai_assist', 'report_access']
  },
  doctor: {
    pages: ['dashboard', 'appointments', 'patients', 'facilities', 'brainsnack', 'research'],
    permissions: ['consult', 'diagnose', 'ai_assist', 'report_access']
  },
  bhw: {
    pages: ['dashboard', 'appointments', 'outreach', 'doh_programs', 'facilities', 'profile'],
    permissions: ['queue_only', 'outreach_only']
  },
  admin: {
    pages: ['dashboard', 'appointments', 'patients', 'dependents', 'transport', 'facilities', 'outreach', 'research', 'brainsnack', 'fhsis', 'external', 'doh_programs', 'profile'],
    permissions: ['manage_all', 'reports', 'clinical_access']
  },
  patient: {
    pages: ['my_records', 'appointments', 'facilities', 'profile'],
    permissions: ['book_only', 'view_self']
  }
};

export const MAX_PER_SLOT = 1;
