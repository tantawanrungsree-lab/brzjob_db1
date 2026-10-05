import React, { useState, useEffect } from 'react';
import { Project, EngineerRequest } from '../../types';
import { 
  Calendar, CheckCircle2, Clock, AlertTriangle, User, 
  ZoomIn, ZoomOut, ChevronDown, ChevronRight, BarChart2,
  Flag, Layers, ArrowRight, ShieldCheck, Sparkles, Filter,
  Edit2, Plus, Trash2, RotateCcw, Save, Check
} from 'lucide-react';

interface MicrosoftProjectGanttProps {
  project: Project;
  requests: EngineerRequest[];
}

interface GanttTask {
  id: string;
  wbs: string;
  name: string;
  nameEn: string;
  duration: number; // in days
  startDayOffset: number; // days from project start
  progress: number; // 0 - 100
  isPhase?: boolean;
  isMilestone?: boolean;
  resource: string;
  predecessors?: string;
  status: 'completed' | 'in_progress' | 'pending' | 'delayed';
}

export const MicrosoftProjectGantt: React.FC<MicrosoftProjectGanttProps> = ({
  project,
  requests
}) => {
  const [zoomMode, setZoomMode] = useState<'weeks' | 'months'>('weeks');
  
  // Editable Project Header Info
  const [startDate, setStartDate] = useState(project.startDate || '2026-01-15');
  const [targetDate, setTargetDate] = useState(project.targetDate || '2026-11-30');
  const [baselineDuration, setBaselineDuration] = useState<number>(180);
  const [engineerInCharge, setEngineerInCharge] = useState(project.engineerName || 'วิศวกร ธนากร');
  
  const [isEditingHeaders, setIsEditingHeaders] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const linkedRequests = requests.filter(r => r.projectId === project.id || r.projectCode === project.projectCode);
  const onSiteVisits = linkedRequests.filter(r => r.jobTypes?.onSite || r.jobTypes?.siteSurvey || r.jobTypes?.installation);
  const hasMockUp = linkedRequests.some(r => r.jobTypes?.mockUp);
  const hasQC = linkedRequests.some(r => r.jobTypes?.qc);
  const isDone = project.status === 'Completed';

  // Initial WBS generator function
  const getDefaultTasks = (): GanttTask[] => [
    // --- PHASE 1 ---
    {
      id: 'p1',
      wbs: '1',
      name: 'ระยะที่ 1: วางแผนโครงการและทบทวนแบบสถาปัตย์',
      nameEn: 'Phase 1: Project Initiation & Drawing Review',
      duration: 25,
      startDayOffset: 0,
      progress: 100,
      isPhase: true,
      resource: `${engineerInCharge}, ${project.salesName}`,
      status: 'completed'
    },
    {
      id: 't1_1',
      wbs: '1.1',
      name: 'ประชุม Kick-off และสรุปขอบเขตงานระบบส่องสว่าง',
      nameEn: 'Project Kick-off & Scope Definition',
      duration: 5,
      startDayOffset: 0,
      progress: 100,
      resource: project.salesName,
      status: 'completed'
    },
    {
      id: 't1_2',
      wbs: '1.2',
      name: 'ตรวจสอบแบบ CAD / แปลนฝ้าเพดาน & ตารางโหลดไฟฟ้า',
      nameEn: 'Architectural CAD & Ceiling Plan Review',
      duration: 10,
      startDayOffset: 5,
      progress: 100,
      predecessors: '1.1',
      resource: engineerInCharge,
      status: 'completed'
    },
    {
      id: 't1_3',
      wbs: '1.3',
      name: 'นับแบบและถอดปริมาณโคมไฟ & อุปกรณ์ (BOQ Takeoff)',
      nameEn: 'BOQ Takeoff & Quantities Estimation',
      duration: 10,
      startDayOffset: 15,
      progress: 100,
      predecessors: '1.2',
      resource: engineerInCharge,
      status: 'completed'
    },

    // --- PHASE 2 ---
    {
      id: 'p2',
      wbs: '2',
      name: 'ระยะที่ 2: สำรวจหน้างานและจัดทำสเปคผลิตภัณฑ์',
      nameEn: 'Phase 2: Site Survey & Technical Specifications',
      duration: 35,
      startDayOffset: 25,
      progress: onSiteVisits.length > 0 || isDone ? 100 : 70,
      isPhase: true,
      resource: engineerInCharge,
      predecessors: '1',
      status: onSiteVisits.length > 0 || isDone ? 'completed' : 'in_progress'
    },
    {
      id: 't2_1',
      wbs: '2.1',
      name: 'ลงพื้นที่สำรวจสถานที่หน้างานจริง (Site Survey Inspection)',
      nameEn: 'On-Site Survey & Dimension Verification',
      duration: 10,
      startDayOffset: 25,
      progress: onSiteVisits.length > 0 || isDone ? 100 : 80,
      predecessors: '1.3',
      resource: engineerInCharge,
      status: onSiteVisits.length > 0 || isDone ? 'completed' : 'in_progress'
    },
    {
      id: 't2_2',
      wbs: '2.2',
      name: 'จัดทำ Specification Sheet & ตรวจสอบมาตรฐานแสงสว่าง',
      nameEn: 'Spec Sheet Finalization & Luminaire Specs',
      duration: 15,
      startDayOffset: 35,
      progress: onSiteVisits.length > 0 || isDone ? 100 : 60,
      predecessors: '2.1',
      resource: engineerInCharge,
      status: onSiteVisits.length > 0 || isDone ? 'completed' : 'in_progress'
    },
    {
      id: 't2_3',
      wbs: '2.3',
      name: 'จัดทำและติดตั้งชุดทดสอบแสงสว่างตัวอย่าง (Mock-Up Demo)',
      nameEn: 'Mock-Up & Light Simulation Test',
      duration: 10,
      startDayOffset: 50,
      progress: hasMockUp || isDone ? 100 : 40,
      predecessors: '2.2',
      resource: engineerInCharge,
      status: hasMockUp || isDone ? 'completed' : 'in_progress'
    },
    {
      id: 'm2_4',
      wbs: '2.4',
      name: '◆ ได้รับการอนุมัติสเปค & ตัวอย่าง Mock-Up (Milestone)',
      nameEn: 'Milestone: Spec & Mock-Up Sign-Off',
      duration: 0,
      startDayOffset: 60,
      progress: hasMockUp || isDone ? 100 : 0,
      isMilestone: true,
      predecessors: '2.3',
      resource: 'เจ้าของโครงการ & PM',
      status: hasMockUp || isDone ? 'completed' : 'pending'
    },

    // --- PHASE 3 ---
    {
      id: 'p3',
      wbs: '3',
      name: 'ระยะที่ 3: เปิดใบสั่งขายและประสานงานฝ่ายผลิต/นำเข้า',
      nameEn: 'Phase 3: Sales Order & Manufacturing Coordination',
      duration: 45,
      startDayOffset: 60,
      progress: isDone ? 100 : project.status === 'On Track' ? 85 : 50,
      isPhase: true,
      resource: `${project.salesName}, โรงงาน Lumencraft`,
      predecessors: '2',
      status: isDone ? 'completed' : project.status === 'On Track' ? 'in_progress' : 'delayed'
    },
    {
      id: 't3_1',
      wbs: '3.1',
      name: `ออกใบสั่งขาย SO (${project.soNumber || 'SO Master'}) และส่งแบบผลิต`,
      nameEn: 'SO Issuance & Custom Order Processing',
      duration: 15,
      startDayOffset: 60,
      progress: 100,
      predecessors: '2.4',
      resource: project.salesName,
      status: 'completed'
    },
    {
      id: 't3_2',
      wbs: '3.2',
      name: 'กระบวนการผลิตโคมไฟสั่งตัดพิเศษ (Custom Fabrication)',
      nameEn: 'Luminaire Fabrication & Assembly',
      duration: 25,
      startDayOffset: 75,
      progress: isDone ? 100 : 80,
      predecessors: '3.1',
      resource: 'ฝ่ายผลิต Lumencraft',
      status: isDone ? 'completed' : 'in_progress'
    },
    {
      id: 't3_3',
      wbs: '3.3',
      name: 'ตรวจรับสินค้าและตรวจสอบคุณภาพสินค้าขาเข้า (Inbound QC)',
      nameEn: 'Quality Control & Photometric Verification',
      duration: 5,
      startDayOffset: 100,
      progress: hasQC || isDone ? 100 : 50,
      predecessors: '3.2',
      resource: engineerInCharge,
      status: hasQC || isDone ? 'completed' : 'in_progress'
    },

    // --- PHASE 4 ---
    {
      id: 'p4',
      wbs: '4',
      name: 'ระยะที่ 4: ขนส่ง ส่งมอบหน้างาน และควบคุมการติดตั้ง',
      nameEn: 'Phase 4: Site Delivery, Installation & Commissioning',
      duration: 50,
      startDayOffset: 105,
      progress: isDone ? 100 : 60,
      isPhase: true,
      resource: engineerInCharge,
      predecessors: '3',
      status: isDone ? 'completed' : 'in_progress'
    },
    {
      id: 't4_1',
      wbs: '4.1',
      name: 'จัดส่งโคมไฟและอุปกรณ์ Driver เข้าหน้างานตามงวด',
      nameEn: 'Site Delivery & Material Inspection',
      duration: 10,
      startDayOffset: 105,
      progress: isDone ? 100 : 75,
      predecessors: '3.3',
      resource: 'ทีมขนส่ง & ช่างติดตั้ง',
      status: isDone ? 'completed' : 'in_progress'
    },
    {
      id: 't4_2',
      wbs: '4.2',
      name: 'วิศวกรเข้ากำกับดูแลและตรวจสอบการติดตั้ง (Supervision)',
      nameEn: 'Installation Monitoring & Quality Check',
      duration: 25,
      startDayOffset: 115,
      progress: isDone ? 100 : 55,
      predecessors: '4.1',
      resource: engineerInCharge,
      status: isDone ? 'completed' : 'in_progress'
    },
    {
      id: 't4_3',
      wbs: '4.3',
      name: 'ทดสอบระบบควบคุมแสงสว่าง DALI / DMX Commissioning',
      nameEn: 'DALI/DMX Control System Commissioning',
      duration: 15,
      startDayOffset: 140,
      progress: isDone ? 100 : 30,
      predecessors: '4.2',
      resource: engineerInCharge,
      status: isDone ? 'completed' : 'in_progress'
    },

    // --- PHASE 5 ---
    {
      id: 'p5',
      wbs: '5',
      name: 'ระยะที่ 5: ตรวจวัดผล ส่งมอบโครงการ และรับประกันผลงาน',
      nameEn: 'Phase 5: Final Testing, Handover & Warranty',
      duration: 25,
      startDayOffset: 155,
      progress: isDone ? 100 : 20,
      isPhase: true,
      resource: `${engineerInCharge}, ${project.salesName}`,
      predecessors: '4',
      status: isDone ? 'completed' : 'pending'
    },
    {
      id: 't5_1',
      wbs: '5.1',
      name: 'ตรวจวัดค่าความสว่าง Lux Measurement & ตรวจรับขั้นสุดท้าย',
      nameEn: 'Lux Measurement & Comprehensive Final QC',
      duration: 10,
      startDayOffset: 155,
      progress: isDone ? 100 : 20,
      predecessors: '4.3',
      resource: engineerInCharge,
      status: isDone ? 'completed' : 'pending'
    },
    {
      id: 'm5_2',
      wbs: '5.2',
      name: '◆ ลงนามส่งมอบงานโครงการ (Project Handover Sign-Off)',
      nameEn: 'Milestone: Formal Handover & Acceptance',
      duration: 0,
      startDayOffset: 165,
      progress: isDone ? 100 : 0,
      isMilestone: true,
      predecessors: '5.1',
      resource: 'ลูกค้า & ผู้ตรวจรับงาน',
      status: isDone ? 'completed' : 'pending'
    },
    {
      id: 't5_3',
      wbs: '5.3',
      name: 'เริ่มต้นระยะรับประกันคุณภาพ 2 ปี และบริการหลังการขาย (Warranty)',
      nameEn: '2-Year Warranty & Preventative Maintenance',
      duration: 15,
      startDayOffset: 165,
      progress: isDone ? 100 : 0,
      predecessors: '5.2',
      resource: 'ฝ่ายบริการเทคนิค Lumencraft',
      status: isDone ? 'completed' : 'pending'
    }
  ];

  const [tasks, setTasks] = useState<GanttTask[]>(getDefaultTasks);

  // Update specific task field
  const handleUpdateTask = (id: string, field: keyof GanttTask, value: any) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, [field]: value };
        // Auto update status based on progress
        if (field === 'progress') {
          const num = Number(value) || 0;
          updated.progress = Math.min(100, Math.max(0, num));
          if (updated.progress === 100) updated.status = 'completed';
          else if (updated.progress > 0) updated.status = 'in_progress';
          else updated.status = 'pending';
        }
        if (field === 'duration') {
          updated.duration = Math.max(0, Number(value) || 0);
        }
        return updated;
      }
      return t;
    }));
  };

  const handleResetToDefault = () => {
    if (window.confirm('ยืนยันรีเซ็ตแผนงาน Gantt Timeline เป็นค่าเริ่มต้นหรือไม่?')) {
      setTasks(getDefaultTasks());
      setStartDate(project.startDate || '2026-01-15');
      setTargetDate(project.targetDate || '2026-11-30');
      setBaselineDuration(180);
      setEngineerInCharge(project.engineerName || 'วิศวกร ธนากร');
    }
  };

  const handleSaveAll = () => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  // Timeline scale calculation
  const totalDays = Math.max(120, baselineDuration);
  const timeColumns = zoomMode === 'weeks' 
    ? Array.from({ length: Math.ceil(totalDays / 7) }, (_, i) => ({ label: `W${i + 1}`, month: `M${Math.floor(i / 4) + 1}`, startDay: i * 7 }))
    : Array.from({ length: Math.ceil(totalDays / 30) }, (_, i) => ({ label: `Month ${i + 1}`, month: `M${i + 1}`, startDay: i * 30 }));

  const todayDayOffset = 65; // Simulated current day position in schedule

  return (
    <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden flex flex-col w-full font-sans">
      
      {/* ========================================================================= */}
      {/* MICROSOFT PROJECT TITLE BAR & CONTROLS */}
      {/* ========================================================================= */}
      <div className="bg-[#0f6cbd] text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 text-white font-bold flex items-center justify-center font-mono text-sm border border-white/30">
            MP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-heading text-white">
                MICROSOFT PROJECT GANTT TIMELINE • {project.projectName}
              </h3>
              <span className="text-[11px] bg-blue-950/60 text-blue-200 px-2 py-0.5 rounded font-mono">
                {project.projectCode}
              </span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded border border-emerald-400/40">
                ✏️ สามารถแก้ไขข้อมูลในตารางและหัวข้อได้
              </span>
            </div>
            <p className="text-[11px] text-blue-100">
              แผนภูมิแกนต์ (Gantt Chart), กำหนดการดำเนินงานวิศวกรรมมาตรฐาน (แก้ไข Task Name, Duration, % Comp, Resources, และวันเริ่ม-เสร็จได้)
            </p>
          </div>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {showSavedToast && (
            <span className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              <span>บันทึกเรียบร้อย</span>
            </span>
          )}

          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors border border-white/20"
            title="รีเซ็ตค่ากลับเป็นค่ามาตรฐาน"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ต</span>
          </button>

          <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/20 text-xs font-semibold">
            <button
              onClick={() => setZoomMode('weeks')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                zoomMode === 'weeks' ? 'bg-white text-blue-950 font-bold shadow-xs' : 'text-blue-100 hover:text-white'
              }`}
            >
              รายสัปดาห์ (Weeks)
            </button>
            <button
              onClick={() => setZoomMode('months')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                zoomMode === 'months' ? 'bg-white text-blue-950 font-bold shadow-xs' : 'text-blue-100 hover:text-white'
              }`}
            >
              รายเดือน (Months)
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EDITABLE PROJECT SUMMARY INFO BAR (วันเริ่ม, กำหนดส่งมอบ, Baseline Duration, วิศวกร) */}
      {/* ========================================================================= */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
        
        {/* Editable Fields Ribbon */}
        <div className="flex flex-wrap items-center gap-4 flex-1">
          
          {/* 1. วันเริ่มโครงการ */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-slate-500 font-medium">วันเริ่มโครงการ:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="font-mono font-bold text-slate-900 bg-transparent border-0 p-0 text-xs focus:ring-1 focus:ring-blue-500 rounded cursor-pointer"
            />
          </div>

          {/* 2. กำหนดส่งมอบงาน */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            <Flag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-slate-500 font-medium">กำหนดส่งมอบงาน:</span>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="font-mono font-bold text-slate-900 bg-transparent border-0 p-0 text-xs focus:ring-1 focus:ring-emerald-500 rounded cursor-pointer"
            />
          </div>

          {/* 3. ระยะเวลารวม (Baseline Duration) */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-slate-500 font-medium">ระยะเวลารวม (Baseline Duration):</span>
            <div className="flex items-center gap-1 font-mono">
              <input
                type="number"
                min="30"
                max="720"
                value={baselineDuration}
                onChange={(e) => setBaselineDuration(Number(e.target.value) || 180)}
                className="w-16 font-bold text-blue-800 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-xs text-center focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-slate-600 font-medium">วันทำการ</span>
            </div>
          </div>

          {/* 4. วิศวกรผู้ควบคุม */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            <User className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span className="text-slate-500 font-medium">วิศวกรผู้ควบคุม:</span>
            <input
              type="text"
              value={engineerInCharge}
              onChange={(e) => setEngineerInCharge(e.target.value)}
              placeholder="ชื่อวิศวกรผู้รับผิดชอบ"
              className="font-bold text-slate-900 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-xs focus:ring-1 focus:ring-purple-500 min-w-[140px]"
            />
          </div>

        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
            <span>เสร็จสิ้น (100%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
            <span>กำลังทำ</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rotate-45 bg-purple-600 inline-block" />
            <span>Milestone</span>
          </div>
          <div className="flex items-center gap-1 text-rose-600 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping inline-block" />
            <span>วันนี้</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SPLIT SCREEN: LEFT EDITABLE TASK SHEET + RIGHT GANTT TIMELINE BARS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 overflow-x-auto divide-y xl:divide-y-0 xl:divide-x divide-slate-300 max-h-[72vh]">
        
        {/* ======================================================================= */}
        {/* LEFT PANEL: MS PROJECT TASK SHEET (EDITABLE FIELDS) */}
        {/* ======================================================================= */}
        <div className="xl:col-span-6 overflow-x-auto bg-white border-r border-slate-200">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead className="bg-[#f3f4f6] text-slate-800 font-bold border-b border-slate-300 sticky top-0 z-20 shadow-xs">
              <tr className="divide-x divide-slate-300">
                <th className="py-2.5 px-2 text-center w-8 bg-slate-200 text-slate-600 font-mono">i</th>
                <th className="py-2.5 px-2 text-center w-12 font-mono">WBS</th>
                <th className="py-2.5 px-3 min-w-[220px]">Task Name (ชื่อกิจกรรมโครงการ) ✏️</th>
                <th className="py-2.5 px-2 text-center w-20 whitespace-nowrap">Duration ✏️</th>
                <th className="py-2.5 px-2 text-center w-20 font-mono">% Comp ✏️</th>
                <th className="py-2.5 px-2.5 min-w-[130px]">Resource Names ✏️</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tasks.map((task) => {
                return (
                  <tr 
                    key={task.id}
                    className={`divide-x divide-slate-200 transition-colors ${
                      task.isPhase 
                        ? 'bg-slate-100/90 font-bold hover:bg-slate-200/90' 
                        : task.isMilestone 
                        ? 'bg-purple-50/50 hover:bg-purple-100/60 font-semibold' 
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    {/* Status icon column */}
                    <td className="py-2 px-1 text-center bg-slate-100/50">
                      {task.progress === 100 ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mx-auto" />
                      ) : task.status === 'in_progress' ? (
                        <Clock className="w-3.5 h-3.5 text-blue-600 mx-auto" />
                      ) : task.isMilestone ? (
                        <Flag className="w-3 h-3 text-purple-600 mx-auto" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-auto block" />
                      )}
                    </td>

                    {/* WBS Number */}
                    <td className={`py-2 px-1 text-center font-mono text-[11px] ${task.isPhase ? 'font-black text-slate-900' : 'text-slate-500'}`}>
                      {task.wbs}
                    </td>

                    {/* 1. EDITABLE TASK NAME */}
                    <td className="py-1.5 px-2">
                      {task.isPhase ? (
                        <div className="font-bold text-slate-900 py-1">
                          <input
                            type="text"
                            value={task.name}
                            onChange={(e) => handleUpdateTask(task.id, 'name', e.target.value)}
                            className="w-full font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-blue-600 focus:bg-white px-1 py-0.5 rounded text-xs outline-none"
                          />
                        </div>
                      ) : (
                        <div className="pl-2">
                          <input
                            type="text"
                            value={task.name}
                            onChange={(e) => handleUpdateTask(task.id, 'name', e.target.value)}
                            className={`w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white px-1.5 py-0.5 rounded text-xs outline-none transition-colors ${
                              task.isMilestone ? 'text-purple-900 font-bold' : 'text-slate-800'
                            }`}
                          />
                          <div className="text-[10px] text-slate-400 pl-1.5">
                            {task.nameEn}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* 2. EDITABLE DURATION */}
                    <td className="py-1.5 px-2 text-center font-mono">
                      {task.isMilestone ? (
                        <span className="text-[11px] text-purple-700 font-bold">0d (MS)</span>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="180"
                            value={task.duration}
                            onChange={(e) => handleUpdateTask(task.id, 'duration', e.target.value)}
                            className="w-12 text-center font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 hover:border-slate-400 focus:border-blue-600 focus:bg-white px-1 py-0.5 rounded text-xs outline-none"
                          />
                          <span className="text-[10px] text-slate-400">d</span>
                        </div>
                      )}
                    </td>

                    {/* 3. EDITABLE % COMPLETE */}
                    <td className="py-1.5 px-2 text-center font-mono">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={task.progress}
                          onChange={(e) => handleUpdateTask(task.id, 'progress', e.target.value)}
                          className={`w-12 text-center font-mono font-bold px-1 py-0.5 rounded text-xs outline-none border ${
                            task.progress === 100 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                              : task.progress > 0 
                              ? 'bg-blue-50 text-blue-800 border-blue-300' 
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}
                        />
                        <span className="text-[10px] text-slate-400">%</span>
                      </div>
                    </td>

                    {/* 4. EDITABLE RESOURCE NAMES */}
                    <td className="py-1.5 px-2">
                      <input
                        type="text"
                        value={task.resource}
                        onChange={(e) => handleUpdateTask(task.id, 'resource', e.target.value)}
                        placeholder="ผู้รับผิดชอบ"
                        className="w-full text-slate-700 text-[11px] bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 focus:bg-white px-1.5 py-0.5 rounded outline-none"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT PANEL: GANTT TIMELINE CHART BARS & TODAY LINE */}
        {/* ======================================================================= */}
        <div className="xl:col-span-6 overflow-x-auto bg-[#fafafa] relative select-none">
          
          <div className="min-w-[650px]">
            
            {/* Timeline Scale Header (Months & Weeks) */}
            <div className="sticky top-0 z-20 bg-[#f3f4f6] border-b border-slate-300 shadow-xs">
              <div className="flex border-b border-slate-300 font-mono text-[11px] font-bold text-slate-700">
                {timeColumns.map((col, idx) => (
                  <div 
                    key={idx} 
                    className="flex-1 text-center py-1.5 border-r border-slate-300 bg-slate-200/70"
                  >
                    {col.month}
                  </div>
                ))}
              </div>
              <div className="flex font-mono text-[10px] text-slate-500 font-semibold">
                {timeColumns.map((col, idx) => (
                  <div 
                    key={idx} 
                    className="flex-1 text-center py-1 border-r border-slate-200 bg-slate-100"
                  >
                    {col.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Gantt Chart Grid Rows with Bars */}
            <div className="divide-y divide-slate-200 relative">
              
              {/* Vertical RED "TODAY" Line across the entire chart */}
              <div 
                className="absolute top-0 bottom-0 z-10 pointer-events-none flex flex-col items-center"
                style={{ left: `${(todayDayOffset / totalDays) * 100}%` }}
              >
                <div className="bg-rose-600 text-white text-[9px] font-bold px-1 rounded shadow-sm">
                  TODAY
                </div>
                <div className="w-0.5 h-full bg-rose-500 border-l border-rose-600 border-dashed" />
              </div>

              {/* Rows */}
              {tasks.map((task) => {
                const startPct = (task.startDayOffset / totalDays) * 100;
                const widthPct = Math.max(1.5, (task.duration / totalDays) * 100);

                return (
                  <div 
                    key={task.id} 
                    className={`h-[43px] flex items-center relative px-2 transition-colors ${
                      task.isPhase ? 'bg-slate-100/50' : task.isMilestone ? 'bg-purple-50/20' : 'hover:bg-slate-100/40'
                    }`}
                  >
                    
                    {/* Background Grid Columns */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {timeColumns.map((_, idx) => (
                        <div key={idx} className="flex-1 border-r border-slate-100" />
                      ))}
                    </div>

                    {/* ========================================================= */}
                    {/* GANTT BAR 1: PHASE SUMMARY BAR (MS Project Black Bracket) */}
                    {/* ========================================================= */}
                    {task.isPhase ? (
                      <div 
                        className="absolute z-10 flex flex-col items-start"
                        style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                      >
                        {/* Summary Bracket Line */}
                        <div className="w-full h-2.5 bg-slate-900 rounded-xs relative">
                          {/* Inner Progress */}
                          <div 
                            className="h-full bg-emerald-500 rounded-xs" 
                            style={{ width: `${task.progress}%` }} 
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-800 truncate block mt-0.5">
                          {task.progress}%
                        </span>
                      </div>
                    ) : task.isMilestone ? (
                      
                      /* ========================================================= */
                      /* GANTT BAR 2: MILESTONE DIAMOND (MS Project Milestone)    */
                      /* ========================================================= */
                      <div 
                        className="absolute z-10 flex items-center gap-1.5"
                        style={{ left: `${startPct}%` }}
                      >
                        <div className={`w-3.5 h-3.5 rotate-45 border-2 shadow-sm ${
                          task.progress === 100 
                            ? 'bg-emerald-600 border-emerald-800' 
                            : 'bg-purple-600 border-purple-800'
                        }`} />
                        <span className="text-[10px] font-bold text-purple-900 whitespace-nowrap bg-white/90 px-1 py-0.2 rounded border border-purple-200">
                          {task.name.replace('◆ ', '')}
                        </span>
                      </div>
                    ) : (
                      
                      /* ========================================================= */
                      /* GANTT BAR 3: STANDARD TASK BAR (Solid Progress Fill)      */
                      /* ========================================================= */
                      <div 
                        className="absolute z-10 flex items-center"
                        style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                      >
                        {/* Main Bar */}
                        <div className="w-full h-4 bg-slate-200 rounded-md border border-slate-300 shadow-xs relative overflow-hidden flex items-center">
                          {/* Progress Fill */}
                          <div 
                            className={`h-full transition-all duration-300 ${
                              task.progress === 100 
                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' 
                                : 'bg-gradient-to-r from-blue-600 to-blue-500'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          />
                          {/* Inner % text if wide enough */}
                          {widthPct > 6 && (
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white drop-shadow-xs">
                              {task.progress}%
                            </span>
                          )}
                        </div>

                        {/* Resource label next to bar */}
                        <span className="ml-2 text-[10px] font-semibold text-slate-600 whitespace-nowrap">
                          {task.resource.split(',')[0]}
                        </span>
                      </div>
                    )}

                  </div>
                );
              })}

            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* GANTT FOOTER STATUS BAR */}
      {/* ========================================================================= */}
      <div className="bg-slate-100 border-t border-slate-300 px-4 py-2 flex items-center justify-between text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-4">
          <span>รวมทั้งหมด: <strong className="text-slate-900">{tasks.length}</strong> รายการกิจกรรม</span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span>ระยะเวลารวม: <strong className="text-blue-800 font-mono">{baselineDuration} วันทำการ</strong></span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span>วิศวกรผู้ควบคุม: <strong className="text-purple-800">{engineerInCharge}</strong></span>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          Interactive Microsoft Project Engine • Real-time Editing Enabled
        </div>
      </div>

    </div>
  );
};
