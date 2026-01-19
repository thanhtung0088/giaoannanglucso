import React, { useState, useRef } from 'react';
import Header from './components/Header';
import InfoSection from './components/InfoSection';
import UploadSection from './components/UploadSection';
import Sidebar from './components/Sidebar';
import AdvancedOptions from './components/AdvancedOptions';
import ChatBox from './components/ChatBox';
import { Subject, Grade, LessonPlanInfo } from './types/types';
import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth"; // Thư viện đọc file Word

const App: React.FC = () => {
  const [info, setInfo] = useState<LessonPlanInfo>({
    subject: Subject.TOAN,
    grade: Grade.LOP_10,
    planFile: null,
    curriculumFile: null,
    analyzeOnly: false,
    includeReport: false,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string>("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Hàm trích xuất văn bản từ file .docx
  const extractTextFromFile = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value; // Trả về nội dung chữ trong file
  };

  const handleProcess = async () => {
    if (!info.planFile) {
      alert("Vui lòng tải lên File Giáo án!");
      return;
    }

    setIsProcessing(true);
    setResultText("");
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
      if (!apiKey) throw new Error("Chưa cấu hình API Key trên Vercel!");

      // 1. Đọc nội dung từ file giáo án thầy cô tải lên
      const fileContent = await extractTextFromFile(info.planFile);

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // 2. Tạo câu lệnh (Prompt) chi tiết gửi kèm nội dung file
      const prompt = `
        Bạn là chuyên gia giáo dục số hàng đầu. Dưới đây là nội dung giáo án cũ của giáo viên:
        ---
        Môn: ${info.subject} - Khối: ${info.grade}
        Nội dung gốc: ${fileContent}
        ---
        Nhiệm vụ:
        1. Giữ nguyên cấu trúc giáo án nhưng hãy tích hợp thêm các hoạt động phát triển năng lực số.
        2. Đề xuất ít nhất 2 công cụ AI hoặc phần mềm (như Canva, Padlet, Quizizz, ChatGPT...) vào các bước giảng dạy.
        3. Viết kết quả dưới dạng Markdown đẹp mắt, có tiêu đề rõ ràng.
      `;

      const result = await model.generateContent(prompt);
      setResultText(result.response.text());
      
    } catch (error: any) {
      console.error(error);
      alert(`Lỗi xử lý: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-[#f8fbff]">
      <Header />
      
      {/* BANNER THCS BÌNH HÒA */}
      <div className="w-full bg-[#0047ab] py-4 px-10 shadow-lg border-b-2 border-yellow-400">
        <div className="max-w-[98%] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div onClick={() => logoInputRef.current?.click()} className="w-20 h-20 bg-white rounded-full shadow-xl cursor-pointer overflow-hidden border-2 border-white flex items-center justify-center">
              <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setSchoolLogo(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }} />
              {schoolLogo ? <img src={schoolLogo} className="w-full h-full object-contain p-1" /> : <span className="text-[10px] font-black text-blue-900">LOGO</span>}
            </div>
            <div>
              <h2 className="text-3xl font-black text-yellow-400">Chào mừng quý thầy cô!</h2>
              <p className="text-white text-[10px] font-bold tracking-[0.3em]">THCS BÌNH HÒA - CÔNG CỤ SOẠN GIÁO ÁN AI</p>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-[98%] mx-auto px-8 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <InfoSection subject={info.subject} grade={info.grade} onUpdate={(f, v) => setInfo(p => ({ ...p, [f]: v }))} />
          <UploadSection planFile={info.planFile} curriculumFile={info.curriculumFile} onUpdate={(f, v) => setInfo(p => ({ ...p, [f]: v }))} />
          <AdvancedOptions analyzeOnly={info.analyzeOnly} includeReport={info.includeReport} onUpdate={(f, v) => setInfo(p => ({ ...p, [f]: v }))} />

          <button 
            onClick={handleProcess}
            disabled={isProcessing}
            className={`w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center space-x-4 transition-all ${isProcessing ? 'opacity-70' : ''}`}
          >
            {isProcessing ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Hệ thống đang đọc file và soạn thảo...</span>
              </div>
            ) : (
              <span className="text-xl uppercase tracking-widest">Bắt đầu soạn giáo án</span>
            )}
          </button>

          {/* HIỂN THỊ KẾT QUẢ */}
          {resultText && (
            <div className="mt-10 bg-white p-10 rounded-3xl shadow-2xl border border-blue-100 animate-fadeIn">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-xl font-black text-blue-900 uppercase">Giáo án đã tích hợp năng lực số</h3>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(resultText);
                    alert("Đã sao chép vào bộ nhớ tạm!");
                  }}
                  className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-xs font-black hover:bg-blue-100 transition-colors"
                >
                  SAO CHÉP NỘI DUNG
                </button>
              </div>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap font-medium">
                {resultText}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1"><Sidebar /></div>
      </main>

      <ChatBox />
    </div>
  );
};

export default App;