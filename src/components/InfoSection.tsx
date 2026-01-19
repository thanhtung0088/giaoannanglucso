import React from 'react';
// Chú ý: ../types hướng ra ngoài thư mục components để vào thư mục src
import { Subject, Grade } from '../types'; 

interface InfoSectionProps {
  subject: Subject;
  grade: Grade;
  onUpdate: (field: string, value: any) => void;
}

const InfoSection: React.FC<InfoSectionProps> = ({ subject, grade, onUpdate }) => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-8 bg-[#0047ab] rounded-full"></div>
        <h3 className="text-xl font-black text-gray-800 uppercase tracking-wider">Thông tin kế hoạch bài dạy</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Môn học đào tạo</label>
          <select 
            value={subject}
            onChange={(e) => onUpdate('subject', e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-100 text-gray-700 py-4 px-6 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-[#0047ab] outline-none transition-all font-bold appearance-none cursor-pointer"
          >
            {Object.values(Subject).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Khối lớp thực hiện</label>
          <select 
            value={grade}
            onChange={(e) => onUpdate('grade', e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-100 text-gray-700 py-4 px-6 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-[#0047ab] outline-none transition-all font-bold appearance-none cursor-pointer"
          >
            {Object.values(Grade).map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;