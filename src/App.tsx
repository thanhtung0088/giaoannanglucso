import React, { useState, useRef } from 'react';
import Header from './components/Header';
import InfoSection from './components/InfoSection';
import UploadSection from './components/UploadSection';
import Sidebar from './components/Sidebar';
import AdvancedOptions from './components/AdvancedOptions';
import ChatBox from './components/ChatBox';
import { Subject, Grade, LessonPlanInfo } from './types/types';
import { GoogleGenerativeAI } from "@google/generative-ai";

const App: React.FC = () => {
  // 1. Quản lý trạng thái thông tin giáo án
  const [info, setInfo] = useState<LessonPlanInfo>({
    subject: Subject.TOAN,
    grade: Grade.LOP_10,
    planFile: null,
    curriculumFile: null,
    analyzeOnly: false,
    includeReport: false,
  });

  // 2. Quản lý trạng thái xử lý và giao diện (Logo)
  const [isProcessing, setIsProcessing] = useState(false);
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // 3. Hàm mở cấu hình API Key (Nếu môi trường hỗ trợ)
  const handleOpenApiKey = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    } else {
      alert("Tính năng chọn API Key đang được chuẩn bị hoặc hãy thiết lập trong file .env / Vercel.");
    }
  };

  // 4. Xử lý thay đổi Logo trường học
  const handleLogoClick = () => logoInputRef.current?.click();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSchoolLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 5. Hàm xử lý chính: Soạn giáo án với Gemini AI
  const handleProcess = async () => {
    if (!info.planFile) {
      alert("Vui lòng tải lên File Giáo án!");
      return;
    }

    setIsProcessing(true);
    try {
      // Lấy API Key từ biến môi trường của Vite
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
      
      if (!apiKey) {
        throw new Error("Không tìm thấy API Key. Hãy cấu hình VITE_GEMINI_API_KEY.");
      }

      // Khởi tạo Gemini AI với thư viện mới nhất
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Bạn là chuyên gia giáo dục số. Hãy phân tích file giáo án môn ${info.subject}, khối ${info.grade} 
                      để tích hợp năng lực số và các công cụ công nghệ thông tin vào bài giảng.`;

      // Thực hiện tạo nội dung
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log("Kết quả từ Gemini:", text);
      alert("Hệ thống đã phân tích và tích hợp năng lực số thành công!");
      
    } catch (error: any) {
      console.error("Lỗi AI:", error);
      alert(`Có lỗi xảy ra: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-[#f8fbff]">
      <Header />
      
      {/* BANNER THU GỌN - TIÊU ĐỀ VÀNG CAM - THCS BÌNH HÒA */}
      <div className="w-full bg-[#0047ab] py-3 px-10 shadow-lg relative border-b-2 border-yellow-400">
        <div className="max-w-[98%] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div 
              onClick={handleLogoClick}
              className="w-20 h-20 bg-white rounded-full shadow-xl border-2 border-white flex-shrink-0 cursor-pointer overflow-hidden group relative transition-transform hover:scale-105"
            >
              <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
              {schoolLogo ? (
                <img src={schoolLogo} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-[#0047ab]">
                  <span className="text-[10px] font-black uppercase opacity-20 text-center">Tải Logo</span>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-3xl font-black tracking-tighter leading-tight drop-shadow-sm">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500">
                  Chào mừng quý thầy cô!
                </span>
              </h2>
              <p className="text-white font-black text-[10px] uppercase tracking-[0.3em] opacity-80 mt-0.5">
                THCS BÌNH HÒA - VỮNG BƯỚC TƯƠNG LAI
              </p>
            </div>
          </div>
          
          <div className="hidden md:block bg-white/10 px-5 py-2 rounded-xl border border-white/20 backdrop-blur-sm">
             <span className="text-white text-[11px] font-black tracking-[0.2em] uppercase">Năm học 2025 - 2026</span>
          </div>
        </div>
      </div>
      
      <main className="max-w-[98%] mx-auto px-8 mt-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <InfoSection 
            subject={info.subject} 
            grade={info.grade} 
            onUpdate={(field, val) => setInfo(prev => ({ ...prev, [field as keyof LessonPlanInfo]: val }))}
          />
          <UploadSection 
            planFile={info.planFile}
            curriculumFile={info.curriculumFile}
            onUpdate={(field, file) => setInfo(prev => ({ ...prev, [field as keyof LessonPlanInfo]: file }))}
          />
          <AdvancedOptions 
            analyzeOnly={info.analyzeOnly}
            includeReport={info.includeReport}
            onUpdate={(field, val) => setInfo(prev => ({ ...prev, [field as keyof LessonPlanInfo]: val }))}
          />

          <div className="flex flex-col items-end space-y-3 pt-2">
            <button 
              onClick={handleOpenApiKey}
              className="text-blue-700 hover:text-blue-900 text-[10px] font-black uppercase tracking-[0.2em] bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 shadow-sm flex items-center transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
              Thiết lập hệ thống Gemini AI
            </button>

            <button 
              onClick={handleProcess}
              disabled={isProcessing}
              className={`w-full bg-[#0047ab] hover:bg-blue-800 text-white font-black py-4 px-10 rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-4 ${isProcessing ? 'opacity-70' : 'hover:scale-[1.002] active:scale-[0.998]'}`}
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/20 border-t-white"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
                  <span className="text-lg tracking-[0.3em] uppercase font-black">Bắt đầu soạn giáo án</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Sidebar />
        </div>
      </main>

      <ChatBox />
    </div>
  );
};

export default App;