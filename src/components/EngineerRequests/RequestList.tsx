import React, { useState } from 'react';
import { EngineerRequest, JobTypeKey, JOB_TYPE_CONFIG, RequestStatus, PriorityLevel } from '../../types';
import { 
  Plus, Search, Filter, Printer, Edit2, Trash2, Calendar, 
  Table as TableIcon, Eye, CheckCircle2, AlertTriangle, 
  Clock, ArrowUpDown, ChevronDown, Download, UserCheck,
  FileSpreadsheet, ExternalLink, MapPin, Phone, Check, RefreshCw,
  FileText
} from 'lucide-react';
import { RequestCalendar } from './RequestCalendar';
import { EngineerJobPortal } from './EngineerJobPortal';
import { RequestTablePrintPreview } from './RequestTablePrintPreview';
import { EngineerJobActionModal } from './EngineerJobActionModal';

interface RequestListProps {
  requests: EngineerRequest[];
  initialCategory?: 'all' | 'internal' | 'customer';
  onAddNew: () => void;
  onEdit: (req: EngineerRequest) => void;
  onPrint: (req: EngineerRequest) => void;
  onDelete: (id: string) => void;
  onSelectProject?: (projectId: string) => void;
  onSaveRequest?: (req: EngineerRequest) => void;
}

export const RequestList: React.FC<RequestListProps> = ({
  requests,
  initialCategory = 'all',
  onAddNew,
  onEdit,
  onPrint,
  onDelete,
  onSelectProject,
  onSaveRequest = () => {}
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'calendar' | 'engineer_portal'>('table');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'internal' | 'customer'>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobType, setSelectedJobType] = useState<JobTypeKey | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | 'all'>('all');
  const [selectedEngineer, setSelectedEngineer] = useState<string>('all');
  const [showTablePrintPreview, setShowTablePrintPreview] = useState(false);
  const [selectedRequestForAction, setSelectedRequestForAction] = useState<EngineerRequest | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  // Sync category if prop changes
  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Extract unique engineers
  const engineers = Array.from(new Set(requests.map(r => r.engineerStaff).filter(Boolean)));

  // Extract Category counts
  const internalRequests = requests.filter(r => r.requestCategory === 'internal');
  const customerRequests = requests.filter(r => r.requestCategory === 'customer' || !r.requestCategory);

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const q = searchQuery.toLowerCase();
    const matchSearch = 
      !searchQuery ||
      req.documentNo.toLowerCase().includes(q) ||
      req.serviceNo.toLowerCase().includes(q) ||
      req.projectCode.toLowerCase().includes(q) ||
      req.projectName.toLowerCase().includes(q) ||
      req.customer.toLowerCase().includes(q) ||
      req.engineerStaff.toLowerCase().includes(q) ||
      req.salesInCharge.toLowerCase().includes(q) ||
      (req.location && req.location.toLowerCase().includes(q)) ||
      req.requestDetails.toLowerCase().includes(q);

    const matchCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'internal' && req.requestCategory === 'internal') ||
      (selectedCategory === 'customer' && (req.requestCategory === 'customer' || !req.requestCategory));

    const matchJobType = 
      selectedJobType === 'all' || 
      !!req.jobTypes[selectedJobType];

    const matchStatus = 
      selectedStatus === 'all' || 
      req.status === selectedStatus;

    const matchPriority = 
      selectedPriority === 'all' || 
      req.priority === selectedPriority;

    const matchEngineer = 
      selectedEngineer === 'all' || 
      req.engineerStaff === selectedEngineer;

    return matchSearch && matchCategory && matchJobType && matchStatus && matchPriority && matchEngineer;
  });

  const handleExportCSV = () => {
    const headers = ['No', 'Document No', 'Service No', 'Project Code', 'SO No', 'Project Name', 'Customer', 'Customer Tel', 'Site Location', 'Job Types', 'Engineer', 'Sales', 'Due Date', 'Priority', 'Status'];
    const rows = filteredRequests.map((r, i) => {
      const activeJobs = (Object.keys(JOB_TYPE_CONFIG) as JobTypeKey[])
        .filter(k => r.jobTypes[k])
        .map(k => JOB_TYPE_CONFIG[k].labelTh)
        .join('; ');

      return [
        i + 1,
        r.documentNo,
        r.serviceNo,
        r.projectCode,
        r.soNumber,
        `"${r.projectName.replace(/"/g, '""')}"`,
        `"${r.customer.replace(/"/g, '""')}"`,
        r.customerTel || '',
        `"${(r.location || '').replace(/"/g, '""')}"`,
        `"${activeJobs}"`,
        `"${r.engineerStaff.replace(/"/g, '""')}"`,
        `"${r.salesInCharge.replace(/"/g, '""')}"`,
        r.dueDate,
        r.priority,
        r.status
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lumencraft_requests_master_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate stats
  const totalCount = requests.length;
  const openCount = requests.filter(r => r.status === 'Open').length;
  const inProgressCount = requests.filter(r => r.status === 'In Progress').length;
  const completedCount = requests.filter(r => r.status === 'Completed').length;
  const criticalCount = requests.filter(r => r.priority === 'Critical' || r.priority === 'Urgent').length;

  return (
    <div className="space-y-4 w-full">
      {/* ========================================================================= */}
      {/* TOP HEADER: LEFT-ALIGNED ACTION BUTTONS & TITLE */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 w-full">
        
        {/* Title & Metadata */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">
              ระบบคำของานวิศวกรรม & ตารางงานทั้งหมด (Engineer Request)
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right hidden sm:block">
              <span className="text-slate-400 block text-[10px]">สถานะปัจจุบัน</span>
              <span className="font-bold text-slate-900">
                รอดำเนินการ <strong className="text-amber-700">{openCount}</strong> | กำลังทำ <strong className="text-blue-700">{inProgressCount}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ACTION BUTTONS: ALIGNED ON THE LEFT HAND SIDE AS REQUESTED */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          
          {/* Left Buttons Ribbon: (+ สร้างใบคำขอใหม่) + (สำหรับ Engineer รับงาน) + (ตาราง Excel) + (ปฏิทินงาน) */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* BUTTON 1: + สร้างใบคำขอใหม่ (New Request) */}
            <button
              onClick={onAddNew}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4 text-amber-400 shrink-0" />
              <span>+ สร้างใบคำขอใหม่ (New Request)</span>
            </button>

            {/* BUTTON 2: สำหรับ Engineer รับงาน (Engineer Job Acceptance Portal) */}
            <button
              onClick={() => setViewMode('engineer_portal')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all border shadow-xs ${
                viewMode === 'engineer_portal'
                  ? 'bg-amber-500 text-slate-950 border-amber-600 ring-2 ring-amber-400/30'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <UserCheck className="w-4 h-4 text-slate-950 shrink-0" />
              <span>สำหรับ Engineer รับงาน</span>
              {openCount > 0 && (
                <span className="px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-mono">
                  {openCount} งาน
                </span>
              )}
            </button>

            {/* BUTTON 3: ตารางแบบ Excel (Excel Spreadsheet View) */}
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all border shadow-xs ${
                viewMode === 'table'
                  ? 'bg-[#107c41] text-white border-[#0d6535] ring-2 ring-emerald-500/20'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ตารางแบบ Excel</span>
            </button>

            {/* BUTTON 4: ปฏิทินงาน (Calendar View) */}
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all border shadow-xs ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-500/20'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              <span>ปฏิทินงาน</span>
            </button>

          </div>

          {/* Right Side Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTablePrintPreview(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
              title="เปิดดูตัวอย่างก่อนพิมพ์ตารางงานทั้งหมด (Print Preview Table)"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>พรีวิวพิมพ์ตาราง (Print Preview)</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
              title="ดาวน์โหลดข้อมูลเป็นไฟล์ Excel / CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ส่งออก CSV</span>
            </button>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: ENGINEER JOB ACCEPTANCE PORTAL */}
      {/* ========================================================================= */}
      {viewMode === 'engineer_portal' && (
        <EngineerJobPortal
          requests={requests}
          onEdit={onEdit}
          onPrint={onPrint}
          onSaveRequest={onSaveRequest}
          onDelete={onDelete}
        />
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CALENDAR */}
      {/* ========================================================================= */}
      {viewMode === 'calendar' && (
        <RequestCalendar
          requests={filteredRequests}
          onSelectRequest={onEdit}
        />
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: EXCEL SPREADSHEET MASTER TABLE (FULL WIDTH) */}
      {/* ========================================================================= */}
      {viewMode === 'table' && (
        <div className="space-y-3.5 w-full">
          
          {/* Master Sheet Scope Tabs: All vs Internal Request vs Customer Request */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300 shadow-inner">
            
            {/* TAB 1: ALL REQUESTS */}
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-300 ring-2 ring-slate-400/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-800" />
                <span>ตารางคำขอทั้งหมด (All Requests)</span>
              </div>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                {requests.length}
              </span>
            </button>

            {/* TAB 2: INTERNAL REQUEST */}
            <button
              type="button"
              onClick={() => setSelectedCategory('internal')}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                selectedCategory === 'internal'
                  ? 'bg-amber-500 text-slate-950 shadow-sm border border-amber-600 ring-2 ring-amber-400/30'
                  : 'text-amber-900 hover:text-amber-950 hover:bg-amber-100 bg-amber-50/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-950" />
                <span className="truncate">Internal request (คำขอภายใน)</span>
              </div>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-300">
                {internalRequests.length}
              </span>
            </button>

            {/* TAB 3: CUSTOMER REQUEST */}
            <button
              type="button"
              onClick={() => setSelectedCategory('customer')}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                selectedCategory === 'customer'
                  ? 'bg-blue-600 text-white shadow-sm border border-blue-700 ring-2 ring-blue-500/30'
                  : 'text-blue-900 hover:text-blue-950 hover:bg-blue-100 bg-blue-50/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span className="truncate">Customer request (คำขอลูกค้า)</span>
              </div>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-blue-200 text-blue-950 border border-blue-300">
                {customerRequests.length}
              </span>
            </button>

          </div>

          {/* Main Excel Sheet Container */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden flex flex-col w-full">
            
            {/* Excel Ribbon / Green Header Bar */}
            <div className={`text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner ${
              selectedCategory === 'internal'
                ? 'bg-[#b45309]'
                : selectedCategory === 'customer'
                ? 'bg-[#1d4ed8]'
                : 'bg-[#107c41]'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 text-white font-bold flex items-center justify-center font-mono text-sm border border-white/30">
                  XL
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold font-heading text-white">
                      {selectedCategory === 'internal'
                        ? 'ตารางข้อมูลคำของานวิศวกรรม (Engineer Requests Master Sheet) Internal request'
                        : selectedCategory === 'customer'
                        ? 'ตารางข้อมูลคำของานวิศวกรรม (Engineer Requests Master Sheet) Customer request'
                        : 'ตารางข้อมูลคำของานวิศวกรรม (Engineer Requests Master Sheet)'}
                    </h2>
                    <span className="text-[11px] bg-black/30 text-white px-2 py-0.5 rounded font-mono border border-white/20">
                      {filteredRequests.length} จาก {requests.length} แถว
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTablePrintPreview(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold rounded-lg transition-colors border border-emerald-500/40 shadow-xs"
                  title="เปิดดูตัวอย่างก่อนพิมพ์ตารางงานทั้งหมด (Print Preview Table)"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>พรีวิวพิมพ์ตาราง</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold rounded-lg transition-colors shadow-xs"
                  title="ส่งออกตารางเป็นไฟล์ Excel / CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ส่งออก Excel (.csv)</span>
                </button>
              </div>
            </div>

            {/* Excel Filter & Search Toolbar with Dropdown Filters */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                
                {/* Search Box */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหา Document No, Service No, โครงการ, ลูกค้า, วิศวกร..."
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs focus:ring-1 focus:ring-[#107c41] focus:border-[#107c41]"
                  />
                </div>

                {/* 1. Job Type Dropdown Filter (หมวดงาน) */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={selectedJobType}
                    onChange={(e) => setSelectedJobType(e.target.value as any)}
                    className="px-3 py-1.5 bg-white border border-emerald-400 rounded-lg text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-[#107c41] shadow-xs"
                  >
                    <option value="all">📂 หมวดงานทั้งหมด ({totalCount})</option>
                    {(Object.keys(JOB_TYPE_CONFIG) as JobTypeKey[]).map((key) => {
                      const count = requests.filter(r => r.jobTypes[key]).length;
                      return (
                        <option key={key} value={key}>
                          {JOB_TYPE_CONFIG[key].labelTh} ({count})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 2. Status Filter (สถานะ) */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:ring-1 focus:ring-[#107c41]"
                >
                  <option value="all">สถานะทั้งหมด (All Status)</option>
                  <option value="Open">Open (เปิดคำขอ)</option>
                  <option value="In Progress">In Progress (กำลังดำเนินการ)</option>
                  <option value="Completed">Completed (เสร็จสมบูรณ์)</option>
                </select>

                {/* 3. Priority Filter (ความเร่งด่วน) */}
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:ring-1 focus:ring-[#107c41]"
                >
                  <option value="all">ความเร่งด่วนทั้งหมด</option>
                  <option value="Normal">Normal (ปกติ)</option>
                  <option value="Urgent">Urgent (เร่งด่วน)</option>
                  <option value="Critical">Critical (วิกฤต/ฉุกเฉิน)</option>
                </select>

                {/* 4. Engineer Filter (วิศวกร) */}
                <select
                  value={selectedEngineer}
                  onChange={(e) => setSelectedEngineer(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:ring-1 focus:ring-[#107c41]"
                >
                  <option value="all">วิศวกรทุกคน</option>
                  {engineers.map(eng => (
                    <option key={eng} value={eng}>{eng}</option>
                  ))}
                </select>

                {/* Reset Filters Button if any filter is active */}
                {(selectedJobType !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedEngineer !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedJobType('all');
                      setSelectedStatus('all');
                      setSelectedPriority('all');
                      setSelectedEngineer('all');
                      setSearchQuery('');
                    }}
                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[11px] font-medium transition-colors"
                    title="ล้างตัวกรองทั้งหมด"
                  >
                    ล้างตัวกรอง
                  </button>
                )}

              </div>
            </div>

            {/* Excel Spreadsheet Table Grid */}
            <div className="overflow-x-auto max-h-[72vh] w-full">
              <table className="w-full text-left text-xs border-collapse font-sans">
                
                {/* Excel Column Headers */}
                <thead className="bg-[#f3f4f6] text-slate-800 font-bold border-b border-slate-300 sticky top-0 z-20 shadow-xs">
                  <tr className="divide-x divide-slate-300 text-slate-700">
                    <th className="py-2.5 px-3 text-center bg-slate-200/90 w-12 font-mono text-slate-600">No.</th>
                    <th className="py-2.5 px-3 min-w-[140px]">Document & Service No.</th>
                    <th className="py-2.5 px-3 min-w-[130px]">Project Code & SO</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Project Name (ชื่อโครงการ)</th>
                    <th className="py-2.5 px-3 min-w-[150px]">Customer & Tel</th>
                    <th className="py-2.5 px-3 min-w-[150px]">Site Location (สถานที่หน้างาน)</th>
                    <th className="py-2.5 px-3 min-w-[160px]">Job Types (ประเภทงาน)</th>
                    <th className="py-2.5 px-3 min-w-[140px]">Engineer & Sales</th>
                    <th className="py-2.5 px-3 text-center min-w-[95px]">Due Date</th>
                    <th className="py-2.5 px-3 text-center min-w-[90px]">Priority</th>
                    <th className="py-2.5 px-3 text-center min-w-[110px]">Status</th>
                    <th className="py-2.5 px-3 text-center min-w-[150px] bg-amber-100/70 text-amber-950 font-extrabold border-x border-amber-300">
                      ⚡ กดรับงาน / จัดการ
                    </th>
                    <th className="py-2.5 px-3 text-center min-w-[110px]">การจัดการ</th>
                  </tr>
                </thead>

                {/* Excel Rows */}
                <tbody className="divide-y divide-slate-200">
                  {filteredRequests.map((req, idx) => {
                    const activeJobKeys = (Object.keys(JOB_TYPE_CONFIG) as JobTypeKey[]).filter(k => req.jobTypes[k]);

                    return (
                      <tr 
                        key={req.id} 
                        className={`divide-x divide-slate-200 transition-colors ${
                          idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100/60'
                        }`}
                      >
                        {/* No. */}
                        <td className="py-3 px-3 text-center font-mono text-slate-500 font-medium bg-slate-100/50">
                          {idx + 1}
                        </td>

                        {/* Document & Service No */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-mono font-bold text-slate-900">{req.documentNo}</span>
                            {req.requestCategory === 'internal' ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                INTERNAL
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-100 text-blue-900 border border-blue-300">
                                CUSTOMER
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-[11px] text-slate-500">{req.serviceNo}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Req: {req.dateRequest}</div>
                        </td>

                        {/* Project Code & SO */}
                        <td className="py-3 px-3 font-mono">
                          <div className="font-bold text-slate-800">{req.projectCode}</div>
                          {req.soNumber ? (
                            <div className="text-[11px] text-amber-800 font-semibold mt-0.5">
                              SO: {req.soNumber}
                            </div>
                          ) : (
                            <div className="text-slate-400 text-[10px]">-</div>
                          )}
                        </td>

                        {/* Project Name */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 line-clamp-2" title={req.projectName}>
                            {req.projectName}
                          </div>
                          {req.requestDetails && (
                            <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5" title={req.requestDetails}>
                              📝 {req.requestDetails}
                            </div>
                          )}
                        </td>

                        {/* Customer & Tel */}
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800 truncate">{req.customer}</div>
                          <div className="text-[11px] text-slate-500">ผู้แจ้ง: {req.requester || '-'}</div>
                          {req.customerTel && (
                            <a href={`tel:${req.customerTel}`} className="inline-flex items-center gap-1 font-mono text-blue-600 hover:underline font-semibold text-[10px] mt-0.5">
                              <Phone className="w-2.5 h-2.5" />
                              <span>{req.customerTel}</span>
                            </a>
                          )}
                        </td>

                        {/* Location */}
                        <td className="py-3 px-3">
                          {req.location ? (
                            <div>
                              <div className="text-[11px] text-slate-700 line-clamp-2" title={req.location}>
                                {req.location}
                              </div>
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(req.location)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-semibold mt-0.5"
                              >
                                <MapPin className="w-2.5 h-2.5 text-rose-500" />
                                <span>เปิดแผนที่</span>
                              </a>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Job Types */}
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 max-w-[170px]">
                            {activeJobKeys.map(k => (
                              <span
                                key={k}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${JOB_TYPE_CONFIG[k].badgeClass}`}
                              >
                                {JOB_TYPE_CONFIG[k].labelTh}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Engineer & Sales */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{req.engineerStaff}</div>
                          <div className="text-[10px] text-slate-500">Sale: {req.salesInCharge}</div>
                        </td>

                        {/* Due Date */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-800 whitespace-nowrap">
                          <div>{req.dueDate}</div>
                          {req.needReport && (
                            <span className="inline-block mt-0.5 text-[9px] bg-blue-50 text-blue-700 px-1 py-0.2 rounded border border-blue-200">
                              Report Req.
                            </span>
                          )}
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            req.priority === 'Critical'
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : req.priority === 'Urgent'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {req.priority}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            req.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : req.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : req.status === 'Rejected'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              req.status === 'Completed' ? 'bg-emerald-500' :
                              req.status === 'In Progress' ? 'bg-blue-500' :
                              req.status === 'Rejected' ? 'bg-red-500' :
                              'bg-amber-500'
                            }`} />
                            <span>{req.status}</span>
                          </span>
                        </td>

                        {/* Engineer Job Acceptance & Dispatch Column */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap bg-amber-50/40 border-x border-amber-200/80">
                          {req.status === 'Open' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRequestForAction(req);
                                setIsActionModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-[11px] rounded-xl shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer animate-pulse mx-auto"
                              title="คลิกเพื่อเลือก Engineer, วันส่งงาน, วันเข้าหน้างาน หรือ Reject งาน"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>กดรับงาน (Accept)</span>
                            </button>
                          ) : req.status === 'Rejected' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRequestForAction(req);
                                setIsActionModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-900 font-bold text-[10px] rounded-xl border border-red-300 flex items-center justify-center gap-1 mx-auto cursor-pointer"
                              title={req.rejectionReason || 'งานถูก Reject'}
                            >
                              <span>❌ Rejected</span>
                              <span className="text-[9px] underline">(ดูเหตุผล)</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRequestForAction(req);
                                setIsActionModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 font-bold text-[10px] rounded-xl border border-slate-300 flex items-center justify-center gap-1 mx-auto shadow-xs cursor-pointer"
                              title="คลิกเพื่อเปลี่ยน Engineer หรือปรับปรุงวันส่งมอบ/เข้าหน้างาน"
                            >
                              <span>🛠️ จัดการ/เปลี่ยนวัน</span>
                            </button>
                          )}

                          {/* Show Scheduled On-site or Delivery date below */}
                          {(req.onSiteDate || req.deliveryDate) && (
                            <div className="text-[9px] font-mono text-slate-600 mt-1 space-y-0.5">
                              {req.onSiteDate && <div>เข้างาน: {req.onSiteDate}</div>}
                              {req.deliveryDate && <div className="text-blue-700 font-bold">ส่งงาน: {req.deliveryDate}</div>}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onPrint(req)}
                              title="พิมพ์ใบคำขอและรายงาน (Print A4 Form)"
                              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onEdit(req)}
                              title="เปิดแก้ไขและบันทึกรายละเอียดคำขอ"
                              className="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`ยืนยันการลบใบคำขอ ${req.documentNo} (${req.projectName}) ออกจากระบบอย่างถาวรหรือไม่?`)) {
                                  onDelete(req.id);
                                }
                              }}
                              title="ลบใบคำขอนี้ออกจากระบบอย่างถาวร (Permanent Delete)"
                              className="p-1.5 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-lg transition-all border border-rose-200 hover:border-rose-600 cursor-pointer shadow-xs active:scale-90"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={13} className="py-12 text-center text-slate-400 bg-white">
                        <div className="max-w-xs mx-auto space-y-2">
                          <p className="text-sm font-semibold text-slate-600">ไม่พบรายการคำขอตามเงื่อนไขที่เลือก</p>
                          <p className="text-xs text-slate-400">ลองเปลี่ยนตัวกรองประเภทงาน หรือล้างคำค้นหา</p>
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
                <span>แสดงผล: <strong className="text-slate-900">{filteredRequests.length}</strong> จาก {requests.length} แถว</span>
                <span className="hidden sm:inline text-slate-400">•</span>
                <span className="hidden sm:inline">รอดำเนินการ: <strong className="text-amber-700">{openCount}</strong></span>
                <span className="hidden sm:inline text-slate-400">•</span>
                <span className="hidden sm:inline">กำลังดำเนินการ: <strong className="text-blue-700">{inProgressCount}</strong></span>
                <span className="hidden sm:inline text-slate-400">•</span>
                <span className="hidden sm:inline">เสร็จสมบูรณ์: <strong className="text-emerald-700">{completedCount}</strong></span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Sheet1: LUMENCRAFT_SERVICE_MASTER
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Master Table Print Preview Modal */}
      {showTablePrintPreview && (
        <RequestTablePrintPreview
          requests={filteredRequests}
          totalAllRequests={requests.length}
          selectedJobType={selectedJobType}
          selectedStatus={selectedStatus}
          onClose={() => setShowTablePrintPreview(false)}
        />
      )}

      {/* Engineer Job Action Pop-up Modal */}
      <EngineerJobActionModal
        isOpen={isActionModalOpen}
        onClose={() => {
          setIsActionModalOpen(false);
          setSelectedRequestForAction(null);
        }}
        request={selectedRequestForAction}
        onSave={(updated) => {
          onSaveRequest(updated);
          setIsActionModalOpen(false);
          setSelectedRequestForAction(null);
        }}
      />
    </div>
  );
};
