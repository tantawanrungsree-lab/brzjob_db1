import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, getDocFromServer, 
  onSnapshot, setDoc, deleteDoc, getDocs, writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Project, EngineerRequest } from '../types';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Collection References
export const REQUESTS_COLLECTION = 'requests';
export const PROJECTS_COLLECTION = 'projects';

/**
 * Validate connection to Firestore
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration / connection state.");
      return false;
    }
    return true;
  }
}

/**
 * Real-time listener for all requests in Firestore across all users
 */
export function subscribeToRequests(onUpdate: (requests: EngineerRequest[]) => void): Unsubscribe {
  const reqCol = collection(db, REQUESTS_COLLECTION);
  return onSnapshot(reqCol, (snapshot) => {
    const list: EngineerRequest[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as EngineerRequest);
    });
    // Sort deterministically so all users and sessions see identical list order
    list.sort((a, b) => {
      const dateA = a.createdAt || a.dateRequest || '';
      const dateB = b.createdAt || b.dateRequest || '';
      if (dateB !== dateA) return dateB.localeCompare(dateA);
      return (b.documentNo || '').localeCompare(a.documentNo || '');
    });
    onUpdate(list);
  }, (err) => {
    console.warn('Firestore requests onSnapshot listener note:', err.message);
  });
}

/**
 * Real-time listener for all projects in Firestore across all users
 */
export function subscribeToProjects(onUpdate: (projects: Project[]) => void): Unsubscribe {
  const prjCol = collection(db, PROJECTS_COLLECTION);
  return onSnapshot(prjCol, (snapshot) => {
    const list: Project[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Project);
    });
    // Sort deterministically so all users and sessions see identical list order
    list.sort((a, b) => {
      const dateA = a.createdAt || a.startDate || '';
      const dateB = b.createdAt || b.startDate || '';
      if (dateB !== dateA) return dateB.localeCompare(dateA);
      return (b.projectCode || '').localeCompare(a.projectCode || '');
    });
    onUpdate(list);
  }, (err) => {
    console.warn('Firestore projects onSnapshot listener note:', err.message);
  });
}

/**
 * Directly fetch latest projects and requests from Firestore
 */
export async function fetchLatestFromFirestore(): Promise<{ projects: Project[]; requests: EngineerRequest[] }> {
  try {
    const prjCol = collection(db, PROJECTS_COLLECTION);
    const reqCol = collection(db, REQUESTS_COLLECTION);
    const [prjSnap, reqSnap] = await Promise.all([
      getDocs(prjCol),
      getDocs(reqCol)
    ]);

    const liveProjects: Project[] = [];
    prjSnap.forEach(d => liveProjects.push(d.data() as Project));
    liveProjects.sort((a, b) => {
      const dateA = a.createdAt || a.startDate || '';
      const dateB = b.createdAt || b.startDate || '';
      if (dateB !== dateA) return dateB.localeCompare(dateA);
      return (b.projectCode || '').localeCompare(a.projectCode || '');
    });

    const liveRequests: EngineerRequest[] = [];
    reqSnap.forEach(d => liveRequests.push(d.data() as EngineerRequest));
    liveRequests.sort((a, b) => {
      const dateA = a.createdAt || a.dateRequest || '';
      const dateB = b.createdAt || b.dateRequest || '';
      if (dateB !== dateA) return dateB.localeCompare(dateA);
      return (b.documentNo || '').localeCompare(a.documentNo || '');
    });

    return { projects: liveProjects, requests: liveRequests };
  } catch (err) {
    console.error('Error fetching latest from Firestore:', err);
    return { projects: [], requests: [] };
  }
}

/**
 * Save or update single Request permanently in Firebase
 */
export async function saveRequestToFirestore(request: EngineerRequest): Promise<void> {
  try {
    const docRef = doc(db, REQUESTS_COLLECTION, request.id);
    await setDoc(docRef, {
      ...request,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`[Firebase] Successfully saved request: ${request.id} (${request.documentNo})`);
  } catch (err) {
    console.error('Error saving request to Firestore:', err);
  }
}

/**
 * Delete Request permanently from Firebase
 */
export async function deleteRequestFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, REQUESTS_COLLECTION, id);
    await deleteDoc(docRef);
    console.log(`[Firebase] Permanently deleted request: ${id}`);
  } catch (err) {
    console.error('Error deleting request from Firestore:', err);
  }
}

/**
 * Save or update single Project permanently in Firebase
 */
export async function saveProjectToFirestore(project: Project): Promise<void> {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, project.id);
    await setDoc(docRef, {
      ...project,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`[Firebase] Successfully saved project: ${project.id} (${project.projectCode})`);
  } catch (err) {
    console.error('Error saving project to Firestore:', err);
  }
}

/**
 * Delete Project permanently from Firebase
 */
export async function deleteProjectFromFirestore(id: string): Promise<void> {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, id);
    await deleteDoc(docRef);
    console.log(`[Firebase] Permanently deleted project: ${id}`);
  } catch (err) {
    console.error('Error deleting project from Firestore:', err);
  }
}

/**
 * Wipe all data from Firebase Firestore only on explicit user request
 */
export async function clearAllSampleDataFromFirebase(): Promise<void> {
  try {
    const prjCol = collection(db, PROJECTS_COLLECTION);
    const reqCol = collection(db, REQUESTS_COLLECTION);

    const [prjSnap, reqSnap] = await Promise.all([
      getDocs(prjCol),
      getDocs(reqCol)
    ]);

    const batch = writeBatch(db);
    let deletedCount = 0;

    prjSnap.forEach((d) => {
      batch.delete(d.ref);
      deletedCount++;
    });

    reqSnap.forEach((d) => {
      batch.delete(d.ref);
      deletedCount++;
    });

    if (deletedCount > 0) {
      await batch.commit();
      console.log(`[Firebase] Cleared ${deletedCount} items from Firestore.`);
    }

    localStorage.removeItem('lumencraft_master_projects_db_v2');
    localStorage.removeItem('lumencraft_master_requests_db_v2');
    localStorage.removeItem('lumencraft_backup_projects_db_v2');
    localStorage.removeItem('lumencraft_backup_requests_db_v2');
  } catch (err) {
    console.error('Error clearing data from Firebase:', err);
  }
}

/**
 * Force sync all current local data to Firebase and re-align both sides to 100% parity
 */
export async function syncAllDataToFirebase(
  allProjects: Project[], 
  allRequests: EngineerRequest[]
): Promise<{ projects: Project[]; requests: EngineerRequest[] }> {
  try {
    const batch = writeBatch(db);
    for (const p of allProjects) {
      const d = doc(db, PROJECTS_COLLECTION, p.id);
      batch.set(d, p, { merge: true });
    }
    for (const r of allRequests) {
      const d = doc(db, REQUESTS_COLLECTION, r.id);
      batch.set(d, r, { merge: true });
    }
    await batch.commit();

    // Retrieve fresh snapshot from Firestore to guarantee 100% identical dataset
    const prjCol = collection(db, PROJECTS_COLLECTION);
    const reqCol = collection(db, REQUESTS_COLLECTION);
    const [prjSnap, reqSnap] = await Promise.all([
      getDocs(prjCol),
      getDocs(reqCol)
    ]);

    const liveProjects: Project[] = [];
    prjSnap.forEach(d => liveProjects.push(d.data() as Project));

    const liveRequests: EngineerRequest[] = [];
    reqSnap.forEach(d => liveRequests.push(d.data() as EngineerRequest));

    return {
      projects: liveProjects,
      requests: liveRequests
    };
  } catch (err) {
    console.error('Error syncing all data to Firebase:', err);
    return { projects: allProjects, requests: allRequests };
  }
}
