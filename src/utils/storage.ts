import { Project, EngineerRequest } from '../types';

// Central Master Keys shared across all users and roles
const MASTER_PROJECTS_KEY = 'lumencraft_master_projects_db_v2';
const MASTER_REQUESTS_KEY = 'lumencraft_master_requests_db_v2';
const BACKUP_PROJECTS_KEY = 'lumencraft_backup_projects_db_v2';
const BACKUP_REQUESTS_KEY = 'lumencraft_backup_requests_db_v2';
const DELETED_REQUESTS_KEY = 'lumencraft_deleted_requests_ids_v2';
const DELETED_PROJECTS_KEY = 'lumencraft_deleted_projects_ids_v2';

/**
 * Get IDs of requests deleted by user
 */
export function getDeletedRequestIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_REQUESTS_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch (e) {}
  return new Set();
}

/**
 * Record a deleted request ID so it is never re-resurrected during merge
 */
export function recordDeletedRequestId(idOrDocNo: string): void {
  try {
    const ids = getDeletedRequestIds();
    ids.add(idOrDocNo);
    localStorage.setItem(DELETED_REQUESTS_KEY, JSON.stringify(Array.from(ids)));
  } catch (e) {}
}

/**
 * Get IDs of projects deleted by user
 */
export function getDeletedProjectIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_PROJECTS_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch (e) {}
  return new Set();
}

/**
 * Record a deleted project ID
 */
export function recordDeletedProjectId(idOrCode: string): void {
  try {
    const ids = getDeletedProjectIds();
    ids.add(idOrCode);
    localStorage.setItem(DELETED_PROJECTS_KEY, JSON.stringify(Array.from(ids)));
  } catch (e) {}
}

/**
 * Load Projects from Unified Master Storage with safe fallback
 */
export function loadProjects(): Project[] {
  try {
    const deleted = getDeletedProjectIds();
    const raw = localStorage.getItem(MASTER_PROJECTS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(p => p && !deleted.has(p.id) && !deleted.has(p.projectCode));
      }
    }

    const backupRaw = localStorage.getItem(BACKUP_PROJECTS_KEY);
    if (backupRaw !== null) {
      const parsedBackup = JSON.parse(backupRaw);
      if (Array.isArray(parsedBackup)) {
        const filtered = parsedBackup.filter(p => p && !deleted.has(p.id) && !deleted.has(p.projectCode));
        saveProjects(filtered);
        return filtered;
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
    const deleted = getDeletedRequestIds();
    const raw = localStorage.getItem(MASTER_REQUESTS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(r => r && !deleted.has(r.id) && !deleted.has(r.documentNo));
      }
    }

    const backupRaw = localStorage.getItem(BACKUP_REQUESTS_KEY);
    if (backupRaw !== null) {
      const parsedBackup = JSON.parse(backupRaw);
      if (Array.isArray(parsedBackup)) {
        const filtered = parsedBackup.filter(r => r && !deleted.has(r.id) && !deleted.has(r.documentNo));
        saveRequests(filtered);
        return filtered;
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
 * Merges local and remote lists by ID, ignoring deleted items
 */
export function mergeRequestCollections(
  localList: EngineerRequest[], 
  cloudList: EngineerRequest[]
): { merged: EngineerRequest[]; unsyncedToCloud: EngineerRequest[] } {
  const map = new Map<string, EngineerRequest>();
  const unsyncedToCloud: EngineerRequest[] = [];
  const deleted = getDeletedRequestIds();

  // 1. Add cloud items that are not deleted
  for (const item of cloudList) {
    if (item && item.id && !deleted.has(item.id) && !deleted.has(item.documentNo)) {
      map.set(item.id, item);
    }
  }

  // 2. Merge local items: if not in cloud and not deleted, keep it and flag to push
  for (const item of localList) {
    if (item && item.id && !deleted.has(item.id) && !deleted.has(item.documentNo)) {
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
 * Merges local and remote lists by ID, ignoring deleted items
 */
export function mergeProjectCollections(
  localList: Project[], 
  cloudList: Project[]
): { merged: Project[]; unsyncedToCloud: Project[] } {
  const map = new Map<string, Project>();
  const unsyncedToCloud: Project[] = [];
  const deleted = getDeletedProjectIds();

  // 1. Add cloud items that are not deleted
  for (const item of cloudList) {
    if (item && item.id && !deleted.has(item.id) && !deleted.has(item.projectCode)) {
      map.set(item.id, item);
    }
  }

  // 2. Merge local items
  for (const item of localList) {
    if (item && item.id && !deleted.has(item.id) && !deleted.has(item.projectCode)) {
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
 * Reset all data to clean empty state (wiping all old records)
 */
export function resetAllData(): { projects: Project[]; requests: EngineerRequest[] } {
  try {
    const keysToRemove = [
      MASTER_PROJECTS_KEY,
      MASTER_REQUESTS_KEY,
      BACKUP_PROJECTS_KEY,
      BACKUP_REQUESTS_KEY,
      DELETED_REQUESTS_KEY,
      DELETED_PROJECTS_KEY,
      'lumencraft_master_projects_db_v1',
      'lumencraft_master_requests_db_v1',
      'lumencraft_requests_v3',
      'lumencraft_projects_v3',
      'lumencraft_requests_v2',
      'lumencraft_projects_v2',
      'lumencraft_projects_v1',
      'lumencraft_requests_v1',
      'lumencraft_requests',
      'lumencraft_projects'
    ];
    
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }

    // Set empty arrays explicitly to ensure fresh clean state
    localStorage.setItem(MASTER_PROJECTS_KEY, JSON.stringify([]));
    localStorage.setItem(MASTER_REQUESTS_KEY, JSON.stringify([]));
    localStorage.setItem(BACKUP_PROJECTS_KEY, JSON.stringify([]));
    localStorage.setItem(BACKUP_REQUESTS_KEY, JSON.stringify([]));
    localStorage.setItem(DELETED_REQUESTS_KEY, JSON.stringify([]));
    localStorage.setItem(DELETED_PROJECTS_KEY, JSON.stringify([]));

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

export const clearAllOldData = resetAllData;
