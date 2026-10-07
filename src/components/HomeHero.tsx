import React, { useState, useEffect } from 'react';
import { ActiveView, EngineerRequest, Project } from '../types';
import { 
  FileText, Building2, ArrowRight, Plus, 
  Clock, Layers, BarChart3, Calendar, CreditCard, 
  ShieldCheck, UserCheck, FileSpreadsheet,
  Building, CheckCircle2, ChevronRight, X, Sparkles,
  Sheet, ExternalLink, Lock, Database
} from 'lucide-react';
import { getStoredSpreadsheetId, getSpreadsheetUrl } from '../services/googleSheets';

interface HomeHeroProps {
  onNavigate: (view: ActiveView) => void;
  onNavigateToRequests?: (category: 'all' | 'internal' | 'customer' | 'rejected') => void;
  requests: EngineerRequest[];
  projects: Project[];
  onOpenRequest: (req: EngineerRequest) => void;
  onPrintRequest: (req: EngineerRequest) => void;
  onNewRequest: () => void;
  onNewProject: () => void;
  onOpenGoogleSheets?: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onNavigate,
  onNavigateToRequests = (category) => onNavigate('requests'),
  requests,
  projects,
  onNewRequest,
  onNewProject,
  onOpenGoogleSheets
}) => {
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDateFull = currentDateTime.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTimeFull = currentDateTime.toLocaleTimeString('th-TH', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const storedSheetId = getStoredSpreadsheetId();
  const currentSheetUrl = storedSheetId ? getSpreadsheetUrl(storedSheetId) : null;

  const openRequests = requests.filter(r => r.status === 'Open');
  const inProgressRequests = requests.filter(r => r.status === 'In Progress');
  const completedRequests = requests.filter(r => r.status === 'Completed');
  const rejectedRequests = requests.filter(r => r.status === 'Rejected');

  const activeRequests = requests.filter(r => r.status !== 'Rejected');
  const internalRequests = activeRequests.filter(r => r.requestCategory === 'internal');
  const customerRequests = activeRequests.filter(r => r.requestCategory === 'customer' || !r.requestCategory);

  // Total expenses across all projects
  const grandTotalExpenses = projects.reduce((sum, p) => {
    const exp = p.expenses;
    if (!exp) return sum;
    const directSum = (exp.fuelCost || 0) + (exp.tollCost || 0) + (exp.hotelCost || 0) + (exp.overtimeCost || 0) + (exp.otherCost || 0);
    const logSum = (exp.expenseLogs || []).reduce((s, l) => s + (l.amount || 0), 0);
    return sum + (logSum > directSum ? logSum : directSum);
  }, 0);

  const handleSelectCategory = (cat: 'all' | 'internal' | 'customer' | 'rejected') => {
    setShowChoiceModal(false);
    onNavigateToRequests(cat);
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE WELCOME BANNER & ENTERPRISE KPI DASHBOARD */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-9 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-24 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/90 text-amber-400 border border-amber-500/30 text-xs font-semibold shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="tracking-wide">LUMENCRAFT ENGINEERING & SERVICE MANAGEMENT SYSTEM</span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.2 rounded font-mono font-bold">REV. 2026</span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight text-white leading-tight">
                ศูนย์กลางควบคุมคำของานวิศวกรรม & บริหารโครงการ
              </h1>
            </div>

            {/* Real-time Current Clock & Date Widget */}
            <div className="bg-slate-950/80 border border-slate-700/80 rounded-2xl p-3 sm:px-4 sm:py-3 flex items-center gap-3 backdrop-blur-md self-start lg:self-auto shadow-inner">
              <div className="p-2 bg-amber-400/10 text-amber-400 rounded-xl border border-amber-400/20">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-left font-mono">
                <div className="text-xs text-slate-400 font-medium">เวลาปัจจุบัน (Live System Clock)</div>
                <div className="text-sm sm:text-base font-bold text-amber-300 flex items-center gap-2">
                  <span>{formattedTimeFull} น.</span>
                  <span className="text-xs text-emerald-400 font-semibold">• เดินตรงเวลา</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">{formattedDateFull}</div>
              </div>
            </div>
          </div>

          {/* KPI Mini-Dashboard Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
            <div className="bg-slate-800/60 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">คำขอทั้งหมด (Total Requests):</span>
                <span className="text-xl font-extrabold font-mono text-white mt-0.5 block">{requests.length} คำขอ</span>
              </div>
              <div className="p-2.5 bg-amber-500/15 text-amber-400 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">งานรอดำเนินการ (Open):</span>
                <span className="text-xl font-extrabold font-mono text-amber-400 mt-0.5 block">{openRequests.length} งาน</span>
              </div>
              <div className="p-2.5 bg-amber-500/15 text-amber-400 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">โครงการที่ดูแล (Projects):</span>
                <span className="text-xl font-extrabold font-mono text-blue-400 mt-0.5 block">{projects.length} โครงการ</span>
              </div>
              <div className="p-2.5 bg-blue-500/15 text-blue-400 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">ค่าใช้จ่ายภาคสนามรวม:</span>
                <span className="text-xl font-extrabold font-mono text-emerald-400 mt-0.5 block">฿{grandTotalExpenses.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE 2 PRIMARY MAIN MENU PORTALS */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h2 className="text-xl font-extrabold text-slate-950 font-heading">
                หน้าเลือกเมนูหลักเพื่อเริ่มใช้งาน (Main Menus)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              เลือกเมนูคำของานวิศวกรรม (Internal / Customer) หรือบริหารโครงการ BRZ ด้านล่าง
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Lumencraft Operations Hub</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ========================================================================= */}
          {/* CARD 1: ENGINEER JOB REQUEST */}
          {/* ========================================================================= */}
          <div className="relative bg-white border-2 border-slate-200 hover:border-amber-400 rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[420px]">
            {/* Top decorative gradient */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-100/70 via-amber-50/40 to-transparent rounded-bl-full pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

            <div className="space-y-5 relative z-10">
              {/* Header inside card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/25">
                    <FileText className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-bold tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 block w-fit mb-1">
                      PORTAL 01 • OPERATIONS
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
                      Engineer Job Request
                    </h3>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-xs">
                  {requests.length} คำขอ
                </span>
              </div>

              {/* Subtitle / Description */}
              <p className="text-xs text-slate-600 leading-relaxed">
                ระบบจัดการคำของานวิศวกรรมและบริการภาคสนาม แยกตารางข้อมูลอย่างเป็นระบบระหว่าง <strong>Internal Request (ภายในบริษัท)</strong> และ <strong>Customer Request (ลูกค้าภายนอก)</strong>
              </p>

              {/* DUAL SELECTION TILES INSIDE THE CARD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                
                {/* 1. Internal Request Tile */}
                <button
                  type="button"
                  onClick={() => onNavigateToRequests('internal')}
                  className="p-3.5 rounded-2xl border-2 border-amber-200/80 bg-amber-50/50 hover:bg-amber-100/70 text-left transition-all hover:border-amber-400 hover:shadow-md active:scale-98 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold font-mono text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded">
                        INTERNAL
                      </span>
                      <span className="text-xs font-extrabold font-mono text-amber-900">
                        {internalRequests.length} งาน
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
                      ตารางข้อมูลคำของานวิศวกรรม (Internal request)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      คำขอภายในบริษัท งานคำนวณแบบ, QC, ตรวจสอบแล็บ, ประชุม
                    </p>
                  </div>
                  <div className="mt-3 text-[11px] font-bold text-amber-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>เปิดตาราง Internal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* 2. Customer Request Tile */}
                <button
                  type="button"
                  onClick={() => onNavigateToRequests('customer')}
                  className="p-3.5 rounded-2xl border-2 border-blue-200/80 bg-blue-50/50 hover:bg-blue-100/70 text-left transition-all hover:border-blue-400 hover:shadow-md active:scale-98 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold font-mono text-blue-800 bg-blue-200/70 px-2 py-0.5 rounded">
                        CUSTOMER
                      </span>
                      <span className="text-xs font-extrabold font-mono text-blue-900">
                        {customerRequests.length} งาน
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                      ตารางข้อมูลคำของานวิศวกรรม (Customer request)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      คำขอจากลูกค้า งานบริการ, On Site, ติดตั้ง, Site Survey, Mock-Up
                    </p>
                  </div>
                  <div className="mt-3 text-[11px] font-bold text-blue-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>เปิดตาราง Customer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

              </div>
            </div>

            {/* Bottom Actions: 2 Clickable Buttons */}
            <div className="pt-5 mt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-semibold border border-amber-200">
                  รอดำเนินการ: {openRequests.length}
                </span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-semibold border border-blue-200">
                  กำลังทำ: {inProgressRequests.length}
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-semibold border border-emerald-200">
                  เสร็จสิ้น: {completedRequests.length}
                </span>
              </div>

              {/* 2 MAIN BUTTONS FOR ENGINEER JOB REQUEST */}
              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                
                {/* BUTTON 1: + สร้างคำขอ */}
                <button
                  type="button"
                  onClick={onNewRequest}
                  className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-amber-300 shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
                  title="คลิกเพื่อสร้างคำของานวิศวกรรมใหม่"
                >
                  <Plus className="w-4 h-4 text-amber-700" />
                  <span>+ สร้างคำขอ</span>
                </button>

                {/* BUTTON 2: เข้าสู่หน้า engineer job request (เปิดตัวเลือก) */}
                <button
                  type="button"
                  onClick={() => setShowChoiceModal(true)}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white hover:text-amber-300 font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
                  title="คลิกเพื่อเลือกเปิดหน้า Engineer Requests Master Sheet (Internal / Customer)"
                >
                  <span>เข้าสู่หน้า engineer job request</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CARD 2: BRZ PROJECT */}
          {/* ========================================================================= */}
          <div className="relative bg-white border-2 border-slate-200 hover:border-blue-400 rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[420px]">
            {/* Top decorative gradient & corner shape */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-100/70 via-blue-50/40 to-transparent rounded-bl-full pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />

            <div className="space-y-5 relative z-10">
              {/* Header inside card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/25">
                    <Building2 className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-bold tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 block w-fit mb-1">
                      PORTAL 02 • MANAGEMENT
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
                      BRZ Project
                    </h3>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold bg-blue-900 text-white px-3 py-1.5 rounded-xl shadow-xs">
                  {projects.length} โครงการ
                </span>
              </div>

              {/* Subtitle / Description */}
              <p className="text-xs text-slate-600 leading-relaxed">
                สารบบควบคุมและบริหารโครงการเชิงวิศวกรรมแสงสว่าง ติดตามสถานะความคืบหน้ารายโครงการ เชื่อมโยงใบสั่งขาย (SO Number) ตารางคำขอ และประวัติค่าใช้จ่าย
              </p>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2 text-slate-700">
                  <span className="p-1 bg-blue-100 text-blue-800 rounded-md shrink-0">
                    <Building className="w-3.5 h-3.5" />
                  </span>
                  <span className="truncate font-medium">ควบคุมรหัส PRJ & SO</span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2 text-slate-700">
                  <span className="p-1 bg-indigo-100 text-indigo-800 rounded-md shrink-0">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </span>
                  <span className="truncate font-medium">ไทม์ไลน์ Gantt Chart</span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2 text-slate-700">
                  <span className="p-1 bg-emerald-100 text-emerald-800 rounded-md shrink-0">
                    <CreditCard className="w-3.5 h-3.5" />
                  </span>
                  <span className="truncate font-medium">บันทึกค่าน้ำมัน & OT</span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2 text-slate-700">
                  <span className="p-1 bg-purple-100 text-purple-800 rounded-md shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </span>
                  <span className="truncate font-medium">ผูกโยงคำขอที่เกี่ยวข้อง</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions: 2 Clickable Buttons */}
            <div className="pt-5 mt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-semibold border border-blue-200">
                  โครงการทั้งหมด: {projects.length}
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-semibold border border-emerald-200">
                  ค่าใช้จ่ายรวม: ฿{grandTotalExpenses.toLocaleString()}
                </span>
              </div>

              {/* 2 EXPLICIT BUTTONS FOR BRZ PROJECT */}
              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                
                {/* BUTTON 1: + เพิ่มโครงการ */}
                <button
                  type="button"
                  onClick={onNewProject}
                  className="px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-blue-300 shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
                  title="คลิกเพื่อเพิ่มโครงการวิศวกรรมใหม่"
                >
                  <Plus className="w-4 h-4 text-blue-700" />
                  <span>+ เพิ่มโครงการ</span>
                </button>

                {/* BUTTON 2: เข้าสู่หน้า brz project */}
                <button
                  type="button"
                  onClick={() => onNavigate('projects')}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white hover:text-blue-300 font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
                  title="คลิกเพื่อเปิดหน้าระบบสารบบโครงการ BRZ"
                >
                  <span>เข้าสู่หน้า brz project</span>
                  <ArrowRight className="w-4 h-4 text-blue-400" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2.5 GOOGLE SHEETS UNIFIED CLOUD DATABASE & LOCKED PHOTO SYNC BANNER (HIDDEN) */}
      {/* ========================================================================= */}
      <div className="hidden bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-7 border border-emerald-800/80 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-950">
              <Sheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-lg text-white">
                  Google Sheets Unified Database & Image Cloud Sync
                </h3>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded border border-emerald-400/30">
                  3 SHEETS TABS
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-1 max-w-2xl leading-relaxed">
                จัดเก็บข้อมูลทุกคำขอและโครงการทั้งหมดลง Google Sheets ก้อนเดียวกันทุก Gmail Login พร้อมล็อกความกว้างคอลลั่มรูปภาพและส่วนสูงเซลล์ให้แสดงผลรูปภาพได้อย่างสวยงามและสมส่วน
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-mono text-emerald-300">
                <span className="flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ฐานข้อมูลก้อนเดียว</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ล็อกคอลลั่มขนาดรูปภาพ</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ปลอดภัยด้วย Gmail OAuth</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            {currentSheetUrl && (
              <a
                href={currentSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>เปิดดู Google Sheet</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </a>
            )}
            {onOpenGoogleSheets && (
              <button
                onClick={onOpenGoogleSheets}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Sheet className="w-4 h-4" />
                <span>จัดการซิงค์ Google Sheets</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SELECTION MODAL: WHEN CLICKING "เข้าสู่หน้า engineer job request" */}
      {/* ========================================================================= */}
      {showChoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-heading">
                    เลือกมุมมองตารางข้อมูลคำของานวิศวกรรม
                  </h3>
                  <p className="text-xs text-slate-400">
                    Engineer Requests Master Sheet Selection
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowChoiceModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Options Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 font-medium">
                กรุณาเลือกประเภทตารางข้อมูลคำของานวิศวกรรมที่ต้องการเข้าใช้งาน:
              </p>

              <div className="grid grid-cols-1 gap-3.5">
                
                {/* OPTION 1: Internal Request */}
                <button
                  type="button"
                  onClick={() => handleSelectCategory('internal')}
                  className="p-4 rounded-2xl border-2 border-amber-200 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50 text-left transition-all hover:shadow-md flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm mt-0.5">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900 group-hover:text-amber-900 transition-colors">
                          ตารางข้อมูลคำของานวิศวกรรม (Engineer Requests Master Sheet) Internal request
                        </span>
                        <span className="text-[11px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                          {internalRequests.length} งาน
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        สำหรับงานคำขอภายในบริษัท เช่น งานคำนวณแบบ, นับแบบ Take-off / BOQ, ตรวจสอบคุณภาพสินค้า QC, รายงานผลทดสอบในแล็บ, ประชุมทางเทคนิค
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                </button>

                {/* OPTION 2: Customer Request */}
                <button
                  type="button"
                  onClick={() => handleSelectCategory('customer')}
                  className="p-4 rounded-2xl border-2 border-blue-200 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 text-left transition-all hover:shadow-md flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm mt-0.5">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-slate-900 group-hover:text-blue-900 transition-colors">
                          ตารางข้อมูลคำของานวิศวกรรม (Engineer Requests Master Sheet) Customer request
                        </span>
                        <span className="text-[11px] font-mono font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full">
                          {customerRequests.length} งาน
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        สำหรับงานคำขอจากลูกค้าภายนอก เช่น บริการ On Site หน้างาน, ติดตั้ง Installation, ตรวจไซต์ Site Survey, สาธิต Mock-Up, งานเคลมสินค้า
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                </button>

                {/* OPTION 3: All Requests Master Sheet */}
                <button
                  type="button"
                  onClick={() => handleSelectCategory('all')}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800">
                        ดูตารางคำขอทั้งหมด (All Active Requests)
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        แสดงข้อมูลคำของานวิศวกรรมรวมทั้งหมด ({activeRequests.length} คำขอ)
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* OPTION 4: Rejected Requests (คำขอที่ถูกปฏิเสธ) */}
                <button
                  type="button"
                  onClick={() => handleSelectCategory('rejected')}
                  className="p-3.5 rounded-2xl border border-red-200 hover:border-red-400 bg-red-50/50 hover:bg-red-50 text-left transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-700 text-white flex items-center justify-center font-bold shrink-0">
                      <X className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-red-950">
                          ดูคำขอที่ถูกปฏิเสธ (Rejected Requests Archive)
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-red-200 text-red-900 px-2 py-0.2 rounded-full">
                          {rejectedRequests.length} คำขอ
                        </span>
                      </div>
                      <span className="text-[11px] text-red-700/80 block">
                        จัดเก็บประวัติคำขอที่ถูกปฏิเสธพร้อมเหตุผล และสามารถเปิดพิจารณารับงานใหม่ได้
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-600 group-hover:translate-x-1 transition-transform" />
                </button>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowChoiceModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors"
              >
                ยกเลิก
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
