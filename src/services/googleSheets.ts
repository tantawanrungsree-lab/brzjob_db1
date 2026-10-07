import { Project, EngineerRequest } from '../types';
import { mergeRequestCollections, mergeProjectCollections, saveProjects, saveRequests } from '../utils/storage';

export interface GoogleSheetsSyncResult {
  success: boolean;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  updatedRequestsCount?: number;
  updatedProjectsCount?: number;
  updatedPhotosCount?: number;
  mergedRequests?: EngineerRequest[];
  mergedProjects?: Project[];
  error?: string;
}

export const MASTER_SHEET_TITLE = 'Lumencraft Engineering & Project Hub - Master Database';
const MASTER_SHEET_KEY = 'lumencraft_master_google_spreadsheet_id_v1';

/**
 * Get stored master spreadsheet ID or default
 */
export function getStoredSpreadsheetId(): string | null {
  return localStorage.getItem(MASTER_SHEET_KEY);
}

/**
 * Store spreadsheet ID
 */
export function setStoredSpreadsheetId(id: string): void {
  localStorage.setItem(MASTER_SHEET_KEY, id);
}

/**
 * Get web URL for a spreadsheet ID
 */
export function getSpreadsheetUrl(spreadsheetId: string): string {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
}

/**
 * Searches Google Drive for an existing master database spreadsheet named 'Lumencraft Engineering & Project Hub - Master Database'
 * This allows ANY Gmail login across ANY device to automatically find and connect to the exact same Master Google Sheet!
 */
export async function findMasterSpreadsheetInDrive(accessToken: string): Promise<{ id: string; name: string; url: string } | null> {
  try {
    const query = encodeURIComponent(`name = '${MASTER_SHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`);
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink,createdTime,modifiedTime)&orderBy=modifiedTime desc`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        const file = data.files[0];
        setStoredSpreadsheetId(file.id);
        return {
          id: file.id,
          name: file.name,
          url: file.webViewLink || getSpreadsheetUrl(file.id)
        };
      }
    }
  } catch (err) {
    console.warn('Google Drive search notice:', err);
  }
  return null;
}

/**
 * Automatically discovers, links, or creates the Unified Master Database Google Sheet
 */
export async function getOrFindMasterSpreadsheetId(accessToken: string): Promise<string> {
  // 1. Check local storage key
  const storedId = getStoredSpreadsheetId();
  if (storedId) {
    try {
      const checkRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${storedId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (checkRes.ok) {
        return storedId;
      }
    } catch (e) {
      // Continue to search
    }
  }

  // 2. Search Drive for existing "Lumencraft Engineering & Project Hub - Master Database"
  const foundInDrive = await findMasterSpreadsheetInDrive(accessToken);
  if (foundInDrive) {
    return foundInDrive.id;
  }

  // 3. If not found in Drive, create new master spreadsheet
  return await createMasterSpreadsheet(accessToken);
}

/**
 * Formats a photo URL as an embedded Google Sheets cell formula
 * '=IMAGE("URL", 1)' automatically locks and scales the image neatly inside the cell
 */
export function formatImageFormula(imageUrl?: string): string {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('data:image')) {
    // Return placeholder indicator for base64
    return '[รูปภาพแนบ Base64 / Stored in Web]';
  }
  return `=IMAGE("${imageUrl}", 1)`;
}

/**
 * Create a new master Google Sheet with predefined locked columns, proper heights, and tabs
 */
export async function createMasterSpreadsheet(accessToken: string): Promise<string> {
  const createPayload = {
    properties: {
      title: MASTER_SHEET_TITLE,
      locale: 'th_TH',
      timeZone: 'Asia/Bangkok'
    },
    sheets: [
      {
        properties: {
          sheetId: 0,
          title: 'คำของานวิศวกรรม (Engineer Requests)',
          gridProperties: {
            frozenRowCount: 1,
            frozenColumnCount: 2,
            rowCount: 500,
            columnCount: 26
          }
        }
      },
      {
        properties: {
          sheetId: 1,
          title: 'ตารางโครงการ (Master Projects)',
          gridProperties: {
            frozenRowCount: 1,
            frozenColumnCount: 2,
            rowCount: 500,
            columnCount: 18
          }
        }
      },
      {
        properties: {
          sheetId: 2,
          title: 'คลังรูปภาพหลักฐาน (Photos Evidence)',
          gridProperties: {
            frozenRowCount: 1,
            frozenColumnCount: 2,
            rowCount: 500,
            columnCount: 8
          }
        }
      }
    ]
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(createPayload)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Google Sheets API error: ${response.statusText}`);
  }

  const data = await response.json();
  const newId = data.spreadsheetId;
  setStoredSpreadsheetId(newId);
  return newId;
}

/**
 * Configure locked column dimensions, row heights, and header styling via batchUpdate
 */
export async function formatSpreadsheetLayout(spreadsheetId: string, accessToken: string): Promise<void> {
  const requests = [
    // 1. Format Requests Sheet Column Dimensions
    {
      updateDimensionProperties: {
        range: {
          sheetId: 0,
          dimension: 'COLUMNS',
          startIndex: 0,
          endIndex: 26
        },
        properties: {
          pixelSize: 140
        },
        fields: 'pixelSize'
      }
    },
    // Set Document No & Project Name widths
    {
      updateDimensionProperties: {
        range: {
          sheetId: 0,
          dimension: 'COLUMNS',
          startIndex: 0,
          endIndex: 2
        },
        properties: {
          pixelSize: 170
        },
        fields: 'pixelSize'
      }
    },
    // Set Photo columns width (locked to 180px for clear thumbnail rendering)
    {
      updateDimensionProperties: {
        range: {
          sheetId: 0,
          dimension: 'COLUMNS',
          startIndex: 20,
          endIndex: 24
        },
        properties: {
          pixelSize: 180
        },
        fields: 'pixelSize'
      }
    },
    // Set Row Heights in Requests Sheet for Image rows (75px for comfortable photo view)
    {
      updateDimensionProperties: {
        range: {
          sheetId: 0,
          dimension: 'ROWS',
          startIndex: 1,
          endIndex: 300
        },
        properties: {
          pixelSize: 75
        },
        fields: 'pixelSize'
      }
    },
    // 2. Format Photos Sheet (Locked column width 220px and row height 110px for crisp photo galleries)
    {
      updateDimensionProperties: {
        range: {
          sheetId: 2,
          dimension: 'COLUMNS',
          startIndex: 4,
          endIndex: 6
        },
        properties: {
          pixelSize: 220
        },
        fields: 'pixelSize'
      }
    },
    {
      updateDimensionProperties: {
        range: {
          sheetId: 2,
          dimension: 'ROWS',
          startIndex: 1,
          endIndex: 300
        },
        properties: {
          pixelSize: 110
        },
        fields: 'pixelSize'
      }
    },
    // Header Style: Dark Navy background (#0f172a), bold white text for Requests Header
    {
      repeatCell: {
        range: {
          sheetId: 0,
          startRowIndex: 0,
          endRowIndex: 1
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.06, green: 0.09, blue: 0.16 }, // Slate 900
            textFormat: {
              foregroundColor: { red: 1, green: 1, blue: 1 },
              bold: true,
              fontSize: 10
            },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
            wrapStrategy: 'WRAP'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)'
      }
    },
    // Header Style: Amber / Slate Navy for Projects Header
    {
      repeatCell: {
        range: {
          sheetId: 1,
          startRowIndex: 0,
          endRowIndex: 1
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.12, green: 0.18, blue: 0.28 }, // Dark Slate Blue
            textFormat: {
              foregroundColor: { red: 1, green: 1, blue: 1 },
              bold: true,
              fontSize: 10
            },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
            wrapStrategy: 'WRAP'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)'
      }
    },
    // Header Style: Dark Indigo for Photos Evidence Header
    {
      repeatCell: {
        range: {
          sheetId: 2,
          startRowIndex: 0,
          endRowIndex: 1
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.18, green: 0.15, blue: 0.35 },
            textFormat: {
              foregroundColor: { red: 1, green: 1, blue: 1 },
              bold: true,
              fontSize: 10
            },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
            wrapStrategy: 'WRAP'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)'
      }
    }
  ];

  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });
  } catch (err) {
    console.warn('Google Sheets Layout formatting note:', err);
  }
}

/**
 * Parses a JobTypes string from sheet column into JobTypes object
 */
function parseJobTypes(text: string): EngineerRequest['jobTypes'] {
  const t = (text || '').toLowerCase();
  return {
    onSite: t.includes('on site'),
    meeting: t.includes('meeting'),
    service: t.includes('service'),
    mockUp: t.includes('mock-up') || t.includes('mockup'),
    siteSurvey: t.includes('site survey') || t.includes('survey'),
    installation: t.includes('installation') || t.includes('install'),
    countDrawing: t.includes('นับแบบ') || t.includes('drawing'),
    claim: t.includes('claim'),
    qc: t.includes('qc'),
    present: t.includes('present'),
    other: t.includes('other'),
    otherText: ''
  };
}

/**
 * Fetch all rows from an existing Google Sheet to prevent data loss
 */
export async function fetchSpreadsheetData(
  spreadsheetId: string,
  accessToken: string
): Promise<{ requests: EngineerRequest[]; projects: Project[] }> {
  try {
    const rangeParams = encodeURIComponent("'คำของานวิศวกรรม (Engineer Requests)'!A2:Z500") +
      '&ranges=' + encodeURIComponent("'ตารางโครงการ (Master Projects)'!A2:R500");

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=${rangeParams}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      return { requests: [], projects: [] };
    }

    const data = await response.json();
    const valueRanges = data.valueRanges || [];

    // Parse Requests
    const requestRows: any[][] = valueRanges[0]?.values || [];
    const parsedRequests: EngineerRequest[] = [];

    requestRows.forEach((row) => {
      const docNo = row[0]?.toString()?.trim();
      if (!docNo) return; // Skip blank rows

      const req: EngineerRequest = {
        id: `req_sheet_${docNo.replace(/[^a-zA-Z0-9]/g, '_')}`,
        documentNo: docNo,
        serviceNo: row[1]?.toString() || '',
        dateRequest: row[2]?.toString() || '',
        revision: '00',
        requestCategory: row[3]?.toString()?.toLowerCase()?.includes('internal') ? 'internal' : 'customer',
        projectId: '',
        projectCode: row[6]?.toString() || '',
        projectName: row[7]?.toString() || '',
        soNumber: row[8]?.toString() || '',
        engNo: '',
        priority: (row[4]?.toString() as any) || 'Normal',
        customer: row[9]?.toString() || '',
        customerEmail: '',
        customerTel: row[10]?.toString() || '',
        location: row[11]?.toString() || '',
        salesInCharge: row[12]?.toString() || '',
        requester: row[13]?.toString() || '',
        engineerStaff: row[14]?.toString() || '',
        dueDate: row[16]?.toString() || '',
        needReport: true,
        needInstallGuide: false,
        status: (row[5]?.toString() as any) || 'Open',
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
        jobTypes: parseJobTypes(row[17]?.toString() || ''),
        requestDetails: row[18]?.toString() || '',
        reportedProblem: '',
        findings: '',
        correctiveAction: '',
        workDetails: row[18]?.toString() || '',
        photos: [],
        parts: [],
        measurements: [],
        serviceResult: (row[19]?.toString() as any) || '',
        recommendationNextAction: '',
        nextServiceDue: '',
        followUpOwner: '',
        followUpRemark: '',
        followUpDetails: '',
        signOff: {
          engineer: { name: row[14]?.toString() || '', signed: false, signDate: '' },
          supervisor: { name: '', signed: false, signDate: '' },
          sales: { name: row[12]?.toString() || '', signed: false, signDate: '' },
          customer: { name: row[9]?.toString() || '', signed: false, signDate: '' }
        },
        onSiteDate: row[15]?.toString() || '',
        deliveryDate: row[16]?.toString() || '',
        rejectionReason: row[24]?.toString() || '',
        createdAt: row[25]?.toString() || new Date().toISOString(),
        updatedAt: row[25]?.toString() || new Date().toISOString()
      };

      parsedRequests.push(req);
    });

    // Parse Projects
    const projectRows: any[][] = valueRanges[1]?.values || [];
    const parsedProjects: Project[] = [];

    projectRows.forEach((row) => {
      const pCode = row[0]?.toString()?.trim();
      if (!pCode) return;

      const fuel = parseFloat(row[12]) || 0;
      const toll = parseFloat(row[13]) || 0;
      const hotel = parseFloat(row[14]) || 0;
      const ot = parseFloat(row[15]) || 0;

      const proj: Project = {
        id: `proj_sheet_${pCode.replace(/[^a-zA-Z0-9]/g, '_')}`,
        projectCode: pCode,
        soNumber: row[1]?.toString() || '',
        projectName: row[2]?.toString() || '',
        customerName: row[3]?.toString() || '',
        customerPhone: row[4]?.toString() || '',
        customerEmail: row[5]?.toString() || '',
        engineerName: row[6]?.toString() || '',
        salesName: row[7]?.toString() || '',
        status: (row[8]?.toString() as any) || 'On Track',
        location: row[9]?.toString() || '',
        startDate: row[10]?.toString() || '',
        targetDate: row[11]?.toString() || '',
        expenses: {
          fuelCost: fuel,
          tollCost: toll,
          hotelCost: hotel,
          overtimeCost: ot,
          otherCost: 0
        },
        createdAt: row[17]?.toString() || new Date().toISOString(),
        updatedAt: row[17]?.toString() || new Date().toISOString()
      };

      parsedProjects.push(proj);
    });

    return { requests: parsedRequests, projects: parsedProjects };
  } catch (err) {
    console.warn('Failed to fetch existing spreadsheet rows:', err);
    return { requests: [], projects: [] };
  }
}

/**
 * Synchronizes all Requests, Projects, and Image attachments into the Google Spreadsheet
 * NON-DESTRUCTIVE: Always preserves existing records in both local storage and Google Sheet
 */
export async function syncAllToGoogleSheets(
  projects: Project[],
  requests: EngineerRequest[],
  accessToken: string,
  targetSpreadsheetId?: string
): Promise<GoogleSheetsSyncResult> {
  try {
    let sheetId = targetSpreadsheetId || (await getOrFindMasterSpreadsheetId(accessToken));

    // Test if spreadsheet exists & accessible
    const testRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!testRes.ok) {
      console.warn('Existing spreadsheet unreachable, creating/finding master spreadsheet...');
      sheetId = await getOrFindMasterSpreadsheetId(accessToken);
    }

    // 0. Non-destructive protection: Read existing sheet data first to prevent erasing any rows
    const existingSheetData = await fetchSpreadsheetData(sheetId, accessToken);
    
    // Non-destructively merge incoming with existing sheet data
    const { merged: finalMergedRequests } = mergeRequestCollections(requests, existingSheetData.requests);
    const { merged: finalMergedProjects } = mergeProjectCollections(projects, existingSheetData.projects);

    // Save back to local storage cache to keep webapp perfectly synced
    saveRequests(finalMergedRequests);
    saveProjects(finalMergedProjects);

    // 1. Prepare Header and Rows for Engineer Requests
    const requestHeaders = [
      'เลขที่เอกสาร (Document No)',
      'Service No',
      'วันที่ขอ (Date Request)',
      'ประเภทคำขอ (Category)',
      'ความเร่งด่วน (Priority)',
      'สถานะ (Status)',
      'รหัสโครงการ (Project Code)',
      'ชื่อโครงการ (Project Name)',
      'เลขที่ SO (SO Number)',
      'ลูกค้า (Customer Name)',
      'เบอร์โทรลูกค้า (Tel)',
      'สถานที่ (Location)',
      'เซลล์ผู้ดูแล (Sales)',
      'ผู้ร้องขอ (Requester)',
      'วิศวกรผู้รับผิดชอบ (Engineer Staff)',
      'วันเข้าหน้างาน (On-Site Date)',
      'กำหนดส่งงาน (Due Date)',
      'ประเภทงาน (Job Types)',
      'รายละเอียดงาน (Request Details)',
      'ผลการดำเนินงาน (Service Result)',
      'รูปภาพ 1 (Photo Preview)',
      'รูปภาพ 2 (Photo Preview)',
      'รูปภาพ 3 (Photo Preview)',
      'รูปภาพ 4 (Photo Preview)',
      'เหตุผลปฏิเสธ (Rejection Reason)',
      'อัปเดตล่าสุด (Updated At)'
    ];

    const requestRows = finalMergedRequests.map(r => {
      // Collect selected job types
      const selectedJobs: string[] = [];
      if (r.jobTypes) {
        if (r.jobTypes.onSite) selectedJobs.push('On Site');
        if (r.jobTypes.meeting) selectedJobs.push('Meeting');
        if (r.jobTypes.service) selectedJobs.push('Service');
        if (r.jobTypes.mockUp) selectedJobs.push('Mock-Up');
        if (r.jobTypes.siteSurvey) selectedJobs.push('Site Survey');
        if (r.jobTypes.installation) selectedJobs.push('Installation');
        if (r.jobTypes.countDrawing) selectedJobs.push('นับแบบ');
        if (r.jobTypes.claim) selectedJobs.push('Claim');
        if (r.jobTypes.qc) selectedJobs.push('QC');
        if (r.jobTypes.present) selectedJobs.push('Present');
        if (r.jobTypes.other) selectedJobs.push(`Other (${r.jobTypes.otherText || ''})`);
      }

      // Photos formatted with =IMAGE formula
      const photo1 = r.photos?.[0]?.imageUrl ? formatImageFormula(r.photos[0].imageUrl) : '';
      const photo2 = r.photos?.[1]?.imageUrl ? formatImageFormula(r.photos[1].imageUrl) : '';
      const photo3 = r.photos?.[2]?.imageUrl ? formatImageFormula(r.photos[2].imageUrl) : '';
      const photo4 = r.photos?.[3]?.imageUrl ? formatImageFormula(r.photos[3].imageUrl) : '';

      return [
        r.documentNo || '',
        r.serviceNo || '',
        r.dateRequest || '',
        r.requestCategory === 'internal' ? 'Internal Request' : 'Customer Request',
        r.priority || 'Normal',
        r.status || 'Open',
        r.projectCode || '',
        r.projectName || '',
        r.soNumber || '',
        r.customer || '',
        r.customerTel || '',
        r.location || '',
        r.salesInCharge || '',
        r.requester || '',
        r.engineerStaff || '',
        r.onSiteDate || '',
        r.dueDate || r.deliveryDate || '',
        selectedJobs.join(', '),
        r.requestDetails || r.workDetails || '',
        r.serviceResult || '',
        photo1,
        photo2,
        photo3,
        photo4,
        r.rejectionReason || '',
        r.updatedAt || new Date().toISOString()
      ];
    });

    // 2. Prepare Header and Rows for Master Projects
    const projectHeaders = [
      'รหัสโครงการ (Project Code)',
      'เลขที่ SO (SO Number)',
      'ชื่อโครงการ (Project Name)',
      'ชื่อลูกค้า (Customer)',
      'เบอร์โทรลูกค้า (Tel)',
      'อีเมลลูกค้า (Email)',
      'วิศวกรผู้ดูแล (Engineer)',
      'เซลล์ผู้ดูแล (Sales)',
      'สถานะโครงการ (Status)',
      'สถานที่ตั้ง (Location)',
      'วันที่เริ่ม (Start Date)',
      'เป้าหมายส่งมอบ (Target Date)',
      'ค่าน้ำมัน (Fuel)',
      'ค่าทางด่วน (Toll)',
      'ค่าที่พัก (Hotel)',
      'ค่าล่วงเวลา (OT)',
      'ค่าใช้จ่ายรวม (Total Expenses THB)',
      'อัปเดตล่าสุด (Updated At)'
    ];

    const projectRows = finalMergedProjects.map(p => {
      const fuel = p.expenses?.fuelCost || 0;
      const toll = p.expenses?.tollCost || 0;
      const hotel = p.expenses?.hotelCost || 0;
      const ot = p.expenses?.overtimeCost || 0;
      const other = p.expenses?.otherCost || 0;
      const totalExp = fuel + toll + hotel + ot + other;

      return [
        p.projectCode || '',
        p.soNumber || '',
        p.projectName || '',
        p.customerName || '',
        p.customerPhone || '',
        p.customerEmail || '',
        p.engineerName || '',
        p.salesName || '',
        p.status || 'On Track',
        p.location || '',
        p.startDate || '',
        p.targetDate || '',
        fuel,
        toll,
        hotel,
        ot,
        totalExp,
        p.updatedAt || new Date().toISOString()
      ];
    });

    // 3. Prepare Header and Rows for Photo Gallery & Attachments
    const photoHeaders = [
      'เลขที่คำขอ (Document No)',
      'ชื่อโครงการ (Project Name)',
      'ลำดับภาพ (Image No)',
      'คำอธิบายภาพ (Description)',
      'รูปภาพแสดงผล (Image Preview Locked Cell)',
      'URL ต้นฉบับ (Image Source URL)',
      'วันที่บันทึก (Timestamp)'
    ];

    const photoRows: (string | number)[][] = [];
    finalMergedRequests.forEach(r => {
      if (r.photos && r.photos.length > 0) {
        r.photos.forEach((ph, idx) => {
          if (ph.imageUrl) {
            photoRows.push([
              r.documentNo || '',
              r.projectName || '',
              ph.no || (idx + 1),
              ph.description || ph.fileRef || `หลักฐานที่ ${idx + 1}`,
              formatImageFormula(ph.imageUrl),
              ph.imageUrl,
              r.updatedAt || r.createdAt || new Date().toISOString()
            ]);
          }
        });
      }
    });

    // 4. Batch Update Values to Google Sheets
    const valueData = [
      {
        range: "'คำของานวิศวกรรม (Engineer Requests)'!A1:Z500",
        values: [requestHeaders, ...requestRows]
      },
      {
        range: "'ตารางโครงการ (Master Projects)'!A1:R500",
        values: [projectHeaders, ...projectRows]
      },
      {
        range: "'คลังรูปภาพหลักฐาน (Photos Evidence)'!A1:G500",
        values: [photoHeaders, ...photoRows]
      }
    ];

    // Write all preserved and merged rows
    const writeResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: valueData
      })
    });

    if (!writeResponse.ok) {
      const err = await writeResponse.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to write values: ${writeResponse.statusText}`);
    }

    // Apply layout and formatting styles
    await formatSpreadsheetLayout(sheetId, accessToken);

    return {
      success: true,
      spreadsheetId: sheetId,
      spreadsheetUrl: getSpreadsheetUrl(sheetId),
      updatedRequestsCount: finalMergedRequests.length,
      updatedProjectsCount: finalMergedProjects.length,
      updatedPhotosCount: photoRows.length,
      mergedRequests: finalMergedRequests,
      mergedProjects: finalMergedProjects
    };
  } catch (err: any) {
    console.error('Google Sheets Sync Error:', err);
    return {
      success: false,
      error: err.message || 'Google Sheets sync failed'
    };
  }
}

/**
 * Automatically fetches from the shared Master Spreadsheet and merges into app state
 * Ensuring all Gmail logins and devices see the exact same unified dataset
 */
export async function autoPullAndMergeMasterSpreadsheet(
  accessToken: string,
  currentProjects: Project[],
  currentRequests: EngineerRequest[]
): Promise<{
  success: boolean;
  spreadsheetId: string;
  spreadsheetUrl: string;
  projects: Project[];
  requests: EngineerRequest[];
}> {
  const sheetId = await getOrFindMasterSpreadsheetId(accessToken);
  const sheetData = await fetchSpreadsheetData(sheetId, accessToken);

  const { merged: mergedReqs, unsyncedToCloud: unsyncedReqs } = mergeRequestCollections(currentRequests, sheetData.requests);
  const { merged: mergedProjs, unsyncedToCloud: unsyncedProjs } = mergeProjectCollections(currentProjects, sheetData.projects);

  saveRequests(mergedReqs);
  saveProjects(mergedProjs);

  // If local had unsynced records or sheet was blank, push back so everyone has it
  if (unsyncedReqs.length > 0 || unsyncedProjs.length > 0) {
    await syncAllToGoogleSheets(mergedProjs, mergedReqs, accessToken, sheetId);
  }

  return {
    success: true,
    spreadsheetId: sheetId,
    spreadsheetUrl: getSpreadsheetUrl(sheetId),
    projects: mergedProjs,
    requests: mergedReqs
  };
}
