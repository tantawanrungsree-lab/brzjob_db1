import React, { useState } from 'react';
import { ActiveView } from '../types';
import { 
  ArrowLeft, Cloud, Check, RefreshCw, LogIn, LogOut, User, Shield
} from 'lucide-react';
import { AppUser } from '../services/auth';

interface NavbarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onNewRequest?: () => void;
  onNewProject?: () => void;
  onResetData?: () => void;
  onSyncToFirebase?: () => Promise<void>;
  requestCount: number;
  projectCount: number;
  currentUser: AppUser | null;
  onOpenLogin: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  onSyncToFirebase,
  requestCount,
  projectCount,
  currentUser,
  onOpenLogin,
  onSignOut
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleManualSync = async () => {
    if (!onSyncToFirebase || isSyncing) return;
    setIsSyncing(true);
    try {
      await onSyncToFirebase();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b-2 border-slate-800 text-white shadow-2xl no-print">
      <div className="max-w-[99%] mx-auto px-4 sm:px-8 py-4 sm:py-5 min-h-[100px] flex items-center justify-between">
        
        {/* Brand & Identity */}
        <div className="flex flex-wrap items-center gap-6 sm:gap-10">
          <button
            onClick={() => setActiveView('home')}
            className="flex items-center gap-4 group text-left transition-transform active:scale-98 cursor-pointer"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-2xl sm:text-3xl font-heading shadow-xl shadow-amber-500/25 group-hover:scale-105 transition-all">
              LC
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black font-heading tracking-tight text-white flex items-center gap-2 group-hover:text-amber-400 transition-colors">
                <span>LUMENCRAFT</span>
                <span className="text-[11px] bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full font-mono font-bold border border-amber-400/30">
                  SYSTEM HUB
                </span>
              </div>
              <div className="text-xs sm:text-sm text-slate-400 font-mono tracking-widest mt-0.5">
                ENGINEERING & SERVICE MANAGEMENT PLATFORM
              </div>
            </div>
          </button>

          {/* Navigation Area: Hidden on Home page; Shown on other subpages */}
          {activeView !== 'home' && (
            <nav className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
              <button
                onClick={() => setActiveView('home')}
                className="px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2.5 bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-md font-extrabold active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-slate-950" />
                <span>← กลับหน้าหลัก (Home)</span>
              </button>
            </nav>
          )}
        </div>

        {/* Right Executive Status Indicator, User Profile & Firebase Sync Badge */}
        <div className="flex items-center gap-3">
          
          {/* Firebase Database Sync Button */}
          {onSyncToFirebase && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              title="กดเพื่ออัปโหลดและซิงก์ข้อมูลทั้งหมดลง Firebase"
              className={`hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                syncSuccess
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800/80 text-amber-300 hover:bg-slate-800 border-amber-500/30 active:scale-95'
              }`}
            >
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              ) : syncSuccess ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Cloud className="w-4 h-4 text-amber-400" />
              )}
              <span>{isSyncing ? 'กำลังบันทึก...' : syncSuccess ? 'ซิงก์สำเร็จ!' : 'ซิงก์ Firebase'}</span>
            </button>
          )}

          {/* Cloud Database Connected Pill */}
          <div className="hidden xl:flex items-center gap-3.5 bg-slate-950/70 px-4 py-2 rounded-2xl border border-slate-800">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse ring-4 ring-emerald-500/20" />
            <div className="text-left font-mono">
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                <span>FIREBASE: bbbrz</span>
                <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800">
                  LIVE CLOUD
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {requestCount} คำขอ • {projectCount} โครงการ
              </div>
            </div>
          </div>

          {/* Gmail / Google Login & User Widget */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 pr-3 bg-slate-800/90 hover:bg-slate-800 rounded-2xl border border-slate-700 transition-all text-left group"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || ''}
                    className="w-9 h-9 rounded-xl object-cover border border-amber-400/40"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-sm">
                    {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                    <span>{currentUser.displayName || 'Staff'}</span>
                    <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-semibold border border-amber-400/30">
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                    {currentUser.email}
                  </div>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95">
                  <div className="p-3 border-b border-slate-800">
                    <div className="font-bold text-white text-sm">{currentUser.displayName}</div>
                    <div className="text-slate-400 font-mono text-[11px] truncate mt-0.5">{currentUser.email}</div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-[10px] bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded-md font-semibold border border-purple-700">
                        บทบาท: {currentUser.role}
                      </span>
                    </div>
                  </div>

                  <div className="p-1 space-y-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenLogin();
                      }}
                      className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-amber-400" />
                      <span>สลับบัญชี Gmail / บัญชีอื่น</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onSignOut();
                      }}
                      className="w-full px-3 py-2 text-left text-rose-400 hover:text-rose-200 hover:bg-rose-950/50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>ออกจากระบบ (Sign Out)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 text-xs sm:text-sm cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>เข้าสู่ระบบด้วย Gmail</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
