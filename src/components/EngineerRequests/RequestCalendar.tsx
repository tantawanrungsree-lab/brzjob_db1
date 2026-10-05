import React, { useState } from 'react';
import { EngineerRequest, JobTypeKey, JOB_TYPE_CONFIG } from '../../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, User, FileText } from 'lucide-react';

interface RequestCalendarProps {
  requests: EngineerRequest[];
  onSelectRequest: (req: EngineerRequest) => void;
}

export const RequestCalendar: React.FC<RequestCalendarProps> = ({
  requests,
  onSelectRequest
}) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026 as base anchor for our demo date 2026-10 / 2026-04

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'มกราคม (January)', 'กุมภาพันธ์ (February)', 'มีนาคม (March)', 
    'เมษายน (April)', 'พฤษภาคม (May)', 'มิถุนายน (June)',
    'กรกฎาคม (July)', 'สิงหาคม (August)', 'กันยายน (September)',
    'ตุลาคม (October)', 'พฤศจิกายน (November)', 'ธันวาคม (December)'
  ];

  // Days in month
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDay }, (_, i) => i);

  const getRequestsForDay = (day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return requests.filter(r => r.dueDate === dayStr || r.dateRequest === dayStr);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 sm:p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold font-heading">
              ตารางนัดหมาย & ปฏิทินงานวิศวกรรม (Engineer Service Schedule)
            </h2>
            <p className="text-xs text-slate-400">
              กำหนดการ On Site, Meeting, Mock-Up, Site Survey, Installation, นับแบบ, Claim, QC
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-4 py-1.5 rounded-lg bg-slate-800 font-semibold text-xs text-amber-300 font-mono-data">
            {monthNames[month]} {year}
          </div>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold text-slate-600 py-2.5">
        <span className="text-rose-600">อา. (Sun)</span>
        <span>จ. (Mon)</span>
        <span>อ. (Tue)</span>
        <span>พ. (Wed)</span>
        <span>พฤ. (Thu)</span>
        <span>ศ. (Fri)</span>
        <span className="text-blue-600">ส. (Sat)</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200 bg-slate-100 min-h-[520px]">
        {/* Empty cells before month starts */}
        {blankDays.map((_, i) => (
          <div key={`blank-${i}`} className="bg-slate-50/50 min-h-[90px] p-2" />
        ))}

        {/* Calendar days */}
        {daysArray.map((day) => {
          const dayRequests = getRequestsForDay(day);
          const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

          return (
            <div
              key={day}
              className={`bg-white min-h-[90px] p-2 transition-colors hover:bg-slate-50 flex flex-col justify-between ${
                isToday ? 'ring-2 ring-amber-400 inset-0' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-mono-data font-semibold ${isToday ? 'text-amber-600' : 'text-slate-800'}`}>
                  {day}
                </span>
                {dayRequests.length > 0 && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono-data">
                    {dayRequests.length} งาน
                  </span>
                )}
              </div>

              {/* Request Cards inside calendar cell */}
              <div className="space-y-1 overflow-y-auto max-h-[80px]">
                {dayRequests.map((req) => {
                  // find active job types
                  const activeJobTypes = (Object.keys(JOB_TYPE_CONFIG) as JobTypeKey[]).filter(k => req.jobTypes[k]);
                  const firstJob = activeJobTypes[0] || 'other';
                  const cfg = JOB_TYPE_CONFIG[firstJob];

                  return (
                    <button
                      key={req.id}
                      onClick={() => onSelectRequest(req)}
                      className={`w-full text-left p-1 rounded text-[10px] transition-transform hover:scale-[1.02] border ${cfg.badgeClass} block truncate`}
                      title={`${req.documentNo} - ${req.projectName} (${req.engineerStaff})`}
                    >
                      <div className="font-semibold truncate">{req.projectName}</div>
                      <div className="flex items-center gap-1 text-[9px] opacity-80 truncate">
                        <span>{req.engineerStaff.split(' ')[0]}</span>
                        <span>•</span>
                        <span>{cfg.labelEn}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
