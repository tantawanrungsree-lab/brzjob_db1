import React, { useState, useEffect } from 'react';
import { 
  X, Sheet, ExternalLink, RefreshCw, CheckCircle2, AlertCircle, 
  Layers, Image as ImageIcon, Lock, ShieldCheck, Database, Search, DownloadCloud, Trash2
} from 'lucide-react';
import { Project, EngineerRequest } from '../types';
import { 
  syncAllToGoogleSheets, 
  fetchSpreadsheetData,
  findMasterSpreadsheetInDrive,
  getOrFindMasterSpreadsheetId,
  getStoredSpreadsheetId, 
  setStoredSpreadsheetId,
  getSpreadsheetUrl,
  MASTER_SHEET_TITLE
} from '../services/googleSheets';
import { getGoogleAccessToken, signInWithGoogle, AppUser } from '../services/auth';
import { mergeRequestCollections, mergeProjectCollections, saveProjects, saveRequests, resetAllData } from '../utils/storage';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  requests: EngineerRequest[];
  currentUser: AppUser | null;
  onLoginSuccess: (user: AppUser) => void;
  onDataSynced?: (projects: Project[], requests: EngineerRequest[]) => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  projects,
  requests,
  currentUser,
  onLoginSuccess,
  onDataSynced
}) => {
  const [spreadsheetId, setSpreadsheetId] = useState(getStoredSpreadsheetId() || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSearchingDrive, setIsSearchingDrive] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastSyncedUrl, setLastSyncedUrl] = useState<string | null>(
    getStoredSpreadsheetId() ? getSpreadsheetUrl(getStoredSpreadsheetId()!) : null
  );

  useEffect(() => {
    const currentId = getStoredSpreadsheetId();
    if (currentId) {
      setSpreadsheetId(currentId);
      setLastSyncedUrl(getSpreadsheetUrl(currentId));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Search Drive for 'Lumencraft Engineering & Project Hub - Master Database'
  const handleSearchDrive = async () => {
    try {
      setIsSearchingDrive(true);
      setStatusMessage('กำลังค้นหาไฟล์ Master Database ใน Google Drive...');
      
      let token = getGoogleAccessToken();
      if (!token) {
        const authResult = await signInWithGoogle();
        token = authResult.accessToken || getGoogleAccessToken();
        onLoginSuccess(authResult.user);
      }

      if (!token) throw new Error('กรุณาลงชื่อเข้าใช้ Google เพื่อค้นหา Drive');

      const found = await findMasterSpreadsheetInDrive(token);
      if (found) {
        setSpreadsheetId(found.id);
        setStoredSpreadsheetId(found.id);
        setLastSyncedUrl(found.url);
        setSyncStatus('success');
        setStatusMessage(`พบ Master Database: "${found.name}" (ID: ${found.id})`);
      } else {
        setSyncStatus('idle');
        setStatusMessage(`ยังไม่พบไฟล์ "${MASTER_SHEET_TITLE}" ใน Drive ระบบจะสร้างให้ใหม่เมื่อกดซิงค์`);
      }
    } catch (err: any) {
      setSyncStatus('error');
      setStatusMessage(err.message || 'ไม่สามารถค้นหา Google Drive ได้');
    } finally {
      setIsSearchingDrive(false);
    }
  };

  // Pull data from Google Sheet to Web
  const handlePullFromSheets = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus('idle');
      setStatusMessage('กำลังดึงข้อมูลทั้งหมดจาก Master Google Sheet...');

      let token = getGoogleAccessToken();
      if (!token) {
        const authResult = await signInWithGoogle();
        token = authResult.accessToken || getGoogleAccessToken();
        onLoginSuccess(authResult.user);
      }

      if (!token) throw new Error('กรุณาลงชื่อเข้าใช้ Google เพื่อดึงข้อมูล');

      const targetId = spreadsheetId.trim() || (await getOrFindMasterSpreadsheetId(token));
      const sheetData = await fetchSpreadsheetData(targetId, token);

      const { merged: mergedReqs } = mergeRequestCollections(requests, sheetData.requests);
      const { merged: mergedProjs } = mergeProjectCollections(projects, sheetData.projects);

      saveRequests(mergedReqs);
      saveProjects(mergedProjs);

      if (onDataSynced) {
        onDataSynced(mergedProjs, mergedReqs);
      }

      setSpreadsheetId(targetId);
      setStoredSpreadsheetId(targetId);
      setLastSyncedUrl(getSpreadsheetUrl(targetId));
      setSyncStatus('success');
      setStatusMessage(`ดึงข้อมูลสำเร็จ: พบ ${sheetData.requests.length} คำขอ และ ${sheetData.projects.length} โครงการใน Google Sheet ผสานเข้าสู่หน้าเว็บเรียบร้อย`);
    } catch (err: any) {
      setSyncStatus('error');
      setStatusMessage(err.message || 'ไม่สามารถดึงข้อมูลจาก Google Sheets ได้');
    } finally {
      setIsSyncing(false);
    }
  };

  // Push & Merge data into Google Sheet
  const handleSyncToSheets = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus('idle');
      setStatusMessage(null);

      let token = getGoogleAccessToken();

      // If no token available, prompt user to sign in with Google
      if (!token) {
        setStatusMessage('กำลังเชื่อมต่อสิทธิ์เข้าถึง Google Workspace...');
        const authResult = await signInWithGoogle();
        token = authResult.accessToken || getGoogleAccessToken();
        onLoginSuccess(authResult.user);
      }

      if (!token) {
        throw new Error('กรุณาลงชื่อเข้าใช้ด้วย Google เพื่ออนุญาตการบันทึกข้อมูลลง Google Sheet');
      }

      setStatusMessage('กำลังจัดส่งข้อมูลคำขอ โครงการ และรูปภาพแบบล็อกคอลลั่มลง Master Google Sheet...');
      const result = await syncAllToGoogleSheets(projects, requests, token, spreadsheetId.trim() || undefined);

      if (result.success && result.spreadsheetId) {
        setSpreadsheetId(result.spreadsheetId);
        setStoredSpreadsheetId(result.spreadsheetId);
        setLastSyncedUrl(result.spreadsheetUrl || getSpreadsheetUrl(result.spreadsheetId));
        setSyncStatus('success');
        setStatusMessage(`บันทึกข้อมูลและผสานเรียบร้อย: ${result.updatedRequestsCount} คำขอ, ${result.updatedProjectsCount} โครงการ, ${result.updatedPhotosCount} รูปภาพ (ข้อมูลเก่าไม่สูญหาย)`);
        
        if (result.mergedProjects && result.mergedRequests && onDataSynced) {
          onDataSynced(result.mergedProjects, result.mergedRequests);
        }
      } else {
        setSyncStatus('error');
        setStatusMessage(result.error || 'เกิดข้อผิดพลาดในการบันทึก Google Sheet');
      }
    } catch (err: any) {
      setSyncStatus('error');
      setStatusMessage(err.message || 'ไม่สามารถเชื่อมต่อ Google Sheets API ได้');
    } finally {
      setIsSyncing(false);
    }
  };

  // Clear all data in both Google Sheet and Local State
  const handleClearAllDataInSheetAndSystem = async () => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลเก่าทั้งหมดออกจาก Google Sheet และระบบ? ข้อมูลจะถูกล้างใหม่ทั้งหมด')) {
      return;
    }

    try {
      setIsSyncing(true);
      setSyncStatus('idle');
      setStatusMessage('กำลังล้างข้อมูลเก่าทั้งหมดออกจากระบบและ Google Sheet...');

      const reset = resetAllData();
      if (onDataSynced) {
        onDataSynced(reset.projects, reset.requests);
      }

      let token = getGoogleAccessToken();
      if (!token) {
        const authResult = await signInWithGoogle();
        token = authResult.accessToken || getGoogleAccessToken();
        onLoginSuccess(authResult.user);
      }

      if (token) {
        const targetId = spreadsheetId.trim() || getStoredSpreadsheetId() || undefined;
        await syncAllToGoogleSheets([], [], token, targetId, { isDirectWrite: true });
      }

      setSyncStatus('success');
      setStatusMessage('✓ ลบข้อมูลเก่าทั้งหมดออกจาก Google Sheet และระบบเรียบร้อยแล้ว');
    } catch (err: any) {
      setSyncStatus('error');
      setStatusMessage(err.message || 'เกิดข้อผิดพลาดในการล้างข้อมูล');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-70 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-xl w-full border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-emerald-950 text-white p-6 relative border-b border-emerald-800">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-emerald-300 hover:text-white rounded-xl hover:bg-emerald-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Sheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-xl text-white">
                  Google Sheets Master Database
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/30 font-bold">
                  UNIFIED DATA
                </span>
              </div>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                {MASTER_SHEET_TITLE}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Key Features Banner */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <Database className="w-5 h-5 mx-auto text-emerald-700 mb-1" />
              <div className="text-[11px] font-bold text-emerald-950">ฐานข้อมูลก้อนเดียว</div>
              <div className="text-[10px] text-emerald-700">ทุก Login เมล์เข้าถึงร่วมกัน</div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-center">
              <Lock className="w-5 h-5 mx-auto text-blue-700 mb-1" />
              <div className="text-[11px] font-bold text-blue-950">ล็อกคอลลั่มรูปภาพ</div>
              <div className="text-[10px] text-blue-700">ขนาดพอดี ไม่ล้นช่อง</div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center">
              <ShieldCheck className="w-5 h-5 mx-auto text-amber-700 mb-1" />
              <div className="text-[11px] font-bold text-amber-950">เข้าใช้ด้วย Gmail</div>
              <div className="text-[10px] text-amber-700">ยืนยันสิทธิ์ปลอดภัย 100%</div>
            </div>
          </div>

          {/* Connected Spreadsheet Info */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Google Spreadsheet ID (Master Database)</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSearchDrive}
                  disabled={isSearchingDrive}
                  className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  title="ค้นหาไฟล์ Master Database ใน Google Drive อัตโนมัติ"
                >
                  <Search className={`w-3.5 h-3.5 ${isSearchingDrive ? 'animate-spin' : ''}`} />
                  <span>ค้นหาใน Drive</span>
                </button>

                {lastSyncedUrl && (
                  <a
                    href={lastSyncedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>เปิด Google Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <input
              type="text"
              value={spreadsheetId}
              onChange={(e) => {
                setSpreadsheetId(e.target.value);
                setStoredSpreadsheetId(e.target.value);
                if (e.target.value) setLastSyncedUrl(getSpreadsheetUrl(e.target.value));
              }}
              placeholder="เว้นว่างไว้เพื่อให้ระบบค้นหาหรือสร้าง Master Sheet ให้อัตโนมัติ"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <p className="text-[11px] text-slate-500">
              * ข้อมูลที่ซิงค์จะแยก 3 แผ่นงาน: <b>คำของานวิศวกรรม</b>, <b>ตารางโครงการ</b>, และ <b>คลังรูปภาพหลักฐาน</b> (พร้อมสูตรล็อกภาพ <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">=IMAGE()</code>)
            </p>
          </div>

          {/* Status Alert */}
          {statusMessage && (
            <div className={`p-4 rounded-2xl text-xs flex items-start gap-2.5 ${
              syncStatus === 'success' 
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                : syncStatus === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}>
              {syncStatus === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : syncStatus === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{statusMessage}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={handleClearAllDataInSheetAndSystem}
              disabled={isSyncing}
              className="py-3 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50 cursor-pointer"
              title="ลบข้อมูลเก่าทั้งหมดออกจาก Google Sheet และระบบ เพื่อเริ่มใช้งานชุดข้อมูลใหม่"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>ล้างข้อมูลเก่าทั้งหมด</span>
            </button>

            <button
              onClick={handlePullFromSheets}
              disabled={isSyncing}
              className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl shadow transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
              title="ดึงข้อมูลจาก Master Sheet กลับมาแสดงผลบนหน้าเว็บ"
            >
              <DownloadCloud className={`w-4 h-4 text-amber-400 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span>ดึงข้อมูลจาก Sheet</span>
            </button>

            <button
              onClick={handleSyncToSheets}
              disabled={isSyncing}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'กำลังประมวลผล...' : 'บันทึก & ผสาน Master Sheet'}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>เข้าใช้งานด้วย: {currentUser?.email || 'เข้าใช้แบบสาธารณะ'}</span>
          <span className="font-semibold text-slate-600">Lumencraft Unified Database</span>
        </div>

      </div>
    </div>
  );
};
