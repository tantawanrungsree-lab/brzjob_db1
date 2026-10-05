import React, { useState } from 'react';
import { EngineerRequest, JobTypeKey, JOB_TYPE_CONFIG } from '../../types';
import { 
  CheckCircle2, Clock, MapPin, Phone, Mail, FileText, 
  Printer, Edit2, AlertTriangle, UserCheck, Check, Navigation,
  Calendar, ShieldAlert, Sparkles, Building, ExternalLink,
  Download, Search, Filter, Car, Trash2
} from 'lucide-react';

interface EngineerJobPortalProps {
  requests: EngineerRequest[];
  onEdit: (req: EngineerRequest) => void;
  onPrint: (req: EngineerRequest) => void;
  onSaveRequest: (req: EngineerRequest) => void;
  onDelete?: (id: string) => void;
}

export const EngineerJobPortal: React.FC<EngineerJobPortalProps> = ({
  requests,
  onEdit,
  onPrint,
  onSaveRequest,
  onDelete
}) => {
  const [selectedEngineer, setSelectedEngineer] = useState<string>('all');
  const [jobStatusFilter, setJobStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Extract unique engineers
  const engineers = Array.from(new Set(requests.map(r => r.engineerStaff).filter(Boolean)));

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
      (req.location && req.location.toLowerCase().includes(q));

    const matchEng = selectedEngineer === 'all' || req.engineerStaff === selectedEngineer;
    
    let matchStatus = true;
    if (jobStatusFilter === 'pending') {
      matchStatus = req.status === 'Open';
    } else if (jobStatusFilter === 'in_progress') {
      matchStatus = req.status === 'In Progress';
    } else if (jobStatusFilter === 'completed') {
      matchStatus = req.status === 'Completed';
    }

    return matchSearch && matchEng && matchStatus;
  });

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => {
      setActionNotice(null);
    }, 4000);
  };

  const handleAcceptJob = (req: EngineerRequest) => {
    const updated: EngineerRequest = {
      ...req,
      status: 'In Progress',
      updatedAt: new Date().toISOString()
    };
    onSaveRequest(updated);
    showNotice(`✅ วิศวกรกดรับงาน ${req.documentNo} (${req.projectName}) เรียบร้อยแล้ว! สถานะเปลี่ยนเป็น 'กำลังดำเนินการ (In Progress)'`);
  };

  const handleUpdateCheckIn = (req: EngineerRequest, type: 'enroute' | 'arrived' | 'complete') => {
    let note = '';
    let newStatus = req.status;

    if (type === 'enroute') {
      note = `[${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}] วิศวกรกำลังออกเดินทางไปหน้างาน`;
      newStatus = 'In Progress';
    } else if (type === 'arrived') {
      note = `[${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}] วิศวกรเช็คอินถึงสถานที่หน้างานแล้ว`;
      newStatus = 'In Progress';
    } else if (type === 'complete') {
      note = `[${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}] ปฏิบัติงานเสร็จสิ้น รอตรวจสอบและส่งมอบงาน`;
      newStatus = 'Completed';
    }

    const existingDetails = req.workDetails || '';
    const newWorkDetails = existingDetails 
      ? `${existingDetails}\n${note}`
      : note;

    const updated: EngineerRequest = {
      ...req,
      status: newStatus,
      workDetails: newWorkDetails,
      updatedAt: new Date().toISOString()
    };

    onSaveRequest(updated);
    showNotice(`📍 บันทึกสถานะหน้างาน: ${note}`);
  };

  const handleExportCSV = () => {
    const headers = ['No', 'Document No', 'Service No', 'Project Code', 'SO No', 'Project Name', 'Customer', 'Customer Tel', 'Location', 'Engineer', 'Due Date', 'Priority', 'Status'];
    const rows = filteredRequests.map((r, i) => [
      i + 1,
      r.documentNo,
      r.serviceNo,
      r.projectCode,
      r.soNumber,
      `"${r.projectName.replace(/"/g, '""')}"`,
      `"${r.customer.replace(/"/g, '""')}"`,
      r.customerTel || '',
      `"${(r.location || '').replace(/"/g, '""')}"`,
      `"${r.engineerStaff.replace(/"/g, '""')}"`,
      r.dueDate,
      r.priority,
      r.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `engineer_jobs_lumencraft_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingCount = requests.filter(r => r.status === 'Open').length;
  const activeCount = requests.filter(r => r.status === 'In Progress').length;
  const doneCount = requests.filter(r => r.status === 'Completed').length;

  return (
    <div className="space-y-4">
      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-3.5 bg-emerald-700 text-white rounded-xl shadow-lg flex items-center justify-between animate-fadeIn transition-all">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-white/80 hover:text-white text-xs font-bold px-2 py-1">
            ✕ ปิด
          </button>
        </div>
      )}

      {/* Excel Sheet Container */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden flex flex-col">
        
        {/* Excel Ribbon / Green Header Bar */}
        <div className="bg-[#107c41] text-white px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 text-white font-bold flex items-center justify-center font-mono text-sm border border-white/30">
              XL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-heading text-white">
                  ตารางสำหรับวิศวกรรับงาน & อัปเดตสถานะหน้างาน (Engineer Task Matrix)
                </h2>
                <span className="text-[11px] bg-emerald-950/60 text-emerald-200 px-2 py-0.5 rounded font-mono">
                  {filteredRequests.length} รายการ
                </span>
              </div>
              <p className="text-[11px] text-emerald-100">
                ระบบจัดการรับงาน เช็คอินภาคสนาม และรายงานการปฏิบัติงานในรูปแบบตาราง Excel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
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

        {/* Excel Filter & Formula Bar Toolbar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setJobStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                jobStatusFilter === 'all' ? 'bg-[#107c41] text-white font-bold shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              งานทั้งหมด ({requests.length})
            </button>
            <button
              onClick={() => setJobStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                jobStatusFilter === 'pending' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              รอกดรับงาน ({pendingCount})
            </button>
            <button
              onClick={() => setJobStatusFilter('in_progress')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                jobStatusFilter === 'in_progress' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              กำลังดำเนินการ ({activeCount})
            </button>
            <button
              onClick={() => setJobStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                jobStatusFilter === 'completed' ? 'bg-emerald-700 text-white font-bold shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              เสร็จสิ้นแล้ว ({doneCount})
            </button>
          </div>

          {/* Engineer Dropdown & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 border border-slate-300 rounded-xl">
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500 font-medium">วิศวกร:</span>
              <select
                value={selectedEngineer}
                onChange={(e) => setSelectedEngineer(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="all">ทุกคน (All Engineers)</option>
                {engineers.map(eng => (
                  <option key={eng} value={eng}>{eng}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาในตาราง..."
                className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl bg-white text-xs focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 w-48 sm:w-60"
              />
            </div>
          </div>
        </div>

        {/* Excel Spreadsheet Table */}
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-left text-xs border-collapse font-sans">
            
            {/* Table Header Styled Like Excel Column Grid */}
            <thead className="bg-[#f3f4f6] text-slate-800 font-bold border-b border-slate-300 sticky top-0 z-20 shadow-xs">
              <tr className="divide-x divide-slate-300">
                <th className="py-2.5 px-3 text-center bg-slate-200/90 w-12 font-mono text-slate-600">No.</th>
                <th className="py-2.5 px-3 min-w-[140px]">เลขที่เอกสาร (Doc No.)</th>
                <th className="py-2.5 px-3 min-w-[130px]">Project Code & SO</th>
                <th className="py-2.5 px-3 min-w-[190px]">ชื่อโครงการ (Project Name)</th>
                <th className="py-2.5 px-3 min-w-[150px]">ลูกค้า & เบอร์ติดต่อ</th>
                <th className="py-2.5 px-3 min-w-[160px]">สถานที่หน้างาน (Site Location)</th>
                <th className="py-2.5 px-3 min-w-[160px]">ประเภทงาน (Job Types)</th>
                <th className="py-2.5 px-3 min-w-[130px]">วิศวกร (Engineer)</th>
                <th className="py-2.5 px-3 min-w-[100px] text-center">Due Date</th>
                <th className="py-2.5 px-3 text-center min-w-[90px]">Priority</th>
                <th className="py-2.5 px-3 text-center min-w-[110px]">สถานะงาน</th>
                <th className="py-2.5 px-3 min-w-[210px] text-center bg-emerald-50 text-emerald-950 font-extrabold border-l-2 border-emerald-400">
                  ⚡ การรับงาน & เช็คอินหน้างาน
                </th>
                <th className="py-2.5 px-3 text-center min-w-[120px]">รายงาน / พิมพ์</th>
              </tr>
            </thead>

            {/* Table Rows with Excel Grid Borders */}
            <tbody className="divide-y divide-slate-200">
              {filteredRequests.map((req, idx) => {
                const activeJobKeys = (Object.keys(JOB_TYPE_CONFIG) as JobTypeKey[]).filter(k => req.jobTypes[k]);
                const isPendingAcceptance = req.status === 'Open';

                return (
                  <tr 
                    key={req.id} 
                    className={`divide-x divide-slate-200 transition-colors ${
                      isPendingAcceptance 
                        ? 'bg-amber-50/40 hover:bg-amber-100/50' 
                        : idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100/60'
                    }`}
                  >
                    {/* No. Column */}
                    <td className="py-3 px-3 text-center font-mono text-slate-500 font-medium bg-slate-100/50">
                      {idx + 1}
                    </td>

                    {/* Doc No & Service No */}
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-slate-900">{req.documentNo}</div>
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

                    {/* Customer & Phone */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800 truncate">{req.customer}</div>
                      {req.customerTel ? (
                        <a href={`tel:${req.customerTel}`} className="inline-flex items-center gap-1 font-mono text-blue-600 hover:underline font-semibold text-[11px] mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{req.customerTel}</span>
                        </a>
                      ) : (
                        <div className="text-slate-400 text-[10px]">-</div>
                      )}
                    </td>

                    {/* Site Location & Map */}
                    <td className="py-3 px-3">
                      {req.location ? (
                        <div className="space-y-1">
                          <div className="text-[11px] text-slate-700 line-clamp-2" title={req.location}>
                            {req.location}
                          </div>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(req.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                          >
                            <MapPin className="w-2.5 h-2.5 text-rose-500" />
                            <span>แผนที่หน้างาน</span>
                          </a>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Job Types */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
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

                    {/* Engineer */}
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div>{req.engineerStaff}</div>
                      <div className="text-[10px] text-slate-500 font-normal">Sale: {req.salesInCharge}</div>
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-800 whitespace-nowrap">
                      {req.dueDate}
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        req.priority === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                        req.priority === 'Urgent' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {req.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        req.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : req.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          req.status === 'Completed' ? 'bg-emerald-500' :
                          req.status === 'In Progress' ? 'bg-blue-500' :
                          'bg-amber-500'
                        }`} />
                        <span>
                          {req.status === 'Open' ? 'รอรับงาน' :
                           req.status === 'In Progress' ? 'กำลังดำเนินการ' :
                           'เสร็จสมบูรณ์'}
                        </span>
                      </span>
                    </td>

                    {/* ACTION COLUMN 1: Acceptance & Field On-Site Buttons */}
                    <td className="py-3 px-3 bg-emerald-50/40 text-center whitespace-nowrap border-l-2 border-emerald-300">
                      {isPendingAcceptance ? (
                        <button
                          onClick={() => handleAcceptJob(req)}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5 mx-auto"
                        >
                          <Check className="w-4 h-4" />
                          <span>✅ กดรับงาน (Accept)</span>
                        </button>
                      ) : req.status === 'In Progress' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleUpdateCheckIn(req, 'enroute')}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded border border-slate-300 transition-colors"
                            title="บันทึกว่ากำลังออกเดินทาง"
                          >
                            🚗 เดินทาง
                          </button>
                          <button
                            onClick={() => handleUpdateCheckIn(req, 'arrived')}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded border border-emerald-300 transition-colors"
                            title="บันทึกว่าเช็คอินถึงหน้างานแล้ว"
                          >
                            📍 ถึงหน้างาน
                          </button>
                          <button
                            onClick={() => handleUpdateCheckIn(req, 'complete')}
                            className="px-2 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-xs"
                            title="บันทึกว่าเสร็จงาน"
                          >
                            ✓ เสร็จงาน
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>งานเสร็จสมบูรณ์</span>
                        </span>
                      )}
                    </td>

                    {/* ACTION COLUMN 2: Report & Print */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEdit(req)}
                          title="เปิดแบบฟอร์มเพื่อกรอกข้อมูลผลการปฏิบัติงาน"
                          className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>กรอกฟอร์ม</span>
                        </button>
                        <button
                          onClick={() => onPrint(req)}
                          title="พิมพ์ใบคำขอ Lumencraft A4"
                          className="p-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        {onDelete && (
                          <button
                            onClick={() => {
                              if (window.confirm(`ยืนยันการลบใบคำขอ ${req.documentNo} ออกจากระบบและ Firebase หรือไม่?`)) {
                                onDelete(req.id);
                              }
                            }}
                            title="ลบใบคำขอนี้ออกจากระบบและ Firebase"
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400 bg-white">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="text-sm font-semibold text-slate-600">ไม่พบรายการงานตามเงื่อนไขที่เลือก</p>
                      <p className="text-xs text-slate-400">ลองเปลี่ยนตัวเลือกวิศวกร หรือล้างคำค้นหา</p>
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
            <span>แสดงผล: <strong className="text-slate-900">{filteredRequests.length}</strong> จาก {requests.length} รายการ</span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline">รอกดรับงาน: <strong className="text-amber-700">{pendingCount}</strong></span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline">กำลังดำเนินการ: <strong className="text-blue-700">{activeCount}</strong></span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline">เสร็จสิ้นแล้ว: <strong className="text-emerald-700">{doneCount}</strong></span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Lumencraft Engineering Field Management System
          </div>
        </div>

      </div>
    </div>
  );
};
