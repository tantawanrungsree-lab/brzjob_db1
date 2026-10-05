import React from 'react';
import { ActiveView, EngineerRequest, Project } from '../types';
import { 
  FileText, Building2, ArrowRight, Plus, 
  Clock, Layers, BarChart3, Calendar, CreditCard, 
  ShieldCheck, UserCheck, FileSpreadsheet
} from 'lucide-react';

interface HomeHeroProps {
  onNavigate: (view: ActiveView) => void;
  requests: EngineerRequest[];
  projects: Project[];
  onOpenRequest: (req: EngineerRequest) => void;
  onPrintRequest: (req: EngineerRequest) => void;
  onNewRequest: () => void;
  onNewProject: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onNavigate,
  requests,
  projects,
  onNewRequest,
  onNewProject
}) => {
  const openRequests = requests.filter(r => r.status === 'Open');
  const inProgressRequests = requests.filter(r => r.status === 'In Progress');
  const completedRequests = requests.filter(r => r.status === 'Completed');

  // Total expenses across all projects
  const grandTotalExpenses = projects.reduce((sum, p) => {
    const exp = p.expenses;
    if (!exp) return sum;
    const directSum = (exp.fuelCost || 0) + (exp.tollCost || 0) + (exp.hotelCost || 0) + (exp.overtimeCost || 0) + (exp.otherCost || 0);
    const logSum = (exp.expenseLogs || []).reduce((s, l) => s + (l.amount || 0), 0);
    return sum + (logSum > directSum ? logSum : directSum);
  }, 0);

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
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/90 text-amber-400 border border-amber-500/30 text-xs font-semibold shadow-inner">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="tracking-wide">LUMENCRAFT ENGINEERING & SERVICE MANAGEMENT SYSTEM</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.2 rounded font-mono font-bold">REV. 2026</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight text-white leading-tight">
                ศูนย์กลางควบคุมคำของานวิศวกรรม & บริหารโครงการ
              </h1>
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
                เลือกเมนูหลักเพื่อเริ่มใช้งาน (Main Menus)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              กดปุ่ม <strong className="text-slate-800">+ สร้างคำขอ / + เพิ่มโครงการ</strong> หรือกดปุ่ม <strong className="text-slate-800">เข้าสู่หน้าระบบ</strong> ด้านล่างเพื่อเริ่มการทำงาน
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Lumencraft Operations Hub</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ========================================================================= */}
          {/* CARD 1: ENGINEER JOB REQUEST (มี 2 ปุ่ม: + สร้างคำขอ และ เข้าสู่หน้า engineer job request) */}
          {/* ========================================================================= */}
          <div className="relative bg-white border-2 border-slate-200 hover:border-amber-400 rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[360px]">
            {/* Top decorative gradient & corner shape */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-100/70 via-amber-50/40 to-transparent rounded-bl-full pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

            <div className="space-y-5 relative z-10">
              {/* Header inside card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/25">
                    <FileText className="w-8 h-8" />
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
                ระบบจัดการคำของานวิศวกรรมและบริการภาคสนาม ควบคุมเอกสารคำขอตามแบบฟอร์มมาตรฐาน Lumencraft Service Request พร้อมระบบปฏิทินงานและตารางคำขอ Master Spreadsheet
              </p>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2 text-slate-700">
                  <span className="p-1 bg-amber-100 text-amber-800 rounded-md shrink-0">
                    <Layers className="w-3.5 h-3.5" />
                  </span>
                  <span className="truncate font-medium">8 หมวดงานมาตรฐาน</span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2 text-slate-700">
                  <span className="p-1 bg-blue-100 text-blue-800 rounded-md shrink-0">
                    <UserCheck className="w-3.5 h-3.5" />
                  </span>
                  <span className="truncate font-medium">ระบบรับงานของวิศวกร</span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2 text-slate-700">
                  <span className="p-1 bg-emerald-100 text-emerald-800 rounded-md shrink-0">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  </span>
                  <span className="truncate font-medium">ตาราง Excel & Print Preview</span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2 text-slate-700">
                  <span className="p-1 bg-purple-100 text-purple-800 rounded-md shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                  <span className="truncate font-medium">พิมพ์ใบคำขอ A4 ทางการ</span>
                </div>
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

              {/* 2 EXPLICIT BUTTONS FOR ENGINEER JOB REQUEST */}
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

                {/* BUTTON 2: เข้าสู่หน้า engineer job request */}
                <button
                  type="button"
                  onClick={() => onNavigate('requests')}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white hover:text-amber-300 font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
                  title="คลิกเพื่อเปิดหน้าระบบคำของานวิศวกรรม"
                >
                  <span>เข้าสู่หน้า engineer job request</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CARD 2: BRZ PROJECT (มี 2 ปุ่ม: + เพิ่มโครงการ และ เข้าสู่หน้า brz project) */}
          {/* ========================================================================= */}
          <div className="relative bg-white border-2 border-slate-200 hover:border-blue-400 rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[360px]">
            {/* Top decorative gradient & corner shape */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-100/70 via-blue-50/40 to-transparent rounded-bl-full pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />

            <div className="space-y-5 relative z-10">
              {/* Header inside card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/25">
                    <Building2 className="w-8 h-8" />
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

                <span className="text-xs font-mono font-bold bg-blue-950 text-blue-200 px-3 py-1.5 rounded-xl shadow-xs">
                  {projects.length} โครงการ
                </span>
              </div>

              {/* Subtitle / Description */}
              <p className="text-xs text-slate-600 leading-relaxed">
                ศูนย์กลางฐานข้อมูลโครงการ ไทม์ไลน์งานสไตล์ Microsoft Project Gantt พร้อมระบบวิเคราะห์งบประมาณและสรุปค่าใช้จ่ายภาคสนาม (Total Project Expenses)
              </p>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2 text-slate-700">
                  <span className="p-1 bg-blue-100 text-blue-800 rounded-md shrink-0">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </span>
                  <span className="truncate font-medium">Taskbar Stages 1-6</span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2 text-slate-700">
                  <span className="p-1 bg-indigo-100 text-indigo-800 rounded-md shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                  </span>
                  <span className="truncate font-medium">Microsoft Project Gantt</span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2 text-slate-700">
                  <span className="p-1 bg-emerald-100 text-emerald-800 rounded-md shrink-0">
                    <CreditCard className="w-3.5 h-3.5" />
                  </span>
                  <span className="truncate font-medium">สรุปค่าใช้จ่าย (Expenses)</span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2 text-slate-700">
                  <span className="p-1 bg-rose-100 text-rose-800 rounded-md shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                  <span className="truncate font-medium">ประวัติการเคลม & เปลี่ยนอะไหล่</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions: 2 Clickable Buttons */}
            <div className="pt-5 mt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">
                  ค่าใช้จ่ายรวม: <strong className="text-emerald-700 font-mono font-bold">฿{grandTotalExpenses.toLocaleString()}</strong>
                </span>
              </div>

              {/* 2 EXPLICIT BUTTONS FOR BRZ PROJECT */}
              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                
                {/* BUTTON 1: + เพิ่มโครงการ */}
                <button
                  type="button"
                  onClick={onNewProject}
                  className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-blue-200 shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
                  title="คลิกเพื่อเพิ่มโครงการใหม่"
                >
                  <Plus className="w-4 h-4 text-blue-700" />
                  <span>+ เพิ่มโครงการ</span>
                </button>

                {/* BUTTON 2: เข้าสู่หน้า brz project */}
                <button
                  type="button"
                  onClick={() => onNavigate('projects')}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white hover:text-blue-300 font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
                  title="คลิกเพื่อเปิดหน้าศูนย์ข้อมูลโครงการ BRZ Project"
                >
                  <span>เข้าสู่หน้า brz project</span>
                  <ArrowRight className="w-4 h-4 text-blue-400" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
