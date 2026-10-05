import React from 'react';
import { EngineerRequest } from '../../types';
import { Printer, ArrowLeft, Download, CheckSquare, Square } from 'lucide-react';

interface ServiceRequestPrintDocumentProps {
  request: EngineerRequest;
  onBack: () => void;
}

export const ServiceRequestPrintDocument: React.FC<ServiceRequestPrintDocumentProps> = ({
  request,
  onBack
}) => {
  const handlePrint = () => {
    window.print();
  };

  const renderCheck = (checked: boolean) => (
    <span className="inline-flex items-center align-middle mr-1.5">
      {checked ? (
        <CheckSquare className="w-3.5 h-3.5 text-black" />
      ) : (
        <Square className="w-3.5 h-3.5 text-slate-400" />
      )}
    </span>
  );

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 print:p-0 print:bg-white text-slate-900 font-sans">
      {/* Top Action Bar (hidden in print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ย้อนกลับ</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right mr-2">
            <div className="text-xs text-slate-500 font-mono">Doc No. {request.documentNo}</div>
            <div className="text-sm font-semibold text-slate-800">{request.projectName}</div>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์ / บันทึก PDF (Print A4)</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document Container (Matches PDF 1:1) */}
      <div className="max-w-4xl mx-auto space-y-8 print:space-y-0 print:max-w-none">
        
        {/* ================= PAGE 1 ================= */}
        <div className="bg-white p-8 border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0 page-break min-h-[1080px] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold tracking-wider text-slate-950 font-heading">LUMENCRAFT</h1>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-0.5">Professional Lighting Solutions</p>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold tracking-wide uppercase px-4 py-1 bg-slate-100 rounded text-slate-900 border border-slate-300">
                  SERVICE REQUEST
                </h2>
              </div>
              <div className="text-right text-xs space-y-1 font-mono-data">
                <div><span className="font-semibold text-slate-700">Document No.:</span> <span className="underline font-bold text-slate-900">{request.documentNo || '__________'}</span></div>
                <div><span className="font-semibold text-slate-700">Service No.:</span> <span className="underline font-bold text-slate-900">{request.serviceNo || '__________'}</span></div>
                <div><span className="font-semibold text-slate-700">Date Request:</span> <span className="underline text-slate-900">{request.dateRequest || '__________'}</span></div>
              </div>
            </div>

            {/* 01 | GENERAL INFORMATION / PROJECT CONTROL */}
            <div className="mb-4">
              <div className="bg-slate-900 text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider flex justify-between">
                <span>01 | GENERAL INFORMATION / PROJECT CONTROL / ข้อมูลทั่วไป / การควบคุมโครงการ</span>
              </div>
              <div className="border border-t-0 border-slate-300 p-3 text-xs space-y-2.5">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-5">
                    <div className="text-[10px] text-slate-600 font-medium">Project Code (รหัสโครงการ / รหัสงาน)</div>
                    <div className="font-mono-data font-semibold text-slate-900 border-b border-dotted border-slate-400 pb-0.5 mt-0.5">
                      {request.projectCode || '-'}
                    </div>
                  </div>
                  <div className="col-span-5">
                    <div className="text-[10px] text-slate-600 font-medium">Project Name (ชื่อโครงการ)</div>
                    <div className="font-semibold text-slate-900 border-b border-dotted border-slate-400 pb-0.5 mt-0.5 truncate">
                      {request.projectName || '-'}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[10px] text-slate-600 font-medium">Revision (ครั้งที่แก้ไข)</div>
                    <div className="font-mono-data font-semibold text-slate-900 border-b border-dotted border-slate-400 pb-0.5 mt-0.5 text-center">
                      {request.revision || '0'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-4">
                    <div className="text-[10px] text-slate-600 font-medium">SO Number (เลขที่ SO / Sales Order)</div>
                    <div className="font-mono-data font-semibold text-slate-900 border-b border-dotted border-slate-400 pb-0.5 mt-0.5">
                      {request.soNumber || '-'}
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="text-[10px] text-slate-600 font-medium">Eng. No. (เลขที่ Engineer / งาน)</div>
                    <div className="font-mono-data font-semibold text-slate-900 border-b border-dotted border-slate-400 pb-0.5 mt-0.5">
                      {request.engNo || '-'}
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="text-[10px] text-slate-600 font-medium">Date Request (วันที่รับคำขอ)</div>
                    <div className="font-mono-data font-semibold text-slate-900 border-b border-dotted border-slate-400 pb-0.5 mt-0.5">
                      {request.dateRequest || '-'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-4">
                    <div className="text-[10px] text-slate-600 font-medium mb-1">Priority (ระดับความเร่งด่วน)</div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center text-xs">
                        {renderCheck(request.priority === 'Normal')} Normal
                      </label>
                      <label className="flex items-center text-xs font-semibold text-amber-900">
                        {renderCheck(request.priority === 'Urgent')} Urgent
                      </label>
                      <label className="flex items-center text-xs font-bold text-red-900">
                        {renderCheck(request.priority === 'Critical')} Critical
                      </label>
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="text-[10px] text-slate-600 font-medium">Customer (ชื่อลูกค้า / บริษัท)</div>
                    <div className="font-semibold text-slate-900 border-b border-dotted border-slate-400 pb-0.5 mt-0.5 truncate">
                      {request.customer || '-'}
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="text-[10px] text-slate-600 font-medium">Customer E-mail (อีเมลผู้ติดต่อ)</div>
                    <div className="font-mono-data text-slate-800 border-b border-dotted border-slate-400 pb-0.5 mt-0.5 truncate">
                      {request.customerEmail || '-'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-4">
                    <div className="text-[10px] text-slate-600 font-medium">Location / Site (สถานที่ปฏิบัติงาน / หน้างาน)</div>
                    <div className="text-slate-900 border-b border-dotted border-slate-400 pb-0.5 mt-0.5">
                      {request.location || '-'}
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="text-[10px] text-slate-600 font-medium">Sales in Charge (เซลล์เจ้าของงาน)</div>
                    <div className="text-slate-900 border-b border-dotted border-slate-400 pb-0.5 mt-0.5">
                      {request.salesInCharge || '-'}
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="text-[10px] text-slate-600 font-medium">Requester (ผู้แจ้ง / ผู้ขอใช้บริการ)</div>
                    <div className="text-slate-900 border-b border-dotted border-slate-400 pb-0.5 mt-0.5">
                      {request.requester || '-'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-4">
                    <div className="text-[10px] text-slate-600 font-medium">Engineer / Staff (ผู้รับผิดชอบงาน Service)</div>
                    <div className="font-semibold text-slate-900 border-b border-dotted border-slate-400 pb-0.5 mt-0.5">
                      {request.engineerStaff || '-'}
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="text-[10px] text-slate-600 font-medium">Customer Tel. (เบอร์ติดต่อหน้างาน)</div>
                    <div className="font-mono-data text-slate-900 border-b border-dotted border-slate-400 pb-0.5 mt-0.5">
                      {request.customerTel || '-'}
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="text-[10px] text-slate-600 font-medium">Due Date (วันที่ต้องการให้งานเสร็จ)</div>
                    <div className="font-mono-data font-semibold text-slate-900 border-b border-dotted border-slate-400 pb-0.5 mt-0.5">
                      {request.dueDate || '-'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3 pt-1 border-t border-slate-200">
                  <div className="col-span-4">
                    <div className="text-[10px] text-slate-600 font-medium mb-0.5">Report (ต้องการรายงานหรือไม่)</div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center">{renderCheck(request.needReport)} Yes</label>
                      <label className="flex items-center">{renderCheck(!request.needReport)} No</label>
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="text-[10px] text-slate-600 font-medium mb-0.5">Installation Guide (ต้องการคู่มือติดตั้งหรือไม่)</div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center">{renderCheck(request.needInstallGuide)} Yes</label>
                      <label className="flex items-center">{renderCheck(!request.needInstallGuide)} No</label>
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="text-[10px] text-slate-600 font-medium mb-0.5">Status (สถานะปัจจุบันของงาน)</div>
                    <div className="flex items-center gap-3 font-medium">
                      <label className="flex items-center">{renderCheck(request.status === 'Open')} Open</label>
                      <label className="flex items-center text-amber-800">{renderCheck(request.status === 'In Progress')} In Progress</label>
                      <label className="flex items-center text-emerald-800">{renderCheck(request.status === 'Completed')} Completed</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 02 | SUPPORTING DOCUMENTS */}
            <div className="mb-4">
              <div className="bg-slate-900 text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                02 | SUPPORTING DOCUMENTS / เอกสารประกอบ
              </div>
              <div className="border border-t-0 border-slate-300 p-3 text-xs grid grid-cols-12 gap-4">
                <div className="col-span-7 border-r border-slate-200 pr-4 space-y-2">
                  <div className="text-[10px] font-semibold text-slate-700 uppercase">DOCUMENT TYPE / ประเภทเอกสาร</div>
                  <div className="grid grid-cols-3 gap-y-1.5 gap-x-2">
                    <label className="flex items-center">{renderCheck(request.supportingDocs.docTypes.specSheet)} Spec Sheet</label>
                    <label className="flex items-center">{renderCheck(request.supportingDocs.docTypes.drawing)} Drawing</label>
                    <label className="flex items-center">{renderCheck(request.supportingDocs.docTypes.boq)} BOQ</label>
                    <label className="flex items-center">{renderCheck(request.supportingDocs.docTypes.productList)} Product List</label>
                    <label className="flex items-center">{renderCheck(request.supportingDocs.docTypes.photo)} Photo</label>
                    <label className="flex items-center">{renderCheck(request.supportingDocs.docTypes.quotationSo)} Quotation / SO</label>
                    <label className="flex items-center">{renderCheck(request.supportingDocs.docTypes.warranty)} Warranty</label>
                    <label className="flex items-center col-span-2">{renderCheck(request.supportingDocs.docTypes.other)} Other: {request.supportingDocs.docTypes.otherText || '__________'}</label>
                  </div>
                </div>
                <div className="col-span-5 space-y-2">
                  <div className="text-[10px] font-semibold text-slate-700 uppercase">ATTACHMENT STATUS / สถานะเอกสาร</div>
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-2">
                    <label className="flex items-center">{renderCheck(request.supportingDocs.attachmentStatus === 'Attached')} Attached / แนบแล้ว</label>
                    <label className="flex items-center">{renderCheck(request.supportingDocs.attachmentStatus === 'Pending')} Pending / รอเอกสาร</label>
                    <label className="flex items-center">{renderCheck(request.supportingDocs.attachmentStatus === 'Complete')} Complete / ครบ</label>
                    <label className="flex items-center">{renderCheck(request.supportingDocs.attachmentStatus === 'Incomplete')} Incomplete / ไม่ครบ</label>
                  </div>
                  <div className="pt-1 text-[11px] text-slate-700">
                    <span className="font-semibold">Missing / เอกสารที่ขาด:</span> <span className="underline">{request.supportingDocs.missingDetails || 'ไม่มี'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 03 | REQUEST DETAILS / JOB TYPE */}
            <div className="mb-4">
              <div className="bg-slate-900 text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                03 | REQUEST DETAILS / JOB TYPE / รายละเอียดคำขอ / ประเภทงาน
              </div>
              <div className="border border-t-0 border-slate-300 p-3 text-xs space-y-2">
                <div className="text-[10px] font-semibold text-slate-700 uppercase">JOB TYPE / ประเภทงาน</div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  <label className="flex items-center font-medium">{renderCheck(request.jobTypes.onSite)} On Site</label>
                  <label className="flex items-center font-medium">{renderCheck(request.jobTypes.meeting)} Meeting</label>
                  <label className="flex items-center font-medium">{renderCheck(request.jobTypes.service)} Service</label>
                  <label className="flex items-center font-medium">{renderCheck(request.jobTypes.mockUp)} Mock-Up</label>
                  <label className="flex items-center font-medium">{renderCheck(request.jobTypes.siteSurvey)} Site Survey</label>
                  <label className="flex items-center font-medium">{renderCheck(request.jobTypes.installation)} Installation</label>
                  <label className="flex items-center font-medium">{renderCheck(request.jobTypes.countDrawing)} นับแบบ</label>
                  <label className="flex items-center font-medium">{renderCheck(request.jobTypes.claim)} Claim</label>
                  <label className="flex items-center font-medium">{renderCheck(request.jobTypes.qc)} QC</label>
                  <label className="flex items-center font-medium">{renderCheck(request.jobTypes.present)} Present</label>
                  <label className="flex items-center">{renderCheck(request.jobTypes.other)} Other: {request.jobTypes.otherText || '__________'}</label>
                </div>
                <div className="pt-2">
                  <div className="text-[10px] font-semibold text-slate-700 uppercase mb-1">DETAILS / รายละเอียดคำขอ</div>
                  <div className="min-h-[50px] p-2 bg-slate-50 border border-slate-200 rounded leading-relaxed text-slate-800">
                    {request.requestDetails || '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* 04 | WORK PERFORMED / บันทึกการปฏิบัติงาน */}
            <div className="mb-2">
              <div className="bg-slate-900 text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider flex justify-between items-center">
                <span>04 | WORK PERFORMED / บันทึกการปฏิบัติงาน</span>
                <span className="font-mono text-[10px] bg-white text-slate-950 px-2 py-0.2 rounded font-bold">
                  STATUS: {request.status || 'Open'}
                </span>
              </div>
              <div className="border border-t-0 border-slate-300 p-3 text-xs space-y-2">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                  <span className="font-semibold text-slate-800">CURRENT STATUS / สถานะงานปัจจุบัน:</span>
                  <span className="font-bold text-slate-900 font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-300">
                    {request.status}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">REPORTED PROBLEM / ปัญหาที่ได้รับแจ้ง:</span>
                  <div className="text-slate-800 mt-0.5 border-b border-dotted border-slate-400 pb-1">{request.reportedProblem || '-'}</div>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">FINDINGS / ปัญหาที่พบ:</span>
                  <div className="text-slate-800 mt-0.5 border-b border-dotted border-slate-400 pb-1">{request.findings || '-'}</div>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">CORRECTIVE ACTION / วิธีการแก้ไข:</span>
                  <div className="text-slate-800 mt-0.5 border-b border-dotted border-slate-400 pb-1">{request.correctiveAction || '-'}</div>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">WORK DETAILS / รายละเอียดการดำเนินการ:</span>
                  <div className="text-slate-800 mt-0.5 border-b border-dotted border-slate-400 pb-1 whitespace-pre-line">{request.workDetails || '-'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Page 1 Footer */}
          <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-200 flex justify-between font-mono-data">
            <span>LUMENCRAFT | CONTROLLED SERVICE DOCUMENT</span>
            <span>Document No.: {request.documentNo}</span>
            <span>Rev.: {request.revision || '0'} • Page 1 of 3</span>
          </div>
        </div>

        {/* ================= PAGE 2 ================= */}
        <div className="bg-white p-8 border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0 page-break min-h-[1080px] flex flex-col justify-between">
          <div>
            {/* Page 2 Header Bar */}
            <div className="flex justify-between items-center text-xs pb-2 mb-4 border-b border-slate-300 font-mono-data">
              <span className="font-bold text-slate-900 font-heading">LUMENCRAFT | CONTROLLED SERVICE DOCUMENT</span>
              <span>Document No.: <strong className="underline">{request.documentNo}</strong></span>
              <span>Rev.: <strong>{request.revision || '0'}</strong> • 2</span>
            </div>

            {/* 05 | PHOTO / EVIDENCE REFERENCE */}
            <div className="mb-4">
              <div className="bg-slate-900 text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                05 | PHOTO / EVIDENCE REFERENCE / รูปถ่าย / หลักฐานอ้างอิง
              </div>
              <div className="border border-t-0 border-slate-300 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-300 font-semibold">
                    <tr>
                      <th className="py-1.5 px-3 w-16 text-center">Photo / Evidence No.</th>
                      <th className="py-1.5 px-3">Description / What the photo proves</th>
                      <th className="py-1.5 px-3 w-48">File / Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {[1, 2, 3, 4, 5].map((rowNum) => {
                      const photo = request.photos.find(p => p.no === rowNum);
                      return (
                        <tr key={rowNum} className="min-h-7">
                          <td className="py-1 px-3 text-center font-mono-data text-slate-600">{rowNum}</td>
                          <td className="py-1 px-3 text-slate-800">
                            <div className="flex items-center gap-2">
                              {photo?.imageUrl && (
                                <img 
                                  src={photo.imageUrl} 
                                  alt="Thumb" 
                                  className="w-8 h-8 object-cover rounded border border-slate-300 shrink-0" 
                                />
                              )}
                              <span>{photo?.description || '________________________________________________________________'}</span>
                            </div>
                          </td>
                          <td className="py-1 px-3 font-mono-data text-slate-700">{photo?.fileRef || '________________'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 06 | PARTS / MATERIAL USED */}
            <div className="mb-4">
              <div className="bg-slate-900 text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                06 | PARTS / MATERIAL USED / อะไหล่ / วัสดุที่ใช้
              </div>
              <div className="border border-t-0 border-slate-300 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-300 font-semibold">
                    <tr>
                      <th className="py-1.5 px-3 w-12 text-center">No.</th>
                      <th className="py-1.5 px-3">Part / Material Name</th>
                      <th className="py-1.5 px-3 w-24 text-center">Qty</th>
                      <th className="py-1.5 px-3 w-56">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {[1, 2, 3, 4, 5].map((rowNum) => {
                      const part = request.parts.find(p => p.no === rowNum);
                      return (
                        <tr key={rowNum} className="h-7">
                          <td className="py-1 px-3 text-center font-mono-data text-slate-600">{rowNum}</td>
                          <td className="py-1 px-3 text-slate-800">{part?.name || '____________________________________________'}</td>
                          <td className="py-1 px-3 text-center font-mono-data text-slate-800">{part?.qty || '________'}</td>
                          <td className="py-1 px-3 text-slate-700">{part?.remark || '____________________________'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 07 | MEASUREMENT / TEST RESULT */}
            <div className="mb-4">
              <div className="bg-slate-900 text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                07 | MEASUREMENT / TEST RESULT / ผลการวัด / ทดสอบ
              </div>
              <div className="border border-t-0 border-slate-300 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-300 font-semibold">
                    <tr>
                      <th className="py-1.5 px-3">Item</th>
                      <th className="py-1.5 px-3 w-24 text-center">Before</th>
                      <th className="py-1.5 px-3 w-24 text-center">After</th>
                      <th className="py-1.5 px-3 w-20 text-center">Unit</th>
                      <th className="py-1.5 px-3 w-56">Remark / Test Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {[0, 1, 2, 3, 4].map((idx) => {
                      const m = request.measurements[idx];
                      return (
                        <tr key={idx} className="h-7">
                          <td className="py-1 px-3 text-slate-800">{m?.item || '________________'}</td>
                          <td className="py-1 px-3 text-center font-mono-data text-slate-800">{m?.before || '____________'}</td>
                          <td className="py-1 px-3 text-center font-mono-data font-semibold text-emerald-800">{m?.after || '____________'}</td>
                          <td className="py-1 px-3 text-center font-mono-data text-slate-600">{m?.unit || '______'}</td>
                          <td className="py-1 px-3 text-slate-700">{m?.remark || '________________________________'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="p-2 text-[10px] text-slate-500 italic bg-slate-50 border-t border-slate-200">
                  * กรอกค่า Before และ After พร้อมหน่วย เพื่อให้เห็นผลการตรวจ / แก้ไขอย่างชัดเจน
                </div>
              </div>
            </div>

            {/* 08 | SERVICE RESULT */}
            <div className="mb-4">
              <div className="bg-slate-900 text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                08 | SERVICE RESULT / ผลการให้บริการ
              </div>
              <div className="border border-t-0 border-slate-300 p-3 text-xs grid grid-cols-12 gap-4">
                <div className="col-span-4 border-r border-slate-200 pr-3">
                  <div className="text-[10px] font-semibold text-slate-700 uppercase mb-1.5">RESULT / ผลลัพธ์</div>
                  <div className="space-y-1">
                    <label className="flex items-center font-medium text-emerald-800">
                      {renderCheck(request.serviceResult === 'Completed')} Completed
                    </label>
                    <label className="flex items-center font-medium text-amber-800">
                      {renderCheck(request.serviceResult === 'Improved')} Improved
                    </label>
                    <label className="flex items-center font-medium text-rose-800">
                      {renderCheck(request.serviceResult === 'Not Completed')} Not Completed
                    </label>
                  </div>
                </div>
                <div className="col-span-8">
                  <div className="text-[10px] font-semibold text-slate-700 uppercase mb-1">RECOMMENDATION / NEXT ACTION (คำแนะนำ / การดำเนินการถัดไป)</div>
                  <div className="min-h-[40px] text-slate-800 border-b border-dotted border-slate-400 pb-1">
                    {request.recommendationNextAction || '____________________________________________________________________________________'}
                  </div>
                </div>
              </div>
            </div>

            {/* 09 | FOLLOW-UP / NEXT SERVICE */}
            <div className="mb-4">
              <div className="bg-slate-900 text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                09 | FOLLOW-UP / NEXT SERVICE / การติดตาม / บริการครั้งถัดไป
              </div>
              <div className="border border-t-0 border-slate-300 p-3 text-xs space-y-2">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-4">
                    <div className="text-[10px] text-slate-600 font-medium">NEXT SERVICE DUE (วันที่นัดหมาย / วันที่ต้องติดตาม)</div>
                    <div className="font-mono-data font-semibold text-slate-900 border-b border-dotted border-slate-400 pb-0.5 mt-0.5">
                      {request.nextServiceDue || '____________________________'}
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="text-[10px] text-slate-600 font-medium">OWNER (ผู้รับผิดชอบงานต่อ)</div>
                    <div className="font-semibold text-slate-900 border-b border-dotted border-slate-400 pb-0.5 mt-0.5">
                      {request.followUpOwner || '____________________________'}
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="text-[10px] text-slate-600 font-medium">REMARK (หมายเหตุสำคัญ)</div>
                    <div className="text-slate-900 border-b border-dotted border-slate-400 pb-0.5 mt-0.5">
                      {request.followUpRemark || '____________________________'}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-600 font-medium">FOLLOW-UP DETAILS (งานที่ต้องทำต่อ / เงื่อนไขก่อนปิดงาน)</div>
                  <div className="text-slate-900 border-b border-dotted border-slate-400 pb-0.5 mt-0.5">
                    {request.followUpDetails || '________________________________________________________________________________________'}
                  </div>
                </div>
              </div>
            </div>

            {/* 10 | SIGN OFF / ACCEPTANCE (Summary Row on Page 2) */}
            <div>
              <div className="bg-slate-900 text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                10 | SIGN OFF / ACCEPTANCE / การรับรอง / การอนุมัติ
              </div>
              <div className="border border-t-0 border-slate-300 p-3 text-xs grid grid-cols-4 gap-3 text-center font-medium">
                <div>
                  <div className="text-[10px] text-slate-600 uppercase mb-1">ENGINEER / STAFF</div>
                  <div className="font-semibold text-slate-900 truncate">Name: {request.signOff.engineer.name || '______________________'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-600 uppercase mb-1">SUPERVISOR / PM</div>
                  <div className="font-semibold text-slate-900 truncate">Name: {request.signOff.supervisor.name || '______________________'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-600 uppercase mb-1">SALES / REQUESTER</div>
                  <div className="font-semibold text-slate-900 truncate">Name: {request.signOff.sales.name || '______________________'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-600 uppercase mb-1">CUSTOMER</div>
                  <div className="font-semibold text-slate-900 truncate">Name: {request.signOff.customer.name || '______________________'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Page 2 Footer */}
          <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-200 flex justify-between font-mono-data">
            <span>LUMENCRAFT | CONTROLLED SERVICE DOCUMENT</span>
            <span>Document No.: {request.documentNo}</span>
            <span>Rev.: {request.revision || '0'} • Page 2 of 3</span>
          </div>
        </div>

        {/* ================= PAGE 3 ================= */}
        <div className="bg-white p-8 border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0 min-h-[1080px] flex flex-col justify-between">
          <div>
            {/* Page 3 Header Bar */}
            <div className="flex justify-between items-center text-xs pb-2 mb-6 border-b border-slate-300 font-mono-data">
              <span className="font-bold text-slate-900 font-heading">LUMENCRAFT | CONTROLLED SERVICE DOCUMENT</span>
              <span>Document No.: <strong className="underline">{request.documentNo}</strong></span>
              <span>Rev.: <strong>{request.revision || '0'}</strong> • 3</span>
            </div>

            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-6 pb-2 border-b border-slate-200">
              SIGNATURE AUTHORIZATION & APPROVAL VERIFICATION
            </h3>

            {/* 4 Large Signature Authorization Boxes */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              
              {/* Engineer / Staff */}
              <div className="border border-slate-300 rounded-lg p-5 bg-slate-50 flex flex-col justify-between h-64">
                <div>
                  <div className="text-xs font-bold text-slate-900 uppercase">ENGINEER / STAFF (วิศวกรผู้รับผิดชอบงาน)</div>
                  <div className="text-xs text-slate-600 mt-1">Name: <strong className="text-slate-900">{request.signOff.engineer.name || '........................................'}</strong></div>
                </div>
                <div className="my-auto flex flex-col items-center justify-center min-h-[90px] border-b border-dashed border-slate-400 pb-2">
                  {request.signOff.engineer.signatureData ? (
                    <img src={request.signOff.engineer.signatureData} alt="Engineer Signature" className="max-h-20 object-contain" />
                  ) : (
                    <div className="text-xs text-slate-400 italic">Signature: ______________________________</div>
                  )}
                </div>
                <div className="flex justify-between text-xs font-mono-data pt-2">
                  <span className="text-slate-600">Date:</span>
                  <span className="font-semibold text-slate-900">{request.signOff.engineer.signDate || '........................'}</span>
                </div>
              </div>

              {/* Supervisor / PM */}
              <div className="border border-slate-300 rounded-lg p-5 bg-slate-50 flex flex-col justify-between h-64">
                <div>
                  <div className="text-xs font-bold text-slate-900 uppercase">SUPERVISOR / PM (หัวหน้างาน / ผู้จัดการโครงการ)</div>
                  <div className="text-xs text-slate-600 mt-1">Name: <strong className="text-slate-900">{request.signOff.supervisor.name || '........................................'}</strong></div>
                </div>
                <div className="my-auto flex flex-col items-center justify-center min-h-[90px] border-b border-dashed border-slate-400 pb-2">
                  {request.signOff.supervisor.signatureData ? (
                    <img src={request.signOff.supervisor.signatureData} alt="Supervisor Signature" className="max-h-20 object-contain" />
                  ) : (
                    <div className="text-xs text-slate-400 italic">Signature: ______________________________</div>
                  )}
                </div>
                <div className="flex justify-between text-xs font-mono-data pt-2">
                  <span className="text-slate-600">Date:</span>
                  <span className="font-semibold text-slate-900">{request.signOff.supervisor.signDate || '........................'}</span>
                </div>
              </div>

              {/* Sales / Requester */}
              <div className="border border-slate-300 rounded-lg p-5 bg-slate-50 flex flex-col justify-between h-64">
                <div>
                  <div className="text-xs font-bold text-slate-900 uppercase">SALES / REQUESTER (ฝ่ายขาย / ผู้แจ้งขอรับบริการ)</div>
                  <div className="text-xs text-slate-600 mt-1">Name: <strong className="text-slate-900">{request.signOff.sales.name || '........................................'}</strong></div>
                </div>
                <div className="my-auto flex flex-col items-center justify-center min-h-[90px] border-b border-dashed border-slate-400 pb-2">
                  {request.signOff.sales.signatureData ? (
                    <img src={request.signOff.sales.signatureData} alt="Sales Signature" className="max-h-20 object-contain" />
                  ) : (
                    <div className="text-xs text-slate-400 italic">Signature: ______________________________</div>
                  )}
                </div>
                <div className="flex justify-between text-xs font-mono-data pt-2">
                  <span className="text-slate-600">Date:</span>
                  <span className="font-semibold text-slate-900">{request.signOff.sales.signDate || '........................'}</span>
                </div>
              </div>

              {/* Customer */}
              <div className="border border-slate-300 rounded-lg p-5 bg-slate-50 flex flex-col justify-between h-64">
                <div>
                  <div className="text-xs font-bold text-slate-900 uppercase">CUSTOMER (ลูกค้าผู้รับบริการ / ตรวจรับงาน)</div>
                  <div className="text-xs text-slate-600 mt-1">Name: <strong className="text-slate-900">{request.signOff.customer.name || '........................................'}</strong></div>
                </div>
                <div className="my-auto flex flex-col items-center justify-center min-h-[90px] border-b border-dashed border-slate-400 pb-2">
                  {request.signOff.customer.signatureData ? (
                    <img src={request.signOff.customer.signatureData} alt="Customer Signature" className="max-h-20 object-contain" />
                  ) : (
                    <div className="text-xs text-slate-400 italic">Signature: ______________________________</div>
                  )}
                </div>
                <div className="flex justify-between text-xs font-mono-data pt-2">
                  <span className="text-slate-600">Date:</span>
                  <span className="font-semibold text-slate-900">{request.signOff.customer.signDate || '........................'}</span>
                </div>
              </div>

            </div>

            {/* Note & Policy */}
            <div className="p-4 bg-slate-100 rounded border border-slate-300 text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800">เงื่อนไขการรับรองเอกสาร Lumencraft:</div>
              <div>1. เอกสารนี้ถือเป็นหลักฐานการให้บริการและการควบคุมคุณภาพงานวิศวกรรมแสงสว่างอย่างเป็นทางการ</div>
              <div>2. กรณีมีข้อแก้ไขเพิ่มเติมภายหลังการลงนาม ต้องจัดทำ Revision ใหม่และให้ผู้มีอำนาจลงนามกำกับทุกครั้ง</div>
              <div>3. ติดต่อฝ่ายเทคนิคและบริการ Lumencraft โทร. 02-XXX-XXXX หรืออีเมล service@lumencraft.co.th</div>
            </div>
          </div>

          {/* Page 3 Footer */}
          <div className="text-center text-[10px] text-slate-500 pt-4 border-t border-slate-200 flex justify-between font-mono-data">
            <span>LUMENCRAFT | CONTROLLED SERVICE DOCUMENT</span>
            <span>Document No.: {request.documentNo}</span>
            <span>Rev.: {request.revision || '0'} • Page 3 of 3</span>
          </div>
        </div>

      </div>
    </div>
  );
};
