import React, { useState, useEffect, useRef } from 'react';
import { EngineerRequest, Project, JobTypeKey, JOB_TYPE_CONFIG } from '../../types';
import { 
  X, Save, Plus, Trash2, CheckCircle2, AlertCircle, 
  FileText, Camera, Wrench, Activity, UserCheck, Calendar,
  Building, ChevronRight, PenTool, Image as ImageIcon,
  Upload, UploadCloud, Link as LinkIcon, Eye, Download,
  Laptop, Smartphone, Paperclip, Sparkles, ExternalLink
} from 'lucide-react';
import { SignaturePad } from '../SignaturePad';

interface RequestModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (request: EngineerRequest) => void;
  onDelete?: (id: string) => void;
  initialData?: EngineerRequest | null;
  projects: Project[];
  preselectedProjectId?: string;
}

export const RequestModalForm: React.FC<RequestModalFormProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  projects,
  preselectedProjectId
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'work' | 'evidence' | 'parts_measure' | 'result_sign'>('general');
  const [signingRole, setSigningRole] = useState<'engineer' | 'supervisor' | 'sales' | 'customer' | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const getEmptyRequest = (): EngineerRequest => {
    const today = new Date().toISOString().split('T')[0];
    const defaultProj = preselectedProjectId ? projects.find(p => p.id === preselectedProjectId) : projects[0];

    return {
      id: `req-${Date.now()}`,
      documentNo: `LC-SR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      serviceNo: `SR-${String(Math.floor(Math.random() * 900) + 100)}`,
      dateRequest: today,
      revision: '0',
      requestCategory: 'customer',
      projectId: defaultProj?.id || '',
      projectCode: defaultProj?.projectCode || '',
      projectName: defaultProj?.projectName || '',
      soNumber: defaultProj?.soNumber || '',
      engNo: `ENG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90) + 10)}`,
      priority: 'Normal',
      customer: defaultProj?.customerName || '',
      customerEmail: defaultProj?.customerEmail || '',
      customerTel: defaultProj?.customerPhone || '',
      location: defaultProj?.location || '',
      salesInCharge: defaultProj?.salesName || '',
      requester: '',
      engineerStaff: defaultProj?.engineerName || '',
      dueDate: today,
      needReport: true,
      needInstallGuide: false,
      status: 'Open',
      supportingDocs: {
        docTypes: {
          specSheet: false,
          drawing: false,
          boq: false,
          productList: false,
          photo: false,
          quotationSo: false,
          warranty: false,
          other: false,
          otherText: ''
        },
        attachmentStatus: 'Pending',
        missingDetails: ''
      },
      jobTypes: {
        onSite: false,
        meeting: false,
        service: false,
        mockUp: false,
        siteSurvey: false,
        installation: false,
        countDrawing: false,
        claim: false,
        qc: false,
        present: false,
        other: false,
        otherText: ''
      },
      requestDetails: '',
      reportedProblem: '',
      findings: '',
      correctiveAction: '',
      workDetails: '',
      photos: [
        { id: `p-${Date.now()}-1`, no: 1, description: '', fileRef: '' },
        { id: `p-${Date.now()}-2`, no: 2, description: '', fileRef: '' }
      ],
      parts: [
        { id: `pt-${Date.now()}-1`, no: 1, name: '', qty: '', remark: '' }
      ],
      measurements: [
        { id: `m-${Date.now()}-1`, item: '', before: '', after: '', unit: '', remark: '' }
      ],
      serviceResult: '',
      recommendationNextAction: '',
      nextServiceDue: '',
      followUpOwner: '',
      followUpRemark: '',
      followUpDetails: '',
      signOff: {
        engineer: { name: defaultProj?.engineerName || '', signed: false, signDate: '' },
        supervisor: { name: 'หัวหน้างานวิศวกรรม', signed: false, signDate: '' },
        sales: { name: defaultProj?.salesName || '', signed: false, signDate: '' },
        customer: { name: defaultProj?.customerName || '', signed: false, signDate: '' }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const [formData, setFormData] = useState<EngineerRequest>(getEmptyRequest);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(getEmptyRequest());
    }
  }, [initialData, isOpen, preselectedProjectId]);

  if (!isOpen) return null;

  const handleProjectSelect = (projId: string) => {
    const proj = projects.find(p => p.id === projId);
    if (!proj) return;
    setFormData(prev => ({
      ...prev,
      projectId: proj.id,
      projectCode: proj.projectCode,
      projectName: proj.projectName,
      soNumber: proj.soNumber,
      customer: proj.customerName,
      customerEmail: proj.customerEmail,
      customerTel: proj.customerPhone,
      location: proj.location || prev.location,
      salesInCharge: proj.salesName,
      engineerStaff: proj.engineerName || prev.engineerStaff
    }));
  };

  const handleJobTypeToggle = (key: JobTypeKey) => {
    setFormData(prev => ({
      ...prev,
      jobTypes: {
        ...prev.jobTypes,
        [key]: !prev.jobTypes[key]
      }
    }));
  };

  const handleDocTypeToggle = (key: keyof typeof formData.supportingDocs.docTypes) => {
    if (key === 'otherText') return;
    setFormData(prev => ({
      ...prev,
      supportingDocs: {
        ...prev.supportingDocs,
        docTypes: {
          ...prev.supportingDocs.docTypes,
          [key]: !prev.supportingDocs.docTypes[key]
        }
      }
    }));
  };

  // Parts rows handler
  const handleAddPart = () => {
    setFormData(prev => ({
      ...prev,
      parts: [
        ...prev.parts,
        { id: `pt-${Date.now()}`, no: prev.parts.length + 1, name: '', qty: '', remark: '' }
      ]
    }));
  };

  const handleRemovePart = (id: string) => {
    setFormData(prev => ({
      ...prev,
      parts: prev.parts.filter(p => p.id !== id).map((p, idx) => ({ ...p, no: idx + 1 }))
    }));
  };

  const handleUpdatePart = (id: string, field: 'name' | 'qty' | 'remark', value: string) => {
    setFormData(prev => ({
      ...prev,
      parts: prev.parts.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  // Measurement rows handler
  const handleAddMeasurement = () => {
    setFormData(prev => ({
      ...prev,
      measurements: [
        ...prev.measurements,
        { id: `m-${Date.now()}`, item: '', before: '', after: '', unit: '', remark: '' }
      ]
    }));
  };

  const handleRemoveMeasurement = (id: string) => {
    setFormData(prev => ({
      ...prev,
      measurements: prev.measurements.filter(m => m.id !== id)
    }));
  };

  const handleUpdateMeasurement = (id: string, field: keyof typeof formData.measurements[0], value: string) => {
    setFormData(prev => ({
      ...prev,
      measurements: prev.measurements.map(m => m.id === id ? { ...m, [field]: value } : m)
    }));
  };

  // Photos handler
  const handleAddPhoto = (type: 'manual' | 'file' | 'link' = 'manual') => {
    setFormData(prev => ({
      ...prev,
      photos: [
        ...prev.photos,
        { id: `p-${Date.now()}`, no: prev.photos.length + 1, description: '', fileRef: '' }
      ]
    }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const dataUrl = loadEvent.target?.result as string;
        setFormData(prev => ({
          ...prev,
          photos: [
            ...prev.photos,
            {
              id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              no: prev.photos.length + 1,
              description: file.name.replace(/\.[^/.]+$/, ''),
              fileRef: file.name,
              imageUrl: dataUrl
            }
          ]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDropFiles = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handlePasteEvent = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (!blob) continue;
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const dataUrl = loadEvent.target?.result as string;
          setFormData(prev => ({
            ...prev,
            photos: [
              ...prev.photos,
              {
                id: `p-${Date.now()}`,
                no: prev.photos.length + 1,
                description: `ภาพแคปหน้าจอ / Clipboard (${new Date().toLocaleTimeString('th-TH')})`,
                fileRef: `clipboard_${Date.now()}.png`,
                imageUrl: dataUrl
              }
            ]
          }));
        };
        reader.readAsDataURL(blob);
      }
    }
  };

  const handleRemovePhoto = (id: string) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== id).map((p, idx) => ({ ...p, no: idx + 1 }))
    }));
  };

  const handleUpdatePhoto = (id: string, field: 'description' | 'fileRef' | 'imageUrl', value: string) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  // Signature save handler
  const handleSaveSignature = (dataUrl: string) => {
    if (!signingRole) return;
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      signOff: {
        ...prev.signOff,
        [signingRole]: {
          ...prev.signOff[signingRole],
          signed: true,
          signDate: today,
          signatureData: dataUrl
        }
      }
    }));
    setSigningRole(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex flex-col overflow-hidden">
      <div className="bg-white w-full h-full flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-heading">
                  {initialData ? 'แก้ไขเอกสารคำของานวิศวกรรม' : 'สร้างคำของานวิศวกรรมใหม่'}
                </h2>
                <span className="text-xs bg-slate-800 text-amber-400 px-2.5 py-0.5 rounded font-mono-data border border-amber-500/30">
                  {formData.documentNo}
                </span>
              </div>
              <p className="text-xs text-slate-400">LUMENCRAFT SERVICE REQUEST & JOB TRACKING</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {initialData && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`ยืนยันการลบใบคำขอ ${formData.documentNo} ออกจากระบบและ Firebase หรือไม่?`)) {
                    onDelete(formData.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 text-xs font-bold text-rose-400 hover:text-white bg-rose-950/60 hover:bg-rose-600 rounded-xl transition-colors border border-rose-800 flex items-center gap-1.5"
                title="ลบคำขอนี้ออกจากระบบและ Firebase"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">ลบคำขอนี้</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-100 border-b border-slate-200 overflow-x-auto text-xs font-medium shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'general' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4 text-blue-600" />
            <span>01-03 ข้อมูลโครงการ, ประเภทงาน & เอกสาร</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('work')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'work' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4 text-indigo-600" />
            <span>04 บันทึกการปฏิบัติงาน</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('evidence')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'evidence' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4 text-teal-600" />
            <span>05 รูปถ่าย & หลักฐาน</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('parts_measure')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'parts_measure' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-4 h-4 text-purple-600" />
            <span>06-07 อะไหล่ & ผลทดสอบ</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('result_sign')}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'result_sign' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>08-10 ผลลัพธ์ & ลายเซ็น</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6 text-slate-800 text-sm">
          
          {/* TAB 1: 01-03 GENERAL INFORMATION, SUPPORTING DOCUMENTS & JOB TYPES */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              
              {/* 01 | GENERAL INFORMATION */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-mono-data">01</span>
                    <span>GENERAL INFORMATION / ข้อมูลทั่วไป & ควบคุมโครงการ</span>
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">เลือกดึงข้อมูลจากโครงการ:</span>
                    <select
                      value={formData.projectId}
                      onChange={(e) => handleProjectSelect(e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium text-xs focus:ring-1 focus:ring-slate-900"
                    >
                      <option value="">-- เลือกโครงการเพื่อเติมข้อมูลอัตโนมัติ --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.projectCode} - {p.projectName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Request Category Selector (Internal vs Customer Request) */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    หมวดหมู่คำขอ (Request Scope / Category) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.requestCategory === 'customer' || !formData.requestCategory
                          ? 'bg-blue-50/70 border-blue-500 text-blue-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="requestCategory"
                        value="customer"
                        checked={formData.requestCategory === 'customer' || !formData.requestCategory}
                        onChange={() => setFormData({ ...formData, requestCategory: 'customer' })}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <span>🏢 Customer Request</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-200 text-blue-800 font-semibold">
                            คำขอจากลูกค้า
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          งานบริการลูกค้า, ติดตั้ง, Site Survey, Mock-Up, Claim, ซ่อมบำรุงหน้างาน
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.requestCategory === 'internal'
                          ? 'bg-amber-50/70 border-amber-500 text-amber-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="requestCategory"
                        value="internal"
                        checked={formData.requestCategory === 'internal'}
                        onChange={() => setFormData({ ...formData, requestCategory: 'internal' })}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <span>📋 Internal Request</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-800 font-semibold">
                            คำขอภายในบริษัท
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          งานคำนวณแบบ, นับแบบ Take-off, ทดสอบ QC ในแล็บ, ประชุมภายใน, นำเสนอเทคนิค
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Project Code (รหัสโครงการ) *</label>
                    <input
                      type="text"
                      required
                      value={formData.projectCode}
                      onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                      placeholder="e.g. LC-PRJ-2026-089"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-data focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Project Name (ชื่อโครงการ) *</label>
                    <input
                      type="text"
                      required
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      placeholder="e.g. The Forestias - Forest Pavilion"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Revision (ครั้งที่แก้ไข)</label>
                    <input
                      type="text"
                      value={formData.revision}
                      onChange={(e) => setFormData({ ...formData, revision: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-data focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-slate-600">SO Number (เลขที่ SO / Sales Order)</label>
                      {formData.projectId && (() => {
                        const proj = projects.find(p => p.id === formData.projectId);
                        const availableSOs = proj?.soNumber?.split(',').map(s => s.trim()).filter(Boolean) || [];
                        if (availableSOs.length > 1) {
                          return (
                            <select
                              onChange={(e) => setFormData({ ...formData, soNumber: e.target.value })}
                              value={formData.soNumber}
                              className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 rounded px-1.5 py-0.5 font-mono-data"
                            >
                              <option value="">เลือก SO ในโครงการ</option>
                              {availableSOs.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <input
                      type="text"
                      value={formData.soNumber}
                      onChange={(e) => setFormData({ ...formData, soNumber: e.target.value })}
                      placeholder="e.g. SO-690241"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-data focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Eng. No. (เลขที่ Engineer / งาน)</label>
                    <input
                      type="text"
                      value={formData.engNo}
                      onChange={(e) => setFormData({ ...formData, engNo: e.target.value })}
                      placeholder="e.g. ENG-2026-058"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-data focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Date Request (วันที่รับคำขอ) *</label>
                    <input
                      type="date"
                      required
                      value={formData.dateRequest}
                      onChange={(e) => setFormData({ ...formData, dateRequest: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-data focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Priority (ระดับความเร่งด่วน)</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900"
                    >
                      <option value="Normal">Normal (ปกติ)</option>
                      <option value="Urgent">Urgent (เร่งด่วน)</option>
                      <option value="Critical">Critical (วิกฤต/ฉุกเฉิน)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Customer (ชื่อลูกค้า / บริษัท) *</label>
                    <input
                      type="text"
                      required
                      value={formData.customer}
                      onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                      placeholder="e.g. MQDC Corporation"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Customer E-mail (อีเมล)</label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      placeholder="e.g. somchai@mqdc.co.th"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-data focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Location / Site (สถานที่ปฏิบัติงาน / หน้างาน)</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. บางนา-ตราด กม. 7"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Sales in Charge (เซลล์เจ้าของงาน)</label>
                    <input
                      type="text"
                      value={formData.salesInCharge}
                      onChange={(e) => setFormData({ ...formData, salesInCharge: e.target.value })}
                      placeholder="e.g. กัญญาภัทร (Sales Jane)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Requester (ผู้แจ้ง / ผู้ขอใช้บริการ)</label>
                    <input
                      type="text"
                      value={formData.requester}
                      onChange={(e) => setFormData({ ...formData, requester: e.target.value })}
                      placeholder="e.g. คุณสมชาย ธนาทรัพย์"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Engineer / Staff (ผู้รับผิดชอบงาน Service) *</label>
                    <input
                      type="text"
                      required
                      value={formData.engineerStaff}
                      onChange={(e) => setFormData({ ...formData, engineerStaff: e.target.value })}
                      placeholder="e.g. ธนากร ศรีสวัสดิ์ (Eng. Ton)"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Customer Tel. (เบอร์ติดต่อหน้างาน)</label>
                    <input
                      type="text"
                      value={formData.customerTel}
                      onChange={(e) => setFormData({ ...formData, customerTel: e.target.value })}
                      placeholder="e.g. 081-456-7890"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-data focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Due Date (วันที่ต้องการให้งานเสร็จ) *</label>
                    <input
                      type="date"
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono-data focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-700">ต้องการรายงาน (Report):</span>
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="radio"
                        name="needReport"
                        checked={formData.needReport === true}
                        onChange={() => setFormData({ ...formData, needReport: true })}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="radio"
                        name="needReport"
                        checked={formData.needReport === false}
                        onChange={() => setFormData({ ...formData, needReport: false })}
                      />
                      <span>No</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-700">คู่มือติดตั้ง (Installation Guide):</span>
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="radio"
                        name="needInstallGuide"
                        checked={formData.needInstallGuide === true}
                        onChange={() => setFormData({ ...formData, needInstallGuide: true })}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="radio"
                        name="needInstallGuide"
                        checked={formData.needInstallGuide === false}
                        onChange={() => setFormData({ ...formData, needInstallGuide: false })}
                      />
                      <span>No</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">สถานะงานปัจจุบัน (Status)</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900"
                    >
                      <option value="Open">Open (เปิดคำขอ)</option>
                      <option value="In Progress">In Progress (กำลังดำเนินการ)</option>
                      <option value="Completed">Completed (เสร็จสมบูรณ์)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 02 | SUPPORTING DOCUMENTS */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="border-b border-slate-200 pb-2">
                  <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-bold font-mono-data">02</span>
                    <span>SUPPORTING DOCUMENTS / เอกสารประกอบ</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">DOCUMENT TYPE / ประเภทเอกสาร</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { key: 'specSheet', label: 'Spec Sheet' },
                        { key: 'drawing', label: 'Drawing (แบบแปลน)' },
                        { key: 'boq', label: 'BOQ / ถอดแบบ' },
                        { key: 'productList', label: 'Product List' },
                        { key: 'photo', label: 'Photo (รูปภาพ)' },
                        { key: 'quotationSo', label: 'Quotation / SO' },
                        { key: 'warranty', label: 'Warranty (ใบรับประกัน)' },
                        { key: 'other', label: 'Other (อื่น ๆ)' }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!formData.supportingDocs.docTypes[item.key as keyof typeof formData.supportingDocs.docTypes]}
                            onChange={() => handleDocTypeToggle(item.key as any)}
                            className="rounded text-slate-900 focus:ring-slate-900"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                    {formData.supportingDocs.docTypes.other && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={formData.supportingDocs.docTypes.otherText}
                          onChange={(e) => setFormData({
                            ...formData,
                            supportingDocs: {
                              ...formData.supportingDocs,
                              docTypes: { ...formData.supportingDocs.docTypes, otherText: e.target.value }
                            }
                          })}
                          placeholder="ระบุเอกสารอื่น ๆ..."
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">ATTACHMENT STATUS / สถานะเอกสาร</label>
                      <select
                        value={formData.supportingDocs.attachmentStatus}
                        onChange={(e) => setFormData({
                          ...formData,
                          supportingDocs: { ...formData.supportingDocs, attachmentStatus: e.target.value as any }
                        })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                      >
                        <option value="">-- เลือกสถานะ --</option>
                        <option value="Attached">Attached / แนบแล้ว</option>
                        <option value="Pending">Pending / รอเอกสาร</option>
                        <option value="Complete">Complete / ครบ</option>
                        <option value="Incomplete">Incomplete / ไม่ครบ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Missing / เอกสารที่ขาด</label>
                      <input
                        type="text"
                        value={formData.supportingDocs.missingDetails}
                        onChange={(e) => setFormData({
                          ...formData,
                          supportingDocs: { ...formData.supportingDocs, missingDetails: e.target.value }
                        })}
                        placeholder="ระบุรายการเอกสารที่ยังขาด หรือพิมพ์ 'ไม่มี'..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 03 | JOB TYPE */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="border-b border-slate-200 pb-2">
                  <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-bold font-mono-data">03</span>
                    <span>REQUEST DETAILS / JOB TYPE / ประเภทงานที่ขอรับบริการ</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">เลือกประเภทงานทั้งหมดที่เกี่ยวข้องกับคำขอนี้ (สามารถเลือกได้มากกว่า 1 ประเภท)</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {(Object.keys(JOB_TYPE_CONFIG) as JobTypeKey[]).map((key) => {
                    const cfg = JOB_TYPE_CONFIG[key];
                    const isChecked = !!formData.jobTypes[key];
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => handleJobTypeToggle(key)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isChecked 
                            ? `${cfg.badgeClass} border-slate-400 font-semibold shadow-xs` 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-xs">{cfg.labelTh}</span>
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded border border-slate-300 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {formData.jobTypes.other && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">ระบุรายละเอียดประเภทงานอื่น ๆ (Other)</label>
                    <input
                      type="text"
                      value={formData.jobTypes.otherText}
                      onChange={(e) => setFormData({
                        ...formData,
                        jobTypes: { ...formData.jobTypes, otherText: e.target.value }
                      })}
                      placeholder="ระบุประเภทงานเพิ่มเติม..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">DETAILS / รายละเอียดคำขอ *</label>
                  <textarea
                    rows={4}
                    value={formData.requestDetails}
                    onChange={(e) => setFormData({ ...formData, requestDetails: e.target.value })}
                    placeholder="อธิบายรายละเอียดขอบเขตงาน จุดประสงค์การเข้าหน้างาน หรือข้อมูลเฉพาะที่ต้องเตรียม..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 leading-relaxed"
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: WORK PERFORMED */}
          {activeTab === 'work' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    04 | WORK PERFORMED / บันทึกการปฏิบัติงาน
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    บันทึกผลการเข้าตรวจสอบ วิธีการแก้ไข รายละเอียดการทำงาน และอัปเดตสถานะงาน
                  </p>
                </div>

                {/* Status Selector in Section 04 */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-xs">
                  <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                    สถานะงานปัจจุบัน (Status) *:
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      formData.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : formData.status === 'In Progress'
                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    <option value="Open">Open (เปิดคำขอ / รอดำเนินการ)</option>
                    <option value="In Progress">In Progress (กำลังดำเนินการ)</option>
                    <option value="Completed">Completed (เสร็จสมบูรณ์)</option>
                    <option value="On Hold">On Hold (หยุดชั่วคราว)</option>
                    <option value="Cancelled">Cancelled (ยกเลิก)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">REPORTED PROBLEM / ปัญหาที่ได้รับแจ้ง</label>
                <textarea
                  rows={2}
                  value={formData.reportedProblem}
                  onChange={(e) => setFormData({ ...formData, reportedProblem: e.target.value })}
                  placeholder="ระบุปัญหาที่ลูกค้าหรือฝ่ายขายแจ้งเข้ามา..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">FINDINGS / ปัญหาที่พบจริงจากการตรวจสอบ</label>
                <textarea
                  rows={2}
                  value={formData.findings}
                  onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                  placeholder="ระบุสาเหตุหรือข้อเท็จจริงที่พบหลังตรวจเช็คหน้างาน..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CORRECTIVE ACTION / วิธีการแก้ไข</label>
                <textarea
                  rows={2}
                  value={formData.correctiveAction}
                  onChange={(e) => setFormData({ ...formData, correctiveAction: e.target.value })}
                  placeholder="ระบุแนวทางและวิธีการแก้ไขปัญหาที่ดำเนินการ..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WORK DETAILS / รายละเอียดการดำเนินการ</label>
                <textarea
                  rows={4}
                  value={formData.workDetails}
                  onChange={(e) => setFormData({ ...formData, workDetails: e.target.value })}
                  placeholder="บันทึกขั้นตอนการทำงานทีละข้อ 1. ... 2. ... 3. ..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-slate-900 leading-relaxed font-mono-data"
                />
              </div>
            </div>
          )}

          {/* TAB 4: PHOTOS & EVIDENCE */}
          {activeTab === 'evidence' && (
            <div 
              onPaste={handlePasteEvent}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDropFiles}
              className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-5"
            >
              {/* Top Header & Multi-Source Upload Ribbon */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-blue-100 text-blue-800 rounded-lg">
                      <Camera className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">
                      05 | PHOTO / EVIDENCE REFERENCE / รูปถ่าย & หลักฐานอ้างอิง
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    อัปโหลดรูปถ่ายหน้างานจากคอมพิวเตอร์, ถ่ายภาพด้วยกล้องมือถือ/แท็บเล็ต, หรือวางลิงก์รูปภาพ
                  </p>
                </div>

                {/* Multi-Device Upload Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Hidden File Inputs */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileUpload(e.target.files)}
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={(e) => handleFileUpload(e.target.files)}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />

                  {/* 1. Upload from Computer */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs"
                    title="เลือกไฟล์รูปภาพจากเครื่องคอมพิวเตอร์"
                  >
                    <Laptop className="w-3.5 h-3.5 text-amber-400" />
                    <span>อัปโหลดจากคอมพิวเตอร์</span>
                  </button>

                  {/* 2. Take Photo / Camera (Mobile/Tablet) */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-xs"
                    title="ถ่ายภาพหน้างานทันทีผ่านกล้องมือถือหรือแท็บเล็ต"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>ถ่ายรูปด้วยกล้อง</span>
                  </button>

                  {/* 3. Add Manual Row / Link */}
                  <button
                    type="button"
                    onClick={() => handleAddPhoto('manual')}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors"
                    title="เพิ่มแถวกรอกชื่อไฟล์ / ลิงก์อ้างอิง"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    <span>+ เพิ่มแถวลิงก์</span>
                  </button>
                </div>
              </div>

              {/* Drag & Drop Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50/80 scale-[1.01]' 
                    : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/80'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <UploadCloud className="w-7 h-7 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      ลากไฟล์รูปภาพมาวางที่นี่ หรือ <span className="text-blue-600 underline">คลิกเพื่อเลือกไฟล์จากคอมพิวเตอร์</span>
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      รองรับ JPG, PNG, GIF, WebP, PDF (สามารถกด <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-[10px] font-mono">Ctrl + V</kbd> เพื่อวางรูปจาก Clipboard ได้ทันที)
                    </p>
                  </div>
                </div>
              </div>

              {/* Photos List Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 px-1">
                  <span>รายการรูปภาพ & หลักฐานที่บันทึกไว้ ({formData.photos.length} รูป):</span>
                  <span className="text-[11px] text-slate-400">คลิกที่รูปเพื่อดูรูปขยายใหญ่</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formData.photos.map((p, idx) => (
                    <div 
                      key={p.id} 
                      className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-start gap-3 shadow-xs hover:border-slate-300 transition-all"
                    >
                      {/* Thumbnail or Icon Box */}
                      <div className="relative shrink-0 group">
                        {p.imageUrl ? (
                          <div 
                            onClick={() => setPreviewImage({ url: p.imageUrl!, title: p.description || p.fileRef })}
                            className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer relative group"
                          >
                            <img 
                              src={p.imageUrl} 
                              alt={p.description || 'Evidence'} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye className="w-5 h-5" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                            <ImageIcon className="w-6 h-6 mb-1 text-slate-300" />
                            <span className="text-[9px] font-mono">No Preview</span>
                          </div>
                        )}
                        <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-xs">
                          {idx + 1}
                        </span>
                      </div>

                      {/* Fields */}
                      <div className="flex-1 space-y-2 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                            คำอธิบายรูปภาพ / วัตถุประสงค์
                          </label>
                          <input
                            type="text"
                            value={p.description}
                            onChange={(e) => handleUpdatePhoto(p.id, 'description', e.target.value)}
                            placeholder="e.g. ภาพก่อนแก้ไข / ภาพหลังเปลี่ยน Driver / หน้างาน"
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
                            ชื่อไฟล์ / ลิงก์รูปภาพอ้างอิง
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={p.fileRef}
                              onChange={(e) => handleUpdatePhoto(p.id, 'fileRef', e.target.value)}
                              placeholder="e.g. IMG_20260401_001.JPG หรือ https://..."
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono-data text-slate-700"
                            />
                            {p.fileRef && p.fileRef.startsWith('http') && (
                              <a
                                href={p.fileRef}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
                                title="เปิดลิงก์รูปภาพ"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                        title="ลบรูปภาพนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {formData.photos.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                      ยังไม่มีรูปถ่ายหรือหลักฐานอ้างอิง คลิกปุ่มด้านบนเพื่อเลือกไฟล์จากคอมพิวเตอร์ หรือถ่ายภาพจากกล้อง
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PARTS & MEASUREMENTS */}
          {activeTab === 'parts_measure' && (
            <div className="space-y-6">
              {/* 06 PARTS USED */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-semibold text-slate-900 text-sm">
                    06 | PARTS / MATERIAL USED / อะไหล่ & วัสดุที่ใช้
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddPart}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มรายการอะไหล่</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.parts.map((part, idx) => (
                    <div key={part.id} className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                      <div className="col-span-1 text-center font-mono-data font-bold text-slate-600">{idx + 1}</div>
                      <div className="col-span-6">
                        <input
                          type="text"
                          value={part.name}
                          onChange={(e) => handleUpdatePart(part.id, 'name', e.target.value)}
                          placeholder="ชื่ออะไหล่ / วัสดุ (Part Name)"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={part.qty}
                          onChange={(e) => handleUpdatePart(part.id, 'qty', e.target.value)}
                          placeholder="จำนวน (Qty)"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-center font-mono-data"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={part.remark}
                          onChange={(e) => handleUpdatePart(part.id, 'remark', e.target.value)}
                          placeholder="หมายเหตุ (Remark)"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemovePart(part.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {formData.parts.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-400">ยังไม่มีรายการอะไหล่หรือวัสดุ</div>
                  )}
                </div>
              </div>

              {/* 07 MEASUREMENT / TEST RESULTS */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">
                      07 | MEASUREMENT / TEST RESULT / ผลการวัด & ทดสอบ
                    </h3>
                    <p className="text-[11px] text-slate-500">* กรอกค่า Before และ After พร้อมหน่วย เพื่อให้เห็นผลการตรวจ / แก้ไขอย่างชัดเจน</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMeasurement}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มรายการทดสอบ</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.measurements.map((m) => (
                    <div key={m.id} className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={m.item}
                          onChange={(e) => handleUpdateMeasurement(m.id, 'item', e.target.value)}
                          placeholder="หัวข้อทดสอบ (e.g. Lux Level / Dimming %)"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={m.before}
                          onChange={(e) => handleUpdateMeasurement(m.id, 'before', e.target.value)}
                          placeholder="Before (ก่อน)"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-center font-mono-data"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={m.after}
                          onChange={(e) => handleUpdateMeasurement(m.id, 'after', e.target.value)}
                          placeholder="After (หลัง)"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-center font-mono-data font-semibold text-emerald-700"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={m.unit}
                          onChange={(e) => handleUpdateMeasurement(m.id, 'unit', e.target.value)}
                          placeholder="หน่วย (Lux/V/A)"
                          className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-center font-mono-data"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={m.remark}
                          onChange={(e) => handleUpdateMeasurement(m.id, 'remark', e.target.value)}
                          placeholder="หมายเหตุ / วิธีทดสอบ"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveMeasurement(m.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {formData.measurements.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-400">ยังไม่มีรายการผลการวัดหรือทดสอบ</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: RESULTS, FOLLOW-UP & SIGN-OFF */}
          {activeTab === 'result_sign' && (
            <div className="space-y-6">
              
              {/* 08 SERVICE RESULT */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h3 className="font-semibold text-slate-900 text-sm border-b border-slate-200 pb-2">
                  08 | SERVICE RESULT / ผลการให้บริการ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">RESULT / ผลลัพธ์</label>
                    <select
                      value={formData.serviceResult}
                      onChange={(e) => setFormData({ ...formData, serviceResult: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                    >
                      <option value="">-- เลือกผลลัพธ์ --</option>
                      <option value="Completed">Completed (งานเสร็จสมบูรณ์ 100%)</option>
                      <option value="Improved">Improved (ดีขึ้น / มีความคืบหน้า)</option>
                      <option value="Not Completed">Not Completed (ยังไม่เสร็จสิ้น)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">RECOMMENDATION / NEXT ACTION (คำแนะนำ / การดำเนินการถัดไป)</label>
                    <input
                      type="text"
                      value={formData.recommendationNextAction}
                      onChange={(e) => setFormData({ ...formData, recommendationNextAction: e.target.value })}
                      placeholder="e.g. ส่งมอบตาราง BOQ / ลูกค้าอนุมัติสเปก Mock-Up ให้เปิด PO ผลิตสินค้า"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 09 FOLLOW UP */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h3 className="font-semibold text-slate-900 text-sm border-b border-slate-200 pb-2">
                  09 | FOLLOW-UP / NEXT SERVICE / การติดตาม & บริการครั้งถัดไป
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">NEXT SERVICE DUE (วันที่นัดหมายถัดไป)</label>
                    <input
                      type="date"
                      value={formData.nextServiceDue}
                      onChange={(e) => setFormData({ ...formData, nextServiceDue: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono-data"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">OWNER (ผู้รับผิดชอบงานต่อ)</label>
                    <input
                      type="text"
                      value={formData.followUpOwner}
                      onChange={(e) => setFormData({ ...formData, followUpOwner: e.target.value })}
                      placeholder="e.g. ธนากร (Eng. Ton)"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">REMARK (หมายเหตุสำคัญ)</label>
                    <input
                      type="text"
                      value={formData.followUpRemark}
                      onChange={(e) => setFormData({ ...formData, followUpRemark: e.target.value })}
                      placeholder="e.g. นัดหมายตรวจรับหน้างาน"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-slate-700 mb-1">FOLLOW-UP DETAILS (งานที่ต้องทำต่อ / เงื่อนไขก่อนปิดงาน)</label>
                    <input
                      type="text"
                      value={formData.followUpDetails}
                      onChange={(e) => setFormData({ ...formData, followUpDetails: e.target.value })}
                      placeholder="รายละเอียดเพิ่มเติมสำหรับการติดตามงาน..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 10 SIGN OFF / ACCEPTANCE */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="border-b border-slate-200 pb-2">
                  <h3 className="font-semibold text-slate-900 text-sm">
                    10 | SIGN OFF / ACCEPTANCE / การรับรอง & การอนุมัติ (4 ฝ่าย)
                  </h3>
                  <p className="text-xs text-slate-500">คลิกปุ่มเซ็นชื่อเพื่อลงลายมือชื่อดิจิทัล</p>
                </div>

                {/* Digital Signature Pad Popup if active */}
                {signingRole && (
                  <div className="mb-4">
                    <SignaturePad
                      signerTitle={
                        signingRole === 'engineer' ? 'วิศวกร (ENGINEER / STAFF)' :
                        signingRole === 'supervisor' ? 'หัวหน้างาน (SUPERVISOR / PM)' :
                        signingRole === 'sales' ? 'ฝ่ายขาย (SALES / REQUESTER)' :
                        'ลูกค้า (CUSTOMER)'
                      }
                      initialSignature={formData.signOff[signingRole].signatureData}
                      onSave={handleSaveSignature}
                      onCancel={() => setSigningRole(null)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Engineer */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 uppercase block">1. ENGINEER / STAFF</span>
                      <input
                        type="text"
                        value={formData.signOff.engineer.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          signOff: { ...formData.signOff, engineer: { ...formData.signOff.engineer, name: e.target.value } }
                        })}
                        placeholder="ชื่อวิศวกร"
                        className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div className="h-14 border border-dashed border-slate-300 rounded flex items-center justify-center bg-slate-50 p-1">
                      {formData.signOff.engineer.signatureData ? (
                        <img src={formData.signOff.engineer.signatureData} alt="Sig" className="max-h-12 object-contain" />
                      ) : (
                        <span className="text-[11px] text-slate-400">ยังไม่เซ็น</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSigningRole('engineer')}
                      className="w-full py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                    >
                      {formData.signOff.engineer.signatureData ? 'เซ็นชื่อใหม่' : 'ลงลายมือชื่อ'}
                    </button>
                  </div>

                  {/* Supervisor */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 uppercase block">2. SUPERVISOR / PM</span>
                      <input
                        type="text"
                        value={formData.signOff.supervisor.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          signOff: { ...formData.signOff, supervisor: { ...formData.signOff.supervisor, name: e.target.value } }
                        })}
                        placeholder="ชื่อหัวหน้างาน/PM"
                        className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div className="h-14 border border-dashed border-slate-300 rounded flex items-center justify-center bg-slate-50 p-1">
                      {formData.signOff.supervisor.signatureData ? (
                        <img src={formData.signOff.supervisor.signatureData} alt="Sig" className="max-h-12 object-contain" />
                      ) : (
                        <span className="text-[11px] text-slate-400">ยังไม่เซ็น</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSigningRole('supervisor')}
                      className="w-full py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                    >
                      {formData.signOff.supervisor.signatureData ? 'เซ็นชื่อใหม่' : 'ลงลายมือชื่อ'}
                    </button>
                  </div>

                  {/* Sales */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 uppercase block">3. SALES / REQUESTER</span>
                      <input
                        type="text"
                        value={formData.signOff.sales.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          signOff: { ...formData.signOff, sales: { ...formData.signOff.sales, name: e.target.value } }
                        })}
                        placeholder="ชื่อฝ่ายขาย"
                        className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div className="h-14 border border-dashed border-slate-300 rounded flex items-center justify-center bg-slate-50 p-1">
                      {formData.signOff.sales.signatureData ? (
                        <img src={formData.signOff.sales.signatureData} alt="Sig" className="max-h-12 object-contain" />
                      ) : (
                        <span className="text-[11px] text-slate-400">ยังไม่เซ็น</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSigningRole('sales')}
                      className="w-full py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                    >
                      {formData.signOff.sales.signatureData ? 'เซ็นชื่อใหม่' : 'ลงลายมือชื่อ'}
                    </button>
                  </div>

                  {/* Customer */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 uppercase block">4. CUSTOMER</span>
                      <input
                        type="text"
                        value={formData.signOff.customer.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          signOff: { ...formData.signOff, customer: { ...formData.signOff.customer, name: e.target.value } }
                        })}
                        placeholder="ชื่อลูกค้า"
                        className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div className="h-14 border border-dashed border-slate-300 rounded flex items-center justify-center bg-slate-50 p-1">
                      {formData.signOff.customer.signatureData ? (
                        <img src={formData.signOff.customer.signatureData} alt="Sig" className="max-h-12 object-contain" />
                      ) : (
                        <span className="text-[11px] text-slate-400">ยังไม่เซ็น</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSigningRole('customer')}
                      className="w-full py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                    >
                      {formData.signOff.customer.signatureData ? 'เซ็นชื่อใหม่' : 'ลงลายมือชื่อ'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          </div>

          {/* Sticky Modal Footer */}
          <div className="px-6 sm:px-8 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {initialData && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`ยืนยันการลบใบคำขอ ${formData.documentNo} ออกจากระบบอย่างถาวรหรือไม่?`)) {
                      onDelete(formData.id);
                      onClose();
                    }
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ลบคำขอนี้ (Delete)</span>
                </button>
              )}
              <span className="text-xs text-slate-500 hidden md:inline">
                * ข้อมูลจะถูกบันทึกและซิงก์ลง Firebase Cloud Database แบบเรียลไทม์
              </span>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก (Cancel)
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกข้อมูลคำขอ (Save Request)</span>
              </button>
            </div>
          </div>

        </form>

        {/* Full Image Preview Zoom Modal */}
        {previewImage && (
          <div 
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-70 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-3xl overflow-hidden max-w-4xl w-full border border-slate-700 shadow-2xl flex flex-col"
            >
              <div className="px-6 py-3.5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
                <span className="text-sm font-bold truncate max-w-md">{previewImage.title || 'รูปถ่ายหลักฐานอ้างอิง'}</span>
                <div className="flex items-center gap-2">
                  <a
                    href={previewImage.url}
                    download="evidence_image"
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="ดาวน์โหลดรูปภาพ"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-center bg-slate-950/60 max-h-[80vh] overflow-auto">
                <img 
                  src={previewImage.url} 
                  alt={previewImage.title} 
                  className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
