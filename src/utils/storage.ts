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
 * Non-destructive collection merger for Requests
 * Merges local and remote lists by ID, preserving all records (old & new)
 */
export function mergeRequestCollections(
  localList: EngineerRequest[], 
  cloudList: EngineerRequest[]
): { merged: EngineerRequest[]; unsyncedToCloud: EngineerRequest[] } {
  const map = new Map<string, EngineerRequest>();
  const unsyncedToCloud: EngineerRequest[] = [];

  // 1. Add all cloud items
  for (const item of cloudList) {
    if (item && item.id) {
      map.set(item.id, item);
    }
  }

  // 2. Merge local items: if not in cloud, keep it and flag to push to cloud
  for (const item of localList) {
    if (item && item.id) {
      if (!map.has(item.id)) {
        map.set(item.id, item);
        unsyncedToCloud.push(item);
      } else {
        // Both exist: check timestamps or merge non-destructively
        const cloudItem = map.get(item.id)!;
        const localTime = new Date(item.updatedAt || item.createdAt || 0).getTime();
        const cloudTime = new Date(cloudItem.updatedAt || cloudItem.createdAt || 0).getTime();
        if (localTime > cloudTime) {
          map.set(item.id, { ...cloudItem, ...item });
          unsyncedToCloud.push({ ...cloudItem, ...item });
        }
      }
    }
  }

  const merged = Array.from(map.values()).sort((a, b) => {
    const dateA = a.createdAt || a.dateRequest || '';
    const dateB = b.createdAt || b.dateRequest || '';
    if (dateB !== dateA) return dateB.localeCompare(dateA);
    return (b.documentNo || '').localeCompare(a.documentNo || '');
  });

  return { merged, unsyncedToCloud };
}

/**
 * Non-destructive collection merger for Projects
 * Merges local and remote lists by ID, preserving all records (old & new)
 */
export function mergeProjectCollections(
  localList: Project[], 
  cloudList: Project[]
): { merged: Project[]; unsyncedToCloud: Project[] } {
  const map = new Map<string, Project>();
  const unsyncedToCloud: Project[] = [];

  // 1. Add all cloud items
  for (const item of cloudList) {
    if (item && item.id) {
      map.set(item.id, item);
    }
  }

  // 2. Merge local items
  for (const item of localList) {
    if (item && item.id) {
      if (!map.has(item.id)) {
        map.set(item.id, item);
        unsyncedToCloud.push(item);
      } else {
        const cloudItem = map.get(item.id)!;
        const localTime = new Date(item.updatedAt || item.createdAt || 0).getTime();
        const cloudTime = new Date(cloudItem.updatedAt || cloudItem.createdAt || 0).getTime();
        if (localTime > cloudTime) {
          map.set(item.id, { ...cloudItem, ...item });
          unsyncedToCloud.push({ ...cloudItem, ...item });
        }
      }
    }
  }

  const merged = Array.from(map.values()).sort((a, b) => {
    const dateA = a.createdAt || a.startDate || '';
    const dateB = b.createdAt || b.startDate || '';
    if (dateB !== dateA) return dateB.localeCompare(dateA);
    return (b.projectCode || '').localeCompare(a.projectCode || '');
  });

  return { merged, unsyncedToCloud };
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
