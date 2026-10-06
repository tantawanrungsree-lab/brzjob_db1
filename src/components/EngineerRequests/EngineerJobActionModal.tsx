import React, { useState } from 'react';
import { EngineerRequest } from '../../types';
import { 
  X, CheckCircle, XCircle, Calendar, User, 
  Clock, AlertTriangle, FileText, Check, ArrowRight
} from 'lucide-react';

interface EngineerJobActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: EngineerRequest | null;
  onSave: (updatedRequest: EngineerRequest) => void;
  availableEngineers?: string[];
}

export const EngineerJobActionModal: React.FC<EngineerJobActionModalProps> = ({
  isOpen,
  onClose,
  request,
  onSave,
  availableEngineers = [
    'ธนากร ศรีสวัสดิ์ (Eng. Ton)',
    'พีรพล เกรียงไกร (Eng. Paul)',
    'ณัฐวุฒิ สิทธิชัย (Eng. Nat)',
    'เอกชัย แสงทอง (Eng. Ek)',
    'วิศวกรประจำทีม Lumencraft'
  ]
}) => {
  if (!isOpen || !request) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedEngineer, setSelectedEngineer] = useState(request.engineerStaff || availableEngineers[0] || '');
  const [onSiteDate, setOnSiteDate] = useState(request.onSiteDate || todayStr);
  const [deliveryDate, setDeliveryDate] = useState(request.deliveryDate || request.dueDate || todayStr);
  const [rejectionReason, setRejectionReason] = useState(request.rejectionReason || '');
  const [isRejecting, setIsRejecting] = useState(false);

  // Handle Accept Job
  const handleAcceptJob = () => {
    const updated: EngineerRequest = {
      ...request,
      engineerStaff: selectedEngineer,
      onSiteDate: onSiteDate,
      deliveryDate: deliveryDate,
      dueDate: deliveryDate,
      status: 'In Progress',
      acceptedAt: new Date().toISOString(),
      rejectionReason: '', // Clear rejection if re-accepted
      updatedAt: new Date().toISOString()
    };
    onSave(updated);
    onClose();
  };

  // Handle Reject Job
  const handleRejectJob = () => {
    if (!rejectionReason.trim()) {
      alert('กรุณาระบุเหตุผลในการ Reject งาน (ปฏิเสธงาน)');
      return;
    }

    const updated: EngineerRequest = {
      ...request,
      engineerStaff: selectedEngineer,
      status: 'Rejected',
      rejectionReason: rejectionReason.trim(),
      rejectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border-2 border-slate-300 overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-heading">
                  ระบบกดรับงาน & มอบหมายงาน Engineer
                </h3>
                <span className="text-xs bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-mono border border-amber-500/30">
                  {request.documentNo}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Engineer Job Acceptance & Schedule Dispatch Modal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-slate-800">
          
          {/* Job Info Summary Box */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{request.projectName}</span>
              <span className={`px-2 py-0.5 rounded font-bold font-mono text-[10px] ${
                request.status === 'Completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : request.status === 'In Progress'
                  ? 'bg-blue-100 text-blue-800'
                  : request.status === 'Rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                สถานะ: {request.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div><strong>ลูกค้า:</strong> {request.customer || '-'}</div>
              <div><strong>ฝ่ายขาย (Sale):</strong> {request.salesInCharge || '-'}</div>
              <div><strong>รหัสโครงการ:</strong> {request.projectCode || '-'}</div>
              <div><strong>SO Number:</strong> {request.soNumber || '-'}</div>
              <div className="col-span-2"><strong>สถานที่หน้างาน:</strong> {request.location || '-'}</div>
            </div>
          </div>

          {/* Form Fields: Engineer, On-site Date, Delivery Date */}
          <div className="space-y-4">
            
            {/* 1. เลือก Engineer ผู้รับผิดชอบ */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-600" />
                <span>1. เลือก Engineer ผู้รับผิดชอบงาน *</span>
              </label>
              <select
                value={selectedEngineer}
                onChange={(e) => setSelectedEngineer(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl font-medium text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-xs"
              >
                {availableEngineers.map((eng) => (
                  <option key={eng} value={eng}>{eng}</option>
                ))}
              </select>
            </div>

            {/* Dates Grid: วันเข้าหน้างาน & วันส่งงาน */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* 2. เลือกวันเข้าหน้างาน */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>2. เลือกวันเข้าหน้างาน (On-Site Date)</span>
                </label>
                <input
                  type="date"
                  value={onSiteDate}
                  onChange={(e) => setOnSiteDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl font-mono text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                />
              </div>

              {/* 3. เลือกวันส่งงาน */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>3. เลือกวันส่งงาน (Delivery Due Date) *</span>
                </label>
                <input
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl font-mono text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
                />
              </div>

            </div>

            {/* Rejection Section (Expandable or always visible if rejecting) */}
            {isRejecting && (
              <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-2xl space-y-2 animate-fadeIn">
                <label className="block text-xs font-bold text-red-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>ระบุเหตุผลการ Reject งาน (ปฏิเสธคำขอ) *</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="เช่น ติดงานหน้างานโครงการอื่น, เอกสารและแบบ BOQ ไม่ครบถ้วน, วิศวกรไม่ว่างในวันดังกล่าว ฯลฯ"
                  className="w-full p-2.5 bg-white border border-red-300 rounded-xl text-xs text-red-950 focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          
          {/* Reject Toggle / Cancel Reject */}
          {!isRejecting ? (
            <button
              type="button"
              onClick={() => setIsRejecting(true)}
              className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-900 font-bold text-xs rounded-xl border border-red-300 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <XCircle className="w-4 h-4 text-red-600" />
              <span>Reject งาน (ปฏิเสธงาน)</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRejectJob}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
              >
                <XCircle className="w-4 h-4" />
                <span>ยืนยัน Reject งานนี้</span>
              </button>
              <button
                type="button"
                onClick={() => setIsRejecting(false)}
                className="px-3 py-2 bg-white text-slate-700 font-medium text-xs rounded-xl border border-slate-300 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
            </div>
          )}

          {/* Accept Job Button */}
          {!isRejecting && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors"
              >
                ปิด
              </button>

              <button
                type="button"
                onClick={handleAcceptJob}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                <span>กดรับงาน (Accept Job)</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
