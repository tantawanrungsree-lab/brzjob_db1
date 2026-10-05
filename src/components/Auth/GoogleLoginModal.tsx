import React, { useState } from 'react';
import { X, Mail, Shield, CheckCircle2, Sparkles, User, AlertCircle, LogIn } from 'lucide-react';
import { AppUser, signInWithGoogle, signInWithDirectGmail } from '../../services/auth';

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AppUser) => void;
}

export const GoogleLoginModal: React.FC<GoogleLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState<AppUser['role']>('Engineer');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const user = await signInWithGoogle();
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ Google');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) {
      setErrorMsg('กรุณากรอกอีเมล Gmail ของคุณ');
      return;
    }
    try {
      setLoading(true);
      setErrorMsg(null);
      const user = await signInWithDirectGmail(customEmail, customName || undefined, customRole);
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const presetAccounts = [
    {
      name: 'Tantawan Rungsree (Admin / Lead)',
      email: 'tantawanrungsree@gmail.com',
      role: 'Admin' as const,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'
    },
    {
      name: 'ธนากร ศรีสวัสดิ์ (Eng. Ton)',
      email: 'ton.lumencraft@gmail.com',
      role: 'Engineer' as const,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80'
    },
    {
      name: 'กัญญาภัทร ชาญวิทย์ (Sales Jane)',
      email: 'jane.sales.lumencraft@gmail.com',
      role: 'Sales' as const,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="fixed inset-0 z-70 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                เข้าสู่ระบบ (Sign In)
              </h3>
              <p className="text-xs text-slate-400">
                LUMENCRAFT ENGINEERING PORTAL
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Google Login Button */}
          <div>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-2xl text-slate-800 font-bold text-sm flex items-center justify-center gap-3 shadow-sm transition-all hover:shadow active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google / Gmail'}</span>
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              เชื่อมต่ออัตโนมัติกับฐานข้อมูล Firebase Cloud เดียวกันแบบเรียลไทม์
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">หรือเลือกบัญชีด่วน</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Preset Quick Logins */}
          <div className="space-y-2">
            {presetAccounts.map((acc) => (
              <button
                key={acc.email}
                onClick={async () => {
                  setLoading(true);
                  const user = await signInWithDirectGmail(acc.email, acc.name, acc.role);
                  onLoginSuccess(user);
                  setLoading(false);
                  onClose();
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <img src={acc.avatar} alt={acc.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-slate-900">{acc.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{acc.email}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  acc.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                  acc.role === 'Sales' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {acc.role}
                </span>
              </button>
            ))}
          </div>

          {/* Custom Gmail Form */}
          <details className="group pt-2">
            <summary className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer list-none flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <span>+ กรอกอีเมล Gmail อื่น ๆ</span>
              <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            
            <form onSubmit={handleDirectSignIn} className="mt-3 space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">อีเมล Gmail *</label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="your.name@gmail.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-mono focus:ring-2 focus:ring-amber-400 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อ-สกุล</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="สมชาย ใจดี"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ตำแหน่ง / สิทธิ์</label>
                  <select
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                  >
                    <option value="Engineer">Engineer (วิศวกร)</option>
                    <option value="Sales">Sales (ฝ่ายขาย)</option>
                    <option value="Supervisor">Supervisor (หัวหน้างาน)</option>
                    <option value="Admin">Admin (ผู้ดูแลระบบ)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
              >
                เข้าสู่ระบบด้วยอีเมลนี้
              </button>
            </form>
          </details>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Lumencraft Engineering Portal • ข้อมูลเชื่อมต่อ Cloud Database ตัวเดียวกันทุกบัญชี
        </div>

      </div>
    </div>
  );
};
