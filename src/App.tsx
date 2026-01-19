import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

const App: React.FC = () => {
  const [subject, setSubject] = useState("Toán");
  const [grade, setGrade] = useState("Lớp 10");
  const [planFile, setPlanFile] = useState<File | null>(null);
  const [ppctFile, setPpctFile] = useState<File | null>(null);
  const [isAnalyzeOnly, setIsAnalyzeOnly] = useState(false);
  const [isIncludeReport, setIsIncludeReport] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultText, setResultText] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: any) => {
    if (e.target.files) setter(e.target.files[0]);
  };

  const processFile = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const handleStart = async () => {
    if (!planFile) return alert("Vui lòng tải lên file Giáo án!");
    
    setIsProcessing(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const planContent = await processFile(planFile);
      let prompt = `Bạn là chuyên gia giáo dục. Hãy soạn giáo án môn ${subject} ${grade} dựa trên nội dung: ${planContent}. 
                    Yêu cầu: Tích hợp các năng lực số (khai thác dữ liệu, an toàn số, ứng dụng AI).`;
      
      if (isAnalyzeOnly) prompt += " Chỉ phân tích ưu nhược điểm, không soạn lại.";
      if (isIncludeReport) prompt += " Kèm theo báo cáo chi tiết về mức độ đáp ứng năng lực số.";

      const result = await model.generateContent(prompt);
      setResultText(result.response.text());
    } catch (error) {
      alert("Lỗi kết nối AI. Vui lòng kiểm tra API Key!");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Top Header */}
      <div className="bg-thcs-blue text-white py-3 px-6 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg">🎓</div>
          <span className="font-bold uppercase tracking-wider text-sm">Soạn giáo án năng lực số - By Nguyễn Thanh Tùng</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="bg-blue-800 px-3 py-1 rounded-full text-blue-200">POWERED BY GEMINI AI</span>
          <button className="text-white opacity-80">⚙️</button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-thcs-blue to-thcs-dark text-white p-8 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <img src="https://upload.wikimedia.org/wikipedia/commons/d/d4/Logo-hcm-2.png" className="w-20 h-20 bg-white rounded-full p-1" alt="Logo" />
          <div>
            <h1 className="text-2xl font-black text-yellow-400">Chào mừng quý thầy cô!</h1>
            <p className="text-sm font-bold opacity-90 uppercase tracking-widest">THCS BÌNH HÒA - VỮNG BƯỚC TƯƠNG LAI</p>
          </div>
        </div>
        <div className="bg-white/10 border border-white/20 px-6 py-2 rounded-xl text-xl font-black">
          NĂM HỌC 2025 - 2026
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Section 1: Thông tin bài dạy */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-blue-700 font-black uppercase text-xs mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-700 block"></span> Thông tin kế hoạch bài dạy
            </h2>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Môn học đào tạo</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border-b-2 border-gray-100 py-2 focus:border-blue-500 outline-none font-bold">
                  <option>Toán</option><option>Văn</option><option>Anh</option><option>Tin học</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Khối lớp thực hiện</label>
                <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full border-b-2 border-gray-100 py-2 focus:border-blue-500 outline-none font-bold">
                  <option>Lớp 10</option><option>Lớp 11</option><option>Lớp 12</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Tài liệu đầu vào */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-blue-700 font-black uppercase text-xs mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-700 block"></span> Tài liệu đầu vào
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="border-2 border-dashed border-gray-100 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all">
                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, setPlanFile)} />
                <span className="text-xs font-black text-gray-500">{planFile ? planFile.name : "TẢI LÊN GIÁO ÁN"}</span>
                <span className="text-[10px] text-gray-300 uppercase mt-1">Bắt buộc (.docx, .pdf)</span>
              </label>
              <label className="border-2 border-dashed border-gray-100 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all">
                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, setPpctFile)} />
                <span className="text-xs font-black text-gray-500">{ppctFile ? ppctFile.name : "TẢI LÊN PPCT"}</span>
                <span className="text-[10px] text-gray-300 uppercase mt-1">Tùy chọn</span>
              </label>
            </div>
          </div>

          {/* Section 3: Tùy chọn */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-10">
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={isAnalyzeOnly} onChange={() => setIsAnalyzeOnly(!isAnalyzeOnly)} className="w-4 h-4" />
              <label className="text-xs font-bold text-gray-600">Chỉ phân tích, không chỉnh sửa</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={isIncludeReport} onChange={() => setIsIncludeReport(!isIncludeReport)} className="w-4 h-4" />
              <label className="text-xs font-bold text-gray-600">Kèm báo cáo chi tiết</label>
            </div>
          </div>

          {/* Button Bắt đầu */}
          <button 
            onClick={handleStart}
            disabled={isProcessing}
            className="w-full bg-thcs-blue hover:bg-thcs-dark text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3"
          >
            {isProcessing ? "🔄 HỆ THỐNG ĐANG XỬ LÝ..." : "▲ BẮT ĐẦU SOẠN GIÁO ÁN"}
          </button>

          {/* Kết quả AI */}
          {resultText && (
            <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-blue-600 animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-blue-900 uppercase">KẾT QUẢ GIÁO ÁN NĂNG LỰC SỐ</h3>
                <button onClick={() => saveAs(new Blob([resultText]), "GiaoAn.txt")} className="bg-green-600 text-white px-4 py-2 rounded-lg text-[10px] font-bold">TẢI FILE WORD</button>
              </div>
              <div className="prose max-w-none text-sm leading-relaxed whitespace-pre-wrap">{resultText}</div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-thcs-dark text-white p-6 rounded-2xl shadow-lg">
            <h3 className="font-black uppercase text-xs mb-4">Hướng dẫn nhanh</h3>
            <ul className="space-y-4 text-xs font-bold opacity-90">
              <li className="flex gap-3"><span className="bg-white text-thcs-dark w-5 h-5 flex items-center justify-center rounded-full">1</span> Chọn môn học và khối lớp.</li>
              <li className="flex gap-3"><span className="bg-white text-thcs-dark w-5 h-5 flex items-center justify-center rounded-full">2</span> Tải giáo án gốc lên hệ thống.</li>
              <li className="flex gap-3"><span className="bg-white text-thcs-dark w-5 h-5 flex items-center justify-center rounded-full">3</span> Nhấn bắt đầu và đợi kết quả.</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-blue-700 font-black uppercase text-xs mb-4">Miền năng lực số</h3>
            <div className="space-y-2">
              {["Khai thác dữ liệu", "Giao tiếp & Hợp tác", "Sáng tạo nội dung", "An toàn số", "Giải quyết vấn đề"].map(item => (
                <div key={item} className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;