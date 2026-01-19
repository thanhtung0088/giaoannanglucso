import React from 'react';

interface AdvancedOptionsProps {
  analyzeOnly: boolean;
  includeReport: boolean;
  onUpdate: (field: string, value: boolean) => void;
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({ analyzeOnly, includeReport, onUpdate }) => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-8 bg-[#0047ab] rounded-full"></div>
        <h3 className="text-xl font-black text-gray-800 uppercase tracking-wider">Tùy chọn nâng cao</h3>
      </div>

      <div className="space-y-4">
        <label className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
          <input 
            type="checkbox" 
            checked={analyzeOnly}
            onChange={(e) => onUpdate('analyzeOnly', e.target.checked)}
            className="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-500 border-gray-300" 
          />
          <span className="text-sm font-bold text-gray-700">Chỉ phân tích nội dung (Không soạn mới)</span>
        </label>

        <label className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
          <input 
            type="checkbox" 
            checked={includeReport}
            onChange={(e) => onUpdate('includeReport', e.target.checked)}
            className="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-500 border-gray-300" 
          />
          <span className="text-sm font-bold text-gray-700">Bao gồm báo cáo năng lực số chi tiết</span>
        </label>
      </div>
    </div>
  );
};

export default AdvancedOptions;