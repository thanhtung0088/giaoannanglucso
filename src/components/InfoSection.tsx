
import React from 'react';
import { Subject, Grade } from '../types';

interface InfoSectionProps {
  subject: string;
  grade: string;
  onUpdate: (field: string, val: string) => void;
}

const InfoSection: React.FC<InfoSectionProps> = ({ subject, grade, onUpdate }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="w-1 h-6 bg-blue-600 rounded-full mr-3 shadow-sm"></div>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Thông tin Kế hoạch bài dạy</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Môn học đào tạo</label>
          <select 
            value={subject}
            onChange={(e) => onUpdate('subject', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all cursor-pointer"
          >
            {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Khối lớp thực hiện</label>
          <select 
            value={grade}
            onChange={(e) => onUpdate('grade', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all cursor-pointer"
          >
            {Object.values(Grade).map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
