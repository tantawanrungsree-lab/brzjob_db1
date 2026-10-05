export type JobTypeKey = 
  | 'onSite'
  | 'meeting'
  | 'service'
  | 'mockUp'
  | 'siteSurvey'
  | 'installation'
  | 'countDrawing' // นับแบบ
  | 'claim'
  | 'qc'
  | 'present'
  | 'other';

export interface JobTypeLabels {
  key: JobTypeKey;
  labelTh: string;
  labelEn: string;
  color: string;
}

export const JOB_TYPE_CONFIG: Record<JobTypeKey, { labelTh: string; labelEn: string; badgeClass: string; borderClass: string; bgClass: string; textClass: string }> = {
  onSite: {
    labelTh: 'On Site',
    labelEn: 'On Site',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    borderClass: 'border-blue-500',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700'
  },
  meeting: {
    labelTh: 'Meeting (ประชุม)',
    labelEn: 'Meeting',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    borderClass: 'border-indigo-500',
    bgClass: 'bg-indigo-50',
    textClass: 'text-indigo-700'
  },
  service: {
    labelTh: 'Service (บริการซ่อมบำรุง)',
    labelEn: 'Service',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    borderClass: 'border-cyan-500',
    bgClass: 'bg-cyan-50',
    textClass: 'text-cyan-700'
  },
  mockUp: {
    labelTh: 'Mock-Up (ทดสอบแสง/ตัวอย่าง)',
    labelEn: 'Mock-Up',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    borderClass: 'border-amber-500',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700'
  },
  siteSurvey: {
    labelTh: 'Site Survey (สำรวจหน้างาน)',
    labelEn: 'Site Survey',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    borderClass: 'border-emerald-500',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700'
  },
  installation: {
    labelTh: 'Installation (ติดตั้ง)',
    labelEn: 'Installation',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    borderClass: 'border-teal-500',
    bgClass: 'bg-teal-50',
    textClass: 'text-teal-700'
  },
  countDrawing: {
    labelTh: 'นับแบบ (Take-off / BOQ)',
    labelEn: 'Drawings / BOQ',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    borderClass: 'border-purple-500',
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-700'
  },
  claim: {
    labelTh: 'Claim (เคลมสินค้า/ตรวจสอบปัญหา)',
    labelEn: 'Claim',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    borderClass: 'border-rose-500',
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700'
  },
  qc: {
    labelTh: 'QC (ตรวจคุณภาพสินค้า)',
    labelEn: 'QC Inspection',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    borderClass: 'border-emerald-500',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700'
  },
  present: {
    labelTh: 'Present (นำเสนอทางเทคนิค)',
    labelEn: 'Presentation',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    borderClass: 'border-sky-500',
    bgClass: 'bg-sky-50',
    textClass: 'text-sky-700'
  },
  other: {
    labelTh: 'Other (อื่น ๆ)',
    labelEn: 'Other',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    borderClass: 'border-slate-500',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-700'
  }
};

export type PriorityLevel = 'Normal' | 'Urgent' | 'Critical';
export type RequestStatus = 'Open' | 'In Progress' | 'Completed';
export type ProjectStatus = 'On Track' | 'At Risk' | 'Overdue' | 'On Hold' | 'Completed' | 'In Progress' | 'Planning' | 'Under Service';

export const PROJECT_STATUS_CONFIG: Record<string, { labelTh: string; labelEn: string; bgGradient: string; badgeClass: string; dotClass: string }> = {
  'On Track': {
    labelTh: 'ตามแผน',
    labelEn: 'On Track',
    bgGradient: 'from-emerald-600 to-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-500'
  },
  'At Risk': {
    labelTh: 'เสี่ยงล่าช้า',
    labelEn: 'At Risk',
    bgGradient: 'from-amber-500 to-amber-400',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500'
  },
  'Overdue': {
    labelTh: 'เกินกำหนด',
    labelEn: 'Overdue',
    bgGradient: 'from-red-600 to-rose-500',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
    dotClass: 'bg-red-500'
  },
  'On Hold': {
    labelTh: 'หยุดโครงการ',
    labelEn: 'On Hold',
    bgGradient: 'from-slate-600 to-slate-500',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    dotClass: 'bg-slate-500'
  },
  'Completed': {
    labelTh: 'เสร็จสิ้น',
    labelEn: 'Completed',
    bgGradient: 'from-purple-600 to-indigo-600',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    dotClass: 'bg-purple-500'
  },
  'In Progress': {
    labelTh: 'ตามแผน',
    labelEn: 'On Track',
    bgGradient: 'from-emerald-600 to-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-500'
  }
};
export type AttachmentStatus = 'Attached' | 'Pending' | 'Complete' | 'Incomplete' | '';
export type ServiceResultType = 'Completed' | 'Improved' | 'Not Completed' | '';

export interface PhotoEvidence {
  id: string;
  no: number;
  description: string;
  fileRef: string;
  imageUrl?: string;
}

export interface PartMaterialUsed {
  id: string;
  no: number;
  name: string;
  qty: string;
  remark: string;
}

export interface MeasurementTestResult {
  id: string;
  item: string;
  before: string;
  after: string;
  unit: string;
  remark: string;
}

export interface SignOffPerson {
  name: string;
  signed: boolean;
  signDate: string;
  signatureData?: string;
}

export interface EngineerRequest {
  id: string;
  documentNo: string;
  serviceNo: string;
  dateRequest: string;
  revision: string;
  
  // 01 General Info / Project Control
  projectId: string;
  projectCode: string;
  projectName: string;
  soNumber: string;
  engNo: string;
  priority: PriorityLevel;
  customer: string;
  customerEmail: string;
  customerTel: string;
  location: string;
  salesInCharge: string;
  requester: string;
  engineerStaff: string;
  dueDate: string;
  needReport: boolean;
  needInstallGuide: boolean;
  status: RequestStatus;
  
  // 02 Supporting Documents
  supportingDocs: {
    docTypes: {
      specSheet: boolean;
      drawing: boolean;
      boq: boolean;
      productList: boolean;
      photo: boolean;
      quotationSo: boolean;
      warranty: boolean;
      other: boolean;
      otherText: string;
    };
    attachmentStatus: AttachmentStatus;
    missingDetails: string;
  };
  
  // 03 Request Details / Job Type
  jobTypes: {
    onSite: boolean;
    meeting: boolean;
    service: boolean;
    mockUp: boolean;
    siteSurvey: boolean;
    installation: boolean;
    countDrawing: boolean;
    claim: boolean;
    qc: boolean;
    present: boolean;
    other: boolean;
    otherText: string;
  };
  requestDetails: string;
  
  // 04 Work Performed
  reportedProblem: string;
  findings: string;
  correctiveAction: string;
  workDetails: string;
  
  // 05 Photo / Evidence Reference
  photos: PhotoEvidence[];
  
  // 06 Parts / Material Used
  parts: PartMaterialUsed[];
  
  // 07 Measurement / Test Result
  measurements: MeasurementTestResult[];
  
  // 08 Service Result
  serviceResult: ServiceResultType;
  recommendationNextAction: string;
  
  // 09 Follow-Up / Next Service
  nextServiceDue: string;
  followUpOwner: string;
  followUpRemark: string;
  followUpDetails: string;
  
  // 10 Sign Off / Acceptance
  signOff: {
    engineer: SignOffPerson;
    supervisor: SignOffPerson;
    sales: SignOffPerson;
    customer: SignOffPerson;
  };

  createdAt: string;
  updatedAt: string;
}

export interface ProjectExpenseRecord {
  id: string;
  date: string;
  category: 'fuel' | 'toll' | 'hotel' | 'overtime' | 'other';
  description: string;
  amount: number;
  engineerStaff: string;
  docNo?: string;
  receiptRef?: string;
}

export interface ProjectExpenses {
  fuelCost: number;       // ค่าน้ำมัน
  tollCost: number;       // ค่าทางด่วน
  hotelCost: number;      // ค่าที่พัก
  overtimeCost: number;   // ค่าทำงานล่วงเวลา (OT)
  otherCost?: number;     // ค่าใช้จ่ายอื่น ๆ
  expenseLogs?: ProjectExpenseRecord[];
}

export interface Project {
  id: string;
  projectCode: string; // รหัสโครงการ e.g. "PRJ-2026-089"
  soNumber: string;    // เลขที่ SO / Sales Order e.g. "SO-690241"
  projectName: string; // ชื่อโครงการ e.g. "The Forestias - Forest Pavilion"
  customerName: string;// ชื่อลูกค้า e.g. "MQDC Corporation"
  customerEmail: string; // อีเมลลูกค้า e.g. "contact@mqdc.co.th"
  customerPhone: string; // เบอร์โทร e.g. "081-456-7890"
  engineerName: string;  // ชื่อวิศวกร e.g. "วิศวกร ธนากร (Eng. Ton)"
  salesName: string;     // เซลล์ผู้รับผิดชอบ e.g. "กัญญาภัทร (Sales Jane)"
  status: ProjectStatus; // สถานะโครงการ
  location?: string;
  description?: string;
  budget?: string;
  startDate?: string;
  targetDate?: string;
  expenses?: ProjectExpenses; // ค่าใช้จ่ายค่าน้ำมัน ค่าทางด่วน ค่าที่พัก ค่าทำงานล่วงเวลา
  createdAt: string;
  updatedAt: string;
}

export type ActiveView = 'home' | 'requests' | 'projects' | 'calendar' | 'print-request';
