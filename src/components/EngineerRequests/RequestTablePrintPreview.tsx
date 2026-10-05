import React, { useState } from 'react';
import { EngineerRequest, JobTypeKey, JOB_TYPE_CONFIG } from '../../types';
import { 
  Printer, ArrowLeft, Download, CheckCircle2, 
  Calendar, FileSpreadsheet, X, Sliders, Maximize2, Layout
} from 'lucide-react';

interface RequestTablePrintPreviewProps {
  requests: EngineerRequest[];
  totalAllRequests: number;
  selectedJobType: JobTypeKey | 'all';
  selectedStatus: string;
  onClose: () => void;
}

export const RequestTablePrintPreview: React.FC<RequestTablePrintPreviewProps> = ({
  requests,
  totalAllRequests,
  selectedJobType,
  selectedStatus,
  onClose
}) => {
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [fontSize, setFontSize] = useState<'normal' | 'compact'>('compact');

  const handlePrint = () => {
    window.print();
  };

  const openCount = requests.filter(r => r.status === 'Open').length;
  const inProgressCount = requests.filter(r => r.status === 'In Progress').length;
  const completedCount = requests.filter(r => r.status === 'Completed').length;
  const criticalCount = requests.filter(r => r.priority === 'Critical' || r.priority === 'Urgent').length;

  const todayStr = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex flex-col overflow-hidden text-slate-900 font-sans print:p-0 print:bg-white print:static print:h-auto">
      
      {/* Print Specific CSS to Guarantee Perfect Page Fitting */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: ${orientation === 'landscape' ? 'landscape' : 'portrait'};
            margin: 6mm 8mm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .printable-sheet {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}} />

      {/* Top Action Toolbar (Hidden when printing) */}
      <div className="bg-slate-900 text-white px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg border-b border-slate-800 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-heading">
                ตัวอย่างก่อนพิมพ์ตารางงานวิศวกรรม (Print Preview - Master Request Sheet)
              </h2>
              <span className="text-xs bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                {requests.length} รายการ
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              พรีวิวและพิมพ์รายงานสรุปคำขอแบบฟอร์มมาตรฐาน Lumencraft A4 Landscape / Portrait
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Orientation Toggle */}
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setOrientation('landscape')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                orientation === 'landscape' ? 'bg-white text-slate-950 font-bold shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5 rotate-90" />
              <span>แนวนอน (Landscape)</span>
            </button>
            <button
              onClick={() => setOrientation('portrait')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                orientation === 'portrait' ? 'bg-white text-slate-950 font-bold shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>แนวตั้ง (Portrait)</span>
            </button>
          </div>

          {/* Font Size Toggle */}
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setFontSize('compact')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                fontSize === 'compact' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              ตัวหนังสือกระชับ
            </button>
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                fontSize === 'normal' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              ตัวหนังสือปกติ
            </button>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>สั่งพิมพ์ / บันทึกเป็น PDF (Print)</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="ปิดหน้าต่างพรีวิว"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Print Preview Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/80 print:p-0 print:bg-white flex justify-center">
        
        {/* Printable Paper Canvas (A4 Landscape / Portrait) */}
        <div 
          className={`printable-sheet bg-white text-slate-900 shadow-2xl print:shadow-none border border-slate-300 print:border-none p-6 sm:p-8 transition-all flex flex-col justify-between ${
            orientation === 'landscape' ? 'w-full max-w-[1150px] min-h-[720px]' : 'w-full max-w-[850px] min-h-[1050px]'
          }`}
        >
          <div>
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-wider text-slate-950 font-heading">
                    LUMENCRAFT
                  </h1>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                    MASTER SCHEDULE REPORT
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 tracking-wider mt-0.5">
                  LUMENCRAFT PROFESSIONAL LIGHTING SOLUTIONS • ENGINEERING & SERVICE OPERATIONS
                </p>
              </div>

              <div className="text-right text-[11px] font-mono-data space-y-0.5">
                <div>วันที่ออกรายงาน: <strong className="text-slate-900">{todayStr}</strong></div>
                <div>ตัวกรองหมวดงาน: <strong className="text-blue-900">{selectedJobType === 'all' ? 'ทุกหมวดงาน' : JOB_TYPE_CONFIG[selectedJobType]?.labelTh}</strong></div>
                <div>สถานะที่เลือก: <strong className="text-slate-900">{selectedStatus === 'all' ? 'ทุกสถานะ' : selectedStatus}</strong></div>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="bg-[#107c41] text-white px-4 py-2 rounded-lg flex items-center justify-between mb-3 shadow-xs">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                <h2 className="text-xs sm:text-sm font-bold tracking-wide">
                  ตารางคำขอและกำหนดการปฏิบัติงานวิศวกรรม (ENGINEER SERVICE REQUEST MASTER LIST)
                </h2>
              </div>
              <div className="text-[11px] font-mono font-bold">
                จำนวนที่แสดง: {requests.length} รายการ (จากทั้งหมด {totalAllRequests} รายการ)
              </div>
            </div>

            {/* Summary Statistics Pill Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-[11px]">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <span className="text-slate-600">คำขอทั้งหมด:</span>
                <strong className="font-mono text-slate-900 text-xs">{requests.length} รายการ</strong>
              </div>
              <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                <span className="text-amber-800">รอดำเนินการ (Open):</span>
                <strong className="font-mono text-amber-900 text-xs">{openCount}</strong>
              </div>
              <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <span className="text-blue-800">กำลังทำ (In Progress):</span>
                <strong className="font-mono text-blue-900 text-xs">{inProgressCount}</strong>
              </div>
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                <span className="text-emerald-800">เสร็จสมบูรณ์ (Completed):</span>
                <strong className="font-mono text-emerald-900 text-xs">{completedCount}</strong>
              </div>
            </div>

            {/* Master Table Grid */}
            <div className="border border-slate-300 rounded-lg overflow-hidden mb-4">
              <table className={`w-full text-left border-collapse ${fontSize === 'compact' ? 'text-[10px]' : 'text-[11px]'}`}>
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <tr className="divide-x divide-slate-300">
                    <th className="py-1.5 px-2 text-center w-8 font-mono bg-slate-200">No.</th>
                    <th className="py-1.5 px-2 min-w-[100px]">Doc / Service No.</th>
                    <th className="py-1.5 px-2 min-w-[90px]">Project Code</th>
                    <th className="py-1.5 px-2.5 min-w-[140px]">Project Name (ชื่อโครงการ)</th>
                    <th className="py-1.5 px-2 min-w-[110px]">Customer & Tel</th>
                    <th className="py-1.5 px-2 min-w-[110px]">Location (สถานที่)</th>
                    <th className="py-1.5 px-2 min-w-[110px]">Job Types (หมวดงาน)</th>
                    <th className="py-1.5 px-2 min-w-[95px]">Engineer / Sales</th>
                    <th className="py-1.5 px-2 text-center min-w-[75px]">Due Date</th>
                    <th className="py-1.5 px-2 text-center min-w-[65px]">Priority</th>
                    <th className="py-1.5 px-2 text-center min-w-[75px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {requests.map((req, idx) => {
                    const activeJobs = (Object.keys(JOB_TYPE_CONFIG) as JobTypeKey[])
                      .filter(k => req.jobTypes[k])
                      .map(k => JOB_TYPE_CONFIG[k].labelTh)
                      .join(', ');

                    return (
                      <tr 
                        key={req.id} 
                        className={`divide-x divide-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}
                      >
                        <td className="py-1.5 px-1 text-center font-mono text-slate-500 font-bold bg-slate-100/50">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-2">
                          <div className="font-mono font-bold text-slate-900">{req.documentNo}</div>
                          <div className="font-mono text-[9px] text-slate-500">{req.serviceNo}</div>
                        </td>
                        <td className="py-1.5 px-2 font-mono">
                          <div className="font-bold text-slate-800">{req.projectCode}</div>
                          {req.soNumber && <div className="text-[9px] text-amber-800 font-semibold">SO: {req.soNumber}</div>}
                        </td>
                        <td className="py-1.5 px-2.5">
                          <div className="font-bold text-slate-900 line-clamp-1">{req.projectName}</div>
                          {req.requestDetails && (
                            <div className="text-[9px] text-slate-500 line-clamp-1 mt-0.5">
                              {req.requestDetails}
                            </div>
                          )}
                        </td>
                        <td className="py-1.5 px-2">
                          <div className="font-medium text-slate-800 truncate">{req.customer}</div>
                          {req.customerTel && <div className="text-[9px] font-mono text-blue-700">{req.customerTel}</div>}
                        </td>
                        <td className="py-1.5 px-2 text-slate-700">
                          <div className="line-clamp-1">{req.location || '-'}</div>
                        </td>
                        <td className="py-1.5 px-2">
                          <div className="font-medium text-slate-800 line-clamp-2">
                            {activeJobs || '-'}
                          </div>
                        </td>
                        <td className="py-1.5 px-2">
                          <div className="font-semibold text-slate-900 truncate">{req.engineerStaff}</div>
                          <div className="text-[9px] text-slate-500 truncate">Sale: {req.salesInCharge}</div>
                        </td>
                        <td className="py-1.5 px-2 text-center font-mono font-bold whitespace-nowrap">
                          {req.dueDate}
                        </td>
                        <td className="py-1.5 px-2 text-center whitespace-nowrap">
                          <span className={`font-bold ${
                            req.priority === 'Critical' ? 'text-red-700' :
                            req.priority === 'Urgent' ? 'text-amber-800' :
                            'text-slate-700'
                          }`}>
                            {req.priority}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-center whitespace-nowrap">
                          <span className={`font-bold ${
                            req.status === 'Completed' ? 'text-emerald-700' :
                            req.status === 'In Progress' ? 'text-blue-700' :
                            'text-amber-700'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-400">
                        ไม่มีข้อมูลตามเงื่อนไขที่เลือก
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* Print Footer & Sign-off Signature Columns */}
          <div className="border-t-2 border-slate-900 pt-3 mt-4 text-[10px]">
            <div className="grid grid-cols-3 gap-6 text-center">
              
              <div className="space-y-6">
                <span className="font-bold text-slate-700 uppercase block">1. ผู้จัดทำรายงาน (Prepared By)</span>
                <div className="border-b border-slate-400 w-36 mx-auto" />
                <div className="text-slate-500 font-mono">วันที่: _____/_____/_________</div>
              </div>

              <div className="space-y-6">
                <span className="font-bold text-slate-700 uppercase block">2. วิศวกรผู้ควบคุมงาน (Engineer In Charge)</span>
                <div className="border-b border-slate-400 w-36 mx-auto" />
                <div className="text-slate-500 font-mono">วันที่: _____/_____/_________</div>
              </div>

              <div className="space-y-6">
                <span className="font-bold text-slate-700 uppercase block">3. ผู้อนุมัติโครงการ (Approved By)</span>
                <div className="border-b border-slate-400 w-36 mx-auto" />
                <div className="text-slate-500 font-mono">วันที่: _____/_____/_________</div>
              </div>

            </div>

            <div className="flex justify-between items-center text-slate-400 text-[9px] pt-3 mt-3 border-t border-slate-200 font-mono">
              <div>LUMENCRAFT SERVICE MANAGEMENT CONTROLLED REPORT</div>
              <div>Page 1 of 1 • System Generated Document</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
