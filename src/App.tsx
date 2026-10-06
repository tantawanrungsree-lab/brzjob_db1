/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveView, EngineerRequest, Project } from './types';
import { 
  loadProjects, 
  saveProjects, 
  loadRequests, 
  saveRequests, 
  resetAllData, 
  mergeRequestData,
  mergeRequestCollections,
  mergeProjectCollections
} from './utils/storage';
import { 
  testFirestoreConnection, 
  subscribeToRequests, 
  subscribeToProjects, 
  fetchLatestFromFirestore,
  saveRequestToFirestore, 
  deleteRequestFromFirestore, 
  saveProjectToFirestore, 
  deleteProjectFromFirestore, 
  clearAllSampleDataFromFirebase,
  syncAllDataToFirebase
} from './services/firebase';
import { AppUser, subscribeToAuth, signOutUser, getStoredUser } from './services/auth';
import { GoogleLoginModal } from './components/Auth/GoogleLoginModal';
import { Navbar } from './components/Navbar';
import { HomeHero } from './components/HomeHero';
import { RequestList } from './components/EngineerRequests/RequestList';
import { RequestModalForm } from './components/EngineerRequests/RequestModalForm';
import { ServiceRequestPrintDocument } from './components/EngineerRequests/ServiceRequestPrintDocument';
import { ProjectList } from './components/Projects/ProjectList';
import { ProjectModalForm } from './components/Projects/ProjectModalForm';
import { ProjectDetailModal } from './components/Projects/ProjectDetailModal';
import { WorkdayDueAlertBanner } from './components/Notifications/WorkdayDueAlertBanner';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [requestCategoryFilter, setRequestCategoryFilter] = useState<'all' | 'internal' | 'customer' | 'rejected'>('all');
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [requests, setRequests] = useState<EngineerRequest[]>(loadRequests);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(getStoredUser);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Modals state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<EngineerRequest | null>(null);
  const [preselectedProjectId, setPreselectedProjectId] = useState<string | undefined>(undefined);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  const [printingRequest, setPrintingRequest] = useState<EngineerRequest | null>(null);

  // Subscribe to Auth State
  useEffect(() => {
    const unsubAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  // Initialize Firebase Firestore connection and subscribe to continuous real-time sync
  useEffect(() => {
    let unsubRequests: (() => void) | undefined;
    let unsubProjects: (() => void) | undefined;

    const pullFreshData = async () => {
      try {
        const latest = await fetchLatestFromFirestore();
        
        // Merge requests safely without dropping local or cloud items
        const currentLocalRequests = loadRequests();
        const { merged: mergedReqs, unsyncedToCloud: unsyncedReqs } = mergeRequestCollections(
          currentLocalRequests, 
          latest.requests
        );
        if (mergedReqs.length > 0) {
          setRequests(mergedReqs);
          saveRequests(mergedReqs);
        }
        // Upload any local-only requests to Firestore
        for (const req of unsyncedReqs) {
          saveRequestToFirestore(req);
        }

        // Merge projects safely
        const currentLocalProjects = loadProjects();
        const { merged: mergedProjs, unsyncedToCloud: unsyncedProjs } = mergeProjectCollections(
          currentLocalProjects, 
          latest.projects
        );
        if (mergedProjs.length > 0) {
          setProjects(mergedProjs);
          saveProjects(mergedProjs);
        }
        // Upload any local-only projects to Firestore
        for (const proj of unsyncedProjs) {
          saveProjectToFirestore(proj);
        }
      } catch (err) {
        console.warn('pullFreshData sync note:', err);
      }
    };

    const initFirebase = async () => {
      // 1. Validate connection
      await testFirestoreConnection();

      // 2. Fetch latest state from Firestore immediately & merge seamlessly
      await pullFreshData();

      // 3. Continuous real-time subscription across all users and logged-in emails
      unsubRequests = subscribeToRequests((firestoreRequests) => {
        if (Array.isArray(firestoreRequests)) {
          const currentLocal = loadRequests();
          const { merged, unsyncedToCloud } = mergeRequestCollections(currentLocal, firestoreRequests);
          setRequests(merged);
          saveRequests(merged);
          for (const req of unsyncedToCloud) {
            saveRequestToFirestore(req);
          }
        }
      });

      unsubProjects = subscribeToProjects((firestoreProjects) => {
        if (Array.isArray(firestoreProjects)) {
          const currentLocal = loadProjects();
          const { merged, unsyncedToCloud } = mergeProjectCollections(currentLocal, firestoreProjects);
          setProjects(merged);
          saveProjects(merged);
          for (const proj of unsyncedToCloud) {
            saveProjectToFirestore(proj);
          }
        }
      });
    };

    initFirebase();

    // Re-verify latest cloud state whenever tab becomes active or network reconnects
    const handleRecheck = () => {
      pullFreshData();
    };

    window.addEventListener('focus', handleRecheck);
    window.addEventListener('online', handleRecheck);
    document.addEventListener('visibilitychange', handleRecheck);

    return () => {
      if (unsubRequests) unsubRequests();
      if (unsubProjects) unsubProjects();
      window.removeEventListener('focus', handleRecheck);
      window.removeEventListener('online', handleRecheck);
      document.removeEventListener('visibilitychange', handleRecheck);
    };
  }, []);

  // Sync state to local storage cache for instant offline responsiveness
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    saveRequests(requests);
  }, [requests]);

  // Request Handlers - Live Firestore Sync
  const handleOpenNewRequest = (projectId?: string) => {
    setEditingRequest(null);
    setPreselectedProjectId(projectId);
    setIsRequestModalOpen(true);
  };

  const handleEditRequest = (req: EngineerRequest) => {
    setEditingRequest(req);
    setPreselectedProjectId(req.projectId);
    setIsRequestModalOpen(true);
  };

  const handleSaveRequest = (savedReq: EngineerRequest) => {
    let updatedList: EngineerRequest[] = [];
    setRequests(prev => {
      const existing = prev.find(r => r.id === savedReq.id);
      if (existing) {
        const merged = mergeRequestData(existing, savedReq);
        updatedList = prev.map(r => r.id === savedReq.id ? merged : r);
        return updatedList;
      }
      updatedList = [savedReq, ...prev];
      return updatedList;
    });

    // Save directly to Firebase Firestore
    saveRequestToFirestore(savedReq);
  };

  const handleDeleteRequest = async (id: string) => {
    setRequests(prev => {
      const updated = prev.filter(r => r.id !== id);
      saveRequests(updated);
      return updated;
    });
    await deleteRequestFromFirestore(id);
  };

  const handlePrintRequest = (req: EngineerRequest) => {
    setPrintingRequest(req);
    setActiveView('print-request');
  };

  // Project Handlers - Live Firestore Sync
  const handleOpenNewProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (proj: Project) => {
    setEditingProject(proj);
    setIsProjectModalOpen(true);
  };

  const handleViewProject = (proj: Project) => {
    setViewingProject(proj);
  };

  const handleSaveProject = (savedProj: Project) => {
    setProjects(prev => {
      const exists = prev.some(p => p.id === savedProj.id);
      if (exists) {
        return prev.map(p => p.id === savedProj.id ? savedProj : p);
      }
      return [savedProj, ...prev];
    });

    // If currently viewing details of this project, update it too
    if (viewingProject && viewingProject.id === savedProj.id) {
      setViewingProject(savedProj);
    }

    // Save directly to Firebase Firestore
    saveProjectToFirestore(savedProj);
  };

  const handleDeleteProject = async (id: string) => {
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveProjects(updated);
      return updated;
    });
    if (viewingProject && viewingProject.id === id) {
      setViewingProject(null);
    }
    await deleteProjectFromFirestore(id);
  };

  const handleManualSyncAll = async () => {
    const result = await syncAllDataToFirebase(projects, requests);
    if (result) {
      setProjects(result.projects);
      setRequests(result.requests);
      saveProjects(result.projects);
      saveRequests(result.requests);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('คำเตือน: คุณต้องการล้างข้อมูลทั้งหมดในระบบและใน Firebase หรือไม่?')) {
      const reset = resetAllData();
      setProjects(reset.projects);
      setRequests(reset.requests);
      await clearAllSampleDataFromFirebase();
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-900">
      
      {/* Top Navigation Bar */}
      {activeView !== 'print-request' && (
        <Navbar
          activeView={activeView}
          setActiveView={setActiveView}
          onNewRequest={() => handleOpenNewRequest()}
          onNewProject={handleOpenNewProject}
          onResetData={handleResetData}
          onSyncToFirebase={handleManualSyncAll}
          requestCount={requests.length}
          projectCount={projects.length}
          currentUser={currentUser}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onSignOut={handleSignOut}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-[99%] mx-auto w-full px-3 sm:px-6 lg:px-8 py-6">
        
        {/* Universal 1-Workday Advance Alert Banner (Shown across all views) */}
        {activeView !== 'print-request' && (
          <WorkdayDueAlertBanner
            requests={requests}
            projects={projects}
            onSelectRequest={handleEditRequest}
            onSelectProject={(p) => {
              setViewingProject(p);
              setActiveView('projects');
            }}
          />
        )}
        
        {/* VIEW 1: HOME DASHBOARD */}
        {activeView === 'home' && (
          <HomeHero
            onNavigate={(view) => setActiveView(view)}
            onNavigateToRequests={(category) => {
              setRequestCategoryFilter(category);
              setActiveView('requests');
            }}
            requests={requests}
            projects={projects}
            onOpenRequest={handleEditRequest}
            onPrintRequest={handlePrintRequest}
            onNewRequest={() => handleOpenNewRequest()}
            onNewProject={handleOpenNewProject}
          />
        )}

        {/* VIEW 2: ENGINEER JOB REQUEST LIST */}
        {activeView === 'requests' && (
          <RequestList
            requests={requests}
            initialCategory={requestCategoryFilter}
            onAddNew={() => handleOpenNewRequest()}
            onEdit={handleEditRequest}
            onPrint={handlePrintRequest}
            onDelete={handleDeleteRequest}
            onSelectProject={(projectId) => {
              const p = projects.find(item => item.id === projectId);
              if (p) {
                setViewingProject(p);
                setActiveView('projects');
              }
            }}
            onSaveRequest={handleSaveRequest}
          />
        )}

        {/* VIEW 3: BRZ PROJECT DIRECTORY */}
        {activeView === 'projects' && (
          <ProjectList
            projects={projects}
            requests={requests}
            onAddNew={handleOpenNewProject}
            onEdit={handleEditProject}
            onView={handleViewProject}
            onDelete={handleDeleteProject}
            onCreateRequestForProject={(projectId) => handleOpenNewRequest(projectId)}
          />
        )}

        {/* VIEW 4: OFFICIAL PRINT DOCUMENT (A4) */}
        {activeView === 'print-request' && printingRequest && (
          <ServiceRequestPrintDocument
            request={printingRequest}
            onBack={() => setActiveView('requests')}
          />
        )}

      </main>

      {/* Universal Request Modal Form */}
      <RequestModalForm
        isOpen={isRequestModalOpen}
        onClose={() => {
          setIsRequestModalOpen(false);
          setEditingRequest(null);
          setPreselectedProjectId(undefined);
        }}
        onSave={handleSaveRequest}
        onDelete={handleDeleteRequest}
        initialData={editingRequest}
        preselectedProjectId={preselectedProjectId}
        projects={projects}
      />

      {/* Universal Project Modal Form (Full-Screen Modal) */}
      <ProjectModalForm
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
        initialData={editingProject}
      />

      {/* Universal Project Detail & Gantt Modal */}
      {viewingProject && (
        <ProjectDetailModal
          project={viewingProject}
          requests={requests}
          isOpen={!!viewingProject}
          onClose={() => setViewingProject(null)}
          onEditProject={(proj) => {
            setEditingProject(proj);
            setIsProjectModalOpen(true);
          }}
          onCreateRequestForProject={(projectId) => {
            setViewingProject(null);
            handleOpenNewRequest(projectId);
          }}
          onViewRequest={(req) => {
            setViewingProject(null);
            handleEditRequest(req);
          }}
          onPrintRequest={(req) => {
            setViewingProject(null);
            handlePrintRequest(req);
          }}
          onDeleteProject={handleDeleteProject}
          onDeleteRequest={handleDeleteRequest}
        />
      )}

      {/* Google / Gmail Sign-In Modal */}
      <GoogleLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Universal Footer */}
      {activeView !== 'print-request' && (
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center no-print mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">LUMENCRAFT ENGINEERING PORTAL</span>
              <span>•</span>
              <span>Lumencraft Co., Ltd. (Thailand)</span>
            </div>
            <div className="text-slate-400 font-mono text-[11px] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>FIREBASE CLOUD DATABASE CONNECTED (bbbrz)</span>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}
