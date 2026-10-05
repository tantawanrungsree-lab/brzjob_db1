import React, { useState } from 'react';
import { Project, EngineerRequest, ProjectStatus, PROJECT_STATUS_CONFIG } from '../../types';
import { 
  Plus, Search, Building2, Phone, Mail, User, ShieldCheck, 
  Eye, Edit2, Trash2, FileText, ArrowUpDown, ChevronRight, 
  CheckCircle2, AlertTriangle, Clock, PauseCircle, Flag, ArrowUpRight,
  Download, FileSpreadsheet
} from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  requests: EngineerRequest[];
  onAddNew: () => void;
  onEdit: (project: Project) => void;
  onView: (project: Project) => void;
  onDelete: (id: string) => void;
  onCreateRequestForProject: (projectId: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  requests,
  onAddNew,
  onEdit,
  onView,
  onDelete,
  onCreateRequestForProject
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  // Calculate status counts & percentages matching the 6 cards in image
  const totalCount = projects.length;
  
  const getCountForStatus = (statusKey: ProjectStatus) => {
    if (statusKey === 'On Track') {
      return projects.filter(p => p.status === 'On Track' || p.status === 'In Progress' || p.status === 'Planning').length;
    }
    return projects.filter(p => p.status === statusKey).length;
  };

  const onTrackCount = getCountForStatus('On Track');
  const atRiskCount = getCountForStatus('At Risk');
  const overdueCount = getCountForStatus('Overdue');
  const onHoldCount = getCountForStatus('On Hold');
  const completedCount = getCountForStatus('Completed');

  const onTrackPct = totalCount > 0 ? Math.round((onTrackCount / totalCount) * 100) : 0;
  const atRiskPct = totalCount > 0 ? Math.round((atRiskCount / totalCount) * 100) : 0;
  const overduePct = totalCount > 0 ? Math.round((overdueCount / totalCount) * 100) : 0;
  const onHoldPct = totalCount > 0 ? Math.round((onHoldCount / totalCount) * 100) : 0;
  const completedPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredProjects = projects.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !searchQuery ||
      p.projectCode.toLowerCase().includes(q) ||
      p.soNumber.toLowerCase().includes(q) ||
      p.projectName.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.customerEmail.toLowerCase().includes(q) ||
      p.customerPhone.toLowerCase().includes(q) ||
      p.engineerName.toLowerCase().includes(q) ||
      p.salesName.toLowerCase().includes(q);

    let matchStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'On Track') {
        matchStatus = p.status === 'On Track' || p.status === 'In Progress' || p.status === 'Planning';
      } else {
        matchStatus = p.status === statusFilter;
      }
    }

    return matchSearch && matchStatus;
  });

  const getLinkedRequestCount = (project: Project) => {
    return requests.filter(r => r.projectId === project.id || r.projectCode === project.projectCode).length;
  };

  const getGanttStageInfo = (p: Project) => {
    const linked = requests.filter(r => r.projectId === p.id || r.projectCode === p.projectCode);
    const onSiteVisits = linked.filter(r => r.jobTypes?.onSite || r.jobTypes?.siteSurvey || r.jobTypes?.installation || r.jobTypes?.service);
    const hasMockUp = linked.some(r => r.jobTypes?.mockUp);
    const hasQC = linked.some(r => r.jobTypes?.qc);
    const hasInstall = linked.some(r => r.jobTypes?.installation);

    if (p.status === 'Completed') {
      return {
        stageId: 6,
        stageName: 'Stage 6: ส่งมอบงาน & รับประกัน',
        shortName: 'Stage 6: ส่งมอบ & รับประกัน',
        progress: 100,
        badgeClass: 'bg-purple-100 text-purple-900 border-purple-200',
        dotClass: 'bg-purple-600',
        barColor: 'bg-purple-600'
      };
    }

    if (hasQC) {
      return {
        stageId: 5,
        stageName: 'Stage 5: QC & ทดสอบระบบ',
        shortName: 'Stage 5: QC & ทดสอบระบบ',
        progress: 85,
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
        dotClass: 'bg-emerald-600',
        barColor: 'bg-emerald-600'
      };
    }

    if (hasInstall || p.status === 'In Progress' || p.status === 'On Track') {
      if (hasMockUp) {
        return {
          stageId: 4,
          stageName: 'Stage 4: ส่งมอบ & ดูแลติดตั้ง',
          shortName: 'Stage 4: ดูแลติดตั้งภาคสนาม',
          progress: 70,
          badgeClass: 'bg-blue-100 text-blue-900 border-blue-200',
          dotClass: 'bg-blue-600',
          barColor: 'bg-blue-600'
        };
      }
    }

    if (hasMockUp) {
      return {
        stageId: 3,
        stageName: 'Stage 3: Mock-Up & เสนอราคา',
        shortName: 'Stage 3: Mock-Up & เสนอราคา',
        progress: 50,
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        dotClass: 'bg-amber-500',
        barColor: 'bg-amber-500'
      };
    }

    if (onSiteVisits.length > 0) {
      return {
        stageId: 2,
        stageName: 'Stage 2: สำรวจหน้างาน & สเปค',
        shortName: 'Stage 2: สำรวจหน้างาน & สเปค',
        progress: 35,
        badgeClass: 'bg-teal-100 text-teal-900 border-teal-200',
        dotClass: 'bg-teal-600',
        barColor: 'bg-teal-600'
      };
    }

    return {
      stageId: 1,
      stageName: 'Stage 1: วางแผน & วิเคราะห์แบบ',
      shortName: 'Stage 1: วางแผน & วิเคราะห์แบบ',
      progress: 20,
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
      dotClass: 'bg-slate-500',
      barColor: 'bg-slate-500'
    };
  };

  const handleExportCSV = () => {
    const headers = ['No', 'Project Code', 'SO No', 'Project Name', 'Customer Name', 'Customer Email', 'Customer Phone', 'Engineer Name', 'Sales in Charge', 'Gantt Stage (สถานะปัจจุบัน)', 'Gantt Progress %', 'Status', 'Linked Requests Count'];
    const rows = filteredProjects.map((p, i) => {
      const gantt = getGanttStageInfo(p);
      return [
        i + 1,
        p.projectCode,
        `"${p.soNumber.replace(/"/g, '""')}"`,
        `"${p.projectName.replace(/"/g, '""')}"`,
        `"${p.customerName.replace(/"/g, '""')}"`,
        p.customerEmail || '',
        p.customerPhone || '',
        `"${p.engineerName.replace(/"/g, '""')}"`,
        `"${p.salesName.replace(/"/g, '""')}"`,
        `"${gantt.stageName}"`,
        `${gantt.progress}%`,
        p.status,
        getLinkedRequestCount(p)
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lumencraft_projects_master_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'On Track':
      case 'In Progress':
      case 'Planning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>ตามแผน (On Track)</span>
          </span>
        );
      case 'At Risk':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>เสี่ยงล่าช้า (At Risk)</span>
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            <span>เกินกำหนด (Overdue)</span>
          </span>
        );
      case 'On Hold':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>หยุดโครงการ (On Hold)</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            <span>เสร็จสิ้น (Completed)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">
              PROJECT REPOSITORY
            </span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900">
            ศูนย์ข้อมูลโครงการทั้งหมด (Project Directory)
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>+ เพิ่มโครงการใหม่ (New Project)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6 STATUS SUMMARY CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* CARD 1: โครงการทั้งหมด (Total Projects) - Blue */}
        <button
          onClick={() => setStatusFilter('all')}
          className={`text-left rounded-xl p-3.5 text-white transition-all shadow-sm relative overflow-hidden bg-gradient-to-r from-blue-700 to-blue-500 hover:opacity-95 ${
            statusFilter === 'all' ? 'ring-3 ring-blue-300 ring-offset-2 scale-[1.02]' : 'opacity-90 hover:opacity-100'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-black font-mono-data leading-none">{totalCount}</div>
              <div className="text-xs font-bold mt-1 text-white">โครงการทั้งหมด</div>
              <div className="text-[10px] text-blue-100 font-medium">Total Projects</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-blue-100 font-medium">
            <span>ฐานข้อมูลรวม</span>
            <span className="font-mono-data font-semibold">100%</span>
          </div>
        </button>

        {/* CARD 2: ตามแผน (On Track) - Green */}
        <button
          onClick={() => setStatusFilter('On Track')}
          className={`text-left rounded-xl p-3.5 text-white transition-all shadow-sm relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 ${
            statusFilter === 'On Track' ? 'ring-3 ring-emerald-300 ring-offset-2 scale-[1.02]' : 'opacity-90 hover:opacity-100'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-black font-mono-data leading-none">{onTrackCount}</div>
              <div className="text-xs font-bold mt-1 text-white">ตามแผน</div>
              <div className="text-[10px] text-emerald-100 font-medium">On Track</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-emerald-100 font-medium">
            <div className="w-16 h-1.5 rounded-full bg-white/30 overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, onTrackPct)}%` }} />
            </div>
            <span className="font-mono-data font-semibold">{onTrackPct}%</span>
          </div>
        </button>

        {/* CARD 3: เสี่ยงล่าช้า (At Risk) - Amber/Yellow */}
        <button
          onClick={() => setStatusFilter('At Risk')}
          className={`text-left rounded-xl p-3.5 text-white transition-all shadow-sm relative overflow-hidden bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-95 ${
            statusFilter === 'At Risk' ? 'ring-3 ring-amber-300 ring-offset-2 scale-[1.02]' : 'opacity-90 hover:opacity-100'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-black font-mono-data leading-none">{atRiskCount}</div>
              <div className="text-xs font-bold mt-1 text-white">เสี่ยงล่าช้า</div>
              <div className="text-[10px] text-amber-100 font-medium">At Risk</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-amber-100 font-medium">
            <div className="w-16 h-1.5 rounded-full bg-white/30 overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, atRiskPct)}%` }} />
            </div>
            <span className="font-mono-data font-semibold">{atRiskPct}%</span>
          </div>
        </button>

        {/* CARD 4: เกินกำหนด (Overdue) - Red */}
        <button
          onClick={() => setStatusFilter('Overdue')}
          className={`text-left rounded-xl p-3.5 text-white transition-all shadow-sm relative overflow-hidden bg-gradient-to-r from-red-600 to-rose-500 hover:opacity-95 ${
            statusFilter === 'Overdue' ? 'ring-3 ring-red-300 ring-offset-2 scale-[1.02]' : 'opacity-90 hover:opacity-100'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-black font-mono-data leading-none">{overdueCount}</div>
              <div className="text-xs font-bold mt-1 text-white">เกินกำหนด</div>
              <div className="text-[10px] text-red-100 font-medium">Overdue</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-red-100 font-medium">
            <div className="w-16 h-1.5 rounded-full bg-white/30 overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, overduePct)}%` }} />
            </div>
            <span className="font-mono-data font-semibold">{overduePct}%</span>
          </div>
        </button>

        {/* CARD 5: หยุดโครงการ (On Hold) - Slate/Gray */}
        <button
          onClick={() => setStatusFilter('On Hold')}
          className={`text-left rounded-xl p-3.5 text-white transition-all shadow-sm relative overflow-hidden bg-gradient-to-r from-slate-600 to-slate-500 hover:opacity-95 ${
            statusFilter === 'On Hold' ? 'ring-3 ring-slate-300 ring-offset-2 scale-[1.02]' : 'opacity-90 hover:opacity-100'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0">
              <PauseCircle className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-black font-mono-data leading-none">{onHoldCount}</div>
              <div className="text-xs font-bold mt-1 text-white">หยุดโครงการ</div>
              <div className="text-[10px] text-slate-200 font-medium">On Hold</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-200 font-medium">
            <div className="w-16 h-1.5 rounded-full bg-white/30 overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, onHoldPct)}%` }} />
            </div>
            <span className="font-mono-data font-semibold">{onHoldPct}%</span>
          </div>
        </button>

        {/* CARD 6: เสร็จสิ้น (Completed) - Purple */}
        <button
          onClick={() => setStatusFilter('Completed')}
          className={`text-left rounded-xl p-3.5 text-white transition-all shadow-sm relative overflow-hidden bg-gradient-to-r from-purple-700 to-indigo-600 hover:opacity-95 ${
            statusFilter === 'Completed' ? 'ring-3 ring-purple-300 ring-offset-2 scale-[1.02]' : 'opacity-90 hover:opacity-100'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="p-2 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0">
              <Flag className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-black font-mono-data leading-none">{completedCount}</div>
              <div className="text-xs font-bold mt-1 text-white">เสร็จสิ้น</div>
              <div className="text-[10px] text-purple-100 font-medium">Completed</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-purple-100 font-medium">
            <div className="w-16 h-1.5 rounded-full bg-white/30 overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${Math.min(100, completedPct)}%` }} />
            </div>
            <span className="font-mono-data font-semibold">{completedPct}%</span>
          </div>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* EXCEL SPREADSHEET CONTAINER */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden flex flex-col">
        
        {/* Excel Ribbon / Green Header Bar */}
        <div className="bg-[#107c41] text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 text-white font-bold flex items-center justify-center font-mono text-sm border border-white/30">
              XL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-heading text-white">
                  ตารางข้อมูลโครงการ (Projects Master Sheet)
                </h2>
                <span className="text-[11px] bg-emerald-950/60 text-emerald-200 px-2 py-0.5 rounded font-mono">
                  {filteredProjects.length} จาก {projects.length} แถว
                </span>
              </div>
              <p className="text-[11px] text-emerald-100">
                ข้อมูลรหัสโครงการ, SO No., ลูกค้า, อีเมล, วิศวกร, เซลล์ และสถานะการดำเนินงาน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold rounded-lg transition-colors shadow-xs"
              title="ส่งออกตารางเป็นไฟล์ Excel / CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ส่งออก Excel (.csv)</span>
            </button>
          </div>
        </div>

        {/* Excel Search & Filter Toolbar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหา Project Code, SO No., ชื่อโครงการ, ลูกค้า, อีเมล, วิศวกร, หรือเซลล์..."
              className="w-full pl-8 pr-4 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-1 focus:ring-[#107c41] focus:border-[#107c41] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full sm:w-auto px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:ring-1 focus:ring-[#107c41]"
            >
              <option value="all">สถานะทั้งหมด ({totalCount})</option>
              <option value="On Track">ตามแผน (On Track - {onTrackCount})</option>
              <option value="At Risk">เสี่ยงล่าช้า (At Risk - {atRiskCount})</option>
              <option value="Overdue">เกินกำหนด (Overdue - {overdueCount})</option>
              <option value="On Hold">หยุดโครงการ (On Hold - {onHoldCount})</option>
              <option value="Completed">เสร็จสิ้น (Completed - {completedCount})</option>
            </select>
          </div>
        </div>

        {/* Excel Spreadsheet Table */}
        <div className="overflow-x-auto max-h-[72vh]">
          <table className="w-full text-left text-xs border-collapse font-sans">
            
            {/* Table Header Styled Like Excel Column Grid */}
            <thead className="bg-[#f3f4f6] text-slate-800 font-bold border-b border-slate-300 sticky top-0 z-20 shadow-xs">
              <tr className="divide-x divide-slate-300 text-slate-700">
                <th className="py-2.5 px-3 text-center bg-slate-200/90 w-12 font-mono text-slate-600">No.</th>
                <th className="py-2.5 px-3 min-w-[130px]">Project Code</th>
                <th className="py-2.5 px-3 min-w-[130px]">SO No.</th>
                <th className="py-2.5 px-3 min-w-[200px]">Project Name (ชื่อโครงการ)</th>
                <th className="py-2.5 px-3 min-w-[150px]">Customer Name</th>
                <th className="py-2.5 px-3 min-w-[150px]">Customer E-MAIL</th>
                <th className="py-2.5 px-3 min-w-[120px]">Phone</th>
                <th className="py-2.5 px-3 min-w-[140px]">Engineer Name</th>
                <th className="py-2.5 px-3 min-w-[130px]">Sale in Charge</th>
                <th className="py-2.5 px-3 min-w-[210px] bg-slate-200/50">
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    <span>สถานะปัจจุบัน (Gantt Timeline)</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center min-w-[130px]">Status</th>
                <th className="py-2.5 px-3 text-center min-w-[120px]">คำขอที่ผูก</th>
                <th className="py-2.5 px-3 text-center min-w-[110px]">การจัดการ</th>
              </tr>
            </thead>

            {/* Excel Rows */}
            <tbody className="divide-y divide-slate-200">
              {filteredProjects.map((p, idx) => {
                const reqCount = getLinkedRequestCount(p);
                const ganttStage = getGanttStageInfo(p);

                return (
                  <tr 
                    key={p.id} 
                    className={`divide-x divide-slate-200 transition-colors ${
                      idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100/60'
                    }`}
                  >
                    {/* No. Column */}
                    <td className="py-3 px-3 text-center font-mono text-slate-500 font-medium bg-slate-100/50">
                      {idx + 1}
                    </td>

                    {/* Project Code */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      <button
                        type="button"
                        onClick={() => onView(p)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-900 px-2 py-0.5 rounded border border-blue-200 transition-colors cursor-pointer text-left font-mono"
                        title="คลิกเพื่อดูสรุปภาพรวม & Taskbar โครงการ"
                      >
                        {p.projectCode}
                      </button>
                    </td>

                    {/* SO No. */}
                    <td className="py-3 px-3 font-mono text-slate-800 font-semibold">
                      {p.soNumber ? (
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {p.soNumber.split(',').map((so, i) => (
                            <span key={i} className="inline-block bg-slate-100 text-slate-800 border border-slate-200 px-1.5 py-0.2 rounded text-[11px]">
                              {so.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Project Name */}
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => onView(p)}
                        className="text-left font-bold text-slate-900 hover:text-blue-600 line-clamp-2 transition-colors cursor-pointer group flex items-start gap-1"
                        title="คลิกเพื่อดูสรุปภาพรวม & Taskbar โครงการ"
                      >
                        <span className="group-hover:underline">{p.projectName}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-blue-500 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity mt-0.5" />
                      </button>
                      {p.location && (
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          📍 {p.location}
                        </div>
                      )}
                    </td>

                    {/* Customer Name */}
                    <td className="py-3 px-3 font-medium text-slate-800">
                      {p.customerName}
                    </td>

                    {/* Customer E-MAIL */}
                    <td className="py-3 px-3 font-mono text-slate-600">
                      <a href={`mailto:${p.customerEmail}`} className="text-blue-600 hover:underline">
                        {p.customerEmail || '-'}
                      </a>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-3 font-mono text-slate-800 whitespace-nowrap">
                      {p.customerPhone ? (
                        <a href={`tel:${p.customerPhone}`} className="hover:underline text-slate-800 flex items-center gap-1 font-semibold">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{p.customerPhone}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Engineer Name */}
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {p.engineerName}
                    </td>

                    {/* Sale */}
                    <td className="py-3 px-3 text-slate-700">
                      {p.salesName}
                    </td>

                    {/* GANTT TIMELINE CURRENT STAGE COLUMN */}
                    <td className="py-3 px-3 min-w-[210px]">
                      <button
                        type="button"
                        onClick={() => onView(p)}
                        className="w-full text-left cursor-pointer group"
                        title="คลิกเพื่อดู Microsoft Project Gantt Timeline แบบละเอียด"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1.5 ${ganttStage.badgeClass} group-hover:ring-1 group-hover:ring-blue-400 transition-all`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${ganttStage.dotClass} ${ganttStage.progress < 100 ? 'animate-pulse' : ''}`} />
                            <span className="truncate">{ganttStage.shortName}</span>
                          </span>
                          <span className="font-mono font-bold text-[10px] text-slate-700">
                            {ganttStage.progress}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div 
                            className={`h-full ${ganttStage.barColor} rounded-full transition-all duration-500`}
                            style={{ width: `${ganttStage.progress}%` }}
                          />
                        </div>
                      </button>
                    </td>

                    {/* Status with Thai/English matching cards */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {renderStatusBadge(p.status)}
                    </td>

                    {/* Linked Requests */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {reqCount > 0 ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-semibold text-[11px]">
                          <FileText className="w-3 h-3 text-amber-600" />
                          <span>{reqCount} คำขอ</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onCreateRequestForProject(p.id)}
                          title="สร้างคำของานวิศวกรรมสำหรับโครงการนี้"
                          className="p-1.5 text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onView(p)}
                          title="ดูรายละเอียดโครงการ & คำขอทั้งหมด"
                          className="p-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEdit(p)}
                          title="แก้ไขข้อมูลโครงการ"
                          className="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`ยืนยันการลบโครงการ ${p.projectName} (${p.projectCode}) ออกจากระบบอย่างถาวรหรือไม่?`)) {
                              onDelete(p.id);
                            }
                          }}
                          title="ลบโครงการนี้ออกจากระบบอย่างถาวร (Permanent Delete)"
                          className="p-1.5 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-lg transition-all border border-rose-200 hover:border-rose-600 cursor-pointer shadow-xs active:scale-90"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400 bg-white">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="text-sm font-semibold text-slate-600">ไม่พบโครงการตามเงื่อนไขที่เลือก</p>
                      <p className="text-xs text-slate-400">ลองเปลี่ยนตัวกรองสถานะ หรือล้างคำค้นหา</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Excel Bottom Status Bar */}
        <div className="bg-slate-100 border-t border-slate-300 px-4 py-2 flex items-center justify-between text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-4">
            <span>แสดงผล: <strong className="text-slate-900">{filteredProjects.length}</strong> จาก {projects.length} โครงการ</span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline">ตามแผน: <strong className="text-emerald-700">{onTrackCount}</strong></span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline">เสี่ยงล่าช้า: <strong className="text-amber-700">{atRiskCount}</strong></span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline">เกินกำหนด: <strong className="text-rose-700">{overdueCount}</strong></span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline">เสร็จสิ้น: <strong className="text-purple-700">{completedCount}</strong></span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Sheet1: LUMENCRAFT_PROJECTS_MASTER
          </div>
        </div>

      </div>
    </div>
  );
};
