
import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Quick Instruction Box */}
      <div className="bg-blue-900 text-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-6">Hướng dẫn nhanh</h3>
        <ul className="space-y-6">
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 flex items-center justify-center rounded-full text-xs font-bold mr-3 mt-0.5">1</span>
            <p className="text-sm opacity-90 leading-relaxed">Chọn môn học và khối lớp.</p>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 flex items-center justify-center rounded-full text-xs font-bold mr-3 mt-0.5">2</span>
            <p className="text-sm opacity-90 leading-relaxed"><span className="font-bold">Bắt buộc:</span> Tải lên file giáo án (.docx hoặc .pdf).</p>
          </li>
          <li className="flex items-start">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 flex items-center justify-center rounded-full text-xs font-bold mr-3 mt-0.5">3</span>
            <p className="text-sm opacity-90 leading-relaxed"><span className="italic">Tùy chọn:</span> Tải file PPCT nếu muốn AI tham khảo năng lực cụ thể của trường.</p>
          </li>
        </ul>
      </div>

      {/* Digital Competencies Box */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-blue-900 mb-6">Miền năng lực số</h3>
        <ul className="space-y-4">
          {["Khai thác dữ liệu và thông tin", "Giao tiếp và Hợp tác", "Sáng tạo nội dung số", "An toàn số", "Giải quyết vấn đề", "Ứng dụng AI"].map((item, idx) => (
            <li key={idx} className="flex items-center text-slate-600 text-sm">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3"></span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
