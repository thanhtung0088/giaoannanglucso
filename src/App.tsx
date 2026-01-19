import React, { useState, useRef } from 'react';
import Header from './components/Header';
import InfoSection from './components/InfoSection';
import UploadSection from './components/UploadSection';
import Sidebar from './components/Sidebar';
import AdvancedOptions from './components/AdvancedOptions';
import ChatBox from './components/ChatBox';
import { Subject, Grade, LessonPlanInfo } from './types/types';
import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

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

  const extractTextFromFile = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  // HÀM XUẤT FILE WORD (.DOCX)
  const exportToWord = async () => {
    if (!resultText) return;

    // Tách nội dung thành các đoạn văn bản dựa trên dòng mới
    const lines = resultText.split('\n');
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: `GIÁO ÁN TÍCH HỢP NĂNG LỰC SỐ - MÔN ${info.subject.toUpperCase()}`,
            heading: HeadingLevel.HEADING_1,
            alignment: "center",
          }),
          ...lines.map(line => new Paragraph({
            children: [new TextRun({ text: line, size: 26 })],
            spacing: { before: 200 },
          })),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `GiaoAn_NangLucSo_${info.subject}_Lop${info.grade}.docx`);
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
      if (!apiKey) throw new Error("Chưa cấu hình API Key!");

      const fileContent = await extractTextFromFile(info.planFile);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Bạn là chuyên gia giáo dục số. Nội dung giáo án: ${fileContent}. 
                      Hãy soạn lại giáo án môn ${info.subject} khối ${info.grade} tích hợp năng lực số. 
                      Yêu cầu trả về nội dung chi tiết, rõ ràng.`;

      const result = await model.generateContent(prompt);
      setResultText(result.response.text());
    } catch (error: any) {
      alert(`Lỗi: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-[#f8fbff]">
      <Header />
      
      {/* BANNER */}
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
              <h2 className="text-3xl font-black text-yellow-400 uppercase tracking-tighter">THCS BÌNH HÒA</h2>
              <p className="text-white text-[10px] font-bold tracking-[0.3em]">CÔNG CỤ SOẠN GIÁO ÁN AI 2026</p>
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-[98%] mx-auto px-8 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <InfoSection subject={info.subject} grade={info.grade} onUpdate={(f, v) => setInfo(p => ({ ...p, [f]: v }))} />
          <UploadSection planFile={info.planFile} curriculumFile={info.curriculumFile} onUpdate={(f, v) => setInfo(p => ({ ...p, [f]: v }))} />
          
          <button 
            onClick={handleProcess}
            disabled={isProcessing}
            className={`w-full bg-blue-700 hover:bg-blue-800 text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center transition-all ${isProcessing ? 'opacity-70' : ''}`}
          >
            {isProcessing ? <span>Đang xử lý dữ liệu...</span> : <span className="text-xl uppercase tracking-widest">Bắt đầu soạn giáo án</span>}
          </button>

          {/* HIỂN THỊ KẾT QUẢ VÀ NÚT XUẤT WORD */}
          {resultText && (
            <div className="mt-10 bg-white p-10 rounded-3xl shadow-2xl border border-blue-100">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-xl font-black text-blue-900 uppercase">Kết quả giáo án</h3>
                <div className="flex gap-3">
                  <button 
                    onClick={() => { navigator.clipboard.writeText(resultText); alert("Đã copy!"); }}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-xs font-black hover:bg-gray-200"
                  >
                    SAO CHÉP
                  </button>
                  <button 
                    onClick={exportToWord}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-green-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    TẢI FILE WORD (.DOCX)
                  </button>
                </div>
              </div>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap font-medium leading-relaxed">
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