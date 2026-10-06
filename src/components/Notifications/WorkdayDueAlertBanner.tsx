import React, { useState } from 'react';
import { EngineerRequest, Project } from '../../types';
import { AlertTriangle, Clock, ChevronRight, X, BellRing, Calendar, User, FileText } from 'lucide-react';

interface WorkdayDueAlertBannerProps {
  requests: EngineerRequest[];
  projects: Project[];
  onSelectRequest: (req: EngineerRequest) => void;
  onSelectProject?: (proj: Project) => void;
}

export const WorkdayDueAlertBanner: React.FC<WorkdayDueAlertBannerProps> = ({
  requests,
  projects,
  onSelectRequest,
  onSelectProject
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Helper to calculate business/workday difference
  const getDaysDiff = (targetDateStr: string): number | null => {
    if (!targetDateStr) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);
    if (isNaN(target.getTime())) return null;
    const diffTime = target.getTime() - now.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  // Find requests due in 1 workday (diff <= 1 and not completed)
  const urgentRequests = requests.filter(r => {
    if (r.status === 'Completed' || r.status === 'Rejected') return false;
    const diff = getDaysDiff(r.dueDate || r.deliveryDate || '');
    return diff !== null && diff <= 1; // 1 day before due, due today, or overdue
  });

  // Find projects due in 1 workday
  const urgentProjects = projects.filter(p => {
    if (p.status === 'Completed') return false;
    const diff = getDaysDiff(p.targetDate || '');
    return diff !== null && diff <= 1;
  });

  const totalUrgentCount = urgentRequests.length + urgentProjects.length;

  if (totalUrgentCount === 0 || isDismissed) {
    return null;
  }

  return (
    <aside aria-label="System notification banner" className="no-print w-full mb-4 animate-fadeIn">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-2xl shadow-lg border-2 border-red-400/40 p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 relative overflow-hidden">
        
        {/* Pulsing visual glow effect */}
        <div className="absolute top-0 right-0 w-48 h-full bg-white/10 blur-xl pointer-events-none" />

        {/* Left message with flashing / blinking notification icon */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="relative flex items-center justify-center">
            <span className="w-4 h-4 rounded-full bg-yellow-300 animate-ping absolute" />
            <span className="w-3.5 h-3.5 rounded-full bg-yellow-400 relative z-10" />
            <div className="w-9 h-9 rounded-xl bg-black/20 flex items-center justify-center font-bold ml-1">
              <BellRing className="w-5 h-5 text-yellow-300 animate-bounce" />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-black/30 text-yellow-300 font-mono font-bold text-[11px] uppercase tracking-wider border border-yellow-300/30 animate-pulse">
                ⚡ แจ้งเตือนก่อน 1 วันทำงาน (1-Workday Advance Alert)
              </span>
              <span className="text-xs font-mono font-bold bg-white text-red-700 px-2 py-0.5 rounded-full">
                พบ {totalUrgentCount} งานใกล้ถึงกำหนด
              </span>
            </div>
            <p className="text-xs text-white/95 mt-0.5 font-medium leading-tight">
              มีคำของานวิศวกรรม ({urgentRequests.length} งาน) และโครงการ ({urgentProjects.length} โครงการ) ที่มีกำหนดส่งมอบภายใน 1 วันทำงาน กรุณาติดตามและตรวจสอบ
            </p>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2 relative z-10 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3.5 py-1.5 bg-white text-red-700 hover:bg-yellow-300 hover:text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>{isExpanded ? 'ย่อรายละเอียด' : 'ดูรายการงานด่วน'}</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
          
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-xl hover:bg-black/20 text-white/80 hover:text-white transition-colors"
            title="ซ่อนการแจ้งเตือนชั่วคราว"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Expanded Urgent Items Dropdown List */}
      {isExpanded && (
        <div className="mt-2 p-4 bg-white rounded-2xl border-2 border-red-200 shadow-xl space-y-3">
          <div className="text-xs font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-red-600" />
              <span>รายการงานวิศวกรรมที่ครบกำหนดภายใน 1 วันทำการ หรือเกินกำหนด</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">คลิกที่รายการเพื่อเปิดดูข้อมูล</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {urgentRequests.map(r => {
              const diff = getDaysDiff(r.dueDate || r.deliveryDate || '');
              const isOverdue = diff !== null && diff < 0;
              const isToday = diff === 0;

              return (
                <div
                  key={r.id}
                  onClick={() => onSelectRequest(r)}
                  className="p-3 bg-red-50/60 hover:bg-red-100/70 border border-red-200 rounded-xl cursor-pointer transition-all flex items-center justify-between group text-left"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-red-900">{r.documentNo}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-bold font-mono bg-red-200 text-red-800">
                        {isOverdue ? '⚠️ เกินกำหนด' : isToday ? '🔴 ครบกำหนดวันนี้' : '🟡 ครบกำหนดพรุ่งนี้ (1 วัน)'}
                      </span>
                      {r.requestCategory === 'internal' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-200 text-amber-900">
                          Internal
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-900 truncate max-w-[280px]">
                      {r.projectName}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>วิศวกร: {r.engineerStaff || '-'}</span>
                      <span>กำหนด: {r.dueDate || r.deliveryDate}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-500 group-hover:translate-x-1 transition-transform" />
                </div>
              );
            })}

            {urgentProjects.map(p => {
              const diff = getDaysDiff(p.targetDate || '');
              const isOverdue = diff !== null && diff < 0;
              const isToday = diff === 0;

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProject && onSelectProject(p)}
                  className="p-3 bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200 rounded-xl cursor-pointer transition-all flex items-center justify-between group text-left"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-blue-900">{p.projectCode}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-bold font-mono bg-blue-200 text-blue-800">
                        {isOverdue ? '⚠️ เกินกำหนด' : isToday ? '🔴 ส่งมอบวันนี้' : '🟡 ส่งมอบพรุ่งนี้ (1 วัน)'}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 truncate max-w-[280px]">
                      {p.projectName}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>วิศวกร: {p.engineerName || '-'}</span>
                      <span>เป้าหมาย: {p.targetDate}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
