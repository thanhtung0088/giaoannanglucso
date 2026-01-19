
import React from 'react';

interface UploadSectionProps {
  planFile: File | null;
  curriculumFile: File | null;
  onUpdate: (field: string, file: File | null) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ planFile, curriculumFile, onUpdate }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="w-1 h-6 bg-blue-600 rounded-full mr-3 shadow-sm"></div>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Tài liệu đầu vào</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group relative border-2 border-dashed border-blue-50 rounded-2xl p-6 bg-blue-50/10 hover:bg-blue-50 hover:border-blue-300 transition-all text-center">
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => onUpdate('planFile', e.target.files?.[0] || null)} />
          <p className="text-sm font-black text-slate-700 uppercase mb-1">Tải lên Giáo án</p>
          <p className="text-[10px] text-slate-400 uppercase">Bắt buộc (.docx, .pdf)</p>
          {planFile && <div className="mt-2 text-[10px] font-bold text-green-600">✓ {planFile.name.substring(0, 15)}...</div>}
        </div>

        <div className="group relative border-2 border-dashed border-slate-50 rounded-2xl p-6 bg-slate-50/30 hover:bg-slate-50 hover:border-blue-200 transition-all text-center">
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => onUpdate('curriculumFile', e.target.files?.[0] || null)} />
          <p className="text-sm font-black text-slate-700 uppercase mb-1">Tải lên PPCT</p>
          <p className="text-[10px] text-slate-400 uppercase">Tùy chọn</p>
          {curriculumFile && <div className="mt-2 text-[10px] font-bold text-blue-600">✓ {curriculumFile.name.substring(0, 15)}...</div>}
        </div>
      </div>
    </div>
  );
};

export default UploadSection;
