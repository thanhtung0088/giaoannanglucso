
import React from 'react';

interface AdvancedOptionsProps {
  analyzeOnly: boolean;
  includeReport: boolean;
  onUpdate: (field: string, val: boolean) => void;
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({ analyzeOnly, includeReport, onUpdate }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
      <div className="flex items-center mb-6">
        <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <h2 className="text-lg font-bold text-blue-900">Tùy chọn nâng cao</h2>
      </div>
      
      <div className="flex flex-wrap gap-x-12 gap-y-4">
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={analyzeOnly}
            onChange={(e) => onUpdate('analyzeOnly', e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition cursor-pointer" 
          />
          <span className="text-slate-700 text-sm font-medium group-hover:text-blue-600 transition">Chỉ phân tích, không chỉnh sửa</span>
        </label>
        
        <label className="flex items-center space-x-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={includeReport}
            onChange={(e) => onUpdate('includeReport', e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition cursor-pointer" 
          />
          <span className="text-slate-700 text-sm font-medium group-hover:text-blue-600 transition">Kèm báo cáo chi tiết</span>
        </label>
      </div>
    </div>
  );
};

export default AdvancedOptions;
