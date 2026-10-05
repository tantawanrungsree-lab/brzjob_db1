import { Project, EngineerRequest } from '../types';
import { INITIAL_PROJECTS, INITIAL_REQUESTS } from '../data/initialData';

// Central Master Keys shared across all users and roles
const MASTER_PROJECTS_KEY = 'lumencraft_master_projects_db_v2';
const MASTER_REQUESTS_KEY = 'lumencraft_master_requests_db_v2';
const BACKUP_PROJECTS_KEY = 'lumencraft_backup_projects_db_v2';
const BACKUP_REQUESTS_KEY = 'lumencraft_backup_requests_db_v2';

/**
 * Load Projects from Unified Master Storage with safe fallback
 */
export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(MASTER_PROJECTS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    const backupRaw = localStorage.getItem(BACKUP_PROJECTS_KEY);
    if (backupRaw !== null) {
      const parsedBackup = JSON.parse(backupRaw);
      if (Array.isArray(parsedBackup)) {
        saveProjects(parsedBackup);
        return parsedBackup;
      }
    }

    return [];
  } catch (err) {
    console.error('Error loading shared master projects:', err);
    return [];
  }
}

/**
 * Save Projects to Unified Master Storage
 */
export function saveProjects(projects: Project[]): void {
  try {
    if (!Array.isArray(projects)) return;
    const serialized = JSON.stringify(projects);
    localStorage.setItem(MASTER_PROJECTS_KEY, serialized);
    localStorage.setItem(BACKUP_PROJECTS_KEY, serialized);
  } catch (err) {
    console.error('Failed to save master projects:', err);
  }
}

/**
 * Load Requests from Unified Master Storage with safe fallback
 */
export function loadRequests(): EngineerRequest[] {
  try {
    const raw = localStorage.getItem(MASTER_REQUESTS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }

    const backupRaw = localStorage.getItem(BACKUP_REQUESTS_KEY);
    if (backupRaw !== null) {
      const parsedBackup = JSON.parse(backupRaw);
      if (Array.isArray(parsedBackup)) {
        saveRequests(parsedBackup);
        return parsedBackup;
      }
    }

    return [];
  } catch (err) {
    console.error('Error loading shared master requests:', err);
    return [];
  }
}

/**
 * Save Requests to Unified Master Storage
 */
export function saveRequests(requests: EngineerRequest[]): void {
  try {
    if (!Array.isArray(requests)) return;
    const serialized = JSON.stringify(requests);
    localStorage.setItem(MASTER_REQUESTS_KEY, serialized);
    localStorage.setItem(BACKUP_REQUESTS_KEY, serialized);
  } catch (err) {
    console.error('Failed to save master requests:', err);
  }
}

/**
 * Non-destructive merge helper to update request while retaining all unchanged fields
 */
export function mergeRequestData(existingReq: EngineerRequest, updatedReq: Partial<EngineerRequest>): EngineerRequest {
  return {
    ...existingReq,
    ...updatedReq,
    jobTypes: {
      ...existingReq.jobTypes,
      ...(updatedReq.jobTypes || {})
    },
    supportingDocs: {
      ...existingReq.supportingDocs,
      ...(updatedReq.supportingDocs || {})
    },
    signOff: {
      ...existingReq.signOff,
      ...(updatedReq.signOff || {})
    },
    updatedAt: new Date().toISOString()
  };
}

/**
 * Reset all data to clean empty state
 */
export function resetAllData(): { projects: Project[]; requests: EngineerRequest[] } {
  try {
    localStorage.removeItem(MASTER_PROJECTS_KEY);
    localStorage.removeItem(MASTER_REQUESTS_KEY);
    localStorage.removeItem(BACKUP_PROJECTS_KEY);
    localStorage.removeItem(BACKUP_REQUESTS_KEY);
    return {
      projects: [],
      requests: []
    };
  } catch (err) {
    console.error('Failed to reset data:', err);
    return {
      projects: [],
      requests: []
    };
  }
}
