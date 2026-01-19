import React from 'react';
// Đường dẫn chính xác: ra khỏi components -> vào types -> file types
import { LessonPlanInfo } from '../types/types'; 

interface UploadSectionProps {
  planFile: File | null;
  curriculumFile: File | null;
  onUpdate: (field: string, file: File | null) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ planFile, curriculumFile, onUpdate }) => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-8 bg-[#0047ab] rounded-full"></div>
        <h3 className="text-xl font-black text-gray-800 uppercase tracking-wider">Tài liệu đầu vào hệ thống</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative group p-6 border-2 border-dashed border-gray-100 rounded-3xl hover:border-blue-200 transition-all bg-gray-50/30">
          <label className="block text-[11px] font-black text-red-500 uppercase tracking-[0.2em] mb-4">* File giáo án (Bắt buộc)</label>
          <input 
            type="file" 
            onChange={(e) => onUpdate('planFile', e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
          />
          <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">.DOCX, .PDF</p>
        </div>

        <div className="relative group p-6 border-2 border-dashed border-gray-100 rounded-3xl hover:border-blue-200 transition-all bg-gray-50/30">
          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">PPCT (Tùy chọn)</label>
          <input 
            type="file"
            onChange={(e) => onUpdate('curriculumFile', e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" 
          />
          <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Không bắt buộc</p>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;