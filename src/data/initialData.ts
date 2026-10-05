import { Project, EngineerRequest } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'prj-001',
    projectCode: 'LC-PRJ-2026-089',
    soNumber: 'SO-690241, SO-690242',
    projectName: 'The Forestias - Forest Pavilion & Six Senses',
    customerName: 'MQDC (Magnolia Quality Development Corp.)',
    customerEmail: 'somchai.t@mqdc.co.th',
    customerPhone: '081-456-7890',
    engineerName: 'ธนากร ศรีสวัสดิ์ (Eng. Ton)',
    salesName: 'กัญญาภัทร ชาญวิทย์ (Sales Jane)',
    status: 'On Track',
    location: 'บางนา-ตราด กม. 7 สมุทรปราการ',
    description: 'โครงการแสงสว่างสถาปัตยกรรม facade lighting และ DALI smart lighting system สำหรับอาคาร Pavilion และโซน Forest',
    startDate: '2026-01-15',
    targetDate: '2026-11-30',
    expenses: {
      fuelCost: 3800,
      tollCost: 960,
      hotelCost: 0,
      overtimeCost: 4500,
      otherCost: 650,
      expenseLogs: [
        { id: 'exp-101', date: '2026-03-28', category: 'fuel', description: 'ค่าน้ำมันรถบริการเข้าตรวจหน้างานและทดสอบระบบ DALI', amount: 1800, engineerStaff: 'ธนากร ศรีสวัสดิ์', docNo: 'LC-SR-2026-0042', receiptRef: 'PTT-78219' },
        { id: 'exp-102', date: '2026-03-28', category: 'toll', description: 'ค่าทางด่วนบูรพาวิถี-บางนา', amount: 480, engineerStaff: 'ธนากร ศรีสวัสดิ์', docNo: 'LC-SR-2026-0042', receiptRef: 'EXAT-9021' },
        { id: 'exp-103', date: '2026-03-29', category: 'overtime', description: 'ค่าทำงานล่วงเวลา (OT Night Shift) ปรับจูนแสงสว่างยามค่ำคืน', amount: 2500, engineerStaff: 'ธนากร ศรีสวัสดิ์', docNo: 'LC-SR-2026-0042' },
        { id: 'exp-104', date: '2026-03-15', category: 'fuel', description: 'ค่าน้ำมันรถเข้าสำรวจหน้างานครั้งที่ 1', amount: 2000, engineerStaff: 'ธนากร ศรีสวัสดิ์', receiptRef: 'BCP-41092' },
        { id: 'exp-105', date: '2026-03-15', category: 'toll', description: 'ค่าทางด่วนไป-กลับหน้างาน', amount: 480, engineerStaff: 'ธนากร ศรีสวัสดิ์' },
        { id: 'exp-106', date: '2026-03-29', category: 'overtime', description: 'ค่าล่วงเวลาทดสอบ Commissioning', amount: 2000, engineerStaff: 'ธนากร ศรีสวัสดิ์' },
        { id: 'exp-107', date: '2026-03-28', category: 'other', description: 'ค่าอุปกรณ์ต่อสายและเคเบิ้ลไทร์หน้างาน', amount: 650, engineerStaff: 'ธนากร ศรีสวัสดิ์' }
      ]
    },
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-03-28T10:30:00.000Z'
  },
  {
    id: 'prj-002',
    projectCode: 'LC-PRJ-2026-092',
    soNumber: 'SO-690312',
    projectName: 'One Bangkok - Luxury Retail & Tower 3',
    customerName: 'Frasers Property Thailand & TCC Assets',
    customerEmail: 'orapin.p@onebangkok.com',
    customerPhone: '089-771-2345',
    engineerName: 'พีรพล เกรียงไกร (Eng. Paul)',
    salesName: 'ชลธิชา รัตนเวทย์ (Sales Bow)',
    status: 'At Risk',
    location: 'ถนนพระราม 4 ลุมพินี ปทุมวัน กรุงเทพฯ',
    description: 'ระบบโคมไฟ Linear Profile High-CRI 98 และระบบ DMX Architectural Color Changing สำหรับโถง Atrium',
    startDate: '2026-02-01',
    targetDate: '2026-12-15',
    expenses: {
      fuelCost: 2400,
      tollCost: 720,
      hotelCost: 0,
      overtimeCost: 3600,
      otherCost: 500,
      expenseLogs: [
        { id: 'exp-201', date: '2026-03-29', category: 'fuel', description: 'ค่าน้ำมันรถเข้าหน้างานติดตั้ง Mock-Up', amount: 1400, engineerStaff: 'พีรพล เกรียงไกร', docNo: 'LC-SR-2026-0043' },
        { id: 'exp-202', date: '2026-03-29', category: 'toll', description: 'ค่าทางด่วนพระราม 4 - สุขุมวิท', amount: 360, engineerStaff: 'พีรพล เกรียงไกร', docNo: 'LC-SR-2026-0043' },
        { id: 'exp-203', date: '2026-03-29', category: 'overtime', description: 'ค่า OT ติดตั้งและเทสระบบหลังห้างปิด', amount: 3600, engineerStaff: 'พีรพล เกรียงไกร', docNo: 'LC-SR-2026-0043' }
      ]
    },
    createdAt: '2026-02-01T09:15:00.000Z',
    updatedAt: '2026-04-01T14:20:00.000Z'
  },
  {
    id: 'prj-003',
    projectCode: 'LC-PRJ-2026-104',
    soNumber: 'SO-690455',
    projectName: 'Sindhorn Kempinski Hotel & Residences Phase 2',
    customerName: 'Siam Sindhorn Co., Ltd.',
    customerEmail: 'm&e.director@siam-sindhorn.com',
    customerPhone: '02-650-9900',
    engineerName: 'วรพงษ์ เจริญทรัพย์ (Eng. Art)',
    salesName: 'กัญญาภัทร ชาญวิทย์ (Sales Jane)',
    status: 'Overdue',
    location: 'ถนนหลังสวน เพลินจิต ปทุมวัน กรุงเทพฯ',
    description: 'โคมไฟดาวน์ไลท์ CCT Tunable White 2200K-4000K และโคมสั่งผลิตพิเศษ Custom Chandelier โถงล็อบบี้',
    startDate: '2026-02-20',
    targetDate: '2026-10-31',
    expenses: {
      fuelCost: 1900,
      tollCost: 500,
      hotelCost: 0,
      overtimeCost: 1800,
      otherCost: 350,
      expenseLogs: [
        { id: 'exp-301', date: '2026-03-27', category: 'fuel', description: 'ค่าน้ำมันเข้าตรวจสอบ Claim โคมไฟและ Driver', amount: 1100, engineerStaff: 'วรพงษ์ เจริญทรัพย์', docNo: 'LC-SR-2026-0041' },
        { id: 'exp-302', date: '2026-03-27', category: 'toll', description: 'ค่าทางด่วนดินแดง-เพลินจิต', amount: 250, engineerStaff: 'วรพงษ์ เจริญทรัพย์', docNo: 'LC-SR-2026-0041' },
        { id: 'exp-303', date: '2026-03-27', category: 'overtime', description: 'ค่า OT เปลี่ยน Driver และทดสอบความร้อน', amount: 1800, engineerStaff: 'วรพงษ์ เจริญทรัพย์', docNo: 'LC-SR-2026-0041' }
      ]
    },
    createdAt: '2026-02-20T11:00:00.000Z',
    updatedAt: '2026-03-30T16:45:00.000Z'
  },
  {
    id: 'prj-004',
    projectCode: 'LC-PRJ-2026-115',
    soNumber: 'SO-690520',
    projectName: 'Dusit Central Park - Ultra Luxury Penthouse',
    customerName: 'Vimarn Suriya Co., Ltd.',
    customerEmail: 'procurement@dusitcentralpark.com',
    customerPhone: '086-333-8899',
    engineerName: 'ธนากร ศรีสวัสดิ์ (Eng. Ton)',
    salesName: 'วรัญญา ลิ้มประเสริฐ (Sales May)',
    status: 'On Track',
    location: 'หัวมุมถนนสีลม-พระราม 4 สีลม บางรัก กรุงเทพฯ',
    description: 'งานนับแบบ ถอดปริมาณ BOQ โคมไฟดาวน์ไลท์และแถบแม่เหล็ก Magnetic Track Light สำหรับห้องพักเพนต์เฮาส์',
    startDate: '2026-03-10',
    targetDate: '2027-01-30',
    expenses: {
      fuelCost: 1200,
      tollCost: 350,
      hotelCost: 0,
      overtimeCost: 1500,
      otherCost: 200,
      expenseLogs: [
        { id: 'exp-401', date: '2026-03-30', category: 'fuel', description: 'ค่าน้ำมันเข้ารับแบบ CAD จากสำนักงานผู้ออกแบบ', amount: 1200, engineerStaff: 'ธนากร ศรีสวัสดิ์', docNo: 'LC-SR-2026-0044' },
        { id: 'exp-402', date: '2026-03-30', category: 'toll', description: 'ค่าทางด่วนสีลม', amount: 350, engineerStaff: 'ธนากร ศรีสวัสดิ์', docNo: 'LC-SR-2026-0044' },
        { id: 'exp-403', date: '2026-03-31', category: 'overtime', description: 'ค่า OT ถอดแบบ BOQ เร่งด่วนตามคำขอฝ่ายขาย', amount: 1500, engineerStaff: 'ธนากร ศรีสวัสดิ์', docNo: 'LC-SR-2026-0044' }
      ]
    },
    createdAt: '2026-03-10T10:00:00.000Z',
    updatedAt: '2026-04-02T09:00:00.000Z'
  },
  {
    id: 'prj-005',
    projectCode: 'LC-PRJ-2026-078',
    soNumber: 'SO-690180',
    projectName: 'EmSphere Bangkok - Fashion Gallery & Food Hall',
    customerName: 'The Mall Group Co., Ltd.',
    customerEmail: 'engineering@emsphere.co.th',
    customerPhone: '02-310-1000',
    engineerName: 'พีรพล เกรียงไกร (Eng. Paul)',
    salesName: 'ชลธิชา รัตนเวทย์ (Sales Bow)',
    status: 'Completed',
    location: 'ถนนสุขุมวิท พร้อมพงษ์ คลองเตย กรุงเทพฯ',
    description: 'โคมสปอตไลท์ Track Light 3-Phase และ Floodlight โชว์เคสกระจก โซนร้านค้าแบรนด์เนมชั้นนำ',
    startDate: '2025-11-01',
    targetDate: '2026-03-15',
    expenses: {
      fuelCost: 4500,
      tollCost: 1400,
      hotelCost: 0,
      overtimeCost: 6200,
      otherCost: 800,
      expenseLogs: [
        { id: 'exp-501', date: '2026-03-10', category: 'fuel', description: 'ค่าน้ำมันเข้าส่งมอบงานและเทสความสว่าง Lux', amount: 1500, engineerStaff: 'พีรพล เกรียงไกร', docNo: 'LC-SR-2026-0045' },
        { id: 'exp-502', date: '2026-03-10', category: 'toll', description: 'ค่าทางด่วนสุขุมวิท', amount: 450, engineerStaff: 'พีรพล เกรียงไกร', docNo: 'LC-SR-2026-0045' },
        { id: 'exp-503', date: '2026-03-10', category: 'overtime', description: 'ค่า OT ตรวจสอบและลงนามส่งมอบงาน', amount: 2500, engineerStaff: 'พีรพล เกรียงไกร', docNo: 'LC-SR-2026-0045' }
      ]
    },
    createdAt: '2025-11-01T08:30:00.000Z',
    updatedAt: '2026-03-20T17:00:00.000Z'
  },
  {
    id: 'prj-006',
    projectCode: 'LC-PRJ-2026-122',
    soNumber: 'SO-690602',
    projectName: 'BDMS Wellness Clinic Resort Phuket',
    customerName: 'Bangkok Dusit Medical Services PLC',
    customerEmail: 'facilities.phuket@bdms.co.th',
    customerPhone: '076-361-000',
    engineerName: 'วรพงษ์ เจริญทรัพย์ (Eng. Art)',
    salesName: 'วรัญญา ลิ้มประเสริฐ (Sales May)',
    status: 'On Hold',
    location: 'หาดลายัน ถ.ศรีสุนทร เชิงทะเล ภูเก็ต',
    description: 'โคมไฟสระว่ายน้ำ Underwater IP68 และ Landscape Bollard Marine Grade ป้องกันไอทะเลและสนิม',
    startDate: '2026-03-01',
    targetDate: '2026-11-15',
    expenses: {
      fuelCost: 3500,
      tollCost: 0,
      hotelCost: 7500,
      overtimeCost: 4000,
      otherCost: 1200,
      expenseLogs: [
        { id: 'exp-601', date: '2026-03-18', category: 'hotel', description: 'ค่าที่พักวิศวกร 3 คืน ระหว่างสำรวจหน้างานภูเก็ต', amount: 7500, engineerStaff: 'วรพงษ์ เจริญทรัพย์', receiptRef: 'HTL-PK-881' },
        { id: 'exp-602', date: '2026-03-18', category: 'fuel', description: 'ค่าน้ำมันรถเช่าหน้างานภูเก็ต', amount: 3500, engineerStaff: 'วรพงษ์ เจริญทรัพย์' },
        { id: 'exp-603', date: '2026-03-19', category: 'overtime', description: 'ค่า OT สำรวจจุดติดตั้งสระว่ายน้ำยามค่ำคืน', amount: 4000, engineerStaff: 'วรพงษ์ เจริญทรัพย์' }
      ]
    },
    createdAt: '2026-03-01T09:00:00.000Z',
    updatedAt: '2026-04-03T11:20:00.000Z'
  }
];

export const INITIAL_REQUESTS: EngineerRequest[] = [
  {
    id: 'req-001',
    documentNo: 'LC-SR-2026-0042',
    serviceNo: 'SR-0129',
    dateRequest: '2026-03-28',
    revision: '1',
    projectId: 'prj-001',
    projectCode: 'LC-PRJ-2026-089',
    projectName: 'The Forestias - Forest Pavilion & Six Senses',
    soNumber: 'SO-690241',
    engNo: 'ENG-2026-058',
    priority: 'Urgent',
    customer: 'MQDC (คุณสมชาย ธนาทรัพย์)',
    customerEmail: 'somchai.t@mqdc.co.th',
    customerTel: '081-456-7890',
    location: 'อาคาร Forest Pavilion ชั้น Lobby และทางเดินป่า',
    salesInCharge: 'กัญญาภัทร ชาญวิทย์ (Sales Jane)',
    requester: 'คุณสมชาย ธนาทรัพย์ (Project PM)',
    engineerStaff: 'ธนากร ศรีสวัสดิ์ (Eng. Ton)',
    dueDate: '2026-04-05',
    needReport: true,
    needInstallGuide: true,
    status: 'In Progress',
    supportingDocs: {
      docTypes: {
        specSheet: true,
        drawing: true,
        boq: true,
        productList: true,
        photo: true,
        quotationSo: true,
        warranty: false,
        other: false,
        otherText: ''
      },
      attachmentStatus: 'Complete',
      missingDetails: 'ไม่มี - เอกสารครบถ้วน'
    },
    jobTypes: {
      onSite: true,
      meeting: true,
      service: false,
      mockUp: true,
      siteSurvey: false,
      installation: false,
      countDrawing: false,
      claim: false,
      qc: false,
      present: false,
      other: false,
      otherText: ''
    },
    requestDetails: 'ทดสอบติดตั้ง Mock-Up โคมไฟ Facade Wall Washer รุ่น LC-WW-36W-RGBW พร้อมร่วมประชุมกับ Interior Designer เพื่อตรวจเช็คการกระจายแสงและ Dimming curve ผ่านสัญญาณ DMX512 คอนโทรลเลอร์',
    reportedProblem: 'แสงที่กระทบผนังหินทราเวอร์ทีนเกิดเงาขรุขระ (hot spot) และระบบหรี่แสงช่วง 5% มีอาการวูบเล็กน้อย',
    findings: 'พบว่าระยะ Offset จากผนังเดิมอยู่ที่ 150mm ชิดเกินไป และใช้เลนส์ 15 องศาทำให้แสงแคบเกิด hot spot, ส่วนสัญญาณ DMX ขาด End Line Terminator 120 โอห์ม',
    correctiveAction: 'ปรับระยะ Offset เป็น 250mm และเปลี่ยนเลนส์ Asymmetric 15x45 องศา พร้อมติดตั้ง DMX Terminator 120 Ohm ที่จุดปลายสาย',
    workDetails: '1. เปลี่ยนชุดเลนส์ตัวอย่าง 3 ชุด\n2. ตั้งค่า RDM Addressing บน Lumencraft Tool\n3. ทดสอบการเปลี่ยนเฉดสี Dynamic 2700K ถึง 6500K\n4. บันทึกผลค่าความสว่าง Lux',
    photos: [
      {
        id: 'p-1',
        no: 1,
        description: 'ก่อนแก้ไข: ระยะ 150mm เลนส์แคบ เกิด Hot Spot ชัดเจน',
        fileRef: 'MOCKUP_BEFORE_01.JPG'
      },
      {
        id: 'p-2',
        no: 2,
        description: 'หลังเปลี่ยนเลนส์ Asymmetric 15x45deg และถอยระยะ 250mm แสงนุ่มสม่ำเสมอ',
        fileRef: 'MOCKUP_AFTER_02.JPG'
      },
      {
        id: 'p-3',
        no: 3,
        description: 'การเข้าหัวสายสัญญาณ DMX พร้อมตัวต้านทาน 120 Ohm Terminator',
        fileRef: 'DMX_TERMINATION_03.JPG'
      }
    ],
    parts: [
      {
        id: 'pt-1',
        no: 1,
        name: 'Lumencraft Asymmetric Lens Kit 15x45°',
        qty: '3 Sets',
        remark: 'สำหรับตัวอย่าง Mock-up'
      },
      {
        id: 'pt-2',
        no: 2,
        name: 'DMX 120 Ohm Bus Terminator PCB',
        qty: '1 Pcs',
        remark: 'ติดตั้งท้ายลูป'
      },
      {
        id: 'pt-3',
        no: 3,
        name: 'Adjustable Wall Bracket Extender 250mm',
        qty: '6 Pcs',
        remark: 'ขายึดผนังปรับระดับ'
      }
    ],
    measurements: [
      {
        id: 'm-1',
        item: 'Hot Spot Lux Level (กึ่งกลาง)',
        before: '850',
        after: '320',
        unit: 'Lux',
        remark: 'แสงสม่ำเสมอมากขึ้นตามเกณฑ์ดีไซน์เนอร์'
      },
      {
        id: 'm-2',
        item: 'Minimum Dimming Level (ไม่กะพริบ)',
        before: '8.5',
        after: '0.8',
        unit: '%',
        remark: 'ผ่านการทดสอบ DMX Smooth Curve'
      },
      {
        id: 'm-3',
        item: 'CRI (Ra) Color Rendering',
        before: '96.2',
        after: '96.4',
        unit: 'Ra',
        remark: 'ค่าความถูกต้องของสีระดับ Premium'
      }
    ],
    serviceResult: 'Completed',
    recommendationNextAction: 'ลูกค้ารับมอบและอนุมัติแบบ Mock-up เรียบร้อย ให้ฝ่ายขายเปิด PO ผลิตสินค้าจริงจำนวน 180 ชุดตามสเปกเลนส์ใหม่',
    nextServiceDue: '2026-05-15',
    followUpOwner: 'ธนากร ศรีสวัสดิ์ (Eng. Ton)',
    followUpRemark: 'ตรวจรับสินค้าล็อตแรกและตรวจการติดตั้งหน้างานจริง (Supervision)',
    followUpDetails: 'นัดหมายกับช่างไฟฟ้าผู้รับเหมา M&E เพื่อแนะนำขั้นตอนการเดินสาย DMX Daisy-chain',
    signOff: {
      engineer: {
        name: 'ธนากร ศรีสวัสดิ์',
        signed: true,
        signDate: '2026-03-29'
      },
      supervisor: {
        name: 'พีรพล เกรียงไกร',
        signed: true,
        signDate: '2026-03-29'
      },
      sales: {
        name: 'กัญญาภัทร ชาญวิทย์',
        signed: true,
        signDate: '2026-03-30'
      },
      customer: {
        name: 'สมชาย ธนาทรัพย์ (MQDC)',
        signed: true,
        signDate: '2026-03-30'
      }
    },
    createdAt: '2026-03-28T09:00:00.000Z',
    updatedAt: '2026-03-30T17:00:00.000Z'
  },
  {
    id: 'req-002',
    documentNo: 'LC-SR-2026-0043',
    serviceNo: 'SR-0130',
    dateRequest: '2026-03-30',
    revision: '0',
    projectId: 'prj-004',
    projectCode: 'LC-PRJ-2026-115',
    projectName: 'Dusit Central Park - Ultra Luxury Penthouse',
    soNumber: 'SO-690520',
    engNo: 'ENG-2026-061',
    priority: 'Normal',
    customer: 'Vimarn Suriya Co., Ltd.',
    customerEmail: 'procurement@dusitcentralpark.com',
    customerTel: '086-333-8899',
    location: 'สำนักงานผู้ออกแบบ และแบบแปลน CAD ฝ้าเพดาน',
    salesInCharge: 'วรัญญา ลิ้มประเสริฐ (Sales May)',
    requester: 'วรัญญา ลิ้มประเสริฐ (ฝ่ายขาย)',
    engineerStaff: 'ธนากร ศรีสวัสดิ์ (Eng. Ton)',
    dueDate: '2026-04-06',
    needReport: true,
    needInstallGuide: false,
    status: 'In Progress',
    supportingDocs: {
      docTypes: {
        specSheet: true,
        drawing: true,
        boq: true,
        productList: false,
        photo: false,
        quotationSo: false,
        warranty: false,
        other: false,
        otherText: ''
      },
      attachmentStatus: 'Attached',
      missingDetails: 'รอไฟล์ CAD Revision ล่าสุดโซน Terrace'
    },
    jobTypes: {
      onSite: false,
      meeting: false,
      service: false,
      mockUp: false,
      siteSurvey: false,
      installation: false,
      countDrawing: true, // นับแบบ
      claim: false,
      qc: false,
      present: false,
      other: false,
      otherText: ''
    },
    requestDetails: 'งานนับแบบ ถอดปริมาณโคมไฟ (Take-off / BOQ) จากไฟล์ Drawing งานระบบสถาปัตย์และไฟฟ้า ทั้งหมด 4 ยูนิต Penthouse ชั้น 45-48 แยกประเภทโคม Recessed Downlight, Trimless Linear, และ Magnetic Track System พร้อม Driver DALI-2',
    reportedProblem: '-',
    findings: 'พบว่ามีจุดโคมที่สัญลักษณ์ซ้ำซ้อนบริเวณห้อง Walk-in Closet 12 จุด ได้ทำการประสานงานเคลียร์แบบกับ Lighting Designer เรียบร้อย',
    correctiveAction: 'จัดทำตารางถอดแบบ Lumencraft BOQ Template และแยกโค้ดสินค้าตามโซนห้อง พร้อมสรุปกำลังไฟฟ้ารวม (Total Wattage / Circuit)',
    workDetails: '1. ตรวจเช็คแบบแปลน DWG ชั้น 45-48\n2. นับจำนวนโคมไฟทั้งหมด 486 จุด\n3. จัดเตรียมตาราง Lumencraft Schedule BOM\n4. ส่งมอบไฟล์ Excel BOQ ให้ฝ่ายขาย',
    photos: [
      {
        id: 'p-201',
        no: 1,
        description: 'ภาพแปลน DWG Penthouse โซน Living Room ที่ไฮไลต์วงจร DALI',
        fileRef: 'DWG_TAKEOFF_PH_45.PDF'
      }
    ],
    parts: [],
    measurements: [
      {
        id: 'm-201',
        item: 'Total Fixture Count (จำนวนโคมรวม)',
        before: '0',
        after: '486',
        unit: 'Points',
        remark: 'นับครบถ้วนทุกโซน 4 ยูนิต'
      },
      {
        id: 'm-202',
        item: 'Total DALI Drivers Required',
        before: '0',
        after: '142',
        unit: 'Units',
        remark: 'รวม Driver แยกอิสระตามลูป'
      }
    ],
    serviceResult: 'Completed',
    recommendationNextAction: 'ส่งมอบตาราง BOQ ให้เซลล์ May จัดทำใบเสนอราคา Quotation ส่งให้ลูกค้าต่อไป',
    nextServiceDue: '2026-04-10',
    followUpOwner: 'วรัญญา ลิ้มประเสริฐ (Sales May)',
    followUpRemark: 'ติดตามผลการพิจารณาใบเสนอราคา',
    followUpDetails: 'เตรียมตัวอย่างโคม Trimless สำหรับนัดเสนอลูกค้า',
    signOff: {
      engineer: {
        name: 'ธนากร ศรีสวัสดิ์',
        signed: true,
        signDate: '2026-04-01'
      },
      supervisor: {
        name: 'พีรพล เกรียงไกร',
        signed: true,
        signDate: '2026-04-01'
      },
      sales: {
        name: 'วรัญญา ลิ้มประเสริฐ',
        signed: false,
        signDate: ''
      },
      customer: {
        name: 'Vimarn Suriya Co., Ltd.',
        signed: false,
        signDate: ''
      }
    },
    createdAt: '2026-03-30T10:00:00.000Z',
    updatedAt: '2026-04-01T15:30:00.000Z'
  },
  {
    id: 'req-003',
    documentNo: 'LC-SR-2026-0044',
    serviceNo: 'SR-0131',
    dateRequest: '2026-04-01',
    revision: '0',
    projectId: 'prj-002',
    projectCode: 'LC-PRJ-2026-092',
    projectName: 'One Bangkok - Luxury Retail & Tower 3',
    soNumber: 'SO-690312',
    engNo: 'ENG-2026-063',
    priority: 'Critical',
    customer: 'Frasers Property (คุณอรพินท์)',
    customerEmail: 'orapin.p@onebangkok.com',
    customerTel: '089-771-2345',
    location: 'Tower 3 ชั้น G บริเวณทางเข้า Main Entrance',
    salesInCharge: 'ชลธิชา รัตนเวทย์ (Sales Bow)',
    requester: 'คุณอรพินท์ (Chief Facilities Manager)',
    engineerStaff: 'พีรพล เกรียงไกร (Eng. Paul)',
    dueDate: '2026-04-03',
    needReport: true,
    needInstallGuide: false,
    status: 'Open',
    supportingDocs: {
      docTypes: {
        specSheet: true,
        drawing: false,
        boq: false,
        productList: true,
        photo: true,
        quotationSo: true,
        warranty: true,
        other: false,
        otherText: ''
      },
      attachmentStatus: 'Complete',
      missingDetails: 'ครบถ้วน'
    },
    jobTypes: {
      onSite: true,
      meeting: false,
      service: true,
      mockUp: false,
      siteSurvey: false,
      installation: false,
      countDrawing: false,
      claim: true, // เคลม
      qc: true,    // QC
      present: false,
      other: false,
      otherText: ''
    },
    requestDetails: 'ตรวจสอบเคสเคลมด่วน (Claim & QC): โคมไฟ Inground Uplight IP67 รุ่น LC-UG-24W บริเวณทางเข้ามีน้ำซึมเข้าตัวโคม 3 ตัว และเบรกเกอร์ทริปช่วงฝนตกหนัก',
    reportedProblem: 'โคมไฟส่องต้นไม้ฝังพื้นด้านนอกอาคารดับ และมีหยดน้ำเกาะด้านในกระจกนิรภัย',
    findings: 'ตรวจสอบเบื้องต้นพบว่าท่อระบายน้ำทิ้งใต้โคม (Gravel Drainage) อุดตันจากเศษปูนก่อสร้าง ทำให้มีน้ำขังสูงเกินระดับ และไม่ได้ใส่ Silicone Gel ใน Junction Box',
    correctiveAction: '1. เคลียร์สิ่งอุดตันในบ่อระบายน้ำ\n2. เปลี่ยนชุดโคมไฟสำรองชุดใหม่ 3 ชุด\n3. ฉีดสาร Resin IP68 กันน้ำที่ข้อต่อสายไฟเคเบิลทั้งหมด',
    workDetails: 'จัดส่งทีมช่างเทคนิคและวิศวกรเข้าหน้างานในเวลา 09:00 น. ดำเนินการรื้อถอนโคมที่เสีย ตรวจเช็คค่าความเป็นฉนวน (Insulation Test) และเปลี่ยนชุดใหม่',
    photos: [
      {
        id: 'p-301',
        no: 1,
        description: 'โคม Inground ที่มีหยดน้ำเกาะภายในกระจก',
        fileRef: 'CLAIM_INGROUND_01.JPG'
      },
      {
        id: 'p-302',
        no: 2,
        description: 'บ่อเดรนระบายน้ำมีเศษปูนขวางทางน้ำไหล',
        fileRef: 'DRAIN_BLOCKAGE_02.JPG'
      }
    ],
    parts: [
      {
        id: 'pt-301',
        no: 1,
        name: 'Lumencraft Inground Uplight 24W 3000K IP67',
        qty: '3 Pcs',
        remark: 'สินค้าสำหรับเปลี่ยนเคลม'
      },
      {
        id: 'pt-302',
        no: 2,
        name: 'IP68 Gel Waterproof Connector Box',
        qty: '3 Sets',
        remark: 'ป้องกันน้ำซึม 100%'
      }
    ],
    measurements: [
      {
        id: 'm-301',
        item: 'Insulation Resistance Test (MΩ)',
        before: '0.05',
        after: '> 100',
        unit: 'MΩ',
        remark: 'หลังแก้ไขค่าความเป็นฉนวนสมบูรณ์ ไม่ทริป'
      }
    ],
    serviceResult: 'Completed',
    recommendationNextAction: 'ส่งมอบรายงานการเคลมและเน้นย้ำให้ฝ่ายอาคารตรวจสอบการระบายน้ำรอบตัวโคมอย่างสม่ำเสมอทุก 3 เดือน',
    nextServiceDue: '2026-07-01',
    followUpOwner: 'พีรพล เกรียงไกร (Eng. Paul)',
    followUpRemark: 'ตรวจเช็คตามรอบบำรุงรักษา Routine Maintenance',
    followUpDetails: 'ตรวจเช็คซีลยางและสภาพกระจกหน้าโคม',
    signOff: {
      engineer: {
        name: 'พีรพล เกรียงไกร',
        signed: true,
        signDate: '2026-04-02'
      },
      supervisor: {
        name: 'ธนากร ศรีสวัสดิ์',
        signed: true,
        signDate: '2026-04-02'
      },
      sales: {
        name: 'ชลธิชา รัตนเวทย์',
        signed: true,
        signDate: '2026-04-02'
      },
      customer: {
        name: 'คุณอรพินท์ (Frasers Property)',
        signed: true,
        signDate: '2026-04-02'
      }
    },
    createdAt: '2026-04-01T08:30:00.000Z',
    updatedAt: '2026-04-02T16:00:00.000Z'
  },
  {
    id: 'req-004',
    documentNo: 'LC-SR-2026-0045',
    serviceNo: 'SR-0132',
    dateRequest: '2026-04-02',
    revision: '0',
    projectId: 'prj-003',
    projectCode: 'LC-PRJ-2026-104',
    projectName: 'Sindhorn Kempinski Hotel & Residences Phase 2',
    soNumber: 'SO-690455',
    engNo: 'ENG-2026-065',
    priority: 'Urgent',
    customer: 'Siam Sindhorn Co., Ltd.',
    customerEmail: 'm&e.director@siam-sindhorn.com',
    customerTel: '02-650-9900',
    location: 'ห้อง Grand Ballroom ชั้น 2 และโถง Pre-function',
    salesInCharge: 'กัญญาภัทร ชาญวิทย์ (Sales Jane)',
    requester: 'คุณธวัชชัย (M&E Consultant)',
    engineerStaff: 'วรพงษ์ เจริญทรัพย์ (Eng. Art)',
    dueDate: '2026-04-08',
    needReport: true,
    needInstallGuide: true,
    status: 'Open',
    supportingDocs: {
      docTypes: {
        specSheet: true,
        drawing: true,
        boq: false,
        productList: true,
        photo: false,
        quotationSo: false,
        warranty: false,
        other: false,
        otherText: ''
      },
      attachmentStatus: 'Pending',
      missingDetails: 'รอตาราง Scene Setting จากทีม Lighting Consultant'
    },
    jobTypes: {
      onSite: true,
      meeting: true,
      service: false,
      mockUp: false,
      siteSurvey: true, // Site Survey
      installation: true, // Installation
      countDrawing: false,
      claim: false,
      qc: false,
      present: true, // Present
      other: false,
      otherText: ''
    },
    requestDetails: 'Site Survey สำรวจหน้างานและควบคุมงานติดตั้ง (Installation Supervision) พร้อมบรรยายนำเสนอ (Present) การตั้งค่าโปรแกรมควบคุมแสงสว่าง DALI Scene Controller 4 โหมด (Conference, Gala Dinner, Ambient, Cleaning)',
    reportedProblem: '-',
    findings: 'โครงสร้างฝ้าเพดานสูง 8 เมตร มีจุดติดตั้ง Driver ในตู้ MDB ระยะสายไกลเกิน 150 เมตร อาจส่งผลต่อสัญญาณตก (Voltage Drop)',
    correctiveAction: 'แนะนำให้เพิ่มขนาดสายไฟ Control จาก 1.5 sq.mm เป็น 2.5 sq.mm และติดตั้ง DALI Repeater เพิ่ม 2 ตัว',
    workDetails: '1. เดินสำรวจแนวท่อ Conduit สายสัญญาณ\n2. ให้คำแนะนำผู้รับเหมาในการเชื่อมต่อระบบ DALI\n3. จัดเตรียมสไลด์และเครื่องมือสำหรับการ Present ระบบ',
    photos: [],
    parts: [],
    measurements: [],
    serviceResult: '',
    recommendationNextAction: 'รอทีมช่างติดตั้งสายตามคำแนะนำ และนัดหมายวันเข้า Commissioning ระบบสัปดาห์หน้า',
    nextServiceDue: '2026-04-12',
    followUpOwner: 'วรพงษ์ เจริญทรัพย์ (Eng. Art)',
    followUpRemark: 'เข้า Commissioning & Scene Programming จริง',
    followUpDetails: 'นำเครื่องมือ DALI USB Interface และคอมพิวเตอร์เข้าตั้งโปรแกรม',
    signOff: {
      engineer: {
        name: 'วรพงษ์ เจริญทรัพย์',
        signed: false,
        signDate: ''
      },
      supervisor: {
        name: 'พีรพล เกรียงไกร',
        signed: false,
        signDate: ''
      },
      sales: {
        name: 'กัญญาภัทร ชาญวิทย์',
        signed: false,
        signDate: ''
      },
      customer: {
        name: 'Siam Sindhorn Co., Ltd.',
        signed: false,
        signDate: ''
      }
    },
    createdAt: '2026-04-02T11:00:00.000Z',
    updatedAt: '2026-04-02T11:00:00.000Z'
  },
  {
    id: 'req-005',
    documentNo: 'LC-SR-2026-0046',
    serviceNo: 'SR-0133',
    dateRequest: '2026-04-03',
    revision: '0',
    projectId: 'prj-006',
    projectCode: 'LC-PRJ-2026-122',
    projectName: 'BDMS Wellness Clinic Resort Phuket',
    soNumber: 'SO-690602',
    engNo: 'ENG-2026-068',
    priority: 'Normal',
    customer: 'BDMS Phuket Facilities',
    customerEmail: 'facilities.phuket@bdms.co.th',
    customerTel: '076-361-000',
    location: 'สระว่ายน้ำ Hydrotherapy Pool และทางเดินชายหาด',
    salesInCharge: 'วรัญญา ลิ้มประเสริฐ (Sales May)',
    requester: 'คุณกิตติศักดิ์ (หัวหน้างานวิศวกรรมอาคาร)',
    engineerStaff: 'วรพงษ์ เจริญทรัพย์ (Eng. Art)',
    dueDate: '2026-04-15',
    needReport: true,
    needInstallGuide: true,
    status: 'Open',
    supportingDocs: {
      docTypes: {
        specSheet: true,
        drawing: true,
        boq: false,
        productList: true,
        photo: false,
        quotationSo: false,
        warranty: true,
        other: false,
        otherText: ''
      },
      attachmentStatus: 'Complete',
      missingDetails: 'ครบถ้วน'
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
      qc: true, // QC
      present: false,
      other: false,
      otherText: ''
    },
    requestDetails: 'ตรวจรับคุณภาพสินค้า QC Inspection ก่อนส่งมอบ: โคมไฟใต้น้ำสแตนเลส Marine Grade 316L รุ่น LC-UW-18W-RGBW จำนวน 45 ชุด ทดสอบแรงดันน้ำ IP68 และการทนการกัดกร่อนของสารคลอรีน/น้ำเกลือ',
    reportedProblem: '-',
    findings: 'การตรวจสอบในห้องแล็บ QC ผ่านเกณฑ์มาตรฐานทุกชุด ไม่มีฟองอากาศในซีลเรซิ่น',
    correctiveAction: 'ออกเอกสารใบรับรอง QC Pass Certificate พร้อมแนบในกล่องสินค้า',
    workDetails: '1. ทดสอบ Pressure Tank 3 บาร์ ต่อเนื่อง 48 ชม.\n2. ทดสอบ Burn-in เปิดต่อเนื่อง 24 ชม.\n3. สุ่มวัดค่าความสว่างและสเปกตรัมสี CCT',
    photos: [],
    parts: [],
    measurements: [
      {
        id: 'm-501',
        item: 'Hydrostatic Pressure Test (Bar)',
        before: '0',
        after: '3.0',
        unit: 'Bar',
        remark: 'ผ่านเกณฑ์ IP68 100%'
      },
      {
        id: 'm-502',
        item: 'Burn-in Test Duration (Hours)',
        before: '0',
        after: '24',
        unit: 'Hrs',
        remark: 'อุณหภูมิผิวโคมปกติ 38°C'
      }
    ],
    serviceResult: 'Completed',
    recommendationNextAction: 'จัดส่งสินค้าให้ทางโครงการตามกำหนดการขนส่งทางอากาศ',
    nextServiceDue: '2026-04-20',
    followUpOwner: 'วรัญญา ลิ้มประเสริฐ (Sales May)',
    followUpRemark: 'ติดตามการรับสินค้าของลูกค้าที่ภูเก็ต',
    followUpDetails: 'ส่งใบรับประกัน Warranty 5 ปี ให้ลูกค้า',
    signOff: {
      engineer: {
        name: 'วรพงษ์ เจริญทรัพย์',
        signed: true,
        signDate: '2026-04-03'
      },
      supervisor: {
        name: 'พีรพล เกรียงไกร',
        signed: true,
        signDate: '2026-04-03'
      },
      sales: {
        name: 'วรัญญา ลิ้มประเสริฐ',
        signed: false,
        signDate: ''
      },
      customer: {
        name: 'BDMS Phuket',
        signed: false,
        signDate: ''
      }
    },
    createdAt: '2026-04-03T09:30:00.000Z',
    updatedAt: '2026-04-03T14:00:00.000Z'
  }
];
