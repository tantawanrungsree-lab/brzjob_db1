import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '../../types';
import { 
  X, Save, Building2, Plus, Trash2, Sparkles, RefreshCw, 
  User, Phone, Mail, MapPin, Calendar, FileText, CheckCircle2
} from 'lucide-react';

interface ProjectModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  onDelete?: (id: string) => void;
  initialData?: Project | null;
}

export const ProjectModalForm: React.FC<ProjectModalFormProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData
}) => {
  const generateRandomSONumber = () => {
    return `SO-${String(Math.floor(Math.random() * 900000) + 100000)}`;
  };

  const getEmptyProject = (): Project => ({
    id: `prj-${Date.now()}`,
    projectCode: `LC-PRJ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
    soNumber: generateRandomSONumber(),
    projectName: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    engineerName: '',
    salesName: '',
    status: 'In Progress',
    location: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [formData, setFormData] = useState<Project>(getEmptyProject);
  const [soList, setSoList] = useState<string[]>([generateRandomSONumber()]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.soNumber) {
        const split = initialData.soNumber.split(',').map(s => s.trim()).filter(Boolean);
        setSoList(split.length > 0 ? split : [generateRandomSONumber()]);
      } else {
        setSoList([generateRandomSONumber()]);
      }
    } else {
      const empty = getEmptyProject();
      setFormData(empty);
      setSoList([empty.soNumber]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // SO Number list handlers
  const handleAddSO = () => {
    const newSO = generateRandomSONumber();
    const updated = [...soList, newSO];
    setSoList(updated);
    setFormData(prev => ({
      ...prev,
      soNumber: updated.join(', ')
    }));
  };

  const handleUpdateSO = (index: number, val: string) => {
    const updated = [...soList];
    updated[index] = val;
    setSoList(updated);
    setFormData(prev => ({
      ...prev,
      soNumber: updated.filter(Boolean).join(', ')
    }));
  };

  const handleRemoveSO = (index: number) => {
    if (soList.length <= 1) {
      setSoList(['']);
      setFormData(prev => ({ ...prev, soNumber: '' }));
      return;
    }
    const updated = soList.filter((_, i) => i !== index);
    setSoList(updated);
    setFormData(prev => ({
      ...prev,
      soNumber: updated.filter(Boolean).join(', ')
    }));
  };

  const handleRegenerateSO = (index: number) => {
    const newSO = generateRandomSONumber();
    handleUpdateSO(index, newSO);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSONumber = soList.filter(Boolean).join(', ') || formData.soNumber;
    onSave({
      ...formData,
      soNumber: finalSONumber,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex flex-col overflow-hidden font-sans">
      <div className="bg-white w-full h-full flex flex-col overflow-hidden">
        
        {/* Full-Screen Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-blue-600/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-500/20 text-blue-300 font-mono font-bold px-2.5 py-0.5 rounded border border-blue-400/30">
                  {formData.projectCode || 'NEW PROJECT'}
                </span>
                <span className="text-[11px] bg-amber-400/20 text-amber-300 px-2 py-0.2 rounded font-mono font-bold">
                  BRZ PROJECT
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-heading text-white mt-1">
                {initialData ? `แก้ไขข้อมูลโครงการ: ${formData.projectName || formData.projectCode}` : 'เพิ่มโครงการใหม่ (New BRZ Project)'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {initialData && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`ยืนยันการลบโครงการ ${formData.projectName || formData.projectCode} ออกจากระบบและ Firebase หรือไม่?`)) {
                    onDelete(formData.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2 text-xs font-bold text-rose-400 hover:text-white bg-rose-950/60 hover:bg-rose-600 rounded-xl transition-colors border border-rose-800 flex items-center gap-1.5"
                title="ลบโครงการนี้ออกจากระบบและ Firebase"
              >
                <Trash2 className="w-4 h-4" />
                <span>ลบโครงการนี้</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              ยกเลิก (Cancel)
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกโครงการ</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Full-Screen Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50/50">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Section 1: Project Identity & SO Numbers */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 font-heading">
                  1. ข้อมูลรหัสโครงการและเลขที่คำสั่งซื้อ (Project Identity & Sales Orders)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">Project Code (รหัสโครงการ) *</label>
                  <input
                    type="text"
                    required
                    value={formData.projectCode}
                    onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                    placeholder="e.g. LC-PRJ-2026-089"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                  />
                </div>

                {/* Multiple SO Numbers Input Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-slate-800">
                      SO Number (เลขที่คำสั่งขาย Sales Order) *
                    </label>
                    <button
                      type="button"
                      onClick={handleAddSO}
                      className="text-[11px] font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ เพิ่มเลข SO</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto p-1 bg-slate-50/70 rounded-xl border border-slate-200">
                    {soList.map((so, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400 w-5 text-right font-bold">#{idx + 1}</span>
                        <input
                          type="text"
                          required={idx === 0}
                          value={so}
                          onChange={(e) => handleUpdateSO(idx, e.target.value)}
                          placeholder={`e.g. SO-${690240 + idx + 1}`}
                          className="flex-1 px-3 py-2 border border-slate-300 bg-white rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRegenerateSO(idx)}
                          title="สุ่มสร้างเลข SO ใหม่"
                          className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shrink-0"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        {soList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSO(idx)}
                            title="ลบเลข SO นี้"
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 bg-white border border-rose-200 rounded-lg transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    * โครงการสามารถผูกได้หลายเลขที่ SO โดยกดปุ่ม <span className="font-bold text-amber-700">+ เพิ่มเลข SO</span>
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-800 mb-1.5">Project Name (ชื่อโครงการ) *</label>
                  <input
                    type="text"
                    required
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder="e.g. The Forestias - Forest Pavilion & Residential Villas"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Customer Details & Location */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900 font-heading">
                  2. ข้อมูลลูกค้าและสถานที่หน้างาน (Customer & Site Details)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">Customer Name (ชื่อลูกค้า / บริษัท) *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. MQDC Corporation Co., Ltd."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">Customer E-mail (อีเมลติดต่อ) *</label>
                  <input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="e.g. procurement@mqdc.com"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">Phone (เบอร์ติดต่อลูกค้า) *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="e.g. 081-456-7890"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block font-semibold text-slate-800 mb-1.5">Location / Site (สถานที่ติดตั้ง / หน้างานโครงการ)</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. ถนนบางนา-ตราด กม. 7 ตำบลบางแก้ว อำเภอบางพลี สมุทรปราการ 10540"
                      className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Team In-Charge, Dates & Status */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 font-heading">
                  3. ทีมงานผู้รับผิดชอบ, กำหนดเวลา และสถานะโครงการ (Operations & Schedule)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">Lead Engineer (วิศวกรผู้รับผิดชอบ) *</label>
                  <input
                    type="text"
                    required
                    value={formData.engineerName}
                    onChange={(e) => setFormData({ ...formData, engineerName: e.target.value })}
                    placeholder="ระบุชื่อวิศวกรผู้รับผิดชอบงาน"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">Sales In-Charge (เซลล์เจ้าของงาน) *</label>
                  <input
                    type="text"
                    required
                    value={formData.salesName}
                    onChange={(e) => setFormData({ ...formData, salesName: e.target.value })}
                    placeholder="ระบุชื่อเซลล์ผู้รับผิดชอบงาน"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">Status (สถานะโครงการ) *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="On Track">🟢 ตามแผน (On Track)</option>
                    <option value="In Progress">🔵 กำลังดำเนินงาน (In Progress)</option>
                    <option value="At Risk">🟡 เสี่ยงล่าช้า (At Risk)</option>
                    <option value="Overdue">🔴 เกินกำหนด (Overdue)</option>
                    <option value="On Hold">⚪ หยุดโครงการชั่วคราว (On Hold)</option>
                    <option value="Completed">🟣 เสร็จสมบูรณ์ (Completed)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">Start Date (วันที่เริ่มโครงการ)</label>
                  <input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">Target Completion Date (กำหนดส่งมอบงาน)</label>
                  <input
                    type="date"
                    value={formData.targetDate || ''}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block font-semibold text-slate-800 mb-1.5">Scope of Work & Notes (ขอบเขตงาน รายละเอียดโคมไฟ หรือข้อกำหนดพิเศษ)</label>
                  <textarea
                    rows={4}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="ระบุประเภทโคมไฟ ระบบควบคุมแสงสว่าง DALI / 0-10V, ขอบเขตงานติดตั้ง หรือข้อกำหนดพิเศษของโครงการ..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

          </div>
        </form>

        {/* Full-Screen Footer */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 hidden sm:block">
            Lumencraft BRZ Project Registration Form • บันทึกเข้าฐานข้อมูลโครงการแบบ Real-Time
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก (Cancel)
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกโครงการ (Save Project)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
