import { Role } from './types';

export const ROLES: Record<Role, { pages: string[]; permissions: string[] }> = {
  nurse: {
    pages: ['dashboard', 'appointments', 'patients', 'dependents', 'transport', 'facilities', 'doh_programs', 'profile'],
    permissions: ['view_all', 'edit_all', 'consult']
  },
  doctor: {
    pages: ['dashboard', 'appointments', 'patients', 'facilities', 'doh_programs', 'profile'],
    permissions: ['consult', 'diagnose']
  },
  bhw: {
    pages: ['dashboard', 'appointments', 'outreach', 'doh_programs', 'facilities', 'profile'],
    permissions: ['queue_only']
  },
  admin: {
    pages: ['dashboard', 'appointments', 'patients', 'dependents', 'transport', 'facilities', 'research', 'brainsnack', 'fhsis', 'external', 'doh_programs', 'profile'],
    permissions: ['manage_all', 'reports']
  },
  patient: {
    pages: ['my_records', 'appointments', 'facilities', 'profile'],
    permissions: ['book_only']
  }
};

export const MAX_PER_SLOT = 1;
