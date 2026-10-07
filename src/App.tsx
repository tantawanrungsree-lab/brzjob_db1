/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ActiveView, EngineerRequest, Project } from './types';
import { 
  loadProjects, 
  saveProjects, 
  loadRequests, 
  saveRequests, 
  resetAllData, 
  mergeRequestData
} from './utils/storage';
import { 
  autoPullAndMergeMasterSpreadsheet,
  syncAllToGoogleSheets, 
  getStoredSpreadsheetId 
} from './services/googleSheets';
import { AppUser, subscribeToAuth, signOutUser, getStoredUser, getGoogleAccessToken } from './services/auth';
import { GoogleLoginModal } from './components/Auth/GoogleLoginModal';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
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
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);

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

  // Safe Google Sheets Auto-Discovery: Connects to 'Lumencraft Engineering & Project Hub - Master Database'
  // across any Gmail login or device
  const pullGoogleSheetsData = useCallback(async () => {
    const token = getGoogleAccessToken();
    if (!token) return;

    try {
      const currentLocalRequests = loadRequests();
      const currentLocalProjects = loadProjects();
      const result = await autoPullAndMergeMasterSpreadsheet(token, currentLocalProjects, currentLocalRequests);
      if (result.success) {
        setRequests(result.requests);
        setProjects(result.projects);
      }
    } catch (err) {
      console.warn('Google Sheets master database sync note:', err);
    }
  }, []);

  // Initial pull and sync whenever user logs in or token is available
  useEffect(() => {
    if (currentUser || getGoogleAccessToken()) {
      pullGoogleSheetsData();
    }
  }, [currentUser, pullGoogleSheetsData]);

  // Sync state to local storage cache for instant offline responsiveness & non-logged-in access
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    saveRequests(requests);
  }, [requests]);

  // Request Handlers - Instant local save & non-destructive background sync
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
      } else {
        updatedList = [savedReq, ...prev];
      }
      saveRequests(updatedList);
      return updatedList;
    });

    // If Google Sheets token is active, sync back to master sheet in background
    const token = getGoogleAccessToken();
    if (token) {
      syncAllToGoogleSheets(projects, updatedList, token).catch(e => console.warn('Background sync note:', e));
    }
  };

  const handleDeleteRequest = (id: string) => {
    let updatedList: EngineerRequest[] = [];
    setRequests(prev => {
      updatedList = prev.filter(r => r.id !== id);
      saveRequests(updatedList);
      return updatedList;
    });

    const token = getGoogleAccessToken();
    if (token) {
      syncAllToGoogleSheets(projects, updatedList, token).catch(e => console.warn('Background sync note:', e));
    }
  };

  const handlePrintRequest = (req: EngineerRequest) => {
    setPrintingRequest(req);
    setActiveView('print-request');
  };

  // Project Handlers
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
    let updatedProjects: Project[] = [];
    setProjects(prev => {
      const exists = prev.some(p => p.id === savedProj.id);
      if (exists) {
        updatedProjects = prev.map(p => p.id === savedProj.id ? savedProj : p);
      } else {
        updatedProjects = [savedProj, ...prev];
      }
      saveProjects(updatedProjects);
      return updatedProjects;
    });

    if (viewingProject && viewingProject.id === savedProj.id) {
      setViewingProject(savedProj);
    }

    const token = getGoogleAccessToken();
    if (token) {
      syncAllToGoogleSheets(updatedProjects, requests, token).catch(e => console.warn('Background sync note:', e));
    }
  };

  const handleDeleteProject = (id: string) => {
    let updatedProjects: Project[] = [];
    setProjects(prev => {
      updatedProjects = prev.filter(p => p.id !== id);
      saveProjects(updatedProjects);
      return updatedProjects;
    });
    if (viewingProject && viewingProject.id === id) {
      setViewingProject(null);
    }

    const token = getGoogleAccessToken();
    if (token) {
      syncAllToGoogleSheets(updatedProjects, requests, token).catch(e => console.warn('Background sync note:', e));
    }
  };

  const handleResetData = () => {
    if (window.confirm('คำเตือน: คุณต้องการล้างข้อมูลในระบบหรือไม่?')) {
      const reset = resetAllData();
      setProjects(reset.projects);
      setRequests(reset.requests);
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
          onSyncToFirebase={() => setIsGoogleSheetsModalOpen(true)}
          onOpenGoogleSheets={() => setIsGoogleSheetsModalOpen(true)}
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
            onOpenGoogleSheets={() => setIsGoogleSheetsModalOpen(true)}
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
          pullGoogleSheetsData();
        }}
      />

      {/* Google Sheets Unified Database & Image Sync Modal */}
      <GoogleSheetsSyncModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
        projects={projects}
        requests={requests}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
        onDataSynced={(syncedProjects, syncedRequests) => {
          setProjects(syncedProjects);
          setRequests(syncedRequests);
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
              <span>GOOGLE SHEETS MASTER DATABASE: Lumencraft Engineering & Project Hub</span>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}
