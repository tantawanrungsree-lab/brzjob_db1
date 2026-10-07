import React, { useState } from 'react';
import { Project, EngineerRequest, JobTypeKey, JOB_TYPE_CONFIG, ProjectExpenseRecord } from '../../types';
import { 
  X, Building2, User, Phone, Mail, MapPin, Calendar, 
  FileText, Plus, Printer, Edit2, ExternalLink, ShieldCheck, Clock,
  CheckCircle2, AlertTriangle, AlertCircle, Wrench, ShieldAlert,
  Layers, CheckSquare, Sparkles, ArrowRight, ArrowUpRight, BarChart3, 
  PackageCheck, DollarSign, Fuel, Hotel, Timer, Receipt, TrendingUp,
  CreditCard, Wallet, Car, FileSpreadsheet, Download, Filter, Search,
  Trash2
} from 'lucide-react';
import { MicrosoftProjectGantt } from './MicrosoftProjectGantt';

interface ProjectDetailModalProps {
  project: Project | null;
  requests: EngineerRequest[];
  isOpen: boolean;
  onClose: () => void;
  onEditProject: (project: Project) => void;
  onCreateRequestForProject: (projectId: string) => void;
  onViewRequest: (req: EngineerRequest) => void;
  onPrintRequest: (req: EngineerRequest) => void;
  onDeleteProject?: (id: string) => void;
  onDeleteRequest?: (id: string) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  requests,
  isOpen,
  onClose,
  onEditProject,
  onCreateRequestForProject,
  onViewRequest,
  onPrintRequest,
  onDeleteProject,
  onDeleteRequest
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'expenses' | 'requests' | 'claims'>('overview');
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expenseList, setExpenseList] = useState<ProjectExpenseRecord[]>([]);
  const [expenseFilterCategory, setExpenseFilterCategory] = useState<string>('all');
  const [expenseSearch, setExpenseSearch] = useState('');

  if (!isOpen || !project) return null;

  // Initialize or sync local expenses list from project
  const currentExpenses = project.expenses || {
    fuelCost: 0,
    tollCost: 0,
    hotelCost: 0,
    overtimeCost: 0,
    otherCost: 0,
    expenseLogs: []
  };

  const initialLogs = project.expenses?.expenseLogs || [];
  const allExpenseLogs = [...initialLogs, ...expenseList];

  const fuelTotal = currentExpenses.fuelCost + expenseList.filter(e => e.category === 'fuel').reduce((sum, e) => sum + e.amount, 0);
  const tollTotal = currentExpenses.tollCost + expenseList.filter(e => e.category === 'toll').reduce((sum, e) => sum + e.amount, 0);
  const hotelTotal = currentExpenses.hotelCost + expenseList.filter(e => e.category === 'hotel').reduce((sum, e) => sum + e.amount, 0);
  const overtimeTotal = currentExpenses.overtimeCost + expenseList.filter(e => e.category === 'overtime').reduce((sum, e) => sum + e.amount, 0);
  const otherTotal = (currentExpenses.otherCost || 0) + expenseList.filter(e => e.category === 'other').reduce((sum, e) => sum + e.amount, 0);

  const totalProjectExpenses = fuelTotal + tollTotal + hotelTotal + overtimeTotal + otherTotal;

  const linkedRequests = requests.filter(r => r.projectId === project.id || r.projectCode === project.projectCode);

  // 1. Calculate On-Site visits count
  const onSiteVisitsCount = linkedRequests.filter(r => 
    r.jobTypes?.onSite || 
    r.jobTypes?.siteSurvey || 
    r.jobTypes?.installation || 
    r.jobTypes?.service ||
    (r.workDetails && r.workDetails.includes('ถึงสถานที่หน้างาน'))
  ).length;

  const avgCostPerVisit = onSiteVisitsCount > 0 ? Math.round(totalProjectExpenses / onSiteVisitsCount) : totalProjectExpenses;

  // 2. Breakdown by Job Types
  const jobTypeCounts: Record<JobTypeKey, number> = {
    onSite: 0,
    meeting: 0,
    service: 0,
    mockUp: 0,
    siteSurvey: 0,
    installation: 0,
    countDrawing: 0,
    claim: 0,
    qc: 0,
    present: 0,
    other: 0
  };

  linkedRequests.forEach(req => {
    (Object.keys(jobTypeCounts) as JobTypeKey[]).forEach(k => {
      if (req.jobTypes?.[k]) {
        jobTypeCounts[k] += 1;
      }
    });
  });

  // 3. Extract Claimed items & Parts used
  interface ClaimRecord {
    docNo: string;
    date: string;
    requestObj: EngineerRequest;
    partName: string;
    qty: string;
    problem: string;
    action: string;
    isClaimJob: boolean;
    remark: string;
  }

  const claimRecords: ClaimRecord[] = [];

  linkedRequests.forEach(req => {
    const isClaim = !!req.jobTypes?.claim;
    
    // Check parts list
    if (req.parts && req.parts.length > 0) {
      req.parts.forEach(pt => {
        if (pt.name) {
          claimRecords.push({
            docNo: req.documentNo,
            date: req.dateRequest,
            requestObj: req,
            partName: pt.name,
            qty: pt.qty || '1',
            problem: req.reportedProblem || req.requestDetails || 'รายการอะไหล่ / เคลม',
            action: req.correctiveAction || req.findings || 'เปลี่ยนอะไหล่ตามรายการ',
            isClaimJob: isClaim,
            remark: pt.remark || '-'
          });
        }
      });
    } else if (isClaim) {
      claimRecords.push({
        docNo: req.documentNo,
        date: req.dateRequest,
        requestObj: req,
        partName: req.reportedProblem || 'รายการเคลมสินค้าตามใบคำขอ',
        qty: '1 รายการ',
        problem: req.reportedProblem || req.requestDetails || 'แจ้งเคลมสินค้าชำรุด/มีปัญหา',
        action: req.correctiveAction || req.findings || 'ตรวจสอบ & อยู่ระหว่างประสานงานเคลม',
        isClaimJob: true,
        remark: req.recommendationNextAction || '-'
      });
    }
  });

  // 4. Project Management Taskbar Stages
  const projectStages = [
    { id: 1, name: '1. วางแผน & วิเคราะห์แบบ', en: 'Planning & Review', status: 'completed' },
    { id: 2, name: '2. สำรวจหน้างาน & สเปค', en: 'Site Survey & Spec', status: onSiteVisitsCount > 0 ? 'completed' : 'in_progress' },
    { id: 3, name: '3. Mock-Up & เสนอราคา', en: 'Mock-Up & Quotation', status: jobTypeCounts.mockUp > 0 ? 'completed' : 'in_progress' },
    { id: 4, name: '4. ส่งมอบ & ดูแลติดตั้ง', en: 'Installation & Field Ops', status: project.status === 'Completed' ? 'completed' : (project.status === 'On Track' || project.status === 'In Progress') ? 'in_progress' : 'pending' },
    { id: 5, name: '5. QC & ทดสอบระบบ', en: 'Testing & QC', status: jobTypeCounts.qc > 0 ? 'completed' : project.status === 'Completed' ? 'completed' : 'pending' },
    { id: 6, name: '6. ส่งมอบงาน & รับประกัน', en: 'Handover & Warranty', status: project.status === 'Completed' ? 'completed' : 'pending' }
  ];

  const completedStages = projectStages.filter(s => s.status === 'completed').length;
  const projectProgressPct = project.status === 'Completed' ? 100 : Math.round((completedStages / projectStages.length) * 100);

  const handleAddExpenseSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRecord: ProjectExpenseRecord = {
      id: `exp-${Date.now()}`,
      date: (formData.get('date') as string) || new Date().toISOString().split('T')[0],
      category: (formData.get('category') as any) || 'fuel',
      description: (formData.get('description') as string) || 'ค่าใช้จ่ายปฏิบัติงาน',
      amount: parseFloat(formData.get('amount') as string) || 0,
      engineerStaff: (formData.get('engineerStaff') as string) || project.engineerName,
      docNo: (formData.get('docNo') as string) || '',
      receiptRef: (formData.get('receiptRef') as string) || ''
    };

    setExpenseList(prev => [newRecord, ...prev]);
    setShowAddExpenseModal(false);
  };

  // Filtered expense logs
  const filteredExpenseLogs = allExpenseLogs.filter(log => {
    const matchCategory = expenseFilterCategory === 'all' || log.category === expenseFilterCategory;
    const matchSearch = !expenseSearch || 
      log.description.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      log.engineerStaff.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      (log.docNo && log.docNo.toLowerCase().includes(expenseSearch.toLowerCase())) ||
      (log.receiptRef && log.receiptRef.toLowerCase().includes(expenseSearch.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const exportExpenseCSV = () => {
    const headers = ['วันที่ (Date)', 'หมวดหมู่ (Category)', 'รายละเอียด (Description)', 'วิศวกรผู้เบิก (Staff)', 'เลขที่ใบคำขอ (Doc No)', 'เลขที่ใบเสร็จ (Receipt Ref)', 'จำนวนเงิน (THB)'];
    const rows = filteredExpenseLogs.map(l => [
      l.date,
      l.category,
      `"${l.description.replace(/"/g, '""')}"`,
      `"${l.engineerStaff}"`,
      l.docNo || '',
      l.receiptRef || '',
      l.amount
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Expense_Report_${project.projectCode}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex flex-col overflow-hidden font-sans">
      <div className="bg-white w-full h-full flex flex-col overflow-hidden">
        
        {/* ========================================================================= */}
        {/* MODAL HEADER */}
        {/* ========================================================================= */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-400 text-slate-950 font-bold px-2.5 py-0.5 rounded font-mono">
                  {project.projectCode}
                </span>
                {project.soNumber && (
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                    SO: {project.soNumber}
                  </span>
                )}
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  project.status === 'Completed' ? 'bg-purple-900/80 text-purple-300 border border-purple-500/30' :
                  project.status === 'Overdue' ? 'bg-red-900/80 text-red-300 border border-red-500/30' :
                  project.status === 'At Risk' ? 'bg-amber-900/80 text-amber-300 border border-amber-500/30' :
                  'bg-emerald-900/80 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {project.status}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-heading text-white mt-1">
                {project.projectName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => onCreateRequestForProject(project.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ สร้างใบคำขอใหม่</span>
            </button>
            <button
              onClick={() => onEditProject(project)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700"
              title="แก้ไขข้อมูลโครงการ"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            {onDeleteProject && (
              <button
                onClick={() => {
                  if (window.confirm(`ยืนยันการลบโครงการ ${project.projectName} (${project.projectCode}) ออกจากระบบและ Firebase หรือไม่?`)) {
                    onDeleteProject(project.id);
                    onClose();
                  }
                }}
                className="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-600 transition-colors border border-rose-800/80 bg-rose-950/40"
                title="ลบโครงการนี้ออกจากระบบและ Firebase"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUB-TABS NAVIGATION BAR */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-100 border-b border-slate-200 overflow-x-auto text-xs font-medium shrink-0">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeSubTab === 'overview' ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>1. ภาพรวม & Taskbar บริหารโครงการ</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('expenses')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeSubTab === 'expenses' ? 'bg-[#107c41] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>2. สรุปค่าใช้จ่ายโครงการ (฿{totalProjectExpenses.toLocaleString()})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('requests')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeSubTab === 'requests' ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>3. สรุปใบงานแยกตามประเภท ({linkedRequests.length} ใบ)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('claims')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeSubTab === 'claims' ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>4. สรุปการเคลมสินค้า & เปลี่ยนอะไหล่ ({claimRecords.length} รายการ)</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODAL BODY */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 w-full space-y-5 text-slate-800 text-xs">
          
          {/* ========================================================================= */}
          {/* 1. TAB 1: OVERVIEW & TASKBAR PROJECT MANAGEMENT */}
          {/* ========================================================================= */}
          {activeSubTab === 'overview' && (
            <div className="space-y-5">
              
              {/* Taskbar Project Management Box */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                      <h3 className="text-sm font-bold text-slate-900 font-heading">
                        TASKBAR PROJECT MANAGEMENT (แผนงานและลำดับขั้นตอนการดำเนินงานโครงการ)
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ติดตามสถานะขั้นตอนมาตรฐานตั้งแต่การวางแผน ตรวจแบบ สำรวจหน้างาน จนถึงส่งมอบและบริการหลังการขาย
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-xs font-semibold text-slate-600">ความคืบหน้ารวม:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-28 h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${projectProgressPct}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold font-mono text-blue-700">{projectProgressPct}%</span>
                    </div>
                  </div>
                </div>

                {/* Stages Step Bar */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {projectStages.map((stage) => {
                    const isDone = stage.status === 'completed';
                    const isCurrent = stage.status === 'in_progress';

                    return (
                      <div 
                        key={stage.id} 
                        className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                          isDone 
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-xs' 
                            : isCurrent 
                            ? 'bg-blue-50/70 border-blue-400 text-blue-950 ring-2 ring-blue-400/20' 
                            : 'bg-slate-50 border-slate-200 text-slate-400 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/80 border border-slate-200">
                            STAGE 0{stage.id}
                          </span>
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : isCurrent ? (
                            <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-xs line-clamp-1 text-slate-900">{stage.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{stage.en}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Microsoft Project Gantt Component */}
                <div className="pt-2">
                  <MicrosoftProjectGantt project={project} requests={linkedRequests} />
                </div>
              </div>

              {/* Project Info & Contacts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Customer Details */}
                <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>ข้อมูลลูกค้า (Customer Details)</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">ชื่อลูกค้า / บริษัท:</span>
                      <span className="font-bold text-slate-900 text-sm">{project.customerName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">อีเมลติดต่อ:</span>
                      <a href={`mailto:${project.customerEmail}`} className="font-mono text-blue-600 hover:underline font-medium">
                        {project.customerEmail || '-'}
                      </a>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">เบอร์โทรศัพท์:</span>
                      {project.customerPhone ? (
                        <a href={`tel:${project.customerPhone}`} className="font-mono font-bold text-slate-900 hover:underline flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <span>{project.customerPhone}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Team Details */}
                <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>ทีมงานผู้ดูแลโครงการ (Lumencraft In-Charge)</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Lead Engineer (วิศวกรผู้รับผิดชอบ):</span>
                      <span className="font-bold text-slate-900">{project.engineerName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Sales In Charge (เซลล์เจ้าของงาน):</span>
                      <span className="font-medium text-slate-800">{project.salesName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">SO Numbers:</span>
                      <span className="font-mono font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                        {project.soNumber || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location & Details */}
                <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>สถานที่หน้างาน & แผนที่</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">สถานที่ติดตั้ง / หน้างาน:</span>
                      <span className="text-slate-800 font-medium">{project.location || '-'}</span>
                    </div>
                    {project.location && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>เปิด Google Maps นำทาง</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Types Distribution Summary */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>สรุปการกระจายงานแยกตามประเภท (Job Types Summary)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">จากทั้งหมด {linkedRequests.length} ใบงาน</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                  {(Object.keys(JOB_TYPE_CONFIG) as JobTypeKey[]).map((key) => {
                    const count = jobTypeCounts[key];
                    const cfg = JOB_TYPE_CONFIG[key];

                    return (
                      <div 
                        key={key} 
                        className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                          count > 0 
                            ? `${cfg.badgeClass} border-slate-300 shadow-xs font-semibold` 
                            : 'bg-slate-50/50 border-slate-100 text-slate-400'
                        }`}
                      >
                        <span className="text-[11px]">{cfg.labelTh}</span>
                        <span className="text-xl font-bold font-mono mt-2">{count} งาน</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. TAB 2: DETAILED PROJECT EXPENSES (แสดงเฉพาะสรุปค่าใช้จ่ายการปฏิบัติงานโครงการ) */}
          {/* ========================================================================= */}
          {activeSubTab === 'expenses' && (
            <div className="space-y-6">
              
              {/* Top Big Expense Summary Banner */}
              <div className="bg-gradient-to-r from-[#107c41] via-emerald-800 to-teal-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-emerald-100 text-xs font-semibold">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>PROJECT EXPENSE & FIELD DISPATCH BUDGET SUMMARY</span>
                  </div>
                  <h3 className="text-2xl font-bold font-heading">
                    สรุปค่าใช้จ่ายการปฏิบัติงานโครงการ (Total Project Expenses)
                  </h3>
                  <p className="text-xs text-emerald-100 max-w-2xl">
                    รวบรวมค่าน้ำมัน ค่าทางด่วน ค่าที่พัก ค่าล่วงเวลา (OT) และค่าใช้จ่ายภาคสนามทั้งหมดที่เกิดขึ้นในการดำเนินงานโครงการ {project.projectName}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-right shrink-0">
                  <span className="text-[11px] text-emerald-200 font-medium block">ยอดรวมค่าใช้จ่ายทั้งสิ้น:</span>
                  <span className="text-3xl font-extrabold font-mono text-white block mt-1">
                    ฿{totalProjectExpenses.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-200 mt-1 block">
                    เฉลี่ย ฿{avgCostPerVisit.toLocaleString()} / ครั้งที่เข้าหน้างาน ({onSiteVisitsCount} ครั้ง)
                  </span>
                </div>
              </div>

              {/* 4 Main Expense Category Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Fuel */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">ค่าน้ำมัน (Fuel Cost)</span>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                      <Fuel className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900">
                    ฿{fuelTotal.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    สัดส่วน: {totalProjectExpenses > 0 ? Math.round((fuelTotal / totalProjectExpenses) * 100) : 0}% ของค่าใช้จ่ายรวม
                  </div>
                </div>

                {/* 2. Toll */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">ค่าทางด่วน (Toll Fees)</span>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <Car className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900">
                    ฿{tollTotal.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    สัดส่วน: {totalProjectExpenses > 0 ? Math.round((tollTotal / totalProjectExpenses) * 100) : 0}% ของค่าใช้จ่ายรวม
                  </div>
                </div>

                {/* 3. Hotel */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">ค่าที่พัก (Accommodation)</span>
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Hotel className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900">
                    ฿{hotelTotal.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    สัดส่วน: {totalProjectExpenses > 0 ? Math.round((hotelTotal / totalProjectExpenses) * 100) : 0}% ของค่าใช้จ่ายรวม
                  </div>
                </div>

                {/* 4. Overtime */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">ค่าทำงานล่วงเวลา (OT Cost)</span>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                      <Timer className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900">
                    ฿{overtimeTotal.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    สัดส่วน: {totalProjectExpenses > 0 ? Math.round((overtimeTotal / totalProjectExpenses) * 100) : 0}% ของค่าใช้จ่ายรวม
                  </div>
                </div>
              </div>

              {/* Excel Spreadsheet Style Expense Log Table with Summary */}
              <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden space-y-0">
                
                {/* Excel Green Header Ribbon */}
                <div className="bg-[#107c41] text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 text-white font-bold flex items-center justify-center font-mono text-sm border border-white/30">
                      XL
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold font-heading text-white">
                          ตารางบันทึกค่าใช้จ่ายโครงการ (PROJECT EXPENSE EXCEL MATRIX)
                        </h4>
                        <span className="text-[11px] bg-emerald-950/60 text-emerald-200 px-2 py-0.5 rounded font-mono">
                          {filteredExpenseLogs.length} รายการ
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-100">
                        สรุปรายละเอียด ค่าน้ำมัน ค่าทางด่วน ค่าที่พัก ค่า OT พร้อมยอดรวม Summary ทั้งสิ้น
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportExpenseCSV}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold rounded-lg transition-colors shadow-xs"
                      title="ส่งออกตารางเป็นไฟล์ CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ส่งออก Excel</span>
                    </button>
                    <button
                      onClick={() => setShowAddExpenseModal(true)}
                      className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ บันทึกค่าใช้จ่ายใหม่</span>
                    </button>
                  </div>
                </div>

                {/* Filter / Search Bar */}
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2 flex-1">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={expenseSearch}
                        onChange={(e) => setExpenseSearch(e.target.value)}
                        placeholder="ค้นหาตามรายละเอียด, ผู้เบิก, หรือเลขที่เอกสาร..."
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={expenseFilterCategory}
                        onChange={(e) => setExpenseFilterCategory(e.target.value)}
                        className="bg-transparent text-xs font-medium text-slate-700 outline-none"
                      >
                        <option value="all">ทุกหมวดหมู่ค่าใช้จ่าย</option>
                        <option value="fuel">ค่าน้ำมัน (Fuel)</option>
                        <option value="toll">ค่าทางด่วน (Toll)</option>
                        <option value="hotel">ค่าที่พัก (Hotel)</option>
                        <option value="overtime">ค่า OT (Overtime)</option>
                        <option value="other">อื่น ๆ (Other)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#f3f4f6] text-slate-800 font-bold border-b border-slate-300">
                      <tr className="divide-x divide-slate-300">
                        <th className="py-2.5 px-3 text-center w-10 font-mono bg-slate-200 text-slate-600">No.</th>
                        <th className="py-2.5 px-3 min-w-[100px]">วันที่ (Date)</th>
                        <th className="py-2.5 px-3 min-w-[130px]">หมวดหมู่ค่าใช้จ่าย</th>
                        <th className="py-2.5 px-3 min-w-[220px]">รายละเอียดการเบิก / ปฏิบัติงาน</th>
                        <th className="py-2.5 px-3 min-w-[130px]">วิศวกรผู้เบิก</th>
                        <th className="py-2.5 px-3 min-w-[140px]">ใบคำขอ / ใบเสร็จอ้างอิง</th>
                        <th className="py-2.5 px-4 text-right min-w-[130px]">จำนวนเงิน (บาท)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredExpenseLogs.map((log, idx) => {
                        const catConfig = {
                          fuel: { label: 'ค่าน้ำมัน (Fuel)', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
                          toll: { label: 'ค่าทางด่วน (Toll)', badge: 'bg-blue-50 text-blue-800 border-blue-200' },
                          hotel: { label: 'ค่าที่พัก (Hotel)', badge: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
                          overtime: { label: 'ค่า OT (Overtime)', badge: 'bg-purple-50 text-purple-800 border-purple-200' },
                          other: { label: 'อื่น ๆ (Other)', badge: 'bg-slate-100 text-slate-800 border-slate-200' }
                        }[log.category] || { label: 'ค่าใช้จ่าย', badge: 'bg-slate-100 text-slate-800' };

                        return (
                          <tr key={log.id} className="divide-x divide-slate-200 hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-2 text-center font-mono text-slate-500 bg-slate-50">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap font-medium">
                              {log.date}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${catConfig.badge}`}>
                                {catConfig.label}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-900 font-medium">
                              {log.description}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                              {log.engineerStaff}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                              {log.docNo ? (
                                <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  {log.docNo}
                                </span>
                              ) : log.receiptRef ? (
                                <span>Ref: {log.receiptRef}</span>
                              ) : (
                                <span>-</span>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                              ฿{log.amount.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}

                      {filteredExpenseLogs.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            ยังไม่มีรายการบันทึกค่าใช้จ่ายตามเงื่อนไขที่เลือก
                          </td>
                        </tr>
                      )}
                    </tbody>

                    {/* Summary Footer Matrix */}
                    <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                      <tr className="divide-x divide-slate-300 bg-emerald-50/80">
                        <td colSpan={6} className="py-3 px-4 text-right text-emerald-950 font-bold text-xs">
                          ยอดรวมค่าใช้จ่ายทั้งสิ้น (Grand Total Project Expenses):
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-base font-extrabold text-emerald-900">
                          ฿{totalProjectExpenses.toLocaleString()} บาท
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Bottom Expense Breakdown Ribbon */}
                <div className="bg-slate-50 border-t border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-medium">
                  <div className="flex flex-wrap items-center gap-4">
                    <span>ค่าน้ำมันรวม: <strong className="text-amber-800 font-mono">฿{fuelTotal.toLocaleString()}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span>ค่าทางด่วนรวม: <strong className="text-blue-800 font-mono">฿{tollTotal.toLocaleString()}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span>ค่าที่พักรวม: <strong className="text-indigo-800 font-mono">฿{hotelTotal.toLocaleString()}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span>ค่า OT รวม: <strong className="text-purple-800 font-mono">฿{overtimeTotal.toLocaleString()}</strong></span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-500">
                    Total Records: {allExpenseLogs.length} Entries
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. TAB 3: LINKED SERVICE REQUESTS TABLE (แสดงเฉพาะรายการใบงานคำขอทั้งหมดในโครงการ) */}
          {/* ========================================================================= */}
          {activeSubTab === 'requests' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    รายการใบงานคำขอทั้งหมดในโครงการ ({linkedRequests.length} ใบ)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    เข้าปฏิบัติงานหน้างานทั้งหมด {onSiteVisitsCount} ครั้ง • คลิกเปิดดูรายละเอียดหรือพิมพ์ใบคำขอ A4 ได้ทันที
                  </p>
                </div>

                <button
                  onClick={() => onCreateRequestForProject(project.id)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm self-end sm:self-auto"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>+ สร้างใบคำขอใหม่</span>
                </button>
              </div>

              {/* Requests Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Document / Service No.</th>
                        <th className="py-3 px-4">วันที่ขอ & กำหนดเสร็จ</th>
                        <th className="py-3 px-4">ประเภทงาน (Job Types)</th>
                        <th className="py-3 px-4">วิศวกรผู้ปฏิบัติงาน</th>
                        <th className="py-3 px-4 text-center">Priority</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {linkedRequests.map((req) => {
                        const activeJobKeys = (Object.keys(JOB_TYPE_CONFIG) as JobTypeKey[]).filter(k => req.jobTypes[k]);

                        return (
                          <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-mono font-bold text-slate-900">{req.documentNo}</div>
                              <div className="font-mono text-[11px] text-slate-500">{req.serviceNo}</div>
                              {req.requestDetails && (
                                <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                                  {req.requestDetails}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4 font-mono text-slate-700">
                              <div>Req: {req.dateRequest}</div>
                              <div className="font-semibold text-amber-800">Due: {req.dueDate}</div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {activeJobKeys.map(k => (
                                  <span key={k} className={`px-2 py-0.5 rounded text-[10px] font-medium border ${JOB_TYPE_CONFIG[k].badgeClass}`}>
                                    {JOB_TYPE_CONFIG[k].labelTh}
                                  </span>
                                ))}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-900">{req.engineerStaff}</div>
                              <div className="text-[10px] text-slate-400">Sale: {req.salesInCharge}</div>
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                                req.priority === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                                req.priority === 'Urgent' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {req.priority}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                req.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                req.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {req.status}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => onPrintRequest(req)}
                                  title="พิมพ์ใบคำขอ Lumencraft A4"
                                  className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onViewRequest(req)}
                                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                  ดู / แก้ไข
                                </button>
                                {onDeleteRequest && (
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`ยืนยันการลบใบคำขอ ${req.documentNo} ออกจากระบบและ Google Sheet หรือไม่?`)) {
                                        onDeleteRequest(req.id);
                                      }
                                    }}
                                    title="ลบใบคำขอนี้ออกจากระบบและ Google Sheet"
                                    className="p-1.5 text-rose-500 hover:text-white hover:bg-rose-600 rounded-lg transition-colors border border-rose-200 hover:border-rose-600 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {linkedRequests.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            ยังไม่มีใบคำของานวิศวกรรมในโครงการนี้
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. TAB 4: CLAIMS & REPLACED PARTS SUMMARY (แสดงเฉพาะประวัติการเคลมสินค้า & เปลี่ยนอะไหล่) */}
          {/* ========================================================================= */}
          {activeSubTab === 'claims' && (
            <div className="space-y-4">
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-between text-rose-900">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm">ประวัติการเคลมสินค้าและรายการเปลี่ยนอะไหล่ในโครงการนี้</h3>
                    <p className="text-[11px] text-rose-700">
                      บันทึกรายการสินค้า อะไหล่ชำรุด หรือชิ้นส่วนที่ได้รับการเปลี่ยน/เคลมพร้อมข้อตรวจพบ
                    </p>
                  </div>
                </div>

                <span className="text-xl font-bold font-mono text-rose-700 bg-white px-3 py-1 rounded-xl border border-rose-200 shadow-xs">
                  {claimRecords.length} รายการ
                </span>
              </div>

              {/* Claims Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">เลขที่เอกสาร / วันที่</th>
                        <th className="py-3 px-4">รายการสินค้า / อะไหล่ที่เคลม (Part Item)</th>
                        <th className="py-3 px-4 text-center">จำนวน (Qty)</th>
                        <th className="py-3 px-4">สาเหตุ / ปัญหาที่พบ (Defect & Problem)</th>
                        <th className="py-3 px-4">การแก้ไข / สถานะเคลม (Action & Result)</th>
                        <th className="py-3 px-4 text-right">เปิดดูใบงาน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {claimRecords.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono">
                            <div className="font-bold text-slate-900">{item.docNo}</div>
                            <div className="text-[11px] text-slate-400">{item.date}</div>
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span className="p-1 bg-rose-100 text-rose-800 rounded">
                                <PackageCheck className="w-3.5 h-3.5" />
                              </span>
                              <span>{item.partName}</span>
                            </div>
                            {item.remark && item.remark !== '-' && (
                              <div className="text-[10px] text-slate-400 mt-0.5">หมายเหตุ: {item.remark}</div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                            {item.qty}
                          </td>

                          <td className="py-3.5 px-4 max-w-xs text-slate-700">
                            <p className="line-clamp-2">{item.problem}</p>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs text-emerald-800 font-medium">
                            <p className="line-clamp-2">{item.action}</p>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => onViewRequest(item.requestObj)}
                              className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                            >
                              ดูใบคำขอ
                            </button>
                          </td>
                        </tr>
                      ))}

                      {claimRecords.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <div className="space-y-1">
                              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                              <div className="font-semibold text-slate-700 text-sm">ไม่มีประวัติการเคลมสินค้าในโครงการนี้</div>
                              <div className="text-[11px] text-slate-400">สินค้าและอุปกรณ์ทุกชิ้นทำงานได้ตามมาตรฐาน</div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* MODAL FOOTER */}
        {/* ========================================================================= */}
        <div className="px-6 sm:px-8 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 hidden sm:block">
            Lumencraft Project Directory & Cost Management • รวมค่าใช้จ่าย: <strong className="text-emerald-800 font-mono">฿{totalProjectExpenses.toLocaleString()} บาท</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ปิดหน้าต่าง (Close)
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* POPUP: ADD NEW EXPENSE RECORD MODAL */}
      {/* ========================================================================= */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>บันทึกค่าใช้จ่ายโครงการใหม่</span>
              </h3>
              <button 
                onClick={() => setShowAddExpenseModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">หมวดหมู่ค่าใช้จ่าย *</label>
                <select name="category" required className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                  <option value="fuel">ค่าน้ำมัน (Fuel)</option>
                  <option value="toll">ค่าทางด่วน (Toll)</option>
                  <option value="hotel">ค่าที่พัก (Accommodation)</option>
                  <option value="overtime">ค่าทำงานล่วงเวลา (Overtime/OT)</option>
                  <option value="other">ค่าใช้จ่ายอื่น ๆ (Other)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">จำนวนเงิน (บาท) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  name="amount" 
                  required 
                  placeholder="e.g. 1500" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900" 
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">รายละเอียด / วัตถุประสงค์ *</label>
                <input 
                  type="text" 
                  name="description" 
                  required 
                  placeholder="e.g. ค่าน้ำมันรถเข้าสำรวจหน้างานครั้งที่ 2" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">วันที่เบิกจ่าย</label>
                  <input 
                    type="date" 
                    name="date" 
                    defaultValue={new Date().toISOString().split('T')[0]} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono" 
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">วิศวกรผู้เบิก</label>
                  <input 
                    type="text" 
                    name="engineerStaff" 
                    defaultValue={project.engineerName} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">เลขที่ใบคำขออ้างอิง</label>
                  <input 
                    type="text" 
                    name="docNo" 
                    placeholder="e.g. LC-SR-2026-0042" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono" 
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">เลขที่ใบเสร็จ</label>
                  <input 
                    type="text" 
                    name="receiptRef" 
                    placeholder="e.g. PTT-8921" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono" 
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
                >
                  บันทึกรายการ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
